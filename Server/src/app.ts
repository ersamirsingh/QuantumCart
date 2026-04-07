import express from 'express';
import authRouter from './routes/auth.route';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route';
import sellerRouter from './routes/seller.route';
import productRouter from './routes/product.route';
import orderRouter from './routes/order.route';
import cors from 'cors';
import cartRouter from './routes/cart.route';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'https://quantumcart-1gaq.onrender.com',
    // origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/seller', sellerRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/cart', cartRouter);


export default app;
