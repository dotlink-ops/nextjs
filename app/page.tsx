import DemoPreview from "./components/DemoPreview";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-zinc-50 flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-12 p-8">
        {/* HERO */}
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold">Automation that actually ships, not just lives in a doc.</h1>
          <p className="text-lg text-zinc-300 max-w-3xl">
            Turn scattered tools and tribal knowledge into reliable systems. I help teams ship real-world automations — the kind that reduce manual work, clean up handoffs, and free your ops to breathe.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/services"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              View automation services
            </a>
            <a
              href="https://cal.com/avidelta/15min"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              Book a 15-min fit call
            </a>
            <a
              href="/automation"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              View Automation Details
            </a>
            <a
              href="/api/daily-summary"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
            >
              View API Demo
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
          <div>
            {/* Import client component directly; Next handles client boundary */}
            <DemoPreview />
          </div>
        </section>

        {/* UNDER THE HOOD */}
        <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Under the hood: how this actually works</h2>
          <p className="text-zinc-300 mb-6">
            This isn&apos;t just a landing page; it&apos;s wired to a real automation engine.
          </p>
          <ul className="space-y-4 text-zinc-300">
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                A <strong>daily Python runner</strong> (<code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">daily_v2.py</code>) ingests raw notes and project updates from local files.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                The runner uses the <strong>OpenAI API</strong> to turn unstructured text into <strong>structured daily summaries</strong>: key events, decisions, risks, and next actions.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                From those action items, the system can <strong>open or update GitHub issues</strong> with consistent titles, labels, and descriptions.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                All of this runs inside a <strong>managed virtual environment</strong>, with clear entrypoints, logging, and a <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">--demo</code> / <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">--dry-run</code> mode for safe testing.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                The frontend you&apos;re looking at — a <strong>Next.js App Router app</strong> deployed on Vercel at <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">ariadnenexus.com</code> — is the presentation layer that can surface these summaries and workflows for clients, teammates, or investors.
              </span>
            </li>
          </ul>
          <p className="mt-6 text-zinc-400 italic">
            The goal is simple: tighten the loop between <strong>&quot;what happened today&quot;</strong>, <strong>&quot;what needs to be tracked&quot;</strong>, and <strong>&quot;how this looks to stakeholders&quot;</strong> — using real code, not slides.
          </p>
        </section>

        {/* RESOURCES */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-zinc-100">Resources</h2>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-zinc-100">Free Automation Brand Template (Figma)</h3>
            <p className="text-zinc-300">
              A reusable brand + layout system for automation, AI, and systems-focused studios.
            </p>
            <p className="text-zinc-300">Use it to:</p>
            <ul className="space-y-2 text-zinc-300 ml-4">
              <li>• Set up a clean visual identity for your automation practice</li>
              <li>• Reuse layouts for case studies, services, and pricing pages</li>
              <li>• Keep decks, docs, and landing pages visually consistent</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://www.figma.com/community/file/placeholder"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                View the template on Figma
              </a>
              <a
                href="/services"
                className="px-4 py-2 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 hover:bg-zinc-800 transition"
              >
                Work with me to customize it
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Note: `DemoPreview` is a Client Component ("use client") and is
// safely imported into this Server Component. No dynamic import needed.
