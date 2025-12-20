#!/usr/bin/env bash
# One-Command Setup Script for nexus-core Automation Portfolio
# Sets up Python automation + Next.js frontend stack

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "============================================================"
echo "🚀 nexus-core Automation Portfolio Setup"
echo "============================================================"
echo ""

# ============================================================
# Step 1: Check Prerequisites
# ============================================================
echo -e "${BLUE}Step 1/5: Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+ first.${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓${NC} Python 3 found: $PYTHON_VERSION"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} npm found: $NPM_VERSION"

echo ""

# ============================================================
# Step 2: Setup Python Virtual Environment
# ============================================================
echo -e "${BLUE}Step 2/5: Setting up Python virtual environment...${NC}"

if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠️${NC}  Virtual environment already exists at: venv/"
    echo "   Skipping creation."
else
    echo "Creating virtual environment at: venv/"
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
fi

echo ""

# ============================================================
# Step 3: Install Python Dependencies
# ============================================================
echo -e "${BLUE}Step 3/5: Installing Python dependencies...${NC}"

# Activate virtual environment
source venv/bin/activate

# Check if requirements.txt exists
if [ ! -f "scripts/requirements.txt" ]; then
    echo -e "${RED}❌ scripts/requirements.txt not found${NC}"
    exit 1
fi

echo "Installing from scripts/requirements.txt..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r scripts/requirements.txt

# Verify key dependencies
echo ""
echo "Verifying Python packages:"
if pip list 2>/dev/null | grep -q "openai"; then
    OPENAI_VERSION=$(pip show openai 2>/dev/null | grep Version | awk '{print $2}')
    echo -e "${GREEN}✓${NC} openai: $OPENAI_VERSION"
else
    echo -e "${RED}❌ openai not installed${NC}"
fi

if pip list 2>/dev/null | grep -q "PyGithub"; then
    PYGITHUB_VERSION=$(pip show PyGithub 2>/dev/null | grep Version | awk '{print $2}')
    echo -e "${GREEN}✓${NC} PyGithub: $PYGITHUB_VERSION"
else
    echo -e "${RED}❌ PyGithub not installed${NC}"
fi

if pip list 2>/dev/null | grep -q "python-dotenv"; then
    DOTENV_VERSION=$(pip show python-dotenv 2>/dev/null | grep Version | awk '{print $2}')
    echo -e "${GREEN}✓${NC} python-dotenv: $DOTENV_VERSION"
else
    echo -e "${RED}❌ python-dotenv not installed${NC}"
fi

deactivate
echo ""

# ============================================================
# Step 4: Install Node.js Dependencies
# ============================================================
echo -e "${BLUE}Step 4/5: Installing Node.js dependencies...${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo "Running npm install..."
npm install

# Verify key dependencies
echo ""
echo "Verifying Node.js packages:"
if [ -d "node_modules/next" ]; then
    NEXT_VERSION=$(node -p "require('./node_modules/next/package.json').version" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓${NC} next: $NEXT_VERSION"
else
    echo -e "${RED}❌ next not installed${NC}"
fi

if [ -d "node_modules/react" ]; then
    REACT_VERSION=$(node -p "require('./node_modules/react/package.json').version" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓${NC} react: $REACT_VERSION"
else
    echo -e "${RED}❌ react not installed${NC}"
fi

if [ -d "node_modules/typescript" ]; then
    TS_VERSION=$(node -p "require('./node_modules/typescript/package.json').version" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓${NC} typescript: $TS_VERSION"
else
    echo -e "${RED}❌ typescript not installed${NC}"
fi

echo ""

# ============================================================
# Step 5: Setup Environment Configuration
# ============================================================
echo -e "${BLUE}Step 5/5: Setting up environment configuration...${NC}"

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo -e "${GREEN}✓${NC} .env.local created"
        echo -e "${YELLOW}⚠️${NC}  Please edit .env.local and add your API keys:"
        echo "   - OPENAI_API_KEY"
        echo "   - GITHUB_TOKEN"
        echo "   - REPO_NAME"
    else
        echo -e "${YELLOW}⚠️${NC}  .env.example not found, skipping .env.local creation"
    fi
else
    echo -e "${GREEN}✓${NC} .env.local already exists"
fi

# Create output directory structure
echo ""
echo "Creating output directories..."
mkdir -p output/notes
mkdir -p output/backups
echo -e "${GREEN}✓${NC} Output directories created"

echo ""

# ============================================================
# Success Summary
# ============================================================
echo "============================================================"
echo -e "${GREEN}✅ SETUP COMPLETE${NC}"
echo "============================================================"
echo ""
echo "Your stack is ready! Here's what was configured:"
echo ""
echo "📦 Python Environment:"
echo "   • Virtual environment: venv/"
echo "   • Python version: $PYTHON_VERSION"
echo "   • Dependencies: openai, PyGithub, python-dotenv"
echo ""
echo "📦 Next.js Environment:"
echo "   • Node version: $NODE_VERSION"
echo "   • Next.js: $([ -d "node_modules/next" ] && node -p "require('./node_modules/next/package.json').version" 2>/dev/null || echo "installed")"
echo "   • React: $([ -d "node_modules/react" ] && node -p "require('./node_modules/react/package.json').version" 2>/dev/null || echo "installed")"
echo "   • Dependencies: Installed"
echo ""
echo "📁 Project Structure:"
echo "   • Output directory: output/"
echo "   • Notes input: output/notes/"
echo "   • Backups: output/backups/"
echo ""

# Check if .env.local needs configuration
if [ -f ".env.local" ]; then
    if grep -q "your-openai-api-key-here" .env.local 2>/dev/null; then
        echo -e "${YELLOW}⚠️  NEXT STEP: Configure API Keys${NC}"
        echo ""
        echo "Edit .env.local and add your keys:"
        echo "   1. OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
        echo "   2. GITHUB_TOKEN (from https://github.com/settings/tokens)"
        echo "   3. REPO_NAME (format: owner/repo)"
        echo ""
    else
        echo -e "${GREEN}✓${NC} Environment variables configured"
        echo ""
    fi
fi

echo "🚀 Quick Start Commands:"
echo ""
echo "   # Test Python automation (demo mode - no API keys needed)"
echo "   python3 scripts/daily_v2.py --demo"
echo ""
echo "   # Test Python automation (production mode - requires API keys)"
echo "   source venv/bin/activate"
echo "   python3 scripts/daily_v2.py"
echo ""
echo "   # Start Next.js dev server"
echo "   npm run dev"
echo ""
echo "   # Build for production"
echo "   npm run build"
echo ""
echo "   # Run comprehensive validation"
echo "   bash scripts/validate.sh"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Complete guide"
echo "   • QUICKSTART.md - Quick reference"
echo "   • AUTOMATION_GUIDE.md - Automation details"
echo "   • .copilot-instructions.md - AI assistant guide"
echo ""
echo "🌐 Live Demo: https://avidelta.vercel.app"
echo ""
echo "============================================================"
