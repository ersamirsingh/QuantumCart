import { Router } from 'express';
import { Register, Login, Logout, deleteUser, verifyUser} from '../controllers/AuthController';
import authenticateUser from '../middleware/authenticateUser';



const authRouter: Router = Router();

authRouter.get('/verify', authenticateUser, verifyUser);
authRouter.post('/register', Register)
authRouter.post('/login', Login)
authRouter.get('/logout', authenticateUser, Logout)
authRouter.delete('/delete', authenticateUser, deleteUser)



export default authRouter
