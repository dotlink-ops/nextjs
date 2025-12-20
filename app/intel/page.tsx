"use client";

import { useEffect, useState } from "react";
import PortfolioInsights from "./components/PortfolioInsights";

export default function IntelliDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any[]>([]);
  const [priority, setPriority] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const [overviewRes, topicsRes, sentimentRes, priorityRes] = await Promise.all([
        fetch("/api/intel/overview"),
        fetch("/api/intel/topics"),
        fetch("/api/intel/sentiment"),
        fetch("/api/intel/priority")
      ]);
      
      const [overview, topicsData, sentimentData, priorityData] = await Promise.all([
        overviewRes.json(),
        topicsRes.json(),
        sentimentRes.json(),
        priorityRes.json()
      ]);
      
      setClients(overview.clients);
      setTopics(topicsData.topics);
      setSentiment(sentimentData.sentiment);
      setPriority(priorityData.priority);
    }
    loadData();
  }, []);

  return (
    <div className="px-10 py-12 space-y-10">
      <h1 className="text-3xl font-bold">Nexus Intelligence — Multi-Client Overview</h1>

      {/* AI-Powered Portfolio Insights */}
      <PortfolioInsights />

      {/* Client Overview Table */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Client Overview</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Priority</th>
              <th>Sentiment</th>
              <th>Knowledge</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, idx) => (
              <tr key={idx} className="border-t">
                <td>{c.full_name}</td>
                <td>{c.company}</td>
                <td>{c.priority_score}</td>
                <td>{c.sentiment}</td>
                <td>{c.knowledge_count}</td>
                <td>{c.last_activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Topic Trends */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Trending Topics (Global)</h2>
        <ul className="list-disc pl-6">
          {topics.map((t, idx) => (
            <li key={idx}>
              {t.word} — <span className="text-gray-600">{t.frequency} mentions</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Sentiment Rollup */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Sentiment Distribution</h2>
        <ul>
          {sentiment.map((s, idx) => (
            <li key={idx}>
              {s.sentiment}: {s.count}
            </li>
          ))}
        </ul>
      </section>

      {/* Priority Heatmap */}
      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Priority Distribution</h2>
        <ul>
          {priority.map((p, idx) => (
            <li key={idx}>
              Priority {p.priority_score}: {p.count}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
