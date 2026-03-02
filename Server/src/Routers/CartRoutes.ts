import { Router } from 'express';
import {
  getCart,
  addToCart,
  clearCart,
  removeFromCart,
  removeItemCompletely,
} from '../Controllers/CartController';
import authenticateUser from '../Middleware/authenticateUser';
const cartRouter = Router();

cartRouter.get('/', authenticateUser, getCart);
cartRouter.post('/add', authenticateUser, addToCart);
cartRouter.delete('/clear', authenticateUser, clearCart);
cartRouter.delete('/remove/:productId', authenticateUser, removeFromCart);
cartRouter.delete('/delete/:productId', authenticateUser, removeItemCompletely);

export default cartRouter;
