import { Router } from 'express';
import authenticateUser from '../middleware/user.middleware';
import { sellerRegister, removeSeller } from '../controllers/seller.controller';
import authenticateSeller from '../middleware/seller.middleware';
import {
  addProduct,
  getProductById,
  getSellerProduct,
  removeProduct,
  updateProduct,
} from '../controllers/product.controller';
import { getSellerOrders } from '../controllers/order.controller';

const sellerRouter: Router = Router();

sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateUser, removeSeller);
sellerRouter.post('/product/add', authenticateSeller, addProduct);
sellerRouter.get('/products', authenticateSeller, getSellerProduct);
sellerRouter.get('/product/:productId', authenticateSeller, getProductById);
sellerRouter.delete('/product/:productId', authenticateSeller, removeProduct);
sellerRouter.patch('/product/:productId', authenticateSeller, updateProduct);
sellerRouter.get('/orders', authenticateSeller, getSellerOrders);

export default sellerRouter;
