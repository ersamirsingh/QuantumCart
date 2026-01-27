import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { cancelOrder, confirmOrder, makeOrder } from "../controllers/OrderController";
import authenticateSeller from "../middleware/authenticateSeller";
import { shipOrder } from "../controllers/ShipController";


const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);
orderRouter.post('/cancel', authenticateUser, cancelOrder);
orderRouter.post('/confirm', authenticateSeller, confirmOrder);
orderRouter.post('/ship', authenticateSeller, shipOrder)



export default orderRouter