import { Schema, model, Document, Types } from "mongoose";

interface CartItem {
   productId: Types.ObjectId;
   quantity: number;
}

export interface ICart extends Document {
   userId: Types.ObjectId;
   items: CartItem[];
   totalPrice: number;
}

const CartSchema = new Schema<ICart>(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
      items: [
         {
            productId: { type: Schema.Types.ObjectId, ref: "Product" },
            quantity: Number,
         },
      ],
      totalPrice: Number,
   },
   { timestamps: true }
);

export const Cart = model<ICart>("Cart", CartSchema);
