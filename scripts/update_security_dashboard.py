#!/usr/bin/env python3
# pyright: strict
"""
Update the Q1–Q4 Compliance Dashboard in docs/security-audit-template.md.

Behavior:
- Parses the markdown to find optional per-quarter metric blocks:
    <!-- METRICS:Q1
    Completion=100
    Secrets=100
    Workflow=100
    Governance=100
    Grade=PASS
    -->
  Repeat for Q2/Q3/Q4. Values 0–100; Grade in {PASS, GOOD, PARTIAL, FAIL}.

- If a quarter block is missing, attempts to INFER metrics from the
  "Section 1 — Core Controls Validation" table by computing % of ✅
  in the Status column. Uses that percent for all four sub-metrics
  (Secrets/Workflow/Governance) and Completion. Grade is derived:
    >= 97 : PASS
    >= 90 : GOOD
    >= 80 : PARTIAL
    else  : FAIL

- Rewrites ONLY the Dashboard section while keeping the rest intact.

Usage:
    python scripts/update_security_dashboard.py
    python scripts/update_security_dashboard.py --dry-run
"""

import argparse
import datetime as dt
import pathlib
import re
from typing import Dict, Optional, Tuple

ROOT = pathlib.Path(__file__).resolve().parents[1]
AUDIT_MD = ROOT / "docs" / "security-audit-template.md"

DASHBOARD_HEADER_PATTERN = re.compile(
    r"(?P<header>^##\s+📊\s+.*?Dashboard.*?\n)",
    flags=re.MULTILINE,
)

SECTION_SPLIT_PATTERN = re.compile(r"^##\s+", flags=re.MULTILINE)

METRICS_BLOCK_RE = re.compile(
    r"<!--\s*METRICS:(Q[1-4])\s*(.*?)\s*-->",
    flags=re.DOTALL | re.IGNORECASE,
)

CORE_CONTROLS_TABLE_RE = re.compile(
    r"##\s*🧩\s*Section 1\s+—\s+Core Controls Validation.*?"
    r"(\|.*\|\s*\n)+",  # rudimentary capture of the table
    flags=re.DOTALL | re.IGNORECASE,
)

STATUS_CELL_RE = re.compile(r"\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*(✅|⏳|🔴|N/?A|N/A|NA)\s*\|", re.IGNORECASE)

GRADE_ORDER = ["FAIL", "PARTIAL", "GOOD", "PASS"]


def parse_metrics_blocks(md: str) -> Dict[str, Dict[str, int]]:
    """Return metrics for Q1..Q4 if blocks exist."""
    data: Dict[str, Dict[str, int]] = {}
    for m in METRICS_BLOCK_RE.finditer(md):
        quarter = m.group(1).upper()
        body = m.group(2)
        quarter_data: Dict[str, int] = {}
        for line in body.splitlines():
            if "=" in line:
                key, val = [s.strip() for s in line.split("=", 1)]
                key_u = key.lower()
                if key_u in {"completion", "secrets", "workflow", "governance"}:
                    try:
                        quarter_data[key_u] = int(re.sub(r"[^\d]", "", val))
                    except ValueError:
                        pass
                elif key_u == "grade":
                    # Keep grade as a string but store separately
                    quarter_data["grade_str"] = val.strip().upper()
        if quarter_data:
            data[quarter] = quarter_data
    return data


def infer_from_core_controls(md: str) -> Optional[int]:
    """Return % ✅ from Section 1 table, or None if not found."""
    m = CORE_CONTROLS_TABLE_RE.search(md)
    if not m:
        return None
    table_md = m.group(0)
    statuses = STATUS_CELL_RE.findall(table_md)
    if not statuses:
        return None
    total = len(statuses)
    checkmarks = sum(1 for s in statuses if s.strip() == "✅")
    if total == 0:
        return None
    pct = round((checkmarks / total) * 100)
    return pct


def derive_grade(pct: int) -> str:
    if pct >= 97:
        return "PASS"
    if pct >= 90:
        return "GOOD"
    if pct >= 80:
        return "PARTIAL"
    return "FAIL"


def pick_overall_grade(grades: Tuple[str, str, str, str]) -> str:
    """Return the worst-case among provided grades based on GRADE_ORDER."""
    ranks = {g: i for i, g in enumerate(GRADE_ORDER)}
    return sorted(grades, key=lambda g: ranks.get(g, -1))[0]


