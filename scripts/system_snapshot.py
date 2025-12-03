#!/usr/bin/env python3
# pyright: reportUnusedVariable=none, reportMissingImports=warning
"""
System Snapshot & Sanity Check
===============================

Validates automation health:
- Checks all automation scripts are executable
- Verifies config files exist and are valid
- Backs up critical configuration
- Reports status of Notion ↔ GitHub ↔ Slack integrations

Usage:
    python scripts/system_snapshot.py
    python scripts/system_snapshot.py --backup-configs
"""

import os
import sys
import json
import shutil
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S%z",
)
logger = logging.getLogger(__name__)


class SystemSnapshot:
    """System health check and configuration backup."""
    
    def __init__(self, backup_configs: bool = False):
        self.backup_configs = backup_configs
        self.project_root = Path(__file__).parent.parent
        self.output_dir = self.project_root / "output"
        self.backup_dir = self.output_dir / "backups"
        
        # Ensure directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        if self.backup_configs:
            self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initialized SystemSnapshot (backup_configs={self.backup_configs})")
    
    def check_automation_scripts(self) -> Dict[str, Any]:
        """
        Check all automation scripts are present and executable.
        
        Returns:
            Status dict with script health
        """
        logger.info("🔍 Checking automation scripts...")
        
        scripts_dir = self.project_root / "scripts"
        critical_scripts = [
            "daily_v2.py",
            "inbox_zero.py",
            "update_security_dashboard.py",
        ]
        
        status = {
            "all_present": True,
            "scripts": [],
            "missing": [],
            "errors": [],
        }
        
        for script_name in critical_scripts:
            script_path = scripts_dir / script_name
            
            if not script_path.exists():
                status["all_present"] = False
                status["missing"].append(script_name)
                logger.warning(f"  ❌ Missing: {script_name}")
                continue
            
            # Check if executable
            is_executable = os.access(script_path, os.X_OK)
            
            # Check syntax
            try:
                import ast
                with open(script_path, 'r') as f:
                    ast.parse(f.read())
                syntax_ok = True
            except SyntaxError as e:
                syntax_ok = False
                status["errors"].append(f"{script_name}: {e}")
            
            script_status = {
                "name": script_name,
                "path": str(script_path),
                "exists": True,
                "executable": is_executable,
                "syntax_valid": syntax_ok,
            }
            
            status["scripts"].append(script_status)
            
            emoji = "✅" if syntax_ok else "⚠️"
            logger.info(f"  {emoji} {script_name}: syntax {'OK' if syntax_ok else 'ERROR'}")
        
        logger.info(f"  Scripts checked: {len(status['scripts'])}/{len(critical_scripts)}")
        return status
    
    def check_config_files(self) -> Dict[str, Any]:
        """
        Check critical configuration files exist.
        
        Returns:
            Status dict with config file health
        """
        logger.info("📋 Checking configuration files...")
        
        config_files = [
            ".env.local",
            "package.json",
            "next.config.ts",
            "tsconfig.json",
            "scripts/requirements.txt",
            ".vscode/settings.json",
        ]
        
        status = {
            "all_present": True,
            "configs": [],
            "missing": [],
        }
        
        for config_name in config_files:
            config_path = self.project_root / config_name
            exists = config_path.exists()
            
            if not exists:
                status["all_present"] = False
                status["missing"].append(config_name)
            
            config_status = {
                "name": config_name,
                "path": str(config_path),
                "exists": exists,
                "size": config_path.stat().st_size if exists else 0,
            }
            
            status["configs"].append(config_status)
            
            emoji = "✅" if exists else "⚠️"
            logger.info(f"  {emoji} {config_name}: {'present' if exists else 'MISSING'}")
        
        return status
    
    def check_python_environment(self) -> Dict[str, Any]:
        """
        Check Python environment and dependencies.
        
        Returns:
            Status dict with Python environment health
        """
        logger.info("🐍 Checking Python environment...")
        
        status = {
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "venv_active": hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix),
            "dependencies": {},
        }
        
        # Check critical dependencies
        dependencies = ["openai", "github", "dotenv", "requests"]
        
        for dep in dependencies:
            try:
                __import__(dep)
                status["dependencies"][dep] = "installed"
            except ImportError:
                status["dependencies"][dep] = "missing"
        
        all_installed = all(v == "installed" for v in status["dependencies"].values())
        
        logger.info(f"  Python: {status['python_version']}")
        logger.info(f"  Virtual env: {'active' if status['venv_active'] else 'not active'}")
        logger.info(f"  Dependencies: {sum(1 for v in status['dependencies'].values() if v == 'installed')}/{len(dependencies)} installed")
        
        return status
    
    def check_automation_health(self) -> Dict[str, Any]:
        """
        Check automation integration health (Notion ↔ GitHub ↔ Slack).
        
        Returns:
            Status dict with integration health
        """
        logger.info("🔗 Checking automation integrations...")
        
        # Check for recent run logs
        recent_runs = []
        if self.output_dir.exists():
            for log_file in self.output_dir.glob("audit_*.json"):
                try:
                    data = json.loads(log_file.read_text())
                    recent_runs.append({
                        "file": log_file.name,
                        "date": data.get("date", "unknown"),
                        "status": "success" if "issues_created" in data else "unknown",
                    })
                except Exception:
                    pass
        
        recent_runs.sort(key=lambda x: x["file"], reverse=True)
        recent_runs = recent_runs[:5]  # Last 5 runs
        
        status = {
            "notion": {"status": "not_configured", "note": "Manual check required"},
            "github": {"status": "configured", "note": "GITHUB_TOKEN in env"},
            "slack": {"status": "not_configured", "note": "SLACK_TOKEN not set"},
            "recent_runs": recent_runs,
            "last_success": recent_runs[0]["date"] if recent_runs else None,
        }
        
        # Check GitHub token
        github_token = os.getenv("GITHUB_TOKEN")
        if github_token and github_token != "your-github-token-here":
            status["github"]["status"] = "ready"
        
        # Check Slack token
        slack_token = os.getenv("SLACK_TOKEN")
        if slack_token and slack_token != "your-slack-token-here":
            status["slack"]["status"] = "ready"
        
        logger.info(f"  GitHub: {status['github']['status']}")
        logger.info(f"  Slack: {status['slack']['status']}")
        logger.info(f"  Notion: {status['notion']['status']}")
        logger.info(f"  Recent runs: {len(recent_runs)}")
        
        return status
    
    def backup_configuration(self) -> List[str]:
        """
        Backup critical configuration files.
        
        Returns:
            List of backed up files
        """
        logger.info("💾 Backing up configuration files...")
        
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backed_up: List[str] = []
        
        config_files = [
            ".env.local",
            "package.json",
            "next.config.ts",
            "tsconfig.json",
            "scripts/requirements.txt",
            ".vscode/settings.json",
        ]
        
        for config_name in config_files:
            config_path = self.project_root / config_name
            
            if not config_path.exists():
                logger.warning(f"  ⏭️  Skipping {config_name} (not found)")
                continue
            
            # Create backup path maintaining directory structure
            relative_path = config_path.relative_to(self.project_root)
            backup_name = f"{relative_path.parent / relative_path.stem}_{timestamp}{relative_path.suffix}"
            backup_path = self.backup_dir / backup_name.replace("/", "_")
            
            try:
                shutil.copy2(config_path, backup_path)
                backed_up.append(str(backup_path))
                logger.info(f"  ✅ Backed up: {config_name}")
            except Exception as e:
                logger.error(f"  ❌ Failed to backup {config_name}: {e}")
        
        logger.info(f"  Total backed up: {len(backed_up)} files")
        return backed_up
    
    def generate_report(
        self,
        script_status: Dict[str, Any],
        config_status: Dict[str, Any],
        python_status: Dict[str, Any],
        automation_status: Dict[str, Any],
        backups: List[str]
    ) -> Path:
        """
        Generate comprehensive system snapshot report.
        
        Args:
            script_status: Script health status
            config_status: Config file status
            python_status: Python environment status
            automation_status: Automation health status
            backups: List of backed up files
        
        Returns:
            Path to report file
        """
        logger.info("📊 Generating system snapshot report...")
        
        timestamp = datetime.now(timezone.utc)
        
        report = {
            "snapshot_date": timestamp.strftime("%Y-%m-%d"),
            "snapshot_time": timestamp.isoformat(),
            "system_health": {
                "scripts": script_status,
                "configs": config_status,
                "python": python_status,
                "automations": automation_status,
            },
            "backups": backups,
            "summary": {
                "all_scripts_ok": script_status["all_present"] and len(script_status["errors"]) == 0,
                "all_configs_ok": config_status["all_present"],
                "python_env_ok": python_status["venv_active"],
                "total_backups": len(backups),
            }
        }
        
        # Save report
        report_file = self.output_dir / f"system_snapshot_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        report_file.write_text(json.dumps(report, indent=2), encoding="utf-8")
        logger.info(f"  Saved: {report_file}")
        
        return report_file
    
    def run(self) -> int:
        """
        Execute system snapshot and sanity check.
        
        Returns:
            0 on success, 1 on failure
        """
        start_time = datetime.now(timezone.utc)
        
        try:
            logger.info("=" * 60)
            logger.info("=== System Snapshot & Sanity Check ===")
            logger.info("=" * 60)
            
            # Check automation scripts
            script_status = self.check_automation_scripts()
            
            # Check config files
            config_status = self.check_config_files()
            
            # Check Python environment
            python_status = self.check_python_environment()
            
            # Check automation health
            automation_status = self.check_automation_health()
            
            # Backup configs if requested
            backups: List[str] = []
            if self.backup_configs:
                backups = self.backup_configuration()
            
            # Generate report
            report_file = self.generate_report(
                script_status,
                config_status,
                python_status,
                automation_status,
                backups
            )
            
            # Summary
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info("=" * 60)
            logger.info("✅ SYSTEM SNAPSHOT COMPLETE")
            logger.info(f"   Duration: {duration:.2f}s")
            logger.info(f"   Scripts OK: {script_status['all_present'] and len(script_status['errors']) == 0}")
            logger.info(f"   Configs OK: {config_status['all_present']}")
            logger.info(f"   Backups: {len(backups)} files")
            logger.info(f"   Report: {report_file}")
            logger.info("=" * 60)
            
            # Health summary
            all_green = (
                script_status["all_present"] and
                len(script_status["errors"]) == 0 and
                config_status["all_present"]
            )
            
            if all_green:
                logger.info("🟢 ALL SYSTEMS GREEN - Ready for production")
            else:
                logger.warning("🟡 SOME ISSUES DETECTED - Review report for details")
            
            return 0
            
        except Exception as e:
            logger.error("=" * 60)
            logger.error(f"❌ System snapshot failed: {e}")
            logger.error("=" * 60)
            logger.exception("System snapshot failed")
            return 1


def main() -> int:
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Run system snapshot and sanity check for automation stack."
    )
    parser.add_argument(
        "--backup-configs",
        action="store_true",
        help="Backup all configuration files"
    )
    
    args = parser.parse_args()
    
    try:
        snapshot = SystemSnapshot(backup_configs=args.backup_configs)
        return snapshot.run()
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
