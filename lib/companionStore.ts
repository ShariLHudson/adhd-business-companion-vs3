// Local-first persistence for the things a person would hate to lose:
// the conversation with Shari, and an in-progress Brain Dump draft.
//
// Everything here is defensive: SSR-safe, wrapped in try/catch, and never
// throws. Losing a save is acceptable; crashing the app is not.

import {
  DEFAULT_LANGUAGE_COMMUNICATION,
  normalizeLanguageCommunication,
  type LanguageCommunicationPrefs,
} from "./companionLanguage";
import {
  extractLanguagePrefs,
  languagePrefsPatch,
  pushLanguagePrefsToUser,
} from "./companionUserLanguage";
import { createCatalogTypeLabels } from "./createCatalog";
import { sortByDropdownLabel, sortDropdownLabels } from "./dropdownSort";

export type {
  LanguageCommunicationPrefs,
  LanguageCode,
  RegionCode,
  DateFormat,
} from "./companionLanguage";
export {
  DEFAULT_LANGUAGE_COMMUNICATION,
  normalizeLanguageCommunication,
  languageCommunicationSummary,
  getOutputLanguageContext,
  LANGUAGE_OPTIONS,
  REGION_OPTIONS,
  DATE_FORMAT_OPTIONS,
  SORTED_LANGUAGE_OPTIONS,
  SORTED_REGION_OPTIONS,
  SORTED_DATE_FORMAT_OPTIONS,
  withUnifiedAppLanguage,
  speechLocaleForLanguage,
  getInterfaceLanguageCode,
  isRtlLanguage,
} from "./companionLanguage";

export type StoredMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const CONVERSATION_KEY = "companion-conversation-v1";
const BRAIN_DUMP_KEY = "companion-brain-dump-draft-v1";

// ---- Conversation ---------------------------------------------------------

export function loadConversation(): StoredMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONVERSATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Keep only well-formed messages so a corrupt entry can't crash render.
    return parsed.filter(
      (m): m is StoredMessage =>
        m &&
        (m.role === "user" || m.role === "assistant" || m.role === "system") &&
        typeof m.content === "string",
    );
  } catch {
    return null;
  }
}

export function saveConversation(messages: StoredMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages));
  } catch {
    // Storage full or unavailable (private mode). Fail quietly.
  }
}

export function clearConversation() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    /* noop */
  }
}

// ---- Brain Dump draft -----------------------------------------------------

export function loadBrainDumpDraft(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(BRAIN_DUMP_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveBrainDumpDraft(text: string) {
  if (typeof window === "undefined") return;
  try {
    if (text.trim()) {
      localStorage.setItem(BRAIN_DUMP_KEY, text);
    } else {
      localStorage.removeItem(BRAIN_DUMP_KEY);
    }
  } catch {
    /* noop */
  }
}

export function clearBrainDumpDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BRAIN_DUMP_KEY);
  } catch {
    /* noop */
  }
}

// ---- Saved brain dumps ----------------------------------------------------

export type BrainDumpEntry = {
  id: string;
  text: string;
  createdAt: string;
  // AI-assigned, filled in shortly after capture.
  topic?: string;
  category?: string;
  contextType?: string;
  suggestion?: string; // timeblock | project | reminder | keep
  // User-set in the detail panel.
  projectId?: string;
  estimateMin?: number;
  actionType?: string; // task | idea | reminder | someday | delegate
  schedulingIntent?: string; // today | week | later | tomorrow
  captureSessionId?: string;
  routedAction?: string;
  sorted?: boolean;
  done?: boolean;
};