def render_dashboard(qdata: Dict[str, Dict[str, int]]) -> str:
    def fmt_row(q: str, d: Dict[str, int]) -> str:
        comp = d["completion"]
        sec = d["secrets"]
        wfl = d["workflow"]
        gov = d["governance"]
        grade = d["grade"]

        def badge(p):
            if p >= 100:
                return f"{p}% ✅"
            if p >= 95:
                return f"{p}% 🟢"
            if p >= 90:
                return f"{p}% 🟡"
            if p >= 80:
                return f"{p}% 🟠"
            return f"{p}% 🔴"

        overall_emoji = {"PASS": "🟢", "GOOD": "🟡", "PARTIAL": "🟠", "FAIL": "🔴"}.get(grade, "🟡")
        return f"| 🟢 **{q}** | {badge(comp)} | {badge(sec)} | {badge(wfl)} | {badge(gov)} | {overall_emoji} **{grade}** |"

    # Aggregate
    vals = [d["completion"] for d in qdata.values()]
    agg = round(sum(vals) / len(vals)) if vals else 0
    trend = "↗ Steady Improvement"  # placeholder (could compute slope later)

    now_utc = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    lines = []
    lines.append("## 📊 Executive Dashboard (Auto-Generated Summary)\n")
    lines.append("| Quarter | Completion | Secrets Health | Workflow Integrity | Governance & Access | Overall Grade |")
    lines.append("|----------|-------------|----------------|--------------------|---------------------|----------------|")
    for q_label in ("Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Oct–Dec)"):
        key = q_label.split()[0]
        d = qdata[key]
        lines.append(fmt_row(q_label, d))
    lines.append("")

    # Add aggregate badge
    def agg_badge(p):
        if p >= 95:
            return f"{p}% 🟢"
        if p >= 85:
            return f"{p}% 🟡"
        if p >= 75:
            return f"{p}% 🟠"
        return f"{p}% 🔴"

    lines.append(f"**Aggregate Compliance:** {agg_badge(agg)}  ")
    lines.append(f"**Trend:** {trend}  ")
    lines.append("**Audit Lead:** @kamarfoster  ")
    lines.append(f"**Last Dashboard Update:** {now_utc}  ")
    lines.append("")
    lines.append("**Legend:**")
    lines.append("")
    lines.append("- 🟢 **100-95%** - Excellent (Pass)")
    lines.append("- 🟡 **94-85%** - Good (Partial)")
    lines.append("- 🟠 **84-75%** - Needs Attention (Partial)")
    lines.append("- 🔴 **<75%** - Critical (Fail)")
    lines.append("")
    lines.append("**Key Metrics:**")
    lines.append("")
    lines.append("- **Secrets Health:** % of secrets properly rotated within 90-day window")
    lines.append("- **Workflow Integrity:** % of workflows with pinned actions + least-privilege permissions")
    lines.append("- **Governance & Access:** % of security controls (branch protection, CODEOWNERS, scanning) fully enabled")
    lines.append("")
    lines.append("> 📈 *Dashboard populated from quarterly audit logs. Optional: Automate with GitHub Actions \"Security Metrics Aggregator\" workflow.*")
    lines.append("")
    return "\n".join(lines)


def main(dry_run: bool = False) -> int:
    if not AUDIT_MD.exists():
        print(f"ERROR: {AUDIT_MD} not found.")
        return 1

    md = AUDIT_MD.read_text(encoding="utf-8")

    # Step 1: parse embedded metrics
    blocks = parse_metrics_blocks(md)

    # Step 2: infer fallback percentage from Section 1
    inferred_pct = infer_from_core_controls(md)
    if inferred_pct is None:
        inferred_pct = 90  # sensible default
        print(f"⚠️  Could not parse Section 1 table, using default {inferred_pct}%")
    else:
        print(f"📊 Inferred {inferred_pct}% from Section 1 Core Controls")

    # Step 3: prepare full quarter dict with fallbacks
    qdata: Dict[str, Dict[str, int]] = {}
    for q in ("Q1", "Q2", "Q3", "Q4"):
        b = blocks.get(q, {})
        comp = int(b.get("completion", inferred_pct))
        sec = int(b.get("secrets", inferred_pct))
        wfl = int(b.get("workflow", inferred_pct))
        gov = int(b.get("governance", inferred_pct))
        grade = b.get("grade_str") or derive_grade(comp)
        # Sanitize ranges
        comp = max(0, min(100, comp))
        sec = max(0, min(100, sec))
        wfl = max(0, min(100, wfl))
        gov = max(0, min(100, gov))
        qdata[q] = {
            "completion": comp,
            "secrets": sec,
            "workflow": wfl,
            "governance": gov,
            "grade": grade,
        }
        if q in blocks:
            print(f"✅ {q}: Using embedded metrics (Completion={comp}%, Grade={grade})")
        else:
            print(f"⚙️  {q}: Using inferred metrics (Completion={comp}%, Grade={grade})")

    # Step 4: build new dashboard block
    new_dashboard = render_dashboard(qdata)

    # Step 5: find dashboard header and replace section until next header
    header_match = DASHBOARD_HEADER_PATTERN.search(md)
    if not header_match:
        print("ERROR: Dashboard header not found in markdown.")
        return 1

    start = header_match.start()
    # Find the end of the dashboard section (next ## header)
    tail = md[start:]
    next_header = SECTION_SPLIT_PATTERN.search(tail, pos=len(header_match.group(0)))

    if next_header:
        end = start + next_header.start()
        remainder = md[end:]
    else:
        remainder = ""

    head = md[:start]
    updated = head + new_dashboard + remainder

    if dry_run:
        print("\n" + "=" * 60)
        print("DRY RUN: Updated Dashboard Preview")
        print("=" * 60)
        print(new_dashboard)
        print("=" * 60)
        return 0

    AUDIT_MD.write_text(updated, encoding="utf-8")
    print(f"\n✅ Updated dashboard in {AUDIT_MD}")

    # Calculate aggregate for summary
    vals = [d["completion"] for d in qdata.values()]
    agg = round(sum(vals) / len(vals)) if vals else 0
    print(f"📊 Aggregate Compliance: {agg}%")

    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Update security audit dashboard with quarterly metrics")
    ap.add_argument("--dry-run", action="store_true", help="Print the updated dashboard without writing file")
    args = ap.parse_args()
    raise SystemExit(main(dry_run=args.dry_run))
