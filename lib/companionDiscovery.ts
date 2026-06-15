/**
 * Companion discovery — gradual "getting to know you," not a setup wizard.
 * First visit: welcome + up to 3 questions (one day). After that: one question per session.
 */

import {
  getBusinessProfile,
  saveBusinessProfile,
  savePrefs,
  type AiTone,
  type HelpMode,
  type SupportStyle,
} from "@/lib/companionStore";
import { saveRecognitionStore } from "@/lib/recognition";

const STORE_KEY = "companion-discovery-v2";
const LEGACY_KEY = "companion-progressive-discovery-v1";

export type DiscoverySectionId =
  | "first-visit"
  | "business-profile"
  | "understanding-brain"
  | "companion-preferences"
  | "business-intelligence"
  | "relationship-intelligence";

export type DiscoveryQuestionId =
  | "why-here"
  | "describes-you"
  | "remember-things"
  | "business-name"
  | "who-you-help"
  | "growth-goal"
  | "stuck-pattern"
  | "hardest-often"
  | "best-work-time"
  | "communication-style"
  | "celebrations-prefs"
  | "project-reminders"
  | "primary-offers"
  | "content-creation"
  | "business-challenge"
  | "remember-people"
  | "follow-up-reminders";

export type DiscoveryPhase = "first-visit" | "progressive";

export type DiscoveryQuestion = {
  id: DiscoveryQuestionId;
  section: DiscoverySectionId;
  phase: DiscoveryPhase;
  prompt: string;
  why: string;
  options: string[];
  examples?: string[];
  allowCustom?: boolean;
};

export const DISCOVERY_SECTION_LABELS: Record<
  DiscoverySectionId,
  { title: string; blurb: string }
> = {
  "first-visit": {
    title: "First visit",
    blurb: "How we started getting to know each other.",
  },
  "business-profile": {
    title: "Business profile",
    blurb: "Your business, audience, and goals.",
  },
  "understanding-brain": {
    title: "Understanding your brain",
    blurb: "How you work best and where friction shows up.",
  },
  "companion-preferences": {
    title: "Companion preferences",
    blurb: "How I communicate and what to remember.",
  },
  "business-intelligence": {
    title: "Business intelligence",
    blurb: "Offers, content, and recurring challenges.",
  },
  "relationship-intelligence": {
    title: "Relationship intelligence",
    blurb: "People and follow-up preferences.",
  },
};

export const FIRST_VISIT_QUESTION_IDS: DiscoveryQuestionId[] = [
  "why-here",
  "describes-you",
  "remember-things",
];

