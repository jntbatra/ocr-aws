# Configure S3 bucket policy for public read access
# This script enables public read access to objects in the bucket while respecting Bucket Owner Enforced setting

$BUCKET_NAME = "expense-tracker-receipts-496157869522-ap-south-1"
$REGION = "ap-south-1"

# Create bucket policy JSON
$bucketPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action = "s3:GetObject"
            Resource = "arn:aws:s3:::$BUCKET_NAME/*"
            Condition = @{
                StringEquals = @{
                    "s3:x-amz-server-side-encryption" = "AES256"
                }
            }
        }
    )
} | ConvertTo-Json -Depth 10

# Save policy to file
$policyPath = Join-Path $PSScriptRoot "bucket-policy.json"
$bucketPolicy | Set-Content -Path $policyPath -Force

Write-Host "Bucket policy saved to: $policyPath"
Write-Host ""
Write-Host "Applying bucket policy to: $BUCKET_NAME"
Write-Host ""

# Apply the policy using AWS CLI
try {
    aws s3api put-bucket-policy `
        --bucket $BUCKET_NAME `
        --policy file://$policyPath `
        --region $REGION

    Write-Host "Bucket policy applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Public read access is now enabled for receipts in the bucket."
}
catch {
    Write-Host "Error applying bucket policy: $_" -ForegroundColor Red
    exit 1
}

# Verify the policy was applied
Write-Host ""
Write-Host "Verifying policy..."
aws s3api get-bucket-policy `
    --bucket $BUCKET_NAME `
    --region $REGION `
    --output json | ConvertFrom-Json | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "Policy verification complete!" -ForegroundColor Green
