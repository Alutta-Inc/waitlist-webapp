#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Alutta — Sync static assets from /public to S3
# Run once after first deploy, then on any asset change.
#
# Prerequisites:
#   - AWS CLI configured (aws configure) with S3 + CloudFront permissions
#   - S3 bucket created: alutta-static-assets (or change BUCKET below)
#   - CloudFront distribution pointed at the bucket (see README)
#
# Usage: ./scripts/sync-assets-to-s3.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BUCKET="${S3_BUCKET:-alutta-static-assets}"
REGION="${AWS_REGION:-us-east-1}"
CF_DIST_ID="${CF_DISTRIBUTION_ID:-}"   # Set in env or pass as CF_DISTRIBUTION_ID=XXXXX ./sync...

echo "▶ Syncing /public/fonts → s3://$BUCKET/fonts/"
aws s3 sync public/fonts/ "s3://$BUCKET/fonts/" \
  --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "font/woff2" \
  --delete

echo "▶ Syncing /public/brand → s3://$BUCKET/brand/"
aws s3 sync public/brand/ "s3://$BUCKET/brand/" \
  --region "$REGION" \
  --cache-control "public, max-age=86400" \
  --delete

if [ -n "$CF_DIST_ID" ]; then
  echo "▶ Invalidating CloudFront cache for /brand/* and /fonts/*..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/brand/*" "/fonts/*"
  echo "✅ Invalidation submitted"
fi

echo ""
echo "✅ Sync complete. Assets at:"
echo "   https://<your-cloudfront-domain>/fonts/"
echo "   https://<your-cloudfront-domain>/brand/"
echo ""
echo "Set in Vercel env vars:"
echo "   NEXT_PUBLIC_ASSET_PREFIX=https://<your-cloudfront-domain>"
