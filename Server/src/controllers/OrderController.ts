import { Request, Response } from "express";
import { Order, OrderStatus, PaymentStatus } from "../models/Order";




export const makeOrder = async (req: Request, res: Response) => {

   try {
      
      const userId = res.locals.user?._id;
      const { items, shippingAddress } = req.body;

      if (!items || items.length === 0) {
         return res.status(400).json({ message: "Invalid order data" });
      }

      let totalAmount = 0;

      for (let item of items) {
         if (!item.sellerId || !item.productId || item.quantity <= 0) {
            return res.status(400).json({ message: "Invalid order data" });
         }

         totalAmount += item.quantity * item.priceAtPurchase;
      }

      const order = await Order.create({
         userId,
         items,
         totalAmount,
         shippingAddress,
         orderStatus: OrderStatus.PLACED,
         paymentStatus: PaymentStatus.PENDING,
      });

      return res.status(201).json({
         message: "Order placed successfully",
         order,
      });
   } catch (error) {
      return res.status(500).json({
         message: "Failed to create order",
         error,
      });
   }
};




export const cancelOrder = async (req: Request, res: Response) => {
   try {
      const userId = res.locals.user?._id;
      const { orderId } = req.params;

      const order = await Order.findOne({ _id: orderId, userId });

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      if (order.orderStatus === OrderStatus.CANCELLED) {
         return res.status(400).json({ message: "Order already cancelled" });
      }

      if (
         order.orderStatus === OrderStatus.SHIPPED ||
         order.orderStatus === OrderStatus.DELIVERED
      ) {
         return res.status(400).json({
            message: "Order cannot be cancelled after shipping",
         });
      }

      order.orderStatus = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.FAILED;

      await order.save();

      return res.status(200).json({
         message: "Order cancelled successfully",
         order,
      });
   } catch (error) {
      return res.status(500).json({
         message: "Failed to cancel order",
         error,
      });
   }
};



