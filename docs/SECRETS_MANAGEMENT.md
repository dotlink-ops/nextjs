# GitHub Secrets Management Guide

## Quick Setup

### Add Secret via GitHub UI
1. Go to: https://github.com/dotlink-ops/nexus-core/settings/secrets/actions
2. Click "New repository secret"
3. Name: `OPENAI_API_KEY`
4. Value: [Paste your OpenAI API key]
5. Click "Add secret"

### Add Secret via GitHub CLI
```bash
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --body "$YOUR_OPENAI_API_KEY"
```

## How Secrets Work in Workflows

### ✅ Correct Usage (Environment Variables)
```yaml
- name: Run automation
  run: python3 scripts/daily_v2.py
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### ❌ Incorrect Usage (Inline in commands)
```yaml
# DON'T DO THIS - may expose secrets in logs
- name: Bad example
  run: python3 script.py --api-key ${{ secrets.OPENAI_API_KEY }}
```

## Security Best Practices

### ✅ Do This:
- Store secrets only in GitHub Actions Secrets
- Use secrets as environment variables in workflows
- Rotate keys periodically
- Delete unused secrets
- Use environments (staging/prod) for different keys

### ❌ Never Do This:
- Commit secrets to `.env.local` or any file in the repo
- Echo or print secrets in workflow logs
- Use secrets in pull requests from forks (they won't work anyway)
- Store secrets in code or comments

## GitHub Automatic Masking

GitHub automatically masks secret values in logs:

**What you see in logs:**
```
✓ OPENAI_API_KEY loaded (masked in logs)
  Length: 164 characters
```

**What gets hidden:**
- The actual secret value is replaced with `***`
- Even if you accidentally log it, GitHub censors it

## Verification Steps

### 1. Test Secret Availability
Run the CI workflow:
```bash
# Via GitHub UI:
# Actions → CI - Test Secrets → Run workflow

# Via GitHub CLI:
gh workflow run test-secrets.yml
```

### 2. Check Logs
Expected output:
```
✓ OPENAI_API_KEY loaded (masked in logs)
  Length: 164 characters
```

### 3. Verify Masking
Try to echo the secret (it will be masked):
```yaml
- name: Test masking
  run: echo "Key starts with: ${OPENAI_API_KEY:0:5}"
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
# Output: Key starts with: ***
```

## Advanced: Using Environments

### For Multiple Deployment Stages

**Setup:**
1. Go to: `Settings → Environments`
2. Create environment: `production`
3. Add environment secrets with same names
4. Update workflow:

```yaml
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production  # Uses production environment secrets
    steps:
      - name: Deploy
        run: python3 scripts/daily_v2.py
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Organization-Wide Secrets

For multiple repos in an organization:

**Setup:**
1. Go to: `Organization Settings → Secrets and variables → Actions`
2. Click "New organization secret"
3. Name: `OPENAI_API_KEY`
4. Select repositories that can access it
5. Click "Add secret"

