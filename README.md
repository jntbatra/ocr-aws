# AI-Powered Expense Tracker with OCR

Cloud-native expense management application built on AWS using managed AI services, Infrastructure as Code, and containerized deployment.

---

## Badges

![AWS](https://img.shields.io/badge/AWS-Cloud-orange)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Node.js](https://img.shields.io/badge/Node.js-v22-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/Status-Production--Ready-brightgreen)

---

## Table of Contents

* [Overview](#overview)
* [Problem Statement](#problem-statement)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Core Workflows](#core-workflows)
* [Infrastructure as Code](#infrastructure-as-code)
* [Containerization & Deployment](#containerization--deployment)
* [Security](#security)
* [Scalability](#scalability)
* [Testing](#testing)
* [Project Structure](#project-structure)
* [Setup & Deployment](#setup--deployment)
* [Future Enhancements](#future-enhancements)
* [Author](#author)

---

## Overview

The **AI-Powered Expense Tracker with OCR** is a production-ready cloud-native web application built on Amazon Web Services (AWS).

Users can:

* Authenticate securely
* Upload receipt images
* Automatically extract financial data using AWS Textract
* Visualize expenses through an interactive dashboard
* Receive automated monthly summaries via email

The project demonstrates real-world implementation of:

* Infrastructure as Code (IaC)
* Serverless storage
* Managed identity
* AI-as-a-Service
* Container orchestration
* Cloud-native architecture

---

## Problem Statement

Manual expense tracking requires repetitive data entry and often leads to errors.

This project automates receipt digitization using **AWS Textract AnalyzeExpense API**, reducing manual effort while maintaining scalability and security.

---

## Architecture

The system is designed using a layered cloud-native architecture.

### 1️⃣ Cloud Architecture (Component View)

* Client (Next.js frontend)
* EC2 (Dockerized backend & frontend)
* Cognito (Authentication)
* S3 (Receipt Storage)
* Textract (OCR)
* DynamoDB (Database)
* SNS (Notifications)
* VPC + Security Groups (Networking)

### Insert Architecture Diagram Below

```markdown
![Cloud Architecture Diagram](docs/architecture-component.png)
```

---

### 2️⃣ Data Flow Pipeline (Sequence View)

Workflows include:

* Authentication
* Receipt Upload + OCR Processing
* Expense Management
* Monthly Summary Notifications

### Insert Data Flow Diagram Below

```markdown
![Data Flow Diagram](docs/dataflow-sequence.png)
```

---

### 3️⃣ Infrastructure Deployment (IaC View)

All AWS resources are provisioned through:

```
infrastructure.yaml
```

### Insert Infrastructure Diagram Below

```markdown
![Infrastructure Diagram](docs/infrastructure-architecture.png)
```

---

## Tech Stack

### Frontend

* Next.js 16
* TypeScript
* Tailwind CSS

### Backend

* Node.js v22
* Express.js

### Containerization

* Docker
* Docker Compose

### AWS Services

* EC2 (t3.micro)
* Cognito
* S3 (Presigned URLs)
* Textract (AnalyzeExpense API)
* DynamoDB (Pay-per-request)
* SNS
* CloudFormation
* VPC & Security Groups

---

## Core Workflows

### Authentication Flow

* User signup with email verification (OTP)
* Secure Remote Password (SRP)
* JWT token issued upon login
* JWT used for protected API calls

```markdown
![Login Page](docs/login.png)
![Cognito Console](docs/cognito.png)
```

---

### Receipt Upload & OCR Pipeline

1. User selects receipt
2. Backend generates presigned S3 URL
3. Frontend uploads directly to S3
4. Backend calls Textract AnalyzeExpense
5. Extracted fields returned:

   * Merchant Name
   * Total Amount
   * Date
6. User confirms data
7. Expense saved to DynamoDB

```markdown
![Receipt Upload](docs/upload.png)
![Textract Response](docs/textract-response.png)
```

---

### Expense Dashboard

* JWT-authenticated requests
* Partitioned DynamoDB queries using `userId`
* Displays:

  * Category pie chart
  * Monthly trend line chart
  * Expense table
  * Summary statistics

```markdown
![Dashboard](docs/dashboard.png)
```

---

### Monthly Email Notifications

* Scheduled aggregation of expenses
* Formatted HTML summary
* Published to SNS topic
* Delivered via email

```markdown
![SNS Console](docs/sns.png)
```

---

## Infrastructure as Code

All AWS resources are defined in a single declarative file:

```
infrastructure.yaml
```

Resources created:

* VPC
* Public Subnet
* Internet Gateway
* Route Tables
* Security Groups
* EC2 Instance
* IAM Role & Instance Profile
* Cognito User Pool & Client
* S3 Bucket
* DynamoDB Table
* SNS Topic

### Benefits

* Reproducible deployments
* Version-controlled infrastructure
* Automated rollback
* No manual console configuration

---

## Containerization & Deployment

Two containers:

| Service  | Port |
| -------- | ---- |
| Backend  | 5000 |
| Frontend | 3000 |

Managed via `docker-compose`.

Benefits:

* Environment consistency
* Dependency isolation
* Simplified deployment
* Production-ready setup

---

## Security

### Authentication

* JWT-based stateless authentication
* SRP protocol
* Email verification
* Token expiration

### Data Protection

* Private S3 bucket
* 15-minute presigned URL expiration
* DynamoDB encryption at rest
* HTTPS enforced

### Network Isolation

* Custom VPC
* Restricted security groups
* Least-privilege IAM roles

---

## Scalability

### Current Limitation

* Single EC2 instance (Single Point of Failure)

### Future Improvements

* Application Load Balancer
* Auto Scaling Group
* CloudFront CDN
* ElastiCache (Redis)
* Lambda-based backend
* DynamoDB GSIs

---

## Testing

### Functional Testing

* Signup & OTP verification
* JWT validation
* OCR extraction accuracy
* Expense persistence

### Security Testing

* Unauthorized API rejection
* Expired token handling
* Cross-user isolation
* Presigned URL expiration validation

---

## Project Structure

```
.
├── backend/
├── frontend/
├── infrastructure.yaml
├── docker-compose.yml
└── README.md
```

---

## Setup & Deployment

### 1. Clone Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Deploy Infrastructure

```bash
aws cloudformation deploy \
  --template-file infrastructure.yaml \
  --stack-name expense-tracker-stack
```

### 3. Run Application

```bash
docker-compose up --build
```

---

## Future Enhancements

* Multi-currency support
* Budget alerts
* Expense sharing between users
* Analytics export (CSV/PDF)
* Serverless backend migration
