import {User} from '../models/User';
import { Request, Response } from 'express';
import ValidateInfo from '../Utils/ValidateInfo';
import bcrypt from 'bcrypt';
import { Seller } from '../models/Seller';


const userInfo = async (req: Request, res: Response) : Promise<Response | void> => {

   try {

      const user = res.locals.user;
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const seller = await Seller.findOne({ userId: user._id }).populate("userId", "name email role");
      if(seller)
         return res.status(200).json(seller);
      
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

      let { name, email } = req.body;

      const updatedUser = await User.findByIdAndUpdate(user._id, { name, email }, { new: true, runValidators: true });
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