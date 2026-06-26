import type { CompanionPlaceId } from "../types";

/**
 * Companion Object Library™ — central registry for Signature Objects™.
 * Every feature, nav item, and room affordance should reference this library
 * instead of Unicode emoji. Phase 1: registry only — no UI replacement yet.
 *
 * Distinct from Signature Object Library™ (one anchor per place).
 */

export const COMPANION_OBJECT_CATEGORIES = [
  "planning",
  "focus",
  "creative",
  "business",
  "reflection",
  "hospitality",
  "seasonal",
  "celebration",
  "learning",
  "memory",
  "nature",
  "navigation",
] as const;

export type CompanionObjectCategory = (typeof COMPANION_OBJECT_CATEGORIES)[number];

export type CompanionObjectArtworkStatus = "needs-artwork" | "in-progress" | "ready";

export type CompanionObjectEntry = {
  id: string;
  /** Human-facing feature or affordance name. */
  feature: string;
  currentEmoji: string;
  signatureObject: string;
  /** Homestead room / place where this object belongs. */
  room: CompanionPlaceId;
  category: CompanionObjectCategory;
  style: string;
  lightingProfile: string;
  seasonalVariants: string[];
  motionCompatible: boolean;
  transparentAsset: boolean;
  future3D: boolean;
  artworkStatus: CompanionObjectArtworkStatus;
  notes: string;
};

const DEFAULT_STYLE =
  "Warm Homestead Realism™ — semi-realistic illustrative, natural materials, soft morning-window light, soft depth, transparent assets, never clip art. See docs/companion-homestead/VISUAL_DESIGN_BIBLE.md.";
const DEFAULT_LIGHTING = "soft-morning-window";

function entry(
  partial: Omit<CompanionObjectEntry, "style" | "lightingProfile" | "seasonalVariants" | "transparentAsset" | "future3D" | "artworkStatus"> &
    Partial<
      Pick<
        CompanionObjectEntry,
        | "style"
        | "lightingProfile"
        | "seasonalVariants"
        | "transparentAsset"
        | "future3D"
        | "artworkStatus"
      >
    >,
): CompanionObjectEntry {
  return {
    style: DEFAULT_STYLE,
    lightingProfile: DEFAULT_LIGHTING,
    seasonalVariants: [],
    transparentAsset: true,
    future3D: true,
    artworkStatus: "needs-artwork",
    ...partial,
  };
}

