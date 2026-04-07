import { Router } from 'express';
import {
  getProductById,
  getAllProducts,
} from '../controllers/product.controller';
import authenticateUser from '../middleware/user.middleware';

const productRouter: Router = Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:productId', authenticateUser, getProductById);

export default productRouter;
