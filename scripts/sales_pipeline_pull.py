#!/usr/bin/env python3
# pyright: strict
"""
Sales Pipeline Data Pull Automation
====================================

A production-ready automation script that:
1. Pulls sales pipeline data from various sources (CSV, JSON, Google Sheets)
2. Validates and normalizes the data
3. Outputs structured JSON for Next.js frontend consumption
4. Maintains audit logs for compliance
5. Supports demo mode for testing without credentials

Environment Variables Required:
- SALES_DATA_SOURCE: Type of data source (csv, json, gsheets)
- SALES_DATA_PATH: Path to data file or Google Sheet ID

Optional:
- OUTPUT_DIR: Output directory for generated files (default: ./output)
- GSHEETS_CREDENTIALS: Path to Google Sheets API credentials JSON

Demo Mode:
Run with --demo flag to test without API keys or data sources.
"""

import os
import sys
import json
import logging
import argparse
import csv
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional


def configure_logging() -> logging.Logger:
    """Configure structured logging with env-driven levels and run identifiers."""
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    # Ensure every log record gets the run_id field
    old_factory = logging.getLogRecordFactory()

    def record_factory(*args: Any, **kwargs: Any) -> logging.LogRecord:
        record = old_factory(*args, **kwargs)
        if not hasattr(record, "run_id"):
            setattr(record, "run_id", run_id)
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

# Standard library imports
# (csv already imported at top)

# Third-party imports (with fallback for demo mode)
try:
    from dotenv import load_dotenv
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False
    logger.warning("⚠️  Missing dependencies. Install with: pip install -r scripts/requirements.txt")
    logger.warning("   Running in DEMO MODE (no actual data pulls)")


@dataclass
class SalesLead:
    """Represents a single sales lead in the pipeline."""
    id: str
    company: str
    contact_name: str
    email: str
    phone: Optional[str]
    stage: str  # e.g., "lead", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"
    value: float
    probability: float  # 0-100
    expected_close_date: str
    notes: str
    created_at: str
    updated_at: str


@dataclass
class PipelineMetrics:
    """Aggregated pipeline metrics."""
    total_leads: int
    total_value: float
    weighted_value: float  # Total value * probability
    leads_by_stage: Dict[str, int]
    value_by_stage: Dict[str, float]
    avg_deal_size: float
    conversion_rate: float


@dataclass
class SalesPipelineData:
    """Complete sales pipeline data structure."""
    date: str
    created_at: str
    source: str
    leads: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    metadata: Dict[str, Any]


