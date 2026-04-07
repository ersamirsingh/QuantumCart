import { Router } from 'express';
import authenticateUser from '../middleware/user.middleware';
import {
  reviewProduct,
  updateReview,
  removeReview,
} from '../controllers/review.controller';

const reviewRouter: Router = Router();

reviewRouter.post('/add', authenticateUser, reviewProduct);
reviewRouter.delete('/remove/:productId', authenticateUser, removeReview);
reviewRouter.patch('/update/:productId', authenticateUser, updateReview);

export default reviewRouter;
