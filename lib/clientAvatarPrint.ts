/**
 * Client Avatar print documents — build a clean, readable working document
 * from an avatar draft. Pure/testable HTML building; the component opens the
 * print window.
 */

export type AvatarPrintInput = {
  name?: string;
  tagline?: string;
  emoji?: string;
  image?: string; // uploaded image data URL (only real uploads are printed)
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
  createdAt?: string;
  updatedAt?: string;
};

export type PrintSection = { label: string; value: string };
export type PrintGroup = { heading: string; sections: PrintSection[] };

export type AvatarPrintMode = "current" | "progress" | "complete";

// Research-notebook metadata lives inside `research` but is NOT printable — only
// research the member intentionally added to an answer/area (already in the
// answer fields and module values) is printed. Never dump internal threads.
const RESEARCH_META_KEYS = new Set([
  "threads",
  "summaries",
  "addedResponses",
  "lastResearched",
  "version",
]);

// The Step 10 research modules, in report order, with their printed labels.
const RESEARCH_MODULE_LABELS: [key: string, label: string][] = [
  ["behavioral", "Behavioral patterns"],
  ["motivation", "Motivation drivers"],
  ["buying", "Buying behavior"],
  ["communication", "Communication preferences"],
  ["market", "Market insights"],
  ["notes", "What I notice about this client"],
];

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
    .filter(([k]) => !RESEARCH_META_KEYS.has(k))
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

/** Draft vs Completed — derived from the same completion heuristic, never a
 * stored status field. */
export function avatarStatus(a: AvatarPrintInput): "Draft" | "Completed" {
  return isAvatarComplete(a) ? "Completed" : "Draft";
}

/** ISO → deterministic, readable date (YYYY-MM-DD); empty for missing/invalid. */
function printDate(iso?: string): string {
  if (!iso) return "";
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return m ? m[1]! : "";
}

/**
 * The professional, grouped Client Avatar report. Includes only populated
 * sections and groups; hides empties. Step 10 research modules each print
 * separately with their labels, and custom fields print under their own labels.
 * Research-notebook metadata (threads etc.) is never included.
 */
export function avatarReportGroups(a: AvatarPrintInput): PrintGroup[] {
  const traits = (a.behaviorTraits ?? []).filter(Boolean).join(", ");
  const group = (heading: string, sections: PrintSection[]): PrintGroup => ({
    heading,
    sections: sections.filter((s) => s.value.trim()),
  });

  const research = (a.research ?? {}) as Record<string, unknown>;
  const moduleSections: PrintSection[] = RESEARCH_MODULE_LABELS.map(
    ([key, label]) => ({ label, value: String(research[key] ?? "").trim() }),
  );
  const customList = Array.isArray(research.custom)
    ? (research.custom as { label?: string; value?: string }[])
    : [];
  const customSections: PrintSection[] = customList.map((c) => ({
    label: (c.label ?? "").trim() || "Custom research",
    value: (c.value ?? "").trim(),
  }));

  const groups: PrintGroup[] = [
    group("Avatar overview", [
      { label: "Who they are", value: (a.who ?? "").trim() },
      { label: "Behavior traits", value: traits },
      { label: "How you help them differently", value: (a.solution ?? "").trim() },
    ]),
    group("Goals & desired outcomes", [
      { label: "What they're trying to achieve", value: (a.goals ?? "").trim() },
    ]),
    group("Challenges & frustrations", [
      { label: "What they're struggling with most", value: (a.painPoints ?? "").trim() },
      { label: "What slows them down or holds them back", value: (a.currentBehavior ?? "").trim() },
    ]),
    group("Motivation & decision drivers", [
      { label: "What motivates them", value: (a.motivations ?? "").trim() },
      { label: "What pushes them to decide", value: (a.triggers ?? "").trim() },
    ]),
    group("Buying behavior", [
      { label: "What makes them hesitate", value: (a.objections ?? "").trim() },
    ]),
    group("Communication preferences", [
      { label: "How they like to consume content", value: (a.contentPrefs ?? "").trim() },
    ]),
    group("Step 10 research insights", [...moduleSections, ...customSections]),
  ];
  // Revenue only when the member noted one.
  if ((a.revenue ?? "").trim()) {
    groups.push(
      group("Revenue", [{ label: "Revenue note", value: (a.revenue ?? "").trim() }]),
    );
  }
  return groups.filter((g) => g.sections.length);
}

