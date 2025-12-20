# Secrets Setup Guide

> Complete guide for configuring GitHub secrets for nexus-core repository

## 📋 Quick Reference

### Required Secrets

| Secret Name | Scope | Used By | Purpose |
|-------------|-------|---------|---------|
| `OPENAI_API_KEY` | Repository | Daily Summary, CI | OpenAI API access |
| `SLACK_WEBHOOK` | Repository | All workflows | Slack notifications |
| `GITHUB_TOKEN` | Auto-provided | All workflows | GitHub API access |

### Optional Environment-Scoped Secrets

| Secret Name | Environment | Used By | Purpose |
|-------------|-------------|---------|---------|
| `OPENAI_API_KEY` | staging | Secret Health | Staging environment validation |
| `OPENAI_API_KEY` | production | Secret Health | Production environment validation |
| `SLACK_WEBHOOK` | production | Workflows | Production-specific notifications |

---

## 🚀 Quick Setup (Repository-Level)

### Option 1: GitHub CLI (Recommended)

```bash
# Set your actual secret values
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
export SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Add to repository secrets
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --body "$OPENAI_API_KEY"
gh secret set SLACK_WEBHOOK --repo dotlink-ops/nexus-core --body "$SLACK_WEBHOOK"

# Verify secrets were added
gh secret list --repo dotlink-ops/nexus-core
```

### Option 2: GitHub Web UI

1. Navigate to: https://github.com/dotlink-ops/nexus-core/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-`)
   - Click **"Add secret"**
4. Repeat for `SLACK_WEBHOOK`

---

## 🌍 Environment-Scoped Secrets (Advanced)

Environment-scoped secrets are safer than repository-wide secrets because they:
- Require explicit environment specification in workflows
- Can have different values per environment (staging vs production)
- Support protection rules (required reviewers, wait timers)

### Step 1: Create Environments

```bash
# Create staging and production environments
gh api -X PUT repos/dotlink-ops/nexus-core/environments/staging
gh api -X PUT repos/dotlink-ops/nexus-core/environments/production
```

**Or via Web UI:**
1. Go to: https://github.com/dotlink-ops/nexus-core/settings/environments
2. Click **"New environment"**
3. Enter name: `staging` (then repeat for `production`)

### Step 2: Add Environment-Specific Secrets

```bash
# Staging secrets
export OPENAI_API_KEY_STAGING="sk-staging-key-here"
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --env staging --body "$OPENAI_API_KEY_STAGING"

# Production secrets (separate keys recommended)
export OPENAI_API_KEY_PROD="sk-production-key-here"
export SLACK_WEBHOOK_PROD="https://hooks.slack.com/services/YOUR/PROD/WEBHOOK"

gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --env production --body "$OPENAI_API_KEY_PROD"
gh secret set SLACK_WEBHOOK --repo dotlink-ops/nexus-core --env production --body "$SLACK_WEBHOOK_PROD"
```

### Step 3: Use Environment-Scoped Secrets in Workflows

Update your workflow to specify the environment:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # 👈 Specify environment

    steps:
      - name: Use environment secrets
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}  # Gets production value
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        run: |
          echo "Using production secrets"
```

---

## 🔍 Verification

### Test Repository Secrets

```bash
# Check if secrets exist (values are hidden)
gh secret list --repo dotlink-ops/nexus-core

# Expected output:
# OPENAI_API_KEY  Updated YYYY-MM-DD
# SLACK_WEBHOOK   Updated YYYY-MM-DD
```

### Test Environment Secrets

```bash
# Check staging environment secrets
gh secret list --repo dotlink-ops/nexus-core --env staging

# Check production environment secrets
gh secret list --repo dotlink-ops/nexus-core --env production
```

### Run Secret Health Workflow

```bash
# Trigger manual run of secret validation
gh workflow run secret-health.yml --repo dotlink-ops/nexus-core

# Wait a few seconds, then check status
gh run list --workflow=secret-health.yml --repo dotlink-ops/nexus-core --limit 1

# View run details
gh run view --repo dotlink-ops/nexus-core --web
```

---

## 🔧 Troubleshooting

### Issue: "Secret not found" or "Empty value"

**Cause:** Secret not added or has placeholder value

**Solution:**
```bash
# Re-add the secret with actual value
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --body "$OPENAI_API_KEY"

# Verify it was added
gh secret list --repo dotlink-ops/nexus-core | grep OPENAI_API_KEY
```

### Issue: "Environment not found"

**Cause:** Environment doesn't exist yet

**Solution:**
```bash
# Create the environment first
gh api -X PUT repos/dotlink-ops/nexus-core/environments/production