export const ALL_DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "why-here",
    section: "first-visit",
    phase: "first-visit",
    prompt: "What brought you here today?",
    why: "This helps me understand what kind of support would be most helpful.",
    options: [
      "Overwhelm",
      "Focus",
      "Planning",
      "Following Through",
      "Growing My Business",
      "Understanding My ADHD",
      "Something Else",
    ],
    allowCustom: true,
  },
  {
    id: "describes-you",
    section: "first-visit",
    phase: "first-visit",
    prompt: "What best describes you?",
    why: "This helps me tailor examples and suggestions to your work.",
    options: [
      "Coach",
      "Consultant",
      "Author",
      "Speaker",
      "Service Business",
      "Creative",
      "Entrepreneur",
      "Other",
    ],
    allowCustom: true,
  },
  {
    id: "remember-things",
    section: "first-visit",
    phase: "first-visit",
    prompt: "Would you like me to remember things for you?",
    why: "This helps me reduce repetition and support you more effectively.",
    examples: ["Projects", "Ideas", "Important People", "Helpful Strategies"],
    options: ["Yes", "Ask Me First", "No"],
  },
  {
    id: "business-name",
    section: "business-profile",
    phase: "progressive",
    prompt: "What's your business called?",
    why: "This helps me personalize business support.",
    options: [],
    allowCustom: true,
  },
  {
    id: "who-you-help",
    section: "business-profile",
    phase: "progressive",
    prompt: "Who do you help?",
    why: "This helps me create better content and suggestions.",
    examples: [
      "ADHD Entrepreneurs",
      "Women Over 40",
      "Small Businesses",
      "Coaches",
      "Authors",
      "Consultants",
    ],
    options: [
      "ADHD Entrepreneurs",
      "Women Over 40",
      "Small Businesses",
      "Coaches",
      "Authors",
      "Consultants",
      "Something Else",
    ],
    allowCustom: true,
  },
  {
    id: "growth-goal",
    section: "business-profile",
    phase: "progressive",
    prompt: "What are you trying to grow?",
    why: "This helps me align recommendations with your goals.",
    options: [
      "Revenue",
      "Audience",
      "Membership",
      "Speaking",
      "Coaching",
      "Product Sales",
      "Other",
    ],
    allowCustom: true,
  },
  {
    id: "stuck-pattern",
    section: "understanding-brain",
    phase: "progressive",
    prompt: "When you get stuck, what usually happens?",
    why: "This helps me offer support that matches your experience.",
    options: [
      "Can't Start",
      "Too Many Ideas",
      "Too Many Tasks",
      "Perfectionism",
      "Low Energy",
      "Decision Fatigue",
      "Something Else",
    ],
    allowCustom: true,
  },
  {
    id: "hardest-often",
    section: "understanding-brain",
    phase: "progressive",
    prompt: "What feels hardest most often?",
    why: "This helps me understand where friction tends to happen.",
    options: [
      "Planning",
      "Prioritizing",
      "Following Through",
      "Organization",
      "Time Management",
      "Emotional Regulation",
    ],
  },
  {
    id: "best-work-time",
    section: "understanding-brain",
    phase: "progressive",
    prompt: "When do you usually do your best work?",
    why: "This helps me make better planning suggestions.",
    options: ["Morning", "Afternoon", "Evening", "It Depends"],
  },
  {
    id: "communication-style",
    section: "companion-preferences",
    phase: "progressive",
    prompt: "How would you like me to communicate?",
    why: "This changes my communication style, not my abilities.",
    options: ["Balanced", "Direct", "Gentle", "Encouraging", "Minimal", "Playful"],
  },
  {
    id: "celebrations-prefs",
    section: "companion-preferences",
    phase: "progressive",
    prompt: "Would you like celebrations?",
    why: "Some people love recognition. Others prefer less.",
    options: [
      "Birthdays",
      "Business Milestones",
      "Membership Anniversaries",
      "Vacation Countdowns",
      "Family Events",
      "None",
    ],
  },
  {
    id: "project-reminders",
    section: "companion-preferences",
    phase: "progressive",
    prompt: "Would you like reminders about unfinished projects?",
    why: "This helps me respect your preferences.",
    options: ["Yes", "Sometimes", "Only If I Ask", "Never"],
  },
  {
    id: "primary-offers",
    section: "business-intelligence",
    phase: "progressive",
    prompt: "What are your primary offers?",
    why: "This helps me support content and business growth.",
    examples: [
      "Coaching",
      "Membership",
      "Workshops",
      "Speaking",
      "Courses",
      "Products",
    ],
    options: [
      "Coaching",
      "Membership",
      "Workshops",
      "Speaking",
      "Courses",
      "Products",
      "Something Else",
    ],
    allowCustom: true,
  },
  {
    id: "content-creation",
    section: "business-intelligence",
    phase: "progressive",
    prompt: "Do you regularly create content?",
    why: "This helps me provide relevant creation support.",
    options: ["Blog", "Social Media", "Email", "Video", "Podcast", "No"],
  },
  {
    id: "business-challenge",
    section: "business-intelligence",
    phase: "progressive",
    prompt: "What business challenge shows up most often?",
    why: "This helps me understand where support may be most valuable.",
    options: [
      "Consistency",
      "Marketing",
      "Visibility",
      "Sales",
      "Follow-Up",
      "Organization",
      "Time",
    ],
  },
  {
    id: "remember-people",
    section: "relationship-intelligence",
    phase: "progressive",
    prompt: "Would you like me to remember important people?",
    why: "This can help with follow-up and relationship management.",
    examples: ["Clients", "Prospects", "Team Members", "Family"],
    options: ["Yes", "Ask Me First", "No"],
  },
  {
    id: "follow-up-reminders",
    section: "relationship-intelligence",
    phase: "progressive",
    prompt: "Would follow-up reminders be helpful?",
    why: "This helps me know when to nudge gently.",
    options: ["Yes", "Sometimes", "Only If I Ask", "Never"],
  },
];

