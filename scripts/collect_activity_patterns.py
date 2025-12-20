#!/usr/bin/env python3
"""
Activity Pattern Collection Module
Collects categorized coding & tooling activity patterns for daily_runner ingestion
"""

def collect_activity_patterns():
    """
    Collects categorized coding & tooling activity patterns
    and returns them as a structured dictionary suitable for 
    daily_runner ingestion, GitHub issue creation, and Notion syncing.
    """

    data = {
        "version_control": {
            "github.com": 6,
            "github.dev": 5,
            "git-scm.com": 1
        },
        "design_ai_tools": {
            "figma.com": 17,
            "vscode_marketplace": 1,
            "notion.so": 3
        },
        "credentials_identity": {
            "gmail": 10,
            "google_accounts": 15,
            "google_admin": 10,
            "duo": 3,
            "linkedin": 3,
            "slack": 8
        }
    }

    # Add timestamp for daily versioning
    from datetime import datetime
    data["generated_at"] = datetime.utcnow().isoformat()

    # Save JSON output to daily_runner output directory
    import json, os

    output_path = "output/usage_activity.json"
    os.makedirs("output", exist_ok=True)

    with open(output_path, "w") as f:
        json.dump(data, f, indent=4)

    return data


if __name__ == "__main__":
    result = collect_activity_patterns()
    print(f"Activity patterns collected and saved to output/usage_activity.json")
    print(f"Generated at: {result['generated_at']}")
