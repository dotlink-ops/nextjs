# Sales Pipeline Data Pull Automation

## Overview

The Sales Pipeline Data Pull automation script (`scripts/sales_pipeline_pull.py`) provides a production-ready solution for pulling, validating, and aggregating sales pipeline data from various sources. It follows the same patterns and architecture as the main `daily_v2.py` automation runner.

## Features

- ✅ **Multiple Data Sources**: CSV, JSON, and Google Sheets (planned)
- ✅ **Demo Mode**: Test without credentials using realistic sample data
- ✅ **Data Validation**: Validates and normalizes sales lead data
- ✅ **Pipeline Metrics**: Automatically calculates key sales metrics
- ✅ **Structured Logging**: Production-ready logging with timestamps and run IDs
- ✅ **Audit Trail**: Maintains compliance logs for all data pulls
- ✅ **JSON Output**: Generates structured JSON for frontend consumption

## Quick Start

### Prerequisites

- Python 3.11+
- Virtual environment (recommended)
- No additional dependencies beyond standard library for CSV/JSON sources

### Running in Demo Mode

Test the script without any data sources:

```bash
# Run with demo data (no setup required)
python3 scripts/sales_pipeline_pull.py --demo
```

### Running with CSV Data

```bash
# Pull from CSV file
python3 scripts/sales_pipeline_pull.py --source csv --path output/sales_pipeline_sample.csv

# Or use environment variables
export SALES_DATA_SOURCE=csv
export SALES_DATA_PATH=./output/sales_pipeline_sample.csv
python3 scripts/sales_pipeline_pull.py
```

### Running with JSON Data

```bash
# Pull from JSON file
python3 scripts/sales_pipeline_pull.py --source json --path data/sales_data.json
```

## Data Formats

### CSV Format

The CSV file should have the following columns:

```csv
id,company,contact_name,email,phone,stage,value,probability,expected_close_date,notes,created_at,updated_at
LEAD-001,TechCorp,Sarah Johnson,sarah@techcorp.example,+1-555-0123,qualified,50000,60,2025-12-31,Follow up next week,2025-11-15T10:00:00Z,2025-12-07T00:00:00Z
```

**Required Columns:**
- `id`: Unique identifier for the lead
- `company`: Company name
- `contact_name`: Primary contact name
- `email`: Contact email address
- `stage`: Sales stage (lead, qualified, proposal, negotiation, closed-won, closed-lost)
- `value`: Deal value in dollars
- `probability`: Win probability (0-100)
- `expected_close_date`: Expected close date (ISO 8601 format)

**Optional Columns:**
- `phone`: Contact phone number
- `notes`: Additional notes about the lead
- `created_at`: When the lead was created (ISO 8601 format)
- `updated_at`: When the lead was last updated (ISO 8601 format)

### JSON Format

```json
{
  "leads": [
    {
      "id": "LEAD-001",
      "company": "TechCorp Solutions",
      "contact_name": "Sarah Johnson",
      "email": "sarah.johnson@techcorp.example",
      "phone": "+1-555-0123",
      "stage": "qualified",
      "value": 50000.0,
      "probability": 60.0,
      "expected_close_date": "2025-12-31",
      "notes": "Interested in enterprise plan. Follow up next week.",
      "created_at": "2025-11-15T10:00:00Z",
      "updated_at": "2025-12-07T00:00:00Z"
    }
  ]
}
```

## Output Files

### Sales Pipeline JSON (`output/sales_pipeline.json`)

Main output file with complete pipeline data and metrics:

```json
{
  "date": "2025-12-07",
  "created_at": "2025-12-07T02:53:05.327470+00:00",
  "source": "csv",
  "leads": [...],
  "metrics": {
    "total_leads": 7,
    "total_value": 653000.0,
    "weighted_value": 500850.0,
    "leads_by_stage": {
      "qualified": 2,
      "proposal": 1,
      "lead": 2,
      "negotiation": 1,
      "closed-won": 1
    },
    "value_by_stage": {
      "qualified": 230000.0,
      "proposal": 125000.0,
      "lead": 23000.0,
      "negotiation": 200000.0,
      "closed-won": 75000.0
    },
    "avg_deal_size": 93285.71,
    "conversion_rate": 14.29
  },
  "metadata": {
    "runner_version": "1.0.0",
    "demo_mode": false,
    "total_leads": 7
  }
}
```

### Audit Log (`output/sales_audit_YYYYMMDD_HHMMSS.json`)

Timestamped audit log for compliance tracking:

