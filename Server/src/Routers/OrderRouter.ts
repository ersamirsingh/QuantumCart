import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { cancelOrder, confirmOrder, makeOrder } from "../controllers/OrderController";
import authenticateSeller from "../middleware/authenticateSeller";


const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.post('/cancel', authenticateUser, cancelOrder);
orderRouter.post('/confirm', authenticateSeller, confirmOrder);


export default orderRouter