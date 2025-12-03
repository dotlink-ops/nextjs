#!/usr/bin/env python3
# pyright: strict
"""
Daily Automation Runner v2 (Production)
========================================

A production-ready automation runner that:
1. Pulls and summarizes notes from various sources
2. Uses OpenAI to generate structured summaries
3. Creates and triages GitHub issues automatically
4. Outputs JSON data for Next.js frontend consumption
5. Maintains audit logs for compliance

Environment Variables Required:
- OPENAI_API_KEY: OpenAI API key
- GITHUB_TOKEN: GitHub personal access token with repo scope
- REPO_NAME: Target repository in format "owner/repo"

Optional:
- NOTES_SOURCE: Path to notes directory (default: ./output/notes)
- OUTPUT_DIR: Output directory for generated files (default: ./output)
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

# Configure logging first (before any other code)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S%z",
)
logger = logging.getLogger(__name__)

# Third-party imports (with fallback for demo mode)
try:
    from dotenv import load_dotenv
    from openai import OpenAI
    from github import Github, GithubException
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False
    logger.warning("⚠️  Missing dependencies. Install with: pip install -r scripts/requirements.txt")
    logger.warning("   Running in DEMO MODE (no actual API calls)")


class DailyAutomation:
    """Main automation orchestrator"""

    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode or not HAS_DEPS
        self.project_root = Path(__file__).parent.parent
        self.output_dir = Path(os.getenv("OUTPUT_DIR", self.project_root / "output"))
        self.notes_source = Path(os.getenv("NOTES_SOURCE", self.project_root / "output" / "notes"))

        # Ensure directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.notes_source.mkdir(parents=True, exist_ok=True)

        # Initialize clients
        self.openai_client: Optional[OpenAI] = None
        self.github_client: Optional[Github] = None
        self.repo = None

        if not self.demo_mode:
            self._initialize_clients()

        logger.info(f"Initialized DailyAutomation (demo_mode={self.demo_mode})")

    def _initialize_clients(self) -> None:
        """
        Initialize OpenAI and GitHub clients with fail-fast validation.

        Raises RuntimeError if required environment variables are missing.
        """
        # Load environment variables
        load_dotenv(self.project_root / ".env.local")

        # Check for required environment variables
        missing = []

        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key or openai_api_key == "your-openai-api-key-here":
            missing.append("OPENAI_API_KEY")

        github_token = os.getenv("GITHUB_TOKEN")
        if not github_token or github_token == "your-github-token-here":
            missing.append("GITHUB_TOKEN")

        repo_name = os.getenv("REPO_NAME")
        if not repo_name or repo_name == "owner/repo":
            missing.append("REPO_NAME")

        if missing:
            msg = (
                f"Missing required environment variables: {', '.join(missing)}. "
                "Set them in .env.local or run with --demo flag. "
                "See README.md for setup instructions."
            )
            logger.error(f"❌ {msg}")
            raise RuntimeError(msg)

        # Initialize API clients
        try:
            self.openai_client = OpenAI(api_key=openai_api_key)
            self.github_client = Github(github_token)
            self.repo = self.github_client.get_repo(repo_name)
            logger.info(f"✓ API clients initialized successfully (repo: {repo_name})")
        except GithubException as e:
            logger.error(f"❌ Failed to access repository {repo_name}: {e}")
            logger.error("   Check that GITHUB_TOKEN has 'repo' scope and REPO_NAME is correct")
            raise
        except Exception as e:
            logger.error(f"❌ Failed to initialize API clients: {e}")
            raise

    def ingest_notes(self) -> List[str]:
        """Ingest notes from configured source"""
        logger.info("📥 Ingesting notes...")
        notes = []

        # Check for markdown/text files in notes directory
        if self.notes_source.exists():
            # Glob doesn't support {md,txt} syntax - need to search separately
            for pattern in ["**/*.md", "**/*.txt"]:
                for file_path in self.notes_source.glob(pattern):
                    try:
                        content = file_path.read_text(encoding="utf-8")
                        if content.strip():
                            notes.append(content.strip())
                            logger.debug(f"  Loaded: {file_path.name}")
                    except Exception as e:
                        logger.warning(f"  Failed to read {file_path}: {e}")

        # Fallback to demo notes if no files found
        if not notes:
            logger.info("  No notes found, using demo data")
            notes = [
                "Implement automated data pull for sales pipeline",
                "Fix daily report export script failing on edge cases",
                "Draft investor-ready bulleted summary for next meeting",
            ]

        logger.info(f"✓ Ingested {len(notes)} notes")
        return notes

    def generate_summary(self, notes: List[str]) -> Dict[str, Any]:
        """Generate AI-powered summary from notes"""
        logger.info("🤖 Generating summary...")

        if not notes:
            logger.warning("No notes provided, returning empty summary")
            return {"highlights": [], "action_items": [], "assessment": "No notes to process"}

        if self.demo_mode or not self.openai_client:
            logger.info("  Running in demo mode (stubbed)")
            return self._generate_demo_summary(notes)

        try:
            # Prepare prompt
            notes_text = "\n".join(f"{i+1}. {note}" for i, note in enumerate(notes))
            prompt = f"""Analyze these daily notes and provide a structured summary:

