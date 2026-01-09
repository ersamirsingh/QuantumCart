import { Schema, model, Document } from "mongoose";

export enum UserRole {
   CUSTOMER = "CUSTOMER",
   SELLER = "SELLER",
   ADMIN = "ADMIN",
}

export interface IUser extends Document {
   name: string;
   email: string;
   password: string;
   role: UserRole;
   isVerified: boolean;
}

const UserSchema = new Schema<IUser>({
   name: { type: String, required: true },
   email: { type: String, required: true, unique: true, index: true },
   password: { type: String, required: true },
   role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
   },
   isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export const User = model<IUser>("User", UserSchema);