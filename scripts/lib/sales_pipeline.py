#!/usr/bin/env python3
# pyright: strict
"""
Sales Pipeline Data Pull Module
=================================

Automated data collection for sales pipeline analytics.
Integrates with CRM systems and sales tracking tools.
"""

import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Constants
DEFAULT_CACHE_DIR = "output/sales_cache"
TIMESTAMP_FORMAT = "%Y%m%d_%H%M%S"


@dataclass
class SalesPipelineConfig:
    """Configuration for sales pipeline data source."""
    
    data_source: str  # 'demo', 'hubspot', 'salesforce', 'pipedrive', etc.
    api_key: Optional[str] = None
    api_endpoint: Optional[str] = None
    cache_dir: Optional[Path] = None
    demo_mode: bool = False
    
    @classmethod
    def from_env(cls, project_root: Path, demo_mode: bool = False) -> "SalesPipelineConfig":
        """
        Create config from environment variables.
        
        Args:
            project_root: Root directory of the project
            demo_mode: Whether to run in demo mode
        
        Returns:
            SalesPipelineConfig instance
        """
        data_source = os.getenv("SALES_PIPELINE_SOURCE", "demo")
        cache_dir = Path(os.getenv("SALES_PIPELINE_CACHE", str(project_root / DEFAULT_CACHE_DIR)))
        
        return cls(
            data_source=data_source if not demo_mode else "demo",
            api_key=os.getenv("SALES_PIPELINE_API_KEY"),
            api_endpoint=os.getenv("SALES_PIPELINE_ENDPOINT"),
            cache_dir=cache_dir,
            demo_mode=demo_mode,
        )


@dataclass
class SalesPipelineLead:
    """Individual sales lead/opportunity."""
    
    id: str
    name: str
    company: str
    stage: str
    value: float
    probability: float
    owner: str
    created_at: str
    updated_at: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "stage": self.stage,
            "value": self.value,
            "probability": self.probability,
            "owner": self.owner,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


@dataclass
class SalesPipelineData:
    """Aggregated sales pipeline data."""
    
    timestamp: str
    total_leads: int
    total_value: float
    weighted_value: float
    stage_breakdown: Dict[str, int]
    leads: List[SalesPipelineLead]
    source: str
    demo: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "timestamp": self.timestamp,
            "total_leads": self.total_leads,
            "total_value": self.total_value,
            "weighted_value": self.weighted_value,
            "stage_breakdown": self.stage_breakdown,
            "leads": [lead.to_dict() for lead in self.leads],
            "source": self.source,
            "demo": self.demo,
        }


