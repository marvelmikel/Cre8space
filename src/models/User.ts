export interface User {
  id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_id: string;
  provider_access_token: string;
  provider_refresh_token?: string;
  provider_token_expiry?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}

export interface UserWithSocialAccounts extends User {
  social_accounts?: SocialAccount[];
}

export interface NewUser {
  id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

export interface SocialAccountData {
  provider: string;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}