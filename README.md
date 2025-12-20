# Ariadne Nexus

> **Transform daily notes into structured summaries and GitHub issues using AI**

Ariadne Nexus (or just "Nexus") is a full-stack automation system that combines a **Python automation engine** with a **Next.js frontend**. It ingests daily notes, generates AI-powered summaries, creates GitHub issues automatically, and serves results through a modern dashboard.

**Live Demo:** https://www.ariadnenexus.com

---

## What is Nexus?

Nexus automates the daily workflow of turning unstructured notes into actionable outputs:

1. **Note Ingestion** — Reads markdown/text files from `output/notes/`
2. **AI Summarization** — Uses OpenAI GPT-4 to extract highlights, action items, and assessments
3. **GitHub Integration** — Creates labeled issues from action items
4. **JSON Output** — Saves structured data to `output/daily_summary.json`
5. **Dashboard** — Serves results through Next.js API routes and React components

---

## Run Locally

### Prerequisites

- Node.js 18+ (20 or 22 recommended)
- Python 3.11+

### Quick Start

```bash
# Clone and setup
git clone https://github.com/dotlink-ops/Avidelta.git
cd Avidelta
./setup.sh

# Run automation in demo mode (no API keys needed)
python3 scripts/daily_v2.py --demo

# Start the frontend
npm run dev

# Open browser
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

## Tech Stack

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

## Links

- **Live Demo**: https://www.ariadnenexus.com
- **GitHub**: https://github.com/dotlink-ops/Avidelta

---

## Contributing

For pull request guidelines, see `.github/CONTRIBUTING.md`.

---

## License

Private repository. All rights reserved.
