import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Abrir caixa
export const openCash = async (req, res) => {
    const { amount } = req.body;
    
    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valor inválido para abertura do caixa.' });
        }

        const cashMovement = await prisma.cashMovement.create({
            data: {
                type: 'entrada',
                amount: parseFloat(amount)
            }
        });

        res.status(201).json(cashMovement);
    } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Registrar saída
export const withdrawCash = async (req, res) => {
    const { amount, employeeId } = req.body;
    
    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valor inválido para saída.' });
        }

        const cashMovement = await prisma.cashMovement.create({
            data: {
                type: 'saida',
                amount: parseFloat(amount),
                employeeId: employeeId || null
            }
        });

        res.status(201).json(cashMovement);
    } catch (error) {
        console.error('Erro ao registrar saída:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Buscar histórico de movimentações
export const getCashHistory = async (req, res) => {
    try {
        const movements = await prisma.cashMovement.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(movements);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Calcular saldo atual
export const getCashBalance = async (req, res) => {
    try {
        // Buscar a última abertura de caixa SEM closedAt (caixa aberto)
        const lastOpen = await prisma.cashMovement.findFirst({
            where: { type: 'entrada', closedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        if (!lastOpen) {
            // Caixa fechado, saldo é zero
            return res.status(200).json({ balance: 0 });
        }
        // Buscar todas as movimentações a partir da abertura
        const movements = await prisma.cashMovement.findMany({
            where: {
                createdAt: { gte: lastOpen.createdAt }
            },
            orderBy: { createdAt: 'asc' }
        });
        const balance = movements.reduce((total, movement) => {
            if (movement.type === 'entrada') {
                return total + movement.amount;
            } else {
                return total - movement.amount;
            }
        }, 0);
        res.status(200).json({ balance });
    } catch (error) {
        console.error('Erro ao calcular saldo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}; 

// Resumo do caixa do dia: fundo de caixa, entradas, saídas e saldo atual
export const getCashSummary = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        const movements = await prisma.cashMovement.findMany({
            where: {
                createdAt: { gte: start, lte: end }
            },
            orderBy: { createdAt: 'asc' }
        });
        // Fundo de caixa: apenas a primeira entrada do dia
        const abertura = movements.find(m => m.type === 'entrada');
        const fundoDeCaixa = abertura ? abertura.amount : 0;
        // Outras entradas do dia (exceto abertura)
        const outrasEntradas = movements.filter(m => m.type === 'entrada' && m.id !== (abertura && abertura.id)).reduce((sum, m) => sum + m.amount, 0);
        // Saídas do dia
        const saidas = movements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.amount, 0);
        // Saldo do dia: fundo de caixa + outras entradas - saídas
        const saldo = fundoDeCaixa + outrasEntradas - saidas;
        res.status(200).json({ fundoDeCaixa, outrasEntradas, saidas, saldoAtual: saldo });
    } catch (error) {
        console.error('Erro ao calcular resumo do caixa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Fechar caixa do dia
export const closeCash = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        // Busca a abertura do dia
        const abertura = await prisma.cashMovement.findFirst({
            where: {
                createdAt: { gte: start, lte: end },
                type: 'entrada',
                closedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!abertura) {
            return res.status(400).json({ message: 'Nenhuma abertura de caixa encontrada para hoje.' });
        }
        // Marca a abertura como fechada e salva observação
        await prisma.cashMovement.update({
            where: { id: abertura.id },
            data: { closedAt: new Date(), observation: req.body.observation || null }
        });
        // Removido: saída automática para zerar fundo de caixa
        res.status(200).json({ message: 'Caixa fechado com sucesso.' });
    } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};