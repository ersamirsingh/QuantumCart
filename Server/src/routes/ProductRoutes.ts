import { Router } from 'express';
import {
  getSellerProduct,
  getProductById,
  getAllProducts,
} from '../controllers/ProductController';
import authenticateUser from '../middleware/authenticateUser';

const productRouter: Router = Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:productId', authenticateUser, getProductById);

export default productRouter;
