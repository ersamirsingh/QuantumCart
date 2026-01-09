import express from 'express'
import { Router } from 'express';
import { Register, Login, Logout} from '../controllers/AuthController';
import authenticateUser from '../middleware/authenticateUser';
import { deleteUser } from "../controllers/AuthController";



const authRouter: Router = express.Router();

authRouter.post('/register', Register)
authRouter.post('/login', Login)
authRouter.get('/logout', authenticateUser, Logout)
authRouter.delete('/delete', authenticateUser, deleteUser)



export default authRouter