**Usage in workflows:** Same as repository secrets
```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Troubleshooting

### Secret not available in workflow?

**Check:**
1. ✓ Secret name matches exactly (case-sensitive)
2. ✓ Created as "Secret" not "Variable"
3. ✓ Repository has access (for org secrets)
4. ✓ Environment is specified (if using environment secrets)
5. ✓ Workflow has proper permissions

**View available secrets:**
```bash
gh secret list --repo dotlink-ops/nexus-core
```

### Secret masking not working?

GitHub masks:
- Exact secret values
- Base64-encoded versions
- URL-encoded versions

But won't mask:
- Substrings shorter than 4 characters
- Values that look like common words

## CLI Commands

### List secrets
```bash
gh secret list --repo dotlink-ops/nexus-core
```

### Set secret
```bash
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core --body "$YOUR_KEY"
```

### Set secret from file
```bash
gh secret set OPENAI_API_KEY --repo dotlink-ops/nexus-core < api-key.txt
```

### Delete secret
```bash
gh secret delete OPENAI_API_KEY --repo dotlink-ops/nexus-core
```

## Key Rotation Schedule

**Recommended:**
- OpenAI API keys: Rotate every 90 days
- GitHub tokens: Rotate every 180 days
- Check for unused secrets: Monthly

**How to rotate:**
1. Generate new key from provider (OpenAI, GitHub, etc.)
2. Add new secret with same name (overwrites old)
3. Test workflow runs with new key
4. Revoke old key from provider
5. Document rotation date

## Guardrails

### GitHub Actions

**Best Practices:**

- ✓ Rotate keys periodically; remove stale secrets
- ✓ Prefer Environment secrets (staging/prod) when you have different keys by stage
- ✓ Use branch protection + required reviews on workflow files (`.github/workflows/*`)
- ✓ Add sanity checks to validate secret presence before use
- ✓ Never print secret values (GitHub masks them, but be defensive)

**Sanity Check Pattern (safe—no secret printed):**

```yaml
- name: Check OPENAI_API_KEY presence (masked)
  run: |
    if [ -z "${OPENAI_API_KEY}" ]; then
      echo "✗ OPENAI_API_KEY missing"
      exit 1
    else
      echo "✓ OPENAI_API_KEY present (value masked)"
    fi
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

**Branch Protection Setup:**

```bash
# Repository Settings → Branches → Add rule
# Branch name pattern: main
# ✓ Require pull request reviews before merging
# ✓ Require status checks to pass
# ✓ Include administrators

# Protect workflow files specifically:
# Settings → Code security → Code scanning → CodeQL
# Or use CODEOWNERS file:
echo ".github/workflows/* @your-security-team" > .github/CODEOWNERS
```

### Node.js / Next.js Runtime

**Fail-fast validation:**

```typescript
// In your API route or server code
const key = process.env.OPENAI_API_KEY;
if (!key) {
  throw new Error("OPENAI_API_KEY missing - check environment configuration");
}
// use `key` – never log it

// For Next.js API routes:
export async function GET(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OPENAI_API_KEY not configured");
    return Response.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Use apiKey safely...
}
```

**Environment validation helper:**

```typescript
// lib/env.ts
export function validateEnv() {
  const required = ['OPENAI_API_KEY', 'GITHUB_TOKEN'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Call at app startup:
// app/layout.tsx or instrumentation.ts
import { validateEnv } from '@/lib/env';
validateEnv();
```

### Python Runtime

**Fail-fast validation:**

```python
import os

key = os.getenv("OPENAI_API_KEY")
if not key:
    raise RuntimeError("OPENAI_API_KEY missing - check .env.local or environment")
# use `key` – never print it
```

**Validation helper:**

```python
# scripts/env_check.py
import os
import sys

def validate_env(required_vars: list[str]) -> None:
    """
    Validate required environment variables are present.

    Raises:
        RuntimeError: If any required variables are missing
    """
    missing = [var for var in required_vars if not os.getenv(var)]

    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}", file=sys.stderr)
        print("\nSet them in .env.local or export them:", file=sys.stderr)
        for var in missing:
            print(f"  export {var}='your-value-here'", file=sys.stderr)
        raise RuntimeError(f"Missing required environment variables: {missing}")

# Use in your script:
if __name__ == "__main__":
    validate_env(["OPENAI_API_KEY", "GITHUB_TOKEN", "REPO_NAME"])
    # Continue with script...
```

**Defensive logging:**

```python
import logging

logger = logging.getLogger(__name__)

# ✅ Safe - doesn't expose secret
logger.info("API key loaded successfully")
logger.debug(f"API key length: {len(api_key)} characters")

# ❌ NEVER DO THIS
# logger.info(f"Using API key: {api_key}")  # DANGEROUS!
# print(f"Key: {api_key}")  # DANGEROUS!
```

## Current Setup for nexus-core

**Required Secrets:**

- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions

**Workflows Using Secrets:**

- `.github/workflows/daily-summary.yml` - Daily automation
- `.github/workflows/test-secrets.yml` - CI testing

**Next Steps:**

1. Add `OPENAI_API_KEY` via GitHub UI or CLI
2. Run test workflow to verify
3. Check Actions logs for "loaded (masked)" message
4. Schedule key rotation reminder (90 days)
