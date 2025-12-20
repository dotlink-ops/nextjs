// Figma: nexus-core Design System → Automation Status / Under the Hood

import React from 'react';

type UnderTheHoodProps = {
  lastRunTime?: string;
  lastRunStatus?: "success" | "warning" | "failed";
  recentRuns?: Array<'success' | 'warning' | 'failed'>;
  actionsUrl?: string;
  notionDailyOpsUrl?: string;
};

/**
 * UnderTheHood Component
 * 
 * Explains the 5 AM automation workflow in detail.
 * Aligned to Figma design tokens (see design/tokens.md)
 */
export default function UnderTheHood({
  lastRunTime = "5:00 AM PT (scheduled)",
  lastRunStatus = "success",
  recentRuns = [],
  actionsUrl = "https://github.com/dotlink-ops/nexus-core/actions/workflows/daily-run.yml",
  notionDailyOpsUrl,
}: UnderTheHoodProps) {
  const statusLabel =
    lastRunStatus === "success"
      ? "Healthy"
      : lastRunStatus === "warning"
      ? "Degraded"
      : "Failed";

  const statusEmoji =
    lastRunStatus === "success"
      ? "🟢"
      : lastRunStatus === "warning"
      ? "🟡"
      : "🔴";
  
  // Map recent runs to emojis
  const historyEmojis = recentRuns.map(status => {
    if (status === 'success') return '🟢';
    if (status === 'warning') return '🟡';
    return '🔴';
  }).join('');

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        {/* Main Card - Figma: Card component */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm p-8 shadow-xl">
          {/* Header with Status */}
          <div className="mb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                {/* H1 - Figma: Display / Large */}
                <h2 className="text-3xl md:text-4xl font-semibold text-zinc-100 mb-4">
                  Under the hood: a 5 AM automation heartbeat
                </h2>
                {/* Body - Figma: Body / Default */}
                <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                  Every morning at 5:00 AM PT, a Python runner wakes up your data, 
                  summarizes what matters, and turns it into actionable work inside GitHub.
                </p>
                {/* Caption - Figma: Label / Small */}
                <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                  The output of this 5 AM run feeds directly into a Daily Ops Briefing in Notion,
                  where human judgment and automated context meet. Every day starts from the same
                  shared snapshot.
                </p>
                {notionDailyOpsUrl && (
                  <a
                    href={notionDailyOpsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-sky-300 transition"
                  >
                    Open today&apos;s Daily Ops Brief
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                {/* Status Badge */}
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2">
                  <span>{statusEmoji}</span>
                  <span className="text-xs font-medium text-zinc-100">Automation: {statusLabel}</span>
                </div>
                {/* Caption - Figma: Label / Small */}
                <p className="text-xs text-zinc-500">
                  Last run: <span className="text-zinc-300">{lastRunTime}</span>
                </p>
                {recentRuns.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    Last {recentRuns.length} runs: <span className="tracking-wider">{historyEmojis}</span>
                  </p>
                )}
                <a
                  href={actionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:border-sky-400 hover:bg-zinc-900 transition"
                >
                  View workflow in GitHub
                  <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="mt-12">
            {/* H2 - Figma: Heading / Medium */}
            <h3 className="text-lg md:text-xl font-semibold text-zinc-100 mb-6">
              What actually happens at 5:00 AM PT
            </h3>
            
            {/* Body - Figma: Body / Default */}
            <p className="text-sm md:text-base text-zinc-300 mb-6">
              This isn&apos;t just a dashboard — there&apos;s a real automation stack running behind it.
            </p>

            <p className="text-sm md:text-base text-zinc-300 mb-8 font-medium">
              Every morning at 5:00 AM PT:
            </p>

            {/* Steps */}
            <ol className="space-y-6 list-none">
              <li className="relative pl-12">
                <span className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-sky-400 text-zinc-950 rounded-full font-bold text-sm">
                  1
                </span>
                <div>
                  {/* H3 - Figma: Heading / Small */}
                  <h4 className="text-base font-semibold text-zinc-100 mb-2">
                    GitHub Actions wakes up the runner
                  </h4>
                  {/* Body - Figma: Body / Default */}
                  <p className="text-sm text-zinc-400">
                    A scheduled workflow in <code className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">daily-run.yml</code> checks 
                    out the nexus-core / Ariadne repo and spins up a clean Python environment.
                  </p>
                </div>
              </li>

              <li className="relative pl-12">
                <span className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-sky-400 text-zinc-950 rounded-full font-bold text-sm">
                  2
                </span>
                <div>
                  <h4 className="text-base font-semibold text-zinc-100 mb-2">
                    Python + AI process your inputs
                  </h4>
                  <p className="text-sm text-zinc-400 mb-3">
                    A production script (<code className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">daily_v2.py</code>) ingests 
                    notes and operational data, then uses OpenAI to structure:
                  </p>
                  <ul className="space-y-1 ml-6 list-disc list-inside">
                    <li className="text-sm text-zinc-400">A clear daily summary</li>
                    <li className="text-sm text-zinc-400">Key themes and changes since yesterday</li>
                    <li className="text-sm text-zinc-400">Extracted action items and follow-ups</li>
                  </ul>
                </div>
              </li>

              <li className="relative pl-12">
                <span className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-sky-400 text-zinc-950 rounded-full font-bold text-sm">
                  3
                </span>
                <div>
                  <h4 className="text-base font-semibold text-zinc-100 mb-2">
                    Tasks become GitHub Issues
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Action items aren&apos;t left in a document — they&apos;re pushed into GitHub Issues 
                    so work can be assigned, tracked, and closed like any other engineering or ops task.
                  </p>
                </div>
              </li>

              <li className="relative pl-12">
                <span className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-sky-400 text-zinc-950 rounded-full font-bold text-sm">
                  4
                </span>
                <div>
                  <h4 className="text-base font-semibold text-zinc-100 mb-2">
                    Artifacts are committed and archived
                  </h4>
                  <p className="text-sm text-zinc-400">
                    The runner commits generated outputs (JSON / DOCX / logs) back into the repo and uploads 
                    them as workflow artifacts, so every day&apos;s brief is versioned, auditable, and easy to revisit.
                  </p>
                </div>
              </li>

              <li className="relative pl-12">
                <span className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-sky-400 text-zinc-950 rounded-full font-bold text-sm">
                  5
                </span>
                <div>
                  <h4 className="text-base font-semibold text-zinc-100 mb-2">
                    Notion / Ops get a &ldquo;morning brief&rdquo;
                  </h4>
                  <p className="text-sm text-zinc-400">
                    The system&apos;s output is designed to feed directly into a Daily Ops Briefing view in Notion, 
                    giving a single place where human judgment and automated context meet.
                  </p>
                </div>
              </li>
            </ol>

            {/* Result Card - Figma: Card / Accent */}
            <div className="mt-12 p-6 rounded-2xl bg-sky-400/10 border border-sky-400/20">
              <p className="text-sm text-zinc-300 leading-relaxed">
                <strong className="text-zinc-100">The result:</strong> a quiet, 
                reliable &ldquo;ops heartbeat&rdquo; that turns messy notes and scattered signals into 
                a structured morning briefing and concrete next actions — before you even open your laptop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
