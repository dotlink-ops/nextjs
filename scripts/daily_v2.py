#!/usr/bin/env python3
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
from typing import Any, Dict, List, Optional

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

        if self.notes_source.exists():
            notes.extend(self._read_notes_from_disk())

        if not notes:
            notes = self._demo_notes()

        logger.info(f"✓ Ingested {len(notes)} notes")
        return notes

    def _read_notes_from_disk(self) -> List[str]:
        """Read markdown and text notes from the notes directory."""
        notes = []
        for pattern in ["**/*.md", "**/*.txt"]:
            for file_path in self.notes_source.glob(pattern):
                try:
                    content = file_path.read_text(encoding="utf-8")
                    if content.strip():
                        notes.append(content.strip())
                        logger.debug(f"  Loaded: {file_path.name}")
                except Exception as e:
                    logger.warning(f"  Failed to read {file_path}: {e}")
        return notes

    def _demo_notes(self) -> List[str]:
        """Return fallback demo notes when no files are available."""
        logger.info("  No notes found, using demo data")
        return [
            "Implement automated data pull for sales pipeline",
            "Fix daily report export script failing on edge cases",
            "Draft investor-ready bulleted summary for next meeting",
        ]

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
            notes_text = self._format_notes_for_prompt(notes)
            prompt = self._build_summary_prompt(notes_text)
            response = self._request_summary(prompt)
            return self._parse_summary_response(response)
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            logger.info("  Falling back to demo summary")
            return self._generate_demo_summary(notes)

    def _format_notes_for_prompt(self, notes: List[str]) -> str:
        """Format notes into a numbered list suitable for prompts."""
        return "\n".join(f"{i+1}. {note}" for i, note in enumerate(notes))

    def _build_summary_prompt(self, notes_text: str) -> str:
        """Construct the prompt used for OpenAI summary generation."""
        return (
            "Analyze these daily notes and provide a structured summary:\n\n"
            f"{notes_text}\n\n"
            "Extract:\n"
            "1. Key highlights (2-4 bullet points)\n"
            "2. Action items with priorities\n"
            "3. Brief overall assessment\n\n"
            "Format as JSON with keys: highlights, action_items, assessment"
        )

    def _request_summary(self, prompt: str) -> Any:
        """Call the OpenAI API to generate a summary."""
        return self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes daily work notes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            timeout=30.0,
        )

    def _parse_summary_response(self, response: Any) -> Dict[str, Any]:
        """Parse the OpenAI response into structured summary data."""
        content = response.choices[0].message.content
        try:
            summary_data = json.loads(content)
        except json.JSONDecodeError:
            summary_data = {
                "highlights": [content[:200]],
                "action_items": ["Review generated summary"],
                "assessment": "AI generated summary (non-JSON response)"
            }

        logger.info(f"✓ Generated summary using {response.model}")
        return summary_data

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
            return self._demo_issues(action_items)
        
        try:
            for item in action_items:
                self._create_issue_from_item(created_issues, item)
                
        except Exception as e:
            logger.error(f"GitHub API error: {e}")
            logger.info("  Continuing with partial results...")
        
        logger.info(f"✓ Created {len(created_issues)} GitHub issues")
        return created_issues

    def _demo_issues(self, action_items: List[str]) -> List[Dict[str, Any]]:
        """Return stubbed GitHub issues in demo mode."""
        created_issues = []
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

    def _create_issue_from_item(self, created_issues: List[Dict[str, Any]], item: str) -> None:
        """Create a GitHub issue for a single action item."""
        if not item or not item.strip():
            return

        issue = self.repo.create_issue(
            title=item[:100].strip(),
            body=(
                "Auto-generated from daily automation runner\n\n"
                f"**Action Item:**\n{item}\n\n---\n*Created: {datetime.now(timezone.utc).isoformat()}*"
            ),
            labels=["automation", "daily-runner"],
        )

        created_issues.append({
            "number": issue.number,
            "title": issue.title,
            "url": issue.html_url,
            "labels": [label.name for label in issue.labels],
        })

        logger.info(f"  Created issue #{issue.number}: {issue.title}")

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
            self._log_run_header()
            notes = self.ingest_notes()
            if not notes:
                logger.warning("No notes found, exiting")
                return 0

            summary = self._build_summary(notes)
            issues = self._handle_issues(summary)
            output_file = self.save_output(notes, summary, issues)
            self._log_run_footer(start_time, notes, issues, output_file)
            self._log_demo_instructions()
            self._log_final_banner()
            return 0

        except Exception as e:
            logger.error("=" * 60)
            logger.error(f"❌ Automation failed: {e}")
            logger.error("=" * 60)
            logger.exception("Daily automation run failed")
            return 1

    def _build_summary(self, notes: List[str]) -> Dict[str, Any]:
        """Generate a summary using demo data or OpenAI."""
        if self.demo_mode:
            logger.info("Using demo summary generation (no OpenAI calls)")
            return self._generate_demo_summary(notes)
        return self.generate_summary(notes)

    def _handle_issues(self, summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create GitHub issues when appropriate."""
        action_items = summary.get("action_items", [])
        if self.demo_mode:
            logger.info(f"Skipping GitHub issue creation (demo_mode={self.demo_mode})")
            return []
        if action_items:
            logger.info("Creating GitHub issues from action items")
            return self.create_github_issues(action_items)

        logger.info("No action items to create issues from")
        return []

    def _log_run_header(self) -> None:
        """Log the start banner for a run."""
        logger.info("=" * 60)
        logger.info("=== Daily automation run starting ===")
        logger.info("=" * 60)

    def _log_run_footer(
        self,
        start_time: datetime,
        notes: List[str],
        issues: List[Dict[str, Any]],
        output_file: Path,
    ) -> None:
        """Log summary details after the run completes."""
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        logger.info("=" * 60)
        logger.info("✅ AUTOMATION COMPLETE")
        logger.info(f"   Duration: {duration:.2f}s")
        logger.info(f"   Notes: {len(notes)}")
        logger.info(f"   Issues: {len(issues)}")
        logger.info(f"   Output: {output_file}")
        logger.info("=" * 60)

    def _log_demo_instructions(self) -> None:
        """Log helpful instructions when running in demo mode."""
        if not self.demo_mode:
            return

        logger.info("")
        logger.info("💡 To enable live API calls:")
        logger.info("   1. Install dependencies: pip install -r scripts/requirements.txt")
        logger.info("   2. Configure .env.local with API keys")
        logger.info("   3. Run again: python3 scripts/daily_v2.py")
        logger.info("")

    def _log_final_banner(self) -> None:
        """Log final banner to signal completion."""
        logger.info("=" * 60)
        logger.info("=== Daily automation run finished successfully ===")
        logger.info("=" * 60)


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
