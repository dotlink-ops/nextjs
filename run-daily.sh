#!/bin/bash
# Daily Runner Wrapper
# Usage: ./run-daily.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting Daily Runner..."
echo "Project Root: $PROJECT_ROOT"

# Ensure venv exists (optional)
if [ ! -d "$PROJECT_ROOT/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$PROJECT_ROOT/venv"
fi

# Activate venv (optional)
if [ -f "$PROJECT_ROOT/venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source "$PROJECT_ROOT/venv/bin/activate"
fi

# Run the daily runner
echo ""
python3 "$PROJECT_ROOT/scripts/daily-runner.py"
