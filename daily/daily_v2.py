#!/usr/bin/env python3
"""
daily_v2.py

Daily automation runner:
- Load inputs (notes, data)
- Generate summaries (txt, docx, json)
- Update logs (xlsx)
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict

# import your own modules here
# from src.io import load_inputs, write_docx, write_excel, write_json


# --------- Constants ---------
BASE_DIR = Path(__file__).resolve().parent.parent  # adjust if needed
OUTPUT_DIR = BASE_DIR / "outputs"
LOG_FILE = OUTPUT_DIR / "daily_v2.log"
CONFIG_FILE = BASE_DIR / "config.yaml"  # optional


# --------- Logging setup ---------
def setup_logging(verbosity: int = 0) -> None:
    """
    Configure logging.
    verbosity=0 -> INFO
    verbosity=1 -> DEBUG
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    level = logging.DEBUG if verbosity > 0 else logging.INFO

    log_format = "%(asctime)s [%(levelname)s] %(name)s - %(message)s"

    # Root logger
    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(LOG_FILE, encoding="utf-8"),
        ],
    )

    logging.getLogger(__name__).debug("Logging initialized. Level: %s", logging.getLevelName(level))


# --------- CLI argument parsing ---------
def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the daily automation pipeline.",
        allow_abbrev=False,  # avoid weird partial-arg matches
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run all steps without writing/outputting final files.",
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Override date in YYYY-MM-DD format (optional).",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="count",
        default=0,
        help="Increase verbosity (use -v for debug logging).",
    )

    # NOTE: do NOT parse unknown args as fatal; just warn and ignore
    args, unknown = parser.parse_known_args(argv)
    if unknown:
        print(f"[daily_v2] Warning: ignoring unknown args: {unknown}", file=sys.stderr)
    return args


# --------- Core pipeline steps ---------
def load_config() -> Dict[str, Any]:
    """
    Optionally load config.yaml.
    If missing, return sane defaults and log a warning.
    """
    logger = logging.getLogger(__name__)

    yaml_spec = importlib.util.find_spec("yaml")
    if yaml_spec is None:
        logger.warning("PyYAML not installed; skipping config load.")
        return {}

    import yaml  # type: ignore

    if not CONFIG_FILE.exists():
        logger.warning("Config file not found at %s, using defaults.", CONFIG_FILE)
        return {}

    with CONFIG_FILE.open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}
    logger.debug("Loaded config: %r", config)
    return config


def step_1_load_inputs(config: Dict[str, Any]) -> Dict[str, Any]:
    logger = logging.getLogger(__name__)
    logger.info("Step 1: Loading inputs...")

    # TODO: implement
    # notes = load_notes(...)
    # market_data = load_market_data(...)
    data = {
        "notes": [],
        "market_data": {},
        "config": config,
    }

    logger.debug("Loaded inputs: %r", list(data.keys()))
    logger.info("Step 1 complete.")
    return data


def step_2_generate_summary(data: Dict[str, Any]) -> Dict[str, Any]:
    logger = logging.getLogger(__name__)
    logger.info("Step 2: Generating summaries...")

    summary_text = "Stub summary..."
    if data.get("notes"):
        summary_text = "\n".join(str(note) for note in data["notes"])

    outputs = {
        "summary_text": summary_text,
        "summary_json": {"summary": summary_text, "meta": {"has_notes": bool(data.get("notes"))}},
        # "summary_docx": summary_docx_bytes,
    }

    logger.debug("Generated summary keys: %r", list(outputs.keys()))
    logger.info("Step 2 complete.")
    return outputs


def step_3_write_outputs(outputs: Dict[str, Any], dry_run: bool = False) -> None:
    logger = logging.getLogger(__name__)
    logger.info("Step 3: Writing outputs (dry_run=%s)...", dry_run)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if dry_run:
        logger.info("Dry run enabled; skipping writes.")
        return

    # Text
    txt_path = OUTPUT_DIR / "daily_summary.txt"
    txt_path.write_text(outputs["summary_text"], encoding="utf-8")
    logger.info("Wrote text summary: %s", txt_path)

    # JSON
    json_path = OUTPUT_DIR / "daily_summary.json"
    with json_path.open("w", encoding="utf-8") as f:
        json.dump(outputs["summary_json"], f, indent=2)
    logger.info("Wrote JSON summary: %s", json_path)

    # TODO: Excel, docx, etc.

    logger.info("Step 3 complete.")


# --------- Main entrypoint ---------
def build_failure_outputs(error_message: str) -> Dict[str, Any]:
    fallback_text = (
        "Daily automation encountered an error. "
        "See daily_v2.log for details.\n"
        f"Error: {error_message}"
    )
    return {
        "summary_text": fallback_text,
        "summary_json": {"error": error_message, "note": "See daily_v2.log for details."},
    }


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)

    logger.info("=== Starting daily_v2 run (dry_run=%s) ===", args.dry_run)

    exit_code = 0
    outputs: Dict[str, Any]

    try:
        config = load_config()
        data = step_1_load_inputs(config)
        outputs = step_2_generate_summary(data)
        logger.info("Pipeline steps completed successfully.")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Fatal error while processing pipeline: %s", exc)
        outputs = build_failure_outputs(str(exc))
        exit_code = 1

    try:
        step_3_write_outputs(outputs, dry_run=args.dry_run)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to write outputs: %s", exc)
        exit_code = 1

    if exit_code == 0:
        logger.info("=== daily_v2 completed successfully ===")
    else:
        logger.info("=== daily_v2 completed with errors ===")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