// Lightweight XP, awarded for completing items (Spin the Wheel etc.).
const XP_KEY = "companion-xp-v1";
export function getXp(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(XP_KEY)) || 0;
  } catch {
    return 0;
  }
}
export function addXp(amount: number): number {
  const next = getXp() + amount;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(XP_KEY, String(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

// ---- Momentum Progress System --------------------------------------------
// Tracks MOVEMENT, not completion: starting, moving, recovering, continuing.
// XP rewards starting/returning over finishing. No streaks, no failure state.

export type MomentumType =
  | "capture" // brain-dump / captured a thought
  | "start" // started something (highest reward)
  | "move" // moved something forward
  | "complete" // finished a task/block
  | "resilience" // got unstuck / returned after a pause
  | "reset"; // used a reset / breathe / brain-dump cleanup

export const MOMENTUM_XP: Record<MomentumType, number> = {
  start: 10,
  complete: 15,
  resilience: 8,
  reset: 6,
  move: 5,
  capture: 5,
};

export type MomentumEvent = {
  id: string;
  type: MomentumType;
  label: string;
  xp: number;
  energy?: DayLevel;
  ts: string;
};

const MOMENTUM_KEY = "companion-momentum-v1";

function readMomentum(): MomentumEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOMENTUM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMomentum(list: MomentumEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOMENTUM_KEY, JSON.stringify(list.slice(0, 600)));
  } catch {
    /* noop */
  }
}

// Record one movement event (and award its XP). Returns the new total XP.
export function logMomentum(type: MomentumType, label: string): number {
  const day = getDayState();
  const ev: MomentumEvent = {
    id: newId(),
    type,
    label,
    xp: MOMENTUM_XP[type],
    energy: day?.energy,
    ts: new Date().toISOString(),
  };
  writeMomentum([ev, ...readMomentum()]);
  return addXp(ev.xp);
}

export function getMomentumEvents(limit = 60): MomentumEvent[] {
  return readMomentum().slice(0, limit);
}

export function getTodayMomentum(): MomentumEvent[] {
  const today = todayStr();
  return readMomentum().filter((e) => e.ts.slice(0, 10) === today);
}

export function getWeekMomentum(): MomentumEvent[] {
  const cutoff = Date.now() - 7 * 86400000;
  return readMomentum().filter((e) => new Date(e.ts).getTime() >= cutoff);
}

// Friendly label per momentum type, for "what moved" summaries.
export const MOMENTUM_TYPE_LABEL: Record<MomentumType, string> = {
  capture: "capturing thoughts",
  start: "starting things",
  move: "moving projects forward",
  complete: "finishing things",
  resilience: "coming back after a pause",
  reset: "resetting your attention",
};

export type MomentumLevel = { key: string; label: string; emoji: string };

// Levels move UP and DOWN freely — no shame, no streaks.
export function momentumLevel(xp: number): MomentumLevel {
  if (xp < 100) return { key: "starter", label: "Starter", emoji: "🌱" };
  if (xp < 400) return { key: "builder", label: "Builder", emoji: "🌿" };
  if (xp < 1000)
    return { key: "maker", label: "Momentum Maker", emoji: "🔥" };
  return { key: "flow", label: "Flow Builder", emoji: "⚡" };
}

const BRAIN_DUMP_LIST_KEY = "companion-brain-dumps-v1";

export function getBrainDumps(): BrainDumpEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BRAIN_DUMP_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is BrainDumpEntry =>
        e &&
        typeof e.id === "string" &&
        typeof e.text === "string" &&
        typeof e.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function addBrainDump(
  text: string,
  opts?: { captureSessionId?: string },
): BrainDumpEntry[] {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") return getBrainDumps();
  const entry: BrainDumpEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed,
    createdAt: new Date().toISOString(),
    captureSessionId: opts?.captureSessionId,
  };
  const next = [entry, ...getBrainDumps()];
  try {
    localStorage.setItem(BRAIN_DUMP_LIST_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
  return next;
}

export function updateBrainDump(
  id: string,
  changes: Partial<Omit<BrainDumpEntry, "id">>,
): BrainDumpEntry[] {
  const next = getBrainDumps().map((e) =>
    e.id === id ? { ...e, ...changes } : e,
  );
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BRAIN_DUMP_LIST_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function deleteBrainDump(id: string): BrainDumpEntry[] {
  const next = getBrainDumps().filter((e) => e.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BRAIN_DUMP_LIST_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

// ---- Templates Library ----------------------------------------------------

export type TemplateStatus = "saved" | "draft" | "archived";
export type TemplateCategory =
  | "content"
  | "offers"
  | "emails"
  | "strategy"
  | "systems"
  | "execution"
  | "other";

export type TemplateItem = {
  id: string;
  title: string;
  body: string;
  category: TemplateCategory;
  subcategory?: string;
  status: TemplateStatus;
  audienceIds?: string[]; // audiences this template is for (multiple allowed)
  createdAt: string;
  updatedAt: string;
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "content",
  "offers",
  "emails",
  "strategy",
  "systems",
  "execution",
  "other",
];

// A library of thinking tools — each category holds reusable sub-types.
export const TEMPLATE_CATEGORY_LABEL: Record<TemplateCategory, string> = {
  content: "Content",
  offers: "Offers",
  emails: "Emails",
  strategy: "Strategy",
  systems: "Business Systems",
  execution: "ADHD / Personal Execution",
  other: "Other",
};

export const TEMPLATE_SUBTYPES: Record<TemplateCategory, string[]> = {
  content: ["Social posts", "Articles", "Scripts", "Ideas"],
  offers: ["Service descriptions", "Pricing pages", "Funnels", "Product offers"],
  emails: ["Launch sequences", "Follow-ups", "Nurture emails", "Sales emails"],
  strategy: [
    "Marketing strategies",
    "Growth plans",
    "Positioning frameworks",
    "Campaign structures",
  ],
  systems: ["Workflow templates", "SOPs", "Automation flows"],
  execution: [
    "Focus plans",
    "Brain dump structures",
    "Reset routines",
    "Weekly planning",
  ],
  other: [],
};

export function sortedTemplateCategories(): TemplateCategory[] {
  return sortByDropdownLabel(TEMPLATE_CATEGORIES, (c) => TEMPLATE_CATEGORY_LABEL[c]);
}

export function sortedTemplateSubtypes(category: TemplateCategory): string[] {
  return sortDropdownLabels(TEMPLATE_SUBTYPES[category]);
}

const TEMPLATES_KEY = "companion-templates-v1";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readTemplates(): TemplateItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is TemplateItem =>
        t &&
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        typeof t.body === "string" &&
        typeof t.category === "string" &&
        typeof t.status === "string",
    );
  } catch {
    return [];
  }
}

function writeTemplates(list: TemplateItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

const TEMPLATES_SEEDED_KEY = "companion-templates-seeded-v1";

// Starter library so the shelves aren't empty on day one. Seeded ONCE; if the
// user clears them all we never re-add (the flag stays set).
const SEED_TEMPLATES: {
  title: string;
  body: string;
  category: TemplateCategory;
  subcategory: string;
}[] = [
  {
    title: "Hook → Value → CTA post",
    category: "content",
    subcategory: "Social posts",
    body: `A simple, repeatable structure for a post that gets read and acted on.

1) HOOK (first line — stop the scroll)
Pick one angle:
• Bold claim: "Most [people] get [topic] backwards."
• Question: "Ever [common frustration]?"
• Result: "How I went from [before] to [after]."
→ Your hook:

2) VALUE (the body — deliver one idea)
Keep it to 3–5 short lines. One idea only.
• What's the mistake or misconception?
• What's the better way?
• A quick example or proof.
→ Your value:

3) CTA (last line — one clear next step)
Choose ONE: comment a word · save this · DM me "[keyword]" · link in bio.
→ Your CTA:

Tip: write the hook LAST, once you know what the post is really about.`,
  },
  {
    title: "Short-form video script",
    category: "content",
    subcategory: "Scripts",
    body: `For a 20–45 second talking video (Reels / TikTok / Shorts).

HOOK (0–3 sec) — say the payoff or the problem out loud:
→

SETUP (3–8 sec) — why this matters / who it's for:
→

VALUE (8–30 sec) — the one tip, in 2–3 simple beats:
• Beat 1:
• Beat 2:
• Beat 3:

PAYOFF + CTA (last 5 sec) — recap the win, tell them what to do:
→

On-screen text ideas:
• Caption hook:
• Mid-video keyword:`,
  },
  {
    title: "Service description",
    category: "offers",
    subcategory: "Service descriptions",
    body: `A clear description that makes the offer obvious.

ONE-LINER:
I help [who] achieve [outcome] without [pain], through [how].

WHO IT'S FOR:
• [type of client]
• who currently [struggle]

WHAT THEY GET:
• [deliverable 1]
• [deliverable 2]
• [deliverable 3]

THE OUTCOME:
By the end, you'll have [tangible result] so you can [bigger benefit].

HOW IT WORKS:
1. [step]
2. [step]
3. [step]

WHO IT'S NOT FOR:
• [disqualifier — builds trust]`,
  },
  {
    title: "3-tier pricing page",
    category: "offers",
    subcategory: "Pricing pages",
    body: `Three options anchored around the middle one.

STARTER — [price]
Best for: [who]
• [core thing]
• [core thing]
Outcome: [small win]

CORE — [price]  ★ Most popular
Best for: [who]
• everything in Starter, plus
• [more]
• [more]
Outcome: [main result]

PREMIUM — [price]
Best for: [who]
• everything in Core, plus
• [done-for-you / extras]
• [priority access]
Outcome: [biggest result]

Under the table:
• Guarantee: [risk reversal]
• FAQ: [top 1–2 objections answered]`,
  },
  {
    title: "Gentle follow-up email",
    category: "emails",
    subcategory: "Follow-ups",
    body: `A low-pressure nudge that's easy to reply to.

Subject: Quick nudge on [topic]

Hi [name],

Just floating this back to the top of your inbox in case it slipped by — totally understand things get busy.

[One sentence reminding them of the value / what's next.]

No pressure at all. If now's not the time, just let me know and I'll check back later. If you're ready, [one clear next step]?

Warmly,
[Your name]

---
Shorter version:
Hi [name] — circling back on [topic]. Want me to [next step], or should I follow up later?`,
  },
  {
    title: "5-email launch sequence",
    category: "emails",
    subcategory: "Launch sequences",
    body: `A full launch arc. One email per day works well.

EMAIL 1 — TEASE
• Hint something is coming
• Share the story / why you built it
• No link yet — build curiosity

EMAIL 2 — REVEAL
• What it is, who it's for, the core benefit
• Open the offer / link
• One clear CTA

EMAIL 3 — PROOF
• A result, testimonial, or case study
• Handle the "will this work for me?" doubt
• CTA

EMAIL 4 — OBJECTIONS
• Answer the top 2 hesitations (price, time, fit)
• Add a bonus or guarantee if you have one
• CTA

EMAIL 5 — CLOSE
• Last call / deadline
• Recap the transformation
• Strong, direct CTA`,
  },
  {
    title: "Positioning framework",
    category: "strategy",
    subcategory: "Positioning frameworks",
    body: `Make it crystal clear why you, for whom.

THE STATEMENT:
For [target customer]
who [need or struggle],
[your brand] is the [category]
that [key benefit].
Unlike [main alternative],
we [key difference].

WORKED EXAMPLE (replace with yours):
For overwhelmed solo founders
who can't keep marketing consistent,
Spark is the companion app
that turns scattered ideas into one next step.
Unlike generic to-do apps,
we adapt to your energy and focus for you.

PRESSURE-TEST IT:
• Would a stranger understand it in 5 seconds?
• Does the "unlike" actually differentiate you?
• Is the benefit something they already want?`,
  },
  {
    title: "SOP (standard operating procedure)",
    category: "systems",
    subcategory: "SOPs",
    body: `A repeatable process anyone (incl. future-you) can follow.

PROCESS NAME:
PURPOSE: (what this reliably produces)
TRIGGER: (when to run it)
OWNER: (who's responsible)
TOOLS NEEDED:

STEPS:
1.
2.
3.
4.
5.

QUALITY CHECK (done when):
• [criterion]
• [criterion]

COMMON MISTAKES TO AVOID:
• [pitfall]

LAST UPDATED: [date]`,
  },
  {
    title: "Daily focus plan",
    category: "execution",
    subcategory: "Focus plans",
    body: `Keep the day small and winnable.

TODAY'S DATE:
ENERGY RIGHT NOW: low / medium / high

THE ONE BIG THING (must move today):
→
First 10-minute step to start it:
→

TWO SMALL THINGS (nice to clear):
•
•

NOT TODAY (parked on purpose, so I can let go):
•

IF I STALL: my reset move is [breathe / walk / Spin the Wheel / brain dump].
END-OF-DAY WIN TO NOTICE:`,
  },
  {
    title: "Weekly reset & plan",
    category: "execution",
    subcategory: "Weekly planning",
    body: `A 10-minute weekly reset.

LOOK BACK
• Wins (however small):
• What drained me:
• What I'm letting go of:

LOOK AHEAD
• The ONE priority this week:
• Why it matters:
• 3 moves that serve it:
   1.
   2.
   3.

ENERGY & CARE
• What will I protect time for?
• One thing that makes the week feel good:

PARKED (not this week, and that's okay):
•`,
  },
];

export function getTemplates(): TemplateItem[] {
  if (typeof window === "undefined") return [];
  const existing = readTemplates();
  if (existing.length > 0) return existing;
  try {
    if (localStorage.getItem(TEMPLATES_SEEDED_KEY)) return existing;
    const now = new Date().toISOString();
    const seeded: TemplateItem[] = SEED_TEMPLATES.map((s) => ({
      id: newId(),
      title: s.title,
      body: s.body,
      category: s.category,
      subcategory: s.subcategory,
      status: "saved" as TemplateStatus,
      createdAt: now,
      updatedAt: now,
    }));
    writeTemplates(seeded);
    localStorage.setItem(TEMPLATES_SEEDED_KEY, "1");
    return seeded;
  } catch {
    return existing;
  }
}

export function createTemplate(input: {
  title?: string;
  body: string;
  category?: TemplateCategory;
  subcategory?: string;
  status?: TemplateStatus;
}): TemplateItem[] {
  const body = input.body.trim();
  if (!body) return readTemplates();
  const now = new Date().toISOString();
  const item: TemplateItem = {
    id: newId(),
    title: input.title?.trim() || "Untitled template",
    body,
    category: input.category ?? "other",
    subcategory: input.subcategory,
    status: input.status ?? "saved",
    createdAt: now,
    updatedAt: now,
  };
  const next = [item, ...readTemplates()];
  writeTemplates(next);
  return next;
}

export function updateTemplate(
  id: string,
  changes: Partial<
    Pick<
      TemplateItem,
      "title" | "body" | "category" | "subcategory" | "status"
    >
  >,
): TemplateItem[] {
  const next = readTemplates().map((t) =>
    t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t,
  );
  writeTemplates(next);
  return next;
}

export function duplicateTemplate(id: string): TemplateItem[] {
  const list = readTemplates();
  const src = list.find((t) => t.id === id);
  if (!src) return list;
  const now = new Date().toISOString();
  const copy: TemplateItem = {
    ...src,
    id: newId(),
    title: `${src.title} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
  const next = [copy, ...list];
  writeTemplates(next);
  return next;
}

export function deleteTemplate(id: string): TemplateItem[] {
  const next = readTemplates().filter((t) => t.id !== id);
  writeTemplates(next);
  return next;
}

// ---- Snippets — small reusable content blocks (the building-block layer) ---

export type SnippetKind =
  | "hook"
  | "value"
  | "cta"
  | "opener"
  | "closing"
  | "story"
  | "objection"
  | "other";

export type Snippet = {
  id: string;
  content: string;
  kind: SnippetKind;
  tone?: string; // friendly · professional · urgent · storytelling · ADHD-simple
  whenToUse?: string;
  whereToUse?: string;
  category?: string;
  tags?: string[];
  audienceIds?: string[]; // audiences this snippet is for (multiple allowed)
  createdAt: string;
  updatedAt: string;
};

export const SNIPPET_KIND_LABEL: Record<SnippetKind, string> = {
  hook: "Hook",
  value: "Value statement",
  cta: "CTA",
  opener: "Opener",
  closing: "Closing",
  story: "Story starter",
  objection: "Objection response",
  other: "Other",
};

export const SNIPPET_TONES = sortDropdownLabels([
  "Friendly",
  "Professional",
  "Urgent",
  "Storytelling",
  "ADHD-simple",
]);

export function sortedSnippetKinds(): SnippetKind[] {
  return sortByDropdownLabel(
    Object.keys(SNIPPET_KIND_LABEL) as SnippetKind[],
    (k) => SNIPPET_KIND_LABEL[k],
  );
}

const SNIPPETS_KEY = "companion-snippets-v1";
const SNIPPETS_SEEDED_KEY = "companion-snippets-seeded-v1";

function readSnippets(): Snippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SNIPPETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Snippet =>
        s &&
        typeof s.id === "string" &&
        typeof s.content === "string" &&
        typeof s.kind === "string",
    );
  } catch {
    return [];
  }
}

function writeSnippets(list: Snippet[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SNIPPETS_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

const SEED_SNIPPETS: Omit<Snippet, "id" | "createdAt" | "updatedAt">[] = [
  {
    content: "Most [people] get [topic] backwards.",
    kind: "hook",
    tone: "Professional",
    whenToUse: "Posts and email openers that challenge a belief.",
    whereToUse: "Email hook · Social post",
    category: "Content",
  },
  {
    content: "I'll keep this short — I know your inbox is full.",
    kind: "opener",
    tone: "ADHD-simple",
    whenToUse: "Cold outreach or busy recipients.",
    whereToUse: "Email opener",
    category: "Email",
  },
  {
    content:
      "If now's not the time, no worries — just reply “later” and I'll check back.",
    kind: "cta",
    tone: "Friendly",
    whenToUse: "Follow-ups where you want a low-pressure reply.",
    whereToUse: "Email CTA · DM",
    category: "Sales",
  },
  {
    content: "Ready to start? Reply “YES” and I'll send the next step today.",
    kind: "cta",
    tone: "Urgent",
    whenToUse: "Sales emails when the lead is warm.",
    whereToUse: "Email CTA",
    category: "Sales",
  },
  {
    content: "Last year I almost gave up on [thing]. Here's what changed.",
    kind: "story",
    tone: "Storytelling",
    whenToUse: "Story-based emails and posts.",
    whereToUse: "Email · Social post · Video script",
    category: "Content",
  },
  {
    content: "Worried about [objection]? Totally fair — here's how we handle that.",
    kind: "objection",
    tone: "Professional",
    whenToUse: "Sales emails answering a hesitation.",
    whereToUse: "Email body · DM",
    category: "Sales",
  },
];

export function getSnippets(): Snippet[] {
  if (typeof window === "undefined") return [];
  const existing = readSnippets();
  if (existing.length > 0) return existing;
  try {
    if (localStorage.getItem(SNIPPETS_SEEDED_KEY)) return existing;
    const now = new Date().toISOString();
    const seeded: Snippet[] = SEED_SNIPPETS.map((s) => ({
      ...s,
      id: newId(),
      createdAt: now,
      updatedAt: now,
    }));
    writeSnippets(seeded);
    localStorage.setItem(SNIPPETS_SEEDED_KEY, "1");
    return seeded;
  } catch {
    return existing;
  }
}

export function createSnippet(input: {
  content: string;
  kind?: SnippetKind;
  tone?: string;
  whenToUse?: string;
  whereToUse?: string;
  category?: string;
  tags?: string[];
  audienceIds?: string[];
}): Snippet[] {
  const content = input.content.trim();
  if (!content) return readSnippets();
  const now = new Date().toISOString();
  const item: Snippet = {
    id: newId(),
    content,
    kind: input.kind ?? "other",
    tone: input.tone,
    whenToUse: input.whenToUse,
    whereToUse: input.whereToUse,
    category: input.category,
    tags: input.tags,
    audienceIds: input.audienceIds,
    createdAt: now,
    updatedAt: now,
  };
  const next = [item, ...readSnippets()];
  writeSnippets(next);
  return next;
}

export function updateSnippet(
  id: string,
  changes: Partial<
    Pick<
      Snippet,
      | "content"
      | "kind"
      | "tone"
      | "whenToUse"
      | "whereToUse"
      | "category"
      | "tags"
      | "audienceIds"
    >
  >,
): Snippet[] {
  const next = readSnippets().map((s) =>
    s.id === id ? { ...s, ...changes, updatedAt: new Date().toISOString() } : s,
  );
  writeSnippets(next);
  return next;
}

export function deleteSnippet(id: string): Snippet[] {
  const next = readSnippets().filter((s) => s.id !== id);
  writeSnippets(next);
  return next;
}

// ---- Content types (expandable: built-ins + user-created) ------------------

export const DEFAULT_CONTENT_TYPES = createCatalogTypeLabels();

const CONTENT_TYPES_KEY = "companion-content-types-v1";

export function getCustomContentTypes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONTENT_TYPES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

// All types the user can pick from — merged and alphabetized for dropdowns.
export function getContentTypes(): string[] {
  const custom = getCustomContentTypes().filter(
    (c) => !DEFAULT_CONTENT_TYPES.includes(c),
  );
  return sortDropdownLabels([...DEFAULT_CONTENT_TYPES, ...custom]);
}

export function addContentType(name: string): string[] {
  const clean = name.trim();
  if (!clean) return getCustomContentTypes();
  const custom = getCustomContentTypes();
  if (
    custom.includes(clean) ||
    DEFAULT_CONTENT_TYPES.includes(clean) ||
    typeof window === "undefined"
  )
    return custom;
  const next = [...custom, clean];
  try {
    localStorage.setItem(CONTENT_TYPES_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
  return next;
}

export function deleteContentType(name: string): string[] {
  const next = getCustomContentTypes().filter((c) => c !== name);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONTENT_TYPES_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

// ---- Business Profile (the context brain) ---------------------------------
// Captured once in a simple flow, then fed into every generation so output is
// tailored to THIS business + THIS client, never generic.

export type BusinessProfile = {
  role: string; // Coach / Consultant / Creator / Service provider / …
  goals: string[]; // up to 2
  sells: string; // what they sell
  idealClient: string; // who they serve (free text)
  traits: string[]; // client behavior traits
  tone: string; // preferred voice
  audienceResearch: string; // distilled comms guidance from AIRA (optional)
  updatedAt: string;
};

const BIZ_PROFILE_KEY = "companion-business-profile-v1";

export function getBusinessProfile(): BusinessProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BIZ_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      role: p.role ?? "",
      goals: Array.isArray(p.goals) ? p.goals : [],
      sells: p.sells ?? "",
      idealClient: p.idealClient ?? "",
      traits: Array.isArray(p.traits) ? p.traits : [],
      tone: p.tone ?? "",
      audienceResearch: p.audienceResearch ?? "",
      updatedAt: p.updatedAt ?? "",
    };
  } catch {
    return null;
  }
}

export function saveBusinessProfile(
  changes: Partial<Omit<BusinessProfile, "updatedAt">>,
): BusinessProfile {
  const cur = getBusinessProfile() ?? {
    role: "",
    goals: [],
    sells: "",
    idealClient: "",
    traits: [],
    tone: "",
    audienceResearch: "",
    updatedAt: "",
  };
  const next: BusinessProfile = {
    ...cur,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BIZ_PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function hasBusinessProfile(): boolean {
  const p = getBusinessProfile();
  return Boolean(p && (p.role || p.sells || p.idealClient));
}

// Compact context line for AI system prompts. Returns undefined if unset.
// Pass an avatarId to target a specific client; otherwise the resolver picks
// (primary, or the only one). Folds in pinned goals + client behavior filter.
export function businessContextSummary(avatarId?: string): string | undefined {
  const p = getBusinessProfile();
  const avatar = resolveAvatar(avatarId);
  if (!p && !avatar) return undefined;
  if (p && !(p.role || p.sells || p.idealClient) && !avatar) return undefined;

  // Pinned goals = the first 1–2 in the ordered goals list.
  const goals = p?.goals ?? [];
  const pinned = goals.slice(0, 2);
  const others = goals.slice(2);

  const parts = [
    p?.role && `The user is a ${p.role}.`,
    p?.sells && `They sell: ${p.sells}.`,
    pinned.length && `PRIMARY GOAL(S): ${pinned.join(", ")} — prioritize content that moves these forward.`,
    others.length && `Other goals: ${others.join(", ")}.`,
    p?.tone && `Preferred voice: ${p.tone}.`,
    p?.audienceResearch && `Audience guidance: ${p.audienceResearch}`,
  ].filter(Boolean) as string[];

  // Client/avatar layer — who this is for + how to shape it for them.
  if (avatar) {
    const beh = avatarBehaviorGuidance(avatar);
    parts.push(
      `THIS IS FOR: ${avatar.name}${avatar.tagline ? ` — ${avatar.tagline}` : ""}.`,
    );
    if (avatar.who) parts.push(`Who they are: ${avatar.who}.`);
    if (avatar.painPoints) parts.push(`Their pain points: ${avatar.painPoints}.`);
    if (avatar.motivations) parts.push(`What drives them: ${avatar.motivations}.`);
    if (avatar.objections) parts.push(`Their objections: ${avatar.objections}.`);
    if (avatar.triggers) parts.push(`Buying triggers: ${avatar.triggers}.`);
    if (avatar.contentPrefs) parts.push(`Content they like: ${avatar.contentPrefs}.`);
    if (beh) parts.push(`Shape it for them: ${beh}.`);
    // Level 3 — deeper research refines the output further when present.
    const r = avatar.research;
    if (r) {
      const rp: string[] = [];
      if (r.behavioral) rp.push(`Behavioral patterns: ${r.behavioral}`);
      if (r.motivation) rp.push(`Motivation drivers: ${r.motivation}`);
      if (r.buying) rp.push(`Buying behavior: ${r.buying}`);
      if (r.communication) rp.push(`Communication preferences: ${r.communication}`);
      if (r.market) rp.push(`Market insights: ${r.market}`);
      if (r.notes) rp.push(`Owner's observations: ${r.notes}`);
      (r.custom ?? []).forEach((c) => {
        if (c.label && c.value) rp.push(`${c.label}: ${c.value}`);
      });
      if (rp.length)
        parts.push(`DEEPER RESEARCH (use to refine, not pad): ${rp.join(" ")}`);
    }
  } else if (p?.idealClient) {
    parts.push(`Their ideal client: ${p.idealClient}.`);
    if (p.traits.length)
      parts.push(`Those clients tend to be: ${p.traits.join(", ")}.`);
  }

  return `BUSINESS CONTEXT — tailor everything to this. ${parts.join(
    " ",
  )} Make examples, pain points, language, and CTAs fit THIS business and THIS client. Avoid generic advice.`;
}

// ---- Ideal Client avatars -------------------------------------------------

// Level 3 — optional "Research Mode" depth. Every field is optional; beginners
// stay simple, advanced users go deep. Folded into AI context when present.
export type AvatarResearch = {
  behavioral?: string; // stress reaction, procrastination, decision habits
  motivation?: string; // urgency vs calm, reward sensitivity, fear vs growth
  buying?: string; // quick-buy triggers, what delays, trust triggers
  communication?: string; // short vs detailed, emotional vs logical
  market?: string; // AI-generated industry/objection/content patterns
  notes?: string; // user's own observations about this client type
  custom?: { label: string; value: string }[]; // experiments, content ideas…
};

export type IdealClientAvatar = {
  id: string;
  name: string;
  tagline: string;
  emoji?: string;
  image?: string; // data URL when uploaded
  who: string;
  painPoints: string;
  goals: string;
  currentBehavior: string;
  solution: string;
  messagingAngle?: string;
  revenue?: string;
  isPrimary?: boolean; // the suggested default audience
  behaviorTraits?: string[]; // overwhelmed, fast decision maker, beginner, …
  // Level 2 — behavior / messaging quick fields.
  motivations?: string;
  objections?: string;
  triggers?: string; // buying / decision triggers
  contentPrefs?: string; // how they like to consume content
  // Level 3 — optional structured research.
  research?: AvatarResearch;
  createdAt: string;
  updatedAt: string;
};

// Behavior/mood traits the user can tag a client with. These are NOT
// decoration — each one is an AI behavior modifier (see avatarBehaviorGuidance).
export const CLIENT_BEHAVIOR_TRAITS = [
  "overwhelmed",
  "fast decision maker",
  "analytical",
  "overthinking",
  "motivated",
  "low energy",
  "inconsistent",
  "beginner",
  "advanced",
  "avoids complexity",
] as const;

// Emoji for each trait — used as a quick visual mood tag on avatar cards.
export const TRAIT_EMOJI: Record<string, string> = {
  overwhelmed: "😩",
  "fast decision maker": "⚡",
  analytical: "🧠",
  overthinking: "💭",
  motivated: "🔥",
  "low energy": "🪫",
  inconsistent: "🔁",
  beginner: "🌱",
  advanced: "🎓",
  "avoids complexity": "🧩",
};

const AVATARS_KEY = "companion-ideal-clients-v1";

function readAvatars(): IdealClientAvatar[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AVATARS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is IdealClientAvatar =>
        a && typeof a.id === "string" && typeof a.name === "string",
    );
  } catch {
    return [];
  }
}

