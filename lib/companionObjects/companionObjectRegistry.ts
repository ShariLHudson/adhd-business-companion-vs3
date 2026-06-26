/**
 * Companion Object Language™ — central registry for Signature Objects™.
 * Production UI should reference this registry (not Unicode emoji) for feature identity.
 */

export type CompanionObjectAssetStatus = "placeholder" | "needed" | "approved";

export type CompanionObject = {
  id: string;
  label: string;
  replacesEmoji?: string;
  feature?: string;
  room?: string;
  objectName: string;
  description: string;
  emotionalPurpose: string;
  assetStatus: CompanionObjectAssetStatus;
  assetPath?: string;
};

function obj(
  partial: Omit<CompanionObject, "assetStatus"> &
    Partial<Pick<CompanionObject, "assetStatus">>,
): CompanionObject {
  return { assetStatus: "placeholder", ...partial };
}

/** Companion Object Registry™ — single source of truth for warm homestead objects. */
export const COMPANION_OBJECT_REGISTRY: readonly CompanionObject[] = [
  // ── Primary workspaces (initial object map) ─────────────────────────────
  obj({
    id: "clear-my-mind",
    label: "Clear My Mind™",
    feature: "Clear My Mind™",
    replacesEmoji: "🧠",
    room: "window-seat",
    objectName: "Leather journal",
    description: "Brain-dump and thought capture at the window seat.",
    emotionalPurpose: "Make it safe to unload without organizing yet.",
  }),
  obj({
    id: "todays-reality",
    label: "Today's Reality™",
    feature: "Today's Reality™",
    replacesEmoji: "🙂",
    room: "kitchen-table",
    objectName: "Morning mug and notebook",
    description: "Honest capacity check before the day runs away.",
    emotionalPurpose: "Ground in what is actually possible today.",
  }),
  obj({
    id: "plan-my-day",
    label: "Plan My Day™",
    feature: "Plan My Day™",
    replacesEmoji: "📅",
    room: "planning-table",
    objectName: "Open leather planner",
    description: "Daily planning surface — one day, one gentle plan.",
    emotionalPurpose: "Turn overwhelm into one next thing.",
  }),
  obj({
    id: "decision-compass",
    label: "Decision Compass™",
    feature: "Decision Compass™",
    replacesEmoji: "🧭",
    room: "outlook-point",
    objectName: "Brass compass",
    description: "Structured decision support without pressure.",
    emotionalPurpose: "Help choose a direction without shame.",
  }),
  obj({
    id: "focus-audio",
    label: "Focus Audio™",
    feature: "Focus Audio™",
    replacesEmoji: "🎧",
    room: "focus-studio",
    objectName: "Premium headphones",
    description: "Soundscapes and saved audio for focus and calm.",
    emotionalPurpose: "Support regulation without leaving the homestead.",
  }),
  obj({
    id: "breathing",
    label: "Breathing™",
    feature: "Breathing™",
    replacesEmoji: "🌬️",
    room: "focus-studio",
    objectName: "Lit candle",
    description: "Guided breath and nervous-system reset.",
    emotionalPurpose: "Slow the body before asking for more output.",
  }),
  obj({
    id: "games",
    label: "Games™",
    feature: "Games™",
    replacesEmoji: "🎲",
    room: "focus-studio",
    objectName: "Wooden puzzle",
    description: "Playful momentum resets organized by brain need.",
    emotionalPurpose: "Offer dopamine without productivity guilt.",
  }),
  obj({
    id: "create",
    label: "Create™",
    feature: "Create™",
    replacesEmoji: "🎨",
    room: "creative-studio",
    objectName: "Sketchbook with paint brushes",
    description: "Content and artifact creation workspace.",
    emotionalPurpose: "Invite making without perfection pressure.",
  }),
  obj({
    id: "business",
    label: "Business™",
    feature: "Business™",
    replacesEmoji: "📈",
    room: "business-office",
    objectName: "Leather portfolio",
    description: "Strategy, playbook, and business operations.",
    emotionalPurpose: "Hold business work as serious but human.",
  }),
  obj({
    id: "learning",
    label: "Learning™",
    feature: "Learning™",
    replacesEmoji: "📚",
    room: "library",
    objectName: "Stack of books",
    description: "Courses, guides, and skill building.",
    emotionalPurpose: "Learn in warm context — not a classroom UI.",
  }),
  obj({
    id: "reading",
    label: "Reading Nook™",
    feature: "Reading Nook™",
    replacesEmoji: "📖",
    room: "reading-nook",
    objectName: "Open book with reading glasses",
    description: "Saved reading and reference material.",
    emotionalPurpose: "Quiet focus for long-form thinking.",
  }),
  obj({
    id: "parking-lot",
    label: "Parking Lot™",
    feature: "Parking Lot™",
    replacesEmoji: "📝",
    room: "workshop",
    objectName: "Seed packet / idea box",
    description: "Ideas held for later without losing them.",
    emotionalPurpose: "Park without guilt — return when ready.",
  }),
  obj({
    id: "evidence-bank",
    label: "Evidence Bank™",
    feature: "Evidence Bank™",
    replacesEmoji: "📊",
    room: "business-office",
    objectName: "Keepsake box",
    description: "Proof of impact and progress over time.",
    emotionalPurpose: "Make wins tangible when confidence dips.",
  }),
  obj({
    id: "wins",
    label: "Wins™",
    feature: "Wins™",
    replacesEmoji: "🏆",
    room: "garden-path",
    objectName: "Framed accomplishment",
    description: "Weekly wins and recent progress.",
    emotionalPurpose: "Celebrate without performative hustle.",
  }),
  obj({
    id: "growth",
    label: "Growth™",
    feature: "Growth™",
    replacesEmoji: "🌱",
    room: "greenhouse",
    objectName: "Growing plant",
    description: "Outcome goals, journey, and growth reports.",
    emotionalPurpose: "Show progress as living — not a scoreboard.",
  }),
  obj({
    id: "calendar",
    label: "Calendar",
    feature: "Calendar",
    replacesEmoji: "🗓️",
    room: "planning-table",
    objectName: "Desktop calendar",
    description: "Time blocks and schedule view.",
    emotionalPurpose: "Make time visible without calendar anxiety.",
  }),
  obj({
    id: "projects",
    label: "Projects",
    feature: "Projects",
    replacesEmoji: "📁",
    room: "workshop",
    objectName: "Project binder",
    description: "Active work organized by outcome.",
    emotionalPurpose: "Hold projects as craft — not endless lists.",
  }),
  obj({
    id: "messages",
    label: "Messages",
    feature: "Chat",
    replacesEmoji: "💬",
    room: "living-room",
    objectName: "Handwritten note",
    description: "Companion conversation home.",
    emotionalPurpose: "Feel like talking with someone at the table.",
  }),
  obj({
    id: "settings",
    label: "Settings",
    feature: "Settings",
    replacesEmoji: "⚙️",
    room: "front-porch",
    objectName: "Vintage brass key",
    description: "Preferences and account controls.",
    emotionalPurpose: "Personal space you control quietly.",
  }),
  obj({
    id: "search",
    label: "Search",
    feature: "Search",
    replacesEmoji: "🔍",
    room: "library",
    objectName: "Magnifying glass",
    description: "Find help, tools, and saved work.",
    emotionalPurpose: "Discover without hunting through menus.",
  }),
  obj({
    id: "notifications",
    label: "Notifications",
    feature: "Notifications",
    replacesEmoji: "🔔",
    room: "kitchen-table",
    objectName: "Small desk bell",
    description: "Gentle reminders and nudges.",
    emotionalPurpose: "Notify without alarm energy.",
  }),
  obj({
    id: "help",
    label: "Help",
    feature: "How Do I?",
    replacesEmoji: "❓",
    room: "library",
    objectName: "Open guidebook",
    description: "How-to walkthroughs and feature guidance.",
    emotionalPurpose: "Explain before opening — never surprise-route.",
  }),
  // ── Focus & momentum variants ───────────────────────────────────────────
  obj({
    id: "focus-my-brain",
    label: "Focus",
    feature: "Focus",
    replacesEmoji: "🎯",
    room: "focus-studio",
    objectName: "Brass desk lamp",
    description: "Focus hub — timer, audio, breathing, games.",
    emotionalPurpose: "One door into regulation and momentum.",
  }),
  obj({
    id: "spin-wheel",
    label: "Spin the Wheel",
    feature: "Spin Wheel",
    replacesEmoji: "🎡",
    room: "focus-studio",
    objectName: "Wooden decision wheel",
    description: "Randomized next-step picker.",
    emotionalPurpose: "Remove decision friction playfully.",
  }),
  obj({
    id: "strategies",
    label: "Strategies",
    feature: "Strategies",
    replacesEmoji: "📋",
    room: "reading-nook",
    objectName: "Strategy card deck",
    description: "Personal and business coping strategies.",
    emotionalPurpose: "Offer tools without clinical tone.",
  }),
  obj({
    id: "toolbelt-saved-work",
    label: "Saved Work",
    feature: "Saved™",
    replacesEmoji: "📂",
    room: "workshop",
    objectName: "Labeled archive box",
    description: "Saved artifacts and outputs.",
    emotionalPurpose: "Find finished work without digging.",
  }),
  obj({
    id: "templates",
    label: "Templates",
    feature: "Templates",
    replacesEmoji: "📚",
    room: "library",
    objectName: "Template folio",
    description: "Reusable patterns and starters.",
    emotionalPurpose: "Start from something warm — not a blank page.",
  }),
  obj({
    id: "toolbelt-snippets",
    label: "Snippets",
    feature: "Snippets",
    replacesEmoji: "🧩",
    room: "workshop",
    objectName: "Snippet card box",
    description: "Reusable text fragments.",
    emotionalPurpose: "Reuse without hunting through old chats.",
  }),
  obj({
    id: "email-generator",
    label: "Email Generator",
    feature: "Email Generator",
    replacesEmoji: "✉️",
    room: "creative-studio",
    objectName: "Fountain pen and stationery",
    description: "Draft emails with companion help.",
    emotionalPurpose: "Make outreach feel human.",
  }),
  obj({
    id: "my-highlights",
    label: "My Highlights",
    feature: "My Highlights",
    replacesEmoji: "✨",
    room: "garden-path",
    objectName: "Confidence keepsake shelf",
    description: "Saved praise, credentials, and meaningful moments.",
    emotionalPurpose: "Remember worth on hard days.",
  }),
  obj({
    id: "celebration-reset",
    label: "Nice reset",
    feature: "Celebration",
    replacesEmoji: "🎉",
    room: "garden",
    objectName: "Garden celebration lantern",
    description: "Playful break complete.",
    emotionalPurpose: "Close the loop warmly — no guilt.",
  }),
  // ── Momentum game categories ────────────────────────────────────────────
  obj({
    id: "momentum-focus-attention",
    label: "Focus & Attention",
    objectName: "Brass focus bell",
    room: "focus-studio",
    description: "Games when scattered or distracted.",
    emotionalPurpose: "Re-center attention gently.",
  }),
  obj({
    id: "momentum-action",
    label: "Momentum & Action",
    objectName: "Starter domino tile",
    room: "workshop",
    description: "Games when you cannot start.",
    emotionalPurpose: "Create motion without a lecture.",
  }),
  obj({
    id: "momentum-creative-spark",
    label: "Creative Spark",
    objectName: "Paint palette",
    room: "creative-studio",
    description: "Games for ideas and inspiration.",
    emotionalPurpose: "Invite play that unlocks thinking.",
  }),
  obj({
    id: "momentum-mental-vacation",
    label: "Mental Vacation",
    objectName: "Porch swing cushion",
    room: "back-deck",
    description: "Games when overwhelmed.",
    emotionalPurpose: "Permission to rest briefly.",
  }),
  obj({
    id: "momentum-just-for-fun",
    label: "Just For Fun",
    objectName: "Dice cup",
    room: "living-room",
    description: "Pure dopamine — no productivity goal.",
    emotionalPurpose: "Joy without justification.",
  }),
  obj({
    id: "other-tools",
    label: "More tools",
    objectName: "Tool caddy",
    room: "workshop",
    description: "Secondary utilities and libraries.",
    emotionalPurpose: "Keep advanced tools reachable but calm.",
  }),
];

