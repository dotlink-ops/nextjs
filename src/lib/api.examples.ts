/**
 * Example usage of the secure API wrapper
 * Demonstrates how to use the api client in components
 */

import { api, type ApiError } from '@/src/lib/api';
import type { ClientSummary, ForecastEntry } from '@/types';

/**
 * Example: Fetch client summary with error handling
 */
export async function fetchClientSummary(clientId: string): Promise<ClientSummary | null> {
  try {
    const summary = await api.get<ClientSummary>(`/api/clients/${clientId}/summary`);
    return summary;
  } catch (error) {
    const apiError = error as ApiError;
    
    // Handle 401 - auto-redirects to login
    if (apiError.status === 401) {
      // Already handled by api wrapper
      return null;
    }
    
    // Handle other errors
    console.error('Failed to fetch client summary:', apiError.message);
    return null;
  }
}

/**
 * Example: Fetch forecast data
 */
export async function fetchForecast(): Promise<ForecastEntry[]> {
  try {
    const response = await api.get<{ workload_forecast: ForecastEntry[] }>('/api/intel/forecast');
    return response.workload_forecast || [];
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Failed to fetch forecast:', apiError.message);
    return [];
  }
}

/**
 * Example: Post data with error handling
 */
export async function ingestKnowledge(data: {
  client_id: string;
  source: string;
  text: string;
  metadata?: Record<string, any>;
}) {
  try {
    const result = await api.post('/api/knowledge/ingest', data);
    return { success: true, data: result };
  } catch (error) {
    const apiError = error as ApiError;
    return { success: false, error: apiError.message };
  }
}

/**
 * Example: React component usage
 */
/*
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import type { ClientSummary } from '@/types';

export function ClientDashboard({ clientId }: { clientId: string }) {
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.get<ClientSummary>(`/api/clients/${clientId}/summary`);
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [clientId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!summary) return <div>No data</div>;

  return (
    <div>
      <h1>{summary.summary_text}</h1>
      <p>Sentiment: {summary.sentiment}</p>
    </div>
  );
}
*/