/** Companion Object Library™ — single source of truth for feature iconography. */
export const COMPANION_OBJECT_LIBRARY: readonly CompanionObjectEntry[] = [
  // ── Primary companion workspaces (user-specified mappings) ──────────────
  entry({
    id: "clear-my-mind",
    feature: "Clear My Mind™",
    currentEmoji: "🧠",
    signatureObject: "Leather journal",
    room: "window-seat",
    category: "reflection",
    lightingProfile: "window-seat-diffused",
    seasonalVariants: ["autumn-knit", "spring-bloom"],
    motionCompatible: false,
    notes: "Primary brain-dump workspace. Replaces 🧠 across top bar, sidebar, strategies, stress routing.",
  }),
  entry({
    id: "plan-my-day",
    feature: "Plan My Day™",
    currentEmoji: "📅",
    signatureObject: "Open leather planner",
    room: "planning-table",
    category: "planning",
    lightingProfile: "planning-table-daylight",
    seasonalVariants: ["holiday-ribbon", "summer-bright"],
    motionCompatible: false,
    notes: "Daily decision workspace — not a long-term task manager.",
  }),
  entry({
    id: "todays-reality",
    feature: "Today's Reality™",
    currentEmoji: "🙂",
    signatureObject: "Morning mug and notebook",
    room: "kitchen-table",
    category: "reflection",
    lightingProfile: "kitchen-morning-steam",
    seasonalVariants: ["winter-cocoa", "summer-iced-tea"],
    motionCompatible: true,
    notes: "Also represented as 🌤️ in top bar today — unify to one object.",
  }),
  entry({
    id: "decision-compass",
    feature: "Decision Compass™",
    currentEmoji: "🧭",
    signatureObject: "Elegant brass compass",
    room: "outlook-point",
    category: "reflection",
    lightingProfile: "brass-catchlight",
    motionCompatible: false,
    notes: "Decision map / exploration flows share this anchor.",
  }),
  entry({
    id: "focus-studio",
    feature: "Focus Studio™",
    currentEmoji: "🎧",
    signatureObject: "Premium headphones",
    room: "focus-studio",
    category: "focus",
    lightingProfile: "focus-desk-lamp",
    motionCompatible: false,
    notes: "Focus audio, pomodoro, and focus hub converge here.",
  }),
  entry({
    id: "breathing",
    feature: "Breathing™",
    currentEmoji: "🌬️",
    signatureObject: "Lit candle",
    room: "focus-studio",
    category: "focus",
    lightingProfile: "candle-flicker-soft",
    seasonalVariants: ["winter-pine", "spring-linen"],
    motionCompatible: true,
    notes: "Breathe panel and stress-routing breathe option.",
  }),
  entry({
    id: "games",
    feature: "Games™",
    currentEmoji: "🎲",
    signatureObject: "Wooden puzzle",
    room: "living-room",
    category: "celebration",
    lightingProfile: "living-room-afternoon",
    motionCompatible: true,
    notes: "Momentum games hub — playful resets, not casino energy.",
  }),
  entry({
    id: "create",
    feature: "Create™",
    currentEmoji: "🎨",
    signatureObject: "Sketchbook with paint brushes",
    room: "creative-studio",
    category: "creative",
    lightingProfile: "studio-north-light",
    seasonalVariants: ["autumn-palette", "spring-watercolor"],
    motionCompatible: false,
    notes: "Content generator, templates, and create catalog parent.",
  }),
  entry({
    id: "business",
    feature: "Business™",
    currentEmoji: "📈",
    signatureObject: "Leather portfolio",
    room: "business-office",
    category: "business",
    lightingProfile: "office-window-balanced",
    motionCompatible: false,
    notes: "Business profile, playbook, and my-work business flows.",
  }),
  entry({
    id: "learning",
    feature: "Learning™",
    currentEmoji: "📚",
    signatureObject: "Stack of books",
    room: "library",
    category: "learning",
    lightingProfile: "library-reading-lamp",
    motionCompatible: false,
    notes: "How Do I ecosystem and learn nav item.",
  }),
  entry({
    id: "reading",
    feature: "Reading™",
    currentEmoji: "📖",
    signatureObject: "Open hardcover book",
    room: "reading-nook",
    category: "learning",
    lightingProfile: "reading-nook-pool",
    motionCompatible: false,
    notes: "Growth reports, journey book, reading-quiet hospitality profile.",
  }),
  entry({
    id: "parking-lot",
    feature: "Parking Lot™",
    currentEmoji: "📝",
    signatureObject: "Seed packet / idea box",
    room: "garden-path",
    category: "planning",
    lightingProfile: "garden-path-dappled",
    motionCompatible: false,
    notes: "Deferred ideas — also 🅿️ in toolbelt; unify both.",
  }),
  entry({
    id: "evidence-bank",
    feature: "Evidence Bank™",
    currentEmoji: "⭐",
    signatureObject: "Keepsake box",
    room: "library",
    category: "memory",
    lightingProfile: "keepsake-warm-glow",
    motionCompatible: false,
    notes: "Also 📈 in growth cards — map both emoji usages here.",
  }),
  entry({
    id: "wins",
    feature: "Wins™",
    currentEmoji: "🏆",
    signatureObject: "Framed accomplishment",
    room: "fire-circle",
    category: "celebration",
    lightingProfile: "fire-circle-evening",
    seasonalVariants: ["holiday-garland"],
    motionCompatible: false,
    notes: "Wins This Week and weekly wins flows.",
  }),
  entry({
    id: "growth",
    feature: "Growth™",
    currentEmoji: "🌱",
    signatureObject: "Growing plant",
    room: "greenhouse",
    category: "nature",
    lightingProfile: "greenhouse-diffused",
    seasonalVariants: ["spring-sprout", "summer-full", "autumn-harvest"],
    motionCompatible: true,
    notes: "Growth center hub — wins, evidence, highlights, journey.",
  }),

  // ── Navigation & system affordances (user-specified) ────────────────────
  entry({
    id: "calendar",
    feature: "Calendar",
    currentEmoji: "🗓️",
    signatureObject: "Desktop calendar",
    room: "planning-table",
    category: "planning",
    motionCompatible: false,
    notes: "Time blocks, Google Calendar links, schedule actions.",
  }),
  entry({
    id: "projects",
    feature: "Projects",
    currentEmoji: "📁",
    signatureObject: "Project binder",
    room: "barn",
    category: "business",
    motionCompatible: false,
    notes: "Projects panel, saved browse, workspace mode.",
  }),
  entry({
    id: "messages",
    feature: "Messages",
    currentEmoji: "💬",
    signatureObject: "Handwritten note",
    room: "living-room",
    category: "hospitality",
    motionCompatible: false,
    notes: "Chat workspace, new conversation, talk-it-through flows.",
  }),
  entry({
    id: "settings",
    feature: "Settings",
    currentEmoji: "⚙️",
    signatureObject: "Vintage brass key",
    room: "front-porch",
    category: "navigation",
    motionCompatible: false,
    notes: "Settings panel and toolbelt — intimate, not industrial gear.",
  }),
  entry({
    id: "search",
    feature: "Search",
    currentEmoji: "🔍",
    signatureObject: "Magnifying glass",
    room: "library",
    category: "navigation",
    motionCompatible: false,
    notes: "How Do I search, saved work search, toolbelt search.",
  }),
  entry({
    id: "notifications",
    feature: "Notifications",
    currentEmoji: "🔔",
    signatureObject: "Small desk bell",
    room: "kitchen-table",
    category: "hospitality",
    motionCompatible: true,
    notes: "Reminders, time-block alerts, test sound.",
  }),
  entry({
    id: "help",
    feature: "Help",
    currentEmoji: "❓",
    signatureObject: "Open guidebook",
    room: "library",
    category: "learning",
    motionCompatible: false,
    notes: "How Do I sidebar, help articles, onboarding guides.",
  }),

  // ── House Map™ navigation (companionLayoutSystem) ───────────────────────
  entry({
    id: "nav-home",
    feature: "Home",
    currentEmoji: "🏡",
    signatureObject: "Welcome mat with open door light",
    room: "living-room",
    category: "hospitality",
    motionCompatible: false,
    notes: "House Map home — living room entry.",
  }),
  entry({
    id: "nav-focus",
    feature: "Focus",
    currentEmoji: "🎯",
    signatureObject: "Desk timer",
    room: "focus-studio",
    category: "focus",
    motionCompatible: false,
    notes: "House Map focus — distinct from Focus Studio headphones.",
  }),
  entry({
    id: "nav-todays-reality-kitchen",
    feature: "Today's Reality (kitchen cue)",
    currentEmoji: "🍵",
    signatureObject: "Steaming tea cup",
    room: "kitchen-table",
    category: "hospitality",
    lightingProfile: "kitchen-morning-steam",
    motionCompatible: true,
    notes: "Interim House Map emoji — consolidate with todays-reality object.",
  }),
  entry({
    id: "nav-clear-my-mind-window",
    feature: "Clear My Mind (window cue)",
    currentEmoji: "🪟",
    signatureObject: "Folded blanket on window seat",
    room: "window-seat",
    category: "reflection",
    motionCompatible: false,
    notes: "Interim House Map emoji — consolidate with leather journal.",
  }),
  entry({
    id: "nav-plan-my-day-planner",
    feature: "Plan My Day (planner cue)",
    currentEmoji: "📝",
    signatureObject: "Fountain pen on planner",
    room: "planning-table",
    category: "planning",
    motionCompatible: false,
    notes: "Interim House Map emoji — consolidate with open leather planner.",
  }),

  // ── Toolbelt™ items ─────────────────────────────────────────────────────
  entry({
    id: "toolbelt-new-conversation",
    feature: "New Conversation",
    currentEmoji: "💬",
    signatureObject: "Handwritten note",
    room: "living-room",
    category: "hospitality",
    motionCompatible: false,
    notes: "Alias of messages — same asset.",
  }),
  entry({
    id: "toolbelt-my-thoughts",
    feature: "My Thoughts",
    currentEmoji: "💭",
    signatureObject: "Stack of index cards",
    room: "window-seat",
    category: "reflection",
    motionCompatible: false,
    notes: "Thought companion box, thinking space collections.",
  }),
  entry({
    id: "toolbelt-templates",
    feature: "Templates",
    currentEmoji: "📋",
    signatureObject: "Template folio",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Templates library, snippets, SOPs.",
  }),
  entry({
    id: "toolbelt-saved-work",
    feature: "Saved Work",
    currentEmoji: "💾",
    signatureObject: "Labeled document box",
    room: "library",
    category: "memory",
    motionCompatible: false,
    notes: "Saved browse, saved work library.",
  }),
  entry({
    id: "toolbelt-snippets",
    feature: "Snippets",
    currentEmoji: "✂️",
    signatureObject: "Ribbon-tied note stack",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Quick-copy content fragments.",
  }),

  // ── Sidebar & top bar companions ────────────────────────────────────────
  entry({
    id: "chat-workspace",
    feature: "Chat Workspace",
    currentEmoji: "💬",
    signatureObject: "Handwritten note",
    room: "living-room",
    category: "hospitality",
    motionCompatible: false,
    notes: "Top bar chat dropdown — shares messages asset.",
  }),
  entry({
    id: "visual-thinking",
    feature: "Visual Thinking",
    currentEmoji: "💡",
    signatureObject: "Desk sketch lamp",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Visual focus studio, brain dump visual view.",
  }),
  entry({
    id: "focus-my-brain",
    feature: "Focus My Brain",
    currentEmoji: "🚧",
    signatureObject: "Focus gate bookmark",
    room: "focus-studio",
    category: "focus",
    motionCompatible: false,
    notes: "Sidebar focus entry — regulation before action.",
  }),
  entry({
    id: "other-tools",
    feature: "Other",
    currentEmoji: "➕",
    signatureObject: "Tool drawer pull",
    room: "workshop",
    category: "navigation",
    motionCompatible: false,
    notes: "My Work hub overflow — workshop cabinetry metaphor.",
  }),
  entry({
    id: "profile",
    feature: "Profile",
    currentEmoji: "👤",
    signatureObject: "Framed portrait nook",
    room: "living-room",
    category: "memory",
    motionCompatible: false,
    notes: "Profile panel, client avatars, ideal client builder.",
  }),

  // ── Growth ecosystem ────────────────────────────────────────────────────
  entry({
    id: "my-highlights",
    feature: "My Highlights",
    currentEmoji: "✨",
    signatureObject: "Pressed flower bookmark",
    room: "reading-nook",
    category: "memory",
    lightingProfile: "reading-nook-pool",
    motionCompatible: false,
    notes: "Confidence vault / highlights — also 🌟 in articles.",
  }),
  entry({
    id: "my-journey",
    feature: "My Journey",
    currentEmoji: "🌿",
    signatureObject: "Travel journal with pressed leaves",
    room: "garden-path",
    category: "memory",
    motionCompatible: false,
    notes: "Journey timeline and growth reports.",
  }),
  entry({
    id: "growth-reports",
    feature: "Growth Reports",
    currentEmoji: "📖",
    signatureObject: "Bound annual journal",
    room: "library",
    category: "memory",
    motionCompatible: false,
    notes: "Printable combined growth report.",
  }),
  entry({
    id: "strategies",
    feature: "Strategies",
    currentEmoji: "🎯",
    signatureObject: "Strategy cards on cork board",
    room: "planning-table",
    category: "planning",
    motionCompatible: false,
    notes: "Strategies panel, saved strategies, spin wheel categories.",
  }),

  // ── Focus tools ─────────────────────────────────────────────────────────
  entry({
    id: "focus-timer",
    feature: "Pomodoro / Focus Session",
    currentEmoji: "⏱",
    signatureObject: "Sand timer",
    room: "focus-studio",
    category: "focus",
    motionCompatible: true,
    notes: "Focus timer, time block, pomodoro menu.",
  }),
  entry({
    id: "focus-audio",
    feature: "Focus Audio",
    currentEmoji: "🎵",
    signatureObject: "Small wooden speaker",
    room: "focus-studio",
    category: "focus",
    motionCompatible: false,
    notes: "Calm audio playlists — pairs with headphones object.",
  }),
  entry({
    id: "spin-wheel",
    feature: "Spin the Wheel",
    currentEmoji: "🎡",
    signatureObject: "Brass decision wheel",
    room: "living-room",
    category: "celebration",
    motionCompatible: true,
    notes: "Momentum when user cannot choose which task.",
  }),
  entry({
    id: "voice",
    feature: "Voice",
    currentEmoji: "🎤",
    signatureObject: "Vintage desk microphone",
    room: "living-room",
    category: "hospitality",
    motionCompatible: false,
    notes: "Voice input/output toggle in chat.",
  }),
  entry({
    id: "safe-for-today",
    feature: "Safe For Today",
    currentEmoji: "🛡️",
    signatureObject: "Soft throw draped on chair",
    room: "window-seat",
    category: "reflection",
    motionCompatible: false,
    notes: "Stress routing — permission to do less.",
  }),

  // ── Create & content ────────────────────────────────────────────────────
  entry({
    id: "email-generator",
    feature: "Email Generator",
    currentEmoji: "✉️",
    signatureObject: "Wax-sealed envelope",
    room: "business-office",
    category: "business",
    motionCompatible: false,
    notes: "Email generator panel and sequences.",
  }),
  entry({
    id: "templates",
    feature: "Templates Library",
    currentEmoji: "📄",
    signatureObject: "Paper template stack",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Templates, documents, Google Docs export.",
  }),
  entry({
    id: "build-with-shari",
    feature: "Build With Shari",
    currentEmoji: "✨",
    signatureObject: "Collaborative sketch on easel",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "AI co-creation affordance across create flows.",
  }),
  entry({
    id: "content-types",
    feature: "Content Types",
    currentEmoji: "📝",
    signatureObject: "Labeled content trays",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Create catalog categories — parent for 40+ subtypes.",
  }),

  // ── My Work & operations ────────────────────────────────────────────────
  entry({
    id: "my-work",
    feature: "My Work",
    currentEmoji: "🏠",
    signatureObject: "Workshop apron on hook",
    room: "workshop",
    category: "business",
    motionCompatible: false,
    notes: "My Work hub — operational dashboard.",
  }),
  entry({
    id: "google-workspace",
    feature: "Google Workspace",
    currentEmoji: "📝",
    signatureObject: "External ledger (neutral)",
    room: "business-office",
    category: "business",
    motionCompatible: false,
    notes: "Third-party links — subdued object, not Google branding.",
  }),
  entry({
    id: "playbook",
    feature: "Playbook",
    currentEmoji: "📘",
    signatureObject: "Tabbed playbook binder",
    room: "business-office",
    category: "business",
    motionCompatible: false,
    notes: "Business playbook panel.",
  }),
  entry({
    id: "client-avatars",
    feature: "Client Avatars",
    currentEmoji: "👤",
    signatureObject: "Character study sketch cards",
    room: "business-office",
    category: "business",
    motionCompatible: false,
    notes: "Ideal client builder — shares profile portrait language.",
  }),

  // ── Decision & visual thinking ──────────────────────────────────────────
  entry({
    id: "decision-map",
    feature: "Decision Map",
    currentEmoji: "🗺️",
    signatureObject: "Unfolded path map on desk",
    room: "outlook-point",
    category: "reflection",
    motionCompatible: false,
    notes: "Decision canvas, exploration paths.",
  }),
  entry({
    id: "visual-focus-studio",
    feature: "Visual Focus Studio",
    currentEmoji: "🎨",
    signatureObject: "Canvas on easel",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Business canvas, visual focus cards.",
  }),

  // ── Momentum games (categories) ─────────────────────────────────────────
  entry({
    id: "momentum-focus-attention",
    feature: "Focus & Attention Games",
    currentEmoji: "🧠",
    signatureObject: "Puzzle box",
    room: "focus-studio",
    category: "focus",
    motionCompatible: true,
    notes: "Momentum need category — shares clear-my-mind journal family.",
  }),
  entry({
    id: "momentum-action",
    feature: "Momentum & Action Games",
    currentEmoji: "⚡",
    signatureObject: "Domino line ready to tip",
    room: "workshop",
    category: "celebration",
    motionCompatible: true,
    notes: "Momentum need category.",
  }),
  entry({
    id: "momentum-creative-spark",
    feature: "Creative Spark Games",
    currentEmoji: "💡",
    signatureObject: "Idea jar with slips",
    room: "creative-studio",
    category: "creative",
    motionCompatible: false,
    notes: "Momentum need category.",
  }),
  entry({
    id: "momentum-mental-vacation",
    feature: "Mental Vacation Games",
    currentEmoji: "🌴",
    signatureObject: "Window view postcard",
    room: "back-deck",
    category: "nature",
    motionCompatible: true,
    notes: "Momentum need category.",
  }),
  entry({
    id: "momentum-just-for-fun",
    feature: "Just For Fun Games",
    currentEmoji: "🎉",
    signatureObject: "Confetti in mason jar",
    room: "living-room",
    category: "celebration",
    motionCompatible: true,
    notes: "Momentum need category.",
  }),

  // ── Hospitality & Director's Studio ───────────────────────────────────────
  entry({
    id: "director-prepare-home",
    feature: "Prepare the Home",
    currentEmoji: "🎬",
    signatureObject: "Director's scene notebook",
    room: "living-room",
    category: "hospitality",
    motionCompatible: false,
    notes: "Director's Studio primary action — dev/studio only.",
  }),
  entry({
    id: "director-surprise-me",
    feature: "Surprise Me",
    currentEmoji: "🎲",
    signatureObject: "Wrapped surprise box",
    room: "living-room",
    category: "hospitality",
    motionCompatible: true,
    notes: "Director's Studio randomize hospitality.",
  }),
  entry({
    id: "director-save-scene",
    feature: "Save Scene",
    currentEmoji: "📸",
    signatureObject: "Polaroid on mantel",
    room: "living-room",
    category: "memory",
    motionCompatible: false,
    notes: "Scene snapshot — photography metaphor, not camera UI icon.",
  }),

  // ── Seasonal & atmosphere (directorExperience scenarios) ──────────────────
  entry({
    id: "season-spring-bloom",
    feature: "Spring Bloom",
    currentEmoji: "🌷",
    signatureObject: "Tulip arrangement in jar",
    room: "garden",
    category: "seasonal",
    lightingProfile: "garden-spring-morning",
    seasonalVariants: ["spring-bloom"],
    motionCompatible: true,
    notes: "Director scenario — spring hospitality.",
  }),
  entry({
    id: "season-autumn-cozy",
    feature: "Autumn Cozy",
    currentEmoji: "🍂",
    signatureObject: "Wool blanket with fallen leaves",
    room: "back-deck",
    category: "seasonal",
    lightingProfile: "deck-autumn-golden",
    seasonalVariants: ["autumn-cozy"],
    motionCompatible: true,
    notes: "Director scenario — autumn hospitality.",
  }),
  entry({
    id: "hospitality-tea-welcome",
    feature: "Tea Welcome",
    currentEmoji: "🫖",
    signatureObject: "Porcelain tea service",
    room: "kitchen-table",
    category: "hospitality",
    lightingProfile: "kitchen-morning-steam",
    motionCompatible: true,
    notes: "Director scenario — guest welcome.",
  }),
  entry({
    id: "celebration-birthday",
    feature: "Birthday Celebration",
    currentEmoji: "🎂",
    signatureObject: "Homemade cake on stand",
    room: "kitchen-table",
    category: "celebration",
    motionCompatible: true,
    notes: "Director scenario — birthday hospitality.",
  }),
  entry({
    id: "hospitality-launch-day",
    feature: "Launch Day",
    currentEmoji: "🚀",
    signatureObject: "Ribbon-cutting scissors",
    room: "front-porch",
    category: "celebration",
    motionCompatible: false,
    notes: "Director scenario — product launch energy, grounded not startup bro.",
  }),
  entry({
    id: "atmosphere-golden-hour",
    feature: "Golden Hour",
    currentEmoji: "🌅",
    signatureObject: "Sunlit window sheer",
    room: "living-room",
    category: "seasonal",
    lightingProfile: "golden-hour",
    seasonalVariants: ["golden-hour"],
    motionCompatible: true,
    notes: "Director scenario — lighting mood.",
  }),
  entry({
    id: "weather-snow-day",
    feature: "Snow Day",
    currentEmoji: "🌨️",
    signatureObject: "Frosted window with mug",
    room: "window-seat",
    category: "seasonal",
    lightingProfile: "winter-cool-soft",
    seasonalVariants: ["winter-snow"],
    motionCompatible: true,
    notes: "Director scenario — Iowa winter.",
  }),
  entry({
    id: "weather-rain-day",
    feature: "Rain Day",
    currentEmoji: "🌧️",
    signatureObject: "Rain-streaked window with book",
    room: "reading-nook",
    category: "seasonal",
    lightingProfile: "rain-diffused",
    seasonalVariants: ["rain-day"],
    motionCompatible: true,
    notes: "Director scenario — gentle rain atmosphere.",
  }),

  // ── XP & coaching affordances ─────────────────────────────────────────────
  entry({
    id: "xp-starter",
    feature: "Starter Level",
    currentEmoji: "🌱",
    signatureObject: "Seedling in small pot",
    room: "greenhouse",
    category: "nature",
    motionCompatible: true,
    notes: "Companion store XP tier — shares growth plant family.",
  }),
  entry({
    id: "xp-builder",
    feature: "Builder Level",
    currentEmoji: "🌿",
    signatureObject: "Potted herb on sill",
    room: "greenhouse",
    category: "nature",
    motionCompatible: false,
    notes: "Companion store XP tier.",
  }),
  entry({
    id: "xp-momentum-maker",
    feature: "Momentum Maker Level",
    currentEmoji: "🔥",
    signatureObject: "Ember bowl on hearth",
    room: "fire-circle",
    category: "celebration",
    motionCompatible: true,
    notes: "Companion store XP tier.",
  }),
] as const;