function writeAvatars(list: IdealClientAvatar[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AVATARS_KEY, JSON.stringify(list));
  } catch {
    /* noop (storage full — e.g. a large uploaded image) */
  }
}

export function getAvatars(): IdealClientAvatar[] {
  return readAvatars();
}

export function saveAvatar(
  input: Partial<IdealClientAvatar> & { id?: string },
): IdealClientAvatar[] {
  const now = new Date().toISOString();
  const list = readAvatars();
  if (input.id) {
    const next = list.map((a) =>
      a.id === input.id ? { ...a, ...input, updatedAt: now } : a,
    );
    writeAvatars(next);
    return next;
  }
  const avatar: IdealClientAvatar = {
    id: newId(),
    name: input.name?.trim() || "Untitled client",
    tagline: input.tagline ?? "",
    emoji: input.emoji,
    image: input.image,
    who: input.who ?? "",
    painPoints: input.painPoints ?? "",
    goals: input.goals ?? "",
    currentBehavior: input.currentBehavior ?? "",
    solution: input.solution ?? "",
    messagingAngle: input.messagingAngle,
    revenue: input.revenue,
    isPrimary: input.isPrimary,
    behaviorTraits: input.behaviorTraits ?? [],
    motivations: input.motivations,
    objections: input.objections,
    triggers: input.triggers,
    contentPrefs: input.contentPrefs,
    research: input.research,
    createdAt: now,
    updatedAt: now,
  };
  // First avatar is the primary by default.
  if (list.length === 0) avatar.isPrimary = true;
  const next = [avatar, ...list];
  writeAvatars(next);
  return next;
}

