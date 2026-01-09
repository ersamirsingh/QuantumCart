import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
   orderId: Types.ObjectId;
   paymentMethod: string;
   transactionId: string;
   paymentStatus: string;
}

const PaymentSchema = new Schema<IPayment>(
   {
      orderId: { type: Schema.Types.ObjectId, ref: "Order" },
      paymentMethod: String,
      transactionId: String,
      paymentStatus: String,
   },
   { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