export const COMPANION_OBJECT_CATEGORY_LABELS: Record<CompanionObjectCategory, string> = {
  planning: "Planning Objects",
  focus: "Focus Objects",
  creative: "Creative Objects",
  business: "Business Objects",
  reflection: "Reflection Objects",
  hospitality: "Hospitality Objects",
  seasonal: "Seasonal Objects",
  celebration: "Celebration Objects",
  learning: "Learning Objects",
  memory: "Memory Objects",
  nature: "Nature Objects",
  navigation: "Navigation Objects",
};

/** Primary feature mappings from the initial design brief — must always resolve. */
export const PRIMARY_FEATURE_OBJECT_IDS = [
  "clear-my-mind",
  "plan-my-day",
  "todays-reality",
  "decision-compass",
  "focus-studio",
  "breathing",
  "games",
  "create",
  "business",
  "learning",
  "reading",
  "parking-lot",
  "evidence-bank",
  "wins",
  "growth",
  "calendar",
  "projects",
  "messages",
  "settings",
  "search",
  "notifications",
  "help",
] as const;

export type PrimaryFeatureObjectId = (typeof PRIMARY_FEATURE_OBJECT_IDS)[number];

export function companionObjectById(id: string): CompanionObjectEntry | undefined {
  return COMPANION_OBJECT_LIBRARY.find((object) => object.id === id);
}

