# Security Hardening Guide

Complete security checklist and hardening measures for the nexus-core automation infrastructure.

## Table of Contents

- [GitHub Actions Security](#github-actions-security)
- [Secret Management](#secret-management)
- [Branch Protection](#branch-protection)
- [Monitoring & Notifications](#monitoring--notifications)
- [Audit & Compliance](#audit--compliance)
- [Rotation Schedule](#rotation-schedule)
- [Quick Setup Checklist](#quick-setup-checklist)

## GitHub Actions Security

### 1. Pin Actions to Commit SHAs

**Status:** ✅ Implemented

All workflow actions are pinned to specific commit SHAs (not tags) to prevent supply chain attacks:

```yaml
# ✅ Secure: Pinned to commit SHA
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

# ❌ Insecure: Uses mutable tag
uses: actions/checkout@v4
```

**Current pins:**
- `actions/checkout@v4.2.2` → `11bd71901bbe5b1630ceea73d27597364c9af683`
- `actions/setup-python@v5.3.0` → `0b93645e9fea7318ecaed2b359559ac225c90a2b`

**Maintenance:**
Update SHAs quarterly or when security advisories are published.

### 2. Least-Privilege Permissions

**Status:** ✅ Implemented

All workflows use minimal required permissions:

```yaml
# Default: No permissions
permissions: {}

# Or specific permissions only where needed
permissions:
  contents: write  # Only for workflows that push commits
  contents: read   # Only for workflows that read code
```

**Current configuration:**
- `secret-health.yml`: `permissions: {}` (read-only)
- `test-secrets.yml`: `permissions: { contents: read }`
- `daily-summary.yml`: `permissions: { contents: write }` (needs to commit)

### 3. Restrict Actions to Trusted Sources

**Setup Required:** Configure in Repository Settings

1. Go to: `Settings → Actions → General`
2. Under "Actions permissions":
   - Select: "Allow \<org\>, and select non-\<org\>, actions and reusable workflows"
3. Add to allow list:
   ```
   actions/checkout@*
   actions/setup-python@*
   actions/setup-node@*
   ```
4. Save changes

This prevents untrusted actions from running in your workflows.

### 4. CODEOWNERS for Workflow Files

**Status:** ✅ Implemented

`.github/CODEOWNERS` requires review for all workflow changes:

```
.github/workflows/** @dotlink-ops
scripts/*.py @dotlink-ops
docs/SECRETS_MANAGEMENT.md @dotlink-ops
```

**Effect:** All PRs touching these files require approval from `@dotlink-ops` before merging.

## Secret Management

### 1. Multi-Environment Secrets

**Status:** ✅ Implemented

Secrets are validated across three environments:
- **Repository-level** (default secrets)
- **Staging environment** (separate staging credentials)
- **Production environment** (separate production credentials)

**Setup staging/production environments:**

```bash
# Via GitHub UI:
Settings → Environments → New environment
  Name: staging
  Add secrets specific to staging

Settings → Environments → New environment
  Name: production
  Add secrets specific to production
  Enable "Required reviewers" for production deploys
```

**Workflow matrix automatically checks all environments:**

```yaml
strategy:
  matrix:
    environment: [repository, staging, production]
environment: ${{ matrix.environment }}
```

### 2. Secret Scanning & Push Protection

**Setup Required:** Enable in Repository Settings

1. Go to: `Settings → Code security and analysis`
2. Enable:
   - ✅ **Secret scanning** - Detect committed secrets
   - ✅ **Push protection** - Block commits containing secrets
   - ✅ **Dependency graph** - Track dependencies
   - ✅ **Dependabot alerts** - Security advisories
   - ✅ **Dependabot security updates** - Auto-fix CVEs

### 3. OIDC Federation (Preferred)

**For Cloud Provider Credentials:**

Instead of storing long-lived cloud credentials in GitHub Secrets, use OIDC federation:

**AWS Example:**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
    aws-region: us-east-1
```

**Benefits:**
- No long-lived credentials
- Auto-rotating temporary tokens
- Fine-grained IAM permissions

**Setup guide:** https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

### 4. Secret Rotation Schedule

**Status:** ✅ Tracked in workflow summaries

**Schedule:**
- **OpenAI API keys:** Every 90 days
- **GitHub tokens:** Every 180 days
- **Cloud provider keys:** Every 90 days (or use OIDC instead)

**Next rotation due:** Displayed in every `secret-health.yml` job summary

**Create rotation reminder:**
```bash
# Create GitHub Issue for tracking
gh issue create \
  --title "Q1 2026: Rotate OpenAI API Key" \
  --body "Quarterly secret rotation due. See docs/SECURITY_HARDENING.md" \
  --label "security,rotation" \
  --milestone "Q1-2026"
```

## Branch Protection

### Required Status Checks

**Setup Required:** Configure in Repository Settings

1. Go to: `Settings → Branches`
2. Click "Add rule" (or edit existing rule for `main`)
3. Configure:

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals (1)
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

  Required checks:
    ☑ check-secrets (repository)
    ☑ check-secrets (staging)
    ☑ check-secrets (production)
    ☑ test-secrets

☑ Require conversation resolution before merging

☑ Require linear history

☑ Include administrators
```

**Effect:** PRs cannot merge if:
- Secrets are missing in any environment
- CI tests fail
- Code owners haven't approved
- Conversations aren't resolved

### Fork Security

**Setup Required:** Configure in Repository Settings

1. Go to: `Settings → Actions → General`
2. Under "Fork pull request workflows":
   - Select: "Require approval for first-time contributors"
   - ☑ "Require approval for all outside collaborators"

**Effect:** Prevents malicious forks from accessing secrets.

## Monitoring & Notifications

### 1. Slack Notifications

**Setup Required:** Add `SLACK_WEBHOOK` secret

All three workflows now support Slack notifications on failure:

1. Create Slack webhook:
   - Go to: https://api.slack.com/apps
   - Create app → Incoming Webhooks → Add New Webhook
   - Select channel (e.g., `#automation-alerts`)
   - Copy webhook URL

2. Add to GitHub Secrets:
   ```bash
   gh secret set SLACK_WEBHOOK \
     --repo dotlink-ops/nexus-core \
     --body "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```

3. Test:
   ```bash
   # Manually trigger a workflow
   gh workflow run secret-health.yml
   ```

**Notification format:**
```
⚠️ Secret Health Check Failed in production
Repository: dotlink-ops/nexus-core
Workflow: [View Run]
```

### 2. Email Notifications

**Setup:** Configure in Personal Settings

1. Go to: GitHub Settings → Notifications → Actions
2. Select:
   - ☑ "Send notifications for failed workflows only"
   - ☑ "Send notifications for workflow runs on repositories you're watching"

### 3. GitHub Mobile Notifications

**Setup:** Install GitHub Mobile

- iOS: https://apps.apple.com/app/github/id1477376905
- Android: https://play.google.com/store/apps/details?id=com.github.android

Configure push notifications for workflow failures.

## Audit & Compliance

### 1. Audit Log Retention

**Org-Level Setup Required:**

1. Go to: Organization Settings → Audit log
2. Enable:
   - ☑ "Git events" (track all commits)
   - ☑ "Actions workflow events" (track workflow runs)
   - Export logs monthly for compliance

### 2. Monthly Audit Review

**Process:**

1. Review Actions audit events:
   ```bash
   # Via GitHub UI:
   Organization → Audit log → Filter: "action:workflows.*"

   # Via API:
   gh api /orgs/dotlink-ops/audit-log \
     --jq '.[] | select(.action | startswith("workflows"))'
   ```

2. Check for:
   - Unauthorized workflow modifications
   - Failed secret validations
   - Suspicious secret access patterns
   - Unusual workflow run times

3. Document findings in security log:
   ```bash
   gh issue create \
     --title "Monthly Security Audit - $(date +%B_%Y)" \
     --body "Audit findings: [document here]" \
     --label "security,audit"
   ```

### 3. Workflow Run Retention

**Setup:** Configure in Repository Settings

1. Go to: `Settings → Actions → General`
2. Set "Artifact and log retention" to: **90 days**

Keeps logs available for compliance reviews.

## Rotation Schedule

### Quarterly Tasks (Every 90 Days)

- [ ] Rotate OpenAI API key
  ```bash
  # Generate new key at: https://platform.openai.com/api-keys
  # Update GitHub secret:
  gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core
  # Update environment secrets:
  # Settings → Environments → staging/production → Update secret
  # Test with secret-health workflow
  ```

- [ ] Rotate cloud provider credentials (or confirm OIDC working)
- [ ] Review and remove unused secrets
- [ ] Update action SHAs to latest versions
- [ ] Review CODEOWNERS for team changes

### Bi-Annual Tasks (Every 180 Days)

- [ ] Rotate GitHub personal access tokens
- [ ] Review branch protection rules
- [ ] Audit Actions allow list
- [ ] Review webhook configurations

### Annual Tasks

- [ ] Full security audit by external reviewer
- [ ] Penetration testing of automation infrastructure
- [ ] Review and update security documentation
- [ ] Team security training

## Quick Setup Checklist

### Immediate (Must Do)

- [x] Pin all actions to commit SHAs
- [x] Add CODEOWNERS file
- [x] Set least-privilege permissions
- [x] Implement multi-environment secret validation
- [x] Add Slack notification support

### High Priority (This Week)

- [ ] Add `OPENAI_API_KEY` to GitHub Secrets
- [ ] Add `SLACK_WEBHOOK` to GitHub Secrets
- [ ] Enable Secret scanning + Push protection
- [ ] Configure branch protection rules
- [ ] Restrict Actions to trusted sources
- [ ] Create staging and production environments

### Medium Priority (This Month)

- [ ] Set up quarterly rotation reminders
- [ ] Enable audit log retention (org-level)
- [ ] Configure email/mobile notifications
- [ ] Document incident response plan
- [ ] Create security runbook

### Optional (Nice to Have)

- [ ] Implement OIDC federation for cloud credentials
- [ ] Add security dashboards (GitHub Security tab)
- [ ] Set up automated security scanning (Snyk, Dependabot)
- [ ] Create security champion role in team

## Reference Links

**GitHub Docs:**
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [CODEOWNERS syntax](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

**Related Documentation:**
- [SECRETS_MANAGEMENT.md](./SECRETS_MANAGEMENT.md) - Detailed secrets guide
- [.github/workflows/](../.github/workflows/) - Workflow implementations
- [.github/CODEOWNERS](../.github/CODEOWNERS) - Code ownership rules

## Support

For security issues or questions:
- Email: security@ariadnenexus.com
- Slack: #security-alerts
- GitHub: Open issue with `security` label
