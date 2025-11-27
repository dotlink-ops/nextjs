#!/bin/bash
# Validation and testing script for the automation stack
# Usage: ./scripts/validate.sh

# Note: Don't use set -e as we want to continue even if some tests fail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🧪 Running validation and tests..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Check Python environment
echo "1️⃣  Python Environment"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    test_pass "Python installed: $PYTHON_VERSION"
else
    test_fail "Python 3 not found"
fi

if [ -d "$PROJECT_ROOT/venv" ]; then
    test_pass "Virtual environment exists"
else
    test_warn "Virtual environment not created (run: scripts/setup-automation.sh)"
fi
echo ""

# 2. Check dependencies
echo "2️⃣  Python Dependencies"
if [ -f "$PROJECT_ROOT/scripts/requirements.txt" ]; then
    test_pass "requirements.txt exists"
    
    # Try to check if deps are installed
    if source "$PROJECT_ROOT/venv/bin/activate" 2>/dev/null; then
        if python3 -c "import openai, github, dotenv" 2>/dev/null; then
            test_pass "All Python dependencies installed"
        else
            test_warn "Dependencies not installed (run: pip install -r scripts/requirements.txt)"
        fi
        deactivate 2>/dev/null || true
    fi
else
    test_fail "requirements.txt not found"
fi
echo ""

# 3. Check configuration
echo "3️⃣  Configuration"
if [ -f "$PROJECT_ROOT/.env.example" ]; then
    test_pass ".env.example exists"
else
    test_warn ".env.example not found"
fi

if [ -f "$PROJECT_ROOT/.env.local" ]; then
    test_pass ".env.local exists"
    
    # Check for placeholder values
    if grep -q "your-openai-api-key-here" "$PROJECT_ROOT/.env.local" 2>/dev/null; then
        test_warn "OPENAI_API_KEY not configured (using placeholder)"
    else
        test_pass "OPENAI_API_KEY configured"
    fi
    
    if grep -q "your-github-token-here" "$PROJECT_ROOT/.env.local" 2>/dev/null; then
        test_warn "GITHUB_TOKEN not configured (using placeholder)"
    else
        test_pass "GITHUB_TOKEN configured"
    fi
else
    test_warn ".env.local not found (copy from .env.example)"
fi
echo ""

# 4. Check directory structure
echo "4️⃣  Directory Structure"
for dir in "data" "data/notes" "scripts" "SAMPLE_OUTPUTS"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        test_pass "Directory exists: $dir"
    else
        test_fail "Directory missing: $dir"
    fi
done
echo ""

# 5. Check automation scripts
echo "5️⃣  Automation Scripts"
for script in "scripts/daily-runner.py" "scripts/daily_v2.py" "scripts/setup-automation.sh" "scripts/sync-to-frontend.sh" "run-daily.sh"; do
    if [ -f "$PROJECT_ROOT/$script" ]; then
        test_pass "Script exists: $script"
        
        # Check if executable
        if [ -x "$PROJECT_ROOT/$script" ] || [[ "$script" == *.py ]]; then
            test_pass "  ├─ Executable/runnable"
        else
            test_warn "  └─ Not executable (run: chmod +x $script)"
        fi
    else
        test_fail "Script missing: $script"
    fi
done
echo ""

# 6. Test automation execution (demo mode)
echo "6️⃣  Automation Execution Test (Demo Mode)"
if cd "$PROJECT_ROOT" && python3 scripts/daily_v2.py --demo > /dev/null 2>&1; then
    test_pass "daily_v2.py runs successfully in demo mode"
else
    test_fail "daily_v2.py failed to run"
fi

if [ -f "$PROJECT_ROOT/data/daily_summary.json" ]; then
    test_pass "daily_summary.json generated"
    
    # Validate JSON
    if python3 -c "import json; json.load(open('$PROJECT_ROOT/data/daily_summary.json'))" 2>/dev/null; then
        test_pass "  └─ Valid JSON format"
    else
        test_fail "  └─ Invalid JSON format"
    fi
else
    test_fail "daily_summary.json not generated"
fi
echo ""

# 7. Check Next.js setup
echo "7️⃣  Next.js Application"
if [ -f "$PROJECT_ROOT/package.json" ]; then
    test_pass "package.json exists"
else
    test_fail "package.json not found"
fi

if [ -d "$PROJECT_ROOT/node_modules" ]; then
    test_pass "Node dependencies installed"
else
    test_warn "Node dependencies not installed (run: npm install)"
fi

if [ -f "$PROJECT_ROOT/next.config.ts" ]; then
    test_pass "next.config.ts exists"
else
    test_fail "next.config.ts not found"
fi
echo ""

# 8. Check API routes
echo "8️⃣  API Routes"
for route in "app/api/daily-summary/route.ts" "app/api/demo/route.ts" "app/api/health/route.ts" "app/api/status/route.ts"; do
    if [ -f "$PROJECT_ROOT/$route" ]; then
        test_pass "API route exists: $route"
    else
        test_fail "API route missing: $route"
    fi
done
echo ""

# 9. Test Next.js build
echo "9️⃣  Next.js Build Test"
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    echo "   Building Next.js application..."
    if cd "$PROJECT_ROOT" && npm run build > /tmp/nextjs-build.log 2>&1; then
        test_pass "Next.js build successful"
    else
        test_fail "Next.js build failed (see /tmp/nextjs-build.log)"
    fi
else
    test_warn "Skipping build test (run npm install first)"
fi
echo ""

# 10. Check sample outputs
echo "🔟 Sample Outputs"
if [ -f "$PROJECT_ROOT/SAMPLE_OUTPUTS/daily_runner_summary.txt" ]; then
    test_pass "daily_runner_summary.txt exists"
else
    test_warn "daily_runner_summary.txt missing (run: ./run-daily.sh)"
fi

if [ -f "$PROJECT_ROOT/SAMPLE_OUTPUTS/issue_pipeline_log.txt" ]; then
    test_pass "issue_pipeline_log.txt exists"
else
    test_warn "issue_pipeline_log.txt missing (run: ./run-daily.sh)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results:"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Configure API keys in .env.local"
    echo "  2. Run: ./run-daily.sh"
    echo "  3. Start dev server: npm run dev"
    echo "  4. Visit: http://localhost:3000"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
