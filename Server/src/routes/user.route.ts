import { Router } from 'express';
import authenticateUser from '../middleware/user.middleware';
import {
  userInfo,
  updateUserInfo,
  addAddress,
  getAddresses,
  updatePassword,
} from '../controllers/user.controller';
import { fetchMyOrders } from '../controllers/order.controller';

const userRouter: Router = Router();

userRouter.get('/', authenticateUser, userInfo);
userRouter.patch('/update', authenticateUser, updateUserInfo);
userRouter.post('/add/address', authenticateUser, addAddress);
userRouter.get('/get/addresses', authenticateUser, getAddresses);
userRouter.get('/orders', authenticateUser, fetchMyOrders);
userRouter.patch('/update/password', authenticateUser, updatePassword);

export default userRouter;
