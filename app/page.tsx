import DemoPreview from "./components/DemoPreview";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-zinc-50 flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-12 p-8">
        {/* HERO */}
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold">Automation, Systems & AI for Lean Teams</h1>
          <p className="text-zinc-400 max-w-2xl">
            I design and ship one-command automations, AI-powered workflows, and
            clean developer environments that turn scattered tools into a repeatable,
            documented system.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/api/daily-summary"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-zinc-50 text-black rounded-lg font-medium hover:bg-zinc-200 transition"
            >
              View API Demo
            </a>
            <a
              href="https://cal.com/avidelta/15min"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Book a 15-min Fit Call
            </a>
            <a
              href="#demo"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              View Live Demo
            </a>
            <a
              href="https://github.com/dotlink-ops/nextjs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              View on GitHub
            </a>
          </div>
        </header>

        {/* SELECTED AUTOMATIONS */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Selected Automations</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <article className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold">Automation Spine: Daily Runner + AI Issue Flow</h3>
              <p className="mt-2 text-zinc-400">
                One-command automation that runs in a managed virtual environment, pulls the latest notes, and uses
                OpenAI to generate and triage GitHub issues. Designed as a reusable template for turning messy daily
                workflows into a predictable, logged system.
              </p>
              <ul className="mt-4 space-y-2 text-zinc-300 list-disc list-inside">
                <li>Single entrypoint for the full daily workflow</li>
                <li>OpenAI-generated GitHub issues with titles, descriptions, and labels</li>
                <li>Repo hardened for sharing with clients, collaborators, and investors</li>
              </ul>
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3">Stack & Flow</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li><span className="text-zinc-300 font-medium">Stack:</span> Python 3.11, OpenAI API, GitHub REST API, Next.js (landing)</li>
                  <li><span className="text-zinc-300 font-medium">Trigger:</span> Cron / manual invocation → <code className="text-xs bg-zinc-800 px-1 py-0.5 rounded">./run-daily.sh</code></li>
                  <li><span className="text-zinc-300 font-medium">Output:</span> JSON summary, triaged GitHub issues, sanitized logs</li>
                </ul>
              </div>
            </article>

            {/* Placeholder for other cards - keep layout consistent */}
            <article className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold">Environment & DevOps Setup</h3>
              <p className="mt-2 text-zinc-400">Reproducible virtual environments, secrets management, and repo structure for reliable delivery.</p>
            </article>
          </div>
        </section>

        {/* DEMO PREVIEW */}
        <section id="demo">
          <h2 className="text-2xl font-semibold mb-4">Live Demo & API</h2>
          <p className="text-zinc-400 mb-4 max-w-2xl">
            Test the automation outputs and API endpoints. All responses are live JSON from this deployment.
          </p>
          {/* Quick ops link to aggregated API status (kept API-only) */}
          <div className="mb-4 flex flex-wrap gap-2">
            <a
              href="/api/status"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 bg-transparent border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800 transition"
            >
              /api/status
            </a>
            <a
              href="/api/daily-summary"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 bg-transparent border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800 transition"
            >
              /api/daily-summary
            </a>
            <a
              href="/api/demo/view"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 bg-transparent border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800 transition"
            >
              /api/demo/view
            </a>
          </div>
          {/* DemoPreview is a client component that fetches /api/demo */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <div>
            {/* Import client component directly; Next handles client boundary */}
            <DemoPreview />
          </div>
        </section>
      </div>
    </main>
  );
}

// Note: `DemoPreview` is a Client Component ("use client") and is
// safely imported into this Server Component. No dynamic import needed.
