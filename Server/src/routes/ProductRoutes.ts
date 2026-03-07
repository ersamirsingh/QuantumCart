import { Router } from 'express';
import {
  getProductById,
  getAllProducts,
} from '../controllers/ProductController';
import authenticateUser from '../middleware/authenticateUser';

const productRouter: Router = Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:productId', authenticateUser, getProductById);

export default productRouter;
