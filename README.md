# Backend API - Authentication & Authorization System

A robust, production-ready Node.js backend API built with Express.js, TypeScript, and Prisma. This project provides a complete authentication and authorization system with support for local authentication, OAuth (Google & GitHub), email verification, password reset, and role-based access control.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Authentication Flow](#-authentication-flow)
- [Security Features](#-security-features)
- [Error Handling](#-error-handling)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Authentication

- **Local Authentication**: Email/password registration and login
- **OAuth Integration**: Google and GitHub OAuth authentication
- **Email Verification**: Secure email verification system
- **Password Reset**: Forgot password and reset functionality
- **JWT-based Authentication**: Access tokens and refresh tokens
- **Cookie-based Sessions**: Secure HTTP-only cookies

### Security

- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet.js**: Security headers protection

### User Management

- **Role-Based Access Control (RBAC)**: Admin and User roles
- **User Profiles**: Name, email, profile image support
- **Account Status**: Active/inactive user management
- **Multi-Provider Support**: Local, Google, and GitHub providers

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js (Local, Google OAuth, GitHub OAuth)
- **Validation**: Zod
- **Email Service**: Resend
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/HazemSarhan/express-ts-prisma-starter.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-20-characters
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/oauth/github/callback

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL=noreply@yourdomain.com
```

### Getting OAuth Credentials

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs: `http://localhost:3001/api/v1/oauth/google/callback`

#### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3001/api/v1/oauth/github/callback`

#### Resend Email Service

1. Sign up at [Resend](https://resend.com/)
2. Get your API key from the dashboard
3. Verify your domain or use the test email

## 🗄 Database Setup

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Database Schema

The application uses the following main models:

- **User**: Stores user information, authentication details, and profile data
- **Tokens**: Manages refresh tokens for JWT authentication

## 📡 API Endpoints

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### Local Authentication

| Method | Endpoint                    | Description               | Auth Required |
| ------ | --------------------------- | ------------------------- | ------------- |
| POST   | `/auth/register`            | Register a new user       | No            |
| POST   | `/auth/login`               | Login with email/password | No            |
| POST   | `/auth/logout`              | Logout current user       | Yes           |
| GET    | `/auth/verify-email/:token` | Verify email address      | No            |
| POST   | `/auth/resend-verification` | Resend verification email | No            |
| POST   | `/auth/forgot-password`     | Request password reset    | No            |
| POST   | `/auth/reset-password`      | Reset password with token | No            |

#### OAuth Authentication

| Method | Endpoint                 | Description           | Auth Required |
| ------ | ------------------------ | --------------------- | ------------- |
| GET    | `/oauth/google`          | Initiate Google OAuth | No            |
| GET    | `/oauth/google/callback` | Google OAuth callback | No            |
| GET    | `/oauth/github`          | Initiate GitHub OAuth | No            |
| GET    | `/oauth/github/callback` | GitHub OAuth callback | No            |

### Request/Response Examples

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": false,
      "role": "USER",
      "provider": "LOCAL",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "role": "USER"
    }
  }
}
```

_Note: Access and refresh tokens are set as HTTP-only cookies_

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── configs/               # Configuration files
│   │   ├── cors.ts           # CORS configuration
│   │   ├── env.ts            # Environment variables validation
│   │   ├── helmet.ts         # Security headers
│   │   ├── passport.ts       # Passport configuration
│   │   ├── prisma.ts         # Prisma client instance
│   │   └── resend.ts         # Email service configuration
│   ├── core/                 # Core functionality
│   │   ├── errors/          # Custom error classes
│   │   ├── middleware/      # Express middlewares
│   │   │   ├── authentication.ts
│   │   │   ├── authorize-permission.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── not-found.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── validation.ts
│   │   └── utils/           # Utility functions
│   │       ├── email.ts
│   │       └── jwt.ts
│   ├── modules/              # Feature modules
│   │   └── auth/
│   │       ├── local/       # Local authentication
│   │       │   ├── auth-controller.ts
│   │       │   ├── auth-routes.ts
│   │       │   ├── auth-schema.ts
│   │       │   └── auth-service.ts
│   │       ├── oauth/       # OAuth authentication
│   │       │   ├── oauth-controller.ts
│   │       │   ├── oauth-routes.ts
│   │       │   └── oauth-service.ts
│   │       └── strategies/  # Passport strategies
│   │           ├── google-strategy.ts
│   │           └── github-strategy.ts
│   └── types/               # TypeScript type definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── dist/                    # Compiled JavaScript (generated)
├── .env                     # Environment variables (not in git)
├── .gitignore
├── nodemon.json             # Nodemon configuration
├── package.json
├── tsconfig.json            # TypeScript configuration
└── README.md
```

## 🔄 Authentication Flow

### Local Authentication Flow

1. **Registration**

   - User submits email, name, and password
   - Password is hashed with bcrypt
   - User is created with `emailVerified: false`
   - Verification email is sent
   - User receives success response

2. **Email Verification**

   - User clicks link in email
   - Token is validated
   - User's `emailVerified` is set to `true`
   - Access and refresh tokens are generated
   - User is automatically logged in

3. **Login**

   - User submits email and password
   - Credentials are validated
   - Access and refresh tokens are generated
   - Tokens are set as HTTP-only cookies
   - User data is returned

4. **Password Reset**
   - User requests password reset
   - Reset token is generated and saved
   - Reset email is sent
   - User clicks link and submits new password
   - Password is updated and token is invalidated

### OAuth Flow

1. **Initiate OAuth**

   - User clicks "Login with Google/GitHub"
   - Redirected to OAuth provider
   - User authorizes application

2. **OAuth Callback**
   - Provider redirects back with code
   - Code is exchanged for user profile
   - User is created/updated in database
   - Access and refresh tokens are generated
   - User is redirected to frontend with tokens

## 🔒 Security Features

### Password Requirements

- Minimum 6 characters
- Maximum 100 characters
- Must contain at least one letter
- Must contain at least one number
- Special characters allowed

### Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **Password reset**: 3 requests per hour
- **Email verification**: 5 requests per hour

### Token Management

- **Access Token**: Short-lived (1 hour in production, 7 days in development)
- **Refresh Token**: Long-lived (7 days in production, 30 days in development)
- Tokens stored in HTTP-only, signed cookies
- Refresh tokens stored in database with expiry

### Security Headers (Helmet.js)

- XSS Protection
- Content Security Policy
- Frame Options
- HSTS (in production)

## ⚠️ Error Handling

The API uses a centralized error handling system:

### Error Types

- `BadRequestError` (400): Invalid input or request
- `UnauthenticatedError` (401): Missing or invalid authentication
- `UnauthorizedError` (403): Insufficient permissions
- `NotFoundError` (404): Resource not found
- `TooManyRequests` (429): Rate limit exceeded
- `InternalServerError` (500): Server errors

### Error Response Format

```json
{
  "success": false,
  "status": 400,
  "message": "Error message here"
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

### Code Style

- TypeScript strict mode enabled
- ESLint recommended (if configured)
- Consistent naming conventions
- Modular architecture

## 🚢 Production Deployment

### Build Steps

1. **Install dependencies**

   ```bash
   npm ci
   ```

2. **Build TypeScript**

   ```bash
   npm run build
   ```

3. **Run database migrations**

   ```bash
   npx prisma migrate deploy
   ```

4. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **Start server**
   ```bash
   npm start
   ```

### Environment Variables for Production

Ensure all environment variables are set correctly:

- `NODE_ENV=production`
- Secure `JWT_SECRET` (minimum 20 characters)
- Valid database connection string
- Verified OAuth credentials
- Verified email domain in Resend

### Recommended Production Setup

- Use process manager (PM2, systemd)
- Enable HTTPS
- Set up reverse proxy (Nginx)
- Configure CORS for production domain
- Set up monitoring and logging
- Regular database backups

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ using TypeScript, Express.js, and Prisma**
