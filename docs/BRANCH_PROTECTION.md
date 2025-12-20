# Branch Protection Configuration

This document describes the branch protection ruleset configuration for the Avidelta repository.

---

## Ruleset: dot-rail – guarded workflow branch

**Name:** `dot-rail – guarded workflow branch`

**Description:**
> Protect the dot-rail workflow branch for automation/infra changes. Enforce PRs, CI checks, and secret health; limit bypass to defined values only.

**Status:** ✅ Active  
**Last Updated:** 2025-12-04

---

## Target Configuration

### Repository Scope

- **Type:** Repository-level ruleset
- **Applies to:** `dotlink-ops/Avidelta` only
- **Enforcement:** All matching branches in this repository

### Branch Targeting

**Target type:** Include

**Branch patterns:**
1. `dot-rail` (literal branch name)
2. `dot-rail/*` (experimental sub-branches)

**Pattern matching:** Literal (not fnmatch patterns)

---

## Bypass Configuration

### Who Can Bypass Rules

**Allowed roles:**
- ✅ Repository administrators

**Specific users:**
- ✅ \<defined value set\> (configured in GitHub UI)

**GitHub Apps:**
- ✅ Allowed to bypass (per defined params)

**Important:** Bypass is limited to explicitly defined administrators and users only. Regular contributors cannot bypass protections.

---

## Branch Protection Rules

### 1. Pull Request Requirements

✅ **Require pull request to merge**
- All changes must go through pull requests
- No direct pushes to `dot-rail` or `dot-rail/*`

✅ **Required approvals:** 1 approval required

✅ **Dismiss stale reviews:** Stale approvals automatically dismissed on new commits

✅ **Require review from Code Owners:** CODEOWNERS enforcement enabled
- `scripts/` directory requires code owner review
- `.github/workflows/` directory requires code owner review

### 2. Force Push & Deletion Protection

✅ **Block force pushes**
- Force pushes to `dot-rail` are blocked
- Prevents history rewriting

✅ **Block branch deletions**
- Prevents accidental deletion of `dot-rail` branch
- Protects workflow branch from removal

### 3. Linear History (Optional)

⚠️ **Require linear history:** Not enabled (allows merge commits)
- Current workflow uses merge commits
- Can be enabled later for rebase-only workflow if desired

### 4. Push Restrictions

✅ **Restrict who can push to matching branches**
- Only PR merges allowed (enforced by "Require pull request" setting)
- Direct pushes blocked for all human users
- GitHub Actions bots allowed (for automated commits)

**Allowed direct push actors:**
- GitHub Actions workflow bots (for artifact commits, automated updates)
- **Nobody else** - all humans must go through PR workflow

**Implementation:**
- Primary enforcement via "Require pull request to merge" setting
- "Block force pushes" prevents history manipulation
- Bypass list limits exceptions to admins only

---

## Required Status Checks

All status checks must pass before merging to `dot-rail`.

### Critical Checks (Must Pass)

| Check Name | Source Workflow | Purpose |
|------------|----------------|---------|
| **secret-health** | `.github/workflows/secret-health.yml` | Validates all required secrets present |
| **tests/lint** | `.github/workflows/pre-commit.yml` or CI | Python + Next.js linting and type-checking |
| **daily-run CI** | `.github/workflows/daily-run.yml` | Core automation workflow validation |

### Workflow Details

#### 1. Secret Health (`secret-health.yml`)

**Check name:** `secret-health` or `Check Secrets (repository)`

**Trigger:**
- Daily at 12:07 UTC (4:07 AM PT)
- On push to `.github/workflows/**`
- Manual workflow_dispatch

**What it validates:**
- `OPENAI_API_KEY` presence
- `GITHUB_TOKEN` presence
- Matrix jobs for repository/staging/production environments

**Job name:** `check-secrets`

#### 2. Tests/Lint (`pre-commit.yml`)

**Check name:** `tests/lint` or `pre-commit`

**Trigger:**
- On push to `main` or `develop`
- On pull requests to `main` or `develop`

**What it validates:**
- Python code quality (flake8, mypy, black)
- Next.js linting (ESLint)
- TypeScript type checking
- YAML/JSON syntax
- Secret scanning (detect-secrets)
- Trailing whitespace, line endings

**Job name:** `pre-commit`

#### 3. Daily-run CI (`daily-run.yml`)

**Check name:** `daily-run CI` or `Daily Automation Runner`

**Trigger:**
- Daily at 5:00 AM PT (cron: "0 13 * * *")
- Manual workflow_dispatch with demo mode option

