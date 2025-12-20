// =============================================================
// Ariadne Nexus — Architecture Generator V2
// Repo-Aware • Component-Aware • Slide-Deck Generator • Vision Nodes
// =============================================================

figma.showUI(__html__, { width: 350, height: 250 });

async function githubRepoTree(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
  const response = await fetch(url);
  return await response.json();
}

async function createSlide(titleText, yOffset = 0) {
  const slide = figma.createFrame();
  slide.resize(1920, 1080);
  slide.x = 0;
  slide.y = yOffset;
  slide.name = `Slide — ${titleText}`;
  slide.fills = [{ type: "SOLID", color: { r: 0.05, g: 0.05, b: 0.05 } }];

  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  const title = figma.createText();
  title.characters = titleText;
  title.fontSize = 72;
  title.x = 80;
  title.y = 80;
  title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  slide.appendChild(title);
  figma.currentPage.appendChild(slide);

  return slide;
}

async function createReasoningNode(text, parent, x, y) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const node = figma.createEllipse();
  node.resize(260, 160);
  node.x = x;
  node.y = y;
  node.fills = [{ type: "SOLID", color: { r: 0.12, g: 0.12, b: 0.12 } }];
  parent.appendChild(node);

  const label = figma.createText();
  label.characters = text;
  label.fontSize = 20;
  label.x = x + 20;
  label.y = y + 50;
  label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  parent.appendChild(label);
}

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "generate-v2") return;

  // =============================================================
  // 1. FETCH GITHUB REPO TREES
  // =============================================================
  figma.notify("Fetching GitHub metadata…");

  const avidelta = await githubRepoTree("dotlink-ops", "nexus-core");
  const nextjs   = await githubRepoTree("dotlink-ops", "nextjs");

  const avideltaFiles = avidelta.tree.map(t => t.path);
  const nextFiles     = nextjs.tree.map(t => t.path);

  // =============================================================
  // 2. BUILD THE CORE ARCHITECTURE LAYERS
  // =============================================================

  const FRAME_W = 1440;
  const FRAME_H = 1900;
  const GAP = 180;

  const COLORS = {
    BLUE: { r: 0.08, g: 0.31, b: 0.61 },
    GREEN: { r: 0.09, g: 0.55, b: 0.29 },
    ORANGE: { r: 0.89, g: 0.45, b: 0.15 },
    RED: { r: 0.73, g: 0.12, b: 0.12 }
  };

  function makeFrame(name, x, color) {
    const frame = figma.createFrame();
    frame.resize(FRAME_W, FRAME_H);
    frame.x = x;
    frame.y = 0;
    frame.name = name;
    frame.fills = [{ type: "SOLID", color }];
    figma.currentPage.appendChild(frame);
    return frame;
  }

  const frontend = makeFrame("Layer 1 — Frontend", 0, COLORS.BLUE);
  const api      = makeFrame("Layer 2 — API", FRAME_W + GAP, COLORS.GREEN);
  const engine   = makeFrame("Layer 3 — Engine", 2*(FRAME_W + GAP), COLORS.ORANGE);
  const integ    = makeFrame("Layer 4 — Integrations", 3*(FRAME_W + GAP), COLORS.RED);

  // =============================================================
  // 3. CREATE MODULE GROUPS BASED ON REPO FILE STRUCTURE
  // =============================================================

  function addFileListToFrame(frame, title, files, y = 200) {
    const group = figma.createFrame();
    group.name = title;
    group.resize(500, 600);
    group.x = 60;
    group.y = y;
    group.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];

    figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
      const label = figma.createText();
      label.characters = `${title}\n\n` + files.slice(0, 18).join("\n");
      label.fontSize = 20;
      label.x = 20;
      label.y = 20;
      label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      group.appendChild(label);
    });

    frame.appendChild(group);
  }

  addFileListToFrame(engine, "nexus-core Repo Structure", avideltaFiles);
  addFileListToFrame(api, "Next.js API Routes", nextFiles.filter(f => f.startsWith("app/api")));

  // =============================================================
  // 4. ADD AGENT REASONING NODES
  // =============================================================
  await createReasoningNode("LLM Reasoning\nSummaries + Decisions", engine, 900, 300);
  await createReasoningNode("Vision Parsing\nOCR + Layout", frontend, 860, 300);
  await createReasoningNode("Routing Logic\nDecision Map", api, 860, 300);
  await createReasoningNode("Slack Signals\nError Flow", integ, 860, 300);

  // =============================================================
  // 5. ADD SLACK CHANNEL MAP
  // =============================================================
  addFileListToFrame(integ, "Slack Channels", [
    "#ariadne-alerts",
    "#nexus-ops",
    "#system-health",
    "#drift-detection",
    "#github-events"
  ], 900);

  // =============================================================
  // 6. BUILD SLIDE DECK
  // =============================================================

  await createSlide("Ariadne Nexus — System Blueprint");
  await createSlide("Architecture Overview", 1200);
  await createSlide("Vision & Spatial Intelligence", 2400);
  await createSlide("Automation Engine (Python)", 3600);
  await createSlide("Integrations & Signals", 4800);
  await createSlide("Powered by Ariadne Nexus", 6000);

  figma.notify("Ariadne Nexus — V2 Blueprint Generated ✔");
};