const REGISTRY_BY_ID = new Map(
  COMPANION_OBJECT_REGISTRY.map((entry) => [entry.id, entry]),
);

const REGISTRY_BY_EMOJI = new Map(
  COMPANION_OBJECT_REGISTRY.filter((e) => e.replacesEmoji).map((entry) => [
    entry.replacesEmoji!,
    entry,
  ]),
);

export function companionObjectById(id: string): CompanionObject | undefined {
  return REGISTRY_BY_ID.get(id);
}

export function companionObjectByEmoji(emoji: string): CompanionObject | undefined {
  return REGISTRY_BY_EMOJI.get(emoji);
}

export function objectIdForEmoji(emoji: string, fallback = "other-tools"): string {
  return companionObjectByEmoji(emoji)?.id ?? fallback;
}

/** Resolve homestead object id from legacy emoji or an existing object id. */
export function resolveCompanionObjectId(
  emojiOrId: string | undefined,
  fallback = "other-tools",
): string {
  const raw = emojiOrId?.trim();
  if (!raw) return fallback;
  if (companionObjectById(raw)) return raw;
  return objectIdForEmoji(raw, fallback);
}

export function companionObjectRoom(id: string): string {
  return companionObjectById(id)?.room ?? "living-room";
}

/** Strategy library group headers */
export const STRATEGY_GROUP_OBJECT_ID: Record<"personal" | "business", string> = {
  personal: "clear-my-mind",
  business: "business",
};

