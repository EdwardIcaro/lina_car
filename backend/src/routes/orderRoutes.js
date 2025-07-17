import express from 'express';
import { createOrder, getDashboardOrders, updateOrderStatus, getVehicleByPlate, listOrders, deleteOrder, getAllOrders } from '../controllers/orderController.js';
import { getLocalizaConfig, updateLocalizaConfig, getLocalizaServices, createLocalizaService, updateLocalizaService, deleteLocalizaService } from '../controllers/localizaController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/dashboard', getDashboardOrders);
router.get('/all', getAllOrders);
router.get('/vehicles/:plate', getVehicleByPlate);
router.patch('/:id/status', updateOrderStatus); // Usamos PATCH para atualizações parciais
router.delete('/:id', deleteOrder);
router.get('/', listOrders);

// Rotas da Localiza
router.get('/localiza/config', getLocalizaConfig);
router.put('/localiza/config', updateLocalizaConfig);
router.get('/localiza/services', getLocalizaServices);
router.post('/localiza/services', createLocalizaService);
router.put('/localiza/services/:id', updateLocalizaService);
router.delete('/localiza/services/:id', deleteLocalizaService);

export default router; 