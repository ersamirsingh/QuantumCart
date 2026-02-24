import { Router } from "express";
import { addProduct, removeProduct, updateProduct, getSellerProduct, getProductById, getAllProducts } from "../controllers/ProductController";
import authenticateSeller from "../middleware/authenticateSeller";
import authenticateUser from "../middleware/authenticateUser";


const productRouter: Router = Router();

productRouter.get('/', authenticateUser, getAllProducts);
productRouter.post('/add', authenticateSeller, addProduct)
productRouter.get('/:productId', authenticateUser, getProductById)
productRouter.delete('/:productId', authenticateSeller, removeProduct)
productRouter.patch('/:productId', authenticateSeller, updateProduct);


export default productRouter