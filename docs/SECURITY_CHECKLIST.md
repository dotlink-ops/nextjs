# Security Hardening Implementation Checklist

**Status:** Automated security measures implemented. Manual configuration required.

**Last Updated:** November 29, 2025  
**Commit:** 1e4f7be  
**Documentation:** See [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)

---

## ✅ Completed (Automated)

- [x] Pin all GitHub Actions to commit SHAs (supply chain security)
- [x] Set least-privilege permissions on all workflows
- [x] Create CODEOWNERS file (requires review on workflow changes)
- [x] Implement multi-environment secret validation matrix
- [x] Add Slack notification support (all workflows)
- [x] Add enhanced job summaries with rotation dates
- [x] Add cron jitter to avoid thundering herd (12:07 UTC)
- [x] Create comprehensive security documentation

---

## ⏳ Required Manual Steps

### Immediate (Within 24 Hours)

#### 1. Create GitHub Environments
- [ ] Go to: `Settings → Environments → New environment`
- [ ] Create "staging" environment
  - [ ] Add OPENAI_API_KEY secret (staging key)
  - [ ] Optional: Add required reviewers
- [ ] Create "production" environment
  - [ ] Add OPENAI_API_KEY secret (production key)
  - [ ] Add required reviewers: `@dotlink-ops`

#### 2. Add Repository Secrets
- [ ] Go to: `Settings → Secrets and variables → Actions`
- [ ] Add OPENAI_API_KEY (if not already added)
  ```bash
  gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core
  ```
- [ ] Add SLACK_WEBHOOK for failure notifications
  ```bash
  # Get webhook from: https://api.slack.com/apps
  gh secret set SLACK_WEBHOOK --repo dotlink-ops/nexus-core
  ```

#### 3. Enable Branch Protection
- [ ] Go to: `Settings → Branches → Add rule` (or edit existing)
- [ ] Branch name pattern: `main`
- [ ] Enable settings:
  - [ ] Require a pull request before merging
    - [ ] Require 1 approval
    - [ ] Require review from Code Owners
  - [ ] Require status checks to pass before merging
    - [ ] Require branches to be up to date
    - [ ] Add required checks:
      - [ ] `check-secrets (repository)`
      - [ ] `check-secrets (staging)`
      - [ ] `check-secrets (production)`
      - [ ] `test-secrets`
  - [ ] Require conversation resolution before merging
  - [ ] Require linear history
  - [ ] Include administrators
- [ ] Save changes

---

### High Priority (This Week)

#### 4. Enable Security Features
- [ ] Go to: `Settings → Code security and analysis`
- [ ] Enable all security features:
  - [ ] Secret scanning
  - [ ] Push protection
  - [ ] Dependency graph
  - [ ] Dependabot alerts
  - [ ] Dependabot security updates

#### 5. Restrict GitHub Actions
- [ ] Go to: `Settings → Actions → General`
- [ ] Under "Actions permissions":
  - [ ] Select: "Allow \<org\>, and select non-\<org\>, actions and reusable workflows"
  - [ ] Add to allow list:
    ```
    actions/checkout@*
    actions/setup-python@*
    actions/setup-node@*
    ```
- [ ] Under "Workflow permissions":
  - [ ] Select: "Read repository contents and packages permissions"
- [ ] Under "Fork pull request workflows":
  - [ ] Select: "Require approval for first-time contributors"
  - [ ] Enable: "Require approval for all outside collaborators"
- [ ] Save changes

#### 6. Test Workflows
- [ ] Run secret-health.yml manually:
  ```bash
  gh workflow run secret-health.yml
  ```
- [ ] Verify 3 jobs run:
  - [ ] check-secrets (repository) - should PASS
  - [ ] check-secrets (staging) - should PASS after env setup
  - [ ] check-secrets (production) - should PASS after env setup
- [ ] Check Slack for notifications (if configured)

---

### Medium Priority (This Month)

