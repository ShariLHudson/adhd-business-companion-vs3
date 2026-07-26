/**
 * Client Avatar print documents — build a clean, readable working document
 * from an avatar draft. Pure/testable HTML building; the component opens the
 * print window.
 */

export type AvatarPrintInput = {
  name?: string;
  tagline?: string;
  emoji?: string;
  who?: string;
  painPoints?: string;
  goals?: string;
  currentBehavior?: string;
  solution?: string;
  behaviorTraits?: string[];
  motivations?: string;
  objections?: string;
  triggers?: string;
  contentPrefs?: string;
  revenue?: string;
  research?: Record<string, unknown>;
};

export type PrintSection = { label: string; value: string };

export type AvatarPrintMode = "current" | "progress" | "complete";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** The full ordered set of answered sections for a draft (non-empty only). */
export function avatarPrintSections(a: AvatarPrintInput): PrintSection[] {
  const traits = (a.behaviorTraits ?? []).filter(Boolean).join(", ");
  const research = Object.entries(a.research ?? {})
    .flatMap(([k, v]) => {
      if (Array.isArray(v)) {
        const items = v
          .map((c) =>
            c && typeof c === "object" && "label" in c && "value" in c
              ? `${(c as { label: string }).label}: ${(c as { value: string }).value}`
              : String(c),
          )
          .filter((s) => s.trim());
        return items.length ? [`${k}: ${items.join("; ")}`] : [];
      }
      return typeof v === "string" && v.trim() ? [`${k}: ${v.trim()}`] : [];
    })
    .join("\n");

  const raw: PrintSection[] = [
    { label: "Client name / label", value: (a.name ?? "").trim() },
    { label: "Tagline", value: (a.tagline ?? "").trim() },
    { label: "Who they are", value: (a.who ?? "").trim() },
    { label: "What they're struggling with most", value: (a.painPoints ?? "").trim() },
    { label: "What they're trying to achieve", value: (a.goals ?? "").trim() },
    { label: "What slows them down or holds them back", value: (a.currentBehavior ?? "").trim() },
    { label: "Behavior traits", value: traits },
    { label: "What motivates them", value: (a.motivations ?? "").trim() },
    { label: "What makes them hesitate", value: (a.objections ?? "").trim() },
    { label: "What pushes them to decide", value: (a.triggers ?? "").trim() },
    { label: "How they like to consume content", value: (a.contentPrefs ?? "").trim() },
    { label: "How you help them differently", value: (a.solution ?? "").trim() },
    { label: "Research notes", value: research },
    { label: "Revenue", value: (a.revenue ?? "").trim() },
  ];
  return raw.filter((s) => s.value.trim());
}

/** Whether the avatar has enough to count as a complete working document. */
export function isAvatarComplete(a: AvatarPrintInput): boolean {
  return Boolean(
    (a.name ?? "").trim() &&
      (a.who ?? "").trim() &&
      (a.painPoints ?? "").trim() &&
      (a.goals ?? "").trim() &&
      (a.solution ?? "").trim(),
  );
}

/** Build a clean, self-contained printable HTML document. */
export function buildAvatarPrintHtml(input: {
  title: string;
  subtitle: string;
  sections: PrintSection[];
}): string {
  const body = input.sections.length
    ? input.sections
        .map(
          (s) =>
            `<section><h2>${esc(s.label)}</h2><p>${esc(s.value).replace(/\n/g, "<br>")}</p></section>`,
        )
        .join("\n")
    : `<p class="empty">Nothing to print here yet.</p>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(input.title)} — ${esc(input.subtitle)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1f1c19; margin: 2.5rem; line-height: 1.5; }
  header { border-bottom: 2px solid #1e4f4f; padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
  .kicker { font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; font-weight: 700; color: #1e4f4f; margin: 0; }
  h1 { font-size: 1.8rem; margin: 0.3rem 0 0; color: #1f1c19; }
  section { margin: 0 0 1.15rem; page-break-inside: avoid; }
  h2 { font-family: system-ui, sans-serif; font-size: 0.95rem; color: #1e4f4f; margin: 0 0 0.25rem; }
  p { margin: 0; font-size: 1.02rem; white-space: pre-wrap; }
  .empty { font-style: italic; color: #6b635a; }
  @media print { body { margin: 1.5cm; } }
</style></head>
<body>
  <header>
    <p class="kicker">Client Avatar · ${esc(input.subtitle)}</p>
    <h1>${esc(input.title)}</h1>
  </header>
  ${body}
</body></html>`;
}
