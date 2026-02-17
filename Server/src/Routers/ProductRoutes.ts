import { Router } from "express";
import { addProduct, removeProduct, updateProduct, getSellerProduct, getProductById } from "../controllers/ProductController";
import authenticateSeller from "../middleware/authenticateSeller";
import authenticateUser from "../middleware/authenticateUser";


const productRouter: Router = Router();


productRouter.post('/add', authenticateSeller, addProduct)
productRouter.get('/all', authenticateSeller, getSellerProduct);
productRouter.get('/:productId', authenticateUser, getProductById)
productRouter.delete('/:productId', authenticateSeller, removeProduct)
productRouter.patch('/:productId', authenticateSeller, updateProduct);


export default productRouter