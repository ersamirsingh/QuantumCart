import { Router } from 'express';
import authenticateUser from '../middleware/authenticateUser';
import {
  userInfo,
  updateUserInfo,
  addAddress,
  getAddresses,
  updatePassword,
} from '../controllers/UserController';
import { fetchMyOrders } from '../controllers/OrderController';

const userRouter: Router = Router();

userRouter.get('/', authenticateUser, userInfo);
userRouter.patch('/update', authenticateUser, updateUserInfo);
userRouter.post('/add/address', authenticateUser, addAddress);
userRouter.get('/get/addresses', authenticateUser, getAddresses);
userRouter.get('/orders', authenticateUser, fetchMyOrders);
userRouter.patch('/update/password', authenticateUser, updatePassword)

export default userRouter;
