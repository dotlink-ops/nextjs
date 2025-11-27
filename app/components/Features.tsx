import Image from "next/image";

const features = [
  {
    title: "Automate the handoff",
    description:
      "Route signals from product usage, support, and sales into one playbook with smart triggers and ownership rules.",
    icon: "/feature-automation.svg",
  },
  {
    title: "Collaborate in one canvas",
    description:
      "Notes, tasks, and next steps stay synchronized across teams so nothing slips through during onboarding or renewal.",
    icon: "/feature-collaboration.svg",
  },
  {
    title: "Insights without waiting",
    description:
      "Forecast retention, monitor adoption, and surface churn risks in real-time dashboards built for revenue and success teams.",
    icon: "/feature-insights.svg",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="border-y border-slate-100 bg-white py-16 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Capabilities</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Everything teams need to stay in sync</h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            CustomerOS unifies your workflow with automation, visibility, and built-in customer context.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex h-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-sky-500/10">
                <Image src={feature.icon} alt="" width={32} height={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
              <a
                href="#"
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
              >
                Learn more
                <span aria-hidden className="text-base">
                  →
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
