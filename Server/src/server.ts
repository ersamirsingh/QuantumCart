import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectMongo from "./config/MongoDB";
import connectRedis from "./config/Redis";
import authRouter from "./Routers/AuthRouter";
import cookieParser from 'cookie-parser'
import userRouter from "./Routers/UserRouter";



const app = express();
app.use(express.json());
app.use(cookieParser());



app.use('/auth', authRouter)
app.use('/user', userRouter)


const startServer = async (): Promise<void> => {

   try {
      await Promise.allSettled([connectMongo(), connectRedis()]);

      const PORT = process.env.PORT || 5000;

      app.listen(PORT, () => {
         console.log(`Server running on port ${PORT}`);
      });

   } catch (error:unknown) {
      console.error("Startup failed:", error);
      process.exit(1);
   }
};

startServer();