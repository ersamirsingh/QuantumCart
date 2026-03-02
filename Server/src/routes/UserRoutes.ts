import { Router } from 'express';
import authenticateUser from '../middleware/AuthenticateUser';
import {
  userInfo,
  updateUserInfo,
  addAddress,
  getAddresses,
  fetchMyOrders,
} from '../controllers/UserController';

const userRouter: Router = Router();

userRouter.get('/', authenticateUser, userInfo);
userRouter.patch('/update', authenticateUser, updateUserInfo);
userRouter.post('/add/address', authenticateUser, addAddress);
userRouter.get('/get/addresses', authenticateUser, getAddresses);
userRouter.get('/orders', authenticateUser, fetchMyOrders);

export default userRouter;
