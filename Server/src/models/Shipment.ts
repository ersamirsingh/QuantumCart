import { Schema, model, Document, Types } from "mongoose";
import { OrderStatus } from "./Order";


export interface IShipment extends Document {
   orderId: Types.ObjectId;
   courierName: string;
   trackingNumber: string;
   orderStatus: string;
}

const ShipmentSchema = new Schema<IShipment>(
   {
      orderId: {
         type: Schema.Types.ObjectId,
         ref: "Order",
         required: true,
         index: true,
      },
      courierName: {
         type: String,
         required: true,
      },
      trackingNumber: {
         type: String,
         required: true,
         unique: true,
         index: true,
      },
      orderStatus: {
         type: String,
         enum: Object.values(OrderStatus),
         default: "PENDING",
      },
   },
   { timestamps: true }
);


export const Shipment = model<IShipment>("Shipment", ShipmentSchema);