export type DiscoveryStore = {
  disabled: boolean;
  disabledSections: DiscoverySectionId[];
  answers: Partial<Record<DiscoveryQuestionId, string>>;
  skippedIds: DiscoveryQuestionId[];
  firstVisitComplete: boolean;
  welcomeSeen: boolean;
  lastAskedSession: string | null;
  lastAskedAt: string | null;
};

const EMPTY_STORE: DiscoveryStore = {
  disabled: false,
  disabledSections: [],
  answers: {},
  skippedIds: [],
  firstVisitComplete: false,
  welcomeSeen: false,
  lastAskedSession: null,
  lastAskedAt: null,
};

function sessionKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function migrateLegacy(): Partial<DiscoveryStore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as {
      disabled?: boolean;
      answered?: Record<string, string>;
      lastAskedSession?: string | null;
    };
    const map: Partial<Record<DiscoveryQuestionId, string>> = {};
    const legacyMap: Record<string, DiscoveryQuestionId> = {
      "why-here": "why-here",
      "work-type": "describes-you",
      memory: "remember-things",
      communication: "communication-style",
      celebrations: "celebrations-prefs",
      planning: "hardest-often",
      business: "business-name",
    };
    for (const [k, v] of Object.entries(p.answered ?? {})) {
      const id = legacyMap[k];
      if (id && v) map[id] = v;
    }
    const firstIds = FIRST_VISIT_QUESTION_IDS;
    const firstVisitComplete = firstIds.every((id) => Boolean(map[id]));
    return {
      disabled: Boolean(p.disabled),
      answers: map,
      firstVisitComplete,
      welcomeSeen: firstVisitComplete,
      lastAskedSession: p.lastAskedSession ?? null,
    };
  } catch {
    return {};
  }
}

