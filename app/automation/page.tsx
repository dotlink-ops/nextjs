// app/automation/page.tsx

import Link from "next/link";

export default function AutomationPage() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-12 lg:px-24 bg-black text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero */}
        <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Ariadne Nexus — Automation Portfolio
          </h1>
          <p className="text-xl text-zinc-300 max-w-3xl">
            Automation-first workflows for founders and operators — from daily Python
            runners to investor-ready dashboards, all wired into a real codebase at{" "}
            <span className="font-medium text-blue-400">ariadnenexus.com</span>.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Back to Home
            </Link>
            <a
              href="/api/daily-summary"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              View Live API
            </a>
            <a
              href="https://github.com/dotlink-ops/Avidelta"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              View on GitHub
            </a>
          </div>
        </header>

        {/* Key Metrics */}
        <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">~30 min</div>
            <div className="text-sm text-zinc-400 mt-1">Saved per day</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">&lt;5 sec</div>
            <div className="text-sm text-zinc-400 mt-1">Execution time</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">10+</div>
            <div className="text-sm text-zinc-400 mt-1">API endpoints</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">100%</div>
            <div className="text-sm text-zinc-400 mt-1">Documented</div>
          </div>
        </section>

        {/* Under the Hood + Side Card */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Under the hood</h2>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                DAILY AUTOMATION · OPENAI · GITHUB · NEXT.JS
              </p>
            </div>

            <p className="text-base leading-relaxed text-zinc-300">
              This isn&apos;t just a landing page. Behind Ariadne Nexus is a real
              automation engine designed to tighten the loop between{" "}
              <span className="font-medium text-zinc-100">&quot;what happened today&quot;</span>,{" "}
              <span className="font-medium text-zinc-100">&quot;what needs to be tracked&quot;</span>, and{" "}
              <span className="font-medium text-zinc-100">&quot;how it looks to stakeholders&quot;</span>.
            </p>

            <ul className="space-y-4 text-zinc-300">
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  <span className="font-medium text-zinc-100">Daily Python runner:</span> a script
                  (<code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">daily_v2.py</code>) that ingests raw notes and project updates from local
                  files.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  <span className="font-medium text-zinc-100">AI-generated summaries:</span> the
                  runner calls the OpenAI API to turn unstructured text into structured
                  daily summaries: key events, decisions, risks, and next actions.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  <span className="font-medium text-zinc-100">Issue tracking:</span> action items can
                  be turned into GitHub issues with consistent titles, labels, and
                  descriptions, keeping work traceable.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  <span className="font-medium text-zinc-100">Safe modes:</span>{" "}
                  <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">--demo</code> and{" "}
                  <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">--dry-run</code> flags allow you to exercise the workflow without real
                  API calls or external side effects.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  <span className="font-medium text-zinc-100">Frontend layer:</span> this Next.js App
                  Router app, deployed on Vercel at{" "}
                  <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">ariadnenexus.com</code>, is the presentation layer that surfaces summaries and
                  workflows for clients, teammates, or investors.
                </span>
              </li>
            </ul>
          </div>

          {/* Side card – "What this shows" */}
          <aside className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-lg font-semibold">What this project demonstrates</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Designing a one-command daily automation workflow</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Integrating OpenAI with GitHub for issue creation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Keeping automation code production-ready and documented</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Shipping a live Next.js frontend on a custom domain</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Making the whole stack AI-assistant friendly</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">Python 3.11</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">OpenAI</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">GitHub API</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">Next.js 16</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">React 19</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">TypeScript</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded">Vercel</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Workflow Diagram */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Data Flow</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <div className="bg-zinc-800 rounded-lg p-4 flex-1">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Notes</div>
              <div className="text-xs text-zinc-400">output/notes/*.md</div>
            </div>
            <div className="text-zinc-600 text-2xl md:rotate-0 rotate-90">→</div>
            <div className="bg-zinc-800 rounded-lg p-4 flex-1">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium">daily_v2.py</div>
              <div className="text-xs text-zinc-400">Python + OpenAI</div>
            </div>
            <div className="text-zinc-600 text-2xl md:rotate-0 rotate-90">→</div>
            <div className="bg-zinc-800 rounded-lg p-4 flex-1">
              <div className="text-2xl mb-2">💾</div>
              <div className="font-medium">JSON Output</div>
              <div className="text-xs text-zinc-400">daily_summary.json</div>
            </div>
            <div className="text-zinc-600 text-2xl md:rotate-0 rotate-90">→</div>
            <div className="bg-zinc-800 rounded-lg p-4 flex-1">
              <div className="text-2xl mb-2">🌐</div>
              <div className="font-medium">API / Dashboard</div>
              <div className="text-xs text-zinc-400">Next.js + Vercel</div>
            </div>
          </div>
        </section>

        {/* Resources & Documentation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Resources & Documentation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="https://github.com/dotlink-ops/Avidelta/blob/main/README.md"
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group"
            >
              <h3 className="font-semibold group-hover:text-blue-400 transition">📖 README</h3>
              <p className="text-sm text-zinc-400 mt-1">Complete project overview and quick start guide</p>
            </a>
            <a
              href="https://github.com/dotlink-ops/Avidelta/blob/main/AUTOMATION_GUIDE.md"
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group"
            >
              <h3 className="font-semibold group-hover:text-blue-400 transition">⚙️ Automation Guide</h3>
              <p className="text-sm text-zinc-400 mt-1">Detailed automation stack documentation</p>
            </a>
            <a
              href="https://github.com/dotlink-ops/Avidelta/blob/main/INVESTOR_SUMMARY.md"
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group"
            >
              <h3 className="font-semibold group-hover:text-blue-400 transition">💼 Investor Summary</h3>
              <p className="text-sm text-zinc-400 mt-1">Business value and technical overview for stakeholders</p>
            </a>
            <a
              href="https://github.com/dotlink-ops/Avidelta/blob/main/QUICKSTART.md"
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group"
            >
              <h3 className="font-semibold group-hover:text-blue-400 transition">🚀 Quick Start</h3>
              <p className="text-sm text-zinc-400 mt-1">Get up and running in under 5 minutes</p>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 rounded-xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Want to see this in action?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Book a 15-minute call to walk through the automation stack, discuss your workflows, and see how this framework could be adapted for your needs.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <a
              href="https://cal.com/avidelta/15min"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Book a 15-min Call
            </a>
            <Link
              href="/services"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition"
            >
              View Services & Pricing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
