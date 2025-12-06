"use client";

import { useEffect, useState } from "react";
import type { DemoResponse } from "@/app/api/types";

type DemoData = {
  summary: string;
  log: string;
};

export default function DemoPreview() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json: DemoResponse = await res.json();
      if (json.status !== "ok") {
        setError(json.message ?? json.error ?? "Failed to fetch demo outputs");
        setData(null);
        return;
      }
      setData({ summary: json.summary, log: json.log });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch demo outputs";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDemo();
  }, []);

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-zinc-300 mb-2">Live Demo Preview</h4>
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-zinc-400">Sanitized sample outputs from the demo API</div>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-200 hover:bg-zinc-700"
              onClick={() => fetchDemo()}
            >
              Refresh
            </button>
            <a
              className="text-xs px-2 py-1 bg-transparent border border-zinc-700 rounded text-zinc-200 hover:bg-zinc-800"
              href="/api/demo/view"
              target="_blank"
              rel="noreferrer"
            >
              View Full
            </a>
          </div>
        </div>

        {loading && <div className="text-sm text-zinc-400">Loading...</div>}
        {error && <div className="text-sm text-rose-400">Error: {error}</div>}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Summary</div>
              <pre className="whitespace-pre-wrap text-sm text-zinc-200 bg-zinc-950 p-3 rounded">{data.summary}</pre>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Issue Pipeline Log</div>
              <pre className="whitespace-pre-wrap text-sm text-zinc-200 bg-zinc-950 p-3 rounded">{data.log}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
