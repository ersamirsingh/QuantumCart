import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import ValidateInfo from '../util/ValidateInfo';
import bcrypt from 'bcrypt';
import { UserRole } from '../models/User';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { redisClient } from '../config/Redis';
import { Seller } from '../models/Seller';
import { IUser } from '../models/User';



export const Register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const { message, isValid } = ValidateInfo({ email, password });

    if (!isValid) {
      return res.status(400).json({ message });
    }

    const existedUser = await User.findOne({ email:email.toLowerCase().trim(), isDeleted:false});
    if (existedUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role ? role : UserRole.CUSTOMER,
    });

    const payload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
    };

    const JWT_SECRET = process.env.JWT_SECRET as string;
    const JWT_EXP = (process.env.JWT_EXP as string) || '1h';

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const Token = jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: JWT_EXP as SignOptions['expiresIn'],
    });
    res.cookie('Token', Token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: Number(process.env.JWT_MAX_AGE),
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};



export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), isDeleted:false });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credential',
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const payload: JwtPayload = {
      id: user._id.toString(),
      email: user.email,
    };

    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXP = process.env.JWT_EXP || '1h';
    if (!JWT_EXP || !JWT_SECRET) throw new Error('Internal server error');

    const Token = jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: JWT_EXP as SignOptions['expiresIn'],
    });

    res.cookie('Token', Token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: Number(process.env.JWT_MAX_AGE),
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};



export const Logout = async (req: Request, res: Response) => {
  try {
    const Token = req.cookies.Token || req.headers.authorization?.split(' ')[1];
    // console.log(Token)
    if (!Token) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET as string;
    if(!JWT_SECRET) 
      throw new Error('Internal server error');
    
    const payload = jwt.verify(Token, JWT_SECRET) as JwtPayload;
    if (!payload) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    await redisClient.set(`Token:${Token}`, res.locals.user._id.toString());
    await redisClient.expireAt(`Token:${Token}`, payload.exp as number);
    res.clearCookie('Token');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};



export const deleteUser = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = res.locals.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id,{ isDeleted: true },{ new: true, session });
    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const keys = await redisClient.keys(`Token:${user._id}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    await session.commitTransaction();
    session.endSession();

    res.clearCookie("Token")

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
};



export const verifyUser = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const seller = await Seller.findOne({ userId: user._id }).populate<{
      userId: IUser;
    }>('userId', 'name email role isVerified');
    if (seller) {
      return res.status(200).json({
        success: true,
        _id: seller.userId._id,
        name: seller.userId?.name,
        email: seller.userId?.email,
        role: seller.userId?.role,
        isVerified: seller.userId?.isVerified,
        storeName: seller.storeName,
        rating: seller.rating,
        totalSales: seller.totalSales,
        products: seller.products,
      });
    }
    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

