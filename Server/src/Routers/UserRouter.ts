import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { userInfo } from "../controllers/userController";



const userRouter: Router = Router();


userRouter.get('/info', authenticateUser, userInfo)


export default userRouter