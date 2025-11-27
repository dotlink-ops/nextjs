# Automation Stack Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## Overview

This repository contains a production-ready automation stack that combines:

1. **Python Automation Scripts** - Daily runner that processes notes, generates summaries using OpenAI, and creates GitHub issues
2. **Next.js Portfolio App** - Modern web application showcasing the automation results
3. **Sync & Integration Scripts** - Glue code that connects the automation outputs to the frontend

### Key Features

✅ **One-Command Automation** - `./run-daily.sh` runs the entire workflow  
✅ **AI-Powered Summaries** - OpenAI integration for intelligent note processing  
✅ **GitHub Issue Creation** - Automatic issue creation and labeling  
✅ **Clean Architecture** - Separation of concerns with clear data flow  
✅ **Production Ready** - Error handling, logging, validation, and monitoring  
✅ **Demo Mode** - Run without API keys for testing and development

## Quick Start

### Prerequisites

- Python 3.9 or later
- Node.js 18 or later
- Git

### 1. Setup Automation Environment

```bash
# Run the setup script (creates venv, installs dependencies)
./scripts/setup-automation.sh
```

### 2. Configure API Keys (Optional for Demo)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your keys
# OPENAI_API_KEY=sk-...
# GITHUB_TOKEN=ghp_...
# REPO_NAME=owner/repo
```

### 3. Run the Automation

```bash
# Run in demo mode (no API calls)
./run-daily.sh --demo

# Run with real API calls (requires configured keys)
./run-daily.sh
```

### 4. Start the Next.js App

```bash
# Install Node dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### 5. Validate Everything

```bash
# Run comprehensive validation
./scripts/validate.sh
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Automation Flow                          │
└─────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │   Notes     │  (data/notes/*.md)
  │   Source    │
  └──────┬──────┘
         │
         v
  ┌─────────────────────┐
  │  daily_v2.py        │
  │  ┌───────────────┐  │
  │  │ 1. Ingest     │  │  Reads notes from files
  │  │ 2. Summarize  │  │  Calls OpenAI API
  │  │ 3. Issues     │  │  Creates GitHub issues
  │  │ 4. Output     │  │  Saves JSON data
  │  └───────────────┘  │
  └──────┬──────────────┘
         │
         v
  ┌─────────────────────┐
  │ daily_summary.json  │  (data/)
  └──────┬──────────────┘
         │
         v
  ┌─────────────────────┐
  │  sync-to-frontend   │  Updates sample outputs
  └──────┬──────────────┘
         │
         v
  ┌─────────────────────────────────────┐
  │         Next.js App                  │
  │  ┌────────────────────────────────┐ │
  │  │  /api/daily-summary            │ │
  │  │  /api/demo                     │ │
  │  │  /api/status                   │ │
  │  └────────────────────────────────┘ │
  └──────────────────────────────────────┘
```

### File Structure

```
nextjs/
├── scripts/                    # Python automation scripts
│   ├── daily-runner.py         # Demo/stub version
│   ├── daily_v2.py            # Production version
│   ├── setup-automation.sh    # Environment setup
│   ├── sync-to-frontend.sh    # Output sync script
│   ├── validate.sh            # Testing & validation
│   └── requirements.txt       # Python dependencies
├── data/                      # Data directory
│   ├── notes/                # Input: note files
│   ├── daily_summary.json    # Output: automation results
│   └── backups/              # Backup files
├── app/                      # Next.js app
│   ├── api/                 # API routes
│   │   ├── daily-summary/   # Main API endpoint
│   │   ├── demo/           # Demo data endpoint
│   │   ├── health/         # Health check
│   │   └── status/         # Status aggregation
│   ├── components/         # React components
│   └── page.tsx           # Landing page
├── SAMPLE_OUTPUTS/          # Sample/demo outputs
│   ├── daily_runner_summary.txt
│   └── issue_pipeline_log.txt
├── run-daily.sh            # Main entry point
├── .env.example           # Environment template
└── README.md
```

## Installation

### Python Environment Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r scripts/requirements.txt
```

### Next.js Setup

```bash
# Install Node dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# OpenAI API key (for AI summaries)
OPENAI_API_KEY=sk-your-key-here

