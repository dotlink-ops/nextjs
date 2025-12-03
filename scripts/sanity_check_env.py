#!/usr/bin/env python3
# pyright: strict
# pyright: reportUnusedVariable=none, reportMissingImports=warning
"""
Environment Sanity Check
=========================

Quick validation of environment setup for automation scripts.
Checks Python version, dependencies, and environment variables.

Usage:
    python3 scripts/sanity_check_env.py
    python3 scripts/sanity_check_env.py --verbose
"""

import sys
import os
from pathlib import Path
from typing import List, Tuple, Optional

# Add lib directory to path
sys.path.insert(0, str(Path(__file__).parent / "lib"))

try:
    from env_checks import (
        check_dependencies,
        validate_environment,
        check_python_version,
        run_sanity_checks,
    )
    HAS_LIB = True
except ImportError:
    HAS_LIB = False


def print_header(text: str) -> None:
    """Print formatted header."""
    print(f"\n{'=' * 60}")
    print(f"  {text}")
    print(f"{'=' * 60}\n")


def quick_check() -> int:
    """
    Run quick environment checks without importing lib.
    
    Returns:
        0 if all checks pass, 1 otherwise
    """
    all_passed = True
    
    print_header("Environment Sanity Check")
    
    # Python version
    print("🐍 Python Version:")
    if sys.version_info >= (3, 9):
        print(f"   ✅ {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    else:
        print(f"   ❌ {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro} (requires 3.9+)")
        all_passed = False
    
    # Virtual environment
    print("\n🔧 Virtual Environment:")
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    if in_venv:
        print(f"   ✅ Active ({sys.prefix})")
    else:
        print("   ⚠️  Not active (recommended to use venv)")
    
    # Dependencies
    print("\n📦 Dependencies:")
    deps = ["openai", "github", "dotenv", "requests"]
    missing: List[str] = []
    
    for dep in deps:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ❌ {dep} - MISSING")
            missing.append(dep)
            all_passed = False
    
    if missing:
        print(f"\n   Install missing packages:")
        print(f"   pip install {' '.join(missing)}")
        print(f"   or: pip install -r scripts/requirements.txt")
    
    # Environment variables
    print("\n🔑 Environment Variables:")
    project_root = Path(__file__).parent.parent
    env_file = project_root / ".env.local"
    
    if env_file.exists():
        print(f"   ✅ .env.local found")
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
        except ImportError:
            pass
    else:
        print(f"   ⚠️  .env.local not found (optional for demo mode)")
    
    env_vars = ["OPENAI_API_KEY", "GITHUB_TOKEN", "REPO_NAME"]
    for var in env_vars:
        value = os.getenv(var)
        if value and value not in ["your-openai-api-key-here", "your-github-token-here", "owner/repo"]:
            print(f"   ✅ {var} - configured")
        else:
            print(f"   ⚠️  {var} - not set (use --demo mode)")
    
    # Summary
    print_header("Summary")
    if all_passed:
        print("🟢 All critical checks passed - ready for automation")
        print("\nRun scripts:")
        print("   python3 scripts/daily_v2.py --demo")
        print("   python3 scripts/inbox_zero.py --demo")
        print("   python3 scripts/system_snapshot.py")
        return 0
    else:
        print("🟡 Some checks failed - see details above")
        print("\nYou can still run in demo mode:")
        print("   python3 scripts/daily_v2.py --demo")
        return 1


def full_check(verbose: bool = False) -> int:
    """
    Run full sanity checks using lib module.
    
    Args:
        verbose: Enable verbose output
    
    Returns:
        0 if all checks pass, 1 otherwise
    """
    if not HAS_LIB:
        print("⚠️  lib module not found, running quick check only")
        return quick_check()
    
    print_header("Full Environment Sanity Check")
    
    project_root = Path(__file__).parent.parent
    
    # Run comprehensive checks
    result = run_sanity_checks(project_root, require_api_keys=False)
    
    if result:
        print_header("Summary")
        print("🟢 All checks passed - environment ready")
        print("\nNext steps:")
        print("   1. Configure .env.local with API keys")
        print("   2. Run: python3 scripts/daily_v2.py")
        print("   3. Run: python3 scripts/inbox_zero.py")
        return 0
    else:
        print_header("Summary")
        print("🟡 Some checks failed")
        print("\nYou can still run scripts in demo mode with --demo flag")
        return 1


def main() -> int:
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Run environment sanity checks for automation scripts."
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Run quick checks only (no lib imports)"
    )
    
    args = parser.parse_args()
    
    if args.quick or not HAS_LIB:
        return quick_check()
    else:
        return full_check(verbose=args.verbose)


if __name__ == "__main__":
    raise SystemExit(main())
