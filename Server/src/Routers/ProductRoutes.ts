import { Router } from 'express';
import {
  getSellerProduct,
  getProductById,
  getAllProducts,
} from '../Controllers/ProductController';
import authenticateUser from '../Middleware/authenticateUser';

const productRouter: Router = Router();

productRouter.get('/', authenticateUser, getAllProducts);
productRouter.get('/:productId', authenticateUser, getProductById);

export default productRouter;
