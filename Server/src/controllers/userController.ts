import {User} from '../models/User';
import { Request, Response } from 'express';


const userInfo = async (req: Request, res: Response) => {

   try {

      // console.log(res.locals)
      const user = res.locals.user;
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);   
   } catch (error: unknown) {
      return res.status(500).json({ 
         message: error instanceof Error ?  error.message : "Internal server error" 
      });
   }
};


export { userInfo };