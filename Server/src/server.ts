import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectMongo from './config/MongoDB';
import connectRedis from './config/Redis';
import authRouter from './routes/AuthRoutes';
import cookieParser from 'cookie-parser';
import userRouter from './routes/UserRoutes';
import sellerRouter from './routes/SellerRoutes';
import productRouter from './routes/ProductRoutes';
import orderRouter from './routes/OrderRoutes';
import cors from 'cors';
import cartRouter from './routes/CartRoutes';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'https://quantumcart-1gaq.onrender.com',
    credentials: true,
  })
);

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/seller', sellerRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/cart', cartRouter);

const startServer = async (): Promise<void> => {
  try {
    await Promise.allSettled([connectMongo(), connectRedis()]);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
};

startServer();
