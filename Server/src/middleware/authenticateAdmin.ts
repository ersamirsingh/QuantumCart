import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/Redis";
import jwt, { JwtPayload }  from 'jsonwebtoken';
import {User} from '../models/User';
import { IPayload } from "./authenticateUser";
import { UserRole } from "../models/User";



const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
   

   try {
      
      const Token = req.cookies.Token || req.headers.authorization?.split(" ")[1];
      if(!Token){
         return res.status(401).json({message: "Unauthorized"});
      }

      const isBlocked = await redisClient.exists(`Token:${Token}`);
      if(isBlocked){
         return res.status(401).json({message: "Unauthorized"});
      }

      const payload = jwt.verify(Token, process.env.JWT_SECRET as string) as IPayload;
      if(typeof payload !== "object" || !payload){
         return res.status(401).json({message: "Unauthorized"});
      }

      const user = await User.findById(payload.id);
      if(!user){
         return res.status(401).json({message: "Unauthorized"});
      }  

      if(user.role !== UserRole.ADMIN)
         return res.status(401).json({message: "Unauthorized access"});

      res.locals.user = user;
      next();

   } catch (error) {
      
   }
}


export default authenticateAdmin