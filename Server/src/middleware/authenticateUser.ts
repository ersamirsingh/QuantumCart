import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/Redis";
import { User } from "../models/User";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IPayload extends JwtPayload {
   id: string;
   email?: string;
}


const authenticateUser = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
   
   try {

      const Token =
         req.cookies?.Token ||
         req.headers.authorization?.split(" ")[1];

      if (!Token) {
         return res.status(401).json({ message: "Unauthorized" });
      }

      const isBlocked = await redisClient.exists(`Token:${Token}`);
      if (isBlocked) {
         return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = jwt.verify( Token, process.env.JWT_SECRET as string) as IPayload;

      if (typeof payload !== "object" || !payload) {
         return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(payload.id);
      if (!user) {
         return res.status(401).json({ message: "Unauthorized" });
      }

      res.locals.user = user;

      next();
   } catch (error) {
      return res.status(500).json({
         message: error instanceof Error ? error.message : "Internal server error",
      });
   }
};

export default authenticateUser;
