// app/services/page.tsx

import Link from "next/link";

export default function ServicesPage() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-12 lg:px-24 bg-black text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero */}
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Automation Services & Pricing
          </h1>
          <p className="text-xl text-zinc-300 max-w-3xl">
            From “everything lives in someone’s head” to “it just happens.”
          </p>
          <p className="text-lg text-zinc-400 max-w-3xl">
            These offers are for teams who want fewer manual tasks, cleaner handoffs, and automations that actually ship — not just live in a whiteboard.
          </p>
        </header>

        {/* 1. Hourly Rate */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">1️⃣ Hourly “Lab Rate” – nexus-core Automation Studio</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-400">$145</span>
              <span className="text-xl text-zinc-400">/hour</span>
            </div>
            <p className="text-zinc-400">
              Strategy, build, and troubleshooting for automation systems.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Minimums</h3>
              <ul className="space-y-1 text-zinc-300">
                <li>• 1-hour minimum for remote work</li>
                <li>• 3-hour minimum for on-site / live working sessions</li>
                <li>• Billed in 15-minute increments after the first hour</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What&apos;s included</h3>
              <ul className="space-y-1 text-zinc-300">
                <li>• Design and implementation of workflows (Zapier, Make, n8n, custom scripts, OpenAI, etc.)</li>
                <li>• Systems mapping and architecture (how tools and data should connect)</li>
                <li>• Debugging and optimization of existing automations</li>
                <li>• Light documentation as we go (inline notes + quick Looms)</li>
                <li>• Rush / same-day start: +30% (subject to availability)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Fixed-Scope Packages */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">2️⃣ Fixed-Scope Packages – “Automation Sprints”</h2>
            <p className="text-zinc-400">
              Ideal when you want a clear outcome, clear scope, and clear price.
            </p>
          </div>

          {/* Package 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Automation Starter Sprint</h3>
                <p className="text-zinc-400 mt-1">Best for teams who need their first serious automation set up around a single workflow.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">$1,750</div>
                <div className="text-sm text-zinc-400 mt-1">~1–2 weeks</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Deliverables</h4>
              <ul className="space-y-1 text-zinc-300 text-sm">
                <li>• 1 core workflow automated (e.g., lead → CRM → email → Slack/Teams)</li>
                <li>• Up to 3 tool integrations (e.g., Shopify, HubSpot, Airtable, Gmail, Slack, etc.)</li>
                <li>• Basic error handling (alerts when something breaks)</li>
                <li>• 1-page visual workflow map (PDF)</li>
                <li>• 1 Loom walkthrough video (5–10 minutes)</li>
                <li>• 7 days of post-launch bug fixes (minor tweaks only)</li>
              </ul>
            </div>
          </div>

          {/* Package 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Ops Control Tower</h3>
                <p className="text-zinc-400 mt-1">Best for e-commerce or service businesses that want front-to-back visibility and fewer manual tasks across sales and ops.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">$3,500</div>
                <div className="text-sm text-zinc-400 mt-1">~3–4 weeks</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Deliverables</h4>
              <ul className="space-y-1 text-zinc-300 text-sm">
                <li>• Up to 3 core workflows automated (e.g., order intake, customer notifications, internal task creation)</li>
                <li>• Up to 6 tool integrations</li>
                <li>• Centralized “Ops Dashboard” (Notion, Airtable, or Sheets) to monitor key automations</li>
                <li>• Robust logging & error alerts (email/Slack notifications when something fails)</li>
                <li>• SOPs: 3–5 short written SOPs for “How to use / reset / hand over”</li>
                <li>• 2 Loom trainings for the internal team</li>
                <li>• 14 days of post-launch bug fixes and minor adjustments</li>
              </ul>
            </div>
          </div>

          {/* Package 3 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold">AI Co-Pilot Build</h3>
                <p className="text-zinc-400 mt-1">Best for teams who want an AI-enhanced workflow (summarization, routing, drafting, or decision support) on top of their existing tools.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">$6,500+</div>
                <div className="text-sm text-zinc-400 mt-1">~4–6 weeks</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Deliverables</h4>
              <ul className="space-y-1 text-zinc-300 text-sm">
                <li>• Strategy workshop (60–90 minutes) to identify 1–2 high-ROI AI use cases</li>
                <li>• Design & build of 1 AI-powered co-pilot (examples: daily ops summary bot, customer support draft assistant, analytics explainer, etc.)</li>
                <li>• Integration with existing stack (CRM, helpdesk, project management tools, etc.)</li>
                <li>• Guardrails for safety and consistency (prompt design, role definitions, fallback workflows)</li>
                <li>• Documentation: prompt library, admin notes, and reset/recovery steps</li>
                <li>• 30 days of post-launch optimization (light tuning + prompt iterations)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Monthly Retainers */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">3️⃣ Monthly Retainers – Automation + Monitoring + Tweaks</h2>
            <p className="text-zinc-400">
              For clients who don&apos;t want to think about their automations day-to-day. You own the systems; nexus-core keeps them alive and evolving.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Tier 1 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">nexus-core Care</h3>
                <div className="text-2xl font-bold text-blue-400 mt-2">$1,500/month</div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Includes</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• Up to 8 hours / month of automation work</li>
                  <li>• Monitoring of existing workflows</li>
                  <li>• 1 monthly check-in call (30 min)</li>
                  <li>• Email/Slack support (next business day)</li>
                </ul>
              </div>

              <p className="text-xs text-zinc-400 italic pt-2 border-t border-zinc-800">
                Best for smaller teams with a few critical automations who want a safety net and occasional tweaks.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="bg-zinc-900 border-2 border-blue-500 rounded-xl p-6 space-y-4 relative">
              <div className="absolute top-0 right-4 -translate-y-1/2">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">nexus-core Growth · <span className="text-zinc-400 font-normal italic">Most Popular</span></h3>
                <div className="text-2xl font-bold text-blue-400 mt-2">$3,250/month</div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Includes</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• Up to 20 hours / month of automation work</li>
                  <li>• Proactive monitoring and optimization</li>
                  <li>• Up to 1 new minor workflow per month</li>
                  <li>• 2 strategy calls per month (30–45 min)</li>
                  <li>• Priority support (same-day responses)</li>
                </ul>
              </div>

              <p className="text-xs text-zinc-400 italic pt-2 border-t border-zinc-800">
                Best for growing e-comm / service businesses where automation is now a core part of the operating system.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">nexus-core Partner</h3>
                <div className="text-2xl font-bold text-blue-400 mt-2">$6,500+/month</div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Includes</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• 40+ hours / month of automation + strategy</li>
                  <li>• Dedicated automation roadmap aligned with KPIs</li>
                  <li>• Continuous build-and-improve cycles</li>
                  <li>• Weekly check-ins with leadership</li>
                  <li>• Priority support with faster SLAs</li>
                </ul>
              </div>

              <p className="text-xs text-zinc-400 italic pt-2 border-t border-zinc-800">
                Best for teams treating nexus-core as a fractional Head of Automation + build team.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 rounded-xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Ready to automate?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Book a 15-minute fit call to walk through your current workflows, rough pain points, and what “done” looks like. We’ll decide together whether hourly, a sprint, or a retainer makes the most sense.
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
              href="/"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition"
            >
              Back to Home
            </Link>
          </div>
        </section>

        {/* Automation Stack */}
        <section className="border-t border-zinc-800 pt-12 space-y-4">
          <h2 className="text-2xl font-semibold">Automation stack behind this site</h2>
          <p className="text-zinc-400 max-w-3xl">
            Under the hood, this site runs on the same kind of system I build for clients:
          </p>
          <ul className="space-y-2 text-zinc-300 max-w-3xl">
            <li>• A daily Python runner (<code className="text-blue-400">daily_v2.py</code>) that ingests notes</li>
            <li>• OpenAI-powered summarization to turn raw text into structured updates</li>
            <li>• Optional GitHub issue creation for action items</li>
            <li>• A Next.js frontend on Vercel (ariadnenexus.com) as the presentation layer</li>
          </ul>
          <p className="text-zinc-400 max-w-3xl">
            What you’re reading here is the “front-of-house” view of the same automation engine I’d deploy inside your business.
          </p>
        </section>
      </div>
    </main>
  );
}