export function deleteAvatar(id: string): IdealClientAvatar[] {
  let next = readAvatars().filter((a) => a.id !== id);
  // If we removed the primary, promote the first remaining one.
  if (next.length && !next.some((a) => a.isPrimary)) {
    next = next.map((a, i) => (i === 0 ? { ...a, isPrimary: true } : a));
  }
  writeAvatars(next);
  return next;
}

// Mark one avatar as the primary audience; clears the flag on the rest.
export function setPrimaryAvatar(id: string): IdealClientAvatar[] {
  const next = readAvatars().map((a) => ({ ...a, isPrimary: a.id === id }));
  writeAvatars(next);
  return next;
}

export function getPrimaryAvatar(): IdealClientAvatar | undefined {
  const list = readAvatars();
  return list.find((a) => a.isPrimary) ?? list[0];
}

// The avatar currently "in use" app-wide (the global switcher selection).
export function getActiveAvatar(): IdealClientAvatar | undefined {
  const id = getPrefs().activeAvatarId;
  const list = readAvatars();
  return (id && list.find((a) => a.id === id)) || getPrimaryAvatar();
}

export function setActiveAvatar(id: string): void {
  savePrefs({ activeAvatarId: id });
}

// Clone an avatar (e.g. to spin up a secondary variant quickly).
export function duplicateAvatar(id: string): IdealClientAvatar[] {
  const list = readAvatars();
  const src = list.find((a) => a.id === id);
  if (!src) return list;
  const now = new Date().toISOString();
  const copy: IdealClientAvatar = {
    ...src,
    id: newId(),
    name: `${src.name} (copy)`,
    isPrimary: false,
    createdAt: now,
    updatedAt: now,
  };
  const next = [copy, ...list];
  writeAvatars(next);
  return next;
}

