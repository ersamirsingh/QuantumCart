import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/Redis";
import jwt  from 'jsonwebtoken';
import { IPayload } from "./authenticateUser";
import { User, UserRole } from "../models/User";



const authenticateSeller = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
   

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
      if(user.role !== UserRole.SELLER)
         return res.status(401).json({message: "Unauthorized"});

      res.locals.user = user;
      next();

   } catch (error) {
      
   }
}


export default authenticateSeller