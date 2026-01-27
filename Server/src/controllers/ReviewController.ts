import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Review } from "../models/Review";



export const reviewProduct = async (req: Request, res: Response) => {


   try {
      const {productId} = req.params;
      if(!productId)
         return res.status(400).json({message: "Missing required fields"});

      const product = await Product.findById(productId);
      if(!product)
         return res.status(404).json({message: "Product not found"});

      const {rating, comment} = req.body || {};
      if(!rating)
         return res.status(400).json({message: "Missing required fields"});
      const review = await Review.create({productId, userId: res.locals.user._id, rating, comment});
      return res.status(200).json(review);

   } catch (error) {
      res.status(500).json({message: "Internal server error"})
   }
}



export const updateReview = async(req: Request, res: Response): Promise<Response | void> => {
   
   try {
      
      const {productId} = req.params;
      if(!productId)
         return res.status(400).json({message: "Missing required fields"});

      const product = await Product.findById(productId);
      if(!product)
         return res.status(404).json({message: "Product not found"});

      const {rating, comment} = req.body || {};
      if(!rating)
         return res.status(400).json({message: "Missing required fields"});
      const review = await Review.findOneAndUpdate({productId, userId: res.locals.user._id}, {rating, comment}, {new: true});
      return res.status(200).json(review);

   } catch (error) {
      return res.status(500).json({message: "Internal server error"});
   }
}