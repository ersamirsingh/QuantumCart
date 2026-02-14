import { Request, Response } from "express";
import { User } from "../models/User";
import ValidateInfo from "../Utils/ValidateInfo";
import bcrypt from 'bcrypt'
import { UserRole } from "../models/User";
import jwt,{JwtPayload} from 'jsonwebtoken';
import { redisClient } from "../config/Redis";
import { Seller } from "../models/Seller";
import { IUser } from "../models/User";


const Register = async ( req: Request, res: Response): Promise<Response> => {

   try {
      const { name, email, password, role } = req.body || {};

      if (!name || !email || !password) {
         return res.status(400).json({
            message: "Missing required fields",
         });
      }

      const { message, isValid } = ValidateInfo({email, password});

      if (!isValid) {
         return res.status(400).json({ message });
      }

      const existedUser = await User.findOne({ email });
      if (existedUser) {
         return res.status(400).json({
            message: "User already exists",
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
         name,
         email,
         password: hashedPassword,
         role: role ? role : UserRole.CUSTOMER,
      });

      const payload: JwtPayload = {
         id: user._id.toString(),
         email: user.email,
      };

      const JWT_SECRET = process.env.JWT_SECRET as string;
      const JWT_EXP = process.env.JWT_EXP as string || "1h";

      if (!JWT_SECRET) {
         throw new Error("JWT_SECRET is not defined");
      }

      const Token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'});

      res.cookie("Token", Token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict",
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
         message: error instanceof Error ? error.message : "Internal server error",
      });
   }
};




const Login = async (req: Request, res: Response) => {

   try {

      const {email, password} = req.body || {};

      if (!email || !password) {
         return res.status(400).json({
            message: "Missing required fields",
         });
      }

      const user = await User.findOne({email});
      if (!user) {
         return res.status(404).json({
            message: "Invalid credentials",
         });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
         return res.status(401).json({
            message: "Invalid credentials",
         });
      }

      const payload: JwtPayload = {
         id: user._id.toString(),
         email: user.email,
      };

      const JWT_SECRET = process.env.JWT_SECRET;
      const JWT_EXP = process.env.JWT_EXP || "1h";

      const Token = jwt.sign(payload, JWT_SECRET as string, {expiresIn: '1h'});

      res.cookie("Token", Token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict",
         maxAge: Number(process.env.JWT_MAX_AGE),
      });

      res.status(200).json({
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
         message: error instanceof Error ? error.message : "Internal server error",
      })
   }
}



const Logout = async (req: Request, res: Response) => {

   try {

      const Token = req.cookies.Token || req.headers.authorization?.split(" ")[1];

      if (!Token) {
         return res.status(401).json({
            message: "Unauthorized",
         });
      }

      const payload = jwt.decode(Token) as JwtPayload;
      if (!payload) {
         return res.status(401).json({
            message: "Unauthorized",
         });
      }

      await redisClient.set(`Token:${Token}`, 'Blocked');
      await redisClient.expireAt(`Token:${Token}`, payload.exp as number);
      res.clearCookie("Token");

      res.status(200).json({
         success: true,
         message: "Logout successful",
      });
      
   } catch (error: unknown) {
      return res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error",
      });
   }
}



const deleteUser = async (req: Request, res: Response) => {

   try {

      const user = res.locals.user;
      if (!user) {
         return res.status(404).json({
            message: "User not found",
         });
      }

      await redisClient.del(`Token:${req.cookies.Token}`)

      await User.findByIdAndDelete(user._id);
      res.status(200).json({
         success: true,
         message: "User deleted successfully",
      })
   }
   catch(err){
      return res.status(500).json({
         message: err instanceof Error ?err.message : "Internal server error"
      })
   }
}


const verifyUser = async (req: Request, res: Response) => {
   
   try {
      
      const user = res.locals.user;
      const seller = await Seller.findOne({userId: user._id}).populate<{ userId: IUser }>("userId", "name email role isVerified");
      if(seller){
         return res.status(200).json({
            success: true,
            _id: seller.userId._id,
            name: seller.userId?.name,
            email: seller.userId?.email,
            role: seller.userId?.role,
            isVerified: seller.userId?.isVerified,
            storeName:seller.storeName,
            rating:seller.rating,
            totalSales:seller.totalSales,
            products:seller.products
         });
      }
      return res.status(200).json({
         success: true,
         _id:user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         isVerified: user.isVerified
      });
   } catch (error) {
      return res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error",
      })
   }
}

export { Register, Login, Logout, deleteUser, verifyUser }