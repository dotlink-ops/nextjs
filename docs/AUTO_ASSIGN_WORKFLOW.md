# Auto-assign Reviewers Workflow

Location: `.github/workflows/auto-assign-reviewers.yml`

Summary
- Runs daily (and can be manually dispatched) to reassign reviewers for stale PRs.
- Removes currently requested reviewers from PRs last-updated > 15 days and requests the configured reviewer(s).

Current configuration
- `TARGET_REVIEWERS` is set to the org team slug: `dotlink-ops`.
- The workflow validates each candidate via the GitHub API:
  - If it resolves as a GitHub user, it will be requested as a user reviewer.
  - If it resolves as an org team slug under the repository owner, it will be requested as a `team_reviewers` entry.
  - If neither resolves, the candidate is skipped and a warning is logged.

Behavior and safety
- The workflow uses `pull-requests: write` permissions to remove and request reviewers.
- Validation prevents the workflow from failing when a configured reviewer does not exist.
- If the configured reviewer is a team, requests will be made using `team_reviewers` (safer for shared ownership).

How to change the reviewer target
1. Edit `.github/workflows/auto-assign-reviewers.yml` and update the `TARGET_REVIEWERS` array.
2. Alternatively, convert `TARGET_REVIEWERS` to read from a repository variable or `env` entry for easier updates without code changes.

Example: use a repo variable (recommended for operational teams)
1. Add a repository variable `AUTO_ASSIGN_REVIEWERS` with value `dotlink-ops` (or comma-separated list).
2. Update the workflow to read and split that variable into `TARGET_REVIEWERS`.

Testing
- Use the workflow's `workflow_dispatch` event to run a manual test on a safe test PR.
- Check the workflow logs for validation messages and reviewer request calls.

Notes
- Team slugs must match the organization team slug exactly.
- If you want only a single user accountable, set `TARGET_REVIEWERS` to that GitHub username.
- The workflow is conservative: it logs warnings instead of failing when updates can't be applied.

If you want, I can update the workflow to read `TARGET_REVIEWERS` from a repository variable and include an example change.
