import { Request, Response } from "express";
import { Order, OrderStatus } from "../models/Order";




const confirmOrder = async (req:Request, res:Response) => {
   
   try {
      
      const orderId = req.params.orderId;
      if(!orderId){
         return res.status(400).json({message: "Missing required fields"});   
      }

      const order = await Order.findById(orderId);
      if(!order){
         return res.status(404).json({message: "Order not found"});
      }

      order.orderStatus = OrderStatus.CONFIRMED;

      await order.save();
      return res.status(200).json({message: "Order confirmed successfully"});

   } catch (error) {
      res.status(500).json({message: "Internal server error"});
   }
}


//Generate track id
//Check delivery status
//Courier name
const shipOrder = async (req: Request, res: Response) => {


   try { 

      const orderId = req.params.orderId;
      if(!orderId){
         return res.status(400).json({message: "Missing required fields"});
      }

      const order = await Order.findById(orderId);
      if(!order){
         return res.status(404).json({message: "Order not found"});
      }

      order.orderStatus = OrderStatus.SHIPPED;  
      await order.save();
      return res.status(200).json({message: "Order shipped successfully"});
   } catch (error) {
      console.error(error);
      return res.status(500).json({message: "Internal server error"});
   }
};



export {shipOrder, confirmOrder}