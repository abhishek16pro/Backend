import { PlaceOrder, CheckOrderStatus, CancleOrder, ModifyOrder } from '../controllers/Icici_order.js';
import express from 'express';

const router = express.Router();

router.post('/placeOrder', PlaceOrder);
router.post('/cancleOrder', CancleOrder);
router.post('/modifyOrder', ModifyOrder);
router.post('/orderStatus', CheckOrderStatus);

export default router;