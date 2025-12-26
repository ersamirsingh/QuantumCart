import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

const connectRedis = async (): Promise<RedisClientType> => {

   if (redisClient?.isOpen) return redisClient;

   if(!process.env.REDIS_PASSWORD || !process.env.REDIS_HOST || !process.env.REDIS_PORT) {
      throw new Error("Redis environment variables are missing");
   }

   redisClient = createClient({
      username: "default",
      password: process.env.REDIS_PASSWORD,
      socket: {
         host: process.env.REDIS_HOST,
         port: Number(process.env.REDIS_PORT),
      },
   });

   redisClient.on("error", (err: unknown): void => {
      console.error("Redis error:", err);
   });

   await redisClient.connect();
   console.log("Redis connected");

   return redisClient;
};

export default connectRedis;
