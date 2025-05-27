import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refresh,
  logout,
  googleLogin,
  googleCallback,
  facebookLogin,
  facebookCallback,
  linkedinLogin,
  linkedinCallback
} from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Register validation
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required')
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register route
router.post('/register', registerValidation, validateRequest, register);

// Login route
router.post('/login', loginValidation, validateRequest, login);

// Refresh token route
router.post('/refresh', refresh);

// Logout route
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Facebook OAuth routes
router.get('/facebook', facebookLogin);
router.get('/facebook/callback', facebookCallback);

// LinkedIn OAuth routes
router.get('/linkedin', linkedinLogin);
router.get('/linkedin/callback', linkedinCallback);

export default router;