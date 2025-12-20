"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function SummaryPanel({ clientId }: { clientId: string }) {
  const [summary, setSummary] = useState<any>(null);

  async function loadSummary() {
    const res = await fetch(`/api/clients/${clientId}/summary`);
    const data = await res.json();
    setSummary(data);
  }

  useEffect(() => {
    loadSummary();

    const channel = supabaseClient
      .channel(`summary_updates_${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client_summaries",
          filter: `client_id=eq.${clientId}`
        },
        () => {
          console.log("Realtime summary update");
          loadSummary();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [clientId]);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Summary</h2>
      <p>{summary.short_summary}</p>
      <div className="text-gray-700 whitespace-pre-line">{summary.long_summary}</div>
    </div>
  );
}
