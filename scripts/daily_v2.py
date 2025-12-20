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
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

# Import sales pipeline module
try:
    from lib.sales_pipeline import create_sales_pipeline_source, SalesPipelineData
    HAS_SALES_PIPELINE = True
except ImportError:
    HAS_SALES_PIPELINE = False
    logger.warning("⚠️  Sales pipeline module not available")


def configure_logging() -> logging.Logger:
    """Configure structured logging with env-driven levels and run identifiers."""
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    # Ensure every log record gets the run_id field
    old_factory = logging.getLogRecordFactory()

    def record_factory(*args, **kwargs):
        record = old_factory(*args, **kwargs)
        if not hasattr(record, "run_id"):
            record.run_id = run_id
        return record

    logging.setLogRecordFactory(record_factory)

    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] [run_id=%(run_id)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )

    logger = logging.getLogger(__name__)
    logger.debug("Logging configured", extra={"run_id": run_id})
    return logger


logger = configure_logging()

# Third-party imports (with fallback for demo mode)
try:
    from dotenv import load_dotenv
    from openai import (
        APIConnectionError,
        APITimeoutError,
        APIStatusError,
        OpenAI,
        RateLimitError,
    )
    from github import (
        BadCredentialsException,
        Github,
        GithubException,
        RateLimitExceededException,
        UnknownObjectException,
    )
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False
    logger.warning("⚠️  Missing dependencies. Install with: pip install -r scripts/requirements.txt")
    logger.warning("   Running in DEMO MODE (no actual API calls)")


@dataclass
class AutomationConfig:
    """Configuration container for automation runtime settings."""
    openai_api_key: Optional[str]
    github_token: Optional[str]
    repo_name: Optional[str]
    output_dir: Path
    notes_source: Path
    demo_mode: bool

    @classmethod
    def load(cls, demo_mode: bool, project_root: Path) -> "AutomationConfig":
        """Load configuration from environment variables with sensible defaults."""
        if HAS_DEPS:
            load_dotenv(project_root / ".env.local")

        output_dir = Path(os.getenv("OUTPUT_DIR", project_root / "output"))
        notes_source = Path(os.getenv("NOTES_SOURCE", project_root / "output" / "notes"))

        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            github_token=os.getenv("GITHUB_TOKEN"),
            repo_name=os.getenv("REPO_NAME"),
            output_dir=output_dir,
            notes_source=notes_source,
            demo_mode=demo_mode,
        )

    def missing_required(self) -> List[str]:
        """Return a list of missing required env vars with guidance."""
        missing = []
        if not self.openai_api_key or self.openai_api_key == "your-openai-api-key-here":
            missing.append("OPENAI_API_KEY (set a valid OpenAI API key)")

        if not self.github_token or self.github_token == "your-github-token-here":
            missing.append("GITHUB_TOKEN (provide a PAT with repo scope)")

        if not self.repo_name or self.repo_name == "owner/repo":
            missing.append("REPO_NAME (format: owner/repo)")

        return missing


