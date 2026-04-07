import { Router } from 'express';
import {
  getCart,
  addToCart,
  clearCart,
  removeFromCart,
  removeItemCompletely,
} from '../controllers/cart.controller';
import authenticateUser from '../middleware/user.middleware';
const cartRouter = Router();

cartRouter.get('/', authenticateUser, getCart);
cartRouter.post('/add', authenticateUser, addToCart);
cartRouter.delete('/clear', authenticateUser, clearCart);
cartRouter.patch('/remove/:productId', authenticateUser, removeFromCart);
cartRouter.delete('/delete/:productId', authenticateUser, removeItemCompletely);

export default cartRouter;
