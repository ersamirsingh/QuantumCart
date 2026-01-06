import { Schema, Document, model } from 'mongoose';

interface IUser extends Document {
   firstName: string;
   lastName: string;
   emailId: string;
   password: string;
   pic: string;
   cart: string[];
}

const userSchema: Schema<IUser> = new Schema({
   firstName: {
      type: String,
      required: true,
   },
   lastName: {
      type: String,
      required: true,
   },
   emailId: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   pic: {
      type: String,
      required: true,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
   },
   cart: {
      type: [String],
      required: true,
      default: [],
   },
}, { timestamps: true });

const User = model<IUser>('user', userSchema);

export default User;