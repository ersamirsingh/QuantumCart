import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectMongo from './config/db.config';
import connectRedis from './config/redis.config';
import app from './app';


const startServer = async (): Promise<void> => {
  try {
    await Promise.all([connectMongo(), connectRedis()]);

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
