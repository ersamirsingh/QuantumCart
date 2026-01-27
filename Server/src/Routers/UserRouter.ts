import { Router } from "express";
import authenticateUser from "../middleware/authenticateUser";
import { userInfo, updateUserInfo } from "../controllers/UserController";



const userRouter: Router = Router();


userRouter.get('/info', authenticateUser, userInfo)
userRouter.patch('/update', authenticateUser, updateUserInfo)


export default userRouter