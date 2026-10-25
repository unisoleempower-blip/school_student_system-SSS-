#!/usr/bin/env bash
# ==============================================================================
# HAPS-AI SCHOLAR ASSISTANT: LOCAL DEVELOPER BOOTSTRAP SCRIPT
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "🚀 Bootstrapping HAPS-AI Scholar Assistant in $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# Check Docker
if command -v docker >/dev/null 2>&1; then
    echo "🐳 Docker detected. Launching local Staging stack with Postgres & Kafka..."
    docker compose up -d --build
    echo "✨ Services started:"
    echo "   - Web Portal: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000/api/health"
    echo "   - PostgreSQL: localhost:5432"
    echo "   - Kafka Bus: localhost:9092"
else
    echo "⚠️ Docker not detected. Running local verification suite directly with Node.js..."
    node scripts/test_evaluator.js
fi
