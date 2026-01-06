import express from "express";
import dotenv from "dotenv";
import connectMongo from "./config/MongoDB";
import connectRedis from "./config/Redis";
import authRouter from "./Routers/AuthRouter";

dotenv.config();


const app = express();
app.use(express.json());
app.use('/auth', authRouter)


const startServer = async (): Promise<void> => {

   try {
      await Promise.all([connectMongo(), connectRedis()]);

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