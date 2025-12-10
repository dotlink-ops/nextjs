#!/usr/bin/env python3
# pyright: strict
"""
Sales Pipeline Data Pull Script
================================

Automated script to pull sales pipeline data from configured CRM/data sources.
Saves structured output to JSON for consumption by Next.js frontend.

Environment Variables:
- SALES_PIPELINE_SOURCE: Data source type (default: "demo")
- SALES_PIPELINE_API_KEY: API key for authenticated sources (optional)
- OUTPUT_DIR: Output directory for generated files (default: ./output)

Usage:
    python3 scripts/pull_sales_pipeline.py [--demo]
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from lib.clients import create_sales_pipeline_client
from lib.models import SalesPipelineData


def configure_logging() -> logging.Logger:
    """Configure logging for the script."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )
    return logging.getLogger(__name__)


logger = configure_logging()


def save_pipeline_data(data: Dict[str, Any], output_dir: Path) -> None:
    """
    Save pipeline data to JSON files.
    
    Args:
        data: Pipeline data dictionary
        output_dir: Output directory path
    """
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save main output file
    output_file = output_dir / "sales_pipeline.json"
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)
    logger.info(f"✓ Saved pipeline data to {output_file}")
    
    # Save backup with timestamp
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_dir = output_dir / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_file = backup_dir / f"sales_pipeline_{timestamp}.json"
    with open(backup_file, "w") as f:
        json.dump(data, f, indent=2)
    logger.info(f"✓ Saved backup to {backup_file}")


def main() -> int:
    """
    Main entry point for sales pipeline data pull.
    
    Returns:
        Exit code (0 for success, non-zero for failure)
    """
    logger.info("=" * 60)
    logger.info("Sales Pipeline Data Pull - Starting")
    logger.info("=" * 60)
    
    # Parse arguments
    demo_mode = "--demo" in sys.argv or "--dry-run" in sys.argv
    
    if demo_mode:
        logger.info("🎭 Running in DEMO MODE (no real API calls)")
    
    # Get project root and output directory
    project_root = Path(__file__).parent.parent
    output_dir = Path(os.getenv("OUTPUT_DIR", str(project_root / "output")))
    
    try:
        # Create sales pipeline client
        logger.info("Initializing sales pipeline client...")
        client = create_sales_pipeline_client(project_root, demo_mode=demo_mode)
        
        # Pull pipeline data
        logger.info("Pulling sales pipeline data...")
        pipeline_data = client.pull_pipeline_data(demo_mode=demo_mode)
        
        # Create structured model
        pipeline_model = SalesPipelineData.from_dict(pipeline_data)
        
        # Log summary
        logger.info(f"✓ Pulled {pipeline_model.deals_count} deals from {pipeline_model.source}")
        logger.info(f"  Total pipeline value: ${pipeline_model.total_pipeline_value:,}")
        logger.info(f"  Active deals: {pipeline_model.metrics.get('active_deals', 0)}")
        logger.info(f"  Weighted pipeline: ${pipeline_model.metrics.get('weighted_pipeline', 0):,}")
        
        # Save to output files
        save_pipeline_data(pipeline_model.to_dict(), output_dir)
        
        logger.info("=" * 60)
        logger.info("✅ Sales Pipeline Data Pull - Completed Successfully")
        logger.info("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"❌ Error during pipeline data pull: {e}")
        logger.exception("Full traceback:")
        return 1


if __name__ == "__main__":
    sys.exit(main())
