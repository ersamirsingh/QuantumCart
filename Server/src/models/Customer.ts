import { Schema, model, Document, Types } from "mongoose";

export interface Address {
   fullName: string;
   phone: string;
   street: string;
   city: string;
   state: string;
   pincode: string;
}

export interface ICustomer extends Document {
   userId: Types.ObjectId;
   addresses: Address[];
   wishlist: Types.ObjectId[];
}

const AddressSchema = new Schema<Address>({
   fullName: String,
   phone: String,
   street: String,
   city: String,
   state: String,
   pincode: String,
});

const CustomerSchema = new Schema<ICustomer>({
   userId: { type: Schema.Types.ObjectId, ref:"User", required: true },
   addresses: [AddressSchema],
   wishlist: [{ type: Schema.Types.ObjectId, ref:"Product"}],
});

export const Customer = model<ICustomer>("Customer", CustomerSchema);