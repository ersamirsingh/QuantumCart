import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { sellerRegister, removeSeller } from "../controllers/SellerController";

const sellerRouter: Router = Router();


sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateUser, removeSeller);


export default sellerRouter