// "Who is this for?" — the resolver from the AI decision layer.
// Explicit pick wins; otherwise the active (in-use) avatar; else primary/only.
export function resolveAvatar(avatarId?: string): IdealClientAvatar | undefined {
  const list = readAvatars();
  if (!list.length) return undefined;
  if (avatarId) return list.find((a) => a.id === avatarId) ?? getActiveAvatar();
  if (list.length === 1) return list[0];
  return getActiveAvatar();
}

// Behavior-filter guidance for a client — how to shape tone/length/CTA.
export function avatarBehaviorGuidance(a: IdealClientAvatar): string {
  const t = a.behaviorTraits ?? [];
  const rules: string[] = [];
  if (t.includes("overwhelmed"))
    rules.push("keep it short, calm, and one clear step");
  if (t.includes("avoids complexity"))
    rules.push("plain language, no jargon, simple structure");
  if (t.includes("fast decision maker"))
    rules.push("lead with the point and a direct CTA");
  if (t.includes("analytical"))
    rules.push("give structure, reasons, and a little proof");
  if (t.includes("overthinking"))
    rules.push("reduce options to one and add reassurance");
  if (t.includes("motivated"))
    rules.push("match their energy and give a confident push");
  if (t.includes("low energy"))
    rules.push("keep it effortless — tiny, low-pressure next step");
  if (t.includes("beginner")) rules.push("explain gently, define terms");
  if (t.includes("advanced"))
    rules.push("be specific and skip the basics");
  if (t.includes("inconsistent"))
    rules.push("reduce friction and make the next action tiny");
  return rules.join("; ");
}

