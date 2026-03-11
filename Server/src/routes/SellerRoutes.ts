import { Router } from 'express';
import authenticateUser from '../middleware/authenticateUser';
import { sellerRegister, removeSeller } from '../controllers/SellerController';
import authenticateSeller from '../middleware/authenticateSeller';
import {
  addProduct,
  getProductById,
  getSellerProduct,
  removeProduct,
  updateProduct,
} from '../controllers/ProductController';
import { getSellerOrders } from '../controllers/OrderController';


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
