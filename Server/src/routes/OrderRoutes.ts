import { Router } from 'express';
import authenticateUser from '../middleware/AuthenticateUser';
import {
  cancelOrder,
  confirmOrder,
  makeOrder,
} from '../controllers/OrderController';
import authenticateSeller from '../middleware/AuthenticateSeller';
import { shipOrder } from '../controllers/ShipController';

const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.patch('/cancel/:orderId', authenticateUser, cancelOrder);
orderRouter.post('/confirm', authenticateSeller, confirmOrder);
orderRouter.post('/ship', authenticateSeller, shipOrder);

export default orderRouter;
