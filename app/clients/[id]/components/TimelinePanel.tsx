"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function TimelinePanel({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<any[]>([]);

  // Initial fetch
  async function loadItems() {
    const res = await fetch(`/api/clients/${clientId}/timeline`);
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    (async () => {
      await loadItems();
    })();

    // --- Realtime subscription ---
    const channel = supabaseClient
      .channel(`timeline_updates_${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "knowledge_items",
          filter: `client_id=eq.${clientId}`
        },
        async (payload) => {
          console.log("Realtime update:", payload);
          (async () => { await loadItems(); })();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [clientId]);

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Knowledge Timeline</h2>

      {items.map((item, idx) => (
        <div key={idx} className="p-4 bg-white rounded-lg border">
          <p className="text-gray-500 text-sm">{item.created_at}</p>
          <p className="font-semibold">{item.source}</p>
          <p className="text-gray-700 mt-2">{item.snippet}</p>
        </div>
      ))}
    </div>
  );
}
