import { Request, Response } from "express"
import {Seller} from '../models/Seller'


const sellerRegister = async (req: Request, res: Response) => {

   try {
      
      const {storeName, storeDescription} = req.body || {};
      if(!storeName || !storeDescription){
         return res.status(400).json({message: "Missing required fields"});
      }

      const seller = await Seller.create({storeName, storeDescription, userId: res.locals.user._id});
      res.status(200).json(seller);

   } catch (error) {
      res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error"
      })
   }
}



const removeSeller = async(req: Request, res: Response) =>{

   try {
      
      const seller = await Seller.findByIdAndDelete(res.locals.user._id);
      if(!seller){
         return res.status(404).json({message: "Seller not found"});
      }

      res.status(200).json({message: "Seller deleted successfully"});   
   } catch (error) {
      res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error"
      })
   }
}


export {sellerRegister, removeSeller}
