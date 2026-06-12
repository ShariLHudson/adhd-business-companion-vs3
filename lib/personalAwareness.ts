// Personal Awareness Layer — FUTURE-READY architecture, NOT automated yet.
//
// The companion slowly learns what influences someone's *capacity* to work —
// environment, weather, health, sleep, grief, life load, energy rhythms — and
// reflects it back as gentle OBSERVATIONS, never diagnoses or labels.
//
// Hard rules, encoded so this can grow safely:
//   • Observations, not labels.  "You seem to have more energy after being
//     outside" — never "you appear depressed" or "you have grief issues."
//   • The system understands heavy seasons quietly; it does not bring them up
//     constantly. It just makes the day smaller and the tone softer.
//   • Detection (from chat, weather, calendars, patterns) is intentionally NOT
//     built here. This file is the data model + phrasing + capacity rules only.

export type AwarenessCategory =
  | "internal"
  | "physical"
  | "environmental"
  | "life"
  | "work";

export type AwarenessFactor = {
  id: string;
  category: AwarenessCategory;
  label: string;
};

export const AWARENESS_CATEGORY_LABEL: Record<AwarenessCategory, string> = {
  internal: "Internal",
  physical: "Physical",
  environmental: "Environmental",
  life: "Life",
  work: "Work",
};

// The full factor taxonomy. New factors can be added without code changes
// elsewhere — everything keys off these ids.
export const AWARENESS_FACTORS: AwarenessFactor[] = [
  // Internal
  { id: "energy", category: "internal", label: "Energy" },
  { id: "mood", category: "internal", label: "Mood" },
  { id: "stress", category: "internal", label: "Stress" },
  { id: "overwhelm", category: "internal", label: "Overwhelm" },
  { id: "confidence", category: "internal", label: "Confidence" },
  { id: "motivation", category: "internal", label: "Motivation" },
  { id: "focus", category: "internal", label: "Focus" },
  // Physical
  { id: "sleep", category: "physical", label: "Sleep" },
  { id: "pain", category: "physical", label: "Pain" },
  { id: "health", category: "physical", label: "Health" },
  { id: "exercise", category: "physical", label: "Exercise" },
  { id: "nutrition", category: "physical", label: "Nutrition" },
  // Environmental
  { id: "weather", category: "environmental", label: "Weather" },
  { id: "workspace", category: "environmental", label: "Workspace" },
  { id: "clutter", category: "environmental", label: "Clutter" },
  { id: "noise", category: "environmental", label: "Noise" },
  { id: "location", category: "environmental", label: "Location" },
  // Life
  { id: "family", category: "life", label: "Family" },
  { id: "relationships", category: "life", label: "Relationships" },
  { id: "grief", category: "life", label: "Grief" },
  { id: "caregiving", category: "life", label: "Caregiving" },
  { id: "finances", category: "life", label: "Finances" },
  { id: "major-events", category: "life", label: "Major Events" },
  // Work
  { id: "client-load", category: "work", label: "Client load" },
  { id: "project-load", category: "work", label: "Project load" },
  { id: "deadlines", category: "work", label: "Deadlines" },
  { id: "launches", category: "work", label: "Launches" },
  { id: "content-demands", category: "work", label: "Content demands" },
];

export function getFactor(id: string): AwarenessFactor | undefined {
  return AWARENESS_FACTORS.find((f) => f.id === id);
}
export function factorsForCategory(c: AwarenessCategory): AwarenessFactor[] {
  return AWARENESS_FACTORS.filter((f) => f.category === c);
}

// Direction of influence on capacity — kept deliberately simple and non-clinical.
export type AwarenessValence = "supportive" | "draining" | "neutral";

export type Observation = {
  id: string;
  factorId: string;
  category: AwarenessCategory;
  note: string; // the gentle, observational sentence shown to the user
  valence: AwarenessValence;
  createdAt: string;
};

const KEY = "companion-awareness-v1";

export function getObservations(): Observation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Observation[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Observation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export type NewObservation = {
  factorId: string;
  note: string;
  valence?: AwarenessValence;
};

// Record a gentle observation. A future detection layer would call this AFTER
// noticing a repeated signal — never as a one-off label.
export function addObservation(input: NewObservation): Observation[] {
  const factor = getFactor(input.factorId);
  const entry: Observation = {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    factorId: input.factorId,
    category: factor?.category ?? "internal",
    note: input.note,
    valence: input.valence ?? "neutral",
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...getObservations()];
  writeAll(next);
  return next;
}

export function deleteObservation(id: string): Observation[] {
  const next = getObservations().filter((o) => o.id !== id);
  writeAll(next);
  return next;
}

function withinDays(iso: string, days: number) {
  return Date.now() - new Date(iso).getTime() < days * 86400000;
}

// ---- Capacity hint ------------------------------------------------------
// A gentle read on how heavy the current season feels, from recent draining vs
// supportive observations. Drives softer recommendations — NOT a diagnosis.
//   light  → "make today smaller", fewer/easier options, compassionate tone
//   steady → normal
//   open   → room for deeper / ambitious work
export type CapacityHint = "light" | "steady" | "open";

export function capacityHint(): CapacityHint {
  const recent = getObservations().filter((o) => withinDays(o.createdAt, 14));
  if (recent.length === 0) return "steady";
  const draining = recent.filter((o) => o.valence === "draining").length;
  const supportive = recent.filter((o) => o.valence === "supportive").length;
  // A heavy life factor (grief, caregiving, major events) weighs more.
  const heavyLife = recent.some(
    (o) =>
      o.valence === "draining" &&
      ["grief", "caregiving", "major-events", "health"].includes(o.factorId),
  );
  if (heavyLife || draining - supportive >= 2) return "light";
  if (supportive - draining >= 2) return "open";
  return "steady";
}

// A short, compassionate framing line for the current capacity — observation,
// never label. Safe to surface in chat or on the day's home screen.
export function capacityLine(): string | null {
  switch (capacityHint()) {
    case "light":
      return "This has been a heavy season. Smaller steps seem to help.";
    case "open":
      return "You seem to have some room today — a good time for something meatier if you want it.";
    default:
      return null;
  }
}

// ---- "What Shari noticed" ----------------------------------------------
// Renders recent observations as friendly lines for Progress/Momentum. Returns
// the raw notes the detection layer stored — phrased as observations already.
const CATEGORY_EMOJI: Record<AwarenessCategory, string> = {
  internal: "💜",
  physical: "💤",
  environmental: "🏡",
  life: "🌙",
  work: "📋",
};

export function whatShariNoticed(limit = 6): { emoji: string; line: string }[] {
  // De-duplicate by factor so one strong pattern doesn't repeat.
  const seen = new Set<string>();
  const out: { emoji: string; line: string }[] = [];
  for (const o of getObservations()) {
    if (seen.has(o.factorId)) continue;
    seen.add(o.factorId);
    out.push({ emoji: CATEGORY_EMOJI[o.category], line: o.note });
    if (out.length >= limit) break;
  }
  return out;
}

// Guardrail helper for any future code that generates observation text: keeps
// language observational, never diagnostic. Returns true if a line is safe.
const DIAGNOSIS_WORDS =
  /\b(depress|anxiety disorder|bipolar|adhd diagnos|trauma|disorder|mentally ill|grief issues|you appear (depressed|anxious|broken))\b/i;
export function isObservationSafe(line: string): boolean {
  return !DIAGNOSIS_WORDS.test(line);
}
