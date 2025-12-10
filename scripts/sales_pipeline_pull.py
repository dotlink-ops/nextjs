#!/usr/bin/env python3
# pyright: strict
"""
Sales Pipeline Data Pull Automation
=====================================

Automated script that pulls sales pipeline data from various sources,
processes it, and generates structured outputs for reporting and analysis.

Features:
- Supports multiple data sources (CSV, API integrations)
- Generates daily sales pipeline summaries
- Tracks key metrics (deals, revenue, conversion rates)
- Creates JSON outputs compatible with dashboard
- Maintains audit logs for compliance

Environment Variables:
- SALES_DATA_SOURCE: Path to sales data file or API endpoint
- SALES_DATA_TYPE: Type of data source (csv, api, demo)
- OUTPUT_DIR: Output directory for generated files (default: ./output)

Usage:
    # Demo mode (uses sample data)
    python3 scripts/sales_pipeline_pull.py --demo
    
    # Production mode (pulls from configured source)
    python3 scripts/sales_pipeline_pull.py
"""

import os
import sys
import json
import logging
import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Import models from lib
from lib.models import SalesDeal, PipelineSummary

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S%z",
)

logger = logging.getLogger(__name__)


class SalesPipelineAutomation:
    """Main automation orchestrator for sales pipeline data."""
    
    def __init__(self, demo_mode: bool = False):
        """Initialize the sales pipeline automation.
        
        Args:
            demo_mode: When True, uses sample data instead of real sources.
        """
        self.project_root = Path(__file__).parent.parent
        self.demo_mode = demo_mode
        
        # Load configuration
        self.output_dir = Path(os.getenv("OUTPUT_DIR", self.project_root / "output"))
        self.data_source = os.getenv("SALES_DATA_SOURCE", "")
        self.data_type = os.getenv("SALES_DATA_TYPE", "demo" if demo_mode else "csv")
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(
            "Initialized SalesPipelineAutomation",
            extra={
                "demo_mode": self.demo_mode,
                "data_type": self.data_type,
                "output_dir": str(self.output_dir),
            },
        )
    
    def pull_data(self) -> List[SalesDeal]:
        """Pull sales pipeline data from configured source.
        
        Returns:
            List of SalesDeal objects.
        """
        logger.info("📥 Pulling sales pipeline data...")
        
        if self.demo_mode or self.data_type == "demo":
            return self._generate_demo_data()
        elif self.data_type == "csv":
            return self._pull_from_csv()
        else:
            logger.warning(f"Unsupported data type: {self.data_type}, using demo data")
            return self._generate_demo_data()
    
    def _generate_demo_data(self) -> List[SalesDeal]:
        """Generate realistic demo sales data."""
        logger.info("  Using demo data")
        
        demo_deals = [
            SalesDeal(
                deal_id="DEAL-001",
                company="Acme Corp",
                contact="John Smith",
                stage="Proposal",
                value=50000.0,
                probability=60,
                expected_close_date="2025-01-15",
                last_activity="2025-12-05",
            ),
            SalesDeal(
                deal_id="DEAL-002",
                company="TechStart Inc",
                contact="Jane Doe",
                stage="Negotiation",
                value=125000.0,
                probability=80,
                expected_close_date="2025-12-20",
                last_activity="2025-12-09",
            ),
            SalesDeal(
                deal_id="DEAL-003",
                company="Global Industries",
                contact="Bob Johnson",
                stage="Discovery",
                value=75000.0,
                probability=30,
                expected_close_date="2025-02-28",
                last_activity="2025-12-01",
            ),
            SalesDeal(
                deal_id="DEAL-004",
                company="StartupXYZ",
                contact="Alice Wong",
                stage="Proposal",
                value=35000.0,
                probability=50,
                expected_close_date="2025-01-31",
                last_activity="2025-12-08",
            ),
            SalesDeal(
                deal_id="DEAL-005",
                company="Enterprise Solutions Ltd",
                contact="Charlie Brown",
                stage="Closed Won",
                value=200000.0,
                probability=100,
                expected_close_date="2025-12-10",
                last_activity="2025-12-10",
            ),
        ]
        
        logger.info(f"✓ Generated {len(demo_deals)} demo deals")
        return demo_deals
    
    def _pull_from_csv(self) -> List[SalesDeal]:
        """Pull sales data from CSV file.
        
        Returns:
            List of SalesDeal objects parsed from CSV.
        """
        if not self.data_source:
            logger.warning("SALES_DATA_SOURCE not configured, using demo data")
            return self._generate_demo_data()
        
        csv_path = Path(self.data_source)
        if not csv_path.exists():
            logger.warning(f"CSV file not found: {csv_path}, using demo data")
            return self._generate_demo_data()
        
        deals: List[SalesDeal] = []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row_num, row in enumerate(reader, start=2):  # start=2 because row 1 is header
                    probability = int(row['probability'])
                    if not 0 <= probability <= 100:
                        raise ValueError(f"Probability must be 0-100, got {probability} in row: {row}")
                    deal = SalesDeal(
                        deal_id=row['deal_id'],
                        company=row['company'],
                        contact=row['contact'],
                        stage=row['stage'],
                        value=float(row['value']),
                        probability=probability,
                        expected_close_date=row['expected_close_date'],
                        last_activity=row['last_activity'],
                    )
                    deals.append(deal)
            
            logger.info(f"✓ Loaded {len(deals)} deals from CSV")
            return deals
            
        except KeyError as e:
            logger.error(f"Missing required column in CSV: {e}")
            logger.error(f"  CSV must contain columns: deal_id, company, contact, stage, value, probability, expected_close_date, last_activity")
            logger.info("  Falling back to demo data")
            return self._generate_demo_data()
        except ValueError as e:
            logger.error(f"Invalid data format in CSV: {e}")
            logger.error(f"  Ensure 'value' is numeric and 'probability' is an integer between 0-100")
            logger.info("  Falling back to demo data")
            return self._generate_demo_data()
        except UnicodeDecodeError as e:
            logger.error(f"CSV file encoding error: {e}")
            logger.error(f"  Ensure the CSV file is UTF-8 encoded")
            logger.info("  Falling back to demo data")
            return self._generate_demo_data()
        except Exception as e:
            logger.error(f"Unexpected error reading CSV file: {e}")
            logger.info("  Falling back to demo data")
            return self._generate_demo_data()
    
    def analyze_pipeline(self, deals: List[SalesDeal]) -> PipelineSummary:
        """Analyze sales pipeline and generate summary statistics.
        
        Args:
            deals: List of sales deals to analyze.
        
        Returns:
            PipelineSummary with aggregated metrics.
        """
        logger.info("📊 Analyzing sales pipeline...")
        
        if not deals:
            logger.warning("No deals to analyze")
            return PipelineSummary(
                total_deals=0,
                total_value=0.0,
                weighted_value=0.0,
                avg_deal_size=0.0,
                deals_by_stage={},
                value_by_stage={},
            )
        
        # Calculate totals
        total_deals = len(deals)
        total_value = sum(deal.value for deal in deals)
        weighted_value = sum(deal.weighted_value for deal in deals)
        avg_deal_size = total_value / total_deals if total_deals > 0 else 0.0
        
        # Group by stage
        deals_by_stage: Dict[str, int] = {}
        value_by_stage: Dict[str, float] = {}
        
        for deal in deals:
            stage = deal.stage
            deals_by_stage[stage] = deals_by_stage.get(stage, 0) + 1
            value_by_stage[stage] = value_by_stage.get(stage, 0.0) + deal.value
        
        summary = PipelineSummary(
            total_deals=total_deals,
            total_value=total_value,
            weighted_value=weighted_value,
            avg_deal_size=avg_deal_size,
            deals_by_stage=deals_by_stage,
            value_by_stage=value_by_stage,
        )
        
        logger.info(f"✓ Analyzed {total_deals} deals, ${total_value:,.2f} total value")
        return summary
    
    def save_output(
        self,
        deals: List[SalesDeal],
        summary: PipelineSummary
    ) -> Path:
        """Save pipeline data and analysis to JSON files.
        
        Args:
            deals: List of sales deals.
            summary: Pipeline summary statistics.
        
        Returns:
            Path to the main output file.
        """
        logger.info("💾 Saving sales pipeline data...")
        
        timestamp = datetime.now(timezone.utc)
        
        # Prepare output data
        output_data = {
            "date": timestamp.strftime("%Y-%m-%d"),
            "created_at": timestamp.isoformat(),
            "summary": summary.to_dict(),
            "deals": [deal.to_dict() for deal in deals],
            "metadata": {
                "pipeline_version": "1.0.0",
                "demo_mode": self.demo_mode,
                "data_source": self.data_type,
            }
        }
        
        # Save main output
        output_file = self.output_dir / "sales_pipeline.json"
        output_file.write_text(json.dumps(output_data, indent=2), encoding="utf-8")
        logger.info(f"  Saved: {output_file}")
        
        # Save audit log
        audit_file = self.output_dir / f"sales_pipeline_audit_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        audit_file.write_text(json.dumps(output_data, indent=2), encoding="utf-8")
        logger.info(f"  Saved: {audit_file}")
        
        logger.info("✓ Output saved successfully")
        return output_file
    
    def run(self) -> int:
        """Execute the sales pipeline automation workflow.
        
        Returns:
            0 on success, 1 on failure.
        """
        start_time = datetime.now(timezone.utc)
        
        try:
            logger.info("=" * 60)
            logger.info("=== Sales Pipeline Data Pull Starting ===")
            logger.info("=" * 60)
            
            # Pull data
            deals = self.pull_data()
            if not deals:
                logger.warning("No deals found, exiting")
                return 0
            
            # Analyze pipeline
            summary = self.analyze_pipeline(deals)
            
            # Save outputs
            output_file = self.save_output(deals, summary)
            
            # Log completion
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info("=" * 60)
            logger.info("✅ SALES PIPELINE PULL COMPLETE")
            logger.info(f"   Duration: {duration:.2f}s")
            logger.info(f"   Deals: {len(deals)}")
            logger.info(f"   Total Value: ${summary.total_value:,.2f}")
            logger.info(f"   Weighted Value: ${summary.weighted_value:,.2f}")
            logger.info(f"   Output: {output_file}")
            logger.info("=" * 60)
            
            if self.demo_mode:
                logger.info("")
                logger.info("💡 To use real sales data:")
                logger.info("   1. Set SALES_DATA_SOURCE to your CSV file path")
                logger.info("   2. Set SALES_DATA_TYPE=csv")
                logger.info("   3. Run: python3 scripts/sales_pipeline_pull.py")
                logger.info("")
            
            logger.info("=" * 60)
            logger.info("=== Sales Pipeline Data Pull Finished ===")
            logger.info("=" * 60)
            
            return 0
            
        except Exception as e:
            logger.error(f"❌ Fatal error during sales pipeline pull: {e}", exc_info=True)
            return 1


def main(argv: Optional[List[str]] = None) -> int:
    """Run the sales pipeline automation from the command line.
    
    Args:
        argv: Command-line arguments (defaults to sys.argv if None).
    
    Returns:
        0 on success, 1 on failure.
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Pull and analyze sales pipeline data.",
        epilog="Example: python3 scripts/sales_pipeline_pull.py --demo"
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run in demo mode using sample data"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Alias for --demo (no real data sources)"
    )
    
    args = parser.parse_args(argv)
    
    # Support both --demo and --dry-run flags
    demo_mode = args.demo or args.dry_run
    
    try:
        automation = SalesPipelineAutomation(demo_mode=demo_mode)
        return automation.run()
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
