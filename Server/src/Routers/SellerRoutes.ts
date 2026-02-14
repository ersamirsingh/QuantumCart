import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { sellerRegister, removeSeller } from "../controllers/SellerController";
import authenticateSeller from "../middleware/authenticateSeller";

const sellerRouter: Router = Router();


sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateSeller, removeSeller);


export default sellerRouter