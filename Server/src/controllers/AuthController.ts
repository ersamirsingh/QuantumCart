import { Request, Response } from "express";
import User from "../models/User";
import ValidateInfo from "../Utils/ValidateInfo";
import bcrypt from 'bcrypt'



const Register = async (req: Request, res: Response) => {  


   try {
      
      const {firstName, email, password} = req.body
      if(!firstName || !email || !password) {
         return res.status(400).json({
            message: 'Email and password are required'
         })
      }

      const {message, isValid} = ValidateInfo(req.body)
      if(!isValid) {
         return res.status(400).json({
            message
         })
      }

      const existedUser = await User.findOne({email})
      if(existedUser) {
         return res.status(400).json({
            message: 'User already exists'
         })
      }

      req.body.password = bcrypt.hash(password, 10)

      const user = User.create(req.body)
      // req.user = user

      res.status(201).json({
         message: 'User created successfully'
      })
      
   } catch (error: any) {
      
      return res.status(500).json({message: error.message})
   }
}



const Login = async (req: Request, res: Response) => {
   
   try {
      
   } catch (error: unknown) {
      
   }
}



export {Register, Login}