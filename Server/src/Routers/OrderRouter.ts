import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { makeOrder } from "../controllers/OrderController";


const orderRouter: Router = Router();

orderRouter.post('/create', authenticateUser, makeOrder);


export default orderRouter