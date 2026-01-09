import { Schema, model, Document, Types } from "mongoose";

export enum OrderStatus {
   PLACED = "PLACED",
   CONFIRMED = "CONFIRMED",
   SHIPPED = "SHIPPED",
   DELIVERED = "DELIVERED",
   CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
   PENDING = "PENDING",
   SUCCESS = "SUCCESS",
   FAILED = "FAILED",
}

export interface IOrder extends Document {
   userId: Types.ObjectId;
   sellerId: Types.ObjectId;
   items: {
      productId: Types.ObjectId;
      quantity: number;
      priceAtPurchase: number;
   }[];
   totalAmount: number;
   orderStatus: OrderStatus;
   paymentStatus: PaymentStatus;
   shippingAddress: object;
}

const OrderSchema = new Schema<IOrder>(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
      sellerId: { type: Schema.Types.ObjectId, ref: "Seller", index: true },
      items: [
         {
            productId: { type: Schema.Types.ObjectId, ref: "Product" },
            quantity: Number,
            priceAtPurchase: Number,
         },
      ],
      totalAmount: Number,
      orderStatus: { type: String, enum: Object.values(OrderStatus) },
      paymentStatus: { type: String, enum: Object.values(PaymentStatus) },
      shippingAddress: Object,
   },
   { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
