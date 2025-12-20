#!/usr/bin/env python3
# pyright: strict
"""
API Client Abstractions
========================

Wrapper classes for OpenAI and GitHub API clients with error handling
and retry logic.
"""

import os
import logging
from typing import Optional, List, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class OpenAIClient:
    """
    Wrapper for OpenAI API client with error handling.
    """
    
    def __init__(self, api_key: str) -> None:
        """
        Initialize OpenAI client.
        
        Args:
            api_key: OpenAI API key
        """
        try:
            from openai import OpenAI
            self._client = OpenAI(api_key=api_key)
        except ImportError:
            raise RuntimeError("OpenAI package not installed. Run: pip install openai")
    
    def generate_summary(
        self, 
        notes: List[str], 
        model: str = "gpt-4-turbo-preview",
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate a structured summary from notes using OpenAI.
        
        Args:
            notes: List of note strings to summarize
            model: OpenAI model to use
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature (0-2)
        
        Returns:
            Dictionary with keys: highlights, action_items, assessment
        """
        if not notes:
            return {
                "highlights": [],
                "action_items": [],
                "assessment": "No notes to process"
            }
        
        # Prepare prompt
        notes_text = "\n".join(f"{i+1}. {note}" for i, note in enumerate(notes))
        prompt = f"""Analyze these daily notes and provide a structured summary:

{notes_text}

Extract:
1. Key highlights (2-4 bullet points)
2. Action items with priorities
3. Brief overall assessment

Format as JSON with keys: highlights, action_items, assessment"""
        
        try:
            response = self._client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes daily work notes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=30.0,
            )
            
            content = response.choices[0].message.content
            if content is None:
                raise ValueError("OpenAI returned empty response")
            
            # Parse JSON response
            import json
            try:
                summary_data = json.loads(content)
            except json.JSONDecodeError:
                # Fallback if response isn't valid JSON
                summary_data = {
                    "highlights": [content[:200]],
                    "action_items": ["Review generated summary"],
                    "assessment": "AI generated summary (non-JSON response)"
                }
            
            logger.info(f"✓ Generated summary using {response.model}")
            return summary_data
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise


class GitHubClient:
    """
    Wrapper for GitHub API client with error handling.
    """
    
    def __init__(self, token: str, repo_name: str) -> None:
        """
        Initialize GitHub client.
        
        Args:
            token: GitHub personal access token
            repo_name: Repository in format "owner/repo"
        """
        try:
            from github import Github, GithubException
            self._client = Github(token)
            self._repo = self._client.get_repo(repo_name)
            self._exception_class = GithubException
            logger.info(f"✓ GitHub client initialized (repo: {repo_name})")
        except ImportError:
            raise RuntimeError("PyGithub package not installed. Run: pip install PyGithub")
    
    def create_issue(
        self,
        title: str,
        body: str,
        labels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create a GitHub issue.
        
        Args:
            title: Issue title
            body: Issue body/description
            labels: Optional list of label names
        
        Returns:
            Dictionary with issue details (number, title, url, labels)
        """
        try:
            issue = self._repo.create_issue(
                title=title[:100].strip(),
                body=body,
                labels=labels or []
            )
            
            return {
                "number": issue.number,
                "title": issue.title,
                "url": issue.html_url,
                "labels": [label.name for label in issue.labels]
            }
        except self._exception_class as e:
            logger.error(f"GitHub API error: {e}")
            raise
    
    def create_issues_from_action_items(
        self,
        action_items: List[str],
        labels: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Create multiple GitHub issues from action items.
        
        Args:
            action_items: List of action item strings
            labels: Optional labels to apply to all issues
        
        Returns:
            List of created issue details
        """
        from datetime import datetime, timezone
        
        created_issues: List[Dict[str, Any]] = []
        default_labels = labels or ["automation", "daily-runner"]
        
        for item in action_items:
            if not item or not item.strip():
                continue
            
            try:
                body = (
                    f"Auto-generated from daily automation runner\n\n"
                    f"**Action Item:**\n{item}\n\n"
                    f"---\n*Created: {datetime.now(timezone.utc).isoformat()}*"
                )
                
                issue_data = self.create_issue(
                    title=item,
                    body=body,
                    labels=default_labels
                )
                
                created_issues.append(issue_data)
                logger.info(f"  Created issue #{issue_data['number']}: {issue_data['title']}")
                
            except Exception as e:
                logger.error(f"Failed to create issue for '{item}': {e}")
                continue
        
        return created_issues


def create_openai_client(project_root: Path) -> OpenAIClient:
    """
    Create an OpenAI client with environment validation.
    
    Args:
        project_root: Root directory of the project
    
    Returns:
        Initialized OpenAI client
    
    Raises:
        RuntimeError: If API key is missing or invalid
    """
    try:
        from dotenv import load_dotenv
        load_dotenv(project_root / ".env.local")
    except ImportError:
        pass
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your-openai-api-key-here":
        raise RuntimeError(
            "OPENAI_API_KEY not set. Configure it in .env.local or environment variables."
        )
    
    return OpenAIClient(api_key)


def create_github_client(project_root: Path) -> GitHubClient:
    """
    Create a GitHub client with environment validation.
    
    Args:
        project_root: Root directory of the project
    
    Returns:
        Initialized GitHub client
    
    Raises:
        RuntimeError: If token or repo name is missing or invalid
    """
    try:
        from dotenv import load_dotenv
        load_dotenv(project_root / ".env.local")
    except ImportError:
        pass
    
    token = os.getenv("GITHUB_TOKEN")
    if not token or token == "your-github-token-here":
        raise RuntimeError(
            "GITHUB_TOKEN not set. Configure it in .env.local or environment variables."
        )
    
    repo_name = os.getenv("REPO_NAME")
    if not repo_name or repo_name == "owner/repo":
        raise RuntimeError(
            "REPO_NAME not set. Configure it in .env.local or environment variables."
        )
    
    return GitHubClient(token, repo_name)
