# Notion webhook payload wrapper

This format lets GitHub Actions send a stable, minimal payload to a Notion-ingest webhook without embedding the full Notion schema in the Action itself. It wraps the generated `daily_summary.json` content alongside routing metadata so the webhook can decide how to persist the data (e.g., pick a Notion database or page based on the `type` and `github` fields).

## Envelope structure

| Field | Type | Description |
| --- | --- | --- |
| `type` | string | Logical payload category. Use `"daily_briefing"` for daily summaries. |
| `version` | string | Payload contract version. Start with `"v1"`; increment when breaking changes are introduced. |
| `notion.database_id` | string | Target Notion database for the payload. Required unless `parent_page_id` is provided for page creation. |
| `notion.parent_page_id` | string \| null | Optional parent page if routing should bypass a database. Keep `null` when not used. |
| `github.repository` | string | Full `owner/repo` name for traceability. |
| `github.run_id` | number | GitHub Actions run ID. Useful for correlating retries or logs. |
| `github.run_url` | string | Direct link to the run. |
| `github.commit_sha` | string | Commit SHA that produced the payload. |
| `payload` | object | The embedded daily summary (matches `daily_summary.json`). |

## Example payload

This is the recommended body for the Action to `POST` to `NOTION_WEBHOOK_URL`:

```json
{
  "type": "daily_briefing",
  "version": "v1",
  "notion": {
    "database_id": "YOUR_NOTION_DATABASE_ID",
    "parent_page_id": null
  },
  "github": {
    "repository": "yourname/automation",
    "run_id": 123456789,
    "run_url": "https://github.com/yourname/automation/actions/runs/123456789",
    "commit_sha": "abc123def456"
  },
  "payload": {
    "meta": {
      "run_id": "2025-11-26",
      "generated_at_utc": "2025-11-26T13:00:05Z"
    },
    "summary": {
      "date": "2025-11-26",
      "title": "Daily Briefing – 2025-11-26",
      "overview": "Short 2–4 sentence overview of the day’s key themes.",
      "categories": [
        "Personal",
        "Finance",
        "Real Assets"
      ]
    },
    "sections": [
      {
        "name": "Top Priorities",
        "items": [
          "Finalize Trenton Hotel investor update deck.",
          "Review La Sandwicherie SBA model v3.",
          "Block 2 hours for MSF prep (TVM & duration)."
        ]
      }
    ],
    "metrics": {
      "focus_hours": 4.5,
      "tasks_completed": 7,
      "sleep_hours": 6.0
    },
    "links": [
      {
        "label": "Daily summary docx",
        "url": "https://github.com/your/repo/raw/main/outputs/daily_summary.docx"
      }
    ]
  }
}
```

## Notes for the ingest service

- Use `type` + `version` to branch parsing logic, keeping the webhook backwards-compatible as the Action evolves.
- The `payload` object is deliberately schema-light; treat it as a pass-through from the Action’s `daily_summary.json` so new fields can flow without redeploying the proxy.
- Prefer idempotent processing by deduplicating on `github.run_id` or `payload.meta.run_id`.
- When `notion.parent_page_id` is present, let it override `database_id` for workflows that need to create child pages instead of database rows.
- Return concise status codes to the Action (e.g., 2xx on success, 4xx on validation errors, 5xx on transient issues) so retries are easy to reason about.
