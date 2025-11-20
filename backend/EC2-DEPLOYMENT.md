# EC2 Deployment Guide

## Quick Start on EC2

### Prerequisites

- Ubuntu 20.04 or 22.04 EC2 instance
- SSH access to the instance
- Your AWS credentials

### Step-by-Step Deployment

#### 1. Connect to your EC2 instance

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

#### 2. Run the automated deployment script

```bash
# Download the script
curl -O https://raw.githubusercontent.com/your-repo/backend/deploy-ec2.sh

# Make it executable
chmod +x deploy-ec2.sh

# Run it
./deploy-ec2.sh
```

#### 3. Clone your repository

```bash
git clone <your-repo-url>
cd ocr+aws/backend
```

#### 4. Create environment file

```bash
# Option 1: Using nano editor
nano .env

# Option 2: Using cat
cat > .env << 'EOF'
TABLE_NAME=expense-tracker-stack-ExpenseTable-13LXOU42545ZU
UPLOAD_BUCKET=expense-tracker-receipts-496157869522-ap-south-1
SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:496157869522:monthly-expense-summary
COGNITO_USER_POOL_ID=ap-south-1_zUGYPTrrl
COGNITO_CLIENT_ID=7hi1vuqmgmh4e6v45d5u9hkevt
PORT=3001
JWT_SECRET=your-production-secret-key
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXHBKQIXJPG3XU2VU
AWS_SECRET_ACCESS_KEY=0IlgMyoEzTvs1LkbB2dczmHNZXZw4ZPw5pE39ONz
EOF
```

#### 5. Start the backend

```bash
# Build and start
docker-compose up -d

# Or just start if already built
docker-compose start
```

#### 6. Monitor the deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f expense-tracker-backend

# Test health endpoint
curl http://localhost:3001/health
```

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop the backend
docker-compose stop

# Restart the backend
docker-compose restart

# Remove and rebuild
docker-compose down
docker-compose up -d --build

# Shell into container
docker-compose exec expense-tracker-backend sh

# View resource usage
docker stats

# Prune unused Docker resources
docker system prune -a
```

### EC2 Security Group Configuration

Make sure your security group allows:

- **Inbound**: Port 3001 (TCP) from your frontend or 0.0.0.0/0
- **Outbound**: All traffic (for AWS API calls)

```
Inbound Rules:
- Type: Custom TCP Rule
- Protocol: TCP
- Port Range: 3001
- Source: 0.0.0.0/0 (or your frontend IP)
```

### Environment Variables Reference

| Variable              | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| TABLE_NAME            | `expense-tracker-stack-ExpenseTable-13LXOU42545ZU`            |
| UPLOAD_BUCKET         | `expense-tracker-receipts-496157869522-ap-south-1`            |
| SNS_TOPIC_ARN         | `arn:aws:sns:ap-south-1:496157869522:monthly-expense-summary` |
| COGNITO_USER_POOL_ID  | `ap-south-1_zUGYPTrrl`                                        |
| COGNITO_CLIENT_ID     | `7hi1vuqmgmh4e6v45d5u9hkevt`                                  |
| AWS_REGION            | `ap-south-1`                                                  |
| AWS_ACCESS_KEY_ID     | Your AWS access key                                           |
| AWS_SECRET_ACCESS_KEY | Your AWS secret key                                           |
| JWT_SECRET            | Your JWT secret (keep secure!)                                |
| PORT                  | `3001`                                                        |

### Troubleshooting

**Container won't start**

```bash
docker-compose logs expense-tracker-backend
```

**Port already in use**

```bash
# Change port in docker-compose.yml
# Or kill the process using port 3001
sudo lsof -i :3001
sudo kill -9 <PID>
```

**AWS credentials error**

```bash
# Verify credentials in .env
cat .env

# Test AWS access
aws s3 ls --region ap-south-1
```

**Permission denied**

```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Then log out and log back in
```

### Monitoring & Maintenance

**Check disk usage**

```bash
df -h
docker system df
```

**Update container**

```bash
docker-compose pull
docker-compose up -d
```

**Backup data**

```bash
# DynamoDB is managed by AWS, no backup needed
# S3 is managed by AWS, no backup needed
```

### Production Best Practices

1. **Use environment variables** for sensitive data
2. **Enable CloudWatch logs** for container monitoring
3. **Set up auto-restart** with `restart: unless-stopped`
4. **Configure health checks** (already done in docker-compose.yml)
5. **Use AWS IAM roles** instead of access keys (preferred)
6. **Enable VPC security groups** for network isolation
7. **Set up CloudFront** for API caching (optional)
8. **Enable WAF** for DDoS protection (optional)

### Next Steps

1. **Deploy Frontend** - Point to `http://your-ec2-ip:3001`
2. **Set up Route 53** - Create DNS records
3. **Enable HTTPS** - Use AWS Certificate Manager
4. **Set up Auto Scaling** - Use ECS or EKS
5. **Monitor performance** - Use CloudWatch