class DailyAutomation:
    """Main automation orchestrator.
    
    Coordinates the daily workflow of note ingestion, AI summarization,
    GitHub issue creation, and structured output generation.
    """

    def __init__(self, demo_mode: bool = False):
        """Set up paths, clients, and runtime mode.

        Args:
            demo_mode: When True, skip external API calls and use stubbed data so the
                script can run safely without network access.

        Side Effects:
            - Creates local output and notes directories if they do not exist.
            - Initializes OpenAI and GitHub clients unless running in demo mode or
              dependencies are missing.
        """
        self.project_root = Path(__file__).parent.parent
        self.demo_mode = demo_mode or not HAS_DEPS
        self.config = AutomationConfig.load(self.demo_mode, self.project_root)

        self.output_dir = self.config.output_dir
        self.notes_source = self.config.notes_source

        # Ensure directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.notes_source.mkdir(parents=True, exist_ok=True)

        # Initialize clients
        self.openai_client: Optional[OpenAI] = None
        self.github_client: Optional[Github] = None
        self.repo = None

        if not self.demo_mode:
            self._initialize_clients()

        logger.info(
            "Initialized DailyAutomation",
            extra={
                "demo_mode": self.demo_mode,
                "output_dir": str(self.output_dir),
                "notes_source": str(self.notes_source),
            },
        )

    def _initialize_clients(self) -> None:
        """Initialize OpenAI and GitHub clients with fail-fast validation.
        
        Raises RuntimeError if required environment variables are missing.
        
        Side Effects:
            - Validates environment configuration
            - Establishes connections to OpenAI and GitHub APIs
            - Logs detailed error messages with recovery guidance
        """
        # Check for required environment variables
        missing = self.config.missing_required()

        if missing:
            for env_var in missing:
                logger.error(
                    "Missing required configuration",
                    extra={
                        "env_var": env_var,
                        "hint": "Set in .env.local or export before running",
                    },
                )

            msg = (
                "Required environment variables are missing. "
                "Set them in .env.local or run with --demo flag. "
                f"Missing: {', '.join(missing)}"
            )
            raise RuntimeError(msg)

        # Initialize API clients
        try:
            self.openai_client = OpenAI(api_key=self.config.openai_api_key)
        except Exception as e:
            logger.error("❌ Failed to initialize OpenAI client.")
            logger.error("   Verify OPENAI_API_KEY is valid and network access is available.")
            raise RuntimeError("OpenAI client initialization failed") from e

        try:
            self.github_client = Github(auth=Github.Auth.Token(self.config.github_token))
            self.repo = self.github_client.get_repo(self.config.repo_name)
            logger.info(
                "✓ API clients initialized successfully",
                extra={"repo": self.config.repo_name},
            )
        except BadCredentialsException as e:
            logger.error("❌ GitHub authentication failed: invalid GITHUB_TOKEN.")
            logger.error("   Generate a token with 'repo' scope and update .env.local.")
            raise RuntimeError("GitHub authentication failed") from e
        except RateLimitExceededException as e:
            logger.error("❌ GitHub rate limit exceeded while initializing repository access.")
            logger.error("   Retry after the rate limit window resets or use a token with higher limits.")
            raise RuntimeError("GitHub rate limit exceeded") from e
        except GithubException as e:
            logger.error(
                "❌ Failed to access repository",
                extra={"repo": self.config.repo_name, "error": str(e)},
            )
            logger.error("   Check that GITHUB_TOKEN has 'repo' scope and REPO_NAME is correct")
            raise RuntimeError("GitHub repository access failed") from e
        except Exception as e:
            logger.error(f"❌ Failed to initialize GitHub client: {e}")
            raise RuntimeError("GitHub client initialization failed") from e

    def ingest_notes(self) -> List[str]:
        """Load text notes that feed the automation run.

        Returns:
            A list of note strings gathered from Markdown or text files in the
            configured notes directory. If no files are found, a small set of demo
            notes is returned.

        Side Effects:
            Logs progress and warnings; creates the notes directory if missing during
            initialization.
        """
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
        """Turn raw notes into a structured summary.

        Args:
            notes: List of raw note strings to analyze.

        Returns:
            A dictionary with ``highlights``, ``action_items``, and ``assessment`` keys
            describing the day.

        Side Effects:
            - Calls the OpenAI API when not in demo mode.
            - Logs progress and any API errors.
        """
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
        except RateLimitError as e:
            logger.error("❌ OpenAI rate limit reached while generating summary.")
            logger.error("   Wait before retrying or reduce request volume.")
            logger.debug(f"OpenAI rate limit details: {e}")
        except APITimeoutError as e:
            logger.error("❌ OpenAI request timed out while generating summary.")
            logger.error("   Check network connectivity or try again with fewer notes.")
            logger.debug(f"OpenAI timeout details: {e}")
        except APIConnectionError as e:
            logger.error("❌ Unable to reach OpenAI (network or DNS issue).")
            logger.error("   Verify internet access and any proxy/firewall settings.")
            logger.debug(f"OpenAI connection details: {e}")
        except APIStatusError as e:
            logger.error(f"❌ OpenAI returned an error response (status {getattr(e, 'status_code', 'unknown')}).")
            logger.error("   Review API key permissions or retry later if this is a service issue.")
            logger.debug(f"OpenAI status error details: {e}")
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
        """Create GitHub issues for each action item.

        Args:
            action_items: List of action item strings from the summary.

        Returns:
            A list of dicts describing the created or demo issues (with ``number``, ``title``, ``url``, ``labels``).

        Side Effects:
            - Creates real GitHub issues when not in demo mode.
            - Logs results for each issue created.
        """
        logger.info("📋 Creating GitHub issues...")
        created_issues = []

        if not action_items:
            logger.info("  No action items to create issues from")
            return created_issues

        if self.demo_mode or not self.repo:
            logger.info("  Running in demo mode (stubbed)")
            return self._demo_issues(action_items)

        for item in action_items:
            try:
                # Skip invalid items (None, empty, or whitespace-only)
                if item is None or not str(item).strip():
                    logger.warning(f"  Skipping empty or invalid action item")
                    continue
                    
                issue = self._create_issue_from_item(str(item))
                created_issues.append({
                    "number": issue.number,
                    "title": issue.title,
                    "url": issue.html_url,
                    "labels": [label.name for label in issue.labels],
                })
                logger.info(f"  Created issue #{issue.number}: {issue.title}")
            except ValueError as e:
                logger.warning(f"  Skipping invalid action item: {e}")
            except RateLimitExceededException as e:
                logger.error(
                    f"❌ GitHub rate limit reached while creating issue for: {item[:50]}..."
                )
                logger.error("   Wait before retrying or reduce request volume.")
                logger.debug(f"GitHub rate limit details: {e}")
            except UnknownObjectException as e:
                logger.error(f"❌ Repository or resource not found: {self.config.repo_name}")
                logger.error("   Verify the GITHUB_REPO environment variable is correct.")
                logger.debug(f"GitHub unknown object details: {e}")
            except BadCredentialsException as e:
                logger.error("❌ GitHub authentication failed (invalid or expired PAT).")
                logger.error("   Verify GITHUB_TOKEN has correct permissions.")
                logger.debug(f"GitHub credentials error details: {e}")
            except GithubException as e:
                logger.error(f"❌ GitHub API error creating issue for: {item[:50]}...")
                logger.error(f"   Status: {e.status}, Message: {e.data.get('message', str(e))}")
                logger.debug(f"GitHub exception details: {e}")
            except Exception as e:
                logger.error(f"Unexpected error creating issue: {e}")
                logger.info("  Continuing with partial results...")

        logger.info(f"✓ Created {len(created_issues)} GitHub issues")
        return created_issues

    def _demo_issues(self, action_items: List[str]) -> List[Dict[str, Any]]:
        """Generate stub issue data for demo mode."""
        return [
            {
                "number": i + 42,
                "title": item,
                "url": f"https://github.com/example/repo/issues/{i + 42}",
                "labels": ["automation", "daily-runner"],
                "demo": True,
            }
            for i, item in enumerate(action_items)
        ]

    def _create_issue_from_item(self, item_text: str) -> Any:
        """Create a single GitHub issue from an action item string."""
        if not item_text or not item_text.strip():
            raise ValueError("Cannot create issue from empty action item")

        # Ensure title is not empty after stripping
        title = item_text[:100].strip()
        if not title:
            raise ValueError("Action item results in empty title after processing")
            
        body = (
            f"Auto-generated from daily automation runner\n\n"
            f"**Action Item:**\n{item_text}\n\n"
            f"---\n*Created: {datetime.now(timezone.utc).isoformat()}*"
        )
        return self.repo.create_issue(title=title, body=body, labels=["automation", "daily-runner"])

    def pull_sales_pipeline_data(self) -> Optional[Dict[str, Any]]:
        """Pull sales pipeline data and save to output directory.
        
        Returns:
            Sales pipeline data dict if successful, None otherwise.
            
        Side Effects:
            - Pulls data from configured sales pipeline source
            - Saves data to sales_pipeline.json
            - Creates cache file for historical tracking
        """
        if not HAS_SALES_PIPELINE:
            logger.warning("Sales pipeline module not available, skipping")
            return None
        
        logger.info("📊 Pulling sales pipeline data...")
        
        try:
            # Create sales pipeline data source
            pipeline_source = create_sales_pipeline_source(
                self.project_root,
                demo_mode=self.demo_mode
            )
            
            # Pull data
            pipeline_data = pipeline_source.pull_data()
            
            # Save to main output file
            pipeline_file = self.output_dir / "sales_pipeline.json"
            pipeline_file.write_text(
                json.dumps(pipeline_data.to_dict(), indent=2),
                encoding="utf-8"
            )
            logger.info(f"  Saved: {pipeline_file}")
            
            # Save to cache
            try:
                cache_file = pipeline_source.save_to_cache(pipeline_data)
                logger.debug(f"  Cached: {cache_file}")
            except Exception as e:
                logger.warning(f"Failed to cache pipeline data: {e}")
            
            logger.info("✓ Sales pipeline data pull complete")
            return pipeline_data.to_dict()
            
        except Exception as e:
            logger.error(f"Failed to pull sales pipeline data: {e}")
            logger.debug("Sales pipeline pull error details:", exc_info=True)
            return None

    def save_output(self, notes: List[str], summary: Dict[str, Any], issues: List[Dict[str, Any]], pipeline_data: Optional[Dict[str, Any]] = None) -> Path:
        """Save the daily run's output to a timestamped JSON file.

        Args:
            notes: The raw notes that were processed.
            summary: The structured summary generated from notes.
            issues: List of GitHub issues created from action items.
            pipeline_data: Optional sales pipeline data.

        Returns:
            The absolute Path to the saved output file.

        Side Effects:
            - Writes a JSON file to the ``output/`` directory.
            - Creates the directory if it does not exist.
            - Logs the saved file path.
        """
        logger.info("💾 Saving output...")

        timestamp = datetime.now(timezone.utc)
        
        # Handle potential None values in summary with defensive programming
        highlights = summary.get("highlights") or []
        action_items = summary.get("action_items") or []
        assessment = summary.get("assessment") or ""
        
        # Ensure lists contain only non-empty strings to avoid formatting errors
        highlights = [s for h in highlights if h is not None and (s := str(h).strip())]
        action_items = [s for item in action_items if item is not None and (s := str(item).strip())]
        
        # Build raw_text with proper handling of empty action items
        raw_text_parts = [f"Summary:\n{assessment}"]
        if action_items:
            raw_text_parts.append("\nActions:\n" + "\n".join(f"- {item}" for item in action_items))
        else:
            raw_text_parts.append("\nActions:\n(No action items)")
        
        output_data = {
            "date": timestamp.strftime("%Y-%m-%d"),
            "created_at": timestamp.isoformat(),
            "repo": self.config.repo_name or "unknown/repo",
            "summary_bullets": highlights,
            "action_items": action_items,
            "assessment": assessment,
            "issues_created": len(issues),
            "issues": issues,
            "raw_text": "".join(raw_text_parts),
            "metadata": {
                "runner_version": "2.0.0",
                "demo_mode": self.demo_mode,
                "notes_count": len(notes),
                "sales_pipeline_enabled": pipeline_data is not None,
            }
        }
        
        # Add sales pipeline summary if available
        if pipeline_data:
            output_data["sales_pipeline_summary"] = {
                "total_leads": pipeline_data.get("total_leads", 0),
                "total_value": pipeline_data.get("total_value", 0),
                "weighted_value": pipeline_data.get("weighted_value", 0),
                "timestamp": pipeline_data.get("timestamp", ""),
            }

        # Save main output
        output_file = self.output_dir / "daily_summary.json"
        output_file.write_text(json.dumps(output_data, indent=2, ensure_ascii=False), encoding="utf-8")
        logger.info(f"  Saved: {output_file}")

        # Save audit log
        log_file = self.output_dir / f"audit_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        log_file.write_text(json.dumps(output_data, indent=2, ensure_ascii=False), encoding="utf-8")
        logger.info(f"  Saved: {log_file}")

        logger.info("✓ Output saved successfully")
        return output_file

    def run(self) -> int:
        """Execute the daily automation workflow from start to finish.

        Steps performed:
            1. Ingest notes from configured source.
            2. Generate summary (using OpenAI or demo fallback).
            3. Pull sales pipeline data (new feature).
            4. Create GitHub issues from action items (skipped in demo mode).
            5. Save outputs to disk.

        Returns:
            0 on success, 1 on failure.

        Side Effects:
            - Logs progress and results.
            - Creates GitHub issues (when not in demo).
            - Saves output JSON files to the ``output/`` directory.
        """
        start_time = datetime.now(timezone.utc)

        try:
            self._log_run_header()

            notes = self.ingest_notes()
            if not notes:
                logger.warning("No notes found, exiting")
                return 0
            logger.info(f"Ingested {len(notes)} notes")

            summary = self._build_summary(notes)
            
            # Pull sales pipeline data
            pipeline_data = self.pull_sales_pipeline_data()
            
            issues = self._handle_issues(summary)
            output_file = self.save_output(notes, summary, issues, pipeline_data)

            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            self._log_run_footer(duration, len(notes), len(issues), output_file)

            if self.demo_mode:
                self._log_demo_instructions()

            self._log_final_banner()
            return 0

        except Exception as e:
            logger.error(f"❌ Fatal error during automation run: {e}", exc_info=True)
            return 1

    def _log_run_header(self) -> None:
        """Print a header banner to indicate run start."""
        logger.info("=" * 60)
        logger.info("=== Daily automation run starting ===")
        logger.info("=" * 60)

    def _build_summary(self, notes: List[str]) -> Dict[str, Any]:
        """Generate or stub out the summary."""
        if self.demo_mode:
            logger.info("Using demo summary generation (no OpenAI calls)")
            return self._generate_demo_summary(notes)
        return self.generate_summary(notes)

    def _handle_issues(self, summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create GitHub issues from action items if appropriate."""
        action_items = summary.get("action_items", [])
        if self.demo_mode:
            logger.info(f"Skipping GitHub issue creation (demo_mode={self.demo_mode})")
            return []
        if action_items:
            logger.info("Creating GitHub issues from action items")
            return self.create_github_issues(action_items)
        logger.info("No action items to create issues from")
        return []

    def _log_run_footer(self, duration: float, note_count: int, issue_count: int, output_file: Path) -> None:
        """Print a footer banner with run statistics."""
        logger.info("=" * 60)
        logger.info("✅ AUTOMATION COMPLETE")
        logger.info(f"   Duration: {duration:.2f}s")
        logger.info(f"   Notes: {note_count}")
        logger.info(f"   Issues: {issue_count}")
        logger.info(f"   Output: {output_file}")
        logger.info("=" * 60)

    def _log_demo_instructions(self) -> None:
        """Print instructions for enabling live API calls."""
        logger.info("")
        logger.info("💡 To enable live API calls:")
        logger.info("   1. Install dependencies: pip install -r scripts/requirements.txt")
        logger.info("   2. Configure .env.local with API keys")
        logger.info("   3. Run again: python3 scripts/daily_v2.py")
        logger.info("")

    def _log_final_banner(self) -> None:
        """Print final success banner."""
        logger.info("=" * 60)
        logger.info("=== Daily automation run finished successfully ===")
        logger.info("=" * 60)


def main(argv: Optional[List[str]] = None) -> int:
    """Run the daily automation script from the command line.

    Args:
        argv: Command-line arguments (defaults to sys.argv if None).

    Returns:
        0 on success, 1 on failure.

    Side Effects:
        - Configures logging with a run-specific ID.
        - Instantiates and runs DailyAutomation.
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