# GitHub token with repo scope (for issue creation)
GITHUB_TOKEN=ghp_your-token-here

# Target repository (format: owner/repo)
REPO_NAME=your-username/your-repo

# Optional: Data directories
NOTES_SOURCE=./data/notes
OUTPUT_DIR=./data
```

### GitHub Token Permissions

Your GitHub token needs:
- ✅ `repo` scope (for private repositories)
- ✅ `public_repo` scope (for public repositories)

Create a token at: https://github.com/settings/tokens

### OpenAI API Setup

1. Get an API key from: https://platform.openai.com/api-keys
2. Add credits to your account
3. Recommended model: `gpt-4-turbo-preview` (configurable in `daily_v2.py`)

## Usage

### Running the Automation

#### Demo Mode (No API calls)

```bash
./run-daily.sh --demo
```

**Output:**
- Creates `data/daily_summary.json` with sample data
- Updates `SAMPLE_OUTPUTS/` files
- No API calls, no costs

#### Production Mode (With APIs)

```bash
# Ensure .env.local is configured
./run-daily.sh
```

**What it does:**
1. Reads notes from `data/notes/`
2. Calls OpenAI to generate summary
3. Creates GitHub issues from action items
4. Saves structured JSON output
5. Syncs data to frontend
6. Creates backup

### Adding Notes

Create markdown or text files in `data/notes/`:

```bash
# Example note
cat > data/notes/2025-11-27.md << EOF
# Daily Notes - 2025-11-27

- Implement user authentication
- Fix bug in payment processing
- Update documentation for API v2
- Schedule meeting with design team
EOF

# Run automation
./run-daily.sh
```

### Accessing the Frontend

```bash
# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

**Available Pages:**
- `/` - Portfolio landing page
- `/api/daily-summary` - Latest automation results (JSON)
- `/api/demo` - Sample outputs (JSON)
- `/api/status` - Health and status (JSON)

### Scheduled Automation (Cron)

Add to your crontab for daily automation:

```bash
# Edit crontab
crontab -e

# Run daily at 9 AM
0 9 * * * cd /path/to/nextjs && ./run-daily.sh >> /var/log/daily-automation.log 2>&1
```

## API Reference

### GET /api/daily-summary

Returns the latest automation results.

**Response:**
```json
{
  "date": "2025-11-27",
  "created_at": "2025-11-27T10:00:00Z",
  "repo": "owner/repo",
  "summary_bullets": [
    "Processed 5 notes from daily workflow",
    "Identified 3 high-priority action items"
  ],
  "action_items": [
    "Implement user authentication",
    "Fix bug in payment processing"
  ],
  "assessment": "Key outcomes: 3 actionable items identified.",
  "issues_created": 3,
  "issues": [
    {
      "number": 42,
      "title": "Implement user authentication",
      "url": "https://github.com/owner/repo/issues/42",
      "labels": ["feature", "automation"]
    }
  ],
  "metadata": {
    "runner_version": "2.0.0",
    "demo_mode": false,
    "notes_count": 5
  },
  "_metadata": {
    "fetched_at": "2025-11-27T10:05:00Z",
    "api_version": "1.0"
  }
}
```

**Caching:** 60 seconds with stale-while-revalidate

### GET /api/demo

Returns sample automation outputs for demonstration.

**Response:**
```json
{
  "summary": "Daily Runner — Generated Summary\n...",
  "log": "[2025-11-27T10:00:00Z] INFO: Starting issue pipeline\n...",
  "_metadata": {
    "fetched_at": "2025-11-27T10:05:00Z",
    "type": "demo"
  }
}
```

**Caching:** 5 minutes with stale-while-revalidate

### GET /api/health

Basic health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

### GET /api/status

Aggregated status information.

**Response:**
```json
{
  "ok": true,
  "ready": true,
  "name": "nextjs",
  "version": "0.1.0",
  "next": "16.0.0",
  "node": "v18.17.0",
  "uptimeSeconds": 3600,
  "startedAt": "2025-11-27T09:00:00Z",
  "serverTimestamp": "2025-11-27T10:00:00Z"
}
```

## Deployment

### Vercel (Recommended)

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Automatic Deployment (GitHub Integration)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repository: `dotlink-ops/nextjs`
3. Configure:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables (optional):
   - `OPENAI_API_KEY`
   - `GITHUB_TOKEN`
   - `REPO_NAME`
