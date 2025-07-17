import express from 'express';
import { openCash, withdrawCash, getCashHistory, getCashBalance, getCashSummary } from '../controllers/cashController.js';

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

export default router; 