# Notion webhook payload design

This document defines the JSON contract for the outbound webhook that will eventually feed the Notion `pages/create` API. The goal is to keep our current placeholder endpoint drop-in compatible with a real Notion page creator so the pipeline does not need to be reworked later.

## Transport
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`; optional `X-Signature-256` HMAC of the raw body for verification
- **Character set**: UTF-8

## Envelope
Top-level fields describe the delivery and the underlying automation run. These fields should remain stable even if the Notion payload changes.

```json
{
  "version": "2024-12-01",
  "event": "automation.daily_summary",
  "delivery_id": "5b8f1f79-8b3d-4c5c-8a1c-0c2f4f3c9f28",
  "sent_at": "2025-11-25T19:25:00Z",
  "source": {
    "service": "automationdotlink",
    "environment": "production"
  },
  "retry": false,
  "summary": { /* domain payload */ },
  "notion": { /* Notion-ready payload */ }
}
```

### Field notes
- `version`: semantic marker for the payload schema.
- `event`: routing key. If we add other events, this allows a multiplexer on the receiver.
- `delivery_id`: unique per webhook send; also included in the Notion page properties for traceability.
- `sent_at`: ISO 8601 in UTC.
- `source`: helps separate prod/staging payloads while sharing the same webhook URL.
- `retry`: `true` when this is a replay of a previously failed delivery.

## Domain payload (`summary`)
This mirrors the data already rendered by the UI. Keep this section untouched by Notion specifics so other consumers can reuse it.

```json
{
  "date": "2025-11-25",
  "repo": "dotlink-ops/nextjs",
  "summary_bullets": [
    "Got daily automation pipeline running end-to-end.",
    "Integrated OpenAI, GitHub, and local artifacts."
  ],
  "action_items": [
    "Polish Next.js portfolio landing page.",
    "Refine investor-facing automation summary."
  ],
  "raw_text": "Summary:\n- ...\n\nActions:\n- ...",
  "created_at": "2025-11-25T19:25:00"
}
```

## Notion payload (`notion`)
The `notion` object is shaped to match the Notion `pages/create` request, so the receiver can forward it directly. It also contains a `preview` that the placeholder endpoint can log or render without calling Notion.

```json
{
  "parent": { "type": "database_id", "database_id": "<DATABASE_ID>" },
  "properties": {
    "Title": {
      "title": [
        { "text": { "content": "Daily Automation Summary · 2025-11-25 · dotlink-ops/nextjs" } }
      ]
    },
    "Date": { "date": { "start": "2025-11-25" } },
    "Repository": {
      "rich_text": [ { "text": { "content": "dotlink-ops/nextjs" } } ]
    },
    "Delivery ID": {
      "rich_text": [ { "text": { "content": "5b8f1f79-8b3d-4c5c-8a1c-0c2f4f3c9f28" } } ]
    },
    "Status": { "select": { "name": "Auto-generated" } }
  },
  "children": [
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [ { "text": { "content": "Highlights" } } ]
      }
    },
    {
      "object": "block",
      "type": "bulleted_list_item",
      "bulleted_list_item": {
        "rich_text": [ { "text": { "content": "Got daily automation pipeline running end-to-end." } } ]
      }
    },
    {
      "object": "block",
      "type": "bulleted_list_item",
      "bulleted_list_item": {
        "rich_text": [ { "text": { "content": "Integrated OpenAI, GitHub, and local artifacts." } } ]
      }
    },
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [ { "text": { "content": "Action Items" } } ]
      }
    },
    {
      "object": "block",
      "type": "to_do",
      "to_do": {
        "checked": false,
        "rich_text": [ { "text": { "content": "Polish Next.js portfolio landing page." } } ]
      }
    },
    {
      "object": "block",
      "type": "to_do",
      "to_do": {
        "checked": false,
        "rich_text": [ { "text": { "content": "Refine investor-facing automation summary." } } ]
      }
    },
    {
      "object": "block",
      "type": "heading_2",
      "heading_2": {
        "rich_text": [ { "text": { "content": "Raw Text" } } ]
      }
    },
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [ { "text": { "content": "Summary:\n- ...\n\nActions:\n- ..." } } ]
      }
    }
  ],
  "preview": {
    "title": "Daily Automation Summary · 2025-11-25 · dotlink-ops/nextjs",
    "text": "Highlights (2) · Action Items (2)"
  }
}
```

### Property guidance
- **Title**: single source of truth for the page name; reuse in the UI preview.
- **Date**: ISO date (no time) for easy Notion filtering.
- **Repository** and **Delivery ID**: improve traceability between Notion and the webhook logs.
- **Status**: start as `Auto-generated`; the receiver can update to `Published` after a successful create.

### Extensibility hooks
- Add `properties.Tags` (multi-select) if we need environment labels.
- Add `children` attachments when we have links to artifacts (e.g., GitHub PRs or screenshots).
- Introduce `notion.parent.page_id` to support adding child pages instead of database rows without changing the envelope.

## Example end-to-end payload
See `data/notion_webhook_example.json` for a complete sample that can be posted to the webhook or forwarded straight to Notion.
