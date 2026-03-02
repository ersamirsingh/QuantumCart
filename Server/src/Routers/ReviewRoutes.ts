import { Router } from 'express';
import authenticateUser from '../Middleware/AuthenticateUser';
import {
  reviewProduct,
  updateReview,
  removeReview,
} from '../Controllers/ReviewController';

const reviewRouter: Router = Router();

reviewRouter.post('/add', authenticateUser, reviewProduct);
reviewRouter.delete('/remove/:productId', authenticateUser, removeReview);
reviewRouter.patch('/update/:productId', authenticateUser, updateReview);

export default reviewRouter;
