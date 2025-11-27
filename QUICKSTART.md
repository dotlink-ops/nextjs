# 🚀 Quick Reference

## One-Line Commands

```bash
# Setup everything
./scripts/setup-automation.sh

# Run automation (demo mode)
./run-daily.sh --demo

# Run automation (production mode)
./run-daily.sh

# Validate entire stack
./scripts/validate.sh

# Start Next.js dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## File Locations

| What | Where |
|------|-------|
| Add notes | `data/notes/*.md` |
| Output data | `data/daily_summary.json` |
| Audit logs | `data/audit_*.json` |
| Sample outputs | `SAMPLE_OUTPUTS/` |
| Python scripts | `scripts/` |
| API routes | `app/api/` |
| Config | `.env.local` |

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/daily-summary` | Latest automation results |
| `/api/demo` | Sample outputs |
| `/api/status` | Health & status |
| `/api/health` | Basic health check |
| `/api/version` | Version info |

## Environment Variables

```bash
# Required for production mode
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
REPO_NAME=owner/repo

# Optional
NOTES_SOURCE=./data/notes
OUTPUT_DIR=./data
```

## Common Tasks

### Run Automation Daily

```bash
# Add to crontab
crontab -e

# Run at 9 AM every day
0 9 * * * cd /path/to/nextjs && ./run-daily.sh >> /var/log/automation.log 2>&1
```

### Add New Notes

```bash
# Create a note file
cat > data/notes/$(date +%Y-%m-%d).md << 'EOF'
# Daily Notes

- Task 1
- Task 2
- Task 3
EOF

# Run automation
./run-daily.sh
```

### View Latest Results

```bash
# In terminal
curl http://localhost:3000/api/daily-summary | jq

# Or in browser
open http://localhost:3000/api/daily-summary
```

### Check Logs

```bash
# Latest audit log
cat $(ls -t data/audit_*.json | head -1) | jq

# All recent logs
ls -lt data/audit_*.json | head -5
```

### Deploy Updates

```bash
# Commit changes
git add .
git commit -m "Update automation"
git push origin main

# Vercel auto-deploys on push to main
# Or deploy manually
vercel --prod
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | `pip install -r scripts/requirements.txt` |
| API key not configured | Edit `.env.local` |
| Permission denied | `chmod +x scripts/*.sh run-daily.sh` |
| Build fails | `rm -rf .next node_modules && npm install && npm run build` |
| Rate limit | Use authenticated GitHub token |

## Project Structure

```
nextjs/
├── run-daily.sh           # ⭐ Main entry point
├── .env.local            # 🔑 API keys (create this)
├── scripts/
│   ├── daily_v2.py       # 🤖 Main automation
│   ├── setup-automation.sh  # 🛠️ Setup
│   ├── sync-to-frontend.sh  # 🔄 Sync
│   └── validate.sh       # ✅ Validation
├── data/
│   ├── notes/           # 📝 Input
│   └── daily_summary.json  # 📊 Output
├── app/
│   ├── api/            # 🔌 API routes
│   └── page.tsx        # 🌐 Landing page
└── SAMPLE_OUTPUTS/      # 📁 Demo files
```

## Getting Help

- 📖 Full Guide: [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md)
- 🐛 Report Issues: https://github.com/dotlink-ops/nextjs/issues
- 📅 Book Call: https://cal.com/avidelta/15min
- 📧 Email: support@avidelta.com

## Key Scripts

### Setup & Installation

```bash
# Full setup (creates venv, installs deps)
./scripts/setup-automation.sh

# Install Python deps only
source venv/bin/activate
pip install -r scripts/requirements.txt

# Install Node deps only
npm install
```

### Running Automation

```bash
# Demo mode (no API calls)
./run-daily.sh --demo

# Production mode
./run-daily.sh

# Run Python script directly
source venv/bin/activate
python3 scripts/daily_v2.py

# With custom arguments
python3 scripts/daily_v2.py --demo
```

### Sync & Validation

```bash
# Sync outputs to frontend
./scripts/sync-to-frontend.sh

# Run full validation
./scripts/validate.sh

# Check build
npm run build
```

### Development

```bash
# Start dev server
npm run dev

# Watch for changes
npm run dev &
./run-daily.sh --demo
# Refresh browser to see updates
```

## Configuration Quick Start

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Get API Keys

**OpenAI:**
- Visit: https://platform.openai.com/api-keys
- Create new key
- Add credits to account

**GitHub:**
- Visit: https://github.com/settings/tokens
- Generate new token (classic)
- Select `repo` scope
- Copy token

### 3. Edit .env.local

```bash
OPENAI_API_KEY=sk-your-actual-key-here
GITHUB_TOKEN=ghp_your-actual-token-here
REPO_NAME=your-username/your-repo
```

### 4. Test

```bash
# Test without API calls
./run-daily.sh --demo

# Test with API calls
./run-daily.sh
```

## URLs

### Local Development

- 🏠 Home: http://localhost:3000
- 📊 API: http://localhost:3000/api/daily-summary
- 🎭 Demo: http://localhost:3000/api/demo
- ❤️ Health: http://localhost:3000/api/health
- 📈 Status: http://localhost:3000/api/status

### Production (Vercel)

- 🌐 Live: https://avidelta.vercel.app
- 📊 API: https://avidelta.vercel.app/api/daily-summary
- 📈 Status: https://avidelta.vercel.app/api/status

## Tips

💡 **Start in demo mode** to test without API costs  
💡 **Run validation** after making changes  
💡 **Check logs** in `data/audit_*.json` for debugging  
💡 **Use cron** for scheduled automation  
💡 **Set up Vercel** for automatic deployments  
💡 **Keep secrets** in `.env.local`, never commit them  

---

For detailed documentation, see [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md)