export function getDiscoveryStore(): DiscoveryStore {
  if (typeof window === "undefined") return { ...EMPTY_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const migrated = migrateLegacy();
      if (Object.keys(migrated).length > 0) {
        const next = { ...EMPTY_STORE, ...migrated };
        writeDiscoveryStore(next);
        return next;
      }
      return { ...EMPTY_STORE };
    }
    const p = JSON.parse(raw) as Partial<DiscoveryStore>;
    return {
      ...EMPTY_STORE,
      ...p,
      disabledSections: Array.isArray(p.disabledSections) ? p.disabledSections : [],
      answers: p.answers ?? {},
      skippedIds: Array.isArray(p.skippedIds) ? p.skippedIds : [],
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

export function writeDiscoveryStore(update: Partial<DiscoveryStore>): DiscoveryStore {
  const next = { ...getDiscoveryStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("companion-discovery-updated"));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function getQuestion(id: DiscoveryQuestionId): DiscoveryQuestion | undefined {
  return ALL_DISCOVERY_QUESTIONS.find((q) => q.id === id);
}

function isFirstVisitQuestionDone(
  id: DiscoveryQuestionId,
  store: Pick<DiscoveryStore, "answers" | "skippedIds">,
): boolean {
  return Boolean(store.answers[id]) || store.skippedIds.includes(id);
}

function isFirstVisitRoundComplete(
  store: Pick<DiscoveryStore, "answers" | "skippedIds">,
): boolean {
  return FIRST_VISIT_QUESTION_IDS.every((id) => isFirstVisitQuestionDone(id, store));
}

export function discoveryProgressSummary(): {
  discoveriesMade: number;
  label: string;
} {
  const count = Object.keys(getDiscoveryStore().answers).length;
  const word = count === 1 ? "discovery" : "discoveries";
  return {
    discoveriesMade: count,
    label: `${count} ${word} made`,
  };
}

/** Home discovery card — e.g. "1 discovery completed". */
export function discoveryCompletedLabel(): string {
  const count = Object.keys(getDiscoveryStore().answers).length;
  if (count === 0) return "No discoveries yet";
  return count === 1 ? "1 discovery completed" : `${count} discoveries completed`;
}

/** One discovery question per session — after meaningful chat usage. */
export function nextHomeDiscoveryQuestion(
  input: ProgressiveDiscoveryInput,
): DiscoveryQuestion | null {
  const now = input.now ?? new Date();
  const store = getDiscoveryStore();
  if (store.disabled || !input.hasMeaningfulUsage) return null;
  if (store.lastAskedSession === sessionKey(now)) return null;

  if (!store.firstVisitComplete) {
    if (!store.welcomeSeen) {
      markWelcomeSeen();
    }
    return nextFirstVisitQuestion();
  }
  return nextProgressiveQuestion(input);
}

export function isFirstVisitComplete(): boolean {
  return getDiscoveryStore().firstVisitComplete;
}

export function shouldShowFirstVisitWelcome(): boolean {
  const s = getDiscoveryStore();
  return !s.firstVisitComplete && !s.welcomeSeen;
}

export function markWelcomeSeen() {
  writeDiscoveryStore({ welcomeSeen: true });
}

/** Next unanswered first-visit question, or null if all done. */
export function nextFirstVisitQuestion(): DiscoveryQuestion | null {
  const store = getDiscoveryStore();
  if (store.firstVisitComplete) return null;
  const id = FIRST_VISIT_QUESTION_IDS.find((qid) => !isFirstVisitQuestionDone(qid, store));
  return id ? getQuestion(id) ?? null : null;
}

export function completeFirstVisit(now = new Date()) {
  writeDiscoveryStore({
    firstVisitComplete: true,
    welcomeSeen: true,
    lastAskedSession: sessionKey(now),
    lastAskedAt: now.toISOString(),
  });
  markUserOnboardedLocal();
}

function markUserOnboardedLocal() {
  savePrefs({ onboarded: true });
}

export type ProgressiveDiscoveryInput = {
  hasMeaningfulUsage: boolean;
  now?: Date;
};

/** One progressive question per session, after first visit + meaningful usage. */
export function nextProgressiveQuestion(
  input: ProgressiveDiscoveryInput,
): DiscoveryQuestion | null {
  const now = input.now ?? new Date();
  const store = getDiscoveryStore();
  if (store.disabled) return null;
  if (!store.firstVisitComplete) return null;
  if (!input.hasMeaningfulUsage) return null;
  if (store.lastAskedSession === sessionKey(now)) return null;

  const next = ALL_DISCOVERY_QUESTIONS.find(
    (q) =>
      q.phase === "progressive" &&
      !store.disabledSections.includes(q.section) &&
      !store.answers[q.id],
  );
  return next ?? null;
}

export function discoveryDisabled(): boolean {
  return getDiscoveryStore().disabled;
}

export function disableDiscovery() {
  writeDiscoveryStore({ disabled: true });
}

export function enableDiscovery() {
  writeDiscoveryStore({ disabled: false });
}

export function disableDiscoverySection(section: DiscoverySectionId) {
  const disabledSections = [...getDiscoveryStore().disabledSections];
  if (!disabledSections.includes(section)) disabledSections.push(section);
  writeDiscoveryStore({ disabledSections });
}

export function enableDiscoverySection(section: DiscoverySectionId) {
  writeDiscoveryStore({
    disabledSections: getDiscoveryStore().disabledSections.filter((s) => s !== section),
  });
}

export function isSectionDisabled(section: DiscoverySectionId): boolean {
  return getDiscoveryStore().disabledSections.includes(section);
}

export function clearDiscoveryAnswer(id: DiscoveryQuestionId) {
  const store = getDiscoveryStore();
  const answers = { ...store.answers };
  delete answers[id];
  const skippedIds = store.skippedIds.filter((sid) => sid !== id);
  const firstVisitComplete = isFirstVisitRoundComplete({ answers, skippedIds });
  writeDiscoveryStore({ answers, skippedIds, firstVisitComplete });
}

export function restartDiscovery() {
  writeDiscoveryStore({ ...EMPTY_STORE });
}

export function updateDiscoveryAnswer(id: DiscoveryQuestionId, answer: string) {
  recordDiscoveryAnswer(id, answer, { skipSessionLimit: true });
}

function applyDiscoveryAnswer(id: DiscoveryQuestionId, answer: string) {
  if (id === "why-here" && /overwhelm/i.test(answer)) {
    savePrefs({ supportStyle: "sos" satisfies SupportStyle });
  }
  if (id === "describes-you") {
    saveBusinessProfile({ role: answer });
  }
  if (id === "business-name") {
    saveBusinessProfile({ sells: answer });
  }
  if (id === "who-you-help") {
    saveBusinessProfile({ idealClient: answer });
  }
  if (id === "growth-goal") {
    const cur = getBusinessProfile();
    const goals = cur?.goals?.length ? [answer, ...cur.goals.slice(1)] : [answer];
    saveBusinessProfile({ goals: goals.slice(0, 2) });
  }
  if (id === "communication-style") {
    const map: Record<string, AiTone> = {
      Balanced: "balanced",
      Direct: "direct",
      Gentle: "gentle",
      Encouraging: "encouraging",
      Minimal: "minimal",
      Playful: "playful",
    };
    const tone = map[answer];
    if (tone) savePrefs({ aiTone: tone });
  }
  if (id === "celebrations-prefs") {
    if (answer === "None") {
      saveRecognitionStore({ celebrationMode: "off" });
    } else {
      saveRecognitionStore({ celebrationMode: "full" });
    }
  }
  if (id === "hardest-often") {
    const map: Record<string, HelpMode> = {
      Planning: "ask-first",
      Prioritizing: "ask-first",
      "Following Through": "step-by-step",
      Organization: "navigate",
      "Time Management": "navigate",
      "Emotional Regulation": "ask-first",
    };
    const mode = map[answer];
    if (mode) savePrefs({ helpMode: mode });
  }
}

export function recordDiscoveryAnswer(
  id: DiscoveryQuestionId,
  answer: string,
  opts?: { skipSessionLimit?: boolean; now?: Date },
) {
  const now = opts?.now ?? new Date();
  const store = getDiscoveryStore();
  const answers = { ...store.answers, [id]: answer };
  const skippedIds = store.skippedIds.filter((sid) => sid !== id);
  const firstVisitDone = isFirstVisitRoundComplete({ answers, skippedIds });

  writeDiscoveryStore({
    answers,
    skippedIds,
    firstVisitComplete: firstVisitDone || store.firstVisitComplete,
    welcomeSeen: true,
    lastAskedSession: opts?.skipSessionLimit ? store.lastAskedSession : sessionKey(now),
    lastAskedAt: now.toISOString(),
  });

  applyDiscoveryAnswer(id, answer);

  if (firstVisitDone && !store.firstVisitComplete) {
    markUserOnboardedLocal();
  }
}

export function skipDiscoveryQuestion(id: DiscoveryQuestionId, now = new Date()) {
  const store = getDiscoveryStore();
  const skippedIds = store.skippedIds.includes(id)
    ? store.skippedIds
    : [...store.skippedIds, id];
  const firstVisitDone = isFirstVisitRoundComplete({ answers: store.answers, skippedIds });
  writeDiscoveryStore({
    skippedIds,
    firstVisitComplete: firstVisitDone || store.firstVisitComplete,
    welcomeSeen: true,
    lastAskedSession: sessionKey(now),
    lastAskedAt: now.toISOString(),
  });
  if (firstVisitDone && !store.firstVisitComplete) {
    markUserOnboardedLocal();
  }
}

export function skipDiscoveryForSession(now = new Date()) {
  const store = getDiscoveryStore();
  const firstVisitDone = isFirstVisitRoundComplete(store);
  writeDiscoveryStore({
    lastAskedSession: sessionKey(now),
    lastAskedAt: now.toISOString(),
    firstVisitComplete: firstVisitDone || store.firstVisitComplete,
    welcomeSeen: true,
  });
}

/** Summary for companion prompt context. */
export function discoveryContextForChat(): string {
  const { answers } = getDiscoveryStore();
  const lines = ALL_DISCOVERY_QUESTIONS.filter((q) => answers[q.id])
    .map((q) => `${q.prompt} ${answers[q.id]}`);
  return lines.length ? lines.join("; ") : "";
}
