import express from 'express';
import { openCash, withdrawCash, getCashHistory, getCashBalance, getCashSummary, closeCash } from '../controllers/cashController.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Abrir caixa
router.post('/open', openCash);

// Registrar saída
router.post('/withdraw', withdrawCash);

// Buscar histórico
router.get('/history', getCashHistory);

// Calcular saldo atual
router.get('/balance', getCashBalance);

// Resumo do caixa do dia
router.get('/summary', getCashSummary);

// Fechar caixa
router.post('/close', closeCash);

router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.cashMovement.findMany({
      where: { closedAt: { not: null } },
      orderBy: { closedAt: 'desc' }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar relatórios de caixa.' });
  }
});

export default router; 