class SalesPipelineDataSource:
    """
    Sales pipeline data source connector.
    
    Pulls data from various CRM systems or uses demo data.
    """
    
    def __init__(self, config: SalesPipelineConfig):
        """
        Initialize sales pipeline data source.
        
        Args:
            config: Configuration for the data source
        """
        self.config = config
        
        # Ensure cache directory exists
        if self.config.cache_dir:
            self.config.cache_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(
            f"Initialized SalesPipelineDataSource",
            extra={
                "source": self.config.data_source,
                "demo_mode": self.config.demo_mode,
            }
        )
    
    def pull_data(self) -> SalesPipelineData:
        """
        Pull sales pipeline data from configured source.
        
        Returns:
            SalesPipelineData with current pipeline state
        
        Raises:
            RuntimeError: If data source is unavailable or authentication fails
        """
        logger.info(f"📊 Pulling sales pipeline data from {self.config.data_source}...")
        
        if self.config.demo_mode or self.config.data_source == "demo":
            return self._demo_data()
        
        # Route to appropriate data source handler
        handlers = {
            "hubspot": self._pull_hubspot,
            "salesforce": self._pull_salesforce,
            "pipedrive": self._pull_pipedrive,
        }
        
        handler = handlers.get(self.config.data_source)
        if not handler:
            logger.warning(
                f"Unknown data source '{self.config.data_source}', using demo data"
            )
            return self._demo_data()
        
        try:
            return handler()
        except Exception as e:
            logger.error(f"Failed to pull data from {self.config.data_source}: {e}")
            logger.warning("Falling back to demo data")
            return self._demo_data()
    
    def _demo_data(self) -> SalesPipelineData:
        """Generate realistic demo sales pipeline data."""
        timestamp = datetime.now(timezone.utc).isoformat()
        
        demo_leads = [
            SalesPipelineLead(
                id="lead-001",
                name="Enterprise Integration Project",
                company="TechCorp Solutions",
                stage="Qualification",
                value=150000.0,
                probability=0.3,
                owner="Sales Rep A",
                created_at="2025-11-15T10:00:00Z",
                updated_at="2025-12-09T14:30:00Z",
            ),
            SalesPipelineLead(
                id="lead-002",
                name="Automation Platform Migration",
                company="FinTech Innovators",
                stage="Proposal",
                value=85000.0,
                probability=0.5,
                owner="Sales Rep B",
                created_at="2025-11-20T09:15:00Z",
                updated_at="2025-12-10T11:20:00Z",
            ),
            SalesPipelineLead(
                id="lead-003",
                name="API Integration Services",
                company="RetailHub Inc",
                stage="Negotiation",
                value=45000.0,
                probability=0.7,
                owner="Sales Rep A",
                created_at="2025-11-25T13:45:00Z",
                updated_at="2025-12-10T16:00:00Z",
            ),
            SalesPipelineLead(
                id="lead-004",
                name="Data Pipeline Optimization",
                company="Analytics Pro",
                stage="Qualification",
                value=62000.0,
                probability=0.25,
                owner="Sales Rep C",
                created_at="2025-12-01T08:30:00Z",
                updated_at="2025-12-08T10:45:00Z",
            ),
            SalesPipelineLead(
                id="lead-005",
                name="Cloud Infrastructure Setup",
                company="StartupXYZ",
                stage="Closed Won",
                value=120000.0,
                probability=1.0,
                owner="Sales Rep B",
                created_at="2025-10-15T11:00:00Z",
                updated_at="2025-12-05T14:00:00Z",
            ),
        ]
        
        # Calculate aggregates
        total_value = sum(lead.value for lead in demo_leads)
        weighted_value = sum(lead.value * lead.probability for lead in demo_leads)
        
        stage_breakdown: Dict[str, int] = {}
        for lead in demo_leads:
            stage_breakdown[lead.stage] = stage_breakdown.get(lead.stage, 0) + 1
        
        logger.info(
            f"✓ Generated demo sales pipeline data",
            extra={
                "total_leads": len(demo_leads),
                "total_value": total_value,
                "weighted_value": weighted_value,
            }
        )
        
        return SalesPipelineData(
            timestamp=timestamp,
            total_leads=len(demo_leads),
            total_value=total_value,
            weighted_value=weighted_value,
            stage_breakdown=stage_breakdown,
            leads=demo_leads,
            source="demo",
            demo=True,
        )
    
    def _pull_hubspot(self) -> SalesPipelineData:
        """Pull data from HubSpot CRM (placeholder for future implementation)."""
        if not self.config.api_key:
            raise RuntimeError("HubSpot API key not configured")
        
        logger.info("HubSpot integration not yet implemented, using demo data")
        return self._demo_data()
    
    def _pull_salesforce(self) -> SalesPipelineData:
        """Pull data from Salesforce CRM (placeholder for future implementation)."""
        if not self.config.api_key:
            raise RuntimeError("Salesforce API key not configured")
        
        logger.info("Salesforce integration not yet implemented, using demo data")
        return self._demo_data()
    
    def _pull_pipedrive(self) -> SalesPipelineData:
        """Pull data from Pipedrive CRM (placeholder for future implementation)."""
        if not self.config.api_key:
            raise RuntimeError("Pipedrive API key not configured")
        
        logger.info("Pipedrive integration not yet implemented, using demo data")
        return self._demo_data()
    
    def save_to_cache(self, data: SalesPipelineData) -> Path:
        """
        Save pipeline data to cache file.
        
        Args:
            data: Sales pipeline data to cache
        
        Returns:
            Path to cached file
        """
        if not self.config.cache_dir:
            raise RuntimeError("Cache directory not configured")
        
        timestamp_str = datetime.now(timezone.utc).strftime(TIMESTAMP_FORMAT)
        cache_file = self.config.cache_dir / f"sales_pipeline_{timestamp_str}.json"
        
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data.to_dict(), f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ Cached sales pipeline data to {cache_file}")
        return cache_file


def create_sales_pipeline_source(
    project_root: Path,
    demo_mode: bool = False
) -> SalesPipelineDataSource:
    """
    Create a sales pipeline data source with environment validation.
    
    Args:
        project_root: Root directory of the project
        demo_mode: Whether to run in demo mode
    
    Returns:
        Initialized SalesPipelineDataSource
    """
    config = SalesPipelineConfig.from_env(project_root, demo_mode)
    return SalesPipelineDataSource(config)
