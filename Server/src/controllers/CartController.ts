import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Cart } from '../Models/Cart';
import { Product } from '../Models/Product';
import mongoose from 'mongoose';

export const addToCart = async (req: Request, res: Response) => {
   try {
      const userId = new Types.ObjectId(res.locals.user._id);
      const { productId, quantity = 1 } = req.body;

      if (!Types.ObjectId.isValid(productId)) {
         return res
            .status(400)
            .json({ success: false, message: 'Invalid productId' });
      }

      if (quantity <= 0) {
         return res
            .status(400)
            .json({ success: false, message: 'Quantity must be greater than 0' });
      }

      const product = await Product.findById(productId).select('stock');
      if (!product) {
         return res
            .status(404)
            .json({ success: false, message: 'Product not found' });
      }

      if (product.stock < quantity) {
         return res
            .status(400)
            .json({ success: false, message: 'Insufficient stock' });
      }

      await Cart.updateOne(
         { userId },
         { $setOnInsert: { userId, items: [] } },
         { upsert: true }
      );

      const updateResult = await Cart.updateOne(
         { userId, 'items.productId': productId },
         { $inc: { 'items.$.quantity': quantity } }
      );

      if (updateResult.matchedCount === 0) {
         await Cart.updateOne(
            { userId },
            { $push: { items: { productId, quantity } } }
         );
      }

      const cart = await Cart.findOne({ userId })
         .populate('items.productId', 'name price images')
         .lean();

      return res.status(200).json({
         success: true,
         data: cart,
      });
   } catch (error) {
      return res
         .status(500)
         .json({ success: false, message: 'Internal server error' });
   }
};

export const removeFromCart = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const session = await mongoose.startSession();
   try {
      session.startTransaction();

      const userId = res.locals.user?._id;
      const { productId } = req.params;

      if (!productId) {
         await session.abortTransaction();
         session.endSession();
         return res.status(400).json({
            success: false,
            message: 'ProductId is required',
         });
      }

      if (!Types.ObjectId.isValid(productId)) {
         await session.abortTransaction();
         session.endSession();
         return res.status(400).json({
            success: false,
            message: 'Invalid productId',
         });
      }

      const cart = await Cart.findOne({ userId }).session(session);

      if (!cart) {
         await session.abortTransaction();
         session.endSession();
         return res.status(404).json({
            success: false,
            message: 'Cart not found',
         });
      }

      const cartItem = cart.items.find(
         item => item.productId.toString() === productId
      );

      if (!cartItem) {
         await session.abortTransaction();
         session.endSession();
         return res.status(404).json({
            success: false,
            message: 'Product not found in cart',
         });
      }

      let updatedCart;
      if (cartItem.quantity > 1) {
         updatedCart = await Cart.findOneAndUpdate(
            { userId, 'items.productId': new Types.ObjectId(productId) },
            { $inc: { 'items.$.quantity': -1 } },
            { new: true, session }
         ).populate('items.productId', 'name price images');
      } else {
         updatedCart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId: new Types.ObjectId(productId) } } },
            { new: true, session }
         ).populate('items.productId', 'name price images');
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
         success: true,
         message: 'Cart updated successfully',
         data: { cart: updatedCart },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
         success: false,
         message: 'Internal server error',
      })
   }
};

export const clearCart = async (req: Request, res: Response) => {
   try {
      const userId = new Types.ObjectId(res.locals.user._id);

      const updatedCart = await Cart.findOneAndUpdate(
         { userId },
         { $set: { items: [] } },
         { new: true }
      );

      if (!updatedCart) {
         return res
            .status(404)
            .json({ success: false, message: 'Cart not found' });
      }

      return res.status(200).json({
         success: true,
         data: updatedCart,
      });
   } catch (error) {
      return res
         .status(500)
         .json({ success: false, message: 'Internal server error' });
      error;
   }
};

export const getCart = async (req: Request, res: Response) => {
   try {
      const userId = new Types.ObjectId(res.locals.user._id);

      const cart = await Cart.findOne({ userId })
         .populate('items.productId', 'name price images')
         .lean();

      if (!cart) {
         return res.status(200).json({
            success: true,
            data: { userId, items: [], totalPrice: 0 },
         });
      }

      const totalPrice = cart.items.reduce((acc: number, item: any) => {
         return acc + item.productId.price * item.quantity;
      }, 0);

      return res.status(200).json({
         success: true,
         data: { ...cart, totalPrice },
      });
   } catch (error) {
      return res
         .status(500)
         .json({ success: false, message: 'Internal server error' });
      error;
   }
};

export const removeItemCompletely = async (req: Request, res: Response) => {
   try {
      const userId = new Types.ObjectId(res.locals.user._id);
      const productId = new Types.ObjectId(req.params.productId);
      if (!productId)
         return res.status(400).json({
            success: false,
            message: 'ProductId is required',
         });

      const updatedCart = await Cart.findOneAndUpdate(
         { userId },
         { $pull: { items: { productId } } },
         { new: true }
      );
      if (!updatedCart) {
         return res
            .status(404)
            .json({ success: false, message: 'Cart not found' });
      }

      return res.status(200).json({
         success: true,
         data: updatedCart,
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
   }
};