// ---- Time Blocks ----------------------------------------------------------

export type BlockEnergy = "high" | "medium" | "low";
export type BlockTag = string; // free-form: defaults + user-created tags

const BLOCK_TAGS_KEY = "companion-block-tags-v2";
const DEFAULT_BLOCK_TAGS = [
  "Creation",
  "Communication",
  "Admin",
  "Thinking",
  "Deep Work",
];

export function getBlockTags(): string[] {
  if (typeof window === "undefined") return DEFAULT_BLOCK_TAGS;
  try {
    const raw = localStorage.getItem(BLOCK_TAGS_KEY);
    if (!raw) return DEFAULT_BLOCK_TAGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_BLOCK_TAGS;
  } catch {
    return DEFAULT_BLOCK_TAGS;
  }
}

export function addBlockTag(name: string): string[] {
  const t = name.trim();
  const cur = getBlockTags();
  if (!t || cur.some((x) => x.toLowerCase() === t.toLowerCase())) return cur;
  const next = [...cur, t];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BLOCK_TAGS_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}
export type BlockStatus =
  | "pending"
  | "triggered"
  | "completed"
  | "snoozed"
  | "missed";

export type TimeBlock = {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM", 24h
  durationMin: number;
  energy: BlockEnergy;
  tag?: BlockTag;
  note?: string;
  projectId?: string;
  timerEnabled?: boolean;
  status: BlockStatus;
  createdAt: string;
};

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function blockDateTime(b: TimeBlock): Date {
  const d = new Date(`${b.date || todayStr()}T00:00:00`);
  const [h, m] = b.startTime.split(":").map(Number);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

const TIME_BLOCKS_KEY = "companion-time-blocks-v1";

function readBlocks(): TimeBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TIME_BLOCKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is TimeBlock =>
        b &&
        typeof b.id === "string" &&
        typeof b.title === "string" &&
        typeof b.startTime === "string",
    );
  } catch {
    return [];
  }
}

function writeBlocks(list: TimeBlock[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TIME_BLOCKS_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

function sortBlocks(list: TimeBlock[]): TimeBlock[] {
  return [...list].sort((a, b) =>
    `${a.date ?? ""}${a.startTime}`.localeCompare(`${b.date ?? ""}${b.startTime}`),
  );
}

export function getTimeBlocks(): TimeBlock[] {
  return sortBlocks(readBlocks());
}

// Upcoming and bank blocks for a project — assignment does not remove from Time Bank.
export function timeBlocksForProject(projectId: string): TimeBlock[] {
  return getTimeBlocks().filter(
    (b) =>
      b.projectId === projectId &&
      b.status !== "completed" &&
      b.status !== "missed",
  );
}

/** Scheduled project blocks (dated, today onward). */
export function scheduledBlocksForProject(projectId: string): TimeBlock[] {
  const today = todayStr();
  return timeBlocksForProject(projectId).filter(
    (b) => b.date && b.date >= today,
  );
}

/** Unscheduled blocks assigned to a project — still in Time Bank. */
export function bankBlocksForProject(projectId: string): TimeBlock[] {
  return timeBlocksForProject(projectId).filter((b) => !b.date);
}

export function saveTimeBlock(
  input: Partial<TimeBlock> & { id?: string },
): TimeBlock[] {
  const list = readBlocks();
  if (input.id) {
    const next = list.map((b) =>
      b.id === input.id ? { ...b, ...input } : b,
    );
    writeBlocks(next);
    return sortBlocks(next);
  }
  const block: TimeBlock = {
    id: newId(),
    title: input.title?.trim() || "Untitled block",
    date: input.date ?? todayStr(),
    startTime: input.startTime ?? "09:00",
    durationMin: input.durationMin ?? 30,
    energy: input.energy ?? "medium",
    tag: input.tag,
    note: input.note,
    projectId: input.projectId,
    timerEnabled: input.timerEnabled,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const next = [...list, block];
  writeBlocks(next);
  return sortBlocks(next);
}

export function setBlockStatus(id: string, status: BlockStatus): TimeBlock[] {
  const next = readBlocks().map((b) => (b.id === id ? { ...b, status } : b));
  writeBlocks(next);
  return sortBlocks(next);
}

export function snoozeBlock(id: string, minutes: number): TimeBlock[] {
  const next = readBlocks().map((b) => {
    if (b.id !== id) return b;
    const [h, m] = b.startTime.split(":").map(Number);
    const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
    const nh = Math.floor((total % (24 * 60)) / 60);
    const nm = total % 60;
    const startTime = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
    return { ...b, startTime, status: "pending" as BlockStatus };
  });
  writeBlocks(next);
  return sortBlocks(next);
}

export function deleteTimeBlock(id: string): TimeBlock[] {
  const next = readBlocks().filter((b) => b.id !== id);
  writeBlocks(next);
  return sortBlocks(next);
}

export function formatBlockTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (h == null || m == null) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Human duration from minutes: "45m", "1h 30m", "2 days", "1 week". */
export function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  if (min < 1440) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  if (min < 10080) {
    const d = Math.round(min / 1440);
    return `${d} day${d > 1 ? "s" : ""}`;
  }
  if (min < 43200) {
    const w = Math.round(min / 10080);
    return `${w} week${w > 1 ? "s" : ""}`;
  }
  const mo = Math.round(min / 43200);
  return `${mo} month${mo > 1 ? "s" : ""}`;
}

/** "Today" / "Tomorrow" / "Mon, Jun 15" for a YYYY-MM-DD date. */
export function formatDayLabel(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return "Today";
  const t = new Date(`${today}T00:00:00`);
  t.setDate(t.getDate() + 1);
  const tomorrow = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ---- Adjust My Day (daily state that steers how Shari responds) -----------

export type DayLevel = "low" | "medium" | "high";

export type DayState = {
  energy: DayLevel;
  overwhelm: DayLevel;
  needs: string[];
  note?: string;
  setAt: string;
};

const DAY_STATE_KEY = "companion-day-state-v1";

export function getDayState(): DayState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAY_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DayState;
    if (!parsed || typeof parsed.energy !== "string") return null;
    return { ...parsed, needs: Array.isArray(parsed.needs) ? parsed.needs : [] };
  } catch {
    return null;
  }
}

export function saveDayState(
  input: Omit<DayState, "setAt">,
): DayState {
  const state: DayState = { ...input, setAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DAY_STATE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }
  return state;
}

// ---- Projects (living containers of active work) --------------------------

export type ProjectStatus =
  | "not-started"
  | "in-progress"
  | "active-focus"
  | "paused"
  | "completed";

// Time horizon — only "now" projects are actively managed by the AI.
export type ProjectHorizon = "now" | "soon" | "later";

export type Project = {
  id: string;
  name: string;
  goal: string;
  horizon: ProjectHorizon;
  status: ProjectStatus;
  nextAction: string;
  notes?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

// Calm, distinct palette projects draw from (teal / purple / gray / blue …).
export const PROJECT_PALETTE = [
  "#1e4f4f",
  "#9a6fb0",
  "#6b6b6b",
  "#2f4f7a",
  "#a85c4a",
  "#6b8e23",
  "#c08a3e",
];

// MEANING palette — calm, earthy, muted. Color quietly encodes the type.
export const CONTEXT_COLOR: Record<string, string> = {
  task: "#1e4f4f", // forest — do it
  reminder: "#c08a3e", // amber — time-based
  thought: "#6b6b6b", // gray — just a thought
  urgent: "#a85c4a", // clay red — needs attention
  emotional: "#4a6fa5", // blue — feelings
  idea: "#9a6fb0", // purple — creative
};

// DECORATIVE palette — bright, saturated, lively. A totally different feel
// from the Meaning palette, while still encoding the same types.
export const CONTEXT_COLOR_DECOR: Record<string, string> = {
  task: "#0d9488", // bright teal
  reminder: "#f59e0b", // bright amber
  thought: "#64748b", // slate
  urgent: "#ef4444", // bright red
  emotional: "#3b82f6", // bright blue
  idea: "#a855f7", // bright violet
};

// Topic colors — earthy (meaning) vs vivid (decorative).
export const TOPIC_COLOR: Record<string, string> = {
  Health: "#6b8e23",
  Work: "#1e4f4f",
  Family: "#c08a3e",
  Business: "#2f4f7a",
  Personal: "#9a6fb0",
  Ideas: "#a85c4a",
  Other: "#9a8f82",
};
export const TOPIC_COLOR_DECOR: Record<string, string> = {
  Health: "#22c55e",
  Work: "#14b8a6",
  Family: "#f59e0b",
  Business: "#6366f1",
  Personal: "#d946ef",
  Ideas: "#fb7185",
  Other: "#94a3b8",
};

export function contextColor(type?: string, mode?: string): string {
  const map = mode === "decorative" ? CONTEXT_COLOR_DECOR : CONTEXT_COLOR;
  return (type && map[type]) || (mode === "decorative" ? "#94a3b8" : "#9a8f82");
}
export function topicColor(topic?: string, mode?: string): string {
  const map = mode === "decorative" ? TOPIC_COLOR_DECOR : TOPIC_COLOR;
  return (topic && map[topic]) || (mode === "decorative" ? "#94a3b8" : "#9a8f82");
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "active-focus": "Active focus",
  paused: "Paused",
  completed: "Completed",
};

export const PROJECT_HORIZON_LABEL: Record<ProjectHorizon, string> = {
  now: "Now",
  soon: "Soon",
  later: "Parked",
};

const PROJECTS_KEY = "companion-projects-v1";

function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Project =>
        p && typeof p.id === "string" && typeof p.name === "string",
    );
  } catch {
    return [];
  }
}

