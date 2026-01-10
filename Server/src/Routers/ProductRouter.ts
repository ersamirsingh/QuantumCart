import { Router } from "express";
import { addProduct } from "../controllers/ProductController";
import authenticateSeller from "../middleware/authenticateSeller";


const productRouter: Router = Router();


productRouter.post('/add', authenticateSeller, addProduct)


export default productRouter