Cre8space
# TypeScript Node.js API with MySQL and JWT Authentication

A production-ready RESTful API built with TypeScript, Node.js, Express, and MySQL with JWT authentication.

## Features

- User registration and login with JWT authentication
- Protected API endpoints requiring valid JWT tokens
- MySQL database integration with connection pooling
- Docker and Docker Compose setup for easy development and deployment
- Environment-based configuration management
- Request validation and sanitization
- Error handling with consistent response format
- Database migrations for version control

## Project Structure

The project follows a clean architecture pattern with separation of concerns:

```
src/
├── config/           # Configuration settings
├── controllers/      # Route handlers
├── database/         # Database setup and migrations
├── middlewares/      # Express middlewares
├── models/           # Data models
├── routes/           # API routes
├── services/         # Business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── app.ts            # Express application setup
```

## Getting Started

### Prerequisites

- Node.js 16+
- MySQL 8+
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

### Docker Setup

1. Create a `.env` file with the necessary environment variables
2. Run:

```bash
docker-compose up -d
```

## API Documentation

### Authentication

- **POST /api/v1/auth/register** - Register a new user
- **POST /api/v1/auth/login** - Login and get tokens
- **POST /api/v1/auth/refresh-token** - Refresh access token
- **POST /api/v1/auth/logout** - Logout and invalidate tokens

### User Management

- **GET /api/v1/users/me** - Get current user profile
- **PATCH /api/v1/users/me** - Update current user profile
- **PATCH /api/v1/users/change-password** - Change user password

## Security Features

- JWT authentication for API protection
- Password hashing with bcrypt
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Helmet for HTTP header security
- CORS protection

## Development

### Running Migrations

```bash
npm run migrate
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## License

This project is licensed under the MIT License