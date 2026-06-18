/**
 * App Feature Knowledge — authoritative navigation/how-to for Companion chat.
 * Source of truth: docs-companion-intelligence/22_App_Feature_Knowledge.md
 * and verified UI (FocusAreaPanel, companionUi, SettingsPanel, StrategiesPanel).
 */

import { isConceptTeachingRequest } from "./teachingMode";

export type AppFeatureId =
  | "focus"
  | "clear-my-mind"
  | "brain-parking-lot"
  | "safe-for-today"
  | "focus-session"
  | "breathe"
  | "focus-audio"
  | "time-block"
  | "momentum-games"
  | "spin-wheel"
  | "help-me-right-now"
  | "create"
  | "templates"
  | "strategies"
  | "projects"
  | "how-do-i"
  | "settings"
  | "profile"
  | "client-avatars"
  | "snippets"
  | "adjust-my-day"
  | "settings-appearance";

export type AppFeatureEntry = {
  id: AppFeatureId;
  name: string;
  /** User-facing navigation path */
  navigation: string;
  howTo: string;
  /** Patterns that indicate this feature is what the user means */
  match: RegExp[];
};

export const APP_FEATURE_UNSURE =
  "I can help you find that, but I need to check the current app layout.";

export const APP_FEATURES: AppFeatureEntry[] = [
  {
    id: "focus",
    name: "Focus",
    navigation: "Sidebar **Focus**",
    howTo:
      "Calm support menu — expand **Start Here**, **Focus Tools**, or **Momentum Boosters** for timers, audio, games, and more.",
    match: [/\bfocus\b(?!\s*session|\s*audio)/i, /\bfocus menu\b/i],
  },
  {
    id: "clear-my-mind",
    name: "Clear My Mind",
    navigation: "Sidebar **Focus** → **Start Here** → **Clear My Mind**",
    howTo:
      "Reduce mental clutter — capture thoughts, group ideas, find priorities, shape next steps. One card per thought.",
    match: [
      /\bclear my mind\b/i,
      /\bbrain dump\b/i,
      /\bmental clutter\b/i,
      /\bcrowded (head|brain)\b/i,
      /\btoo many thoughts\b/i,
    ],
  },
  {
    id: "brain-parking-lot",
    name: "Brain Parking Lot",
    navigation:
      "Sidebar **Focus** → **Momentum Boosters** → **Help Me Right Now** → **Brain Parking Lot**",
    howTo:
      "Save a stray idea for later while staying on task — quick park and tag, no sorting now.",
    match: [
      /\bbrain parking lot\b/i,
      /\bpark (?:this|that|it) for later\b/i,
      /\bsave (?:this|that|it) for later\b/i,
      /\bidea (?:just )?popped up\b/i,
    ],
  },
  {
    id: "safe-for-today",
    name: "Safe For Today",
    navigation:
      "Sidebar **Focus** → **Momentum Boosters** → **Help Me Right Now** → **Safe For Today**",
    howTo:
      "Permission to postpone — name what you're not solving today; relief, not a worry list.",
    match: [/\bsafe for today\b/i, /\bpermission not to\b/i, /\bnot doing this today\b/i],
  },
  {
    id: "focus-session",
    name: "Focus Session",
    navigation: "Sidebar **Focus** → **Start Here** → **Focus Session**",
    howTo:
      "Answer a few quick questions, then work with a timer on one task.",
    match: [/\bfocus session\b/i, /\bpomodoro\b/i, /\bfocus timer\b/i],
  },
  {
    id: "breathe",
    name: "Breathe & Reset",
    navigation: "Sidebar **Focus** → **Focus Tools** → **Breathe & Reset**",
    howTo: "Grounding exercise to calm your nervous system and regroup.",
    match: [/\bbreathe\b/i, /\breset\b/i, /\bgrounding\b/i],
  },
  {
    id: "focus-audio",
    name: "Focus Audio",
    navigation: "Sidebar **Focus** → **Focus Tools** → **Focus Audio**",
    howTo:
      "Background sound categories (Focus, Calm, Energy, etc.); you can also add your own link.",
    match: [
      /\bfocus audio\b/i,
      /\bbackground (?:sound|music|audio)\b/i,
      /\blisten(?:ing)? (?:to )?music\b/i,
    ],
  },
  {
    id: "time-block",
    name: "Momentum Appointments",
    navigation: "Sidebar **Focus** → **Focus Tools** → **Block Out Time**",
    howTo:
      "Set a gentle intention — what to move forward, how long, and when. Success is movement, not perfection.",
    match: [
      /\btime blocks?\b/i,
      /\bmomentum appointments?\b/i,
      /\bblock out time\b/i,
      /\bblock(?:ing)? time\b/i,
    ],
  },
  {
    id: "momentum-games",
    name: "Momentum Games",
    navigation:
      "Sidebar **Focus** → expand **Momentum Boosters** → **Momentum Games**",
    howTo:
      "Fifteen playful mini-games — pattern, memory, speed, and more. Built into the app under Focus.",
    match: [
      /\bmomentum games?\b/i,
      /\bfind the games?\b/i,
      /\b(?:where|how).*\bgames?\b/i,
      /\bmini[- ]?games?\b/i,
      /\bplay (?:a )?game\b/i,
    ],
  },
  {
    id: "spin-wheel",
    name: "Spin The Wheel",
    navigation:
      "Sidebar **Focus** → **Momentum Boosters** → **Spin The Wheel**",
    howTo:
      "Let the wheel pick one thing when everything feels equally important.",
    match: [/\bspin(?:ning)? (?:the )?wheel\b/i, /\bwheel\b/i],
  },
  {
    id: "help-me-right-now",
    name: "Help Me Right Now",
    navigation:
      "Sidebar **Focus** → **Momentum Boosters** → **Help Me Right Now**",
    howTo:
      "Quick strategies for calm, focus, decisions, and energy — each solves a different problem.",
    match: [/\bhelp me right now\b/i, /\bright now\b.*\bstrateg/i],
  },
  {
    id: "snippets",
    name: "Snippets",
    navigation: "Sidebar **More** → **Snippets**",
    howTo:
      "Reusable text blocks saved on this device — create, edit, and use them in Create or chat.",
    match: [
      /\bsnippets?\b/i,
      /\breusable text\b/i,
      /\btext snippets?\b/i,
    ],
  },
  {
    id: "create",
    name: "Create",
    navigation: "Sidebar **Create**",
    howTo:
      "Pick category → type → answer questions one at a time → build draft → improve → export.",
    match: [
      /\bcreate\b(?!\s*a\s+(?:marketing|business)\s+strateg)/i,
      /\bcontent generator\b/i,
      /\bgenerate content\b/i,
    ],
  },
  {
    id: "templates",
    name: "Templates",
    navigation: "Sidebar **More** → **Templates**",
    howTo:
      "Reusable starting points saved on this device. **Build With Shari** opens a chat to adapt a template together — nothing is drafted until you agree. Start from blank is for advanced users who want to edit the framework directly.",
    match: [/\btemplates?\b/i, /\btemplate library\b/i],
  },
  {
    id: "strategies",
    name: "Strategies",
    navigation: "Sidebar **More** → **Strategies**",
    howTo:
      "Choose **ADHD Strategies** to apply a technique now, or **Business Strategies** to build a plan with Shari one question at a time.",
    match: [
      /\bstrateg(?:y|ies)\b/i,
      /\bplaybook\b/i,
      /\badhd strateg/i,
      /\bbusiness strateg/i,
    ],
  },
  {
    id: "projects",
    name: "Projects",
    navigation: "Sidebar **More** → **Projects**",
    howTo:
      "Active work in one place — tasks, time blocks, notes, and files. Open from **More → Projects**; ask Shari from a project or jump into a time block when you're ready to work.",
    match: [/\bprojects?\b/i],
  },
  {
    id: "how-do-i",
    name: "How Do I",
    navigation: "Sidebar **More** → **How Do I**",
    howTo:
      "Search how the app works, read short guides, or ask Shari in chat.",
    match: [/\bhow do i\b.*\bapp\b/i, /\bhow-do-i\b/i],
  },
  {
    id: "settings",
    name: "Settings",
    navigation: "Top bar **⋯** menu → **Settings**",
    howTo:
      "System preferences — tone, language, connections, celebrations, and **Appearance** (colors).",
    match: [/\bsettings?\b/i, /\bpreferences?\b/i],
  },
  {
    id: "profile",
    name: "Profile",
    navigation: "Top bar **⋯** menu → **Profile**",
    howTo:
      "Name, account, communication style, and **Memory & appearance** (links to color settings).",
    match: [/\bprofile\b/i, /\bmy account\b/i],
  },
  {
    id: "client-avatars",
    name: "Client Avatars",
    navigation: "Top bar **⋯** menu → **Client Avatars**",
    howTo: "Client/persona profiles for content tailored to specific audiences.",
    match: [/\bclient avatars?\b/i, /\bavatars?\b/i],
  },
  {
    id: "adjust-my-day",
    name: "Adjust My Day",
    navigation: "Top bar **⋯** menu → **Adjust My Day**",
    howTo:
      "Tune today's plan to how you feel and what energy you have.",
    match: [/\badjust my day\b/i, /\benergy\b.*\bday\b/i],
  },
  {
    id: "settings-appearance",
    name: "Appearance / Colors",
    navigation:
      "Top bar **⋯** → **Settings** → **Appearance** (or **Profile** → **Memory & appearance**)",
    howTo:
      "Pick a visual color mode: **Adaptive Colors**, **Category Colors**, or **Minimal** — preview, then save.",
    match: [
      /\bcolor/i,
      /\bappearance\b/i,
      /\bvisual mode\b/i,
      /\bchange the colors?\b/i,
      /\btheme\b/i,
    ],
  },
];

