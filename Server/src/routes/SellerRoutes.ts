import { Router } from 'express';
import authenticateUser from '../middleware/AuthenticateUser';
import { sellerRegister, removeSeller } from '../controllers/SellerController';
import authenticateSeller from '../middleware/AuthenticateSeller';
import {
  addProduct,
  getProductById,
  getSellerProduct,
  removeProduct,
  updateProduct,
} from '../controllers/ProductController';

const sellerRouter: Router = Router();

sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateUser, removeSeller);
sellerRouter.post('/product/add', authenticateSeller, addProduct);
sellerRouter.get('/products', authenticateSeller, getSellerProduct);
sellerRouter.get('/product/:productId', authenticateSeller, getProductById);
sellerRouter.delete('/product/:productId', authenticateSeller, removeProduct);
sellerRouter.patch('/product/:productId', authenticateSeller, updateProduct);

export default sellerRouter;
