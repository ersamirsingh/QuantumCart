import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import authenticateSeller from "../middleware/authenticateSeller";
import { shipOrder, confirmOrder } from "../controllers/ShipController";



const shipRouter: Router = Router();

shipRouter.post('/confirm', authenticateSeller, confirmOrder);
shipRouter.post('/ship', authenticateSeller, shipOrder);


export default shipRouter