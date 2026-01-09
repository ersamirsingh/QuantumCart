import {User} from '../models/User';
import { Request, Response } from 'express';
import ValidateInfo from '../Utils/ValidateInfo';
import bcrypt from 'bcrypt';



const userInfo = async (req: Request, res: Response) : Promise<Response | void> => {

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



const updateUserInfo = async (req:Request, res: Response) : Promise<Response | void> => {
   
   try {
      const user = res.locals.user;
      // console.log(user)
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const { name, email, password } = req.body;
      if(!name && !email && !password){
         return res.status(400).json({ message: "Missing required fields" });
      }

      if(!ValidateInfo(req.body).isValid){
         return res.status(400).json({ message: `${ValidateInfo(req.body).message}` });
      }

      const hashedPassword:string = await bcrypt.hash(password, 10)
      const updatedUser = await User.findByIdAndUpdate(user._id, { name, email, password: hashedPassword }, { new: true });
      if (!updatedUser) {
         return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(updatedUser);

   }
   catch(err){
      res.status(500).json({
         message: err instanceof Error ? err.message : "Internal server error"
      });
   }
}


// const 

export { userInfo, updateUserInfo };