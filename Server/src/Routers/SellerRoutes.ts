import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { sellerRegister, removeSeller } from "../controllers/SellerController";
import authenticateSeller from "../middleware/authenticateSeller";
import authenticateAdmin from "../middleware/authenticateAdmin";

const sellerRouter: Router = Router();


sellerRouter.post('/register', authenticateUser, sellerRegister);
sellerRouter.post('/remove', authenticateUser, removeSeller);


export default sellerRouter