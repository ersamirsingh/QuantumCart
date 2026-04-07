import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { Seller } from '../models/seller.model';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

export const userInfo = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const seller = await Seller.findOne({ userId: user._id }).populate(
      'userId',
      'name email role'
    );
    if (seller) return res.status(200).json(seller);

    res.status(200).json(user);
  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const updateUserInfo = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const user = res.locals.user;
    let { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : 'Internal server error',
    });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(res.locals.user._id);
    const addressData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // If setting default, unset previous default
    if (addressData.isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    user.addresses.push(addressData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(res.locals.user._id);
    const user = await User.findById(userId).select('addresses');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(res.locals.user._id);
    if (!userId) {
      return res.status(404).json({ sucess: false, message: 'User not found' });
    }

    const { currPassword, newPassword } = req.body;
    if (!currPassword || !newPassword) {
      return res
        .status(400)
        .json({ sucess: false, message: 'Missing required fields' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ sucess: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currPassword, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ sucess: false, message: 'Invalid credentials' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ sucess: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};
