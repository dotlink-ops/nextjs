# Sales Pipeline Automation

Automated data pull for sales pipeline tracking and reporting.

## Overview

This feature provides automated pulling of sales pipeline data from various CRM systems or data sources. The data is structured and made available via API endpoints for consumption by the Next.js dashboard.

## Features

- **Multiple Data Sources**: Supports demo mode, Salesforce, HubSpot, CSV, and other sources (extensible)
- **Automated Pulls**: Can be run manually or scheduled via cron/GitHub Actions
- **Structured Output**: Saves data in JSON format for easy consumption
- **API Endpoint**: Exposes data via `/api/sales-pipeline`
- **Backup System**: Automatically creates timestamped backups

## Quick Start

### Demo Mode (No API Keys Required)

```bash
# Pull demo sales pipeline data
python3 scripts/pull_sales_pipeline.py --demo

# View the output
cat output/sales_pipeline.json | jq
```

### Production Mode

1. **Configure Environment Variables**

   Edit `.env.local`:
   ```bash
   # Data source: demo, salesforce, hubspot, csv
   SALES_PIPELINE_SOURCE=demo
   
   # API key (only needed for non-demo sources)
   # SALES_PIPELINE_API_KEY=your-api-key-here
   ```

2. **Run the Script**

   ```bash
   python3 scripts/pull_sales_pipeline.py
   ```

## Data Structure

The pipeline data includes:

```json
{
  "timestamp": "2025-12-10T20:21:50.489927+00:00",
  "source": "demo",
  "total_pipeline_value": 285000,
  "deals_count": 8,
  "deals": [
    {
      "id": "DEAL-001",
      "name": "Enterprise Platform Migration - Acme Corp",
      "value": 85000,
      "stage": "Proposal Sent",
      "probability": 60,
      "close_date": "2025-12-25",
      "contact": "Sarah Johnson",
      "company": "Acme Corp"
    }
  ],
  "metrics": {
    "active_deals": 7,
    "closed_won": 1,
    "avg_deal_size": 35625,
    "weighted_pipeline": 159750
  },
  "top_opportunities": [
    {"name": "Enterprise Platform Migration", "value": 85000}
  ]
}
```

## API Endpoint

### GET `/api/sales-pipeline`

Returns the latest sales pipeline data.

**Example Request:**
```bash
curl http://localhost:3000/api/sales-pipeline | jq
```

**Example Response:**
```json
{
  "timestamp": "2025-12-10T20:21:50+00:00",
  "source": "demo",
  "total_pipeline_value": 285000,
  "deals_count": 8,
  "deals": [...],
  "metrics": {...},
  "_metadata": {
    "fetched_at": "2025-12-10T20:25:00.000Z",
    "api_version": "1.0"
  }
}
```

## Extending to New Data Sources

To add support for a new CRM or data source:

1. **Add Integration Code**

   Edit `scripts/lib/clients.py` and add a new method to `SalesPipelineClient`:

   ```python
   def _pull_from_your_crm(self) -> Dict[str, Any]:
       """Pull data from Your CRM API."""
       # Add your integration code here
       # Make API calls, transform data
       # Return in standard format
       return pipeline_data
   ```

2. **Update Source Detection**

   In `pull_pipeline_data()` method, add your source:

   ```python
   elif self.source == "your-crm":
       return self._pull_from_your_crm()
   ```

3. **Configure Environment**

   Set in `.env.local`:
   ```bash
   SALES_PIPELINE_SOURCE=your-crm
   SALES_PIPELINE_API_KEY=your-api-key
   ```

## Automation

### Manual Execution

```bash
# Run script manually
python3 scripts/pull_sales_pipeline.py
```

### Scheduled Execution (Cron)

Add to crontab for daily pulls:

```bash
# Pull sales pipeline data daily at 8 AM
0 8 * * * cd /path/to/Avidelta && python3 scripts/pull_sales_pipeline.py
```

### GitHub Actions

Create `.github/workflows/sales-pipeline.yml`:

```yaml
name: Pull Sales Pipeline Data
on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8 AM UTC
  workflow_dispatch:

jobs:
  pull-pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r scripts/requirements.txt
      - run: python3 scripts/pull_sales_pipeline.py
        env:
          SALES_PIPELINE_SOURCE: ${{ secrets.SALES_PIPELINE_SOURCE }}
          SALES_PIPELINE_API_KEY: ${{ secrets.SALES_PIPELINE_API_KEY }}
      - name: Commit changes
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add output/sales_pipeline.json
          git commit -m "Update sales pipeline data" || echo "No changes"
          git push
```

## Files

- `scripts/pull_sales_pipeline.py` - Main script for pulling pipeline data
- `scripts/lib/clients.py` - `SalesPipelineClient` class with source integrations
- `scripts/lib/models.py` - `SalesPipelineData` data model
- `app/api/sales-pipeline/route.ts` - API endpoint for serving data
- `output/sales_pipeline.json` - Latest pipeline data
- `output/backups/sales_pipeline_*.json` - Timestamped backups

## Troubleshooting

**Issue: Script fails with "Module not found"**
```bash
# Install dependencies
pip install -r scripts/requirements.txt
```

**Issue: API endpoint returns demo data**
```bash
# Run the script to generate real data
python3 scripts/pull_sales_pipeline.py

# Verify output file exists
ls -la output/sales_pipeline.json
```

**Issue: Permission denied**
```bash
# Make script executable
chmod +x scripts/pull_sales_pipeline.py
```

## Security

- API keys are stored in `.env.local` (gitignored)
- Never commit credentials to version control
- Use GitHub Secrets for GitHub Actions workflows
- Validate and sanitize any external data

## Next Steps

1. Configure your actual CRM data source
2. Set up scheduled automation (cron or GitHub Actions)
3. Build dashboard visualizations using the `/api/sales-pipeline` endpoint
4. Add alerting for pipeline changes

---

**Created:** 2025-12-10  
**Version:** 1.0.0
