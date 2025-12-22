# nexus-core Setup Guide

This guide walks you through setting up the nexus-core automation system locally, configuring environment variables, and troubleshooting common issues.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Automation](#running-the-automation)
- [Verification & Sanity Checks](#verification--sanity-checks)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

- **Node.js 18+** (20 or 22 recommended)
- **Python 3.11+**
- **Git**

## Quick Start

```bash
git clone https://github.com/dotlink-ops/nexus-core.git
cd nexus-core
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

#### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | https://platform.openai.com/api-keys |
| `GITHUB_TOKEN` | GitHub personal access token | https://github.com/settings/tokens |
| `REPO_NAME` | GitHub repository (format: `owner/repo`) | e.g., `dotlink-ops/nexus-core` |

#### Optional Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4-turbo-preview` |
| `OUTPUT_DIR` | Directory for automation outputs | `./output` |
| `NOTES_SOURCE` | Directory containing input notes | `./output/notes` |
| `MAX_TOKENS` | Maximum tokens for AI responses | `500` |
| `TEMPERATURE` | AI creativity level (0.0-1.0) | `0.7` |

### 3. GitHub Token Configuration

Your GitHub token needs the following scopes:

- ✅ `repo` - Full repository access (to create issues)
- ✅ `workflow` - Update GitHub Actions workflows

**Creating a GitHub Personal Access Token:**

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "nexus-core Automation"
4. Select scopes: `repo` and `workflow`
5. Click "Generate token"
6. Copy the token and paste it into `.env.local`

⚠️ **Security:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. OpenAI API Key Configuration

**Creating an OpenAI API Key:**

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name: "nexus-core"
4. Copy the key and paste it into `.env.local`

⚠️ **Note:** You'll need billing set up on your OpenAI account. Check https://platform.openai.com/account/billing

**Alternative: Demo Mode (No API Key Required)**

You can run the automation in demo mode without an OpenAI API key:

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

```bash
# 4. Verify .env.local exists
ls -la .env.local  # Should exist

# 5. Check required variables are set (without exposing values)
grep -q "OPENAI_API_KEY" .env.local && echo "✅ OPENAI_API_KEY set" || echo "❌ OPENAI_API_KEY missing"
grep -q "GITHUB_TOKEN" .env.local && echo "✅ GITHUB_TOKEN set" || echo "❌ GITHUB_TOKEN missing"
grep -q "REPO_NAME" .env.local && echo "✅ REPO_NAME set" || echo "❌ REPO_NAME missing"
```

#### ✅ API Connectivity

```bash
# 6. Test OpenAI API (requires API key)
python3 -c "
import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
response = client.chat.completions.create(
    model='gpt-4-turbo-preview',
    messages=[{'role': 'user', 'content': 'Say hello'}],
    max_tokens=10
)
print('✅ OpenAI API working:', response.choices[0].message.content)
"

# 7. Test GitHub API (requires token)
python3 -c "
import os
import requests
token = os.getenv('GITHUB_TOKEN')
headers = {'Authorization': f'token {token}'}
response = requests.get('https://api.github.com/user', headers=headers)
print('✅ GitHub API working:', response.json().get('login'))
"
```

#### ✅ File System

```bash
# 8. Verify output directories exist
ls -ld output output/notes output/backups

# 9. Check permissions
touch output/test.txt && rm output/test.txt && echo "✅ Write permissions OK" || echo "❌ Write permissions failed"
```

#### ✅ Daily Runner Execution

```bash
# 10. Run demo mode
python3 scripts/daily_v2.py --demo
echo "Exit code: $?"  # Should be 0

# 11. Verify demo output created
ls -lh output/daily_summary.json

# 12. Validate JSON structure
cat output/daily_summary.json | jq '.highlights, .action_items, .key_decisions' > /dev/null && echo "✅ JSON structure valid" || echo "❌ JSON structure invalid"
```

---

## Troubleshooting

### Common Issues

#### ❌ `ModuleNotFoundError: No module named 'openai'`

**Cause:** Virtual environment not activated or dependencies not installed.

**Solution:**
```bash
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

#### ❌ `openai.AuthenticationError: Incorrect API key provided`

**Cause:** Invalid or missing OpenAI API key.

**Solution:**
1. Verify key in `.env.local` has no extra spaces
2. Check key is valid at https://platform.openai.com/api-keys
3. Ensure billing is set up at https://platform.openai.com/account/billing

#### ❌ `GitHub API returned 401 Unauthorized`

**Cause:** Invalid or missing GitHub token.

**Solution:**
1. Regenerate token at https://github.com/settings/tokens
2. Ensure scopes include `repo` and `workflow`
3. Update token in `.env.local`

#### ❌ `FileNotFoundError: [Errno 2] No such file or directory: 'output/notes'`

**Cause:** Notes directory doesn't exist.

**Solution:**
```bash
mkdir -p output/notes
echo "Test note for automation" > output/notes/test.md
```

#### ❌ `PermissionError: [Errno 13] Permission denied: 'output/daily_summary.json'`

**Cause:** File is locked or permissions issue.

**Solution:**
```bash
chmod 644 output/daily_summary.json
# or
rm output/daily_summary.json  # Will be recreated
```

#### ❌ Demo mode works but production mode fails

**Cause:** API credentials issue or rate limiting.

**Solution:**
1. Run dry-run mode to isolate issue: `python3 scripts/daily_v2.py --dry-run`
2. Check OpenAI usage at https://platform.openai.com/usage
3. Verify GitHub rate limits: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`

---

## Advanced Configuration

### Custom Notes Location

To read notes from a different directory:

```bash
# .env.local
NOTES_SOURCE=/path/to/your/notes
```

### Custom Output Location

To save outputs to a different directory:

```bash
# .env.local
OUTPUT_DIR=/path/to/outputs
```

### Adjusting AI Behavior

#### More Creative Responses
```bash
TEMPERATURE=0.9  # Higher = more creative (0.0-1.0)
```

#### Longer Summaries
```bash
MAX_TOKENS=1000  # More tokens = longer responses
```

#### Different Model
```bash
OPENAI_MODEL=gpt-4-turbo-preview  # or gpt-4, gpt-3.5-turbo
```

### GitHub Actions Secrets

For production deployment via GitHub Actions, set these secrets in your repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add repository secrets:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GITHUB_TOKEN` - Auto-provided by GitHub Actions (no setup needed)

---

## Next Steps

- ✅ **Automation is working?** → Review `ARCHITECTURE.md` to understand the system
- 🔒 **Ready for production?** → Complete `docs/SECURITY_CHECKLIST.md`
- 🎨 **Customize the frontend?** → Check `design/README.md` for design tokens
- 🤖 **Automate daily runs?** → Configure GitHub Actions in `.github/workflows/daily-run.yml`

---

## Related Documentation

- `README.md` - Project overview and quick start
- `ARCHITECTURE.md` - System architecture and data flow
- `SECURITY_COMPLIANCE.md` - Security posture and compliance
- `.env.local.example` - Complete environment variable reference
- `docs/PRE_COMMIT_GUIDE.md` - Pre-commit hooks setup
- `docs/SECURITY_HARDENING.md` - Production security guide

---

## Getting Help

- 🐛 **Found a bug?** Open an issue at https://github.com/dotlink-ops/nexus-core/issues
- 💬 **Have questions?** Start a discussion at https://github.com/dotlink-ops/nexus-core/discussions
- 📧 **Need support?** Contact the team at dotlink-ops

---

**Last Updated:** 2025-05-28
**Version:** 2.0
