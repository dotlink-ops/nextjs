// app/components/DailySummaryPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { DailySummaryResponse } from "@/app/api/types";

type DailySummarySuccess = Extract<DailySummaryResponse, { status: "ok" }>;

export function DailySummaryPanel() {
  const [data, setData] = useState<DailySummarySuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/daily-summary");
        if (!res.ok) throw new Error("Failed to fetch");
        const json: DailySummaryResponse = await res.json();
        if (json.status !== "ok") {
          setError(json.message ?? "Could not load daily summary");
          setData(null);
          return;
        }
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Could not load daily summary");
      }
    }
    load();
  }, []);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!data) {
    return <div className="text-zinc-500 text-sm">Loading daily summary…</div>;
  }

  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">
            Daily Automation Summary
          </h2>
          <p className="text-xs text-zinc-500">
            {data.date} · {data.repo}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
          Auto-generated
        </span>
      </header>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase text-zinc-500">
          Highlights
        </h3>
        <ul className="list-disc pl-5 text-sm text-zinc-800">
          {data.summary_bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase text-zinc-500">
          Action Items
        </h3>
        <ul className="list-disc pl-5 text-sm text-zinc-800">
          {data.action_items.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