{notes_text}

Extract:
1. Key highlights (2-4 bullet points)
2. Action items with priorities
3. Brief overall assessment

Format as JSON with keys: highlights, action_items, assessment"""

            # Call OpenAI
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes daily work notes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500,
                timeout=30.0,
            )

            # Parse response
            content = response.choices[0].message.content
            try:
                summary_data = json.loads(content)
            except json.JSONDecodeError:
                # Fallback if response isn't valid JSON
                summary_data = {
                    "highlights": [content[:200]],
                    "action_items": ["Review generated summary"],
                    "assessment": "AI generated summary (non-JSON response)"
                }

            logger.info(f"✓ Generated summary using {response.model}")
            return summary_data

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            logger.info("  Falling back to demo summary")
            return self._generate_demo_summary(notes)

    def _generate_demo_summary(self, notes: List[str]) -> Dict[str, Any]:
        """Generate a demo summary without API calls"""
        return {
            "highlights": [
                f"Processed {len(notes)} notes from daily workflow",
                "Identified automation opportunities in sales pipeline",
                "Found bug in report export requiring immediate fix",
            ],
            "action_items": [
                "Implement automated data pull for sales pipeline",
                "Fix daily report export script failing on edge cases",
                "Draft investor-ready bulleted summary for next meeting",
            ],
            "assessment": "Key outcomes: 3 actionable items identified. Sales pipeline automation is high-priority."
        }

    def create_github_issues(self, action_items: List[str]) -> List[Dict[str, Any]]:
        """Create GitHub issues from action items"""
        logger.info("📋 Creating GitHub issues...")
        created_issues = []

        if not action_items:
            logger.info("  No action items to create issues from")
            return created_issues

        if self.demo_mode or not self.repo:
            logger.info("  Running in demo mode (stubbed)")
            for i, item in enumerate(action_items, 42):
                created_issues.append({
                    "number": i,
                    "title": item,
                    "url": f"https://github.com/example/repo/issues/{i}",
                    "labels": ["automation", "daily-runner"],
                    "demo": True,
                })
            logger.info(f"✓ Would create {len(created_issues)} issues (demo)")
            return created_issues

        try:
            for item in action_items:
                # Skip empty items
                if not item or not item.strip():
                    continue

                # Create issue
                issue = self.repo.create_issue(
                    title=item[:100].strip(),  # Limit title length and trim whitespace
                    body=f"Auto-generated from daily automation runner\n\n**Action Item:**\n{item}\n\n---\n*Created: {datetime.now(timezone.utc).isoformat()}*",
                    labels=["automation", "daily-runner"],
                )

                created_issues.append({
                    "number": issue.number,
                    "title": issue.title,
                    "url": issue.html_url,
                    "labels": [label.name for label in issue.labels],
                })

                logger.info(f"  Created issue #{issue.number}: {issue.title}")

        except Exception as e:
            logger.error(f"GitHub API error: {e}")
            logger.info("  Continuing with partial results...")

        logger.info(f"✓ Created {len(created_issues)} GitHub issues")
        return created_issues

    def save_output(self, notes: List[str], summary: Dict[str, Any], issues: List[Dict[str, Any]]) -> Path:
        """Save structured output for Next.js frontend"""
        logger.info("💾 Saving output...")

        timestamp = datetime.now(timezone.utc)
        output_data = {
            "date": timestamp.strftime("%Y-%m-%d"),
            "created_at": timestamp.isoformat(),
            "repo": os.getenv("REPO_NAME", "dotlink-ops/nextjs"),
            "summary_bullets": summary.get("highlights", []),
            "action_items": summary.get("action_items", []),
            "assessment": summary.get("assessment", ""),
            "issues_created": len(issues),
            "issues": issues,
            "raw_text": f"Summary:\n{summary.get('assessment', '')}\n\nActions:\n" +
                       "\n".join(f"- {item}" for item in summary.get("action_items", [])),
            "metadata": {
                "runner_version": "2.0.0",
                "demo_mode": self.demo_mode,
                "notes_count": len(notes),
            }
        }

        # Save main output
        output_file = self.output_dir / "daily_summary.json"
        output_file.write_text(json.dumps(output_data, indent=2), encoding="utf-8")
        logger.info(f"  Saved: {output_file}")

        # Save audit log
        log_file = self.output_dir / f"audit_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        log_file.write_text(json.dumps(output_data, indent=2), encoding="utf-8")
        logger.info(f"  Saved: {log_file}")

        logger.info("✓ Output saved successfully")
        return output_file

    def run(self) -> int:
        """
        Execute the daily automation workflow.

        Steps:
        1. Ingest notes from configured source
        2. Generate summary (OpenAI or demo fallback)
        3. Create GitHub issues from action items (skipped in demo mode)
        4. Save outputs to disk

        Returns:
            0 on success, 1 on failure
        """
        start_time = datetime.now(timezone.utc)

        try:
            logger.info("=" * 60)
            logger.info("=== Daily automation run starting ===")
            logger.info("=" * 60)

            # Step 1: Ingest notes
            notes = self.ingest_notes()
            if not notes:
                logger.warning("No notes found, exiting")
                return 0

            logger.info(f"Ingested {len(notes)} notes")

            # Step 2: Generate summary
            if self.demo_mode:
                logger.info("Using demo summary generation (no OpenAI calls)")
                summary = self._generate_demo_summary(notes)
            else:
                summary = self.generate_summary(notes)

            # Step 3: Create GitHub issues
            action_items = summary.get("action_items", [])
            if self.demo_mode:
                logger.info(f"Skipping GitHub issue creation (demo_mode={self.demo_mode})")
                issues = []
            elif action_items:
                logger.info("Creating GitHub issues from action items")
                issues = self.create_github_issues(action_items)
            else:
                logger.info("No action items to create issues from")
                issues = []

            # Step 4: Save output
            output_file = self.save_output(notes, summary, issues)

            # Summary
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info("=" * 60)
            logger.info("✅ AUTOMATION COMPLETE")
            logger.info(f"   Duration: {duration:.2f}s")
            logger.info(f"   Notes: {len(notes)}")
            logger.info(f"   Issues: {len(issues)}")
            logger.info(f"   Output: {output_file}")
            logger.info("=" * 60)

            if self.demo_mode:
                logger.info("")
                logger.info("💡 To enable live API calls:")
                logger.info("   1. Install dependencies: pip install -r scripts/requirements.txt")
                logger.info("   2. Configure .env.local with API keys")
                logger.info("   3. Run again: python3 scripts/daily_v2.py")
                logger.info("")

            # Final success banner
            logger.info("=" * 60)
            logger.info("=== Daily automation run finished successfully ===")
            logger.info("=" * 60)

            return 0

        except Exception as e:
            logger.error("=" * 60)
            logger.error(f"❌ Automation failed: {e}")
            logger.error("=" * 60)
            logger.exception("Daily automation run failed")
            return 1


def main(argv: Optional[List[str]] = None) -> int:
    """
    Main entry point for the daily automation runner.

    Args:
        argv: Command-line arguments (defaults to sys.argv if None)

    Returns:
        0 on success, 1 on failure
    """
    import argparse

    parser = argparse.ArgumentParser(
        description="Run the daily automation workflow.",
        epilog="Example: python3 scripts/daily_v2.py --demo"
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run in demo mode using fake data and no external API calls"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Alias for --demo (no API calls, no external changes)"
    )

    args = parser.parse_args(argv)

    # Support both --demo and --dry-run flags
    demo_mode = args.demo or args.dry_run

    try:
        automation = DailyAutomation(demo_mode=demo_mode)
        return automation.run()
    except Exception as e:
        # Error already logged inside run() or __init__
        logger.error(f"❌ Fatal error: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
