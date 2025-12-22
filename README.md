# nexus-core Automation + Portfolio Stack

![Daily run status](https://github.com/dotlink-ops/nexus-core/actions/workflows/daily-run.yml/badge.svg)

Ariadne Nexus (or just "Nexus") is a full-stack automation system that combines a **Python automation engine** with a **Next.js frontend**. It ingests daily notes, generates AI-powered summaries, creates GitHub issues automatically, and serves results through a modern dashboard.

**Live Demo:** https://www.ariadnenexus.com

---

## 🏗️ What is nexus-core?

**nexus-core** (branded as **Ariadne Nexus** for clients) is a **production automation platform** that demonstrates how to build AI-powered workflows for real-world business operations. It combines:

1. **Note Ingestion** — Reads markdown/text files from `output/notes/`
2. **AI Summarization** — Uses OpenAI GPT-4 to extract highlights, action items, and assessments
3. **GitHub Integration** — Creates labeled issues from action items
4. **JSON Output** — Saves structured data to `output/daily_summary.json`
5. **Dashboard** — Serves results through Next.js API routes and React components

---

## 🎯 One-Line Pitch

A full-stack automation system that ingests daily notes, generates AI summaries, creates GitHub issues automatically, and serves results through a modern Next.js dashboard—showcasing production-grade Python automation and frontend integration.

---

## 🎨 Design

UI is sourced from our Figma file (design system + page layouts).  
See `design/README.md` for the canonical Figma link and guidelines.

---

## 💼 What This Project Demonstrates

## Runtime Rule

All API routes run on Node by default.

Edge runtime is opt-in, must be listed in `runtime-policy.json`, and must not use Node APIs.

This keeps humans and machines aligned.


- A one-command **daily runner** (Python) that:
  - Activates a virtual environment
  - Pulls unstructured notes from a local directory (markdown/text)
  - Uses the OpenAI API to generate clean, structured daily summaries
  - Can create labeled GitHub issues from action items
  - Supports `--demo` and `--dry-run` for safe testing

- A **Next.js portfolio frontend** that:
  - Presents the automation system as a client- and investor-ready product
  - Uses the App Router and is deployable to Vercel
  - Builds cleanly with `npm run build`
  - Can be extended to surface automation outputs as a live dashboard

The repo is also designed to be **AI-friendly**. A dedicated config file,
`codex-assistant.mjs`, tells Copilot/LLM agents how to safely debug, refactor,
and extend the codebase.

---

## 📋 Table of Contents

- [What This Project Demonstrates](#-what-this-project-demonstrates)
- [What This Does](#-what-this-does)
- [Why It Matters](#-why-it-matters)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Command Reference](#-command-reference)
- [Architecture](#-architecture)
- [How to Use This Project](#-how-to-use-this-project)
  - [Running the Daily Automation](#running-the-daily-automation)
  - [Running the Next.js Portfolio](#running-the-nextjs-portfolio)
- [Testing and Validation](#-testing-and-validation)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Portfolio Notes](#-portfolio-notes)

---

## 🚀 How to Run Locally

### Prerequisites

- Node.js 18+ (20 or 22 recommended)
- Python 3.11+

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/dotlink-ops/nexus-core.git
cd nexus-core

# Run automation in demo mode (no API keys needed)
python3 scripts/daily_v2.py --demo

# Start the frontend
npm run dev

# Production mode (requires OPENAI_API_KEY and GITHUB_TOKEN)
python3 scripts/daily_v2.py
```

See `SETUP.md` for detailed configuration and troubleshooting.

---

## 🧠 Daily Automation Runner (`daily_v2.py`)

This repo includes a production-grade daily automation workflow, orchestrated via GitHub Actions.

**Schedule:**  
- Runs every day at **5:00 AM PT** via `.github/workflows/daily-run.yml`
- Can also be triggered manually from the **Actions → daily-run** page

**What it does:**

1. Checks out the repo and sets up Python
2. Installs dependencies (`requirements.txt`)
3. Runs `daily_v2.py` to:
   - Ingest notes / inputs
   - Generate a structured daily summary
   - Extract action items and decisions
4. Creates or updates GitHub Issues for actionable tasks
5. Commits generated artifacts back into the repo (e.g. summaries, logs)
6. Uploads workflow artifacts for easy download and auditing

**Configuration:**

- Secrets (set in repo / environment settings):
  - `OPENAI_API_KEY`
  - `GITHUB_TOKEN` (with `repo` + `workflow` scopes)
- Optional inputs:
  - `demo_mode` (run in dry-run mode without hitting external APIs)

This workflow is designed to be **auditable, repeatable, and portfolio-ready**, showing how automation can tie together GitHub, Python, and external APIs into a daily "ops brain."

---

## 🚀 What This Does

This project provides a complete automation workflow:

1. **📥 Note Ingestion**: Reads markdown/text files from `output/notes/`
2. **🤖 AI Summarization**: Uses OpenAI GPT-4 Turbo to extract highlights, action items, and assessments
3. **📋 GitHub Integration**: Automatically creates labeled issues from action items
4. **💾 JSON Output**: Saves structured data to `output/daily_summary.json`
5. **📊 Sales Pipeline**: Automated data pull from CRM systems with structured tracking
6. **🌐 Next.js Dashboard**: Serves results through modern API routes and React components
7. **📝 Audit Logs**: Maintains timestamped audit trail in `output/audit_*.json`
8. **⏰ GitHub Actions**: Automated daily runs at 5 AM PT with artifact uploads

### Demo Mode

Works out-of-the-box without API keys using realistic demo data—perfect for testing and demonstrations.

```bash
# Run daily automation with demo data (no API keys needed)
python3 scripts/daily_v2.py --demo

# Run sales pipeline pull with demo data
python3 scripts/pull_sales_pipeline.py --demo

# View results
cat output/daily_summary.json | jq
cat output/sales_pipeline.json | jq
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
- **Pre-commit** (optional but recommended for contributors)

### One-Command Setup ⭐

```bash
# Clone repository
git clone https://github.com/dotlink-ops/nexus-core.git
cd nexus-core

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

# Install Node.js dependencies
npm install

# Create output directories
mkdir -p output/notes output/backups

# Copy environment template
cp .env.example .env.local

# Install pre-commit hooks (optional)
pip install pre-commit detect-secrets
pre-commit install
```

**What this does:**
1. ✅ Creates Python virtual environment (`.venv/` in repo root)
2. ✅ Installs Python dependencies from `scripts/requirements.txt` (openai, PyGithub, python-dotenv)
3. ✅ Installs Node.js dependencies (Next.js 16, React 19, TypeScript)
4. ✅ Creates output directories (`output/notes`, `output/backups`)
5. ✅ Copies `.env.example` to `.env.local` for configuration

**Pre-commit hooks (optional but recommended):**
- Automatically validates code quality before commits
- Checks YAML/JSON syntax, whitespace, line endings
- Detects accidentally committed secrets (API keys, tokens)
- Updates security dashboard automatically

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
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
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
```

### Production Mode

For production use with real API calls, configure environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your API keys (see SETUP.md)

python3 scripts/daily_v2.py
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | Environment configuration and daily runner sanity checks |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and component overview |
| [QUICKSTART.md](QUICKSTART.md) | Quick reference for common commands |
| [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md) | Detailed automation documentation |

---

## 🌐 API Endpoints

### Main Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Portfolio homepage | [View](https://ariadnenexus.com) |
| `/api/daily-summary` | Automation output (JSON) | [View](https://ariadnenexus.com/api/daily-summary) |
| `/api/sales-pipeline` | Sales pipeline data (JSON) | [View](https://ariadnenexus.com/api/sales-pipeline) |
| `/api/demo/view` | Demo visualization | [View](https://ariadnenexus.com/api/demo/view) |
| `/api/status` | Comprehensive status | [View](https://ariadnenexus.com/api/status) |

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

- **Python 3.11** — Automation engine with OpenAI and GitHub API integration
- **Next.js 16** — App Router, React 19, TypeScript
- **Tailwind CSS 4** — Styling
- **Vercel** — Deployment

---

## Key Commands

```bash
# Setup
./setup.sh                          # One-command setup

# Automation
python3 scripts/daily_v2.py --demo  # Run with demo data
python3 scripts/daily_v2.py         # Run production mode
./run-daily.sh                      # Wrapper script

# Frontend
npm run dev                         # Start dev server
npm run build                       # Production build
npm run lint                        # Run linter

# Validation
bash scripts/validate.sh            # Full test suite
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/daily-summary` | Latest automation results |
| `/api/status` | System status |
| `/api/health` | Health check |

---

## Why Nexus?

**For Solo Operators & Small Teams:**
- ⏱️ Reduces daily synthesis from 15-30 minutes to < 5 seconds
- 📝 Maintains audit trail for compliance
- 🔄 Ensures repeatable workflows

**For Portfolio/Client Demonstration:**
- 🏗️ Shows production-ready Python automation patterns
- 🔗 Demonstrates API integration (OpenAI + GitHub)
- 🎨 Showcases modern frontend (Next.js 16 + React 19)

---

## 📚 Additional Documentation

- **AUTOMATION_GUIDE.md**: Detailed automation documentation
- **QUICKSTART.md**: Quick reference for common tasks
- **DEMO.md**: Step-by-step demo walkthrough
- **UPWORK.md**: Portfolio messaging and one-liners
- **PRODUCTION_READY.md**: Production readiness verification
- **docs/SALES_PIPELINE.md**: Sales pipeline automation guide
- **.copilot-instructions.md**: AI assistant usage guide
- **codex-assistant.mjs**: Repo Copilot configuration for AI assistants
- **FIXES_SUMMARY.md**: Change log and architecture decisions
- **project.config**: Explicit configuration reference

### 🤖 AI Assistant Integration

This repository includes **nexus-core Repo Copilot** configuration:

- **Live Demo**: https://www.ariadnenexus.com
- **GitHub**: https://github.com/dotlink-ops/Avidelta

---

## Contributing

For pull request guidelines, see `.github/CONTRIBUTING.md`.

---

## License

Private repository. All rights reserved.
