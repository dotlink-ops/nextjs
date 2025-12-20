# Under the Hood: 5 AM Automation Content

## Title
**Under the hood: a 5 AM automation heartbeat**

## Subhead
Every morning at 5:00 AM PT, a Python runner wakes up your data, summarizes what matters, and turns it into actionable work inside GitHub.

---

## Body Copy

### What actually happens at 5:00 AM PT

This isn't just a dashboard — there's a real automation stack running behind it.

Every morning at 5:00 AM PT:

1. **GitHub Actions wakes up the runner**  
   A scheduled workflow in `.github/workflows/daily-run.yml` checks out the Avidelta / Ariadne repo and spins up a clean Python environment.

2. **Python + AI process your inputs**  
   A production script (`daily_v2.py`) ingests notes and operational data, then uses OpenAI to structure:
   - A clear daily summary
   - Key themes and changes since yesterday
   - Extracted action items and follow-ups

3. **Tasks become GitHub Issues**  
   Action items aren't left in a document — they're pushed into GitHub Issues so work can be assigned, tracked, and closed like any other engineering or ops task.

4. **Artifacts are committed and archived**  
   The runner commits generated outputs (JSON / DOCX / logs) back into the repo and uploads them as workflow artifacts, so every day's brief is versioned, auditable, and easy to revisit.

5. **Notion / Ops get a "morning brief"**  
   The system's output is designed to feed directly into a Daily Ops Briefing view in Notion, giving a single place where human judgment and automated context meet.

---

## The Result

**A quiet, reliable "ops heartbeat"** that turns messy notes and scattered signals into a structured morning briefing and concrete next actions — before you even open your laptop.

---

## Tech Stack

- **Orchestration:** GitHub Actions (scheduled at 5:00 AM PT)
- **Logic:** Python (`daily_v2.py`)
- **Intelligence:** OpenAI API
- **Source of truth:** GitHub (code, issues, artifacts)
- **Ops interface:** Notion (Daily Ops Briefing)

---

## Usage

### React Component
Import and use the pre-built component:

```tsx
import UnderTheHoodLive from "@/components/UnderTheHoodLive";

export default function Page() {
  return (
    <div>
      <UnderTheHoodLive
        notionDailyOpsUrl="https://www.notion.so/your-url"
      />
    </div>
  );
}
```

### Multi-Column Layout Example

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    <UnderTheHoodLive
      notionDailyOpsUrl="https://www.notion.so/your-url"
    />
  </div>
  <div>
    {/* Other content or sidebar */}
  </div>
</div>
```

### Markdown / Static Site
Copy the body copy directly into your site's markdown or CMS. The content is formatted with semantic headings that work with most styling systems.

---

## Styling Notes

The React component (`UnderTheHood.tsx`) includes:
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ Numbered steps with visual indicators
- ✅ Highlighted result callout box
- ✅ Tailwind CSS classes (easily customizable)
- ✅ Proper semantic HTML for accessibility

Feel free to adjust colors, spacing, or typography to match your brand.
