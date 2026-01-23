import { Request, Response } from "express";
import { Order, OrderStatus } from "../models/Order";
import { Shipment } from "../models/Shipment";
import { randomBytes } from "crypto";


//Generate track id
//Check delivery status
//Courier name


function selectCourier(orderWeight: number): string {
  if (orderWeight < 2) return "Delhivery";
  if (orderWeight < 5) return "DTDC";
  return "FedEx";
}


function generateTrackingNumber(courierName: string): string {
  const prefix = courierName.slice(0, 3).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const uniqueId = randomBytes(3).toString("hex").toUpperCase();

  return `${prefix}-${date}-${uniqueId}`;
}


export const shipOrder = async (req: Request, res: Response) => {

   try {
      const {orderId, orderWeight} = req.body || {};
      if(!orderId || !orderWeight){
         return res.status(400).json({message: "Missing required fields"});
      }

      const order = await Order.findById(orderId);
      if(!order) return res.status(404).json({message: "Order not found"});

      if(order.orderStatus === OrderStatus.CANCELLED) 
      return res.status(400).json({message: "Invalid order status"});

      if(order.orderStatus === OrderStatus.SHIPPED)   
      return res.status(400).json({message: "Order already shipped"});

      const courierName = selectCourier(orderWeight);
      const trackingNumber = generateTrackingNumber(courierName);

      const shipment = await Shipment.create({
         orderId,
         courierName,
         trackingNumber,
         orderStatus: 'PENDING',
      });

      order.orderStatus = OrderStatus.SHIPPED
      await order.save();

      res.status(201).json(shipment);
   } catch (error) {
      res.status(500).json({message: "Internal server error"});
   }

};
