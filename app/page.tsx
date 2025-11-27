import Link from "next/link";

const highlights = [
  {
    title: "Strategy sprints",
    description: "Rapid discovery to validate direction, map assumptions, and align leadership on measurable outcomes.",
  },
  {
    title: "Operating systems",
    description: "Design scalable processes and automations that keep teams moving fast without sacrificing quality.",
  },
  {
    title: "Technical stewardship",
    description: "Partner with engineering to de-risk architecture decisions and ensure delivery stays customer-focused.",
  },
];

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <section id="hero" className="flex flex-col gap-8 pt-16 lg:pt-24">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Advisory & Ops Systems</p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Building resilient companies with sharp strategy and operational clarity.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
            Avidelta partners with founders to translate bold ideas into pragmatic execution—connecting business strategy to the technology and systems that make it real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="#contact"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Schedule a call
          </Link>
          <Link
            href="#about"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-900 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-white"
          >
            Learn more
          </Link>
        </div>
      </section>

      <section id="services" className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">What we do</h2>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
            We help teams make confident decisions, ship better software, and stay aligned as they scale.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="grid gap-10 rounded-3xl bg-zinc-50 p-8 shadow-inner dark:bg-zinc-900/50">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Why Avidelta</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Operators who ship</h2>
          <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">
            We combine strategic rigor with hands-on implementation. From leadership workshops to architecture reviews, we ensure every recommendation can be executed by your teams without creating new bottlenecks.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Embedded partnership</h3>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              We work alongside your leaders, participating in standups, reviews, and planning rituals to ensure recommendations fit your operating rhythm.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Systems mindset</h3>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              We map how strategy, people, and technology interact—then instrument the feedback loops that keep teams aligned and accountable.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Let&apos;s talk</h2>
          <p className="text-zinc-600 dark:text-zinc-300">
            Tell us about your goals and we&apos;ll design a focused engagement to move faster.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Email
              <br />
              <Link
                href="mailto:hello@avidelta.com"
                className="font-medium text-black underline underline-offset-4 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-200"
              >
                hello@avidelta.com
              </Link>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Availability
              <br />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Currently accepting new partners.</span>
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Prefer a quick note? Send us a message and we&apos;ll follow up within one business day.
            </p>
            <Link
              href="mailto:hello@avidelta.com?subject=Let%27s%20work%20together"
              className="inline-flex w-fit items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Send an email
            </Link>
          </div>
        </div>
      </section>

      <div id="privacy" className="hidden" aria-hidden="true" />
      <div id="terms" className="hidden" aria-hidden="true" />
    </div>
  );
}
