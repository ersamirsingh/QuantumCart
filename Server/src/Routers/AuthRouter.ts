import express from 'express'
import { Router } from 'express';
import { Register } from '../controllers/AuthController';


const authRouter: Router = express.Router();

authRouter.post('/register', Register)



export default authRouter
