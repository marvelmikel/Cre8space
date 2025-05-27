# OAuth 2.0 Authentication API

A secure and scalable authentication API built with Node.js, TypeScript, and MySQL, featuring OAuth 2.0 social login integration with Google, Facebook, and LinkedIn.

## Features

- 🔐 OAuth 2.0 Social Authentication
  - Google
  - Facebook
  - LinkedIn
- 👤 Local Authentication (Email/Password)
- 🎫 JWT-based Authentication
- 🔄 Token Refresh Mechanism
- 📦 TypeScript Support
- 🛡️ Security Features
  - Password Hashing
  - Rate Limiting
  - CORS Protection
  - HTTP Security Headers

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your configurations:
   - Database credentials
   - JWT secrets
   - OAuth client credentials
   - Port and environment settings

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the development server
npm run dev
```

## API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Social Authentication

```
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/facebook
GET /api/auth/facebook/callback
GET /api/auth/linkedin
GET /api/auth/linkedin/callback
```

### User Management

```
GET /api/users/me
PATCH /api/users/me
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_picture VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Social Accounts Table
```sql
CREATE TABLE social_accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  provider_access_token TEXT,
  provider_refresh_token TEXT,
  provider_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_account (user_id, provider)
)
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **Rate Limiting**: Prevents brute force attacks
- **JWT Authentication**: Secure token-based authentication
- **HTTP Security Headers**: Implemented using Helmet
- **Input Validation**: Request validation using express-validator
- **CORS Protection**: Configurable CORS settings
- **Error Handling**: Centralized error handling with proper status codes

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint
```

## Error Handling

The API uses a consistent error response format:

```json
{
  "status": "error",
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Success Response Format

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.