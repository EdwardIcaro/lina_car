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
                amount: parseFloat(amount),
                reason: 'Abertura de caixa'
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
    const { amount, reason, type, employeeId } = req.body;
    
    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valor inválido para saída.' });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: 'Motivo da saída é obrigatório.' });
        }

        if (type === 'vale' && !employeeId) {
            return res.status(400).json({ message: 'Funcionário é obrigatório para vale.' });
        }

        let employee = null;
        if (employeeId) {
            employee = await prisma.employee.findUnique({
                where: { id: employeeId }
            });
            if (!employee) {
                return res.status(404).json({ message: 'Funcionário não encontrado.' });
            }
        }

        const cashMovement = await prisma.cashMovement.create({
            data: {
                type: 'saida',
                amount: parseFloat(amount),
                reason: reason.trim(),
                withdrawType: type || 'outro',
                employeeId: employeeId || null,
                employeeName: employee?.name || null
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
        const movements = await prisma.cashMovement.findMany();
        
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

// Resumo do caixa do dia: fundo de caixa, saídas e saldo atual
export const getCashSummary = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        const movements = await prisma.cashMovement.findMany({
            where: {
                createdAt: { gte: start, lte: end }
            }
        });
        const entradas = movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.amount, 0);
        const saidas = movements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.amount, 0);
        const saldo = entradas - saidas;
        res.status(200).json({ fundoDeCaixa: entradas, saidas, saldoAtual: saldo });
    } catch (error) {
        console.error('Erro ao calcular resumo do caixa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};