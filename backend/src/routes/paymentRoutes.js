import express from 'express';
import { getAllPayments, getPaymentStats } from '../controllers/paymentController.js';

const router = express.Router();

// Buscar todos os pagamentos
router.get('/', getAllPayments);

// Buscar estatísticas
router.get('/stats', getPaymentStats);

export default router; 