function writeProjects(list: Project[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

export function getProjects(): Project[] {
  return readProjects();
}

export function saveProject(
  input: Partial<Project> & { id?: string },
): Project[] {
  const now = new Date().toISOString();
  const list = readProjects();
  if (input.id) {
    const next = list.map((p) =>
      p.id === input.id ? { ...p, ...input, updatedAt: now } : p,
    );
    writeProjects(next);
    const up = next.find((p) => p.id === input.id);
    if (up)
      setLastActivity({
        kind: "project",
        title: up.name,
        subtitle: "Project",
        projectId: up.id,
      });
    return next;
  }
  const project: Project = {
    id: newId(),
    name: input.name?.trim() || "Untitled project",
    goal: input.goal ?? "",
    horizon: input.horizon ?? "now",
    status: input.status ?? "in-progress",
    nextAction: input.nextAction ?? "",
    notes: input.notes,
    color:
      input.color ?? PROJECT_PALETTE[list.length % PROJECT_PALETTE.length]!,
    createdAt: now,
    updatedAt: now,
  };
  const next = [project, ...list];
  writeProjects(next);
  setLastActivity({
    kind: "project",
    title: project.name,
    subtitle: "Project",
    projectId: project.id,
  });
  return next;
}

export function deleteProject(id: string): Project[] {
  const next = readProjects().filter((p) => p.id !== id);
  writeProjects(next);
  deleteProjectItemsForProject(id);
  return next;
}

// ---- Project breakdown (sections → tasks → subtasks) ----------------------

export type ProjectItemKind = "section" | "task" | "subtask";

export type ProjectItem = {
  id: string;
  projectId: string;
  parentId?: string;
  kind: ProjectItemKind;
  title: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
};

const PROJECT_ITEMS_KEY = "companion-project-items-v1";

function readProjectItems(): ProjectItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECT_ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is ProjectItem =>
        i &&
        typeof i.id === "string" &&
        typeof i.projectId === "string" &&
        typeof i.title === "string",
    );
  } catch {
    return [];
  }
}

function writeProjectItems(list: ProjectItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECT_ITEMS_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

export function getProjectItems(projectId?: string): ProjectItem[] {
  const list = readProjectItems();
  const filtered = projectId
    ? list.filter((i) => i.projectId === projectId)
    : list;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveProjectItem(
  input: Partial<ProjectItem> & {
    projectId: string;
    kind: ProjectItemKind;
    title: string;
    parentId?: string;
  },
): ProjectItem[] {
  const list = readProjectItems();
  const now = new Date().toISOString();
  if (input.id) {
    const next = list.map((i) =>
      i.id === input.id ? { ...i, ...input, title: input.title.trim() || i.title } : i,
    );
    writeProjectItems(next);
    return next.filter((i) => i.projectId === input.projectId);
  }
  const siblings = list.filter(
    (i) =>
      i.projectId === input.projectId && i.parentId === input.parentId,
  );
  const item: ProjectItem = {
    id: newId(),
    projectId: input.projectId,
    parentId: input.parentId,
    kind: input.kind,
    title: input.title.trim() || "Untitled",
    done: false,
    sortOrder: siblings.length,
    createdAt: now,
  };
  const next = [...list, item];
  writeProjectItems(next);
  return next.filter((i) => i.projectId === input.projectId);
}

export function toggleProjectItemDone(id: string): ProjectItem[] {
  const list = readProjectItems();
  const target = list.find((i) => i.id === id);
  if (!target) return list;
  const next = list.map((i) =>
    i.id === id ? { ...i, done: !i.done } : i,
  );
  writeProjectItems(next);
  return next.filter((i) => i.projectId === target.projectId);
}

export function deleteProjectItem(id: string): ProjectItem[] {
  const list = readProjectItems();
  const target = list.find((i) => i.id === id);
  if (!target) return list;
  const removeIds = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const i of list) {
      if (i.parentId && removeIds.has(i.parentId) && !removeIds.has(i.id)) {
        removeIds.add(i.id);
        changed = true;
      }
    }
  }
  const next = list.filter((i) => !removeIds.has(i.id));
  writeProjectItems(next);
  return next.filter((i) => i.projectId === target.projectId);
}

function deleteProjectItemsForProject(projectId: string) {
  const next = readProjectItems().filter((i) => i.projectId !== projectId);
  writeProjectItems(next);
}

/** Open tasks and subtasks across active projects — for Day Designer. */
export function getOpenProjectTasks(limit = 12): ProjectItem[] {
  return readProjectItems()
    .filter((i) => (i.kind === "task" || i.kind === "subtask") && !i.done)
    .slice(0, limit);
}

