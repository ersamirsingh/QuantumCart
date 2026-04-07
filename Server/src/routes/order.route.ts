import { Router } from 'express';
import authenticateUser from '../middleware/user.middleware';
import {
  cancelOrder,
  confirmOrder,
  makeOrder,
} from '../controllers/order.controller';
import authenticateSeller from '../middleware/seller.middleware';
import { shipOrder } from '../controllers/ship.controller';

const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.patch('/cancel/:orderId', authenticateUser, cancelOrder);
orderRouter.post('/confirm/:orderId', authenticateSeller, confirmOrder);
orderRouter.post('/ship', authenticateSeller, shipOrder);

export default orderRouter;
