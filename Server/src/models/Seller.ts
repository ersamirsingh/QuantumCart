import { Schema, model, Document, Types } from "mongoose";

export interface ISeller extends Document {
   userId: Types.ObjectId;
   storeName: string;
   storeDescription: string;
   rating: number;
   totalSales: number;
}

const SellerSchema = new Schema<ISeller>(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      storeName: { type: String, required: true },
      storeDescription: String,
      rating: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
   },
   { timestamps: true }
);

export const Seller = model<ISeller>("Seller", SellerSchema);
