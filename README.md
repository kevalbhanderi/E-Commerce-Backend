# E-Commerce Backend API

A robust NestJS-based e-commerce backend system with role-based access control, JWT authentication, and end-to-end encryption support.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [API Usage Overview](#api-usage-overview)
- [Encryption/Decryption](#encryptiondecryption)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [API Documentation](#api-documentation)
- [Development](#development)

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin, Manager, and User roles
- 🔒 **End-to-End Encryption** - AES-256-GCM encryption for all API traffic
- 📦 **Category & Subcategory Management** - Hierarchical product organization
- 🛍️ **Product Management** - Full CRUD operations for products
- 👤 **User Management** - User registration, profile, and administration
- 📄 **Pagination** - Efficient data retrieval with pagination support
- 📚 **Swagger Documentation** - Interactive API documentation
- 🛡️ **Security** - Helmet, CORS, and input validation

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v5 or higher)
- **TypeScript** (v5 or higher)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-com-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the required environment variables (see [Environment Variables](#environment-variables) section below).

### 4. Database Setup

Ensure MongoDB is running and accessible. The application will automatically connect using the MongoDB connection string from your `.env` file.

### 5. Run Database Seeders (Optional)

If you need to create a default admin user, run the seeder:

```bash
npm run start:dev
# The admin seeder runs automatically on application start
```

### 6. Start the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The application will start on `http://localhost:7000` (or the port specified in your `.env` file).

### 7. Access Swagger Documentation

Once the application is running, visit:
```
http://localhost:7000/api
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Sample .env File

```env
# Server Configuration
PORT=7000

# MongoDB Configuration
MONGO_URL=localhost:27017
MONGO_USER=your_mongo_username
MONGO_PASS=your_mongo_password
MONGO_DB=ecommerce_db
MONGO_AUTH_DB=admin

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRED_TIME=24h

# Encryption Configuration
# Generate a secure key using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_key_here
# Enable/Disable encryption for all API requests and responses
ENABLE_ENCRYPTION=true

# Default Admin User (Optional - for seeding)
DEFAULT_ADMIN_EMAIL=admin_email
DEFAULT_ADMIN_PASSWORD=admin_password
DEFAULT_ADMIN_NAME=admin_user

# Link Token Secret (Optional - falls back to JWT_SECRET)
LINK_TOKEN_SECRET=your_link_token_secret
```

### Environment Variables Description

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | `7000` |
| `MONGO_URL` | MongoDB connection URL (host:port) | Yes | - |
| `MONGO_USER` | MongoDB username | Yes | - |
| `MONGO_PASS` | MongoDB password | Yes | - |
| `MONGO_DB` | MongoDB database name | Yes | - |
| `MONGO_AUTH_DB` | MongoDB authentication database | Yes | - |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `JWT_EXPIRED_TIME` | JWT token expiration time | No | `24h` |
| `ENCRYPTION_KEY` | AES-256 encryption key (64 hex characters) | Yes* | - |
| `ENABLE_ENCRYPTION` | Enable/disable API encryption | No | `false` |
| `DEFAULT_ADMIN_EMAIL` | Default admin email for seeding | No | `admin@gmail.com` |
| `DEFAULT_ADMIN_PASSWORD` | Default admin password for seeding | No | `Admin@123` |
| `DEFAULT_ADMIN_NAME` | Default admin name for seeding | No | `Admin User` |
| `LINK_TOKEN_SECRET` | Secret for link token generation | No | Uses `JWT_SECRET` |

\* Required only if `ENABLE_ENCRYPTION=true`

### Generating Encryption Key

To generate a secure 64-character hexadecimal encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as your `ENCRYPTION_KEY` in the `.env` file.

## API Usage Overview

### Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:7000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
x-access-token: <your_jwt_token>
```

### API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/register` | Register a new user | No |
| `POST` | `/api/login` | Login (user or admin) | No |

#### Profile

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/profile/:userId?` | Get user profile | Yes | All |

**Note:** Regular users can only view their own profile. Admins can view any user's profile.

#### Users

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/users` | Get all users (paginated) | Yes | Admin |
| `PUT` | `/api/users/:userId` | Update user | Yes | User (own), Admin (role only) |
| `DELETE` | `/api/users/:userId` | Delete user | Yes | Admin |

**Update User Rules:**
- Regular users can only update their own `email`, `firstName`, and `lastName`
- Admins can only update a user's `role` (to `manager`)

#### Categories

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/category` | Create category | Yes | Admin |
| `GET` | `/api/category` | Get all categories (paginated) | Yes | All |
| `GET` | `/api/category/:categoryId` | Get category by ID | Yes | All |
| `PUT` | `/api/category/:categoryId` | Update category | Yes | Admin |
| `DELETE` | `/api/category/:categoryId` | Delete category | Yes | Admin |

**Query Parameters for GET `/api/category`:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isActive` (optional): Filter by active status (`true` or `false`)

#### Subcategories

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/sub-category` | Create subcategory | Yes | Admin |
| `GET` | `/api/sub-category` | Get all subcategories (paginated) | Yes | All |
| `GET` | `/api/sub-category/:subCategoryId` | Get subcategory by ID | Yes | All |
| `PUT` | `/api/sub-category/:subCategoryId` | Update subcategory | Yes | Admin |
| `DELETE` | `/api/sub-category/:subCategoryId` | Delete subcategory | Yes | Admin |

**Query Parameters for GET `/api/sub-category`:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isActive` (optional): Filter by active status (`true` or `false`)
- `categoryId` (optional): Filter by category ID

#### Products

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/product` | Create product | Yes | Admin |
| `GET` | `/api/product` | Get all products (paginated) | Yes | All |
| `GET` | `/api/product/:productId` | Get product by ID | Yes | All |
| `PUT` | `/api/product/:productId` | Update product | Yes | Admin |
| `DELETE` | `/api/product/:productId` | Delete product | Yes | Admin |

**Query Parameters for GET `/api/product`:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isActive` (optional): Filter by active status (`true` or `false`)
- `categoryId` (optional): Filter by category ID
- `subCategoryId` (optional): Filter by subcategory ID

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "isError": false,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "isError": true,
  "message": "Error message",
  "data": {}
}
```

## Encryption/Decryption

The application supports end-to-end encryption for all API requests and responses using **AES-256-GCM** encryption.

### Enabling Encryption

Set `ENABLE_ENCRYPTION=true` in your `.env` file and provide a valid `ENCRYPTION_KEY`.

### How It Works

#### Request Flow

1. **Client encrypts** the request body using AES-256-GCM
2. **Client sends** encrypted payload in the following format:
   ```json
   {
     "encrypted": "base64_encrypted_data",
     "iv": "base64_initialization_vector",
     "tag": "base64_authentication_tag"
   }
   ```
3. **Server automatically decrypts** the request body
4. **Controller processes** the decrypted data normally

#### Response Flow

1. **Controller returns** normal response data
2. **Server automatically encrypts** the response
3. **Client receives** encrypted payload
4. **Client decrypts** the response

### Client Implementation

#### Encrypting Requests (Node.js)

```javascript
const crypto = require('crypto');

function encryptData(data, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  
  // Convert key to buffer
  let keyBuffer;
  if (key.length === 64) {
    keyBuffer = Buffer.from(key, 'hex');
  } else if (key.length === 32) {
    keyBuffer = Buffer.from(key);
  } else {
    keyBuffer = crypto.createHash('sha256').update(key).digest();
  }
  
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

// Usage
const payload = { email: 'user@example.com', password: 'password123' };
const encrypted = encryptData(payload, process.env.ENCRYPTION_KEY);
```

#### Decrypting Responses (Node.js)

```javascript
function decryptData(payload, key) {
  const algorithm = 'aes-256-gcm';
  
  // Convert key to buffer
  let keyBuffer;
  if (key.length === 64) {
    keyBuffer = Buffer.from(key, 'hex');
  } else if (key.length === 32) {
    keyBuffer = Buffer.from(key);
  } else {
    keyBuffer = crypto.createHash('sha256').update(key).digest();
  }
  
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const encrypted = Buffer.from(payload.encrypted, 'base64');
  
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

// Usage
const decrypted = decryptData(encryptedResponse, process.env.ENCRYPTION_KEY);
```

### Security Notes

1. **Key Management**: Never commit encryption keys to version control
2. **Key Rotation**: Rotate encryption keys periodically in production
3. **HTTPS**: Always use HTTPS in production to protect encrypted payloads in transit
4. **Key Storage**: Store encryption keys securely (use secret management services in production)

### Testing with Encryption

When encryption is enabled, you'll need to encrypt request payloads before sending them. For testing through Swagger or Postman:

1. Encrypt your request body using the encryption functions above
2. Send the encrypted payload in the format shown above
3. Decrypt the response using the decryption function

**Note:** Swagger UI does not automatically encrypt/decrypt payloads. You'll need to handle encryption manually or use a custom client.

## Authentication

### Registration

Register a new user account:

```bash
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login

Login with user or admin credentials:

```bash
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "isError": false,
  "message": "Login successful",
  "data": {
    "userId": "user_id_here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

Use the `token` from the response in the `x-access-token` header for authenticated requests.

## Role-Based Access Control

The system supports three roles:

- **USER**: Regular user with limited permissions
- **MANAGER**: Manager with elevated permissions
- **ADMIN**: Administrator with full system access

### Role Permissions Summary

| Action | USER | MANAGER | ADMIN |
|--------|------|---------|-------|
| View own profile | ✅ | ✅ | ✅ |
| View any profile | ❌ | ❌ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| Update user role | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Create categories | ❌ | ❌ | ✅ |
| Update categories | ❌ | ❌ | ✅ |
| Delete categories | ❌ | ❌ | ✅ |
| View categories | ✅ | ✅ | ✅ |
| Create subcategories | ❌ | ❌ | ✅ |
| Update subcategories | ❌ | ❌ | ✅ |
| Delete subcategories | ❌ | ❌ | ✅ |
| View subcategories | ✅ | ✅ | ✅ |
| Create products | ❌ | ❌ | ✅ |
| Update products | ❌ | ❌ | ✅ |
| Delete products | ❌ | ❌ | ✅ |
| View products | ✅ | ✅ | ✅ |

## API Documentation

Interactive API documentation is available via Swagger UI:

```
http://localhost:7000/api
```

The Swagger interface provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication support

**Note:** When encryption is enabled, you'll need to manually encrypt request payloads for Swagger testing.

## Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start in watch mode
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build for production
npm run start:prod     # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Project Structure

```
src/
├── decorators/          # Custom decorators (Roles, User)
├── dispatchers/         # Exception filters
├── database/            # Database configuration
├── enums/               # Enumerations (Role)
├── guard/               # Guards (Auth, Roles)
├── interceptors/        # Interceptors (Encryption, Decryption)
├── interface/           # TypeScript interfaces
├── modules/             # Feature modules
│   ├── auth/           # Authentication (login, register)
│   ├── profile/        # User profile
│   ├── users/          # User management
│   ├── category/       # Category management
│   ├── sub-category/   # Subcategory management
│   ├── product/        # Product management
│   └── mongo/          # MongoDB service layer
├── utils/              # Utility functions
├── validations/        # Validation pipes
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

### Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is private and unlicensed.

## Support

For issues and questions, please contact the development team or create an issue in the repository.
