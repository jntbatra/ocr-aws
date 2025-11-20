# Environment Variables Setup Guide

## Overview

This project now uses a centralized configuration system that loads all environment variables from a `.env` file. All secrets and configuration values are managed through environment variables, and **are never hardcoded** in the source code.

## Configuration Architecture

### Central Configuration File: `src/config.js`

All environment variables are loaded and exported through a single configuration file (`src/config.js`). This is the **only file** that accesses `process.env` directly.

**Key Features:**
- Loads `dotenv` automatically at startup
- Validates all required environment variables
- Exits with a clear error message if any required variables are missing
- Exports a clean configuration object used throughout the application
- Prevents runtime errors from missing environment variables

## Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# AWS Configuration
AWS_REGION=ap-south-1

# Cognito Configuration
COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_CLIENT_ID=your-cognito-client-id

# DynamoDB Configuration
TABLE_NAME=your-dynamodb-table-name

# S3 Configuration
UPLOAD_BUCKET=your-s3-bucket-name

# SNS Configuration
SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:123456789012:your-topic-name

# Application Configuration
PORT=3000

# JWT Configuration (optional - has default fallback)
JWT_SECRET=your-jwt-secret-key-change-in-production
```

## Setup Instructions

### 1. Copy the Template
```bash
cp .env.example .env
```

### 2. Fill in Your Values
Edit `.env` and replace all placeholder values with your actual AWS resources:
- `COGNITO_USER_POOL_ID`: From AWS Cognito console
- `COGNITO_CLIENT_ID`: From AWS Cognito app client settings
- `TABLE_NAME`: Your DynamoDB table name
- `UPLOAD_BUCKET`: Your S3 bucket name
- `SNS_TOPIC_ARN`: Your SNS topic ARN
- `AWS_REGION`: Your AWS region (default: ap-south-1)

### 3. Security Reminder
⚠️ **IMPORTANT**: The `.env` file is already in `.gitignore`. Never commit this file to version control!

## Files Modified

### 1. **server.js**
- **Before**: Imported and configured `dotenv` directly, used `process.env` directly
- **After**: Imports config module, uses `config.port`
- **Change**: Cleaner startup, centralized env loading

### 2. **src/config.js**
- **Before**: Conditional dotenv loading, minimal validation
- **After**: 
  - Loads dotenv at module level
  - Validates all required environment variables
  - Exits with error message if variables missing
  - Single source of truth for all configuration
- **Change**: More robust error handling and validation

### 3. **src/middleware/auth.js**
- **Before**: Used `config.region` and `config.cognitoUserPoolId` variables
- **After**: Uses `config.region` and `config.cognitoUserPoolId` directly from config object
- **Change**: Direct access to config properties

### 4. **src/handlers/auth.js**
- **Before**: Used local variables `clientId` and `userPoolId` (duplicating config values)
- **After**: Uses `config.cognitoClientId` and `config.cognitoUserPoolId` throughout all commands
- **Change**: No variable duplication, all references use config module

### 5. **src/handlers/getUploadUrl.js**
- **Before**: Uses `config.uploadBucket` and `config.region`
- **After**: Same (already using config correctly)
- **Change**: No changes needed - already compliant

### 6. **src/handlers/processReceipt.js**
- **Before**: Uses `config.uploadBucket`
- **After**: Same (already using config correctly)
- **Change**: No changes needed - already compliant

### 7. **src/handlers/monthlySummaryTrigger.js**
- **Before**: Uses `config.region` and `config.snsTopicArn`
- **After**: Same (already using config correctly)
- **Change**: No changes needed - already compliant

### 8. **src/utils/dynamo.js**
- **Before**: Uses `config.region` and `config.tableName`
- **After**: Same (already using config correctly)
- **Change**: No changes needed - already compliant

### 9. **src/utils/textract.js**
- **Before**: Uses `config.region`
- **After**: Same (already using config correctly)
- **Change**: No changes needed - already compliant

### 10. **.env.example**
- **Before**: Contained example values that looked like real credentials
- **After**: Clean template with placeholder values and comments explaining each variable
- **Change**: Better security practice and clearer setup instructions

## How It Works

1. **Startup Flow**:
   ```
   server.js starts
   ↓
   imports config.js
   ↓
   config.js loads dotenv
   ↓
   config.js validates environment variables
   ↓
   config.js exports configuration object
   ↓
   All modules import config and use it
   ```

2. **Configuration Access Pattern**:
   ```javascript
   import config from "../config.js";
   
   // ✓ CORRECT - Always use config object
   const region = config.region;
   const clientId = config.cognitoClientId;
   
   // ✗ WRONG - Never access process.env directly (except in config.js)
   const region = process.env.AWS_REGION;
   ```

## Security Practices Implemented

✅ **All environment variables are in `.env`**
- Secrets are never in code
- `.env` is in `.gitignore`
- Safe to commit repository

✅ **Centralized configuration in `config.js`**
- Single point where `process.env` is accessed
- Validation prevents undefined variables
- Clear error messages for missing configuration

✅ **No hardcoded secrets**
- No placeholder credentials in code
- No example real values
- Only `.env.example` shows structure

## Testing Your Setup

Run the server to verify all environment variables are loaded correctly:

```bash
npm start
```

You should see:
```
express and cors imported
auth middleware imported
✓ Config loaded successfully from environment variables
Server successfully listening on port 3000
```

If any required environment variables are missing, you'll see:
```
Missing required environment variables: COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, ...
Please check your .env file and ensure all required variables are set.
```

## Environment-Specific Setup

### Development
Use `.env` with development AWS resources

### Production
Use `.env` with production AWS resources (preferably set via deployment system)

### CI/CD
Set environment variables through your CI/CD platform:
- GitHub Actions: Secrets
- AWS Lambda: Environment Variables
- Docker: Environment variables in container definition

## Troubleshooting

### Error: "Missing required environment variables"
- Ensure `.env` file exists in the `backend` directory
- Check that all variables from `.env.example` are set in your `.env`
- Verify no typos in variable names

### Error: "ENOENT: no such file or directory, open '.env'"
- Create `.env` file from `.env.example`
- Ensure it's in the correct directory (`backend/`)

### AWS SDK errors with undefined credentials
- Verify environment variables are correctly set in `.env`
- Ensure AWS credentials/IAM role is properly configured for the container/server

## Best Practices

1. **Always use the config module** for accessing configuration values
2. **Never commit `.env`** files to version control
3. **Use `.env.example`** as a template for documentation
4. **Set all variables** before starting the application
5. **Different values for different environments** (dev, staging, prod)
6. **Rotate secrets regularly** in production environments
