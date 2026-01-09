import { Schema, model, Document, Types } from "mongoose";

export interface IShipment extends Document {
   orderId: Types.ObjectId;
   courierName: string;
   trackingNumber: string;
   deliveryStatus: string;
}

const ShipmentSchema = new Schema<IShipment>(
   {
      orderId: { type: Schema.Types.ObjectId, ref: "Order" },
      courierName: String,
      trackingNumber: String,
      deliveryStatus: String,
   },
   { timestamps: true }
);

export const Shipment = model<IShipment>("Shipment", ShipmentSchema);
