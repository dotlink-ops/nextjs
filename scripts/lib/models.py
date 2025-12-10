#!/usr/bin/env python3
# pyright: strict
"""
Core Data Models and Schemas
==============================

Type-safe data models for automation scripts.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any


@dataclass
class DailySummary:
    """Structured daily summary output."""
    
    date: str
    created_at: str
    repo: str
    summary_bullets: List[str]
    action_items: List[str]
    assessment: str
    issues_created: int
    issues: List[Dict[str, Any]]
    raw_text: str
    metadata: Dict[str, Any]
    
    @classmethod
    def create(
        cls,
        notes: List[str],
        summary: Dict[str, Any],
        issues: List[Dict[str, Any]],
        repo: str = "dotlink-ops/nextjs",
        demo_mode: bool = False
    ) -> "DailySummary":
        """
        Create a DailySummary from processed data.
        
        Args:
            notes: List of ingested notes
            summary: Summary dict with highlights, action_items, assessment
            issues: List of created issue dicts
            repo: Repository name
            demo_mode: Whether running in demo mode
        
        Returns:
            DailySummary instance
        """
        from datetime import timezone
        timestamp = datetime.now(timezone.utc)
        
        return cls(
            date=timestamp.strftime("%Y-%m-%d"),
            created_at=timestamp.isoformat(),
            repo=repo,
            summary_bullets=summary.get("highlights", []),
            action_items=summary.get("action_items", []),
            assessment=summary.get("assessment", ""),
            issues_created=len(issues),
            issues=issues,
            raw_text=(
                f"Summary:\n{summary.get('assessment', '')}\n\n"
                f"Actions:\n" + "\n".join(f"- {item}" for item in summary.get("action_items", []))
            ),
            metadata={
                "runner_version": "2.0.0",
                "demo_mode": demo_mode,
                "notes_count": len(notes),
            }
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "date": self.date,
            "created_at": self.created_at,
            "repo": self.repo,
            "summary_bullets": self.summary_bullets,
            "action_items": self.action_items,
            "assessment": self.assessment,
            "issues_created": self.issues_created,
            "issues": self.issues,
            "raw_text": self.raw_text,
            "metadata": self.metadata,
        }


@dataclass
class IssueData:
    """GitHub issue details."""
    
    number: int
    title: str
    url: str
    labels: List[str]
    demo: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result: Dict[str, Any] = {
            "number": self.number,
            "title": self.title,
            "url": self.url,
            "labels": self.labels,
        }
        if self.demo:
            result["demo"] = True
        return result


@dataclass
class AutomationConfig:
    """Configuration for automation runner."""
    
    project_root: str
    output_dir: str
    notes_source: str
    demo_mode: bool = False
    openai_model: str = "gpt-4-turbo-preview"
    max_tokens: int = 500
    temperature: float = 0.7
    
    @classmethod
    def from_env(cls, project_root: str, demo_mode: bool = False) -> "AutomationConfig":
        """
        Create config from environment variables.
        
        Args:
            project_root: Root directory of the project
            demo_mode: Whether to run in demo mode
        
        Returns:
            AutomationConfig instance
        """
        import os
        from pathlib import Path
        
        root = Path(project_root)
        
        return cls(
            project_root=project_root,
            output_dir=os.getenv("OUTPUT_DIR", str(root / "output")),
            notes_source=os.getenv("NOTES_SOURCE", str(root / "output" / "notes")),
            demo_mode=demo_mode,
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
            max_tokens=int(os.getenv("MAX_TOKENS", "500")),
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
        )


@dataclass
class AuditLog:
    """Audit log entry for compliance tracking."""
    
    timestamp: str
    runner_version: str
    runtime_env: str
    notes_ingested: int
    issues_created: int
    duration_seconds: float
    status: str
    errors: List[str] = field(default_factory=lambda: [])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "timestamp": self.timestamp,
            "runner_version": self.runner_version,
            "runtime_env": self.runtime_env,
            "notes_ingested": self.notes_ingested,
            "issues_created": self.issues_created,
            "duration_seconds": self.duration_seconds,
            "status": self.status,
            "errors": self.errors,
        }