#### 7. Set Up Rotation Reminders
- [ ] Create Q1 2026 rotation issue:
  ```bash
  gh issue create \
    --title "Q1 2026: Rotate Secrets (90-day cadence)" \
    --body "Rotate all secrets per docs/SECURITY_HARDENING.md" \
    --label "security,rotation" \
    --milestone "Q1-2026"
  ```
- [ ] Add calendar reminder for 90 days from now
- [ ] Document rotation in team wiki/runbook

#### 8. Configure Notifications
- [ ] Personal GitHub Settings → Notifications → Actions
  - [ ] Enable: "Send notifications for failed workflows only"
- [ ] Repository Settings → Notifications
  - [ ] Configure team notification preferences
- [ ] Install GitHub Mobile app (optional)
  - [ ] Enable push notifications for workflow failures

#### 9. Enable Audit Logging (Organization-Level)
- [ ] Go to: Organization Settings → Audit log
- [ ] Enable audit log streaming (if available)
- [ ] Schedule monthly audit reviews:
  ```bash
  # Create recurring issue
  gh issue create \
    --title "Monthly Security Audit - $(date +%B_%Y)" \
    --body "Review Actions audit events" \
    --label "security,audit"
  ```

---

### Optional Enhancements

#### 10. Implement OIDC Federation (Cloud Providers)
- [ ] AWS: Configure OIDC trust relationship
  - [ ] Create IAM role for GitHub Actions
  - [ ] Update workflows to use `aws-actions/configure-aws-credentials`
- [ ] Azure: Configure workload identity federation
- [ ] GCP: Configure workload identity federation
- [ ] Remove long-lived cloud credentials from secrets

#### 11. Add Security Dashboards
- [ ] Enable GitHub Security tab
- [ ] Configure security advisories
- [ ] Set up security policy (SECURITY.md)
- [ ] Add vulnerability disclosure process

#### 12. Team Training
- [ ] Review SECURITY_HARDENING.md with team
- [ ] Train on CODEOWNERS review process
- [ ] Document incident response procedures
- [ ] Create security champion role

---

## Verification Commands

```bash
# Check workflow runs
gh run list --workflow=secret-health.yml --limit=5

# Check secrets (names only, not values)
gh secret list --repo dotlink-ops/nexus-core

# Verify branch protection
gh api repos/dotlink-ops/nexus-core/branches/main/protection | jq

# Check CODEOWNERS syntax
cat .github/CODEOWNERS

# Test Slack webhook (requires SLACK_WEBHOOK secret)
# This is done automatically by workflows on failure
```

---

## Success Criteria

### All systems operational when:

- [x] All workflows pin actions to commit SHAs
- [x] CODEOWNERS file requires reviews
- [x] All workflows use least-privilege permissions
- [ ] All 3 environments have secrets configured
- [ ] secret-health.yml runs daily with all checks passing
- [ ] Branch protection prevents merges if checks fail
- [ ] Slack notifications arrive on failures
- [ ] Actions restricted to trusted sources only
- [ ] Secret scanning + push protection enabled
- [ ] Quarterly rotation reminders created

---

## Troubleshooting

### Problem: Environment checks failing
**Solution:** Ensure secrets are added to each environment (not just repository level)

### Problem: CODEOWNERS not requiring review
**Solution:** Verify branch protection has "Require review from Code Owners" enabled

### Problem: Slack notifications not arriving
**Solution:** Check SLACK_WEBHOOK secret is configured and webhook URL is valid

### Problem: Status checks not appearing in PRs
**Solution:** Run workflows at least once before they appear as required checks

### Problem: Can't update workflow files
**Solution:** This is expected! Create PR and get @dotlink-ops approval (CODEOWNERS)

---

## Resources

- **Full Documentation:** [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)
- **Secrets Guide:** [SECRETS_MANAGEMENT.md](./SECRETS_MANAGEMENT.md)
- **Workflows:** [.github/workflows/](../.github/workflows/)
- **Code Ownership:** [.github/CODEOWNERS](../.github/CODEOWNERS)

## Support

For questions or security concerns:
- **Email:** security@ariadnenexus.com
- **Slack:** #security-alerts
- **GitHub:** Open issue with `security` label
