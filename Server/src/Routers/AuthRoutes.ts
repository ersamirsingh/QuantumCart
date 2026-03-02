import { Router } from 'express';
import {
  Register,
  Login,
  Logout,
  deleteUser,
  verifyUser,
} from '../Controllers/AuthController';
import authenticateUser from '../Middleware/authenticateUser';

const authRouter: Router = Router();

authRouter.get('/verify', authenticateUser, verifyUser);
authRouter.post('/register', Register);
authRouter.post('/login', Login);
authRouter.get('/logout', authenticateUser, Logout);
authRouter.delete('/delete', authenticateUser, deleteUser);

export default authRouter;
