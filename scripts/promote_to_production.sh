#!/usr/bin/env bash
# ==============================================================================
# STAGING-TO-PRODUCTION SAFE PROMOTION PIPELINE
# School Student System (SSS) - HAPS AI Scholar Assistant
# ==============================================================================
# POLICY ENFORCEMENT:
# 1. Code is first deployed to the STAGING / PREVIEW environment.
# 2. Automated smoke and integration tests verify the live Staging deployment.
# 3. ONLY IF 100% of staging checks pass, code is promoted and deployed to PRODUCTION.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "===================================================================="
echo "🛡️  HAPS-AI SCHOLAR ASSISTANT: STAGING-GATED PROMOTION PIPELINE"
echo "===================================================================="
echo "Project Path: $PROJECT_ROOT"
echo "Timestamp:    $(date -u)"
echo "--------------------------------------------------------------------"

# 1. Pre-flight sanity checks
echo "🔍 [STAGE 1/4] Running Local Unit & Diagnostic Evaluation Suite..."
node scripts/test_evaluator.js
node scripts/test_subject_remedial_pipeline.js
node scripts/test_teacher_auth_and_class_management.js
echo "✅ Local diagnostic tests passed."
echo ""

# 2. Deploy to Vercel Staging / Preview
echo "🚀 [STAGE 2/4] Deploying to Vercel STAGING Environment..."
DEPLOY_OUTPUT=$(npx -y vercel deploy --yes 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract Staging Preview URL from deploy output
STAGING_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://haps-ai-scholar-assistant-[^ ]*\.vercel\.app' | head -n 1)

if [ -z "$STAGING_URL" ]; then
    echo "⚠️  Could not automatically extract unique preview URL; falling back to linked preview context."
else
    echo "🌐 Staging Deployment live at: $STAGING_URL"
fi
echo ""

# 3. Verify Staging Environment (THE GATE)
echo "🧪 [STAGE 3/4] Executing Automated Staging Verification Suite..."
set +e
if [ -n "$STAGING_URL" ]; then
    node scripts/verify_staging.js "$STAGING_URL"
    STAGING_EXIT_CODE=$?
else
    node scripts/verify_staging.js
    STAGING_EXIT_CODE=$?
fi
set -e

if [ $STAGING_EXIT_CODE -ne 0 ]; then
    echo "===================================================================="
    echo "❌ PROMOTION BLOCKED BY STAGING GATE!"
    echo "Staging environment failed verification (Exit Code: $STAGING_EXIT_CODE)."
    echo "⚠️  STRICT SAFETY RULE: Production was NOT modified or deployed."
    echo "Please inspect the error logs above, fix issues on staging, and retry."
    echo "===================================================================="
    exit $STAGING_EXIT_CODE
fi

echo ""
echo "===================================================================="
echo "🎉 STAGING VERIFICATION PASSED 100%!"
echo "Approved for Production Release. Proceeding with deployment..."
echo "===================================================================="
echo ""

# 4. Promote and Deploy to Production
echo "🔴 [STAGE 4/4] Deploying Verified Build to VERCEL PRODUCTION..."
npx -y vercel deploy --prod --yes

# If currently on staging branch, merge to main and push
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" == "staging" ]; then
    echo "🔀 Merging verified 'staging' branch into 'main'..."
    git checkout main
    git merge staging -m "chore(release): promote verified staging build to production [skip ci]"
    git push origin main
    git checkout staging
    echo "✅ Git 'main' branch synchronized with verified staging build."
fi

# 5. Production Health Check
echo "🔍 Validating Production Health..."
curl -s -S "https://haps-ai-scholar-assistant.vercel.app/api/health" | grep -q "HEALTHY" && echo "✅ Production is HEALTHY (https://haps-ai-scholar-assistant.vercel.app)"

echo ""
echo "===================================================================="
echo "🏆 SUCCESS: Verified Staging Release successfully deployed to PRODUCTION!"
echo "Production URL: https://haps-ai-scholar-assistant.vercel.app"
echo "===================================================================="
