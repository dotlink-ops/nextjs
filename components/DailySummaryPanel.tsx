"use client";

import React, { useEffect, useState } from "react";

type DailySummary = {
  date: string;
  repo: string | null;
  summary_bullets: string[];
  action_items: string[];
  raw_text: string;
  created_at: string;
};

export function DailySummaryPanel() {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/daily-summary");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Failed to fetch /api/daily-summary:", err);
        setError("Could not load daily summary.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <section className="border rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-500">Loading daily summary…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="border rounded-lg p-4 mt-6">
        <p className="text-sm text-red-500">
          {error ?? "No daily summary available."}
        </p>
      </section>
    );
  }

  const { date, repo, summary_bullets, action_items, created_at } = data;

  return (
    <section className="border rounded-lg p-4 mt-6 space-y-3">
      <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h2 className="text-lg font-semibold">Daily Automation Summary</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5">
            {date}
          </span>
          {repo && (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
              {repo}
            </span>
          )}
          <span>updated: {created_at}</span>
        </div>
      </header>

      {summary_bullets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Summary</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {summary_bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {action_items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Actions</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {action_items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
