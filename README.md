# Codex / Automation Portfolio

This repository contains a production-ready automation spine designed for solo operators and small teams. A single command runs the daily workflow inside a controlled virtual environment, pulls the latest work notes, and generates structured summaries while wiring OpenAI directly into GitHub Issues for automatic task creation and triage. It's built to be both a working tool and a portfolio-grade example of how I approach automation, environment hygiene, and AI integrations.

## One-line pitch

A production-ready automation spine demonstrating a one-command daily runner, AI→GitHub issue flow, and hardened environment setup for investor- and client-ready collaboration.

## What this project is

This repository contains a Next.js landing page and documentation scaffolding for an automation portfolio. It showcases a repeatable automation framework: a one-command daily runner that runs inside a controlled virtual environment, generates stakeholder-ready summaries, and an OpenAI→GitHub Issues integration that creates, labels, and triages tasks from unstructured inputs.

## Why it matters

This project demonstrates real-world automation outcomes: fewer manual handoffs, repeatable developer environments, and a documented system that can be applied to new repos and client projects. The automation spine reduces time spent on daily synthesis, creates a clear audit trail, and makes handoffs to collaborators or investors safer and more reliable.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Styling: plain CSS in `app/globals.css` (Tailwind tooling present in devDeps)
- Integrations: OpenAI API, GitHub Issues API (tokens not included)
- Scripts: `npm run dev`, `npm run build`, `npm start`

## Features

- One-command daily runner (documented entry point in repo; actual runner code may live in companion project)
- AI-powered OpenAI ⇄ GitHub Issues flow for automatic issue generation and triage
- Hardened environment and repo hygiene for safe collaboration
- Portfolio landing page with case study and service descriptions

## Quick start (local)

1. Clone:

```bash
git clone <repo-url>
cd nextjs
```

2. Install:

```bash
npm install
```

3. Copy and edit environment variables:

```bash
cp .env.example .env.local
# edit .env.local and add your keys
```

4. Run dev server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Configuration

- The project intentionally does not contain any secrets. If you find keys, move them to `.env` and scrub git history.
- See `.env.example` for expected environment variables used by any automation integrations.

**Note**: `next.config.ts` was updated to set an experimental Turbo root:

```ts
// next.config.ts
import path from 'path';
// experimental.turbo.root: path.join(__dirname)
```

This points Turbo (app tooling) at the repository root where the app's `package.json` lives. If Next.js reports an "unrecognized key" or other warnings for `experimental.turbo`, consider removing or adjusting the experimental setting to match your installed Next.js version.

## Health Endpoints

- `/api/health`: Basic liveness check. Returns `{ ok: true }`.
- `/api/healthz`: Ops-friendly health check. Returns `{ ok, commit, time }`.
- `/api/ready`: Readiness check. Returns `{ ready: true }`.
- `/api/version`: Version info. Returns `{ name, version, next, node, timestamp }`.
- `/api/uptime`: Process uptime. Returns `{ uptimeSeconds, startedAt, node }`.
- `/api/ping`: Timestamp echo. Returns `{ ok, serverTimestamp, echo }` (pass `?t=your-value`).
- `/api/status`: Aggregated status. Returns `{ ok, ready, name, version, next, node, uptimeSeconds, startedAt, serverTimestamp }`.

Quick checks:

```bash
curl -sS http://localhost:3000/api/health
curl -sS http://localhost:3000/api/healthz | jq
curl -sS http://localhost:3000/api/ready
curl -sS http://localhost:3000/api/version | jq
curl -sS http://localhost:3000/api/uptime | jq
curl -sS "http://localhost:3000/api/ping?t=$(date -Iseconds)" | jq
curl -sS http://localhost:3000/api/status | jq
```

## Usage

- The landing page (`app/page.tsx`) is the portfolio UI. Use it to present the automation case studies, links, and contact CTAs.
- For the automation runner and issue flow demo, follow the local run instructions in `DEMO.md`. If the runner is not included in this repo, use the sample outputs in `SAMPLE_OUTPUTS/` to illustrate expected output.

## Demo / Deployment

**Live Deployment:** https://avidelta.vercel.app

**Key API Endpoints:**
- 🏠 Home: https://avidelta.vercel.app
- ✅ Status: https://avidelta.vercel.app/api/status
- 📊 Daily Summary: https://avidelta.vercel.app/api/daily-summary
- 🎭 Demo View: https://avidelta.vercel.app/api/demo/view
- ❤️ Health: https://avidelta.vercel.app/api/health
- 🤖 Robots: https://avidelta.vercel.app/robots.txt
- 🗺️ Sitemap: https://avidelta.vercel.app/sitemap.xml

**Quick Verification:**
```bash
# Test all endpoints
curl -sS https://avidelta.vercel.app/api/status | jq
curl -sS https://avidelta.vercel.app/api/daily-summary | jq
curl -sS https://avidelta.vercel.app/api/health
```

This project is Vercel-ready with automatic GitHub integration. See `DEMO.md` for local walkthrough steps and sample outputs used for demos.

## Portfolio notes (for clients)

- What you can expect: a repeatable automation framework, reduced manual synthesis time, and a documented repo that’s safe for handoff.
- For a live walkthrough, provide access to a test GitHub repo and an OpenAI key (scoped) so demo runs can create test issues.

---

If you'd like, I can also add example CI, a demo runner script, or sanitized screenshots to this repo.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Quick Deploy (Manual)

**One-command deployment:**

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Deploy to production
vercel --prod
```

### Automated CI/CD (Recommended)

**Setup GitHub → Vercel Integration:**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import project: `dotlink-ops/nextjs`
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (auto-detected)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
4. Click "Deploy"

**Automatic Deployments:**
- ✅ **Production:** Every push to `main` → auto-deploy to `https://avidelta.vercel.app`
- ✅ **Preview:** Every PR → unique preview URL with comment containing live links
- ✅ **Health checks:** Each preview includes links to `/api/status`, `/api/daily-summary`, and `/api/health`

**Vercel automatically comments on PRs with:**
- 🔗 Preview URL
- ✅ Status endpoint: `[preview-url]/api/status`
- 📊 Daily Summary: `[preview-url]/api/daily-summary`
- ❤️ Health check: `[preview-url]/api/health`

**Environment Variables** (if needed):
- Add any API keys or secrets in Vercel dashboard → Settings → Environment Variables
- Available in: Production, Preview, Development

### Pre-deploy Checklist
- ✅ Remove any secrets from code (use environment variables)
- ✅ Test all API routes locally: `/api/health`, `/api/status`, `/api/daily-summary`, `/api/demo`
- ✅ Verify `app/layout.tsx` has complete metadata (title, description, OG tags, robots)
- ✅ Verify `robots.ts` exists and generates `/robots.txt`
- ✅ Verify `sitemap.ts` exists and generates `/sitemap.xml`
- ✅ Clean up `vercel.json` (remove auto-detected settings)
- ✅ Test build: `npm run build`
- ✅ Verify preview deployments work on PRs

### Verify Deployment

```bash
# Check production endpoints
curl https://avidelta.vercel.app/api/healthz | jq
curl https://avidelta.vercel.app/api/status | jq
curl https://avidelta.vercel.app/sitemap.xml
```

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
