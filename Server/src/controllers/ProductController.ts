import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Seller } from '../Models/Seller';
import { Product } from '../Models/Product';

export const addProduct = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    let { name, description, price, discount, stock, images } = req.body || {};

    if (!name || !description || price == null || stock == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const seller = await Seller.findById(res.locals.user._id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    let finalPrice: number;
    if (discount != null) {
      finalPrice = price - price * (discount / 100);
    } else {
      finalPrice = price;
    }

    let photos: string[] = [];
    if (images != null || images.length > 0 || images != undefined) {
      images.forEach((image: string) => {
        photos.push(image);
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      discount,
      finalPrice,
      stock,
      images: photos,
      sellerId: seller._id,
    });

    seller.products.push(product._id);
    await seller.save();

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const sellerId = res.locals.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Verify product belongs to seller
    const product = await Product.findOne({
      _id: productId,
      sellerId: sellerId,
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found or unauthorized',
      });
    }

    // Delete product
    await Product.deleteOne({ _id: productId });

    // Remove product reference from seller atomically
    await Seller.updateOne(
      { _id: sellerId },
      { $pull: { products: productId } }
    );

    return res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId)
      return res.status(400).json({ message: 'Missing productId' });

    const updateData: any = {};
    const { name, description, price, discount, stock, images } = req.body;

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price != null) updateData.price = price;
    if (discount != null) updateData.discount = discount;
    if (stock != null) updateData.stock = stock;
    if (stock === 0) updateData.status = 'OUT_OF_STOCK';

    if (Array.isArray(images)) {
      updateData.images = images; // replace mode
    }

    // Handle final price calculation
    if (price != null || discount != null) {
      const product =
        await Product.findById(productId).select('price discount');
      if (!product)
        return res.status(404).json({ message: 'Product not found' });

      const currentPrice = price ?? product.price;
      const currentDiscount = discount ?? product.discount ?? 0;

      updateData.finalPrice =
        currentPrice - currentPrice * (currentDiscount / 100);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: 'Product not found' });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const getSellerProduct = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ sellerId: res.locals.user?._id });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const limit = 20;
    const products = await Product.find({}).limit(limit).lean();
    return res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
