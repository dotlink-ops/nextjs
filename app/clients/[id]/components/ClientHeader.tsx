"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function ClientHeader({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const cRes = await fetch(`/api/clients/${clientId}`);
      const c = await cRes.json();
      const sRes = await fetch(`/api/clients/${clientId}/summary`);
      const s = await sRes.json();
      setClient(c);
      setSummary(s);
    }

    load();

    const channel = supabaseClient
      .channel(`header_updates_${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client_summaries",
          filter: `client_id=eq.${clientId}`
        },
        load
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [clientId]);

  if (!client || !summary) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 rounded-xl border border-gray-200">
      <h1 className="text-3xl font-bold">{client.full_name}</h1>
      <p className="text-gray-600">{client.company}</p>

      <div className="flex items-center space-x-10 mt-4">
        <p className="text-gray-800">Priority: <span className="font-semibold">{summary.priority_score}</span></p>
        <p className="text-gray-800">Sentiment: <span className="font-semibold">{summary.sentiment}</span></p>
        <p className="text-gray-500 text-sm">Last Updated: {summary.last_updated}</p>
      </div>
    </div>
  );
}
