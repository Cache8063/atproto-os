#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}
TAG=${2:-latest}

echo "🚀 Deploying AT Protocol Dashboard to $ENVIRONMENT with tag $TAG"

case $ENVIRONMENT in
  staging)
    WEBHOOK_URL=$PORTAINER_WEBHOOK_STAGING
    DOMAIN="staging-dashboard.arcnode.xyz"
    ;;
  production|prod)
    WEBHOOK_URL=$PORTAINER_WEBHOOK_PRODUCTION
    DOMAIN="dashboard.arcnode.xyz"
    ;;
  *)
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
    ;;
esac

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Webhook URL not set for $ENVIRONMENT"
  exit 1
fi

# Trigger deployment
echo "📡 Triggering deployment webhook..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"ghcr.io/cache8063/atproto-dashboard:$TAG\"}"

echo "⏳ Waiting for deployment to complete..."
sleep 30

# Health check
echo "🔍 Performing health check..."
for i in {1..10}; do
  if curl -f "https://$DOMAIN/api/health" > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 Application available at: https://$DOMAIN"
    exit 0
  fi
  echo "⏳ Attempt $i/10 - waiting for service to be ready..."
  sleep 10
done

echo "❌ Health check failed - deployment may have issues"
exit 1
