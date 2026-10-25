#!/usr/bin/env bash
# ==============================================================================
# AUTOMATIC VERCEL DEPLOYMENT TOOL
# School Student System (SSS) - HAPS AI Scholar Assistant
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

MODE="${1:---preview}"

echo "===================================================================="
echo "🚀 HAPS-AI SCHOLAR ASSISTANT: AUTOMATED VERCEL DEPLOYMENT"
echo "===================================================================="
echo "Project Path: $PROJECT_ROOT"
echo "Target Mode:  $MODE"
echo "--------------------------------------------------------------------"

# Check if npx is available
if ! command -v npx >/dev/null 2>&1; then
    echo "❌ Error: npx/node is not installed. Please install Node.js."
    exit 1
fi

echo "📦 Verifying project files and vercel.json..."
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found!"
    exit 1
fi

echo "✨ Pre-deployment check: Running diagnostic test suite..."
node scripts/test_evaluator.js

echo "🌐 Deploying to Vercel via Vercel CLI..."

if [ "$MODE" == "--prod" ] || [ "$MODE" == "-p" ]; then
    echo "🔴 Initiating PRODUCTION deployment..."
    if [ -n "$VERCEL_TOKEN" ]; then
        npx -y vercel deploy --prod --yes --token="$VERCEL_TOKEN"
    else
        echo "ℹ️ Note: VERCEL_TOKEN environment variable not detected. Using local CLI credentials if authenticated..."
        npx -y vercel deploy --prod --yes
    fi
    echo "🎉 Production Deployment complete!"
else
    echo "🟡 Initiating PREVIEW / STAGING deployment..."
    if [ -n "$VERCEL_TOKEN" ]; then
        npx -y vercel deploy --yes --token="$VERCEL_TOKEN"
    else
        echo "ℹ️ Note: VERCEL_TOKEN environment variable not detected. Using local CLI credentials if authenticated..."
        npx -y vercel deploy --yes
    fi
    echo "🎉 Preview Deployment complete!"
fi

echo "===================================================================="
