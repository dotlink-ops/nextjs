# Sales Pipeline Automation

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

### Production Mode

1. **Configure Environment Variables**

Create or edit `.env.local`:

```bash
# Sales Pipeline Configuration
SALES_PIPELINE_SOURCE=hubspot  # Options: demo, hubspot, salesforce, pipedrive
SALES_PIPELINE_API_KEY=your-api-key-here
SALES_PIPELINE_ENDPOINT=https://api.hubspot.com/crm/v3/objects/deals  # Optional
SALES_PIPELINE_CACHE=/path/to/cache  # Optional, defaults to output/sales_cache
```

2. **Run Automation**

```bash
# Run with live API calls
python3 scripts/daily_v2.py
```

## Data Structure

### Sales Pipeline Output (`sales_pipeline.json`)

```json
{
  "timestamp": "2025-12-10T20:21:45.039161+00:00",
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
  "source": "demo",
  "demo": true
}
```

### Daily Summary Integration

The pipeline summary is automatically included in `daily_summary.json`:

```json
{
  "metadata": {
    "sales_pipeline_enabled": true
  },
  "sales_pipeline_summary": {
    "total_leads": 5,
    "total_value": 462000.0,
    "weighted_value": 254500.0,
    "timestamp": "2025-12-10T20:21:45.039161+00:00"
  }
}
```

## CRM Integration

### HubSpot (Placeholder)

```bash
SALES_PIPELINE_SOURCE=hubspot
SALES_PIPELINE_API_KEY=your-hubspot-api-key
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
