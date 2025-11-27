'use client';

import { useState, FormEvent } from 'react';

export function CTA() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get('email'),
      teamSize: formData.get('team-size'),
      context: formData.get('context'),
    };

    // Simulate form submission (replace with actual API call)
    console.log('Demo request submitted:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  return (
    <section
      id="cta"
      className="relative overflow-hidden border-y border-slate-100 bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 py-16 text-white dark:border-slate-800"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%)]" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4 lg:max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">Get ahead</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">See CustomerOS in action</h2>
          <p className="text-base text-white/90">
            Share a few details and our team will tailor a workspace to your onboarding, renewal, or expansion workflows.
          </p>
        </div>
        {isSubmitted ? (
          <div className="flex flex-col gap-4 rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="text-center">
              <p className="text-lg font-semibold">Thank you!</p>
              <p className="mt-2 text-sm text-white/90">
                We&apos;ve received your request and will be in touch within one business day.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col text-sm font-semibold text-white">
                Work email
                <input
                  className="mt-1 rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                  type="email"
                  name="email"
                  placeholder="alex@company.com"
                  required
                />
              </label>
              <label className="flex flex-col text-sm font-semibold text-white">
                Team size
                <select
                  className="mt-1 rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-white focus:border-white focus:outline-none"
                  defaultValue="10-50"
                  name="team-size"
                >
                  <option className="text-slate-900">1-10</option>
                  <option className="text-slate-900">10-50</option>
                  <option className="text-slate-900">50-200</option>
                  <option className="text-slate-900">200+</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col text-sm font-semibold text-white">
              What are you solving?
              <textarea
                className="mt-1 h-24 rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-white placeholder:text-white/70 focus:border-white focus:outline-none"
                name="context"
                placeholder="Onboarding, renewal, churn signals..."
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request my demo'}
              </button>
              <p className="text-xs text-white/80">We respond in under one business day.</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
