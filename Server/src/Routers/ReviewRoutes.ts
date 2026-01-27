import { Router } from 'express'
import authenticateUser from '../middleware/authenticateUser';
import { reviewProduct, updateReview, removeReview } from '../controllers/ReviewController';


const reviewRouter:Router = Router();

reviewRouter.post('/add', authenticateUser, reviewProduct);
reviewRouter.delete('/remove/:productId', authenticateUser, removeReview);
reviewRouter.patch('/update/:productId', authenticateUser, updateReview);


export default reviewRouter
