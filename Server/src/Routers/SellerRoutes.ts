import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { sellerRegister, removeSeller } from "../controllers/SellerController";
import authenticateSeller from "../middleware/authenticateSeller";
import { getSellerProduct } from "../controllers/ProductController";

const sellerRouter: Router = Router();


sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateUser, removeSeller);
sellerRouter.get('/products', authenticateSeller, getSellerProduct);



export default sellerRouter