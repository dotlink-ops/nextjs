import Image from "next/image";

const testimonials = [
  {
    name: "Alex Romero",
    title: "VP of Customer Success, Merge",
    quote:
      "We replaced three tools with CustomerOS. Our CSMs see product signals, support tickets, and expansion plays in one view so they can act instantly.",
    avatar: "/avatar-alex.svg",
  },
  {
    name: "Priya Desai",
    title: "Head of RevOps, Launchpad",
    quote:
      "Handoffs from sales to onboarding are now automated. Playbooks keep every stakeholder on track, and leadership finally trusts the data.",
    avatar: "/avatar-priya.svg",
  },
  {
    name: "Jordan Lee",
    title: "Director of Support, Northwind",
    quote:
      "Response times are down 42% because signals route to the right owner. We can see sentiment trends before they become churn risks.",
    avatar: "/avatar-jordan.svg",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-gradient-to-b from-slate-50 via-white to-white py-16 text-slate-900 dark:from-black dark:via-slate-950 dark:to-slate-950 dark:text-white"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Proof</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Teams ship better experiences with CustomerOS</h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Real operators sharing how automation and shared context elevate every touchpoint.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex h-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="rounded-full" />
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">“{testimonial.quote}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
