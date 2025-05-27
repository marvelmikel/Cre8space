import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../config/database';
import { User, NewUser, SocialAccountData, UserWithSocialAccounts } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Find a user by ID
 */
export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const users = await executeQuery<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    logger.error('Error finding user by ID:', error);
    throw error;
  }
};

/**
 * Find a user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const users = await executeQuery<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    logger.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * Find a user by social provider ID
 */
export const findUserBySocialId = async (
  provider: string,
  providerId: string
): Promise<User | null> => {
  try {
    const users = await executeQuery<User[]>(
      `SELECT u.* FROM users u
       JOIN social_accounts sa ON u.id = sa.user_id
       WHERE sa.provider = ? AND sa.provider_id = ?`,
      [provider, providerId]
    );
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    logger.error('Error finding user by social ID:', error);
    throw error;
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: NewUser): Promise<User> => {
  try {
    // Hash password if provided
    let hashedPassword = null;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12);
    }
    
    await executeQuery(
      `INSERT INTO users (id, email, password, first_name, last_name, profile_picture)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.id,
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        userData.profile_picture || null
      ]
    );
    
    const user = await findUserById(userData.id);
    if (!user) {
      throw new Error('Failed to create user');
    }
    
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Create a social account for a user
 */
export const createSocialAccount = async (
  userId: string,
  socialData: SocialAccountData
): Promise<void> => {
  try {
    const id = uuidv4();
    
    await executeQuery(
      `INSERT INTO social_accounts (
        id, user_id, provider, provider_id, 
        provider_access_token, provider_refresh_token,
        provider_token_expiry
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        socialData.provider,
        socialData.providerId,
        socialData.accessToken,
        socialData.refreshToken || null,
        socialData.tokenExpiry || null
      ]
    );
  } catch (error) {
    logger.error('Error creating social account:', error);
    throw error;
  }
};

/**
 * Create a user with a social account
 */
export const createUserWithSocialAccount = async (
  userData: NewUser,
  socialData: SocialAccountData
): Promise<User> => {
  try {
    // Create user
    const user = await createUser(userData);
    
    // Create social account
    await createSocialAccount(user.id, socialData);
    
    return user;
  } catch (error) {
    logger.error('Error creating user with social account:', error);
    throw error;
  }
};

/**
 * Get user with their social accounts
 */
export const getUserWithSocialAccounts = async (
  userId: string
): Promise<UserWithSocialAccounts | null> => {
  try {
    const users = await executeQuery<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    
    const socialAccounts = await executeQuery<any[]>(
      `SELECT * FROM social_accounts WHERE user_id = ?`,
      [userId]
    );
    
    return {
      ...user,
      social_accounts: socialAccounts
    };
  } catch (error) {
    logger.error('Error getting user with social accounts:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  try {
    // Remove fields that shouldn't be updated
    const { id, created_at, updated_at, password, ...validUpdates } = updates;
    
    // Build the SQL query dynamically
    const fields = Object.keys(validUpdates);
    if (fields.length === 0) {
      return await findUserById(userId);
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(validUpdates), userId];
    
    await executeQuery(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );
    
    return await findUserById(userId);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Link a new social account to an existing user
 */
export const linkSocialAccount = async (
  userId: string,
  socialData: SocialAccountData
): Promise<void> => {
  try {
    // Check if this social account is already linked to any user
    const existingUser = await findUserBySocialId(
      socialData.provider,
      socialData.providerId
    );
    
    if (existingUser && existingUser.id !== userId) {
      throw new Error('This social account is already linked to another user');
    }
    
    // Create the social account link
    await createSocialAccount(userId, socialData);
  } catch (error) {
    logger.error('Error linking social account:', error);
    throw error;
  }
};