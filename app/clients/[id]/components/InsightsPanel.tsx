"use client";

import { useEffect, useState } from "react";

export default function InsightsPanel({ clientId }: { clientId: string }) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function loadSummary() {
      const res = await fetch(`/api/clients/${clientId}/summary`);
      const data = await res.json();
      setSummary(data);
    }
    loadSummary();
  }, [clientId]);

  if (!summary) return null;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Insights & Next Actions</h2>

      <div>
        <h3 className="font-semibold">Next Actions</h3>
        <ul className="list-disc pl-4">
          {summary.next_actions?.split("\n").map((a: string, idx: number) => (
            <li key={idx}>{a}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Risks</h3>
        <ul className="list-disc pl-4">
          {summary.risks?.split("\n").map((a: string, idx: number) => (
            <li key={idx}>{a}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Opportunities</h3>
        <ul className="list-disc pl-4">
          {summary.opportunities?.split("\n").map((a: string, idx: number) => (
            <li key={idx}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
