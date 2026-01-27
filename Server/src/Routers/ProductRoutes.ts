import { Router } from "express";
import { addProduct, removeProduct, updateProduct } from "../controllers/ProductController";
import authenticateSeller from "../middleware/authenticateSeller";


const productRouter: Router = Router();


productRouter.post('/add', authenticateSeller, addProduct)
productRouter.delete('/remove/:productId', authenticateSeller, removeProduct)
productRouter.patch('/update/:productId', authenticateSeller, updateProduct);


export default productRouter