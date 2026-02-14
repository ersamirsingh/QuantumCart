import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "./User";

export interface ISeller extends Document {
   userId: Types.ObjectId | IUser;
   storeName: string;
   storeDescription: string;
   rating: number;
   totalSales: number;
   products: Types.ObjectId[];
}

const SellerSchema = new Schema<ISeller>(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique:true },
      storeName: { type: String, required: true, unique:true },
      storeDescription: {type: String, maxlength: 200},
      rating: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      products: [
         { type: Schema.Types.ObjectId, ref: "Product", index: true},
      ]
   },
   { timestamps: true }
);

export const Seller = model<ISeller>("Seller", SellerSchema);