/** Compact reference always included in the system prompt. */
export const APP_FEATURE_KNOWLEDGE_COMPACT = `APP FEATURE KNOWLEDGE (authoritative — use for how-to/navigation; never deny these):
• Focus hub: Sidebar Focus → Start Here / Focus Tools / Momentum Boosters
• Clear My Mind: Focus → Start Here → Clear My Mind
• Focus Session: Focus → Start Here → Focus Session
• Breathe & Reset: Focus → Focus Tools → Breathe & Reset
• Focus Audio: Focus → Focus Tools → Focus Audio
• Time Blocks: Focus → Focus Tools → Block Out Time
• Momentum Games: Focus → Momentum Boosters → Momentum Games (games ARE in the app)
• Spin The Wheel: Focus → Momentum Boosters → Spin The Wheel
• Help Me Right Now: Focus → Momentum Boosters → Help Me Right Now
• Snippets: More → Snippets (reusable text blocks)
• Create: Sidebar Create
• Templates: More → Templates (reusable starting points on this device; Build With Shari in chat before drafting)
• Strategies: More → Strategies → ADHD Strategies or Business Strategies
• Projects: More → Projects (tasks, time blocks, notes, files)
• How Do I: More → How Do I
• Settings: ⋯ menu → Settings (Appearance for colors)
• Profile: ⋯ menu → Profile (Memory & appearance → colors)
• Client Avatars: ⋯ menu → Client Avatars
• Adjust My Day: ⋯ menu → Adjust My Day
If unsure about layout: "${APP_FEATURE_UNSURE}" — do NOT invent features or deny listed ones.`;

