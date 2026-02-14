import { Request, Response } from "express"
import {Seller} from '../models/Seller'
import { User, UserRole } from "../models/User";



const sellerRegister = async (req: Request, res: Response) => {

   try {
      
      const {storeName, storeDescription} = req.body || {};
      if(!storeName || !storeDescription){
         return res.status(400).json({message: "Missing required fields"});
      }

      const user = await User.findById(res.locals.user._id);
      if(!user)
         return res.status(404).json({message: "User not found"});
      
      const existingSeller = await Seller.findOne({userId: res.locals.user._id})
      if(existingSeller)
         return res.status(400).json({message: "Seller already exists"});

      const seller = await Seller.create({storeName, storeDescription, userId: res.locals.user._id});

      user.role = UserRole.SELLER;
      await user.save();
      res.status(200).json(seller);

   } catch (error) {
      res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error"
      })
   }
}



const removeSeller = async(req: Request, res: Response) =>{

   try {
      
      const seller = await Seller.findOneAndDelete({userId:res.locals.user._id});
      if(!seller){
         return res.status(404).json({message: "Seller not found"});
      }

      const user = await User.findById(res.locals.user._id);
      if(!user)
         return res.status(404).json({message: "User not found"});

      user.role = UserRole.CUSTOMER;
      await user.save();

      res.status(200).json({message: "Seller deleted successfully"});   
   } catch (error) {
      res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error"
      })
   }
}


export {sellerRegister, removeSeller}
