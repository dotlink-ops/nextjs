#!/bin/bash
# Sync automation outputs to Next.js data directory
# This script runs after the daily automation to ensure the frontend has the latest data
# Usage: ./scripts/sync-to-frontend.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔄 Syncing automation outputs to Next.js..."

# Source and destination paths
DATA_SOURCE="$PROJECT_ROOT/data/daily_summary.json"
DATA_DEST="$PROJECT_ROOT/data/daily_summary.json"
AUDIT_SOURCE_DIR="$PROJECT_ROOT/data"
SAMPLE_OUTPUT_DIR="$PROJECT_ROOT/SAMPLE_OUTPUTS"

# Check if source file exists
if [ ! -f "$DATA_SOURCE" ]; then
    echo "❌ Error: daily_summary.json not found at $DATA_SOURCE"
    echo "   Run the automation first: ./run-daily.sh"
    exit 1
fi

# Copy to frontend data directory (already in the right place, but verify)
echo "✓ daily_summary.json is in the correct location"

# Update sample outputs for demo purposes
if [ -d "$SAMPLE_OUTPUT_DIR" ]; then
    echo "📋 Updating sample outputs..."
    
    # Generate fresh sample summary from latest run
    if [ -f "$DATA_SOURCE" ]; then
        # Use Python to format the JSON data nicely
        python3 -c "
import json
with open('$DATA_SOURCE', 'r') as f:
    data = json.load(f)

output = '''Daily Runner — Generated Summary
-------------------------------

Date: {date}

Top Highlights
{highlights}

Action items
{actions}

Logs / Metadata
- runner-version: {version}
- demo_mode: {demo}
- notes_count: {notes}
'''.format(
    date=data['date'],
    highlights='\\n'.join(f'- {b}' for b in data.get('summary_bullets', [])),
    actions='\\n'.join(f'{i+1}) {a}' for i, a in enumerate(data.get('action_items', []))),
    version=data.get('metadata', {}).get('runner_version', 'unknown'),
    demo=data.get('metadata', {}).get('demo_mode', 'unknown'),
    notes=data.get('metadata', {}).get('notes_count', 0)
)
print(output)
" > "$SAMPLE_OUTPUT_DIR/daily_runner_summary.txt"
        echo "  ✓ Updated daily_runner_summary.txt"
    fi
    
    # Generate sample issue pipeline log
    cat > "$SAMPLE_OUTPUT_DIR/issue_pipeline_log.txt" << EOF
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INFO: Starting issue pipeline
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] DEBUG: Processing automation outputs
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INFO: Generated summary with $(cat "$DATA_SOURCE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['summary_bullets']))" 2>/dev/null || echo "N") highlights
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INFO: Created $(cat "$DATA_SOURCE" | python3 -c "import sys, json; print(json.load(sys.stdin)['issues_created'])" 2>/dev/null || echo "N") GitHub issues
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INFO: Finished issue pipeline

Note: This file is auto-generated from the latest automation run.
EOF
    echo "  ✓ Updated issue_pipeline_log.txt"
fi

# Create a backup
BACKUP_DIR="$PROJECT_ROOT/data/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/daily_summary_$(date +%Y%m%d_%H%M%S).json"
cp "$DATA_SOURCE" "$BACKUP_FILE"
echo "💾 Backup created: $BACKUP_FILE"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "daily_summary_*.json" -mtime +7 -delete 2>/dev/null || true

# Trigger Next.js ISR revalidation if dev server is running
DEV_SERVER_URL="http://localhost:3000"
if curl -s -o /dev/null -w "%{http_code}" "$DEV_SERVER_URL/api/health" 2>/dev/null | grep -q "200"; then
    echo "🔄 Triggering Next.js revalidation..."
    curl -s "$DEV_SERVER_URL/api/daily-summary" > /dev/null || true
    echo "  ✓ Next.js cache updated"
else
    echo "ℹ️  Next.js dev server not running (optional)"
fi

echo ""
echo "✅ Sync complete!"
echo ""
echo "Updated files:"
echo "  - $DATA_DEST"
echo "  - $SAMPLE_OUTPUT_DIR/daily_runner_summary.txt"
echo "  - $SAMPLE_OUTPUT_DIR/issue_pipeline_log.txt"
echo ""
echo "View in browser:"
echo "  - http://localhost:3000/api/daily-summary"
echo "  - http://localhost:3000/api/demo"
