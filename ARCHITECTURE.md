# Architecture

Ariadne Nexus is a full-stack automation system that transforms daily notes into structured summaries and GitHub issues using AI.

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Ariadne Nexus                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐    │
│  │    Notes     │     │  daily_v2.py │     │  Output JSON     │    │
│  │  (Markdown)  │ ──▶ │  (Python)    │ ──▶ │  daily_summary   │    │
│  │              │     │              │     │                  │    │
│  └──────────────┘     └──────┬───────┘     └────────┬─────────┘    │
│                              │                      │               │
│                              ▼                      ▼               │
│                     ┌──────────────┐       ┌──────────────────┐    │
│                     │  OpenAI API  │       │   Next.js App    │    │
│                     │  (GPT-4)     │       │   /api routes    │    │
│                     └──────────────┘       └────────┬─────────┘    │
│                              │                      │               │
│                              ▼                      ▼               │
│                     ┌──────────────┐       ┌──────────────────┐    │
│                     │  GitHub API  │       │  Vercel Deploy   │    │
│                     │  (Issues)    │       │  ariadnenexus.com│    │
│                     └──────────────┘       └──────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Overview

### Python Automation (`scripts/`)

| Component | File | Purpose |
|-----------|------|---------|
| Daily Runner | `daily_v2.py` | Main automation entry point |
| Requirements | `requirements.txt` | Python dependencies |
| Validation | `validate.sh` | Test and validation suite |

### Next.js Frontend (`app/`)

| Component | Path | Purpose |
|-----------|------|---------|
| Homepage | `app/page.tsx` | Landing page and demo |
| API Routes | `app/api/` | JSON endpoints |
| Daily Summary API | `app/api/daily-summary/` | Serve automation output |
| Health Checks | `app/api/health/` | System health endpoints |

### Data Flow

1. **Input**: Markdown/text notes in `output/notes/`
2. **Processing**: `daily_v2.py` reads notes and calls OpenAI for summarization
3. **Output**: Structured JSON saved to `output/daily_summary.json`
4. **Presentation**: Next.js API routes serve JSON to the frontend
5. **Actions**: Optional GitHub issue creation from action items

## Directory Structure

```
Avidelta/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx           # Homepage
├── scripts/               # Python automation
│   ├── daily_v2.py        # Main runner
│   └── requirements.txt   # Dependencies
├── output/                # Automation outputs
│   ├── notes/             # Input notes
│   └── daily_summary.json # Generated output
├── .env.local             # Environment config (gitignored)
└── .env.example           # Environment template
```

## Integration Points

- **Python → JSON**: `daily_v2.py` outputs to `output/daily_summary.json`
- **JSON → API**: `app/api/daily-summary/route.ts` serves the JSON
- **API → Frontend**: React components fetch and display data
- **Runner → GitHub**: Optional issue creation via GitHub API
