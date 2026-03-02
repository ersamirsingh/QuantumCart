import { Router } from 'express';
import authenticateUser from '../Middleware/AuthenticateUser';
import {
  cancelOrder,
  confirmOrder,
  makeOrder,
} from '../Controllers/OrderController';
import authenticateSeller from '../Middleware/AuthenticateSeller';
import { shipOrder } from '../Controllers/ShipController';

const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.patch('/cancel/:orderId', authenticateUser, cancelOrder);
orderRouter.post('/confirm', authenticateSeller, confirmOrder);
orderRouter.post('/ship', authenticateSeller, shipOrder);

export default orderRouter;
