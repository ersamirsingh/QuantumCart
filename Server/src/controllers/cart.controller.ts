import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(res.locals.user._id);
    const productId = new Types.ObjectId(req.body.productId);
    if (!Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid productId',
      });
    }

    const { quantity = 1 } = req.body || {};
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    const product = await Product.findById(productId).select('stock');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
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

export const removeFromCart = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = new Types.ObjectId(res.locals.user._id);
    const productId = req.params.productId as string;
    if (!Types.ObjectId.isValid(productId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid productId',
      });
    }

    const productObjectId = new Types.ObjectId(productId);

    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const cartItem = cart.items.find(item =>
      item.productId.equals(productObjectId)
    );

    if (!cartItem) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    let updatedCart;

    if (cartItem.quantity > 1) {
      updatedCart = await Cart.findOneAndUpdate(
        { userId, 'items.productId': productObjectId },
        { $inc: { 'items.$.quantity': -1 } },
        { new: true, session }
      ).populate('items.productId', 'name price images');
    } else {
      updatedCart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId: productObjectId } } },
        { new: true, session }
      ).populate('items.productId', 'name price images');
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: { cart: updatedCart },
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  } finally {
    session.endSession();
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
  }
};

export const removeItemCompletely = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(res.locals.user._id);

    const productIdString = req.params.productId as string;

    if (!Types.ObjectId.isValid(productIdString)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid productId',
      });
    }

    const productObjectId = new Types.ObjectId(productIdString);

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productObjectId } } },
      { new: true }
    ).populate('items.productId', 'name price images');

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
