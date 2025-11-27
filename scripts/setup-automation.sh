#!/bin/bash
# Setup script for Python automation environment
# Usage: ./scripts/setup-automation.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Setting up Python automation environment..."
echo "Project root: $PROJECT_ROOT"
echo ""

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install Python 3.9 or later."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
echo "✓ Found Python $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ -d "$PROJECT_ROOT/venv" ]; then
    echo "⚠️  Virtual environment already exists at $PROJECT_ROOT/venv"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_ROOT/venv"
        python3 -m venv "$PROJECT_ROOT/venv"
        echo "✓ Recreated virtual environment"
    else
        echo "✓ Using existing virtual environment"
    fi
else
    python3 -m venv "$PROJECT_ROOT/venv"
    echo "✓ Created virtual environment"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source "$PROJECT_ROOT/venv/bin/activate"
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null
echo "✓ Pip upgraded"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
if [ -f "$PROJECT_ROOT/scripts/requirements.txt" ]; then
    pip install -r "$PROJECT_ROOT/scripts/requirements.txt"
    echo "✓ Dependencies installed"
else
    echo "⚠️  Warning: requirements.txt not found at $PROJECT_ROOT/scripts/requirements.txt"
fi
echo ""

# Check for .env.local
echo "Checking environment configuration..."
if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    echo "⚠️  .env.local not found"
    echo ""
    echo "Creating .env.local from template..."
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env.local"
        echo "✓ Created .env.local from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env.local and add your API keys:"
        echo "   - OPENAI_API_KEY"
        echo "   - GITHUB_TOKEN"
        echo "   - REPO_NAME"
    else
        echo "❌ Error: .env.example not found"
    fi
else
    echo "✓ .env.local exists"
fi
echo ""

# Create data directories
echo "Creating data directories..."
mkdir -p "$PROJECT_ROOT/data/notes"
mkdir -p "$PROJECT_ROOT/output"
echo "✓ Data directories created"
echo ""

# Test the automation script
echo "Testing automation script..."
python3 "$PROJECT_ROOT/scripts/daily_v2.py" --demo
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your API keys"
echo "  2. Add notes to data/notes/ (optional)"
echo "  3. Run: ./run-daily.sh"
echo ""
echo "To activate the virtual environment manually:"
echo "  source venv/bin/activate"
