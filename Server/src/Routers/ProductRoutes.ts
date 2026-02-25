import { Router } from "express";
import {getSellerProduct, getProductById } from "../controllers/ProductController";
import authenticateUser from "../middleware/authenticateUser";


const productRouter: Router = Router();


productRouter.get('/', authenticateUser, getSellerProduct);
productRouter.get('/:productId', authenticateUser, getProductById)


export default productRouter