**What it validates:**
- Python automation engine (`daily_v2.py`)
- OpenAI API integration
- GitHub API integration
- JSON output generation
- Artifact uploads

**Job name:** Likely `run-automation` or `daily-automation`

---

## Status Check Configuration

### Strict Status Checks

✅ **Require branches to be up to date before merging**
- Ensures all checks run against latest `dot-rail` state
- Prevents outdated code from merging

### Check Behavior

- All 3 checks must pass (green) before merge
- If any check fails, merge is blocked
- Checks can be re-run via GitHub UI or pushing new commits

---

## CODEOWNERS Integration

### Protected Paths

The following paths require code owner approval:

```
# Automation scripts
scripts/                  @dotlink-ops/code-owners

# CI/CD workflows
.github/workflows/        @dotlink-ops/code-owners

# Security configurations
docs/SECURITY_*.md        @dotlink-ops/code-owners
.env.example              @dotlink-ops/code-owners
```

**Note:** CODEOWNERS file should exist at repository root or in `.github/` directory.

---

## Repository-Level Security Settings

These settings complement the dot-rail branch ruleset and apply repository-wide.

### Actions & Workflow Permissions

**Location:** Settings → Actions → General

✅ **Allow GitHub Actions to create and approve pull requests:** Disabled (recommended)

✅ **Workflow permissions:** Read repository contents and package permissions (default)

✅ **Allow GitHub Actions:**
- **GitHub-owned actions** ✅ Allowed
- **Verified creators** ✅ Allowed
- **All other actions** ❌ Blocked

**Why this matters:**
- Prevents malicious actions from unverified sources
- Ensures only trusted, audited actions can run
- Aligns with dot-rail security posture

**Verification:**
```
Navigate to: Settings → Actions → General → Actions permissions
Confirm: "Allow select actions and reusable workflows"
- Allow actions created by GitHub: ✅
- Allow actions by Marketplace verified creators: ✅
```

### Code Security & Analysis

**Location:** Settings → Code security and analysis

✅ **Dependency graph:** Enabled (default on public repos)

✅ **Dependabot alerts:** Enabled
- Notifies of vulnerable dependencies
- Supports Python (requirements.txt) and Node.js (package.json)

✅ **Dependabot security updates:** Enabled (recommended)
- Automatically creates PRs to update vulnerable dependencies

✅ **Secret scanning:** Enabled
- Scans repository for accidentally committed secrets
- Monitors all pushes and pull requests

✅ **Push protection:** Enabled
- Blocks pushes containing secrets
- Prevents credentials from entering repository history

**Verification:**
```
Navigate to: Settings → Code security and analysis
Confirm all items show: Status: Enabled
```

### Secret Scanning Configuration

**Supported secret types:**
- AWS access keys
- GitHub personal access tokens
- OpenAI API keys
- Slack webhooks
- Database connection strings
- Private SSH keys

**Alert behavior:**
- Email notifications to repository admins
- Security tab shows all detected secrets
- Push protection blocks commits containing secrets

### Actions Allowed List (Example)

If using "Allow select actions" mode, maintain an approved list:

```yaml
# Allowed actions (examples based on common usage)
actions/checkout@*
actions/setup-node@*
actions/setup-python@*
actions/cache@*
actions/upload-artifact@*
github/codeql-action@*
```

**Management:**
- Review new action requests before adding
- Verify action publisher is GitHub or verified creator
- Check action source code when possible

---

## Complete Security Stack

The dot-rail branch protection works in concert with repository-level settings:

| Layer | Protection | Enforcement Point |
|-------|-----------|-------------------|
| **Branch Ruleset** | Require PRs, status checks, approvals | dot-rail branch commits |
| **CODEOWNERS** | Required reviews for sensitive paths | PR approval process |
| **Actions Policy** | Restrict to trusted sources only | Workflow execution |
| **Secret Scanning** | Detect exposed credentials | Push and PR events |
| **Push Protection** | Block secret commits | Git push operation |
| **Dependabot** | Vulnerability monitoring | Dependency updates |
| **Status Checks** | Validate code quality & security | PR merge gate |

**Result:** Multi-layered "defense in depth" protecting the automation infrastructure.

---

## Verification Steps

### How to Verify Ruleset is Active

1. **Via GitHub UI:**
   ```
   Navigate to: Settings → Rules → Rulesets → dot-rail
   Status should show: ✅ Active
   ```

