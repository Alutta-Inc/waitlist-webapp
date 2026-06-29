#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Alutta Website — AWS Deployment Script
# Usage: ./aws/deploy.sh [AWS_ACCOUNT_ID] [AWS_REGION] [IMAGE_TAG]
# Example: ./aws/deploy.sh 123456789012 us-east-1 latest
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ACCOUNT_ID="${1:-$(aws sts get-caller-identity --query Account --output text)}"
REGION="${2:-us-east-1}"
TAG="${3:-latest}"
REPO="alutta-website"
IMAGE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:$TAG"

echo "▶ Logging into ECR..."
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "▶ Creating ECR repository (if not exists)..."
aws ecr describe-repositories --repository-names "$REPO" --region "$REGION" 2>/dev/null || \
  aws ecr create-repository --repository-name "$REPO" --region "$REGION"

echo "▶ Building Docker image..."
docker build -f aws/Dockerfile -t "$IMAGE" .

echo "▶ Pushing image to ECR..."
docker push "$IMAGE"

echo "✅ Image pushed: $IMAGE"
echo ""
echo "Next steps:"
echo "  1. Go to AWS App Runner console → Create service → ECR → select $IMAGE"
echo "  2. Set environment variables (Supabase, Resend keys) in the App Runner console"
echo "  3. Point your custom domain (alutta.com) to the App Runner URL"
