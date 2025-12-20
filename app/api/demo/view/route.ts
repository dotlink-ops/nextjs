// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET() {
  try {
    const base = path.join(process.cwd(), "SAMPLE_OUTPUTS");
    const summaryPath = path.join(base, "daily_runner_summary.txt");
    const logPath = path.join(base, "issue_pipeline_log.txt");

    const [summaryRaw, logRaw] = await Promise.all([
      fs.readFile(summaryPath, "utf8").catch(() => "(no summary available)"),
      fs.readFile(logPath, "utf8").catch(() => "(no log available)"),
    ]);

    const summary = escapeHtml(summaryRaw);
    const log = escapeHtml(logRaw);

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Demo Outputs</title>
    <style>
      body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#0b0b12; color:#e6eef8; padding:24px }
      h1 { font-size:20px; margin-bottom:8px }
      .box { background:#0f1720; border:1px solid #1f2937; padding:16px; border-radius:10px; margin-bottom:16px }
      pre { white-space:pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace; font-size:13px; line-height:1.45 }
      .meta { color:#9ca3af; font-size:13px; margin-bottom:8px }
    </style>
  </head>
  <body>
    <h1>Sanitized Demo Outputs</h1>
    <div class="box">
      <div class="meta">Daily Runner Summary (sample)</div>
      <pre>${summary}</pre>
    </div>
    <div class="box">
      <div class="meta">Issue Pipeline Log (sample)</div>
      <pre>${log}</pre>
    </div>
  </body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return NextResponse.json({ error: "unable to render sample outputs", details: String(err) }, { status: 500 });
  }
}