```json
{
  "timestamp": "2025-12-07T02:53:05.327902+00:00",
  "runner_version": "1.0.0",
  "data_source": "csv",
  "demo_mode": false,
  "leads_pulled": 7,
  "total_value": 653000.0,
  "weighted_value": 500850.0,
  "status": "success"
}
```

## Pipeline Metrics Explained

| Metric | Description |
|--------|-------------|
| **Total Leads** | Count of all leads in the pipeline |
| **Total Value** | Sum of all deal values regardless of stage |
| **Weighted Value** | Total value adjusted by win probability (value × probability) |
| **Leads by Stage** | Count of leads at each pipeline stage |
| **Value by Stage** | Total deal value at each pipeline stage |
| **Avg Deal Size** | Average value per lead |
| **Conversion Rate** | Percentage of leads that closed-won |

## Environment Configuration

Add these variables to `.env.local`:

```bash
# Sales Data Source Type
SALES_DATA_SOURCE=csv

# Path to data file
SALES_DATA_PATH=./output/sales_pipeline_sample.csv

# Output directory (optional, defaults to ./output)
OUTPUT_DIR=./output
```

## Command Line Options

```bash
python3 scripts/sales_pipeline_pull.py --help

Options:
  --demo              Run in demo mode (uses sample data, no credentials needed)
  --source {csv,json,gsheets}
                      Data source type (default: csv)
  --path PATH         Path to data file or Google Sheet ID
  --output-dir DIR    Output directory (default: ./output)
```

## Integration with Daily Automation

You can integrate the sales pipeline pull into your daily automation workflow:

```bash
#!/bin/bash
# run-daily-with-sales.sh

# Run daily automation
python3 scripts/daily_v2.py

# Pull sales pipeline data
python3 scripts/sales_pipeline_pull.py --source csv --path output/sales_pipeline_sample.csv

# Sync to frontend (if needed)
# ./scripts/sync-to-frontend.sh
```

## Sample Data

The repository includes a sample CSV file at `output/sales_pipeline_sample.csv` with 7 sample leads for testing. You can use this to test the script without setting up your own data source.

## Error Handling

The script includes comprehensive error handling:

- **Missing files**: Falls back to demo data
- **Invalid data formats**: Logs errors and continues with valid data
- **Network issues**: Graceful degradation with informative error messages
- **Missing dependencies**: Automatic fallback to demo mode

All errors are logged with structured logging including timestamps and run IDs for debugging.

## Future Enhancements

Planned features for future releases:

- [ ] Google Sheets API integration (full implementation)
- [ ] Salesforce CRM integration
- [ ] HubSpot CRM integration
- [ ] Webhook support for real-time updates
- [ ] Email notifications for significant changes
- [ ] Automatic GitHub issue creation for follow-ups
- [ ] Dashboard visualization in Next.js frontend
- [ ] Historical trend analysis
- [ ] Forecasting and projections

## API Endpoint (Planned)

The sales pipeline data can be exposed through a Next.js API route:

```typescript
// app/api/sales-pipeline/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dataPath = path.join(process.cwd(), "output", "sales_pipeline.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
```

## Testing

### Unit Tests

```bash
# Test in demo mode
python3 scripts/sales_pipeline_pull.py --demo

# Test with sample CSV
python3 scripts/sales_pipeline_pull.py --source csv --path output/sales_pipeline_sample.csv

# Verify output
cat output/sales_pipeline.json | python3 -m json.tool
```

### Expected Output

A successful run should produce:

1. ✅ `output/sales_pipeline.json` - Main output file
2. ✅ `output/sales_audit_*.json` - Audit log
3. ✅ Exit code 0
4. ✅ Structured logs with timestamps

## Troubleshooting

### Issue: "CSV file not found"

**Solution:** Check the path is correct and relative to the project root:

```bash
ls -la output/sales_pipeline_sample.csv
python3 scripts/sales_pipeline_pull.py --source csv --path output/sales_pipeline_sample.csv
```

### Issue: "Error reading CSV"

**Solution:** Verify the CSV format matches the expected columns. Check for:
- Correct column headers
- Proper encoding (UTF-8)
- No missing required fields

### Issue: "No leads found"

**Solution:** 
- Ensure the CSV/JSON file has data rows
- Check that the `leads` array exists in JSON files
- Verify the file permissions allow reading

## Contributing

When extending this script:

1. Follow the existing code patterns and structure
2. Add comprehensive error handling
3. Update documentation
4. Test in demo mode first
5. Add audit logging for new features
6. Maintain backward compatibility

## License

Private repository. All rights reserved.

---

**Last Updated:** 2025-12-07  
**Version:** 1.0.0  
**Script:** `scripts/sales_pipeline_pull.py`
