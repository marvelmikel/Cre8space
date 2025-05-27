import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { executeQuery } from '../config/database';
import { User, NewUser, AuthResponse, RefreshToken } from '../models/User';
import { findUserByEmail, createUser, findUserById } from './userService';
import { logger } from '../utils/logger';

/**
 * Register a new user with email and password
 */
export const registerUser = async (userData: NewUser): Promise<User> => {
  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create the user
    return await createUser(userData);
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

/**
 * Authenticate a user with email and password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check if user has a password (might be social login only)
    if (!user.password) {
      throw new Error('This account doesn\'t have a password. Please use social login');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    return user;
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Generate JWT tokens for a user
 */
export const generateTokens = async (
  user: User
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const payload = {
      sub: user.id,
      email: user.email
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    // Generate access token
    const accessToken = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '1h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      jwtSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
    );
    
    // Store refresh token in database
    const tokenId = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    
    await executeQuery(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [tokenId, user.id, refreshToken, expiryDate]
    );
    
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Token generation error:', error);
    throw error;
  }
};

/**
 * Create auth response with user data and tokens
 */
export const createAuthResponse = async (user: User): Promise<AuthResponse> => {
  try {
    const tokens = await generateTokens(user);
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      ...tokens
    };
  } catch (error) {
    logger.error('Auth response creation error:', error);
    throw error;
  }
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    logger.error('Token verification error:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if token exists and is not revoked
    const tokens = await executeQuery<RefreshToken[]>(
      `SELECT * FROM refresh_tokens 
       WHERE token = ? AND revoked = false AND expires_at > NOW()`,
      [refreshToken]
    );
    
    if (tokens.length === 0) {
      throw new Error('Invalid refresh token');
    }
    
    // Get user
    const user = await findUserById(decoded.sub);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Revoke old refresh token
    await executeQuery(
      `UPDATE refresh_tokens SET revoked = true WHERE token = ?`,
      [refreshToken]
    );
    
    // Generate new tokens
    return await generateTokens(user);
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Logout user (revoke refresh token)
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    await executeQuery(
      `UPDATE refresh_tokens SET revoked = true WHERE token = ?`,
      [refreshToken]
    );
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};