5. Deploy

**Result:**
- Production: https://avidelta.vercel.app
- Preview: Automatic for every PR

### Docker (Alternative)

```bash
# Build image
docker build -t nextjs-automation .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  -e REPO_NAME=$REPO_NAME \
  nextjs-automation
```

### VPS/Server

```bash
# Clone repository
git clone https://github.com/dotlink-ops/nextjs.git
cd nextjs

# Setup automation
./scripts/setup-automation.sh

# Setup Next.js
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "nextjs-app" -- start
pm2 save

# Setup cron for automation
crontab -e
# Add: 0 9 * * * cd /path/to/nextjs && ./run-daily.sh
```

## Troubleshooting

### Common Issues

#### 1. Python dependencies not installed

**Error:** `ModuleNotFoundError: No module named 'openai'`

**Solution:**
```bash
source venv/bin/activate
pip install -r scripts/requirements.txt
```

#### 2. API keys not configured

**Error:** `⚠️ OPENAI_API_KEY not configured`

**Solution:**
```bash
cp .env.example .env.local
# Edit .env.local and add your keys
```

#### 3. GitHub rate limit exceeded

**Error:** `github.GithubException.RateLimitExceededException`

**Solution:**
- Use an authenticated token (not anonymous)
- Wait for rate limit reset
- Upgrade to GitHub Pro for higher limits

#### 4. Next.js build fails

**Error:** Build errors during `npm run build`

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 5. Virtual environment activation fails

**Error:** `source: command not found`

**Solution:**
```bash
# Make sure you're in the project root
cd /path/to/nextjs

# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
```

### Validation

Run the validation script to check your setup:

```bash
./scripts/validate.sh
```

**Expected Output:**
- ✓ All critical tests passed
- ⚠ Warnings (API keys, optional features)
- ✗ Failures (missing dependencies, configuration)

### Logs

#### Automation Logs

```bash
# View audit logs
ls -la data/audit_*.json

# View latest audit log
cat data/audit_$(ls -t data/audit_*.json | head -1)
```

#### Next.js Logs

```bash
# Development server logs (console output)
npm run dev

# Production server logs
npm start 2>&1 | tee logs/nextjs.log
```

### Debug Mode

Enable verbose logging:

```bash
# Python automation
export PYTHONVERBOSE=1
./run-daily.sh --demo

# Next.js
export NODE_ENV=development
npm run dev
```

## Development

### Project Structure

```
scripts/          # Automation scripts
├── daily_v2.py   # Main automation (production)
├── *.sh          # Shell scripts (setup, sync, validate)
└── requirements.txt

app/              # Next.js application
├── api/          # API routes
├── components/   # React components
└── page.tsx      # Main page

data/             # Data files
├── notes/        # Input notes
└── *.json        # Output files
```

### Adding New Features

#### 1. Add a New Automation Step

Edit `scripts/daily_v2.py`:

```python
def custom_processing(self, notes: List[str]) -> Dict[str, Any]:
    """Add custom processing logic"""
    # Your code here
    return result

def run(self) -> int:
    # Add to the workflow
    notes = self.ingest_notes()
    summary = self.generate_summary(notes)
    custom_data = self.custom_processing(notes)  # New step
    # ...
```

#### 2. Add a New API Endpoint

Create `app/api/your-endpoint/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const data = { message: "Hello" };
  return NextResponse.json(data);
}
```

#### 3. Add New Tests

Edit `scripts/validate.sh`:

```bash
echo "🆕 Your New Test"
if your_test_command; then
    test_pass "Your test passed"
else
    test_fail "Your test failed"
fi
```

### Code Style

**Python:**
- Follow PEP 8
- Use type hints
- Document with docstrings

**TypeScript:**
- Use TypeScript strict mode
- Follow Next.js conventions
- Use functional components

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation: `./scripts/validate.sh`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📧 Email: support@avidelta.com
- 🐛 Issues: https://github.com/dotlink-ops/nextjs/issues
- 📅 Book a call: https://cal.com/avidelta/15min

---

**Last Updated:** 2025-11-27  
**Version:** 2.0.0
