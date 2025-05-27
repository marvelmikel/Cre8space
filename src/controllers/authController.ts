import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import passport from 'passport';

import { 
  registerUser, 
  loginUser, 
  createAuthResponse, 
  refreshAccessToken,
  logoutUser
} from '../services/authService';
import { findUserByEmail } from '../services/userService';
import { logger } from '../utils/logger';

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Create user
    const user = await registerUser({
      id: uuidv4(),
      email,
      password,
      first_name,
      last_name
    });
    
    // Generate auth response
    const authResponse = await createAuthResponse(user);
    
    res.status(201).json({
      status: 'success',
      data: authResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user with email and password
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Authenticate user
    const user = await loginUser(email, password);
    
    // Generate auth response
    const authResponse = await createAuthResponse(user);
    
    res.status(200).json({
      status: 'success',
      data: authResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
      return;
    }
    
    // Refresh token
    const tokens = await refreshAccessToken(refreshToken);
    
    res.status(200).json({
      status: 'success',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
      return;
    }
    
    // Logout user
    await logoutUser(refreshToken);
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth login
 */
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email']
});

/**
 * Google OAuth callback
 */
export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('google', async (err: any, user: any) => {
    try {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }
      
      // Generate auth response
      const authResponse = await createAuthResponse(user);
      
      // Redirect with tokens
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/success`);
      redirectUrl.searchParams.append('accessToken', authResponse.accessToken);
      redirectUrl.searchParams.append('refreshToken', authResponse.refreshToken);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  })(req, res, next);
};

/**
 * Facebook OAuth login
 */
export const facebookLogin = passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
});

/**
 * Facebook OAuth callback
 */
export const facebookCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('facebook', async (err: any, user: any) => {
    try {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }
      
      // Generate auth response
      const authResponse = await createAuthResponse(user);
      
      // Redirect with tokens
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/success`);
      redirectUrl.searchParams.append('accessToken', authResponse.accessToken);
      redirectUrl.searchParams.append('refreshToken', authResponse.refreshToken);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Facebook callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  })(req, res, next);
};

/**
 * LinkedIn OAuth login
 */
export const linkedinLogin = passport.authenticate('linkedin');

/**
 * LinkedIn OAuth callback
 */
export const linkedinCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('linkedin', async (err: any, user: any) => {
    try {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }
      
      // Generate auth response
      const authResponse = await createAuthResponse(user);
      
      // Redirect with tokens
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/success`);
      redirectUrl.searchParams.append('accessToken', authResponse.accessToken);
      redirectUrl.searchParams.append('refreshToken', authResponse.refreshToken);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('LinkedIn callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  })(req, res, next);
};