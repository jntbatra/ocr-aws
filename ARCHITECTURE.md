# Architecture: Environment Variables Flow

## Before Refactoring ❌

```
┌─────────────────────────────────────────────────────────────┐
│                    SCATTERED & UNSAFE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  server.js                                                   │
│  ├─ dotenv.config()                                          │
│  ├─ process.env.PORT                                         │
│  └─ Load routes                                              │
│                                                               │
│  src/config.js                                               │
│  ├─ Conditional dotenv loading                              │
│  ├─ Export config object                                    │
│  └─ Limited validation                                      │
│                                                               │
│  src/middleware/auth.js                                      │
│  ├─ Local variables: cognitoUserPoolId, region              │
│  └─ Access from config                                      │
│                                                               │
│  src/handlers/auth.js                                        │
│  ├─ Duplicate variables: userPoolId, clientId               │
│  ├─ Some hardcoded references                               │
│  └─ Inconsistent access patterns                            │
│                                                               │
│  Issues:                                                     │
│  • Multiple dotenv.config() calls                           │
│  • Direct process.env access in multiple files              │
│  • Duplicate variable definitions                           │
│  • No validation of required variables                      │
│  • Inconsistent patterns across codebase                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## After Refactoring ✅

```
┌─────────────────────────────────────────────────────────────┐
│                  CENTRALIZED & SECURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  .env (local, gitignored)                                   │
│  ├─ COGNITO_USER_POOL_ID=...                                │
│  ├─ COGNITO_CLIENT_ID=...                                   │
│  ├─ TABLE_NAME=...                                          │
│  ├─ UPLOAD_BUCKET=...                                       │
│  ├─ SNS_TOPIC_ARN=...                                       │
│  ├─ AWS_REGION=...                                          │
│  ├─ PORT=...                                                │
│  └─ JWT_SECRET=...                                          │
│                                                               │
│  src/config.js ⭐ SINGLE SOURCE OF TRUTH                     │
│  ├─ dotenv.config() - loads once                            │
│  ├─ Validates required variables                            │
│  ├─ Exports config object with all settings                │
│  └─ Fails fast with clear errors                            │
│                                                               │
│  All Other Files                                             │
│  ├─ import config from "../config.js"                       │
│  ├─ Use: config.tableName, config.cognitoClientId, etc.    │
│  ├─ NO direct process.env access                            │
│  └─ NO dotenv imports                                       │
│                                                               │
│  Benefits:                                                   │
│  ✓ Single dotenv loading                                    │
│  ✓ Centralized validation                                   │
│  ✓ Consistent access patterns                               │
│  ✓ No duplicate variables                                   │
│  ✓ Secrets never in source code                             │
│  ✓ Easy to debug configuration issues                       │
│  ✓ Clear error messages for missing config                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow During Startup

```
1. Application Start
   ↓
2. server.js runs
   ↓
3. import config from "./src/config.js"
   ↓
4. config.js executes:
   • dotenv.config() ← reads .env file
   • Validates all required variables
   • Creates config object
   • Exits if validation fails
   ↓
5. config object exported
   ├─ tableName
   ├─ uploadBucket
   ├─ snsTopicArn
   ├─ cognitoUserPoolId
   ├─ cognitoClientId
   ├─ region
   ├─ port
   └─ jwtSecret
   ↓
6. server.js continues with PORT = config.port
   ↓
7. Routes import their dependencies
   ↓
8. All handlers/middleware/utils
   └─ import config
   └─ Use config.variableName
   ↓
9. ✅ Application Running
```

## Configuration Access Pattern

```javascript
// ✅ CORRECT - How to access configuration values
import config from "../config.js";

// In any file, use:
const bucket = config.uploadBucket;
const region = config.region;
const poolId = config.cognitoUserPoolId;
```

```javascript
// ❌ WRONG - Never do this (except in config.js)
import dotenv from "dotenv";
dotenv.config();
const bucket = process.env.UPLOAD_BUCKET;

// ❌ WRONG - Don't create local variables
const BUCKET_NAME = config.uploadBucket;
// Use config.uploadBucket directly instead
```

## File Structure

```
backend/
├── .env                    ← Your secrets (gitignored)
├── .env.example           ← Template for setup
├── server.js              ← Uses config.port (no dotenv/process.env)
├── package.json
├── src/
│   ├── config.js          ⭐ ONLY file with process.env access
│   │                         Loads .env, validates, exports
│   │
│   ├── middleware/
│   │   └── auth.js        ← imports config, uses config.region
│   │
│   ├── handlers/
│   │   ├── auth.js        ← imports config, uses config.cognitoClientId
│   │   ├── getUploadUrl.js ← imports config, uses config.uploadBucket
│   │   ├── processReceipt.js ← imports config, uses config.uploadBucket
│   │   └── monthlySummaryTrigger.js ← imports config, uses config.snsTopicArn
│   │
│   └── utils/
│       ├── dynamo.js      ← imports config, uses config.tableName
│       ├── textract.js    ← imports config, uses config.region
│       └── response.js    ← No env vars needed
│
└── ENV_SETUP.md           ← Setup documentation
```

## Environment Variable Validation

```javascript
// config.js validates and ensures all these are set:
const requiredEnvVars = [
  "COGNITO_USER_POOL_ID",  // AWS Cognito User Pool ID
  "COGNITO_CLIENT_ID",      // AWS Cognito Client ID
  "TABLE_NAME",             // DynamoDB table name
  "UPLOAD_BUCKET",          // S3 bucket for receipt uploads
  "SNS_TOPIC_ARN",          // SNS topic for notifications
  "AWS_REGION",             // AWS region (ap-south-1, etc.)
];

// If any are missing → Clear error message → Exit

// Optional with defaults:
// - PORT (defaults to 3000)
// - JWT_SECRET (defaults to "your-secret-key-change-in-production")
```

## Security Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY MEASURES                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🔒 .env is in .gitignore                                   │
│    → Secrets never committed to version control              │
│                                                               │
│ 🔒 process.env only accessed in config.js                  │
│    → Single point of access for security audit               │
│    → Easy to review where secrets are used                   │
│                                                               │
│ 🔒 .env.example doesn't contain real values               │
│    → Safe to commit as documentation                         │
│    → Shows structure without exposing secrets                │
│                                                               │
│ 🔒 Validation prevents runtime errors                      │
│    → Missing config detected at startup                      │
│    → Clear error messages for troubleshooting                │
│    → No undefined variable crashes in production             │
│                                                               │
│ 🔒 No environment variables in error messages              │
│    → Config values never logged unnecessarily                │
│    → Reduces accidental secret exposure                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Environment-Specific Configuration

```
Development (.env)
├─ Uses development AWS resources
├─ Can have verbose logging
└─ Flexible settings

Production (Environment Variables)
├─ Uses production AWS resources
├─ Set through deployment platform
├─ Tightly controlled access
└─ Read-only in container

CI/CD
├─ GitHub Actions Secrets
├─ AWS Lambda Environment Variables
├─ Docker environment variables
└─ Deployment platform configuration
```
