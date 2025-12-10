# Avidelta / Dotlink-Ops — Copilot Coding Agent Instructions

Last Updated: 2025-12-10  
Owner: Kamar Foster (Ariadne Labs / Avidelta)  
Repository: dotlink-ops/Avidelta  

---

## 1. Repository Purpose

This repository powers the **Nexus Intelligence Platform** for Avidelta + Ariadne Labs, including:
- **Next.js 16.0.7** front-end (Vercel deployment, App Router)
- **Supabase** services (PostgreSQL + pgvector, Realtime, RLS)
- **Python workers** for knowledge processing and automation
- **GitHub Actions** automation workflows
- **API routes** (`app/api/*`)
- **Intelligence dashboard** with semantic search, RAG, forecasting
- **Security, secrets, environment variables**, and compliance

This repo evolves daily. Copilot should assume **active iteration**, not long-term stability.

---

## 2. Key Commands & Build/Run Instructions

### **Front-End (Next.js 16.0.7)**
```bash
npm install
npm run dev          # Local development server
npm run build        # Production build
npm run lint         # ESLint check
```

**Architecture:**
- Uses Next.js App Router (`app/` directory)
- TypeScript strict mode enabled
- Centralized utilities in `utils/` (supabase.ts, prompts.ts, forecasting.ts)
- Server components by default, `"use client"` only when needed
- API routes in `app/api/*/route.ts`

### **Python Workers**
Located in `/workers`:
- `ingest_worker.py` - Knowledge ingestion and chunking
- `nexus_processing_worker.py` - Embedding generation and summaries
- `gcal_token_loader.py` - Google Calendar OAuth token management

**Running workers:**
```bash
cd workers
python3 ingest_worker.py
python3 nexus_processing_worker.py
python3 gcal_token_loader.py --init  # One-time OAuth setup
```

**Requirements:**
- Must use `logging.basicConfig(level=logging.INFO)`
- Never use `print()` - use `logger.info()`, `logger.debug()`, etc.
- No external dependencies without approval
- Use `.env.local` secrets (never commit)

### **Supabase**
- SQL must be formatted and tested
- Access via centralized `utils/supabase.ts`
- Use `createServiceClient()` for API routes
- Use `createAnonClient()` for RLS-compliant operations
- No destructive queries without `HUMAN APPROVAL REQUIRED`

### **GitHub Actions**
- Workflows in `.github/workflows/*`
- Vercel cron jobs defined in `vercel.json`
- All Actions must protect secrets in logs

---

## 3. Code & Architecture Standards

### **TypeScript/JavaScript**
- Strict TypeScript across all `.ts` and `.tsx` files
- **Prefer `async/await`** - no `.then()` chains
- Use centralized utilities:
  - `utils/supabase.ts` for database access
  - `utils/prompts.ts` for LLM prompts
  - `utils/forecasting.ts` for calculations
- Import types from `/types/index.ts`
- Error handling: structured responses with context

```typescript
// ✅ Good
const res = await fetch(url);
const data = await res.json();

// ❌ Bad
fetch(url).then(r => r.json()).then(data => ...);
```

### **API Routes**
All routes in `app/api/*/route.ts` must:
- Import from centralized utilities
- Use proper error handling with context
- Return structured JSON responses
- Never expose raw error messages to clients

```typescript
// ✅ Good
import { createServiceClient } from "@/utils/supabase";

if (error) {
  return NextResponse.json(
    { error: "Failed to fetch data", details: error.message },
    { status: 500 }
  );
}

// ❌ Bad
const supabase = createClient(process.env.URL, process.env.KEY);
console.error(error);
return NextResponse.json({ error }, { status: 500 });
```

### **React Components**
- Use `"use client"` directive **only when needed** (hooks, browser APIs)
- Server components by default (no directive)
- Type props and state with interfaces from `/types`
- Async data loading: use `async/await`, avoid chaining

### **Python**
- Use structured logging (never `print()`)
- Type hints preferred
- Follow PEP 8
- Configuration from environment variables
- Proper error handling with logging

```python
# ✅ Good
import logging
logger = logging.getLogger(__name__)
logger.info(f"Processing item {item_id}")

# ❌ Bad
print(f"Processing item {item_id}")
```

### **Folder Structure**
```
/app                    # Next.js App Router UI
/app/api               # API routes
/components            # Shared React components
/utils                 # Centralized utilities (NEW)
  - supabase.ts        # Database client
  - prompts.ts         # LLM prompts
  - forecasting.ts     # Business logic
/types                 # TypeScript interfaces (NEW)
  - index.ts           # All type definitions
/workers               # Python background workers
/docs                  # Documentation
/public                # Static assets
```