2. **Test Direct Push (Should Fail):**
   ```bash
   git checkout dot-rail
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: Direct push"
   git push origin dot-rail
   # Expected: ❌ remote: error: GH006: Protected branch update failed
   ```

3. **Test PR Workflow (Should Succeed):**
   ```bash
   git checkout -b test/branch-protection
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: PR workflow"
   git push origin test/branch-protection
   gh pr create --base dot-rail --title "Test: Branch protection"
   # Expected: ✅ PR created, status checks run, approval required
   ```

4. **Verify Status Checks:**
   ```bash
   # Check workflow runs
   gh run list --workflow=secret-health.yml --limit 1
   gh run list --workflow=pre-commit.yml --limit 1
   gh run list --workflow=daily-run.yml --limit 1
   # All should show recent successful runs
   ```

---

## Troubleshooting

### Common Issues

#### Issue: Status check not appearing on PR

**Cause:** Workflow hasn't run on the branch yet

**Solution:**
```bash
# Trigger workflows manually
gh workflow run secret-health.yml
gh workflow run pre-commit.yml
gh workflow run daily-run.yml
```

#### Issue: Can't merge despite passing checks

**Cause:** Branch not up to date with `dot-rail`

**Solution:**
```bash
git checkout your-branch
git fetch origin
git rebase origin/dot-rail
git push --force-with-lease origin your-branch
```

#### Issue: Code owner approval not required

**Cause:** CODEOWNERS file missing or incorrect path

**Solution:**
```bash
# Create CODEOWNERS file
cat > .github/CODEOWNERS << 'EOF'
# Automation and infrastructure
scripts/ @dotlink-ops/code-owners
.github/workflows/ @dotlink-ops/code-owners
docs/SECURITY_*.md @dotlink-ops/code-owners
EOF

git add .github/CODEOWNERS
git commit -m "chore: Add CODEOWNERS file"
git push
```

---

## Related Documentation

- **Issue #44:** Security Hardening Checklist (Avidelta)
- **TASK_HANDOFF.md:** Complete security configuration guide
- **SECURITY_COMPLIANCE.md:** Overall security posture tracking
- **docs/SECURITY_HARDENING.md:** Complete security implementation guide

---

## Maintenance

### When to Update This Configuration

- Adding new critical workflows that should block merges
- Changing branch naming convention (e.g., `dot-rail` → `automation`)
- Adding new protected paths to CODEOWNERS
- Modifying approval requirements

### Review Schedule

- **Quarterly:** Review ruleset effectiveness and bypass usage
- **After incidents:** Update rules if protection gaps discovered
- **When adding team members:** Update CODEOWNERS and bypass permissions

---

## Quick Reference Checklist

Use this checklist to verify complete dot-rail security configuration:

### Branch Ruleset (dot-rail)

- [ ] Ruleset named "dot-rail – guarded workflow branch" and active
- [ ] Targets `dot-rail` and `dot-rail/*` branches
- [ ] Require pull requests enabled (no direct pushes)
- [ ] 1 approval required, stale reviews dismissed
- [ ] Code owners required for `scripts/`, `.github/workflows/`
- [ ] Force pushes blocked
- [ ] Branch deletion blocked
- [ ] Bypass limited to repository admins + defined users

### Required Status Checks

- [ ] `secret-health` workflow configured and passing
- [ ] `tests/lint` or `pre-commit` workflow configured and passing
- [ ] `daily-run CI` workflow configured and passing
- [ ] Strict status checks enabled (branches must be up to date)

### Repository Actions Settings

- [ ] Actions restricted to GitHub-owned + verified creators only
- [ ] Workflow permissions set to read-only (default)
- [ ] GitHub Actions cannot create/approve PRs (disabled)

### Repository Security Settings

- [ ] Secret scanning enabled
- [ ] Push protection enabled
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled (optional but recommended)

### CODEOWNERS Configuration

- [ ] `.github/CODEOWNERS` file exists
- [ ] `scripts/` path protected
- [ ] `.github/workflows/` path protected
- [ ] Security docs paths protected (optional)

### Testing & Verification

- [ ] Direct push to dot-rail blocked (tested and confirmed)
- [ ] PR workflow succeeds with approvals and passing checks
- [ ] Status checks run automatically on PR
- [ ] Secret scanning blocks commits with credentials
- [ ] Code owner approval required for protected paths

---

**Configuration Date:** 2025-12-04  
**Configured By:** dotlink-ops (repository admin)  
**Document Version:** 1.1  
**Last Updated:** 2025-12-04
