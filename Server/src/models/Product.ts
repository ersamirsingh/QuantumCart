import { Schema, model, Document, Types } from 'mongoose';

export enum ProductStatus {
   ACTIVE = 'ACTIVE',
   OUT_OF_STOCK = 'OUT_OF_STOCK',
   BLOCKED = 'BLOCKED',
}

export interface IProduct extends Document {
   name: string;
   description: string;
   price: number;
   discount: number;
   finalPrice: number;
   sellerId: Types.ObjectId;
   categoryId: Types.ObjectId;
   images: string[];
   stock: number;
   status: ProductStatus;
   rating: number;
}

const ProductSchema = new Schema<IProduct>(
   {
      name: { type: String, required: true },
      description: String,
      price: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      finalPrice: { type: Number, required: true },
      sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', index: true },
      categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
      images: [String],
      stock: { type: Number, required: true },
      status: {
         type: String,
         enum: Object.values(ProductStatus),
         default: ProductStatus.ACTIVE,
      },
      rating: { type: Number, default: 0 },
   },
   { timestamps: true }
);

export const Product = model<IProduct>('Product', ProductSchema);