### **Security**
Copilot should **never**:
- Modify authentication code without human approval
- Change environment variable names
- Add logging that exposes credentials
- Use deprecated APIs
- Expose Vercel or Supabase secrets
- Commit secrets to `.env.local`

---

## 4. Current Architecture (December 2025)

### **Intelligence Platform**
- **Semantic Search**: Vector similarity with pgvector (1536D embeddings)
- **RAG System**: Context retrieval + GPT-4o-mini answers
- **Forecasting Engine**: Workload/risk/demand predictions
- **Weekly Scheduling**: Priority scoring with time-block allocation

### **Database Views**
- `client_intel_overview` - Client activity metrics
- `global_topic_stats` - Topic frequency analysis
- `sentiment_rollup` - Sentiment aggregation
- `priority_heatmap` - Priority distributions
- `global_forecasting_dataset` - Forecast input data
- `global_client_intelligence` - Unified intel view

### **Integrations**
- **Slack**: Daily briefing, meeting prep, evening review, alerts
- **Google Calendar**: OAuth2 with token refresh
- **Notion**: Weekly sync via API
- **OpenAI**: GPT-4o-mini for chat, text-embedding-3-small for vectors

### **Cron Jobs** (Vercel)
```json
{
  "alerts": "*/15 * * * *",           // Every 15 min
  "daily-briefing": "0 12 * * 1-5",   // Weekdays 12 PM UTC
  "meeting-prep": "0 13 * * 1-5",     // Weekdays 1 PM UTC
  "evening-review": "0 1 * * 1-5",    // Weekdays 1 AM UTC
  "notion-sync": "0 2 * * 0"          // Sundays 2 AM UTC
}
```

---

## 5. What Copilot Should Work On (Allowed Tasks)

### **A. Small to Medium**
- ✅ Bug fixes (low-risk only)
- ✅ TypeScript type improvements
- ✅ Component cleanup
- ✅ Adding tests
- ✅ Error handling improvements
- ✅ Minor refactors (non-architectural)
- ✅ Dead code removal
- ✅ Documentation updates
- ✅ Lint/format fixes
- ✅ Converting `.then()` to `async/await`
- ✅ Replacing `console.log` with structured logging

### **B. PR Cleanup**
Copilot may:
- Merge PRs **only when CI passes and a human writes "@copilot merge"**
- Update PRs to resolve merge conflicts
- Add missing documentation
- Fill in missing tests
- Convert old code to current standards
- Apply code consistency fixes

### **C. Issue Cleanup**
Copilot may:
- Review closed issues
- Identify stale patterns
- Link related issues
- Propose automated close messages

### **D. Worker Support**
Copilot may:
- Refactor worker scripts
- Add proper logging
- Improve efficiency
- Document flows
- Add integrations **only when instructed**

### **E. Utility Consolidation**
Copilot should:
- Use centralized utilities (`utils/supabase.ts`, `utils/prompts.ts`)
- Extract duplicate code to utilities
- Improve type safety with `/types` interfaces
- Follow DRY principles

---

## 6. What Copilot Must Avoid (Forbidden Tasks)

### ❌ **Security-Sensitive Files**
- `/middleware.ts`
- `.env.local` templates
- Secrets handling
- OAuth flows (except Google Calendar token refresh)
- JWT logic
- Supabase RLS policies

### ❌ **Architectural Decisions**
- Creating/deleting top-level directories
- Changing database schema
- Renaming services
- Modifying CI/CD workflows
- Payment APIs, webhooks
- Background task infrastructure

### ❌ **High-Risk Database Changes**
- Dropping tables
- Editing RLS policies
- Modifying auth schema
- Destructive migrations

**Zero tolerance:** If unsure → ask via PR comments.

---

## 7. Issue & Task Format (Required)

Every issue assigned to Copilot MUST include:

### **1. Description**
Clear goal + affected file/module.

### **2. Acceptance Criteria**
Checklist-style requirements.

### **3. Out-of-Scope**
What this task must *not* touch.

### **4. Validation Steps**
How to confirm the fix works.

### **Example Issue**
```markdown
**Description:**
Convert all remaining fetch().then() patterns to async/await in API routes

**Acceptance Criteria:**
- [ ] All routes in app/api/slack use async/await
- [ ] No .then() chains in refactored files
- [ ] Error handling uses try/catch
- [ ] No functionality changes

**Out-of-Scope:**
- Authentication flows
- Database schema changes
- New features

**Validation:**
- Run `npm run lint` - passes
- Run `npm run build` - succeeds
- Check grep -r "\.then(" app/api - returns 0
```

---

## 8. Recent Improvements (Reference)

