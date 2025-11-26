#!/usr/bin/env python3
"""
Daily Runner Demo Script
========================

A sample automation runner that demonstrates:
1. Pulling and summarizing notes
2. Creating GitHub issues via OpenAI integration
3. Logging activity for audit trails

This is a demo/stub version for portfolio walkthrough.
For production, integrate with actual APIs and data sources.
"""

import sys
import json
from datetime import datetime


def print_header(title: str) -> None:
    """Print a formatted header."""
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}\n")


def demo_notes_ingestion() -> None:
    """Demo: Ingest and parse notes."""
    print_header("STEP 1: Notes Ingestion")
    notes = [
        "Implement automated data pull for sales pipeline",
        "Fix daily report export script failing on edge cases",
        "Draft investor-ready bulleted summary for next meeting",
    ]
    print(f"Ingested {len(notes)} notes:")
    for i, note in enumerate(notes, 1):
        print(f"  {i}. {note}")


def demo_ai_summarization() -> None:
    """Demo: AI-powered summarization (stubbed)."""
    print_header("STEP 2: AI Summarization")
    print("Calling OpenAI API (stubbed)...")
    print("  Model: gpt-4")
    print("  Tokens: ~150 used")
    summary = (
        "Key outcomes: 3 actionable items identified. "
        "Sales pipeline automation is high-priority. "
        "Report export bug affects weekly updates."
    )
    print(f"\nGenerated Summary:\n  {summary}")


def demo_github_issues() -> None:
    """Demo: Create GitHub issues (stubbed)."""
    print_header("STEP 3: GitHub Issue Creation")
    issues = [
        {
            "title": "Implement automated data pull for sales pipeline",
            "labels": ["feature", "automation"],
            "number": 42,
        },
        {
            "title": "Fix daily report export on edge cases",
            "labels": ["bug", "report"],
            "number": 43,
        },
        {
            "title": "Draft investor-ready summary for next meeting",
            "labels": ["docs", "investment"],
            "number": 44,
        },
    ]
    print(f"Created {len(issues)} GitHub issues:")
    for issue in issues:
        print(f"  #{issue['number']}: {issue['title']}")
        print(f"             Labels: {', '.join(issue['labels'])}")


def demo_logging() -> None:
    """Demo: Audit logging."""
    print_header("STEP 4: Audit Log")
    timestamp = datetime.now().isoformat()
    log_entry = {
        "timestamp": timestamp,
        "runner_version": "0.1.0",
        "runtime_env": "python 3.11 (venv)",
        "notes_ingested": 3,
        "issues_created": 3,
        "duration_seconds": 2.4,
        "status": "success",
    }
    print(json.dumps(log_entry, indent=2))


def main() -> None:
    """Run the demo daily runner."""
    print("\n" + "=" * 60)
    print("  DAILY RUNNER DEMO")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    try:
        demo_notes_ingestion()
        demo_ai_summarization()
        demo_github_issues()
        demo_logging()

        print_header("DEMO COMPLETE")
        print("✓ All steps completed successfully.")
        print("\nFor live runs:")
        print("  1. Set OPENAI_API_KEY and GITHUB_TOKEN in .env.local")
        print("  2. Update notes source (file or API)")
        print("  3. Configure target repo (REPO_NAME)")
        print("\nSee DEMO.md for full walkthrough instructions.")
        return 0

    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
