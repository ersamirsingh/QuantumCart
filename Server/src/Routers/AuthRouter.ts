import express from 'express'
import { Router } from 'express';
import { Register, Login, Logout} from '../controllers/AuthController';
import authenticateUser from '../middleware/authenticateUser';

const authRouter: Router = express.Router();

authRouter.post('/register', Register)
authRouter.post('/login', Login)
authRouter.get('/logout', authenticateUser, Logout)



export default authRouter
