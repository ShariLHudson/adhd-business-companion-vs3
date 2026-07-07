/**
 * One-shot builder for discovery-library.json items — Welcome Collection 001 + room discoveries.
 * Run: node scripts/build-discovery-library-items.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(
  __dirname,
  "../docs/estate-intelligence/discovery-library.json",
);

const editorial = {
  reviewNotes: null,
  approvedAt: "2026-07-06",
  reviewedBy: "Shari",
};

const future = {
  scheduling: null,
  seasonal: null,
  featured: false,
  translations: null,
  memberSegments: null,
  difficulty: "gentle",
  estimatedReadingMinutes: 1,
};

function welcomeItem({
  id,
  title,
  discoveryText,
  whyItMatters,
  foodForThought,
  primaryButton,
  companionResponse,
  destinationRoute = null,
  destinationType = null,
  relatedRoom = null,
  relatedFeature = null,
  relatedSparkCards = [],
  triggerRules,
  status = "Live",
  order,
}) {
  return {
    id,
    status,
    priority: "Essential",
    category: "welcome",
    collectionId: "welcome-to-spark-estate",
    title,
    subtitle: null,
    image: null,
    discoveryText,
    whyItMatters,
    foodForThought,
    primaryButton,
    companionResponse,
    destinationRoute,
    destinationType,
    saveAllowed: true,
    relatedRoom,
    relatedFeature,
    relatedTool: null,
    relatedSparkCards,
    targetRegistry: "estate-rooms",
    targetId: "sunroom",
    triggerRules,
    tags: ["welcome", "trust", `welcome-order-${order}`],
    keywords: ["welcome", "spark estate", "orientation"],
    version: 2,
    createdAt: "2026-07-06",
    lastUpdated: "2026-07-06",
    author: "Shari",
    createdBy: "Shari",
    editorial,
    future,
  };
}

const welcomeItems = [
  welcomeItem({
    id: "DISC-001",
    order: 1,
    title: "Welcome to Spark Estate™",
    discoveryText:
      "Welcome to Spark Estate.\n\nThis isn't a dashboard to master or another system to memorize.\n\nThink of it as a place designed to grow with you. Every room, feature, and experience exists for a reason, and you'll discover them naturally over time.\n\nThere is no right place to begin.\n\nSimply start where your curiosity leads.",
    whyItMatters:
      "Most software expects you to learn everything on the first day.\n\nSpark Estate does the opposite.\n\nIt reveals itself one thoughtful discovery at a time.",
    foodForThought:
      "If you could design a place that always helped you feel your best, what would it feel like?",
    primaryButton: "Take Me to the Main Hall",
    companionResponse:
      "Welcome home. There's no map you need to memorize — just a place that grows with you. I'll take you to the Main Hall.",
    destinationRoute: "/companion?section=welcome-room",
    destinationType: "room",
    relatedRoom: "sunroom",
    triggerRules: [
      { type: "first-estate-visit", enabled: true, config: { maxRoomVisits: 1 } },
    ],
  }),
  welcomeItem({
    id: "DISC-002",
    order: 2,
    title: "Meet Your Discovery Key™",
    discoveryText:
      "As you explore the Estate, you may occasionally notice a small brass key resting quietly in different places.\n\nIt isn't something to collect or complete.\n\nIt's simply Spark's way of sharing something you might enjoy discovering—a room, a feature, a story, or a possibility you may not have found on your own.\n\nSometimes the key will introduce you to the Estate.\n\nOther times it may gently point you toward something that could make your day a little easier.",
    whyItMatters:
      "You never have to search for everything.\n\nThe Estate will gradually reveal itself.",
    foodForThought:
      "What are some of the best discoveries you've made simply because you stayed curious?",
    primaryButton: "Tell Me More",
    companionResponse:
      "The Discovery Key isn't a quest or a checklist. When you notice it, there's something gentle waiting — a room, a feature, a story, or a possibility you may not have found on your own. You never need to hunt for them.",
    relatedFeature: null,
    relatedTool: "discovery-key",
    triggerRules: [
      { type: "first-room-visit", enabled: true, config: { roomId: "sunroom" } },
    ],
  }),
  welcomeItem({
    id: "DISC-003",
    order: 3,
    title: "One Companion, Many Possibilities",
    discoveryText:
      "Even though Spark Estate offers many rooms, tools, and experiences, you're only talking with one companion.\n\nNo need to figure out which feature comes first.\n\nJust tell Spark what you're trying to do.\n\nWhether you want to create, research, think, write, plan, or simply clear your mind, Spark will help guide you.",
    whyItMatters:
      "You don't have to learn the system before it can help you.\n\nSpark's job is to understand your goal—not the other way around.",
    foodForThought:
      "How often do you simplify your words because you think technology won't understand you?",
    primaryButton: "Continue Exploring",
    companionResponse:
      "You're only ever talking with one companion here. You don't need to figure out which feature to use first — just tell me what you're trying to do. Create, research, think, write, plan, or clear your mind. I'll help guide you.",
    triggerRules: [],
  }),
  welcomeItem({
    id: "DISC-004",
    order: 4,
    title: "There Is No Wrong Way to Explore",
    discoveryText:
      "Some members visit the Library first.\n\nOthers spend time in the Listening Room, the Observatory, or the Possibility House.\n\nSome never follow the same path twice.\n\nThat's exactly how Spark Estate was designed.\n\nExplore in whatever way feels natural.\n\nThe Estate will meet you where you are.",
    whyItMatters:
      "There are no required rooms, no correct order, and no pressure to \"finish\" the Estate.\n\nYour experience will naturally become your own.",
    foodForThought:
      "Where do you usually feel most comfortable when you're learning something new?",
    primaryButton: "Show Me Somewhere New",
    companionResponse:
      "Some members visit the Library first. Others spend time in the Listening Room, the Observatory, or the Possibility House — and some never follow the same path twice. That's exactly how this was designed. Where would you like to wander?",
    triggerRules: [],
  }),
  welcomeItem({
    id: "DISC-005",
    order: 5,
    title: "Ask Naturally",
    discoveryText:
      "You don't have to remember exact commands or official room names.\n\nSpeak naturally.\n\nYou can say things like:\n\n\"I need somewhere peaceful.\"\n\n\"Take me to the treehouse.\"\n\n\"I want to think.\"\n\n\"I need help getting started.\"\n\nSpark is designed to understand what you're trying to accomplish—not just the words you use.",
    whyItMatters:
      "The more naturally you speak, the more naturally Spark can help.",
    foodForThought:
      "What would you ask if you knew there wasn't a wrong way to ask it?",
    primaryButton: "Let's Try It",
    companionResponse:
      "You don't need exact commands or official room names. Speak naturally — 'I need somewhere peaceful,' 'Take me to the treehouse,' 'I want to think.' I'll understand what you're trying to accomplish. What would you like to try?",
    triggerRules: [],
  }),
  welcomeItem({
    id: "DISC-006",
    order: 6,
    title: "Your Estate Will Grow With You",
    discoveryText:
      "Spark Estate isn't meant to be explored in a single day.\n\nAs you spend time here, you'll gradually discover new rooms, helpful features, thoughtful stories, and little surprises tucked throughout the Estate. The more naturally you use Spark, the more meaningful those discoveries become.\n\nThere's no finish line to reach—only new possibilities waiting to be uncovered.",
    whyItMatters:
      "You don't have to remember everything today.\n\nSpark Estate is designed to unfold over time.",
    foodForThought:
      "What's one place you've come to appreciate more the longer you've spent there?",
    primaryButton: "Continue Exploring",
    companionResponse:
      "Spark Estate isn't meant to be explored in a single day. As you spend time here, you'll discover new rooms, features, stories, and quiet surprises. There's no finish line — only possibilities waiting.",
    destinationRoute: "/companion?section=welcome-room",
    destinationType: "room",
    relatedRoom: "sunroom",
    relatedSparkCards: ["lifelong-learning"],
    triggerRules: [],
    status: "Live",
  }),
  welcomeItem({
    id: "DISC-007",
    order: 7,
    title: "Spark Remembers the Journey, Not Every Conversation",
    discoveryText:
      "Spark remembers helpful patterns so it can make your experience feel more personal over time.\n\nIt isn't trying to remember every word you've ever said. Instead, it looks for the kinds of things that genuinely make your experience better—like favorite spaces, tools you enjoy, and ways you like to work.",
    whyItMatters:
      "The goal isn't to store more information.\n\nIt's to reduce friction and make Spark feel more helpful each time you return.",
    foodForThought:
      "What are the little things that make you feel known and understood?",
    primaryButton: "Learn More",
    companionResponse:
      "I remember helpful patterns so your experience can feel more personal over time — not every word you've said, but the things that genuinely make life easier. Favorite spaces, tools you reach for, ways you like to work. The goal isn't to store more information. It's to reduce friction each time you return.",
    relatedFeature: null,
    relatedTool: null,
    triggerRules: [],
    status: "Live",
  }),
  welcomeItem({
    id: "DISC-008",
    order: 8,
    title: "You Can Always Simply Ask",
    discoveryText:
      "If you're ever unsure where something is or how to do something, simply ask.\n\nNo need to remember menus, room names, or special commands.\n\nQuestions like these all work naturally:\n\n\"Where can I think quietly?\"\n\n\"Help me organize my ideas.\"\n\n\"Take me to the treehouse.\"\n\n\"Where's the music room?\"\n\n\"Show me somewhere peaceful.\"\n\nSpark's job is to understand your intent—not expect you to memorize the Estate.",
    whyItMatters:
      "Technology should adapt to people.\n\nNot the other way around.",
    foodForThought:
      "How often do you avoid asking for help because it feels like you're supposed to already know the answer?",
    primaryButton: "Try It Now",
    companionResponse:
      "If you're ever unsure where something is or how to do something, simply ask. 'Where can I think quietly?' 'Help me organize my ideas.' 'Take me to the treehouse.' My job is to understand your intent — not expect you to memorize the Estate. What would you like to ask?",
    triggerRules: [],
    status: "Live",
  }),
  welcomeItem({
    id: "DISC-009",
    order: 9,
    title: "Follow Your Curiosity",
    discoveryText:
      "Some discoveries appear because they're useful.\n\nOthers appear simply because they're interesting.\n\nIf something catches your attention, follow it.\n\nOne small discovery often leads to another, and before long you'll begin to feel at home in the Estate.",
    whyItMatters:
      "Curiosity is one of the best teachers.\n\nThere's no wrong path here.",
    foodForThought:
      "What have you discovered recently simply because you were curious enough to look?",
    primaryButton: "Keep Exploring",
    companionResponse:
      "Some discoveries appear because they're useful. Others because they're interesting. If something catches your attention, follow it. One small discovery often leads to another — and before long this begins to feel like home.",
    triggerRules: [],
    status: "Live",
  }),
  welcomeItem({
    id: "DISC-010",
    order: 10,
    title: "The Estate Is Here to Support You",
    discoveryText:
      "Every room, feature, object, and experience inside Spark Estate exists for one reason:\n\nTo make life and work feel a little easier.\n\nSome days you'll come here to create.\n\nSome days to think.\n\nSome days to rest.\n\nSome days simply to feel less alone with everything you're carrying.\n\nWhatever brings you here today is enough.",
    whyItMatters:
      "Spark Estate isn't about productivity for productivity's sake.\n\nIt's about helping you move through life with a little more clarity, confidence, and calm.",
    foodForThought: "What would make today feel just a little easier?",
    primaryButton: "Continue",
    companionResponse:
      "I'm glad you're here. Spark Estate was designed around the idea that life doesn't always fit neatly into categories. Some days you need help creating, other days you need quiet, encouragement, or simply a place to think. My role is to meet you where you are and help you take the next step — whatever that looks like today.",
    triggerRules: [],
    status: "Live",
  }),
];

function roomDiscovery(item) {
  return {
    ...item,
    collectionId: item.collectionId ?? null,
    companionResponse: item.companionResponse ?? null,
    version: item.version ?? 2,
    createdAt: item.createdAt ?? "2026-07-06",
    lastUpdated: "2026-07-06",
    author: "Shari",
    createdBy: "Shari",
    editorial: item.editorial ?? editorial,
    future: item.future ?? future,
  };
}

const roomItems = [
  roomDiscovery({
    id: "DISC-011",
    status: "Live",
    priority: "Essential",
    category: "estate-discovery",
    title: "Greenhouse™",
    subtitle: "A patient place for ideas still taking root",
    image: "/backgrounds/greenhouse-background.png",
    discoveryText:
      "Behind the glass walls, there is room for something small to grow before the world asks anything of it.",
    whyItMatters:
      "Some ideas need warmth and quiet before they are ready to share. The Greenhouse is here for that season.",
    foodForThought: "What might become clearer if you gave yourself a few quiet minutes?",
    primaryButton: null,
    destinationRoute: "/companion?section=growth-greenhouse",
    destinationType: "room",
    saveAllowed: true,
    relatedRoom: "greenhouse",
    relatedFeature: null,
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-rooms",
    targetId: "greenhouse",
    triggerRules: [
      { type: "never-visited-room", enabled: true, config: { roomId: "greenhouse" } },
    ],
    tags: ["orientation", "growth", "quiet"],
    keywords: ["greenhouse", "ideas", "growth", "quiet"],
  }),
  roomDiscovery({
    id: "DISC-012",
    status: "Live",
    priority: "Helpful",
    category: "estate-story",
    title: "Sunroom",
    subtitle: "Warm light, unhurried welcome",
    image: "/backgrounds/sunroom-background.png",
    discoveryText:
      "This is one of the places Spark was imagined — a sunlit room where conversation can simply begin.",
    whyItMatters: "Knowing where you are helps the Estate feel like home, not a menu.",
    foodForThought: "What kind of light would feel kindest to you today?",
    primaryButton: null,
    destinationRoute: "/companion?section=welcome-room",
    destinationType: "room",
    saveAllowed: true,
    relatedRoom: "sunroom",
    relatedFeature: null,
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-rooms",
    targetId: "sunroom",
    triggerRules: [
      { type: "first-room-visit", enabled: true, config: { roomId: "sunroom" } },
    ],
    tags: ["story", "belonging", "welcome"],
    keywords: ["sunroom", "welcome", "home", "story"],
  }),
  roomDiscovery({
    id: "DISC-013",
    status: "Live",
    priority: "Essential",
    category: "feature-discovery",
    title: "Clear My Mind™",
    subtitle: "Relief without organizing pressure",
    image: "/backgrounds/sunroom-background.png",
    discoveryText:
      "When your head feels full, you can set thoughts down here — continuously, gently, without finishing anything.",
    whyItMatters:
      "Capture and organize stay separate on purpose. You are allowed to simply unload.",
    foodForThought: "What small thing could make today feel lighter?",
    primaryButton: null,
    destinationRoute: "/companion?section=brain-dump",
    destinationType: "feature",
    saveAllowed: true,
    relatedRoom: "clear-my-mind",
    relatedFeature: "clear-my-mind",
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-features",
    targetId: "clear-my-mind",
    triggerRules: [
      { type: "feature-never-used", enabled: true, config: { featureId: "clear-my-mind" } },
    ],
    tags: ["relief", "capture", "overwhelm"],
    keywords: ["clear my mind", "brain dump", "overwhelm", "capture"],
  }),
  roomDiscovery({
    id: "DISC-014",
    status: "Draft",
    priority: "Delight",
    category: "hidden-treasure",
    title: "Music Room",
    subtitle: "A piano waiting in warm light",
    image: "/backgrounds/music-room-background.png",
    discoveryText: "Sometimes focus needs a little music — not performance, just company.",
    whyItMatters: "A gentle soundtrack can make thinking feel less lonely.",
    foodForThought: null,
    primaryButton: null,
    destinationRoute: "/companion?section=focus-audio",
    destinationType: "room",
    saveAllowed: true,
    relatedRoom: "music-room",
    relatedFeature: null,
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-rooms",
    targetId: "music-room",
    triggerRules: [{ type: "manual", enabled: true, config: { reason: "Founder preview" } }],
    tags: ["delight", "audio", "focus"],
    keywords: ["music room", "piano", "audio"],
    editorial: { reviewNotes: "Awaiting Music Room Live in Knowledge Base", approvedAt: null, reviewedBy: null },
  }),
  roomDiscovery({
    id: "DISC-015",
    status: "Draft",
    priority: "Personalized",
    category: "personal-discovery",
    title: "A Pattern I Noticed",
    subtitle: null,
    image: null,
    discoveryText:
      "You have been returning to quiet places when the day asks a lot of you. That is not avoidance — it is wisdom.",
    whyItMatters: "Restoring clarity first often makes the next step kinder.",
    foodForThought: "What would feel supportive before productive right now?",
    primaryButton: null,
    destinationRoute: null,
    destinationType: null,
    saveAllowed: true,
    relatedRoom: null,
    relatedFeature: null,
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-rooms",
    targetId: "conservatory",
    triggerRules: [
      {
        type: "member-pattern-detected",
        enabled: false,
        config: { pattern: "returns-to-quiet-places", positiveOnly: true },
      },
    ],
    tags: ["personal", "encouragement", "pattern"],
    keywords: ["quiet", "rest", "pattern"],
    editorial: { reviewNotes: "Pattern engine not active", approvedAt: null, reviewedBy: null },
  }),
  roomDiscovery({
    id: "DISC-016",
    status: "Draft",
    priority: "Delight",
    category: "seasonal-discovery",
    title: "Spring in the Gardens",
    subtitle: "Seasonal light on the paths",
    image: "/backgrounds/space-celebration-garden-background.png",
    discoveryText:
      "The gardens are waking — paths a little softer, color returning at the edges.",
    whyItMatters: "Seasons change here too. A short walk outside might be enough today.",
    foodForThought: "What is quietly coming back to life in your work?",
    primaryButton: null,
    destinationRoute: "/companion?section=home",
    destinationType: "room",
    saveAllowed: true,
    relatedRoom: "gardens",
    relatedFeature: null,
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-rooms",
    targetId: "gardens",
    triggerRules: [{ type: "season-active", enabled: false, config: { season: "spring" } }],
    tags: ["seasonal", "spring", "gardens"],
    keywords: ["gardens", "spring", "seasonal"],
    future: { ...future, seasonal: { seasonId: "spring" } },
    editorial: { reviewNotes: "Awaiting Gardens Live + seasonal trigger", approvedAt: null, reviewedBy: null },
  }),
  roomDiscovery({
    id: "DISC-017",
    status: "Draft",
    priority: "Helpful",
    category: "new-possibility",
    title: "Create",
    subtitle: "When you are ready to make something",
    image: "/backgrounds/room-create-studio-background.png",
    discoveryText:
      "There is a studio table set aside for drafting — conversation first, creation when you ask.",
    whyItMatters:
      "Spark will never rush you into a deliverable. The room waits until you are ready.",
    foodForThought: null,
    primaryButton: null,
    destinationRoute: "/companion?section=content-generator",
    destinationType: "feature",
    saveAllowed: true,
    relatedRoom: "creative-studio",
    relatedFeature: "create",
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: "estate-features",
    targetId: "create",
    triggerRules: [],
    tags: ["create", "studio"],
    keywords: ["create", "studio", "draft"],
    editorial: { reviewNotes: "Create feature still Future in Knowledge Base", approvedAt: null, reviewedBy: null },
  }),
];

const library = JSON.parse(fs.readFileSync(target, "utf8"));
library.version = "4.0.0";
library.description =
  "Discovery Key™ content engine — Welcome Collection 001 + estate discoveries. Editable without application code.";
library.categoryValues = [
  { slug: "welcome", label: "Welcome" },
  ...library.categoryValues.filter((c) => c.slug !== "welcome"),
];
library.triggerRuleTypes = [
  "first-estate-visit",
  ...library.triggerRuleTypes.filter((t) => t !== "first-estate-visit"),
];
library.itemSchema = {
  ...library.itemSchema,
  companionResponse:
    "string | null — what Spark says when the member taps the primary button",
  collectionId:
    "string | null — discovery collection slug, e.g. welcome-to-spark-estate",
};
library.items = [...welcomeItems, ...roomItems];

fs.writeFileSync(target, `${JSON.stringify(library, null, 2)}\n`, "utf8");
console.log(`Wrote ${library.items.length} discovery items to ${target}`);
