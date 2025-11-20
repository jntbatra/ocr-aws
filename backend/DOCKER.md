# Expense Tracker Backend - Docker Deployment

This guide explains how to run the Expense Tracker Backend using Docker.

## Prerequisites

- Docker ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose ([Install Docker Compose](https://docs.docker.com/compose/install/))
- AWS Credentials (Access Key ID and Secret Access Key)

## Environment Variables

All environment variables are configured in `docker-compose.yml`. Before running, ensure you have the following:

### AWS Credentials

```bash
export AWS_ACCESS_KEY_ID=your-access-key-here
export AWS_SECRET_ACCESS_KEY=your-secret-key-here
```

### Or create a `.env` file in the backend directory:

```
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
```

See `.env.example` for all available environment variables.

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t expense-tracker-backend:latest .
```

### 2. Run with Docker Compose

```bash
# Using environment variables from system
docker-compose up -d

# Or using a .env file
docker-compose --env-file .env up -d
```

### 3. Check Status

```bash
# View logs
docker-compose logs -f expense-tracker-backend

# Check if container is running
docker-compose ps

# Test health endpoint
curl http://localhost:3001/health
```

### 4. Stop the Service

```bash
docker-compose down
```

## Detailed Environment Variables

| Variable                | Description          | Example                                            |
| ----------------------- | -------------------- | -------------------------------------------------- |
| `AWS_REGION`            | AWS Region           | `ap-south-1`                                       |
| `AWS_ACCESS_KEY_ID`     | AWS Access Key       | Your AWS Access Key                                |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key       | Your AWS Secret Key                                |
| `COGNITO_USER_POOL_ID`  | Cognito User Pool ID | `ap-south-1_zUGYPTrrl`                             |
| `COGNITO_CLIENT_ID`     | Cognito Client ID    | `7hi1vuqmgmh4e6v45d5u9hkevt`                       |
| `TABLE_NAME`            | DynamoDB Table Name  | `expense-tracker-stack-ExpenseTable-...`           |
| `UPLOAD_BUCKET`         | S3 Bucket Name       | `expense-tracker-receipts-496157869522-ap-south-1` |
| `SNS_TOPIC_ARN`         | SNS Topic ARN        | `arn:aws:sns:ap-south-1:...`                       |
| `JWT_SECRET`            | JWT Secret Key       | Your secret key                                    |
| `NODE_ENV`              | Node Environment     | `production` or `development`                      |
| `PORT`                  | Server Port          | `3001`                                             |

## Docker Commands

### Build Image

```bash
docker build -t expense-tracker-backend:latest .
```

### Run Container

```bash
docker run -d \
  -p 3001:3001 \
  -e AWS_REGION=ap-south-1 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  -e COGNITO_USER_POOL_ID=ap-south-1_zUGYPTrrl \
  -e COGNITO_CLIENT_ID=7hi1vuqmgmh4e6v45d5u9hkevt \
  -e TABLE_NAME=expense-tracker-stack-ExpenseTable-13LXOU425Z \
  -e UPLOAD_BUCKET=expense-tracker-receipts-496157869522-ap-south-1 \
  -e SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:496157869522:expense-tracker-summary \
  -e JWT_SECRET=your-jwt-secret \
  --name expense-tracker-backend \
  expense-tracker-backend:latest
```

### View Logs

```bash
docker logs -f expense-tracker-backend
```

### Stop Container

```bash
docker stop expense-tracker-backend
```

### Remove Container

```bash
docker rm expense-tracker-backend
```

## Health Check

The container includes a health check endpoint. Test it with:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{ "status": "ok" }
```

## Troubleshooting

### Container won't start

1. Check logs: `docker logs expense-tracker-backend`
2. Verify environment variables are set correctly
3. Ensure AWS credentials are valid

### Connection refused on port 3001

1. Verify port mapping: `docker-compose ps`
2. Check if another service is using port 3001
3. Ensure container is running: `docker-compose ps`

### AWS Credentials Error

1. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set
2. Check credentials have required permissions (Cognito, DynamoDB, S3, SNS)
3. Verify AWS_REGION is correct (ap-south-1)

## Production Deployment

For production, consider:

1. **Use AWS ECR instead of local Docker**

   ```bash
   docker tag expense-tracker-backend:latest [your-ecr-uri]/expense-tracker-backend:latest
   docker push [your-ecr-uri]/expense-tracker-backend:latest
   ```

2. **Use ECS, EKS, or other orchestration services**

3. **Secure environment variables with AWS Secrets Manager**

4. **Enable container logging with CloudWatch**

5. **Set resource limits in docker-compose.yml**:
   ```yaml
   services:
     expense-tracker-backend:
       deploy:
         resources:
           limits:
             cpus: "1"
             memory: 512M
           reservations:
             cpus: "0.5"
             memory: 256M
   ```

## API Endpoints

Once running, the backend exposes the following endpoints:

- `GET /health` - Health check
- `POST /auth/signup` - User signup
- `POST /auth/confirm` - Confirm account
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/confirm-forgot-password` - Reset password
- `POST /upload-url` - Get S3 upload URL (authenticated)
- `POST /process` - Process receipt with Textract (authenticated)
- `GET /expenses` - Get user expenses (authenticated)
- `POST /expenses` - Create expense (authenticated)
- `POST /save-expense` - Save OCR expense (authenticated)
- `GET /summary` - Get monthly summary (authenticated)
- `POST /trigger-summary` - Trigger summary notification (authenticated)

## Support

For issues or questions, refer to the main README.md in the backend directory.
