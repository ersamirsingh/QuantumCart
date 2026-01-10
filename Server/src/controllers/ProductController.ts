import { Request, Response } from "express"
import { Product } from "../models/Product";
import { Seller } from "../models/Seller";


const addProduct = async (req: Request, res: Response): Promise<Response | void> => {
   try {
      
      let { name, description, price, discount, stock } = req.body || {};

      if (!name || !description || price == null || stock == null ) {
         return res.status(400).json({ message: "Missing required fields" });
      }

      const seller = await Seller.findOne({ userId: res.locals.user._id });
      if (!seller) {
         return res.status(404).json({ message: "Seller not found" });
      }
      
      let finalPrice: number;
      if (discount != null) {
         finalPrice = price - price * (discount / 100);
      } else {
         finalPrice = price;
      }

      const product = await Product.create({
         name,
         description,
         price,
         discount,
         finalPrice,
         stock,
         sellerId: seller._id
      });

      seller.products.push(product._id);
      await seller.save();

      return res.status(201).json(product);

   } catch (error) {
      return res.status(500).json({
         message:
            error instanceof Error ? error.message : "Internal server error"
      });
   }
};




const removeProduct = async (req: Request, res: Response) => {

   try {

   } catch (error) {

   }
}




const updateProduct = async (req: Request, res: Response) => {

}


export { addProduct, removeProduct, updateProduct }