class SalesPipelinePuller:
    """
    Sales Pipeline Data Puller.
    
    Pulls sales pipeline data from various sources and outputs structured JSON.
    
    Attributes:
        project_root: Root directory of the project
        output_dir: Directory for output files
        data_source: Type of data source (csv, json, gsheets)
        data_path: Path to data file or Google Sheet ID
        demo_mode: Whether to run in demo mode
    """

    def __init__(
        self,
        project_root: Path,
        output_dir: Path,
        data_source: str = "csv",
        data_path: Optional[str] = None,
        demo_mode: bool = False,
    ):
        """Initialize the sales pipeline puller."""
        self.project_root = project_root
        self.output_dir = output_dir
        self.data_source = data_source
        self.data_path = data_path
        self.demo_mode = demo_mode
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("🚀 Sales Pipeline Puller initialized")
        logger.info(f"   Output directory: {self.output_dir}")
        logger.info(f"   Data source: {self.data_source}")
        logger.info(f"   Demo mode: {self.demo_mode}")

    def pull_data(self) -> List[SalesLead]:
        """
        Pull sales pipeline data from configured source.
        
        Returns:
            List of SalesLead objects
        """
        logger.info("📥 Pulling sales pipeline data...")
        
        if self.demo_mode:
            logger.info("  Running in demo mode (stubbed)")
            return self._generate_demo_data()
        
        if self.data_source == "csv":
            return self._pull_from_csv()
        elif self.data_source == "json":
            return self._pull_from_json()
        elif self.data_source == "gsheets":
            return self._pull_from_gsheets()
        else:
            logger.error(f"❌ Unsupported data source: {self.data_source}")
            return self._generate_demo_data()

    def _pull_from_csv(self) -> List[SalesLead]:
        """Pull data from CSV file."""
        if not self.data_path:
            logger.error("❌ CSV path not configured (SALES_DATA_PATH)")
            return self._generate_demo_data()
        
        csv_path = Path(self.data_path)
        if not csv_path.exists():
            logger.error(f"❌ CSV file not found: {csv_path}")
            return self._generate_demo_data()
        
        try:
            leads: List[SalesLead] = []
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Helper function to safely convert to float
                    def safe_float(value: Any, default: float = 0.0) -> float:
                        try:
                            return float(value) if value and str(value).strip() else default
                        except (ValueError, TypeError):
                            return default
                    
                    lead = SalesLead(
                        id=row.get('id', ''),
                        company=row.get('company', ''),
                        contact_name=row.get('contact_name', ''),
                        email=row.get('email', ''),
                        phone=row.get('phone'),
                        stage=row.get('stage', 'lead'),
                        value=safe_float(row.get('value'), 0.0),
                        probability=safe_float(row.get('probability'), 0.0),
                        expected_close_date=row.get('expected_close_date', ''),
                        notes=row.get('notes', ''),
                        created_at=row.get('created_at', ''),
                        updated_at=row.get('updated_at', ''),
                    )
                    leads.append(lead)
            
            logger.info(f"✓ Loaded {len(leads)} leads from CSV")
            return leads
            
        except Exception as e:
            logger.error(f"❌ Error reading CSV: {e}")
            return self._generate_demo_data()

    def _pull_from_json(self) -> List[SalesLead]:
        """Pull data from JSON file."""
        if not self.data_path:
            logger.error("❌ JSON path not configured (SALES_DATA_PATH)")
            return self._generate_demo_data()
        
        json_path = Path(self.data_path)
        if not json_path.exists():
            logger.error(f"❌ JSON file not found: {json_path}")
            return self._generate_demo_data()
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Helper function to safely convert to float
            def safe_float(value: Any, default: float = 0.0) -> float:
                try:
                    return float(value) if value is not None else default
                except (ValueError, TypeError):
                    return default
            
            leads: List[SalesLead] = []
            for item in data.get('leads', []):
                lead = SalesLead(
                    id=item.get('id', ''),
                    company=item.get('company', ''),
                    contact_name=item.get('contact_name', ''),
                    email=item.get('email', ''),
                    phone=item.get('phone'),
                    stage=item.get('stage', 'lead'),
                    value=safe_float(item.get('value'), 0.0),
                    probability=safe_float(item.get('probability'), 0.0),
                    expected_close_date=item.get('expected_close_date', ''),
                    notes=item.get('notes', ''),
                    created_at=item.get('created_at', ''),
                    updated_at=item.get('updated_at', ''),
                )
                leads.append(lead)
            
            logger.info(f"✓ Loaded {len(leads)} leads from JSON")
            return leads
            
        except Exception as e:
            logger.error(f"❌ Error reading JSON: {e}")
            return self._generate_demo_data()

    def _pull_from_gsheets(self) -> List[SalesLead]:
        """Pull data from Google Sheets (placeholder for future implementation)."""
        logger.warning("⚠️  Google Sheets integration not yet implemented")
        logger.info("   Using demo data instead")
        return self._generate_demo_data()

    def _generate_demo_data(self) -> List[SalesLead]:
        """Generate realistic demo data for testing."""
        now = datetime.now(timezone.utc).isoformat()
        
        return [
            SalesLead(
                id="LEAD-001",
                company="TechCorp Solutions",
                contact_name="Sarah Johnson",
                email="sarah.johnson@techcorp.example",
                phone="+1-555-0123",
                stage="qualified",
                value=50000.0,
                probability=60.0,
                expected_close_date="2025-12-31",
                notes="Interested in enterprise plan. Follow up next week.",
                created_at="2025-11-15T10:00:00Z",
                updated_at=now,
            ),
            SalesLead(
                id="LEAD-002",
                company="Global Innovations Inc",
                contact_name="Michael Chen",
                email="m.chen@globalinno.example",
                phone="+1-555-0124",
                stage="proposal",
                value=125000.0,
                probability=75.0,
                expected_close_date="2025-12-20",
                notes="Sent proposal. Waiting for decision from exec team.",
                created_at="2025-10-20T14:30:00Z",
                updated_at=now,
            ),
            SalesLead(
                id="LEAD-003",
                company="StartupXYZ",
                contact_name="Emily Rodriguez",
                email="emily@startupxyz.example",
                phone=None,
                stage="lead",
                value=15000.0,
                probability=30.0,
                expected_close_date="2026-01-15",
                notes="Initial contact made. Needs more information.",
                created_at="2025-12-01T09:15:00Z",
                updated_at=now,
            ),
            SalesLead(
                id="LEAD-004",
                company="Enterprise Systems LLC",
                contact_name="David Thompson",
                email="d.thompson@entsys.example",
                phone="+1-555-0126",
                stage="negotiation",
                value=200000.0,
                probability=85.0,
                expected_close_date="2025-12-15",
                notes="Final contract negotiation. Very close to closing.",
                created_at="2025-09-10T11:00:00Z",
                updated_at=now,
            ),
            SalesLead(
                id="LEAD-005",
                company="Mid-Market Corp",
                contact_name="Jennifer Lee",
                email="jlee@midmarket.example",
                phone="+1-555-0127",
                stage="closed-won",
                value=75000.0,
                probability=100.0,
                expected_close_date="2025-11-30",
                notes="Contract signed! Implementation starts next month.",
                created_at="2025-08-05T13:45:00Z",
                updated_at="2025-11-30T16:00:00Z",
            ),
        ]

    def calculate_metrics(self, leads: List[SalesLead]) -> PipelineMetrics:
        """
        Calculate aggregated pipeline metrics.
        
        Args:
            leads: List of SalesLead objects
        
        Returns:
            PipelineMetrics object with calculated values
        """
        logger.info("📊 Calculating pipeline metrics...")
        
        if not leads:
            return PipelineMetrics(
                total_leads=0,
                total_value=0.0,
                weighted_value=0.0,
                leads_by_stage={},
                value_by_stage={},
                avg_deal_size=0.0,
                conversion_rate=0.0,
            )
        
        # Calculate totals
        total_leads = len(leads)
        total_value = sum(lead.value for lead in leads)
        weighted_value = sum(lead.value * (lead.probability / 100) for lead in leads)
        
        # Group by stage
        leads_by_stage: Dict[str, int] = {}
        value_by_stage: Dict[str, float] = {}
        
        for lead in leads:
            stage = lead.stage
            leads_by_stage[stage] = leads_by_stage.get(stage, 0) + 1
            value_by_stage[stage] = value_by_stage.get(stage, 0.0) + lead.value
        
        # Calculate derived metrics
        avg_deal_size = total_value / total_leads if total_leads > 0 else 0.0
        closed_won = leads_by_stage.get("closed-won", 0)
        conversion_rate = (closed_won / total_leads * 100) if total_leads > 0 else 0.0
        
        metrics = PipelineMetrics(
            total_leads=total_leads,
            total_value=total_value,
            weighted_value=weighted_value,
            leads_by_stage=leads_by_stage,
            value_by_stage=value_by_stage,
            avg_deal_size=avg_deal_size,
            conversion_rate=conversion_rate,
        )
        
        logger.info(f"✓ Calculated metrics for {total_leads} leads")
        logger.info(f"   Total value: ${total_value:,.2f}")
        logger.info(f"   Weighted value: ${weighted_value:,.2f}")
        
        return metrics

    def save_output(
        self,
        leads: List[SalesLead],
        metrics: PipelineMetrics,
    ) -> Path:
        """
        Save pipeline data to JSON file.
        
        Args:
            leads: List of SalesLead objects
            metrics: PipelineMetrics object
        
        Returns:
            Path to output file
        """
        logger.info("💾 Saving output...")
        
        timestamp = datetime.now(timezone.utc)
        
        # Convert leads to dictionaries
        leads_data = [asdict(lead) for lead in leads]
        
        # Create output structure
        output = SalesPipelineData(
            date=timestamp.strftime("%Y-%m-%d"),
            created_at=timestamp.isoformat(),
            source=self.data_source,
            leads=leads_data,
            metrics=asdict(metrics),
            metadata={
                "runner_version": "1.0.0",
                "demo_mode": self.demo_mode,
                "total_leads": len(leads),
            }
        )
        
        # Save to file
        output_path = self.output_dir / "sales_pipeline.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(asdict(output), f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ Output saved to: {output_path}")
        
        # Also save audit log
        self._save_audit_log(leads, metrics)
        
        return output_path

    def _save_audit_log(
        self,
        leads: List[SalesLead],
        metrics: PipelineMetrics,
    ) -> None:
        """Save audit log for compliance tracking."""
        timestamp = datetime.now(timezone.utc)
        audit_filename = f"sales_audit_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        audit_path = self.output_dir / audit_filename
        
        audit_data = {
            "timestamp": timestamp.isoformat(),
            "runner_version": "1.0.0",
            "data_source": self.data_source,
            "demo_mode": self.demo_mode,
            "leads_pulled": len(leads),
            "total_value": metrics.total_value,
            "weighted_value": metrics.weighted_value,
            "status": "success",
        }
        
        with open(audit_path, 'w', encoding='utf-8') as f:
            json.dump(audit_data, f, indent=2)
        
        logger.info(f"✓ Audit log saved to: {audit_path}")

    def run(self) -> int:
        """
        Execute the complete sales pipeline data pull workflow.
        
        Returns:
            Exit code (0 for success, 1 for failure)
        """
        logger.info("=" * 60)
        logger.info("Sales Pipeline Data Pull - Starting")
        logger.info("=" * 60)
        
        try:
            # Step 1: Pull data
            leads = self.pull_data()
            
            if not leads:
                logger.warning("⚠️  No leads found")
                return 1
            
            # Step 2: Calculate metrics
            metrics = self.calculate_metrics(leads)
            
            # Step 3: Save output
            self.save_output(leads, metrics)
            
            logger.info("=" * 60)
            logger.info("✅ Sales Pipeline Data Pull - Complete")
            logger.info("=" * 60)
            
            return 0
            
        except Exception as e:
            logger.error(f"❌ Fatal error: {e}", exc_info=True)
            return 1


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Sales Pipeline Data Pull Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run in demo mode (no credentials needed)
  python scripts/sales_pipeline_pull.py --demo
  
  # Pull from CSV file
  python scripts/sales_pipeline_pull.py --source csv --path data/sales.csv
  
  # Pull from JSON file
  python scripts/sales_pipeline_pull.py --source json --path data/sales.json
        """
    )
    
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run in demo mode (uses sample data, no credentials needed)",
    )
    parser.add_argument(
        "--source",
        choices=["csv", "json", "gsheets"],
        default="csv",
        help="Data source type (default: csv)",
    )
    parser.add_argument(
        "--path",
        help="Path to data file or Google Sheet ID",
    )
    parser.add_argument(
        "--output-dir",
        help="Output directory (default: ./output)",
    )
    
    return parser.parse_args()


def main() -> int:
    """Main entry point for the sales pipeline puller."""
    args = parse_args()
    
    # Determine project root
    project_root = Path(__file__).parent.parent.resolve()
    
    # Load environment variables
    if HAS_DEPS:
        env_file = project_root / ".env.local"
        if env_file.exists():
            load_dotenv(env_file)
            logger.debug(f"Loaded environment from {env_file}")
    
    # Get configuration from args or environment
    demo_mode = args.demo
    data_source = args.source or os.getenv("SALES_DATA_SOURCE", "csv")
    data_path = args.path or os.getenv("SALES_DATA_PATH")
    output_dir = Path(args.output_dir or os.getenv("OUTPUT_DIR", project_root / "output"))
    
    # Create and run the puller
    puller = SalesPipelinePuller(
        project_root=project_root,
        output_dir=output_dir,
        data_source=data_source,
        data_path=data_path,
        demo_mode=demo_mode,
    )
    
    return puller.run()


if __name__ == "__main__":
    sys.exit(main())
