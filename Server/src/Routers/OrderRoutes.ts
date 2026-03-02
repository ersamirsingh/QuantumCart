import { Router } from 'express';
import authenticateUser from '../Middleware/authenticateUser';
import {
  cancelOrder,
  confirmOrder,
  makeOrder,
} from '../Controllers/OrderController';
import authenticateSeller from '../Middleware/authenticateSeller';
import { shipOrder } from '../Controllers/ShipController';

const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.patch('/cancel/:orderId', authenticateUser, cancelOrder);
orderRouter.post('/confirm', authenticateSeller, confirmOrder);
orderRouter.post('/ship', authenticateSeller, shipOrder);

export default orderRouter;
