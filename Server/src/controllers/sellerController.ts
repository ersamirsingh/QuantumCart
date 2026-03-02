import { Request, Response } from 'express';
import { Seller } from '../Models/Seller';
import { User, UserRole } from '../Models/User';
import { Product } from '../Models/Product';
import mongoose from 'mongoose';

export const sellerRegister = async (req: Request, res: Response) => {
  
  try {
    const { storeName, storeDescription } = req.body || {};
    if (!storeName || !storeDescription) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(res.locals.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingSeller = await Seller.findOne({
      userId: res.locals.user._id,
    });
    if (existingSeller)
      return res.status(400).json({ message: 'Seller already exists' });

    const seller = await Seller.create({
      storeName,
      storeDescription,
      userId: res.locals.user._id,
    });

    user.role = UserRole.SELLER;
    await user.save();
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const removeSeller = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seller = await Seller.findOneAndDelete(
      { userId: res.locals.user._id },
      { session }
    );

    if (!seller) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Seller not found' });
    }

    await Product.deleteMany({ sellerId: seller._id }, { session });

    const user = await User.findById(res.locals.user._id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = UserRole.CUSTOMER;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: 'Seller and all associated products deleted successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};
