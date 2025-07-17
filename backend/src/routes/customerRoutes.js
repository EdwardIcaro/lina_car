import express from 'express';
import { searchCustomers, getCustomerVehicles } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', searchCustomers);
router.get('/:id/vehicles', getCustomerVehicles);

export default router; 