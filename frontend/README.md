# Expense Tracker Frontend

A modern Next.js application for tracking expenses using AWS Textract OCR. Upload receipt images and automatically extract expense data.

## Features

- **Upload Receipt**: Drag-and-drop receipt images with automatic OCR processing
- **Expense Management**: View, filter, and search through all expenses
- **Dashboard**: Visualize spending patterns with interactive charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React Icons

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod
   ```
   Replace with your actual API Gateway URL from the backend deployment.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Pages

- **`/`** - Homepage with feature overview
- **`/upload`** - Upload receipt images
- **`/expenses`** - View and filter all expenses
- **`/dashboard`** - Analytics and spending trends

## API Integration

The frontend connects to the AWS backend using the following endpoints:

- `POST /upload-url` - Get S3 signed URL
- `GET /expenses` - Retrieve all expenses
- `GET /summary?month=YYYY-MM` - Get monthly summary

## Deployment

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Add `NEXT_PUBLIC_API_BASE_URL` environment variable
4. Deploy

### Option 2: AWS Amplify
1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

### Option 3: Static Export to S3
```bash
npm run build
# Upload the 'out' directory to S3
# Configure CloudFront distribution
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API Gateway URL | `https://abc123.execute-api.us-east-1.amazonaws.com/Prod` |

## Notes

- Ensure the backend is deployed and accessible before running the frontend
- The app uses polling to detect when OCR processing is complete
- Receipt images are stored in S3 and accessible via the backend
