# Sales Pipeline Automation

<<<<<<< HEAD
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

=======
## Overview

The sales pipeline automation module provides automated data collection from CRM systems and sales tracking tools. It integrates seamlessly with the existing daily automation workflow.

## Features

- **Automated Data Pull**: Scheduled or on-demand data collection from sales pipeline sources
- **Multiple CRM Support**: Designed to support HubSpot, Salesforce, Pipedrive, and custom sources
- **Demo Mode**: Works out-of-the-box with realistic demo data for testing
- **Historical Tracking**: Maintains cache of all pipeline snapshots with timestamps
- **Comprehensive Metrics**: Tracks total leads, pipeline value, weighted value, and stage breakdown

## Quick Start

### Demo Mode (No Configuration Required)

```bash
# Run automation with demo sales pipeline data
python3 scripts/daily_v2.py --demo
```

This will:
1. Pull demo sales pipeline data (5 sample leads)
2. Save to `output/sales_pipeline.json`
3. Create timestamped cache file in `output/sales_cache/`
4. Include pipeline summary in `output/daily_summary.json`

>>>>>>> main
### Production Mode

1. **Configure Environment Variables**

<<<<<<< HEAD
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
  # Sales Pipeline Automation

  Automated data collection and reporting for the sales pipeline.

  ## Overview

  The sales pipeline automation module provides automated data collection from CRM systems and sales tracking tools. It integrates with the existing daily automation workflow and supports multiple data sources (demo data, CSV/JSON files, and popular CRMs such as HubSpot, Salesforce, and Pipedrive).

  ## Features

  - Automated data pulls (scheduled or on-demand)
  - Multiple CRM/provider support (HubSpot, Salesforce, Pipedrive, CSV/JSON, demo)
  - Demo mode for local development and testing
  - Historical tracking with timestamped cache snapshots (`output/sales_cache`)
  - Structured JSON output for API consumption and dashboard integration
  - Inclusion of pipeline summary into `daily_summary.json`

  ## Quick Start

  ### Demo Mode (no API keys required)

  ```bash
  # Run automation with demo sales pipeline data
  python3 scripts/daily_v2.py --demo

  # Or run the dedicated sales pipeline pull (legacy helper)
  python3 scripts/sales_pipeline_pull.py --demo

  # View the output
  cat output/sales_pipeline.json | jq
  ```

  This will:
  1. Pull demo sales pipeline data
  2. Save to `output/sales_pipeline.json`
  3. Create a timestamped cache file in `output/sales_cache/`
  4. Include pipeline summary in `output/daily_summary.json`

  ### Production Mode (live API)

  1. Create or edit `.env.local` with your provider config:

  ```bash
  # Sales Pipeline Configuration
  SALES_PIPELINE_SOURCE=hubspot  # Options: demo, hubspot, salesforce, pipedrive, csv, json
  SALES_PIPELINE_API_KEY=your-api-key-here
  SALES_PIPELINE_ENDPOINT=https://api.hubspot.com/crm/v3/objects/deals  # Optional
  SALES_PIPELINE_CACHE=./output/sales_cache  # Optional
  ```

  2. Run automation with live API calls:

  ```bash
  python3 scripts/daily_v2.py
  ```

  ## Data Structure

  The `sales_pipeline.json` output contains a snapshot of the pipeline. Example schema:

  ```json
  {
    "timestamp": "2025-12-10T20:21:45.039161+00:00",
    "source": "demo",
    "total_leads": 5,
    "total_value": 462000.0,
    "weighted_value": 254500.0,
    "stage_breakdown": {
      "Qualification": 2,
      "Proposal": 1,
      "Negotiation": 1,
      "Closed Won": 1
    },
    "leads": [
      {
        "id": "lead-001",
        "name": "Enterprise Integration Project",
        "company": "TechCorp Solutions",
        "stage": "Qualification",
        "value": 150000.0,
        "probability": 0.3,
        "owner": "Sales Rep A",
        "created_at": "2025-11-15T10:00:00Z",
        "updated_at": "2025-12-09T14:30:00Z"
      }
    ],
    "metadata": {
      "demo": true
    }
  }
  ```

  ## API Endpoint

  ### GET `/api/sales-pipeline`

  Returns the latest sales pipeline snapshot. Example:

  ```bash
  curl http://localhost:3000/api/sales-pipeline | jq
  ```

  ## Extending to New Data Sources

  To add support for a new CRM or data source:

  1. Add integration code (e.g., in `scripts/lib/clients.py`) to pull and normalize data into the repository schema.
  2. Update source detection to include the new provider (e.g., in `pull_pipeline_data()` or configuration parsing).
  3. Configure environment variables for credentials and endpoints in `.env.local`.

  Example integration stub:

  ```python
  def _pull_from_your_crm(self) -> Dict[str, Any]:
      """Pull data from Your CRM API and return normalized pipeline dict."""
      # Implement API calls and transformation here
      return pipeline_data
  ```

  ## Notes

  - The feature supports both a dedicated pull helper (`scripts/sales_pipeline_pull.py`) and integration into the daily runner (`scripts/daily_v2.py`).
  - Outputs are saved under `output/` and are safe to inspect in demo mode.

```

**Note**: HubSpot integration is planned but not yet implemented. Currently falls back to demo data.

### Salesforce (Placeholder)

```bash
SALES_PIPELINE_SOURCE=salesforce
SALES_PIPELINE_API_KEY=your-salesforce-token
```

**Note**: Salesforce integration is planned but not yet implemented. Currently falls back to demo data.

### Pipedrive (Placeholder)

```bash
SALES_PIPELINE_SOURCE=pipedrive
SALES_PIPELINE_API_KEY=your-pipedrive-api-token
```

**Note**: Pipedrive integration is planned but not yet implemented. Currently falls back to demo data.

## Architecture

### Module Structure

```
scripts/
├── lib/
│   ├── sales_pipeline.py    # Sales pipeline data source module
│   ├── models.py             # Data models
│   └── clients.py            # API client wrappers
└── daily_v2.py              # Main automation runner (with pipeline integration)

