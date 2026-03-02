import { Router } from 'express';
import authenticateUser from '../Middleware/AuthenticateUser';
import { sellerRegister, removeSeller } from '../Controllers/SellerController';
import authenticateSeller from '../Middleware/AuthenticateSeller';
import {
  addProduct,
  getProductById,
  getSellerProduct,
  removeProduct,
  updateProduct,
} from '../Controllers/ProductController';

const sellerRouter: Router = Router();

sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateUser, removeSeller);
sellerRouter.post('/product/add', authenticateSeller, addProduct);
sellerRouter.get('/products', authenticateSeller, getSellerProduct);
sellerRouter.get('/product/:productId', authenticateSeller, getProductById);
sellerRouter.delete('/product/:productId', authenticateSeller, removeProduct);
sellerRouter.patch('/product/:productId', authenticateSeller, updateProduct);

export default sellerRouter;
