'use client';

import { useAutomationStatus } from '@/app/hooks/useAutomationStatus';
import UnderTheHood from './UnderTheHood';

type UnderTheHoodLiveProps = {
  actionsUrl?: string;
  notionDailyOpsUrl?: string;
};

/**
 * Client wrapper for UnderTheHood that fetches live automation status
 * from the GitHub Actions API via our /api/automation-status endpoint.
 */
export default function UnderTheHoodLive({
  actionsUrl,
  notionDailyOpsUrl,
}: UnderTheHoodLiveProps) {
  const { status, isLoading, error } = useAutomationStatus({
    refreshInterval: 60000, // Refresh every 60 seconds
    enabled: true,
  });
  
  // Determine display values based on loading/error/data states
  let displayTime: string;
  let displayStatus: 'success' | 'warning' | 'failed';
  
  if (isLoading) {
    displayTime = 'Loading…';
    displayStatus = 'warning';
  } else if (error) {
    displayTime = 'Unknown';
    displayStatus = 'warning';
  } else if (status.lastRunStatus === 'unknown') {
    displayTime = 'Waiting for first run';
    displayStatus = 'warning';
  } else {
    displayTime = status.lastRunTime;
    displayStatus = status.lastRunStatus;
  }
  
  return (
    <UnderTheHood
      lastRunTime={displayTime}
      lastRunStatus={displayStatus}
      recentRuns={status.recentRuns || []}
      actionsUrl={actionsUrl}
      notionDailyOpsUrl={notionDailyOpsUrl}
    />
  );
}
