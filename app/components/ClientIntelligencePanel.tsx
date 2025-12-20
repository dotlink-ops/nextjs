"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Types
interface Client {
  id: string;
  full_name: string;
  company: string;
  stage: "lead" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

interface ClientSummary {
  client_id: string;
  short_summary: string;
  long_summary: string;
  key_insights: string;
  next_actions: string;
  risks: string;
  opportunities: string;
  sentiment: "positive" | "neutral" | "negative";
  priority_score: number;
  updated_at: string;
}

interface KnowledgeItem {
  id: string;
  client_id: string;
  source: string;
  raw_text: string;
  ingested_at: string;
  metadata: any;
}

interface SearchResult {
  chunk_id: string;
  content: string;
  similarity: number;
}

interface ClientIntelligencePanelProps {
  clientId: string;
}

export default function ClientIntelligencePanel({ clientId }: ClientIntelligencePanelProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"search" | "answer">("search");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load client data
  useEffect(() => {
    async function loadClientData() {
      setLoading(true);
      
      // Fetch client
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();
      
      if (clientData) setClient(clientData);

      // Fetch summary
      const { data: summaryData } = await supabase
        .from("client_summaries")
        .select("*")
        .eq("client_id", clientId)
        .single();
      
      if (summaryData) setSummary(summaryData);

      // Fetch knowledge timeline
      const { data: knowledgeData } = await supabase
        .from("knowledge_items")
        .select("*")
        .eq("client_id", clientId)
        .order("ingested_at", { ascending: false })
        .limit(10);
      
      if (knowledgeData) setKnowledgeItems(knowledgeData);

      setLoading(false);
    }

    loadClientData();
  }, [clientId]);

  // Handle search
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchResults([]);
    setAnswer("");

    try {
      if (searchMode === "search") {
        // Semantic search
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            client_id: clientId,
            limit: 5,
          }),
        });

        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        // Answer mode
        const response = await fetch("/api/search/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            client_id: clientId,
            limit: 5,
          }),
        });

        const data = await response.json();
        setAnswer(data.answer || "No answer generated.");
        setSearchResults(data.chunks_used || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading client intelligence...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Client not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 1. CLIENT HEADER */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.full_name}</h1>
            <p className="text-lg text-gray-600 mt-1">Company: {client.company}</p>
            <p className="text-sm text-gray-500 mt-2">
              Status: <span className="font-semibold capitalize">{client.stage}</span>
            </p>
            <p className="text-sm text-gray-500">
              Last Updated: {new Date(summary?.updated_at || client.updated_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {summary?.priority_score || "—"}
              </div>
              <div className="text-xs text-gray-500 uppercase">Priority</div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-semibold uppercase ${
                  summary?.sentiment === "positive"
                    ? "text-green-600"
                    : summary?.sentiment === "negative"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {summary?.sentiment || "—"}
              </div>
              <div className="text-xs text-gray-500 uppercase">Sentiment</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY & INTELLIGENCE OVERVIEW */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Intelligence Overview</h2>
        
        {/* A. Short Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Short Summary</h3>
          <p className="text-gray-700 leading-relaxed">
            {summary?.short_summary || "No summary available yet."}
          </p>
        </div>

        {/* B. Long Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Long Summary</h3>
          <p className="text-gray-700 leading-relaxed">
            {summary?.long_summary || "No detailed summary available yet."}
          </p>
        </div>

        {/* C. Key Insights */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Insights</h3>
          <div className="text-gray-700">
            {summary?.key_insights ? (
              <ul className="list-disc list-inside space-y-1">
                {summary.key_insights.split('\n').filter(line => line.trim()).map((insight, idx) => (
                  <li key={idx}>{insight.replace(/^[•\-\*]\s*/, '')}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No insights available yet.</p>
            )}
          </div>
        </div>

        {/* D, E, F - Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* D. Risks */}
          <div className="bg-red-50 rounded-lg p-5 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 mb-3">🚨 Risks</h3>
            <div className="text-red-800 text-sm">
              {summary?.risks ? (
                <ul className="list-disc list-inside space-y-1">
                  {summary.risks.split('\n').filter(line => line.trim()).map((risk, idx) => (
                    <li key={idx}>{risk.replace(/^[•\-\*]\s*/, '')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-600">No risks identified.</p>
              )}
            </div>
          </div>

          {/* E. Opportunities */}
          <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-green-900 mb-3">💡 Opportunities</h3>
            <div className="text-green-800 text-sm">
              {summary?.opportunities ? (
                <ul className="list-disc list-inside space-y-1">
                  {summary.opportunities.split('\n').filter(line => line.trim()).map((opp, idx) => (
                    <li key={idx}>{opp.replace(/^[•\-\*]\s*/, '')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600">No opportunities identified.</p>
              )}
            </div>
          </div>

          {/* F. AI-Generated Next Actions */}
          <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-blue-900 mb-3">✅ Next Actions</h3>
            <div className="text-blue-800 text-sm">
              {summary?.next_actions ? (
                <ul className="list-disc list-inside space-y-1">
                  {summary.next_actions.split('\n').filter(line => line.trim()).map((action, idx) => (
                    <li key={idx}>{action.replace(/^[•\-\*]\s*/, '')}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-600">No actions recommended.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEMANTIC SEARCH + ANSWER MODE */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Knowledge Search</h2>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search or ask a question..."
              className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setSearchMode("search");
                handleSearch();
              }}
              disabled={searching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              🔍 Search
            </button>
            <button
              onClick={() => {
                setSearchMode("answer");
                handleSearch();
              }}
              disabled={searching}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              💬 Ask Nexus
            </button>
          </div>
          {searching && (
            <div className="mt-3 text-center text-gray-600">
              <span className="inline-block animate-pulse">Processing your request...</span>
            </div>
          )}
        </div>

        {/* SEARCH MODE - Top Matches */}
        {!searching && searchMode === "search" && searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Top Matches:</h3>
            {searchResults.map((result, idx) => (
              <div
                key={result.chunk_id || idx}
                className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-blue-900">
                    {idx + 1}.
                  </span>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold">
                    {(result.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">{result.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* ANSWER MODE - Answer + Supporting Facts + Chunks */}
        {!searching && searchMode === "answer" && answer && (
          <div className="space-y-6">
            {/* Answer Section */}
            <div className="bg-gradient-to-r from-purple-50 to-white border-l-4 border-purple-500 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-purple-900 mb-4">💬 Answer:</h3>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                {answer.split('\n').map((line, idx) => {
                  // Parse confidence score
                  if (line.toLowerCase().includes('confidence')) {
                    const match = line.match(/\d+/);
                    const confidence = match ? parseInt(match[0]) : 0;
                    return (
                      <div key={idx} className="mt-4 pt-4 border-t border-purple-200">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-purple-900">Confidence:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className="font-bold text-purple-900">{confidence}%</span>
                        </div>
                      </div>
                    );
                  }
                  // Parse key facts section
                  if (line.toLowerCase().includes('key facts')) {
                    return (
                      <div key={idx} className="mt-4">
                        <h4 className="font-bold text-purple-900 mb-2">📋 Supporting Facts:</h4>
                      </div>
                    );
                  }
                  // Regular line
                  return <p key={idx} className="mb-2">{line}</p>;
                })}
              </div>
            </div>

            {/* Chunks Used (Collapsible) */}
            {searchResults.length > 0 && (
              <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  📚 Chunks Used ({searchResults.length})
                </summary>
                <div className="mt-4 space-y-3">
                  {searchResults.map((result, idx) => (
                    <div
                      key={result.chunk_id || idx}
                      className="bg-white border border-gray-200 rounded p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">Chunk {idx + 1}</span>
                        <span className="text-xs text-gray-500">
                          {(result.similarity * 100).toFixed(1)}% similarity
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{result.content}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* No Results */}
        {!searching && searchQuery && searchResults.length === 0 && !answer && (
          <div className="text-center py-8 text-gray-500">
            No results found. Try a different query.
          </div>
        )}
      </div>

      {/* 4. KNOWLEDGE TIMELINE */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Knowledge Timeline</h2>
        {knowledgeItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No knowledge items yet. Start ingesting data to see the timeline.
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgeItems.map((item) => {
              const date = new Date(item.ingested_at);
              const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              
              // Extract type from source or metadata
              const type = item.source || 'note';
              
              // Truncate content to 200 characters
              const snippet = item.raw_text.length > 200 
                ? item.raw_text.substring(0, 200) + '...'
                : item.raw_text;
              
              // Extract tags from metadata or generate basic keywords
              const tags = item.metadata?.tags || [];
              const autoTags = tags.length === 0 
                ? item.raw_text.toLowerCase()
                    .split(/\s+/)
                    .filter(word => word.length > 5)
                    .slice(0, 3)
                : tags;
              
              return (
                <div
                  key={item.id}
                  className="border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-white rounded-r-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header: Timestamp + Type */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded">
                        {formattedDate}
                      </span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {type}
                      </span>
                    </div>
                    {item.metadata?.processed && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        ✓ Processed
                      </span>
                    )}
                  </div>
                  
                  {/* Content Snippet */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-3 pl-2 border-l-2 border-gray-200">
                    {snippet}
                  </p>
                  
                  {/* Tags */}
                  {autoTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-semibold">Tags:</span>
                      {autoTags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. INSIGHTS & TASKS MODULE - AI-GENERATED ACTIONS & RISKS */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6">🎯 AI-Generated Insights & Tasks</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Actions */}
          <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Next Actions
            </h3>
            <div className="space-y-3">
              {summary?.next_actions ? (
                summary.next_actions.split('\n').filter(line => line.trim()).map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 group hover:bg-blue-50 p-2 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-800 cursor-pointer flex-1">
                      {action.replace(/^[•\-\*]\s*/, '')}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No actions recommended yet.</p>
              )}
            </div>
          </div>

          {/* Predicted Risks */}
          <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Risks
            </h3>
            <div className="space-y-2">
              {summary?.risks ? (
                summary.risks.split('\n').filter(line => line.trim()).map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 hover:bg-red-50 rounded transition-colors">
                    <span className="text-red-500 font-bold">•</span>
                    <p className="text-sm text-gray-800 flex-1">
                      {risk.replace(/^[•\-\*]\s*/, '')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No risks identified yet.</p>
              )}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Opportunities
            </h3>
            <div className="space-y-2">
              {summary?.opportunities ? (
                summary.opportunities.split('\n').filter(line => line.trim()).map((opp, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 hover:bg-green-50 rounded transition-colors">
                    <span className="text-green-500 font-bold">★</span>
                    <p className="text-sm text-gray-800 flex-1">
                      {opp.replace(/^[•\-\*]\s*/, '')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No opportunities identified yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Priority Shifts & Pattern Changes */}
        {summary && (
          <div className="mt-6 bg-white rounded-lg p-5 shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Priority & Pattern Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-semibold">Current Priority:</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${(summary.priority_score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-purple-900">{summary.priority_score}/10</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-semibold">Sentiment Trend:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  summary.sentiment === 'positive' 
                    ? 'bg-green-100 text-green-800'
                    : summary.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {summary.sentiment === 'positive' && '📈'} 
                  {summary.sentiment === 'negative' && '📉'}
                  {summary.sentiment === 'neutral' && '→'}
                  {' '}{summary.sentiment.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Last updated: {new Date(summary.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
