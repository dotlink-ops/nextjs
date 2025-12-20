import * as ac from './utils/automationContract.js';
import runStep from './utils/stepExecutor.js';
import { createRun } from './utils/runManager.js';

type Step = { name: string; fn: () => Promise<unknown>; allowFailure?: boolean };

/**
 * Run an ordered list of steps with hard boundaries: one step failing does NOT
 * crash the process. Each step executes through `runStep` which standardizes
 * logging and failure handling. A single top-level try/catch is used only for
 * catastrophic failures outside step execution.
 */
export async function runSteps(steps: Step[], runId?: string) {
  const id = runId || ac.startRun();
  let anyStepFailed = false;
  let hadFatalFailure = false;

  try {
    for (const step of steps) {
      const res = await (runStep as unknown as any)({ runId: id, name: step.name, fn: step.fn, allowFailure: !!step.allowFailure });
      if (res.status === 'success') continue;
      anyStepFailed = true;
      if (res.status === 'failed') {
        hadFatalFailure = true;
      }
      // continue to next step regardless; finalization logic below will decide terminal run event
    }

    if (hadFatalFailure) {
      ac.runFailed(id, 'One or more non-allowed steps failed');
      return { status: 'failed', runId: id };
    }

    if (anyStepFailed) {
      ac.runPartial(id, 'One or more allowed-failure steps failed');
      return { status: 'partial', runId: id };
    }

    ac.runSuccess(id, 'All steps completed successfully');
    return { status: 'success', runId: id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ac.runFailed(id, `Catastrophic runner failure: ${message}`, { error: (err as Error)?.stack || null });
    throw err;
  }
}

/**
 * Example entrypoint for CI or manual invocation. Replace the sample steps
 * with your real tasks or import them from worker scripts.
 */
export async function main() {
  // Canonical pipeline stages. Each stage contains named sub-steps.
  const pipelineStages = [
    {
      name: 'trigger',
      steps: [
        {
          name: 'scheduled',
          fn: async () => {
            // placeholder: determine if run should execute (cron, webhook)
          },
          allowFailure: false,
        },
      ],
    },
    {
      name: 'ingest',
      steps: [
        { name: 'notion', fn: async () => { /* fetch from Notion */ }, allowFailure: false },
        { name: 'slack', fn: async () => { /* fetch from Slack */ }, allowFailure: true },
        { name: 'calendar', fn: async () => { /* fetch from Google Calendar */ }, allowFailure: true },
      ],
    },
    {
      name: 'transform',
      steps: [
        { name: 'summarize', fn: async () => { /* summarize documents */ }, allowFailure: false },
        { name: 'classify', fn: async () => { /* classify items */ }, allowFailure: true },
        { name: 'enrich', fn: async () => { /* call enrichment services */ }, allowFailure: true },
      ],
    },
    {
      name: 'output',
      steps: [
        { name: 'notion-update', fn: async () => { /* write back to Notion */ }, allowFailure: false },
        { name: 'slack-post', fn: async () => { /* send Slack message */ }, allowFailure: true },
        { name: 'file-write', fn: async () => { /* persist to file or bucket */ }, allowFailure: true },
      ],
    },
  ];

  // initialize run manager and ensure run_id is consistent across logs/artifacts
  const runMgr = await createRun({ baseDir: 'output' });
  const runId = runMgr.runId;
  ac.startRun(runId);

  // Flatten pipeline stages into Step[] expected by runSteps. Each sub-step
  // name is prefixed with the stage for auditability: e.g. ingest:notion
  const steps: Step[] = [];
  for (const stage of pipelineStages) {
    for (const s of stage.steps) {
      steps.push({
        name: `${stage.name}:${s.name}`,
        fn: s.fn,
        allowFailure: !!s.allowFailure,
      });
    }
  }
  // Enforce graceful-failure rules: certain steps must never be marked
  // allowFailure=true. This prevents misconfiguration that would silently
  // swallow critical failures (trigger, core ingest, finalization).
  function parseStepName(n: string) {
    const parts = String(n).split(':');
    return { stage: parts[0] || null, step: parts.slice(1).join(':') || null };
  }

  const criticalRules = (name: string) => {
    const { stage, step } = parseStepName(name);
    if (stage === 'trigger') return true; // trigger must not fail silently
    if (stage === 'ingest' && step === 'notion') return true; // core ingest
    if (stage === 'output' && step === 'notion-update') return true; // finalization write-back
    if (name === 'lifecycle:run') return true;
    return false;
  };

  for (const s of steps) {
    if (s.allowFailure && criticalRules(s.name)) {
      // misconfiguration: critical step marked as allowFailure
      const msg = `Critical step ${s.name} must not be allowed to fail`; 
      ac.runFailed(runId, msg, { misconfiguration: true });
      // Persist and exit non-zero so CI catches it rather than silently run
      await runMgr.finalize('failed');
      process.exit(5);
    }
  }

  // Always finalize in a finally block so run summary, logs, and final
  // emitted status are persisted even if multiple steps fail or throws occur.
  let overallStatus: 'success' | 'partial' | 'failed' = 'failed';
  try {
    const res = await runSteps(steps, runId);
    overallStatus = res.status === 'success' ? 'success' : res.status === 'partial' ? 'partial' : 'failed';
    if (res.status === 'success') process.exitCode = 0;
    else process.exitCode = res.status === 'partial' ? 2 : 3;
  } catch (err) {
    // catastrophic outside step handling
    overallStatus = 'failed';
    ac.runFailed(runId, `Catastrophic runner failure: ${err instanceof Error ? err.message : String(err)}`, { error: (err as Error)?.stack || null });
    process.exitCode = 4;
  } finally {
    try {
      await runMgr.finalize(overallStatus);
    } catch (e) {
      // If finalization fails, emit a last-ditch log but do not throw
      try { ac.runFailed(runId, `Finalization write failed: ${String(e)}`, { error: (e as Error)?.stack || null }); } catch (ee) {}
    }
    // Use exit code set above
    process.exit(process.exitCode || 0);
  }
}

// If invoked directly from node, run main().
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
