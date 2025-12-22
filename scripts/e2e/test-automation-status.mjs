import http from 'http';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import assert from 'assert/strict';

function makeHandler(runFile) {
  return async function handler(req, res) {
    try {
      if (!existsSync(runFile)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'unknown', message: 'No run.json found. Automation may not have executed yet.' }));
        return;
      }

      const raw = await fs.readFile(runFile, 'utf-8');
      const data = JSON.parse(raw);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, automation: data }));
    } catch (err) {
      console.error('Failed to read automation status:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Failed to read automation status' }));
    }
  };
}

async function run() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'avidelta-e2e-'));
  const runFile = path.join(tmp, 'run.json');

  // Valid run.json
  const valid = {
    run_id: '20251215T093012',
    started_at: '2025-12-15T09:30:12Z',
    ended_at: '2025-12-15T09:30:44Z',
    duration_sec: 32.1,
    status: 'partial',
    demo_mode: false,
    steps: [
      { stage: 'ingest', step: 'load-notes', status: 'success' },
      { stage: 'transform', step: 'generate-summary', status: 'failure' }
    ],
    artifacts: { daily_summary: 'output/daily_summary.json' }
  };

  await fs.writeFile(runFile, JSON.stringify(valid, null, 2), 'utf-8');

  const server = http.createServer(makeHandler(runFile));
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const base = `http://127.0.0.1:${port}`;

  // Helper fetch
  async function get(pathname = '/') {
    const resp = await fetch(base + pathname);
    const body = await resp.json();
    return { status: resp.status, body };
  }

  // Case 1: valid
  const r1 = await get('/');
  assert.equal(r1.status, 200);
  assert.equal(r1.body.ok, true);
  assert.equal(r1.body.automation.run_id, valid.run_id);

  // Case 2: malformed JSON -> 500
  await fs.writeFile(runFile, '{ invalid json', 'utf-8');
  const r2 = await get('/');
  assert.equal(r2.status, 500);
  assert.equal(r2.body.ok, false);

  // Case 3: missing file -> 404
  await fs.unlink(runFile);
  const r3 = await get('/');
  assert.equal(r3.status, 404);
  assert.equal(r3.body.status, 'unknown');

  server.close();
  console.log('E2E tests passed');
}

run().catch((err) => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
