import { Request, Response } from 'express';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { User } from '../models/User';
import mongoose, { Types } from 'mongoose';
import { Product } from '../models/Product';



// export const makeOrder = async (req: Request, res: Response) => {
//   try {
//     const userId = new Types.ObjectId(res.locals.user?._id);
//     const { items, addressId, sellerId } = req.body;

//     const shippingAddress = await User.findOne(
//       { _id: userId, 'addresses._id': addressId },
//       { 'addresses.$': 1 }
//     );

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: 'Invalid order data' });
//     }

//     let totalAmount = 0;

//     for (let item of items) {
//       if (!item.productId || item.quantity <= 0) {
//         return res.status(400).json({ message: 'Invalid order data' });
//       }

//       totalAmount += item.quantity * item.price;
//     }

//     const order = await Order.create({
//       userId,
//       sellerId,
//       items,
//       totalAmount,
//       shippingAddress,
//       orderStatus: OrderStatus.PLACED,
//       paymentStatus: PaymentStatus.PENDING,
//     });

//     return res.status(201).json({
//       message: 'Order placed successfully',
//       order,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: 'Failed to create order',
//       error,
//     });
//   }
// };


export const makeOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = new Types.ObjectId(res.locals.user._id);
    const { items, addressId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const shippingAddress = await User.findOne(
      { _id: userId, "addresses._id": addressId },
      { "addresses.$": 1 }
    );

    if (!shippingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < item.quantity) {
        throw new Error("Insufficient stock");
      }

      const priceAtPurchase = product.price;

      totalAmount += priceAtPurchase * item.quantity;

      orderItems.push({
        productId: product._id,
        sellerId: product.sellerId,
        quantity: item.quantity,
        priceAtPurchase,
      });

      product.stock -= item.quantity;
      await product.save({ session });
    }

    const order = await Order.create(
      [
        {
          userId,
          items: orderItems,
          totalAmount,
          shippingAddress,
          orderStatus: OrderStatus.PLACED,
          paymentStatus: PaymentStatus.PENDING,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    session.endSession();
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const orderId = new Types.ObjectId(req.params.orderId as string);
    if (!orderId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = OrderStatus.CONFIRMED;

    await order.save();
    return res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(res.locals.user?._id);
    const orderId = new Types.ObjectId(req.params.orderId as string);
    if (!orderId)
      return res.status(400).json({ message: 'Missing required fields' });

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      return res.status(400).json({ message: 'Order already cancelled' });
    }

    if (
      order.orderStatus === OrderStatus.SHIPPED ||
      order.orderStatus === OrderStatus.DELIVERED
    ) {
      return res.status(400).json({
        message: 'Order cannot be cancelled after shipping',
      });
    }

    order.orderStatus = OrderStatus.CANCELLED;
    order.paymentStatus = PaymentStatus.FAILED;

    await order.save();

    return res.status(200).json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to cancel order',
      error,
    });
  }
};


export const fetchMyOrders = async (req: Request, res: Response) => {
  
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await Order.find({ userId: user._id }).populate(
      'userId',
      'name email role'
    );
    if (order) return res.status(200).json(order);

    res.status(200).json(user);
  } catch (error: unknown) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};



// export const getSellerOrders = async (req: Request, res: Response) => {
//   try {
//     const sellerId = new Types.ObjectId(res.locals.user._id);
//     const orders = await Order.find({
//       "items.sellerId": sellerId
//     }).populate("items.productId", "name price images").sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: error instanceof Error ? error.message : "Internal server error"
//     });
//   }
// };



export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const sellerId = new Types.ObjectId(res.locals.user._id);
    const orders = await Order.find({ "items.sellerId": sellerId })
      .populate("userId", "name email")
      .populate("items.productId", "name images addreses")
      .sort({ createdAt: -1 }).select("+shippingAddress");

    const sellerOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item: any) => item.sellerId.toString() === sellerId.toString()
      );

      const sellerTotal = sellerItems.reduce(
        (sum: number, item: any) =>
          sum + item.quantity * item.priceAtPurchase,
        0
      );

      return {
        ...order.toObject(),
        items: sellerItems,
        sellerTotal,
      };
    });

    res.status(200).json({
      success: true,
      orders: sellerOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};