import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar todos os produtos
export const listProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos.' });
    }
};

// Criar novo produto
export const createProduct = async (req, res) => {
    const { name, category, unit, minStock, notes, stock } = req.body;
    try {
        const product = await prisma.product.create({
            data: { name, category, unit, minStock: parseFloat(minStock), notes, stock: parseFloat(stock) }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar produto.' });
    }
};

// Atualizar produto
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category, unit, minStock, notes, stock } = req.body;
    try {
        const product = await prisma.product.update({
            where: { id },
            data: { name, category, unit, minStock: parseFloat(minStock), notes, stock: parseFloat(stock) }
        });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
};

// Deletar produto
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar produto.' });
    }
};

// Registrar movimentação (entrada ou saída)
export const registerMovement = async (req, res) => {
    const { productId, type, amount, reason } = req.body;
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
        const newStock = type === 'entrada' ? product.stock + parseFloat(amount) : product.stock - parseFloat(amount);
        if (newStock < 0) return res.status(400).json({ message: 'Estoque insuficiente.' });
        const movement = await prisma.productMovement.create({
            data: { productId, type, amount: parseFloat(amount), reason }
        });
        await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
        res.status(201).json(movement);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar movimentação.' });
    }
};

// Listar histórico de movimentações de um produto
export const getProductHistory = async (req, res) => {
    const { productId } = req.params;
    try {
        const movements = await prisma.productMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar histórico.' });
    }
}; 