### **Route Cleanup (Dec 2025)**
- Created `utils/supabase.ts` for centralized client
- Created `utils/prompts.ts` for LLM prompts
- Refactored 15 API routes to use utilities
- Removed 4 redundant health check routes
- Improved error messages with context

### **Code Consistency (Dec 2025)**
- Converted 28 `.then()` chains to `async/await`
- Created `/types/index.ts` with 10 interfaces
- Updated 3 Python workers with `logging.basicConfig()`
- Replaced 33 `print()` statements with structured logging
- Standardized `"use client"` directives

### **Performance**
- Intel dashboard: 3x faster with parallel Promise.all()
- Eliminated duplicate Supabase client creation (20+ instances)
- Centralized LLM prompts (350+ lines moved to utils)

---

## 9. Testing & Validation

### **Before Submitting PR**
```bash
# TypeScript/JavaScript
npm run lint
npm run build
npm run type-check  # if available

# Python
cd workers
python -m py_compile *.py
grep -n "print(" *.py  # Should return 0

# Verification
grep -r "\.then(" app/  # Should be minimal
grep -r "console\.(log|error)" app/api  # Should be 0
```

### **Required Checks**
- ✅ No TypeScript errors
- ✅ Lint passes
- ✅ Build succeeds
- ✅ No secrets in code
- ✅ Proper error handling
- ✅ Types imported from `/types`
- ✅ Utilities used from `utils/`

---

## 10. Communication Guidelines

### **When to Ask for Human Review**
- Security-related changes
- Database schema modifications
- New external dependencies
- Architectural decisions
- Breaking changes
- Uncertainty about scope

### **How to Communicate**
- Use PR comments for questions
- Tag specific files/lines
- Provide context and rationale
- Link to related issues/PRs
- Document assumptions

### **Response Format**
```markdown
## Changes Made
- [x] Item 1
- [x] Item 2

## Testing Performed
- Ran npm run build ✅
- Verified no .then() chains ✅

## Questions/Concerns
- Should we also update X?
- Clarification needed on Y
```

---

## 11. Common Patterns

### **Supabase Access**
```typescript
import { createServiceClient } from "@/utils/supabase";

const supabase = createServiceClient();
const { data, error } = await supabase.from("table").select("*");
```

### **Error Handling**
```typescript
if (error) {
  return NextResponse.json(
    { error: "User-friendly message", details: error.message },
    { status: 500 }
  );
}
```

### **Type Safety**
```typescript
import type { ClientSummary, TimelineItem } from "@/types";

const [summary, setSummary] = useState<ClientSummary | null>(null);
```

### **Async/Await**
```typescript
// Parallel fetches
const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
```

---

## 12. References

- **Architecture**: `/NEXUS_ARCHITECTURE.md`
- **Route Cleanup**: `/ROUTE_CLEANUP_SUMMARY.md`
- **Code Consistency**: `/CODE_CONSISTENCY_SUMMARY.md`
- **Security**: `/docs/SECURITY_HARDENING.md`
- **Workers**: `/workers/README.md`

---

## 13. Pull Request & Review Rules

Copilot PRs must:
- Be small and focused on a single concern
- Have meaningful commit messages
- Pass all CI checks
- Update documentation if adding new functionality
- Include test coverage when applicable

Human reviewer (Kamar) must approve:
- Large changes (>50 lines)
- Refactors touching multiple modules
- Anything touching auth, security, or schema
- New services or integrations
- New API routes

Commands:
- `@copilot update PR` - Request changes to existing PR
- `@copilot rebase PR` - Fix merge conflicts
- `@copilot merge` - **Only after human approval**

---

## 14. Additional Repository Rules

- **Branch Protection**: main/master protected; Copilot cannot bypass
- **Secrets Management**: All secrets stored in GitHub Actions or Vercel environment
- **Commit Messages**: Must be atomic and descriptive
- **Multi-file Changes**: Use clear file-level comments
- **No Force Push**: Never force push to protected branches

---

## 15. Self-Checking Behaviors (Mandatory)

Copilot must:
- Explain any unexpected modifications in PR description
- Re-run lint + tests before proposing a merge
- Ask for human confirmation when touching sensitive areas
- Default to conservative changes when uncertain
- Document breaking changes explicitly
- Provide rollback instructions for risky changes

---

## 16. Future Directions (Ariadne Labs / Avidelta Roadmap)

The repo will soon include:
- Vision + Spatial models integration
- Figma → JSON → Components pipeline
- Additional Notion workflows
- Enhanced GitHub Actions automation
- Supabase triggers + background jobs
- Real-time collaboration features

Copilot may prepare scaffolding or drafts **only when instructed**.

---

**Last Review:** December 10, 2025  
**Status:** Production-ready with active iteration  
**Next Review:** As needed based on architectural changes