/**
 * Build the full printable Client Avatar report (US Letter, grayscale-friendly,
 * clean page breaks, no room background / builder chrome / controls). An
 * uploaded image is included modestly in the header; when there is none the
 * image is simply omitted (no cartoon emoji in the report).
 */
export function buildAvatarReportHtml(input: {
  name: string;
  status: "Draft" | "Completed";
  tagline?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  groups: PrintGroup[];
}): string {
  const title = input.name.trim() || "Client Avatar";
  const created = printDate(input.createdAt);
  const updated = printDate(input.updatedAt);
  const metaBits = [
    created ? `Created ${esc(created)}` : "",
    updated ? `Updated ${esc(updated)}` : "",
  ].filter(Boolean);
  // Only real uploaded images (data URLs / http) print — never emoji.
  const printableImage =
    input.image && /^(data:|https?:)/.test(input.image) ? input.image : "";
  const imageHtml = printableImage
    ? `<img class="avatar-photo" src="${esc(printableImage)}" alt="${esc(title)}">`
    : "";
  const groupsHtml = input.groups.length
    ? input.groups
        .map(
          (g) =>
            `<section class="group"><h2>${esc(g.heading)}</h2>${g.sections
              .map(
                (s) =>
                  `<div class="field"><h3>${esc(s.label)}</h3><p>${esc(
                    s.value,
                  ).replace(/\n/g, "<br>")}</p></div>`,
              )
              .join("")}</section>`,
        )
        .join("\n")
    : `<p class="empty">Nothing to print here yet.</p>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(title)} — Client Avatar</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1f1c19; margin: 2.5rem; line-height: 1.5; }
  header { display: flex; gap: 1.25rem; align-items: center; border-bottom: 2px solid #1e4f4f; padding-bottom: 1rem; margin-bottom: 1.5rem; }
  .avatar-photo { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 1px solid #b9b1a4; flex: none; }
  .head-text { min-width: 0; }
  .kicker { font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; font-weight: 700; color: #1e4f4f; margin: 0; }
  h1 { font-size: 1.9rem; margin: 0.3rem 0 0; }
  .tagline { margin: 0.2rem 0 0; font-style: italic; color: #4b463f; }
  .meta { font-family: system-ui, sans-serif; font-size: 0.75rem; color: #6b635a; margin: 0.35rem 0 0; }
  .group { margin: 0 0 1.4rem; page-break-inside: avoid; }
  .group > h2 { font-family: system-ui, sans-serif; font-size: 1.05rem; color: #1e4f4f; margin: 0 0 0.5rem; border-bottom: 1px solid #d9d2c6; padding-bottom: 0.2rem; }
  .field { margin: 0 0 0.7rem; page-break-inside: avoid; }
  .field h3 { font-family: system-ui, sans-serif; font-size: 0.85rem; color: #3a3630; margin: 0 0 0.15rem; }
  .field p { margin: 0; font-size: 1rem; white-space: pre-wrap; }
  .empty { font-style: italic; color: #6b635a; }
  @media print { body { margin: 1.5cm; } .avatar-photo { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  <header>
    ${imageHtml}
    <div class="head-text">
      <p class="kicker">Client Avatar · ${esc(input.status)}</p>
      <h1>${esc(title)}</h1>
      ${input.tagline?.trim() ? `<p class="tagline">${esc(input.tagline.trim())}</p>` : ""}
      ${metaBits.length ? `<p class="meta">${metaBits.join(" · ")}</p>` : ""}
    </div>
  </header>
  ${groupsHtml}
</body></html>`;
}
