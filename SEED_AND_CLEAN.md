# Seed & Clean: dotlink-ops Project Overview

**Last Updated**: 2025-12-02

This document provides a summary of all open issues and PRs in the dotlink-ops/nexus-core repository, along with the normalized label scheme for organizing work.

---

## 📋 Label Schema

### Area Labels

Labels prefixed with `area:` identify which part of the codebase is affected:

| Label | Description |
|-------|-------------|
| `area: nexus-core` | Core infrastructure and automation systems |
| `area: frontend` | Next.js app, UI components, client-side code |
| `area: python` | Python scripts, daily automation runner |
| `area: docs` | Documentation updates |
| `area: ci-cd` | GitHub Actions workflows, CI/CD pipelines |
| `area: security` | Security hardening, compliance, secrets management |

### Type Labels

Labels prefixed with `type:` identify the kind of work:

| Label | Description |
|-------|-------------|
| `type: feature` | New functionality or capability |
| `type: bug` | Fixes for broken or incorrect behavior |
| `type: chore` | Maintenance, refactoring, cleanup, dependencies |
| `type: docs` | Documentation-only changes |

### Priority Labels (Optional)

| Label | Description |
|-------|-------------|
| `priority: critical` | Blocks other work or production issues |
| `priority: high` | Important for upcoming milestone |
| `priority: medium` | Valuable improvement |
| `priority: low` | Nice-to-have enhancement |

---

## 📌 Open Issues

### Issue #57: Seed and Clean
- **Status**: Open
- **Created**: 2025-12-02
- **Description**: Seed & clean up the dotlink-ops Project. Pull in all open issues and PRs. Normalize labels.
- **Suggested Labels**: `area: nexus-core`, `type: chore`

### Issue #45: Daily Automation – 2025-11-30
- **Status**: Open
- **Created**: 2025-11-30
- **Description**: Daily automation summary for Nov 30. Covers daily runner setup, OpenAI/GitHub integration, and next priorities.
- **Suggested Labels**: `area: python`, `type: chore`

### Issue #44: Security Hardening Checklist (nexus-core)
- **Status**: Open
- **Created**: 2025-11-29
- **Description**: Comprehensive security hardening checklist including secrets management, branch protection, secret scanning, and GitHub Actions restrictions.
- **Suggested Labels**: `area: security`, `type: feature`

---

## 🔀 Open Pull Requests

### PR #58: [WIP] Seed and clean up the dotlink-ops project
- **Status**: Draft
- **Created**: 2025-12-02
- **Description**: Work in progress PR for seeding and cleaning up the project
- **Suggested Labels**: `area: nexus-core`, `type: chore`

### PR #56: Normalize site URLs and cache SEO routes
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Sanitize site URL handling, cache sitemap and robots responses
- **Suggested Labels**: `area: frontend`, `type: feature`

### PR #55: Add shared API response typings
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add shared API response and package types, update client components
- **Suggested Labels**: `area: frontend`, `type: feature`

### PR #54: Refactor daily summary API handler
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Refactor into clearer helper routines with explicit error handling
- **Suggested Labels**: `area: frontend`, `type: chore`

### PR #53: Fix lint issues and update copy
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Replace navigation anchors with Next.js Link, update services page copy
- **Suggested Labels**: `area: frontend`, `type: bug`

### PR #52: Add setup guide for Next.js and Python automation
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add SETUP.md guide with step-by-step instructions
- **Suggested Labels**: `area: docs`, `type: docs`

### PR #51: Add lint and test GitHub Actions workflow
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add CI workflow for linting and tests
- **Suggested Labels**: `area: ci-cd`, `type: feature`

### PR #50: Refactor daily automation workflow structure
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Restructure into clearer helper methods, add dedicated logging helpers
- **Suggested Labels**: `area: python`, `type: chore`

### PR #49: Add structured logging and env validation to daily runner
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add structured logging with run identifiers, centralize environment loading
- **Suggested Labels**: `area: python`, `type: feature`

### PR #48: Add plain-language docstrings to daily automation
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add recruiter-friendly docstrings for DailyAutomation methods
- **Suggested Labels**: `area: python`, `type: docs`

### PR #47: Improve error handling for external services
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add explicit OpenAI exception handling, strengthen GitHub paths
- **Suggested Labels**: `area: python`, `type: feature`

### PR #46: Add automation system case study for clients
- **Status**: Open
- **Created**: 2025-11-30
- **Current Labels**: `codex`
- **Description**: Add one-page markdown case study for hiring managers or clients
- **Suggested Labels**: `area: docs`, `type: docs`

---

## 📊 Summary

### Issues by Area
| Area | Count |
|------|-------|
| nexus-core | 1 |
| python | 1 |
| security | 1 |

### PRs by Area
| Area | Count |
|------|-------|
| frontend | 4 |
| python | 4 |
| docs | 2 |
| ci-cd | 1 |
| nexus-core | 1 |

### Work Type Distribution
| Type | Count |
|------|-------|
| feature | 5 |
| chore | 4 |
| docs | 3 |
| bug | 1 |

---

## 🔧 Label Migration Guide

To apply the normalized label scheme:

### 1. Create Labels in GitHub

Navigate to **Settings → Labels** and create the following labels:

**Area Labels:**
- `area: nexus-core` - Color: `#1f77b4` (blue)
- `area: frontend` - Color: `#ff7f0e` (orange)
- `area: python` - Color: `#2ca02c` (green)
- `area: docs` - Color: `#d62728` (red)
- `area: ci-cd` - Color: `#9467bd` (purple)
- `area: security` - Color: `#8c564b` (brown)

**Type Labels:**
- `type: feature` - Color: `#0e8a16` (green)
- `type: bug` - Color: `#d73a4a` (red)
- `type: chore` - Color: `#fbca04` (yellow)
- `type: docs` - Color: `#0075ca` (blue)

### 2. Update Existing Issues/PRs

Apply the suggested labels from the sections above to each issue and PR.

### 3. Consider Retiring Legacy Labels

The `codex` label can be retired or kept as an additional tag indicating Codex-generated PRs.

---

## 📝 Related Documentation

- [AUTOMATION_BACKLOG.md](AUTOMATION_BACKLOG.md) - Automation improvement tracking
- [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md) - Full automation stack guide
- [SECURITY_COMPLIANCE.md](SECURITY_COMPLIANCE.md) - Security compliance tracking
- [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) - Contribution guidelines
