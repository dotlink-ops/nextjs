# Avidelta Setup Guide

This guide walks you through setting up the Avidelta automation system locally, configuring environment variables, and troubleshooting common issues.

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

Before you begin, ensure you have:

- **Python 3.12 or higher** - Check with `python3 --version`
- **Node.js 22 or higher** - Check with `node --version`
- **Git** - Check with `git --version`
- **GitHub account** - For API integration
- **OpenAI account** (optional) - For AI features, or use `--demo` mode

### Installing Prerequisites

#### macOS (Homebrew)
```bash
brew install python@3.12 node git
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3.12 python3-pip nodejs npm git
```

#### Windows (Chocolatey)
```bash
choco install python nodejs git
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dotlink-ops/Avidelta.git
cd Avidelta
```

### 2. Set Up Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate  # Windows

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r scripts/requirements.txt
```

**Note:** Always activate the virtual environment before running Python scripts.

### 3. Set Up Node.js Dependencies

```bash
# Install frontend dependencies
npm install

# Verify installation
npm run build
```

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file to create your local configuration:

```bash
cp .env.local.example .env.local
```

### 2. Configure Required Variables

Edit `.env.local` with your preferred text editor:

```bash
nano .env.local
# or
code .env.local
```

#### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | https://platform.openai.com/api-keys |
| `GITHUB_TOKEN` | GitHub personal access token | https://github.com/settings/tokens |
| `REPO_NAME` | GitHub repository (format: `owner/repo`) | e.g., `dotlink-ops/Avidelta` |

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
3. Give it a descriptive name: "Avidelta Automation"
4. Select scopes: `repo` and `workflow`
5. Click "Generate token"
6. Copy the token and paste it into `.env.local`

⚠️ **Security:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. OpenAI API Key Configuration

**Creating an OpenAI API Key:**

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name: "Avidelta"
4. Copy the key and paste it into `.env.local`

⚠️ **Note:** You'll need billing set up on your OpenAI account. Check https://platform.openai.com/account/billing

**Alternative: Demo Mode (No API Key Required)**

You can run the automation in demo mode without an OpenAI API key:

```bash
python3 scripts/daily_v2.py --demo
```

---

## Running the Automation

### 1. Demo Mode (No API Keys Required)

Perfect for testing and demonstrations:

```bash
source .venv/bin/activate
python3 scripts/daily_v2.py --demo
```

**What demo mode does:**
- Uses realistic test data
- Simulates API responses
- Creates example outputs
- Does not make real API calls
- Safe to run repeatedly

### 2. Dry-Run Mode (Validates Configuration)

Tests your configuration without making changes:

```bash
source .venv/bin/activate
python3 scripts/daily_v2.py --dry-run
```

**What dry-run mode does:**
- Validates API keys
- Simulates API calls
- Shows what would be created
- Does not create GitHub issues
- Does not commit changes

### 3. Production Mode (Full Automation)

Runs the complete automation workflow:

```bash
source .venv/bin/activate
python3 scripts/daily_v2.py
```

**What production mode does:**
- Reads notes from `output/notes/`
- Calls OpenAI API for summarization
- Creates GitHub issues from action items
- Saves results to `output/daily_summary.json`
- Creates audit logs in `output/audit_*.json`

### 4. View Results

```bash
# View latest summary
cat output/daily_summary.json | jq

# View audit logs
ls -lt output/audit_*.json | head -5

# View latest audit
cat $(ls -t output/audit_*.json | head -1) | jq
```

---

## Verification & Sanity Checks

### Daily Runner Sanity Check

Run this checklist before relying on automation in production:

#### ✅ Environment Setup

```bash
# 1. Verify Python version
python3 --version  # Should be 3.12+

# 2. Verify virtual environment is active
which python3  # Should show path to .venv/bin/python3

# 3. Verify dependencies installed
pip list | grep openai  # Should show openai package
pip list | grep requests  # Should show requests package
```

#### ✅ Environment Variables

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

- 🐛 **Found a bug?** Open an issue at https://github.com/dotlink-ops/Avidelta/issues
- 💬 **Have questions?** Start a discussion at https://github.com/dotlink-ops/Avidelta/discussions
- 📧 **Need support?** Contact the team at dotlink-ops

---

**Last Updated:** 2025-05-28
**Version:** 2.0