export function companionObjectsByCategory(
  category: CompanionObjectCategory,
): CompanionObjectEntry[] {
  return COMPANION_OBJECT_LIBRARY.filter((object) => object.category === category);
}

export function companionObjectsForRoom(placeId: CompanionPlaceId): CompanionObjectEntry[] {
  return COMPANION_OBJECT_LIBRARY.filter((object) => object.room === placeId);
}

export function companionObjectForFeature(featureName: string): CompanionObjectEntry | undefined {
  const normalized = featureName.trim().toLowerCase();
  return COMPANION_OBJECT_LIBRARY.find(
    (object) =>
      object.feature.toLowerCase() === normalized ||
      object.feature.replace(/™/g, "").trim().toLowerCase() === normalized,
  );
}

/** Registry summary for migration dashboards and art production planning. */
export function companionObjectRegistrySummary() {
  const byCategory = Object.fromEntries(
    COMPANION_OBJECT_CATEGORIES.map((category) => [
      category,
      companionObjectsByCategory(category).length,
    ]),
  ) as Record<CompanionObjectCategory, number>;

  const byRoom = COMPANION_OBJECT_LIBRARY.reduce<Record<string, number>>((acc, object) => {
    acc[object.room] = (acc[object.room] ?? 0) + 1;
    return acc;
  }, {});

  const needsArtwork = COMPANION_OBJECT_LIBRARY.filter(
    (object) => object.artworkStatus === "needs-artwork",
  ).length;

  return {
    total: COMPANION_OBJECT_LIBRARY.length,
    byCategory,
    byRoom,
    needsArtwork,
    primaryFeatures: PRIMARY_FEATURE_OBJECT_IDS.length,
  };
}