// ---- Continue memory -----------------------------------------------------
// One record of the last meaningful thing the user was doing, so the home
// screen can offer a single 1-click "continue" re-entry. Not a history list.
export type LastActivity = {
  kind: "draft" | "project" | "chat";
  title: string;
  subtitle?: string;
  contentType?: string; // for drafts: email / post / plan …
  content?: string; // partial draft to restore
  projectId?: string;
  summary?: string; // for chat: a short recap of what was being discussed
  ts: string;
};
const LAST_ACTIVITY_KEY = "companion-last-activity-v1";
export function getLastActivity(): LastActivity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw);
    if (a && typeof a.title === "string" && typeof a.kind === "string")
      return a as LastActivity;
  } catch {
    /* noop */
  }
  return null;
}
export function setLastActivity(a: Omit<LastActivity, "ts">): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      JSON.stringify({ ...a, ts: new Date().toISOString() }),
    );
    pushRecentWork(a);
  } catch {
    /* noop */
  }
}
export function clearLastActivity(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    /* noop */
  }
}

// ---- Recent work (home resume picker — not shown until user asks) -----------
export type RecentWorkItem = Omit<LastActivity, "ts"> & {
  id: string;
  ts: string;
};

const RECENT_WORK_KEY = "companion-recent-work-v1";
const RECENT_WORK_MAX = 8;

function recentWorkId(a: Omit<LastActivity, "ts">): string {
  if (a.kind === "project" && a.projectId) return `project:${a.projectId}`;
  if (a.kind === "draft") {
    return `draft:${(a.contentType ?? "content").toLowerCase()}:${a.title.trim().toLowerCase()}`;
  }
  return `chat:${a.title.trim().toLowerCase()}`;
}

export function getRecentWorkItems(): RecentWorkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_WORK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is RecentWorkItem =>
        x &&
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        typeof x.kind === "string" &&
        typeof x.ts === "string",
    );
  } catch {
    return [];
  }
}

export function pushRecentWork(a: Omit<LastActivity, "ts">): void {
  if (typeof window === "undefined") return;
  if (!a.title?.trim()) return;
  try {
    const id = recentWorkId(a);
    const item: RecentWorkItem = {
      ...a,
      id,
      ts: new Date().toISOString(),
    };
    const next = [
      item,
      ...getRecentWorkItems().filter((x) => x.id !== id),
    ].slice(0, RECENT_WORK_MAX);
    localStorage.setItem(RECENT_WORK_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function clearDayState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DAY_STATE_KEY);
  } catch {
    /* noop */
  }
}

/** A compact line describing the day state, for the AI system prompt. */
export function dayStateSummary(state: DayState | null): string | undefined {
  if (!state) return undefined;
  const needs = state.needs.length ? state.needs.join(", ") : "—";
  const note = state.note?.trim() ? ` Note: ${state.note.trim()}` : "";
  return `Energy: ${state.energy}. Overwhelm: ${state.overwhelm}. Needs most: ${needs}.${note}`;
}

// ---- Settings + Profile preferences ---------------------------------------

export type AiTone =
  | "calm"
  | "balanced"
  | "direct"
  | "minimal"
  | "gentle"
  | "encouraging"
  | "playful";

// Color: none, meaning-based (fixed category colors), or dynamic (adaptive
// tints + brighter accents). Legacy "light"/"full" values normalize on read.
export type VisualMode = "off" | "meaning" | "decorative";

// How much weekly pattern reflection the user wants.
export type PatternAwareness = "off" | "light" | "guided" | "active";

// Plan tiers. Voice is a paid feature; minutes are metered per month.
// (Real plan assignment + billing is a backend concern — this is the scaffold.)
export type Plan = "essential" | "voice-lite" | "voice-pro";
export const PLAN_LABEL: Record<Plan, string> = {
  essential: "Essential",
  "voice-lite": "Voice Lite",
  "voice-pro": "Voice Pro",
};
export const PLAN_VOICE_MINUTES: Record<Plan, number> = {
  essential: 0,
  "voice-lite": 30,
  "voice-pro": 120,
};

// How Shari behaves (separate from tone = how it sounds).
export type HelpMode = "step-by-step" | "ask-first" | "direct" | "navigate";

// How support feels — empathy vs action balance, plus an overwhelm-safe SOS.
export type SupportStyle = "solutions" | "understand" | "balanced" | "sos";

export type Prefs = {
  aiTone: AiTone;
  helpMode: HelpMode;
  supportStyle: SupportStyle;
  timeBlockAlerts: boolean;
  desktopNotifications: boolean;
  visualMode: VisualMode;
  patternAwareness: PatternAwareness;
  plan: Plan;
  activeAvatarId: string; // the client avatar currently "in use" app-wide
  advancedAiTools: boolean; // unlocks Multi-Avatar output mode (opt-in)
  onboarded: boolean; // has the user completed (or skipped) first-run onboarding
  hasChatted: boolean; // has the user ever sent a message (returning vs first-time)
  name: string;
  email: string;
  howToMemory: string;
  // Connections — where finished content gets sent / pasted.
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
} & LanguageCommunicationPrefs;

const PREFS_KEY = "companion-prefs-v1";

const DEFAULT_PREFS: Prefs = {
  aiTone: "balanced",
  helpMode: "ask-first",
  supportStyle: "balanced",
  timeBlockAlerts: true,
  desktopNotifications: true,
  visualMode: "off",
  patternAwareness: "light",
  plan: "essential",
  activeAvatarId: "",
  advancedAiTools: false,
  onboarded: false,
  hasChatted: false,
  name: "",
  email: "",
  howToMemory: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  ...DEFAULT_LANGUAGE_COMMUNICATION,
};

// Map legacy color values so older saved prefs keep working.
export function normalizeVisualMode(v: unknown): VisualMode {
  if (v === "light") return "meaning";
  if (v === "full") return "decorative";
  if (v === "meaning" || v === "decorative" || v === "off") return v;
  return "off";
}

export function getPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    const merged = { ...DEFAULT_PREFS, ...parsed };
    merged.visualMode = normalizeVisualMode(merged.visualMode);
    Object.assign(merged, normalizeLanguageCommunication(merged));
    return merged;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(update: Partial<Prefs>): Prefs {
  const next = { ...getPrefs(), ...update };
  Object.assign(next, normalizeLanguageCommunication(next));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("companion-prefs-updated"));
    } catch {
      /* noop */
    }
    if (languagePrefsPatch(update)) {
      void pushLanguagePrefsToUser(extractLanguagePrefs(next));
    }
  }
  return next;
}

// ---- Voice usage meter ---------------------------------------------------
// Tracks spoken seconds per calendar month so paid tiers can be metered.
// (Client-side scaffold; real enforcement happens with backend billing.)
const VOICE_USAGE_KEY = "companion-voice-usage-v1";
function voiceMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}
export function getVoiceSecondsUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(VOICE_USAGE_KEY);
    const o = raw ? JSON.parse(raw) : null;
    if (o && o.month === voiceMonth()) return o.seconds || 0;
  } catch {
    /* noop */
  }
  return 0;
}
export function addVoiceSeconds(sec: number): void {
  if (typeof window === "undefined" || !sec || sec < 0) return;
  try {
    const seconds = getVoiceSecondsUsed() + sec;
    localStorage.setItem(
      VOICE_USAGE_KEY,
      JSON.stringify({ month: voiceMonth(), seconds }),
    );
  } catch {
    /* noop */
  }
}
export function getVoiceStatus(): {
  plan: Plan;
  capMin: number;
  usedMin: number;
  leftMin: number;
  hasVoice: boolean;
} {
  const plan = getPrefs().plan;
  const capMin = PLAN_VOICE_MINUTES[plan];
  const usedMin = getVoiceSecondsUsed() / 60;
  return {
    plan,
    capMin,
    usedMin,
    leftMin: Math.max(0, capMin - usedMin),
    hasVoice: capMin > 0,
  };
}
