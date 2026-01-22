import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { cancelOrder, makeOrder } from "../controllers/OrderController";


const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.post('/cancel', authenticateUser, cancelOrder)


export default orderRouter