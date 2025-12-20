import fs from "fs";
import path from "path";

export const revalidate = 0; // always fresh on server-side

export default function AutomationStatusPage() {
  const projectRoot = process.cwd();
  const runFile = path.join(projectRoot, "output", "run.json");
  let data: unknown = null;
  let errorMessage: string | null = null;

  if (!fs.existsSync(runFile)) {
    errorMessage = "No run.json found. Automation may not have executed yet.";
  } else {
    try {
      const raw = fs.readFileSync(runFile, "utf-8");
      data = JSON.parse(raw);
    } catch (err) {
      errorMessage = `Failed to read run.json: ${(err as Error).message}`;
    }
  }

  return (
    <div>
      <h2>Automation status</h2>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : (
        <pre style={{ whiteSpace: "pre-wrap", maxWidth: "100%" }}>{
          JSON.stringify(data, null, 2)
        }</pre>
      )}
    </div>
  );
}
