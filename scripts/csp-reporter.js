/**
 * csp-reporter.js
 *
 * Single-file CSP reporting microservice to receive
 * Content-Security-Policy-Report-Only (and enforced CSP) violation
 * reports from google.com and expose lightweight statistics.
 *
 * 1) Deploy this file (e.g., on Vercel, Railway, Fly.io, or a Node server).
 * 2) Point Google.com CSP Report-To / report-uri to:
 *      https://your-service.example.com/csp-report
 *
 * --------------------------------------------------------------------
 * Deployment & Google.com Integration (documentation)
 * --------------------------------------------------------------------
 *
 * On the google.com side, you (or whoever controls headers) add a
 * report-only CSP (safe to start) and bind it to this service:
 *
 *   Content-Security-Policy-Report-Only:
 *     script-src 'self';
 *     report-to csp-endpoint;
 *
 *   Report-To:
 *     {"group":"csp-endpoint","max_age":10886400,
 *      "endpoints":[{"url":"https://your-service.example.com/csp-report"}]}
 *
 * For older browsers or compatibility, you can also use:
 *
 *   Content-Security-Policy-Report-Only:
 *     script-src 'self';
 *     report-uri https://your-service.example.com/csp-report;
 *
 * Once enforced CSP is introduced, add (example only):
 *
 *   Content-Security-Policy:
 *     script-src 'self';
 *     report-uri https://your-service.example.com/csp-report;
 *
 * This service does NOT set those headers for google.com; it only
 * receives and aggregates the reports.
 */

const express = require('express');
const app = express();

// Accept legacy CSP reports (single object under "csp-report")
app.use(express.json({
  type: 'application/csp-report',
  limit: '10mb'
}));

// Accept modern JSON report format (Report-To / Reporting API)
app.use(express.json({
  type: 'application/reports+json',
  limit: '10mb'
}));

// In-memory statistics object
let stats = {
  total: 0,          // all reports seen
  unsafeEval: 0,     // eval / wasm-eval related
  unsafeInline: 0,   // inline script/style related
  enforced: 0,       // heuristic counter for enforced CSP context
  byDirective: {}    // map of directive -> count
};

/**
 * Normalize a variety of CSP report layouts into a flat list
 * of "violation-like" objects that we can process uniformly.
 */
function normalizeReports(body) {
  // Legacy CSP: { "csp-report": { ... } }
  if (body && body['csp-report']) {
    return [body['csp-report']];
  }

  // Reporting API: [ { "type": "csp-violation", "body": { ... } }, ... ]
  if (Array.isArray(body)) {
    return body
      .filter(entry => entry && entry.type && entry.body)
      .map(entry => entry.body);
  }

  // Already a single violation object
  if (body && typeof body === 'object') {
    return [body];
  }

  return [];
}

/**
 * POST /csp-report
 *
 * Receives violation reports from:
 * - Content-Security-Policy-Report-Only
 * - Content-Security-Policy (enforced) + report-uri/report-to
 */
app.post('/csp-report', (req, res) => {
  const violations = normalizeReports(req.body);

  if (!violations.length) {
    return res.status(204).send();
  }

  violations.forEach(report => {
    stats.total++;

    // Common fields across formats
    const directive =
      report['effective-directive'] ||
      report['violated-directive'] ||
      report['directive'] ||
      null;

    const blockedUri = report['blocked-uri'] || report['blockedURL'] || null;

    // Some browsers put eval/inline markers in resource-type-ish fields
    const resource = report['resource'] || report['disposition'] || null;

    // Heuristic detection for eval-like violations
    const isEval =
      blockedUri === 'eval' ||
      resource === 'eval' ||
      resource === 'wasm-eval';

    // Heuristic detection for inline-like violations
    const isInline =
      blockedUri === 'inline' ||
      blockedUri === "'self'" && report['line-number'] && report['column-number'] ||
      (!blockedUri && directive && directive.indexOf('script-src') !== -1);

    if (isEval) stats.unsafeEval++;
    if (isInline && directive && directive.indexOf('script-src') !== -1) {
      stats.unsafeInline++;
    }

    if (directive) {
      stats.byDirective[directive] = (stats.byDirective[directive] || 0) + 1;
    }

    /**
     * Very rough heuristic:
     * - If the incoming request DOES NOT have the
     *   Content-Security-Policy-Report-Only header,
     *   then treat it as coming from an enforced CSP context.
     *
     * This depends on your reverse proxy preserving request headers
     * from the browser. If you don't see that header here, you may
     * need to log all req.headers and adjust this logic.
     */
    const hasReportOnlyHeader =
      !!req.headers['content-security-policy-report-only'];

    if (!hasReportOnlyHeader) {
      stats.enforced++;
    }

    // Optional: log per-violation for debugging
    console.log('CSP violation:', {
      directive,
      blockedUri,
      isEval,
      isInline
    });
  });

  // Standard empty response for CSP reports
  res.status(204).send();
});

/**
 * GET /stats
 *
 * Returns aggregated statistics as JSON. Optional reset via query.
 * Example:
 *   GET /stats
 *   GET /stats?reset=1
 */
app.get('/stats', (req, res) => {
  const snapshot = { ...stats, byDirective: { ...stats.byDirective } };

  if (req.query.reset === '1') {
    stats = {
      total: 0,
      unsafeEval: 0,
      unsafeInline: 0,
      enforced: 0,
      byDirective: {}
    };
  }

  res.json(snapshot);
});

// Simple health endpoint (for uptime checks / ping statistics)
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Start server if run directly (`node csp-reporter.js`)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CSP Reporter listening on port ${PORT}`);
});

/**
 * Usage summary:
 *
 * 1. Deploy:
 *      node csp-reporter.js
 *    or containerize and deploy to your platform of choice.
 *
 * 2. Configure google.com CSP headers to send reports to:
 *      https://your-service.example.com/csp-report
 *
 * 3. Monitor:
 *      curl https://your-service.example.com/stats
 *
 *    You will see:
 *      {
 *        "total": 123,
 *        "unsafeEval": 5,
 *        "unsafeInline": 17,
 *        "enforced": 40,
 *        "byDirective": {
 *          "script-src": 20,
 *          "style-src": 3
 *        }
 *      }
 *
 * 4. Use the "enforced" count to approximate how many reports
 *    come from active (in-force) CSP rather than report-only mode.
 */

