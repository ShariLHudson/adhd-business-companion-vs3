// Audience layer — the people you create for. Snippets, templates, and AI
// suggestions are scoped to an audience so the whole content side is organized
// around WHO it's for, not what type it is. Future-ready: items can belong to
// multiple audiences, and each audience carries the context AI needs.

export type Audience = {
  id: string;
  name: string;
  description: string;
  problems: string; // what they struggle with
  goals: string; // what they want
  objections: string; // what holds them back from buying
  createdAt: string;
  updatedAt: string;
};

const KEY = "companion-audiences-v1";
const ACTIVE_KEY = "companion-active-audience-v1";

const SEED: Audience = {
  id: "adhd-entrepreneurs",
  name: "ADHD Entrepreneurs",
  description:
    "Solo founders and small business owners with ADHD who want to grow without burning out.",
  problems:
    "Overwhelm, trouble starting, inconsistent follow-through, perfectionism, scattered focus.",
  goals:
    "Steady income, simple systems, finishing what they start, feeling capable and in control.",
  objections:
    "“I've tried everything,” “I don't have time,” “I'll just forget to use it,” fear of one more thing to maintain.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getAudiences(): Audience[] {
  if (typeof window === "undefined") return [SEED];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Audience[];
  } catch {
    /* fall through to seed */
  }
  // First run — seed with the default audience.
  writeAll([SEED]);
  return [SEED];
}

function writeAll(list: Audience[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function getAudience(id: string): Audience | undefined {
  return getAudiences().find((a) => a.id === id);
}

export type NewAudience = {
  name: string;
  description?: string;
  problems?: string;
  goals?: string;
  objections?: string;
};

export function addAudience(input: NewAudience): Audience {
  const now = new Date().toISOString();
  const entry: Audience = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim() || "New audience",
    description: input.description?.trim() ?? "",
    problems: input.problems?.trim() ?? "",
    goals: input.goals?.trim() ?? "",
    objections: input.objections?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...getAudiences(), entry]);
  return entry;
}

export function updateAudience(
  id: string,
  changes: Partial<Omit<Audience, "id" | "createdAt">>,
): Audience[] {
  const next = getAudiences().map((a) =>
    a.id === id ? { ...a, ...changes, updatedAt: new Date().toISOString() } : a,
  );
  writeAll(next);
  return next;
}

export function deleteAudience(id: string): Audience[] {
  const next = getAudiences().filter((a) => a.id !== id);
  writeAll(next.length ? next : [SEED]);
  if (getActiveAudienceId() === id) {
    setActiveAudienceId((next[0] ?? SEED).id);
  }
  return next.length ? next : [SEED];
}

// ---- Active audience ----------------------------------------------------
export function getActiveAudienceId(): string {
  if (typeof window === "undefined") return SEED.id;
  const stored = window.localStorage.getItem(ACTIVE_KEY);
  const audiences = getAudiences();
  if (stored && audiences.some((a) => a.id === stored)) return stored;
  return (audiences[0] ?? SEED).id;
}

export function setActiveAudienceId(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* storage unavailable */
  }
}

// Context string for audience-specific AI generation (snippets, templates).
export function audienceContextForAI(id?: string): string {
  const a = getAudience(id ?? getActiveAudienceId());
  if (!a) return "";
  const parts = [
    `Audience: ${a.name}.`,
    a.description && `Who they are: ${a.description}`,
    a.problems && `Their problems: ${a.problems}`,
    a.goals && `Their goals: ${a.goals}`,
    a.objections && `Their objections: ${a.objections}`,
  ].filter(Boolean);
  return parts.join("\n");
}
