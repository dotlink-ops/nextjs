"use client";

import { useState } from "react";

export default function SearchPanel({ clientId }: { clientId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);

  async function runSearch() {
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query, client_id: clientId }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    setResults(data.results || []);
    setAnswer(null);
  }

  async function runAnswer() {
    const res = await fetch("/api/search/answer", {
      method: "POST",
      body: JSON.stringify({ query, client_id: clientId }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    setAnswer(data.answer);
    setResults(data.chunks_used || []);
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Search & Answer</h2>

      <div className="flex space-x-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question or search…"
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <button onClick={runSearch} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Search</button>
        <button onClick={runAnswer} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Answer</button>
      </div>

      {answer && (
        <div className="p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-2">Answer</h3>
          <p className="text-gray-700 whitespace-pre-line">{answer}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Relevant Chunks</h3>
          {results.map((r: any, idx: number) => (
            <div key={idx} className="p-3 bg-white rounded-lg border text-sm">
              <div className="text-gray-500 mb-1">Similarity: {r.similarity.toFixed(4)}</div>
              <div>{r.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
