import { Schema, model, Document, Types } from "mongoose";

export enum UserRole {
   CUSTOMER = "CUSTOMER",
   SELLER = "SELLER",
   ADMIN = "ADMIN",
}

export interface IAddress {
   _id?: Types.ObjectId;
   fullName: string;
   phone: string;
   line1: string;
   line2?: string;
   city: string;
   state: string;
   pincode: string;
   country: string;
   isDefault: boolean;
}

export interface IUser extends Document {
   name: string;
   email: string;
   password: string;
   role: UserRole;
   isVerified: boolean;
   addresses: IAddress[];
}

const AddressSchema = new Schema<IAddress>({
   fullName: { type: String, required: true, trim: true },
   phone: { type: String, required: true, trim: true },
   line1: { type: String, required: true, trim: true },
   line2: { type: String, trim: true },
   city: { type: String, required: true, trim: true },
   state: { type: String, required: true, trim: true },
   pincode: { type: String, required: true, trim: true },
   country: { type: String, required: true, trim: true },
   isDefault: { type: Boolean, default: false },
}, { _id: true }
);

const UserSchema = new Schema<IUser>({
   name: { type: String, required: true, trim: true },
   email: { type: String, required: true, unique: true, index: true },
   password: { type: String, required: true },
   role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
   },
   isVerified: { type: Boolean, default: false },
   addresses: [AddressSchema],
}, { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);