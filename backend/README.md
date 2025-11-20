# Expense Tracker Backend

This is a Node.js/Express backend for manual expense tracking with AWS Cognito authentication and DynamoDB storage.

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS Account with Cognito and DynamoDB setup
- Git

## Installation

```bash
cd backend
npm install
```

## Environment Setup

Create a `.env` file in the backend directory:

```env
AWS_REGION=ap-south-1
PORT=3001
TABLE_NAME=expense-tracker-stack-ExpenseTable-13LXOU42545ZU
COGNITO_USER_POOL_ID=ap-south-1_zUGYPTrrl
COGNITO_CLIENT_ID=7hi1vuqmgmh4e6v45d5u9hkevt
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Running the Server

```bash
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Authentication (Public)

- `POST /auth/signup` - Register new user

  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }
  ```

- `POST /auth/confirm` - Confirm email signup

  ```json
  {
    "username": "testuser",
    "confirmationCode": "123456"
  }
  ```

- `POST /auth/login` - Login user
  ```json
  {
    "username": "test@example.com",
    "password": "Password123!"
  }
  ```
  Returns: `{ accessToken, refreshToken, idToken, expiresIn }`

### Expenses (Protected - requires Bearer token)

- `GET /expenses` - Get all user expenses

- `POST /expenses` - Create new expense

  ```json
  {
    "amount": 50.0,
    "category": "Food",
    "description": "Lunch",
    "date": "2025-11-21"
  }
  ```

- `GET /summary?month=2025-11` - Get monthly expense summary

### Health Check

- `GET /health` - Check server status

## Architecture

- **Authentication**: AWS Cognito User Pools
- **Database**: DynamoDB with user-scoped data
- **Framework**: Express.js
- **Runtime**: Node.js

## Security Features

- JWT authentication with Cognito
- User-scoped data isolation (each user only sees their expenses)
- Bearer token validation on protected endpoints
- Environment-based configuration

## Postman Collection

Import `expense-tracker.postman_collection.json` to test all endpoints in Postman.

**Variables to set:**

- `base_url`: http://localhost:3001
- `accessToken`: (auto-saved after login)

## Deployment

The backend can be deployed to:

- Heroku
- AWS Lambda
- EC2
- Docker containers
- Any Node.js hosting platform
