# Nexus System Architecture - Directory Structure

## `/app` - Next.js Application Root

### `/api` - API Routes

#### `/auth`
Authentication and authorization endpoints

#### `/calendar`
- `today/route.ts` - Fetch today's Google Calendar events

#### `/intel` - Intelligence & Analytics
- `overview/route.ts` - Client intelligence overview (uses `client_intel_overview` view)
- `topics/route.ts` - Global topic analysis (uses `global_topic_stats` view)
- `sentiment/route.ts` - Sentiment distribution (uses `sentiment_rollup` view)
- `priority/route.ts` - Priority heatmap (uses `priority_heatmap` view)
- `portfolio/route.ts` - AI-powered portfolio intelligence (GPT-4o-mini)
- `forecast/route.ts` - Workload, risk, demand, bottleneck forecasting (uses `global_forecasting_dataset` view)

#### `/notion`
- `update-weekly/route.ts` - Sync weekly command panel to Notion (PATCH API)

#### `/schedule`
- `weekly/route.ts` - Generate weekly time-block schedule with priority scoring

#### `/slack` - Slack Integrations
- `daily-briefing/route.ts` - Morning briefing with top focus clients
- `meeting-prep/route.ts` - Pre-meeting intelligence packets
- `evening-review/route.ts` - Daily debrief and tomorrow's prep
- `alerts/monitor/route.ts` - Real-time alert monitoring (risk, demand, sentiment, volatility, workload)

#### `/timeline`
- `recent/route.ts` - Fetch recent activity timeline

#### `/actions`
- `generate/route.ts` - AI-powered next action generation per client

### `/clients/[id]` - Client Intelligence Panel
- `page.tsx` - Main orchestrator page
- `/components`
  - `ClientHeader.tsx` - Priority & sentiment (realtime)
  - `SummaryPanel.tsx` - Summaries (realtime)
  - `SearchPanel.tsx` - Semantic search & RAG answers
  - `TimelinePanel.tsx` - Knowledge feed (realtime)
  - `InsightsPanel.tsx` - Actions, risks, opportunities

### `/intel` - Intelligence Dashboard
- `page.tsx` - Multi-client overview dashboard
- `/components`
  - `PortfolioInsights.tsx` - AI-generated cross-client insights

### `/schedule` - Weekly Schedule
- `page.tsx` - Dynamic Weekly Command Panel UI

## `/config`
Configuration files and constants

## `/scripts`
Automation and utility scripts

## `/utils`
Shared utility functions and helpers

## `/workers` - Python Processing Workers

### Core Workers
- `ingest_worker.py` - Lightweight ingestion + initial metadata extraction
- `nexus_processing_worker.py` - Chunking → embeddings → summaries (GPT-4o-mini)
- `gcal_token_loader.py` - Google Calendar OAuth token management

**Worker Lifecycle**: Ingest → Process → Store → Index

See `/workers/README.md` for detailed documentation.

## `/output`
Generated reports and audit logs
- `audit_*.json` - System audit trails
- `DAILY_SUMMARY_*.md` - Daily summaries

## `/types`
TypeScript type definitions and interfaces

## Database Views (Supabase)

### Analytics Views
- `client_intel_overview` - Aggregated client intelligence
- `global_topic_stats` - Pre-computed topic frequencies
- `sentiment_rollup` - Sentiment distribution and scoring
- `priority_heatmap` - Priority categorization

### Forecasting Views
- `global_forecasting_dataset` - Unified forecasting signals
- `global_client_intelligence` - Portfolio-wide intelligence

## Automation Schedule (Vercel Crons)

| Frequency | Time (UTC) | Endpoint | Purpose |
|-----------|-----------|----------|---------|
| Every 15 min | `*/15 * * * *` | `/api/slack/alerts/monitor` | Alert monitoring |
| Daily | `0 14 * * *` | `/api/slack/daily-briefing` | Morning briefing |
| Daily | `5 14 * * *` | `/api/slack/meeting-prep` | Meeting prep packets |
| Daily | `0 4 * * *` | `/api/slack/evening-review` | Evening debrief |
| Weekly (Sun) | `0 21 * * 0` | `/api/notion/update-weekly` | Notion sync |

## Integration Points

### External Services
- **Supabase**: PostgreSQL + pgvector + Realtime
- **OpenAI**: Embeddings (text-embedding-3-small) + Chat (GPT-4o-mini)
- **Google Calendar**: OAuth2 + Calendar API v3
- **Notion**: Pages API + Blocks API
- **Slack**: Bot API + Webhooks

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_USER_TOKEN
GCAL_TARGET_CALENDAR
NOTION_TOKEN
NOTION_WEEKLY_PAGE_ID
SLACK_BOT_TOKEN
SLACK_USER_ID
NEXT_PUBLIC_BASE_URL
```

## Data Flow Architecture

```
┌─────────────────┐
│  Data Ingestion │ → Workers (Python) → Supabase
└─────────────────┘
         ↓
┌─────────────────┐
│ Database Views  │ → Pre-computed Analytics
└─────────────────┘
         ↓
┌─────────────────┐
│  API Endpoints  │ → Next.js Routes
└─────────────────┘
         ↓
┌─────────────────┐
│  UI Components  │ → React + Realtime
└─────────────────┘
         ↓
┌─────────────────┐
│  Integrations   │ → Slack/Notion/GCal
└─────────────────┘
```

## Key Design Patterns

### 1. **API-First Architecture**
- All components consume APIs, not direct Supabase calls
- Enables caching, logging, and middleware

### 2. **Real-time Updates**
- Supabase subscriptions for live data
- Client-side state management with React hooks

### 3. **AI-Powered Intelligence**
- Vector similarity search with pgvector
- RAG for grounded answers
- Forecasting with GPT-4o-mini

### 4. **Time-Block Allocation**
- Priority scoring (0-100 scale)
- Weekly schedule generation
- Capacity-aware allocation

### 5. **Proactive Monitoring**
- Multi-threshold alerting
- Continuous background monitoring
- Actionable Slack notifications

