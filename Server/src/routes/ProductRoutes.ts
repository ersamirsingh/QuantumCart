import { Router } from 'express';
import {
  getSellerProduct,
  getProductById,
  getAllProducts,
} from '../controllers/ProductController';
import authenticateUser from '../middleware/AuthenticateUser';

const productRouter: Router = Router();

productRouter.get('/', authenticateUser, getAllProducts);
productRouter.get('/:productId', authenticateUser, getProductById);

export default productRouter;