# Then add secrets
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --env production --body "$OPENAI_API_KEY"
```

### Issue: Workflow fails with "Resource not accessible by integration"

**Cause:** Insufficient permissions or incorrect secret scope

**Solutions:**
1. **For repository secrets:** Ensure workflow has correct permissions:
   ```yaml
   permissions:
     contents: read  # Minimal permissions
   ```

2. **For environment secrets:** Ensure job specifies environment:
   ```yaml
   jobs:
     deploy:
       environment: production  # Required for env secrets
   ```

### Issue: Secret Health workflow passes but other workflows fail

**Cause:** Secret exists in environment but workflow doesn't specify environment

**Solution:** Add environment to job:
```yaml
jobs:
  my-job:
    runs-on: ubuntu-latest
    environment: production  # 👈 Add this if using env-scoped secrets
```

---

## 📊 Current Workflow Secret Usage

### Repository-Level Secrets

| Workflow | Requires OPENAI_API_KEY | Requires SLACK_WEBHOOK |
|----------|------------------------|------------------------|
| `daily-summary.yml` | ✅ Yes | ✅ Yes (optional) |
| `test-secrets.yml` | ✅ Yes | ✅ Yes (optional) |
| `ci.yml` | ❌ No | ✅ Yes (optional) |
| `pre-commit.yml` | ❌ No | ✅ Yes (optional) |
| `security-dashboard.yml` | ❌ No | ✅ Yes (optional) |
| `security-metrics.yml` | ❌ No | ✅ Yes (optional) |

### Environment-Level Secrets

| Workflow | Environment | Requires OPENAI_API_KEY |
|----------|-------------|------------------------|
| `secret-health.yml` | repository | ✅ Yes |
| `secret-health.yml` | staging | ✅ Yes |
| `secret-health.yml` | production | ✅ Yes |

---

## 🔐 Security Best Practices

### 1. Use Environment-Scoped Secrets for Production

```bash
# ✅ Good: Different keys per environment
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --env staging --body "$STAGING_KEY"
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --env production --body "$PROD_KEY"

# ❌ Avoid: Using same key everywhere
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --body "$SAME_KEY"
```

### 2. Rotate Secrets Regularly

```bash
# Generate new OpenAI API key at https://platform.openai.com/api-keys
# Then update secret:
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --body "$NEW_KEY"

# Update security dashboard after rotation
python3 scripts/update_security_dashboard.py
```

### 3. Use Least-Privilege Permissions

```yaml
# ✅ Good: Minimal permissions
permissions:
  contents: read

# ❌ Avoid: Excessive permissions
permissions:
  contents: write
  actions: write
  pull-requests: write
```

### 4. Enable Secret Scanning

```bash
# Enable secret scanning and push protection
gh api -X PATCH repos/dotlink-ops/nexus-core \
  -f security_and_analysis.secret_scanning.status=enabled \
  -f security_and_analysis.secret_scanning_push_protection.status=enabled
```

---

## 📝 Next Steps

After setting up secrets:

1. ✅ **Verify secrets exist:**
   ```bash
   gh secret list --repo dotlink-ops/nexus-core
   ```

2. ✅ **Run Secret Health check:**
   ```bash
   gh workflow run secret-health.yml --repo dotlink-ops/nexus-core
   ```

3. ✅ **Update security dashboard:**
   ```bash
   python3 scripts/update_security_dashboard.py
   ```

4. ✅ **Test workflows:**
   ```bash
   # Test daily summary in demo mode
   gh workflow run daily-summary.yml --repo dotlink-ops/nexus-core

   # Test CI
   git commit --allow-empty -m "test: Trigger CI"
   git push origin main
   ```

5. ✅ **Close security hardening issue:**
   - Check off items in issue #44
   - Update `SECURITY_COMPLIANCE.md` with completion status

---

## 🔗 Related Documentation

- **Security Compliance:** `SECURITY_COMPLIANCE.md` - Master tracking document
- **Security Checklist:** `docs/SECURITY_CHECKLIST.md` - Interactive setup checklist
- **Security Hardening:** `docs/SECURITY_HARDENING.md` - Complete security guide
- **Audit Template:** `docs/security-audit-template.md` - Quarterly compliance tracking
- **Issue #44:** Security Hardening Checklist with verification steps

---

**Need help?** Check the troubleshooting section above or review workflow logs:
```bash
gh run list --repo dotlink-ops/nexus-core --limit 10
gh run view <RUN_ID> --repo dotlink-ops/nexus-core --log
```
