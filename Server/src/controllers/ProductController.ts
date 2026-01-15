import { Request, Response } from "express"
import { Product } from "../models/Product";
import { Seller } from "../models/Seller";


const addProduct = async (req: Request, res: Response): Promise<Response | void> => {
   try {
      
      let { name, description, price, discount, stock, images } = req.body || {};

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

      let photos: string[] = [];
      if(images != null || images.length > 0 || images != undefined){
         images.forEach((image: string) => {
            photos.push(image);
         })
      }

      const product = await Product.create({
         name,
         description,
         price,
         discount,
         finalPrice,
         stock,
         images:photos,
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

      const productId = req.params.productId;
      if(!productId)
         return res.status(400).json({message: "Missing required fields"});

      const product = await Product.findByIdAndDelete(productId);
      if(!product)
         return res.status(404).json({message: "Product not found"});

      return res.status(200).json({message: "Product deleted successfully"});

   } catch (error) {

      return res.status(500).json({
         message:
            error instanceof Error ? error.message : "Internal server error"
      });

   }
}




const updateProduct = async (req: Request, res: Response) => {

   try {
            
      const {productId} = req.params;
      if(!productId)
         return res.status(400).json({message: "Missing required fields"});

      const product = await Product.findById(productId);
      if(!product)
         return res.status(404).json({message: "Product not found"});

      const {
         name,
         description,
         price,
         discount,
         stock,
         images,
      } = req.body || {};

      if (name) product.name = name;
      if (description) product.description = description;
      if (price != null) product.price = price;
      if (discount != null) product.discount = discount;
      if (stock != null) product.stock = stock;
      if (images) product.images.push(...images);

      if (price != null || discount != null) {
         const currentPrice = price ?? product.price;
         const currentDiscount = discount ?? product.discount ?? 0;

         product.finalPrice =
         currentPrice - currentPrice * (currentDiscount / 100);
      }

      await product.save();

      return res.status(200).json(product);

   } catch (error) {
      return res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error"
      });
   }
}


export { addProduct, removeProduct, updateProduct }