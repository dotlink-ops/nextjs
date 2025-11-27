#!/bin/bash
# Daily Runner Wrapper
# Usage: ./run-daily.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

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

# Run the daily runner (v2 with fallback to v1)
echo ""
if [ -f "$PROJECT_ROOT/scripts/daily_v2.py" ]; then
    echo "Running daily_v2.py..."
    python3 "$PROJECT_ROOT/scripts/daily_v2.py" "$@"
    EXIT_CODE=$?
    
    # Sync outputs to frontend if successful
    if [ $EXIT_CODE -eq 0 ] && [ -f "$PROJECT_ROOT/scripts/sync-to-frontend.sh" ]; then
        echo ""
        bash "$PROJECT_ROOT/scripts/sync-to-frontend.sh"
    fi
    
    exit $EXIT_CODE
else
    echo "Running daily-runner.py (demo)..."
    python3 "$PROJECT_ROOT/scripts/daily-runner.py"
fi
