#!/usr/bin/env python3
# pyright: strict
# pyright: reportUnusedVariable=none, reportMissingImports=warning
"""
Environment and Sanity Checks Module
=====================================

Validates environment variables, dependencies, and runtime requirements
for the automation scripts.
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple


def check_dependencies() -> Tuple[bool, List[str]]:
    """
    Check if required third-party dependencies are installed.
    
    Returns:
        Tuple of (has_all_deps, missing_packages)
    """
    missing: List[str] = []
    
    try:
        import dotenv as _dotenv  # noqa: F401
        _ = _dotenv
    except ImportError:
        missing.append("python-dotenv")
    
    try:
        import openai as _openai  # noqa: F401
        _ = _openai
    except ImportError:
        missing.append("openai")
    
    try:
        import github as _github  # noqa: F401
        _ = _github
    except ImportError:
        missing.append("PyGithub")
    
    return (len(missing) == 0, missing)


def validate_environment(project_root: Path, require_api_keys: bool = True) -> Tuple[bool, List[str]]:
    """
    Validate required environment variables are set.
    
    Args:
        project_root: Root directory of the project
        require_api_keys: Whether to require API keys (False for demo mode)
    
    Returns:
        Tuple of (is_valid, missing_vars)
    """
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv(project_root / ".env.local")
    except ImportError:
        pass  # dotenv not available
    
    missing: List[str] = []
    
    if require_api_keys:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key or openai_api_key == "your-openai-api-key-here":
            missing.append("OPENAI_API_KEY")
        
        github_token = os.getenv("GITHUB_TOKEN")
        if not github_token or github_token == "your-github-token-here":
            missing.append("GITHUB_TOKEN")
        
        repo_name = os.getenv("REPO_NAME")
        if not repo_name or repo_name == "owner/repo":
            missing.append("REPO_NAME")
    
    return (len(missing) == 0, missing)


def check_python_version(min_version: Tuple[int, int] = (3, 9)) -> bool:
    """
    Check if Python version meets minimum requirements.
    
    Args:
        min_version: Minimum required version as (major, minor)
    
    Returns:
        True if version is sufficient
    """
    return sys.version_info >= min_version


def validate_paths(project_root: Path, *paths: Path) -> Tuple[bool, List[str]]:
    """
    Validate that required paths exist and are accessible.
    
    Args:
        project_root: Root directory of the project
        *paths: Additional paths to validate
    
    Returns:
        Tuple of (all_valid, missing_paths)
    """
    missing: List[str] = []
    
    for path in paths:
        full_path = project_root / path if not path.is_absolute() else path
        if not full_path.exists():
            missing.append(str(path))
    
    return (len(missing) == 0, missing)


def run_sanity_checks(project_root: Path, require_api_keys: bool = True) -> bool:
    """
    Run all sanity checks and report results.
    
    Args:
        project_root: Root directory of the project
        require_api_keys: Whether to require API keys (False for demo mode)
    
    Returns:
        True if all checks pass
    """
    all_passed = True
    
    # Check Python version
    if not check_python_version():
        print("❌ Python version too old. Requires Python 3.9+")
        all_passed = False
    else:
        print(f"✅ Python version: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    
    # Check dependencies
    has_deps, missing_deps = check_dependencies()
    if not has_deps:
        print(f"❌ Missing dependencies: {', '.join(missing_deps)}")
        print("   Install with: pip install -r scripts/requirements.txt")
        all_passed = False
    else:
        print("✅ All dependencies installed")
    
    # Check environment variables
    env_valid, missing_vars = validate_environment(project_root, require_api_keys)
    if not env_valid:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        if require_api_keys:
            print("   Set them in .env.local or run with --demo flag")
        all_passed = False
    else:
        print("✅ Environment variables configured")
    
    return all_passed
