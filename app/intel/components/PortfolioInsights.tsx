"use client";

import { useEffect, useState } from "react";

export default function PortfolioInsights() {
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    async function loadInsights() {
      const res = await fetch("/api/intel/portfolio");
      const data = await res.json();
      setInsights(data);
    }
    loadInsights();
  }, []);

  if (!insights) {
    return <div className="p-4 bg-gray-100 border rounded-lg">Loading portfolio insights…</div>;
  }

  return (
    <div className="p-6 bg-white border rounded-xl space-y-6">
      <h2 className="text-2xl font-bold">Portfolio Intelligence</h2>

      <Section title="Cross-Client Opportunities" items={insights.cross_client_opportunities} />
      <Section title="Common Risks" items={insights.common_risks} />
      <Section title="Sector-Level Patterns" items={insights.sector_patterns} />
      <Section title="Upcoming Bottlenecks" items={insights.bottlenecks} />
      <Section title="Strategic Recommendations" items={insights.strategic_recommendations} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <ul className="list-disc pl-6 space-y-1 text-gray-700">
        {items.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
