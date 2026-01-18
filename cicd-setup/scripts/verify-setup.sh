#!/bin/bash
# verify-setup.sh
# Run this locally to verify your deployment setup before pushing

set -e

echo "🔍 CI/CD Setup Verification Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check if we're in a git repository
echo "1. Checking Git repository..."
if [ -d ".git" ]; then
    check_pass "Git repository found"
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -n "$REMOTE" ]; then
        check_pass "Remote origin: $REMOTE"
    else
        check_fail "No remote origin set"
    fi
else
    check_fail "Not a git repository"
fi
echo ""

# 2. Check workflow file exists
echo "2. Checking GitHub Actions workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    check_pass "deploy.yml found"
elif [ -f ".github/workflows/ci-cd-pipeline.yml" ]; then
    check_pass "ci-cd-pipeline.yml found"
else
    check_fail "No workflow file found in .github/workflows/"
    check_warn "Copy deploy.yml or ci-cd-pipeline.yml to .github/workflows/"
fi
echo ""

# 3. Check package.json
echo "3. Checking package.json..."
if [ -f "package.json" ]; then
    check_pass "package.json found"
    
    # Check for build script
    if grep -q '"build"' package.json; then
        check_pass "Build script defined"
    else
        check_fail "No build script in package.json"
    fi
    
    # Check for vite
    if grep -q 'vite' package.json; then
        check_pass "Vite is listed as dependency"
    else
        check_warn "Vite not found in dependencies"
    fi
else
    check_fail "package.json not found"
fi
echo ""

# 4. Check if deploy key exists
echo "4. Checking SSH deploy key..."
if [ -f "$HOME/.ssh/github_deploy_key" ]; then
    check_pass "Deploy key found at ~/.ssh/github_deploy_key"
else
    check_warn "Deploy key not found"
    echo "   Run: ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/github_deploy_key"
fi
echo ""

# 5. Test SSH connection (optional - requires server info)
echo "5. SSH Connection Test (optional)..."
echo "   To test manually:"
echo "   ssh -i ~/.ssh/github_deploy_key -p PORT user@your-server.com 'echo Connected!'"
echo ""

# 6. Test local build
echo "6. Testing local build..."
if [ -f "package.json" ]; then
    echo "   Running: npm run build"
    if npm run build > /dev/null 2>&1; then
        check_pass "Build succeeded"
        if [ -d "dist" ]; then
            FILE_COUNT=$(find dist -type f | wc -l)
            check_pass "dist/ directory created with $FILE_COUNT files"
        fi
    else
        check_fail "Build failed - run 'npm run build' to see errors"
    fi
else
    check_warn "Skipping build test (no package.json)"
fi
echo ""

# 7. Summary
echo "=================================="
echo "📋 Next Steps:"
echo ""
echo "1. If you haven't created a deploy key:"
echo "   ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/github_deploy_key"
echo ""
echo "2. Add public key to your server:"
echo "   cat ~/.ssh/github_deploy_key.pub"
echo "   # Then add this to ~/.ssh/authorized_keys on your server"
echo ""
echo "3. Add secrets to GitHub:"
echo "   - Go to: Repository → Settings → Secrets → Actions"
echo "   - Add: SSH_PRIVATE_KEY, SSH_HOST, SSH_USER, SSH_PORT, DEPLOY_PATH"
echo ""
echo "4. Push to trigger deployment:"
echo "   git add ."
echo "   git commit -m 'Add CI/CD workflow'"
echo "   git push origin main"
echo ""
