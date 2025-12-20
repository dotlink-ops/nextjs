'use client';

import { useEffect, useState } from 'react';

type AutomationStatus = {
  lastRunTime: string;
  lastRunStatus: 'success' | 'warning' | 'failed' | 'unknown';
  recentRuns?: Array<'success' | 'warning' | 'failed'>;
  runId?: number;
  conclusion?: string | null;
  updatedAt?: string;
};

type UseAutomationStatusOptions = {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
};

export function useAutomationStatus(options: UseAutomationStatusOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options; // Default: refresh every 60s
  
  const [status, setStatus] = useState<AutomationStatus>({
    lastRunTime: '5:00 AM PT (scheduled)',
    lastRunStatus: 'unknown',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/automation-status');
        
        if (!response.ok) {
          throw new Error('Failed to fetch automation status');
        }
        
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching automation status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchStatus();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchStatus, refreshInterval);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, [refreshInterval, enabled]);
  
  return { status, isLoading, error };
}
