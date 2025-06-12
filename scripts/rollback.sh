#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}
TAG=${2:-latest}

echo "🔄 Rolling back AT Protocol Dashboard in $ENVIRONMENT to tag $TAG"

./scripts/deploy.sh $ENVIRONMENT $TAG

echo "✅ Rollback completed"