/** Strategy subcategory cards */
export const STRATEGY_CATEGORY_OBJECT_ID: Record<string, string> = {
  overwhelm: "breathing",
  procrastination: "plan-my-day",
  focus: "focus-audio",
  perfectionism: "create",
  burnout: "breathing",
  "emotional-regulation": "messages",
  "decision-making": "decision-compass",
  "future-thinking": "plan-my-day",
  visibility: "business",
  memory: "clear-my-mind",
  marketing: "business",
  sales: "business",
  content: "create",
  offers: "business",
  pricing: "business",
  systems: "projects",
  "customer-relations": "messages",
  productivity: "plan-my-day",
  planning: "calendar",
  "business-decisions": "decision-compass",
};

/** Saved audio bucket labels in Focus Audio */
export const AUDIO_SAVED_CATEGORY_OBJECT_ID: Record<string, string> = {
  focus: "focus-audio",
  calm: "breathing",
  energy: "todays-reality",
  sleep: "breathing",
  affirmations: "messages",
  meditation: "breathing",
  other: "toolbelt-saved-work",
};

/** Growth center section headers */
export const GROWTH_SECTION_OBJECT_ID: Record<string, string> = {
  growth: "growth",
  "wins-this-week": "wins",
  "evidence-bank": "evidence-bank",
  "confidence-vault": "my-highlights",
  "my-journey": "growth",
};

/** New project source picker */
export const PROJECT_SOURCE_OBJECT_ID: Record<string, string> = {
  blank: "projects",
  template: "learning",
  strategy: "strategies",
  "brain-dump": "clear-my-mind",
};
