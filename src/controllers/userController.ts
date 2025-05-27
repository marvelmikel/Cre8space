import { Request, Response, NextFunction } from 'express';
import {
  findUserById,
  getUserWithSocialAccounts,
  updateUserProfile,
  linkSocialAccount
} from '../services/userService';
import { logger } from '../utils/logger';

/**
 * Get current user profile
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    const user = await getUserWithSocialAccounts(userId);
    
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    const { first_name, last_name, profile_picture } = req.body;
    
    const updatedUser = await updateUserProfile(userId, {
      first_name,
      last_name,
      profile_picture
    });
    
    if (!updatedUser) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    next(error);
  }
};