# Setup Guide

This guide covers environment configuration and sanity checks for running Ariadne Nexus locally.

## Prerequisites

- **Node.js 18+** (20 or 22 recommended)
- **Python 3.11+**
- **Git**

## Quick Start

```bash
# Clone and setup
git clone https://github.com/dotlink-ops/Avidelta.git
cd Avidelta
./setup.sh
```

## Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

Edit `.env.local` with your actual values:

```bash
# Required for production mode
OPENAI_API_KEY=sk-...          # Get from https://platform.openai.com/api-keys
GITHUB_TOKEN=ghp_...           # Get from https://github.com/settings/tokens (repo scope)
REPO_NAME=owner/repo           # Your target repository

# Optional
OUTPUT_DIR=./output
NOTES_SOURCE=./output/notes
```

### 3. Verify Configuration

```bash
# Check .env.local exists and is gitignored
ls -la .env.local
git status .env.local   # Should show: ignored
```

## Daily Runner Sanity Checks

### Demo Mode (No API Keys Required)

Test the automation without API calls:

```bash
# Run in demo mode
python3 scripts/daily_v2.py --demo

# Expected output:
# ✓ Ingested 3 notes
# ✓ Generated summary (demo mode)
# ✓ Output saved to output/daily_summary.json
```

### Verify Output

```bash
# Check output file exists
ls -la output/daily_summary.json

# Validate JSON format
python3 -c "import json; json.load(open('output/daily_summary.json'))"

# View contents
cat output/daily_summary.json | python3 -m json.tool
```

### Production Mode (API Keys Required)

Once `.env.local` is configured:

```bash
# Activate virtual environment
source venv/bin/activate

# Run production mode
python3 scripts/daily_v2.py

# Expected output:
# ✓ API clients initialized successfully
# ✓ Generated summary using gpt-4-turbo-preview
# ✓ Created X GitHub issues
```

### Full Validation Suite

Run all checks:

```bash
bash scripts/validate.sh
```

This validates:
- Python environment
- Dependencies
- Configuration files
- Automation execution
- Output file format
- Next.js build

## Common Issues

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | `pip install -r scripts/requirements.txt` |
| `Missing OPENAI_API_KEY` | Edit `.env.local` or use `--demo` flag |
| `Invalid JSON output` | Re-run `python3 scripts/daily_v2.py --demo` |
| `Permission denied` | `chmod +x scripts/*.sh run-daily.sh` |

## Next.js Frontend

After running the automation:

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000

# Test API endpoint
curl http://localhost:3000/api/daily-summary
```

## Security Notes

- `.env.local` is gitignored—never commit API keys
- Use `--demo` flag for testing without API costs
- Rotate API keys periodically
