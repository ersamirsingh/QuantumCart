import { Schema, Document, model } from 'mongoose'


interface IUser extends Document {
   name: string,
   email: string,
   password: string,
   isAdmin: boolean,
   pic: string
}


const userSchmea :Schema<IUser> = new Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   isAdmin: {
      type: Boolean,
      required: true,
      default: false,
   },
   pic: {
      type: String,
      required: true,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
   },

}, {timestamps: true})


const User = model<IUser>("user", userSchmea);
export default User