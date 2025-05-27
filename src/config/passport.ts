import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { v4 as uuidv4 } from 'uuid';

import { findUserBySocialId, createUserWithSocialAccount } from '../services/userService';
import { logger } from '../utils/logger';

export const configurePassport = (): void => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await findUserBySocialId('google', profile.id);
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const newUser = await createUserWithSocialAccount({
          id: uuidv4(),
          email,
          first_name: profile.name?.givenName || '',
          last_name: profile.name?.familyName || '',
          profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        }, {
          provider: 'google',
          providerId: profile.id,
          accessToken,
          refreshToken: refreshToken || ''
        });
        
        return done(null, newUser);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error as Error, undefined);
      }
    }));
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await findUserBySocialId('facebook', profile.id);
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const newUser = await createUserWithSocialAccount({
          id: uuidv4(),
          email,
          first_name: profile.name?.givenName || '',
          last_name: profile.name?.familyName || '',
          profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        }, {
          provider: 'facebook',
          providerId: profile.id,
          accessToken,
          refreshToken: refreshToken || ''
        });
        
        return done(null, newUser);
      } catch (error) {
        logger.error('Facebook OAuth error:', error);
        return done(error as Error, undefined);
      }
    }));
  }

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await findUserBySocialId('linkedin', profile.id);
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const newUser = await createUserWithSocialAccount({
          id: uuidv4(),
          email,
          first_name: profile.name?.givenName || '',
          last_name: profile.name?.familyName || '',
          profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        }, {
          provider: 'linkedin',
          providerId: profile.id,
          accessToken,
          refreshToken: refreshToken || ''
        });
        
        return done(null, newUser);
      } catch (error) {
        logger.error('LinkedIn OAuth error:', error);
        return done(error as Error, undefined);
      }
    }));
  }
};