import { Schema, model, Document, Types } from "mongoose";

export enum OrderStatus {
   PENDING = "PENDING",
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
   items: {
      sellerId: Types.ObjectId;
      productId: Types.ObjectId;
      quantity: number;
      priceAtPurchase: number;
   }[];
   totalAmount: number;
   orderStatus: OrderStatus;
   paymentStatus: PaymentStatus;
   shippingAddress: any;
}

const OrderSchema = new Schema<IOrder>(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

      items: [
         {
            sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
            productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            priceAtPurchase: { type: Number, required: true },
         },
      ],

      totalAmount: { type: Number, required: true },

      orderStatus: {
         type: String,
         enum: Object.values(OrderStatus),
         default: OrderStatus.PLACED,
      },

      paymentStatus: {
         type: String,
         enum: Object.values(PaymentStatus),
         default: PaymentStatus.PENDING,
      },

      shippingAddress: { type: Object, required: true },
   },
   { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