function scoreFeature(text: string, entry: AppFeatureEntry): number {
  let score = 0;
  for (const re of entry.match) {
    if (re.test(text)) score += 1;
  }
  return score;
}

/** Match user text to relevant app features, best matches first. */
export function matchAppFeatures(text: string): AppFeatureEntry[] {
  const t = text.trim();
  if (!t) return [];

  const scored = APP_FEATURES.map((entry) => ({
    entry,
    score: scoreFeature(t, entry),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Color/appearance questions should prefer appearance over generic settings
  if (/\bcolor|appearance|visual mode|theme\b/i.test(t)) {
    const appearance = scored.find((s) => s.entry.id === "settings-appearance");
    if (appearance) {
      return [
        appearance.entry,
        ...scored
          .filter((s) => s.entry.id !== "settings-appearance")
          .map((s) => s.entry),
      ];
    }
  }

  // Games questions should prefer momentum-games over generic focus
  if (/\bgames?\b/i.test(t)) {
    const games = scored.find((s) => s.entry.id === "momentum-games");
    if (games) {
      return [
        games.entry,
        ...scored
          .filter((s) => s.entry.id !== "momentum-games")
          .map((s) => s.entry),
      ];
    }
  }

  return scored.map((s) => s.entry);
}

export function isAppHowToQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isConceptTeachingRequest(t)) return false;

  if (/\bhow do i\b/i.test(t)) {
    if (matchAppFeatures(t).length > 0) return true;
    if (
      /\b(?:find|open|change|access|use)\b/i.test(t) &&
      /\b(?:app|settings|games?|focus|templates?|strateg|sidebar|color)/i.test(
        t,
      )
    ) {
      return true;
    }
    return false;
  }
  if (/\bhow to (?:use|find|open|change|get|access)\b/i.test(t)) {
    if (matchAppFeatures(t).length > 0) return true;
    if (/\b(?:this app|the app|settings|sidebar)\b/i.test(t)) return true;
    return false;
  }
  if (/\bwhere (?:is|are|do i find|can i find)\b/i.test(t)) return true;
  if (/\bchange the colors?\b/i.test(t)) return true;
  if (/\bcan you (?:show|tell) me (?:how|where)\b/i.test(t)) return true;

  return matchAppFeatures(t).length > 0 && /\?/.test(t);
}

export type AppFeatureAnswer = {
  featureIds: AppFeatureId[];
  navigation: string;
  howTo: string;
};

/** Deterministic answer for tests and routing hints. */
export function resolveAppFeatureKnowledge(text: string): AppFeatureAnswer | null {
  const matches = matchAppFeatures(text);
  if (!matches.length) return null;

  const primary = matches[0]!;
  return {
    featureIds: matches.map((m) => m.id),
    navigation: primary.navigation,
    howTo: primary.howTo,
  };
}

/** Per-turn hint injected into companion-chat intentHint. */
export function appFeatureKnowledgeHintForChat(text: string): string | undefined {
  const t = text.trim();
  if (!t) return undefined;

  const matches = matchAppFeatures(t);
  const isHowTo = isAppHowToQuestion(t);

  if (!isHowTo && !matches.length) return undefined;

  if (!matches.length) {
    return (
      `APP HOW-TO: User may be asking about app navigation or features. ` +
      `Answer ONLY from APP FEATURE KNOWLEDGE in the system prompt. ` +
      `Do NOT deny features that exist in that list. If unsure: "${APP_FEATURE_UNSURE}"`
    );
  }

  const lines = matches.slice(0, 3).map(
    (f) => `• **${f.name}**: ${f.navigation} — ${f.howTo}`,
  );

  return [
    "APP FEATURE KNOWLEDGE (authoritative for this turn — use this, not general AI knowledge):",
    ...lines,
    "COMPANION FIRST: Give a 1–2 sentence brief answer, then offer to open this feature/workspace BESIDE chat — do NOT stop at navigation instructions.",
    "Do NOT open Create to draft an explanation. Do NOT send users to documentation.",
    "Answer with the exact navigation path only if they decline the offer. Do NOT say these features are missing or unavailable.",
    `If the question is outside this list: "${APP_FEATURE_UNSURE}"`,
  ].join("\n");
}
