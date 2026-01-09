import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
   name: string;
   parentCategoryId?: Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>({
   name: { type: String, required: true },
   parentCategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
});

export const Category = model<ICategory>("Category", CategorySchema);
