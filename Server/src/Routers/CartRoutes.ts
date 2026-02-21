import { Router } from "express";
import { getCart, addToCart, clearCart, removeFromCart } from "../controllers/CartController";
import authenticateUser from "../middleware/authenticateUser";
const cartRouter = Router();


cartRouter.get("/", authenticateUser, getCart);
cartRouter.post("/add", authenticateUser, addToCart);
cartRouter.delete("/", authenticateUser, clearCart);
cartRouter.delete("/remove/:productId", authenticateUser, removeFromCart);


export default cartRouter;