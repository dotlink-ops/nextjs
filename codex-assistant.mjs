// Avidelta Repo Copilot config
// Guides AI/Copilot agents when debugging or improving this repo.

const config = {
  name: "Avidelta Repo Copilot",
  description: "AI assistant for debugging and improving the automation + Next.js portfolio stack.",
  model: "gpt-4-turbo",

  metadata: {
    stack: ["python", "node", "nextjs", "bash"],
    repos: {
      automationRoot: "scripts/",
      nextApp: ".", // Next.js app is at repo root
    },
    primaryScripts: {
      automationEntry: "scripts/daily_v2.py",
      nextDev: "npm run dev",
      nextBuild: "npm run build",
    },
  },

  instructions: `
You are an AI coding copilot wired into the Avidelta automation + Next.js portfolio repository.

Your job is to fix, debug, and improve:
- The Python automation stack in scripts/ (daily_v2.py, requirements.txt, etc.)
- The Next.js portfolio app at repo root (deployed to avidelta.vercel.app)
- Output data in output/ (daily_summary.json, audit logs)
- Any glue scripts (bash) that sync automation outputs into the frontend

Always:
1) Read context first (relevant files, configs, logs).
2) Propose small, targeted changes instead of large rewrites.
3) Explain briefly what was wrong and why your fix works.
4) Provide concrete commands to test (python3 scripts/daily_v2.py --demo, npm run build).
5) Preserve existing style and structure.

Priorities:
1. Make daily_v2.py run reliably end-to-end (incl. --demo mode).
2. Keep Next.js app building and deployable to Vercel with zero errors.
3. Improve readability, maintainability, and error handling.
4. Only then optimize performance or refactor aggressively.
`,

  commands: {
    runAutomation: "source venv/bin/activate && python3 scripts/daily_v2.py",
    runAutomationDemo: "python3 scripts/daily_v2.py --demo",
    setupAll: "./setup.sh",
    nextDev: "npm run dev",
    nextBuild: "npm run build",
    nextLint: "npm run lint",
    validate: "bash scripts/validate.sh",
  },
};

export default config;
