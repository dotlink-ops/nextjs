# AI-Powered Automation Portfolio

> **One-command daily runner that transforms work notes into structured summaries and GitHub issues using AI**

A production-ready automation framework demonstrating Python + OpenAI + GitHub API integration with a Next.js dashboard. Built for solo operators, small teams, and portfolio demonstration.

**Live Demo:** https://avidelta.vercel.app

---

## 🎯 One-Line Pitch

A full-stack automation system that ingests daily notes, generates AI summaries, creates GitHub issues automatically, and serves results through a modern Next.js dashboard—showcasing production-grade Python automation and frontend integration.

---

## 📋 Table of Contents

- [What This Does](#what-this-does)
- [Why It Matters](#why-it-matters)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Portfolio Notes](#portfolio-notes)

---

## 🚀 What This Does

This project provides a complete automation workflow:

1. **📥 Note Ingestion**: Reads markdown/text files from `output/notes/`
2. **🤖 AI Summarization**: Uses OpenAI GPT-4 Turbo to extract highlights, action items, and assessments
3. **📋 GitHub Integration**: Automatically creates labeled issues from action items
4. **💾 JSON Output**: Saves structured data to `output/daily_summary.json`
5. **🌐 Next.js Dashboard**: Serves results through modern API routes and React components
6. **📊 Audit Logs**: Maintains timestamped audit trail in `output/audit_*.json`

### Demo Mode

Works out-of-the-box without API keys using realistic demo data—perfect for testing and demonstrations.

```bash
# Run automation with demo data (no API keys needed)
python3 scripts/daily_v2.py --demo

# View results
cat output/daily_summary.json | jq
```

---

## 💡 Why It Matters

**For Solo Operators & Small Teams:**
- ⏱️ Reduces daily synthesis time from 15-30 minutes to < 5 seconds
- 📝 Maintains clear audit trail for compliance and handoffs
- 🔄 Ensures repeatable, documented workflows

**For Portfolio/Client Demonstration:**
- 🏗️ Shows production-ready Python automation patterns
- 🔗 Demonstrates API integration (OpenAI + GitHub)
- 🎨 Showcases modern frontend (Next.js 16 + React 19)
- ✅ Includes CI/CD, testing, and deployment practices

**Business Value:**
- Fewer manual handoffs → faster iterations
- Structured outputs → better stakeholder communication  
- Repeatable process → easier team onboarding

---

## 🛠️ Tech Stack

### Backend (Python Automation)
- **Python 3.11** with virtual environment isolation
- **OpenAI API** (GPT-4 Turbo) for intelligent summarization
- **GitHub API** (PyGithub) for issue creation and labeling
- **Type hints & logging** for maintainability

### Frontend (Next.js Dashboard)
- **Next.js 16.0.0** with App Router
- **React 19.2.0** with TypeScript strict mode
- **Tailwind CSS 4** for styling
- **API Routes** for JSON serving and health checks

### Infrastructure
- **Vercel** for automatic deployments
- **GitHub Actions** for CI/CD (Node 18/20/22 testing)
- **Environment Variables** for secret management
- **Audit Logs** for compliance

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** (20 or 22 recommended)
- **Python 3.11+**
- **Git**

### One-Command Setup ⭐

```bash
# Clone repository
git clone https://github.com/dotlink-ops/nextjs.git
cd nextjs

# Run automated setup (Python + Next.js)
./setup.sh
```

**What the setup script does:**
1. ✅ Checks prerequisites (Python 3, Node.js, npm)
2. ✅ Creates Python virtual environment (venv/)
3. ✅ Installs Python dependencies (openai, PyGithub, python-dotenv)
4. ✅ Installs Node.js dependencies (Next.js, React, TypeScript)
5. ✅ Creates .env.local from template
6. ✅ Sets up output directories
7. ✅ Provides clear next steps

**Time to complete:** ~2-3 minutes (depending on internet speed)

### Manual Installation (Alternative)

If you prefer manual setup or need more control:

```bash
# 1. Clone repository
git clone https://github.com/dotlink-ops/nextjs.git
cd nextjs

# 2. Install Node.js dependencies
npm install

# 3. Set up Python environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r scripts/requirements.txt

# 4. Configure environment (optional for demo mode)
cp .env.example .env.local
# Edit .env.local with your API keys (or skip for demo mode)

# 5. Test the stack
python3 scripts/daily_v2.py --demo  # Test Python automation
npm run build                        # Test Next.js build
```

### First Run

```bash
# Start Next.js dev server
npm run dev

# In another terminal: Run automation (demo mode)
python3 scripts/daily_v2.py --demo

# View results
open http://localhost:3000
open http://localhost:3000/api/daily-summary
```

**Expected Output:**
- ✅ Python script completes in < 1 second
- ✅ `output/daily_summary.json` created
- ✅ Audit log saved to `output/audit_*.json`
- ✅ Next.js dashboard shows summary at http://localhost:3000

---

## 🏗️ Architecture

### Directory Structure

```
nextjs/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── daily-summary/       # Main automation output endpoint
│   │   ├── demo/                # Demo endpoints
│   │   └── health/              # Health checks
│   ├── components/              # React components
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Homepage
├── components/                  # Shared React components
│   └── DailySummaryPanel.tsx   # Main dashboard component
├── scripts/                     # Python automation stack
│   ├── daily_v2.py             # Main automation runner (370 lines)
│   ├── requirements.txt        # Python dependencies
│   ├── setup-automation.sh     # Environment setup script
│   ├── sync-to-frontend.sh     # Output sync script
│   └── validate.sh             # Comprehensive testing
├── output/                      # Automation outputs (gitignored except samples)
│   ├── daily_summary.json      # Main output (served by API)
│   ├── audit_*.json            # Timestamped audit logs
│   ├── backups/                # Backup copies
│   └── notes/                  # Input notes directory
├── .github/workflows/          # CI/CD pipelines
├── venv/                       # Python virtual environment
└── .env.local                  # Environment variables (gitignored)
```

### Data Flow

```
📝 Notes (output/notes/*.md)
    ↓
🤖 daily_v2.py (Python + OpenAI)
    ↓
💾 daily_summary.json (structured JSON)
    ↓
🌐 /api/daily-summary (Next.js API route)
    ↓
⚛️ DailySummaryPanel (React component)
    ↓
👤 User Dashboard
```

### Key Integration Points

1. **Python → JSON**: `scripts/daily_v2.py` outputs to `output/daily_summary.json`
2. **JSON → API**: `app/api/daily-summary/route.ts` serves the JSON with caching
3. **API → UI**: `components/DailySummaryPanel.tsx` fetches and renders data
4. **Sync Script**: `scripts/sync-to-frontend.sh` handles backups and updates

---

## 📖 Usage

### Running the Automation

#### Demo Mode (No API Keys Required)

```bash
# Run with demo data
python3 scripts/daily_v2.py --demo

# View output
cat output/daily_summary.json | jq '.summary_bullets'
```

#### Production Mode (With API Keys)

```bash
# 1. Activate Python environment
source venv/bin/activate

# 2. Add notes to process
echo "Implement user authentication system" > output/notes/todo.md
echo "Fix database migration error on staging" > output/notes/bugs.txt

# 3. Run automation
python3 scripts/daily_v2.py

# 4. Check results
cat output/daily_summary.json | jq
```

#### Using the Wrapper Script

```bash
# Automated setup + run + sync
./run-daily.sh

# With demo mode
./run-daily.sh --demo
```

### Testing the Stack

```bash
# Validate everything
bash scripts/validate.sh

# Test Python only
python3 scripts/daily_v2.py --demo

# Test Next.js build
npm run build

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/daily-summary | jq

# Run comprehensive checks
npm run lint
```

---

## 🌐 API Endpoints

### Main Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Portfolio homepage | [View](https://avidelta.vercel.app) |
| `/api/daily-summary` | Automation output (JSON) | [View](https://avidelta.vercel.app/api/daily-summary) |
| `/api/demo/view` | Demo visualization | [View](https://avidelta.vercel.app/api/demo/view) |
| `/api/status` | Comprehensive status | [View](https://avidelta.vercel.app/api/status) |

### Health Checks

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/api/health` | Basic liveness | `{ ok: true }` |
| `/api/healthz` | Detailed health | `{ ok, commit, time }` |
| `/api/ready` | Readiness check | `{ ready: true }` |
| `/api/version` | Version info | `{ name, version, next, node }` |
| `/api/uptime` | Process uptime | `{ uptimeSeconds, startedAt }` |
| `/api/ping` | Timestamp echo | `{ ok, serverTimestamp }` |

### Quick Verification

```bash
# Production endpoints
curl -sS https://avidelta.vercel.app/api/status | jq
curl -sS https://avidelta.vercel.app/api/daily-summary | jq
curl -sS https://avidelta.vercel.app/api/health

# Local development
curl -sS http://localhost:3000/api/status | jq
curl -sS http://localhost:3000/api/daily-summary | jq
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` from template:

```bash
cp .env.example .env.local
```

**Required for Production Mode:**

```bash
# OpenAI API key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# GitHub token with repo scope (get from https://github.com/settings/tokens)
GITHUB_TOKEN=ghp_...

# Target repository (format: owner/repo)
REPO_NAME=dotlink-ops/nextjs
```

**Optional:**

```bash
# Customize paths
OUTPUT_DIR=./output
NOTES_SOURCE=./output/notes
```

### Security Notes

- ✅ `.env.local` is gitignored automatically
- ✅ `.env.example` provides template (no real keys)
- ✅ Never commit secrets to repository
- ✅ Use environment variables in Vercel for production

### Python Dependencies

```bash
# View requirements
cat scripts/requirements.txt

# Install in virtual environment
source venv/bin/activate
pip install -r scripts/requirements.txt

# Verify installation
pip list | grep -E "openai|github|dotenv"
```

---

## 🧪 Testing

### Automated Validation

```bash
# Run comprehensive test suite
bash scripts/validate.sh
```

**Tests Include:**
- ✅ Python environment check
- ✅ Dependency verification
- ✅ File structure validation
- ✅ Automation script execution (demo mode)
- ✅ Output file validation
- ✅ Next.js build test
- ✅ TypeScript compilation
- ✅ ESLint checks

### Manual Testing

```bash
# Test Python automation
python3 scripts/daily_v2.py --demo
ls -la output/

# Test Next.js
npm run build
npm start

# Test API routes
curl http://localhost:3000/api/health
curl http://localhost:3000/api/daily-summary | jq
```

### CI/CD

GitHub Actions automatically tests:
- ✅ Next.js builds on Node 18, 20, 22
- ✅ TypeScript compilation
- ✅ ESLint validation
- ✅ Runs on every push and PR

See `.github/workflows/webpack.yml` for details.

---

## 🚢 Deployment

### Automatic Deployment (Recommended)

**Already configured!** Push to `main` branch:

```bash
git add .
git commit -m "Update automation logic"
git push origin main
```

**What Happens:**
1. ✅ GitHub triggers Vercel deployment
2. ✅ Next.js builds automatically
3. ✅ Deploys to https://avidelta.vercel.app
4. ✅ All API routes are live immediately

### Manual Deployment

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `nextjs`
3. Settings → Environment Variables
4. Add: `OPENAI_API_KEY`, `GITHUB_TOKEN`, `REPO_NAME`
5. Choose environments: Production, Preview, Development

### Deployment Checklist

Before deploying:
- ✅ Test build locally: `npm run build`
- ✅ Validate automation: `python3 scripts/daily_v2.py --demo`
- ✅ Run test suite: `bash scripts/validate.sh`
- ✅ Check API routes: `curl http://localhost:3000/api/status`
- ✅ Verify environment variables are set in Vercel
- ✅ Confirm `.env.local` is gitignored (never commit secrets)

---

## 💼 Portfolio Notes

### What This Project Demonstrates

**For Automation Engineers:**
- ✅ Production-ready Python automation with proper error handling
- ✅ API integration (OpenAI + GitHub) with fallback mechanisms
- ✅ Virtual environment discipline and dependency management
- ✅ Structured logging and audit trails
- ✅ Demo mode for testing without API costs

**For Full-Stack Developers:**
- ✅ Modern Next.js 16 App Router architecture
- ✅ TypeScript strict mode with proper typing
- ✅ API route design with caching and error handling
- ✅ React 19 component patterns
- ✅ Production deployment with Vercel

**For DevOps/SRE:**
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Health check endpoints for monitoring
- ✅ Environment variable management
- ✅ Audit logging for compliance
- ✅ Automated testing and validation

### Key Outcomes

- **Time Saved**: 15-30 minutes daily → < 5 seconds
- **Reliability**: Repeatable, tested, documented workflow
- **Handoff-Ready**: Clear structure, comprehensive docs
- **Portfolio-Grade**: Production patterns, not prototypes

### For Upwork Clients

**What you get:**
- A working automation framework you can adapt to your workflows
- Clear documentation for maintenance and extension
- Production-grade code with error handling and logging
- Demo mode for testing before committing API costs

**Customization options:**
- Adapt to your note sources (Notion, Obsidian, file shares)
- Customize AI prompts for your domain
- Add integrations (Slack, email, databases)
- Extend UI with custom dashboards

---

## 🔗 Links

- **Live Demo**: https://avidelta.vercel.app
- **GitHub**: https://github.com/dotlink-ops/nextjs
- **Documentation**: See `AUTOMATION_GUIDE.md`, `QUICKSTART.md`
- **Sample Outputs**: See `SAMPLE_OUTPUTS/` directory

---

## 📚 Additional Documentation

- **AUTOMATION_GUIDE.md**: Detailed automation documentation
- **QUICKSTART.md**: Quick reference for common tasks
- **DEMO.md**: Step-by-step demo walkthrough
- **UPWORK.md**: Portfolio messaging and one-liners
- **PRODUCTION_READY.md**: Production readiness verification
- **.copilot-instructions.md**: AI assistant usage guide
- **codex-assistant.mjs**: Repo Copilot configuration for AI assistants
- **FIXES_SUMMARY.md**: Change log and architecture decisions
- **project.config**: Explicit configuration reference

### 🤖 AI Assistant Integration

This repository includes **Avidelta Repo Copilot** configuration:

- **`codex-assistant.mjs`**: Full-stack AI assistant configuration
  - Complete repository architecture knowledge
  - 6-step systematic debugging workflow
  - Common issues & solutions reference
  - Enforces small, tested, incremental changes

- **`.copilot-instructions.md`**: Usage patterns and example queries
  - How to ask effective debugging questions
  - Test command expectations
  - Core development principles

**To use:** Import `codex-assistant.mjs` into your AI assistant (GitHub Copilot, ChatGPT, Claude) for context-aware development with comprehensive repo knowledge.

---

## 🤝 Contributing

For pull request guidelines, see `.github/CONTRIBUTING.md`.

**Quick tips:**
- Keep changes small and focused
- Test thoroughly before submitting
- Provide test commands in PR description
- Follow existing code patterns

---

## 📄 License

Private repository. All rights reserved.

---

## 💬 Questions?

This project demonstrates production automation patterns. For customization, integration questions, or collaboration inquiries, reach out via GitHub issues or direct contact.

**Built with care by [automation.link](https://automation.link)** 🤖