output/
├── sales_pipeline.json      # Latest pipeline snapshot
└── sales_cache/            # Historical snapshots
    └── sales_pipeline_YYYYMMDD_HHMMSS.json
```

### Data Flow

```
┌─────────────────────┐
│   CRM System        │
│ (HubSpot/SF/etc)    │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│ SalesPipelineSource │
│  - pull_data()      │
│  - save_to_cache()  │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  daily_v2.py        │
│  - Integration      │
│  - Aggregation      │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Output Files       │
│  - sales_pipeline   │
│  - daily_summary    │
│  - cache files      │
└─────────────────────┘
```

## API Reference

### SalesPipelineDataSource

Main class for pulling sales pipeline data.

```python
from lib.sales_pipeline import create_sales_pipeline_source

# Create data source
pipeline_source = create_sales_pipeline_source(
    project_root=Path("."),
    demo_mode=False
)

# Pull data
pipeline_data = pipeline_source.pull_data()

# Save to cache
cache_file = pipeline_source.save_to_cache(pipeline_data)
```

### SalesPipelineData

Data container for pipeline information.

**Attributes:**
- `timestamp` (str): ISO 8601 timestamp of data pull
- `total_leads` (int): Total number of leads in pipeline
- `total_value` (float): Sum of all lead values
- `weighted_value` (float): Sum of value × probability for all leads
- `stage_breakdown` (Dict[str, int]): Count of leads by stage
- `leads` (List[SalesPipelineLead]): List of individual leads
- `source` (str): Data source identifier
- `demo` (bool): Whether this is demo data

### SalesPipelineLead

Individual lead/opportunity data.

**Attributes:**
- `id` (str): Unique lead identifier
- `name` (str): Lead/opportunity name
- `company` (str): Company name
- `stage` (str): Current pipeline stage
- `value` (float): Monetary value
- `probability` (float): Win probability (0.0-1.0)
- `owner` (str): Sales rep/owner
- `created_at` (str): Creation timestamp
- `updated_at` (str): Last update timestamp

## Extending the Integration

### Adding a New CRM Source

1. **Add Handler Method**

Edit `scripts/lib/sales_pipeline.py`:

```python
def _pull_mycrm(self) -> SalesPipelineData:
    """Pull data from MyCRM."""
    if not self.config.api_key:
        raise RuntimeError("MyCRM API key not configured")
    
    # Implement API call
    import requests
    response = requests.get(
        self.config.api_endpoint,
        headers={"Authorization": f"Bearer {self.config.api_key}"}
    )
    data = response.json()
    
    # Transform to SalesPipelineData
    leads = [
        SalesPipelineLead(
            id=item["id"],
            name=item["name"],
            # ... map fields
        )
        for item in data["deals"]
    ]
    
    # Return structured data
    return SalesPipelineData(...)
```

2. **Register Handler**

Update the `pull_data()` method:

```python
handlers = {
    "hubspot": self._pull_hubspot,
    "salesforce": self._pull_salesforce,
    "pipedrive": self._pull_pipedrive,
    "mycrm": self._pull_mycrm,  # Add new handler
}
```

3. **Configure Environment**

```bash
SALES_PIPELINE_SOURCE=mycrm
SALES_PIPELINE_API_KEY=your-api-key
SALES_PIPELINE_ENDPOINT=https://api.mycrm.com/deals
```

## Troubleshooting

### Issue: "Sales pipeline module not available"

**Cause**: Import error in `daily_v2.py`

**Solution**: Ensure `scripts/lib/sales_pipeline.py` exists and has no syntax errors:

```bash
python3 -c "from lib.sales_pipeline import create_sales_pipeline_source"
```

### Issue: Falls back to demo data in production

**Cause**: CRM integration not yet implemented or API key invalid

**Solution**:
1. Check that `SALES_PIPELINE_SOURCE` is set correctly
2. Verify `SALES_PIPELINE_API_KEY` is valid
3. Check logs for specific error messages

### Issue: Cache directory permission error

**Cause**: No write access to `output/sales_cache/`

**Solution**: Create directory with proper permissions:

```bash
mkdir -p output/sales_cache
chmod 755 output/sales_cache
```

## Best Practices

1. **Schedule Regular Pulls**: Run automation daily to track pipeline trends
2. **Monitor Cache Size**: Periodically clean old cache files (>30 days)
3. **Validate Data Quality**: Check for anomalies in lead counts and values
4. **Secure API Keys**: Never commit `.env.local` to version control
5. **Test in Demo Mode**: Always test changes with `--demo` flag first

## Future Enhancements

- [ ] Implement HubSpot integration
- [ ] Implement Salesforce integration
- [ ] Implement Pipedrive integration
- [ ] Add pipeline trend analysis
- [ ] Create visualization dashboard
- [ ] Add alerting for significant pipeline changes
- [ ] Support custom field mapping
- [ ] Add data validation and quality checks

## Related Documentation

- [AUTOMATION_GUIDE.md](../AUTOMATION_GUIDE.md) - Complete automation documentation
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture overview
- [SETUP.md](../SETUP.md) - Environment setup guide

---

**Last Updated:** 2025-12-10  
**Version:** 1.0.0  
**Module:** Sales Pipeline Automation
>>>>>>> main
