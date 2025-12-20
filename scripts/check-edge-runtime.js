#!/usr/bin/env node

import fs from "fs";
import path from "path";

const policy = JSON.parse(
  fs.readFileSync("runtime-policy.json", "utf-8")
);

const API_ROOT = path.join(process.cwd(), "app", "api");

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (file === "route.ts" || file === "route.js") {
      results.push(full);
    }
  }
  return results;
}

const routes = walk(API_ROOT);

let failed = false;

for (const route of routes) {
  const content = fs.readFileSync(route, "utf-8");
  const isEdge = content.includes(`runtime = "edge"`);

  if (!isEdge) continue;

  const relative = path.relative(process.cwd(), route);

  // Rule 1: Edge usage must be explicitly allowed
  if (!policy.edgeAllowedPaths.includes(relative)) {
    console.error(
      `❌ Illegal Edge runtime usage:\n  ${relative}\n  → Not in edgeAllowedPaths`
    );
    failed = true;
  }

  // Rule 2: Forbidden imports
  for (const mod of policy.edgeForbiddenImports) {
    if (content.includes(`from "${mod}"`) || content.includes(`require("${mod}")`)) {
      console.error(
        `❌ Edge route imports forbidden module "${mod}":\n  ${relative}`
      );
      failed = true;
    }
  }

  // Rule 3: Forbidden globals
  for (const g of policy.edgeForbiddenGlobals) {
    if (content.includes(g)) {
      console.error(
        `❌ Edge route uses forbidden global "${g}":\n  ${relative}`
      );
      failed = true;
    }
  }
}

if (failed) {
  console.error("\n🚫 Edge runtime policy violation detected.");
  process.exit(1);
}

console.log("✅ Edge runtime policy check passed.");
