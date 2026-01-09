import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
   productId: Types.ObjectId;
   userId: Types.ObjectId;
   rating: number;
   comment: string;
}

const ReviewSchema = new Schema<IReview>(
   {
      productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
   },
   { timestamps: true }
);

export const Review = model<IReview>("Review", ReviewSchema);
