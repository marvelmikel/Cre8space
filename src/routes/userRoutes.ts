import express from 'express';
import { body } from 'express-validator';
import {
  getCurrentUser,
  updateProfile
} from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Profile update validation
const profileUpdateValidation = [
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('profile_picture').optional().isURL().withMessage('Profile picture must be a valid URL')
];

// Get current user route
router.get('/me', authenticate, getCurrentUser);

// Update profile route
router.patch(
  '/me',
  authenticate,
  profileUpdateValidation,
  validateRequest,
  updateProfile
);

export default router;