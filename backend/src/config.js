// Ensure dotenv is loaded first - this MUST be loaded before any other imports
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID",
  "TABLE_NAME",
  "UPLOAD_BUCKET",
  "SNS_TOPIC_ARN",
  "AWS_REGION",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error(
    "Please check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

export default {
  // AWS Resources from environment variables (required)
  tableName: process.env.TABLE_NAME,
  uploadBucket: process.env.UPLOAD_BUCKET,
  snsTopicArn: process.env.SNS_TOPIC_ARN,
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.COGNITO_CLIENT_ID,
  region: process.env.AWS_REGION,

  // Application settings
  port: process.env.PORT || 3000,

  // JWT settings
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
};

console.log("✓ Config loaded successfully from environment variables");
