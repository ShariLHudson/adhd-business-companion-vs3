import type { SignatureCompanionObject, SignatureRoomZone } from "./types";

function sig(
  partial: SignatureCompanionObject,
): SignatureCompanionObject {
  return partial;
}

/**
 * Signature Companion Objects — room catalogs.
 * One object identity → navigation, feature, and environmental forms.
 */
export const LIVING_ROOM_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-favorite-coffee-mug", name: "Favorite Coffee Mug", room: "living-room", emotionalPurpose: "Welcome", catalogObjectId: "obj-shari-signature-mug", featureObjectId: "todays-reality", animation: "steam", isPrimary: true }),
  sig({ id: "sig-living-room-chair", name: "Living Room Chair", room: "living-room", emotionalPurpose: "Settle in", catalogObjectId: "obj-reading-chair" }),
  sig({ id: "sig-fireplace", name: "Fireplace", room: "living-room", emotionalPurpose: "Hearth", catalogObjectId: "obj-fireplace", animation: "flicker" }),
  sig({ id: "sig-mantel-clock", name: "Mantel Clock", room: "living-room", emotionalPurpose: "Steady time", catalogObjectId: "obj-mantel-clock", animation: "pendulum" }),
  sig({ id: "sig-fresh-flowers", name: "Fresh Flowers", room: "living-room", emotionalPurpose: "Care", catalogObjectId: "obj-fresh-flowers" }),
  sig({ id: "sig-living-room-window", name: "Window", room: "living-room", emotionalPurpose: "Look out and breathe", catalogObjectId: "obj-window-seat-cushion" }),
  sig({ id: "sig-bird-feeder", name: "Bird Feeder", room: "living-room", emotionalPurpose: "Hope", catalogObjectId: "obj-bird-feeder", animation: "bird-visit" }),
  sig({ id: "sig-reading-lamp", name: "Reading Lamp", room: "living-room", emotionalPurpose: "Quiet", catalogObjectId: "obj-reading-lamp" }),
  sig({ id: "sig-cozy-blanket", name: "Cozy Blanket", room: "living-room", emotionalPurpose: "Comfort", catalogObjectId: "obj-throw-blanket" }),
];

export const CLEAR_MY_MIND_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-reflection-journal", name: "Reflection Journal", room: "clear-my-mind", emotionalPurpose: "Reflection", catalogObjectId: "obj-leather-journal", featureObjectId: "clear-my-mind", isPrimary: true }),
  sig({ id: "sig-fountain-pen", name: "Fountain Pen", room: "clear-my-mind", emotionalPurpose: "Intentional words", catalogObjectId: "obj-fountain-pen" }),
  sig({ id: "sig-memory-box", name: "Memory Box", room: "clear-my-mind", emotionalPurpose: "Keep what matters", catalogObjectId: "obj-writing-basket" }),
  sig({ id: "sig-candle", name: "Candle", room: "clear-my-mind", emotionalPurpose: "Soft evening", catalogObjectId: "obj-taper-candle", animation: "flicker" }),
  sig({ id: "sig-stone-fireplace", name: "Stone Fireplace", room: "clear-my-mind", emotionalPurpose: "Warmth at a distance", catalogObjectId: "obj-fireplace", animation: "flicker" }),
  sig({ id: "sig-comfort-blanket", name: "Comfort Blanket", room: "clear-my-mind", emotionalPurpose: "Comfort", catalogObjectId: "obj-cashmere-wrap" }),
  sig({ id: "sig-thought-basket", name: "Thought Basket", room: "clear-my-mind", emotionalPurpose: "Catch everything", catalogObjectId: "obj-writing-basket" }),
];

export const PLANNING_TABLE_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-planning-notebook", name: "Planning Notebook", room: "planning-table", emotionalPurpose: "Clarity", catalogObjectId: "obj-planning-notebook", isPrimary: true }),
  sig({ id: "sig-daily-planner", name: "Daily Planner", room: "planning-table", emotionalPurpose: "Today's intentions", catalogObjectId: "obj-open-planner", featureObjectId: "plan-my-day", animation: undefined }),
  sig({ id: "sig-calendar", name: "Calendar", room: "planning-table", emotionalPurpose: "Time visible", catalogObjectId: "obj-wall-calendar" }),
  sig({ id: "sig-clipboard", name: "Clipboard", room: "planning-table", emotionalPurpose: "Portable focus", catalogObjectId: "obj-clipboard" }),
  sig({ id: "sig-sticky-notes", name: "Sticky Notes", room: "planning-table", emotionalPurpose: "Capture before it flies", catalogObjectId: "obj-sticky-notes" }),
  sig({ id: "sig-paper-tray", name: "Paper Tray", room: "planning-table", emotionalPurpose: "Correspondence waiting", catalogObjectId: "obj-letter-tray" }),
  sig({ id: "sig-desk-lamp", name: "Desk Lamp", room: "planning-table", emotionalPurpose: "Light where needed", catalogObjectId: "obj-desk-lamp" }),
  sig({ id: "sig-wooden-pencil-cup", name: "Wooden Pencil Cup", room: "planning-table", emotionalPurpose: "Tools at hand", catalogObjectId: "obj-pencil-cup" }),
  sig({ id: "sig-priority-cards", name: "Priority Cards", room: "planning-table", emotionalPurpose: "Sortable thoughts", catalogObjectId: "obj-index-cards" }),
];

export const SUNROOM_OVER_POND_SIGNATURES: SignatureCompanionObject[] = [
  sig({
    id: "sig-pond-anchor",
    name: "Pond Anchor",
    room: "sunroom-over-pond",
    emotionalPurpose: "Regulated attention",
    catalogObjectId: "obj-dragonfly",
    featureObjectId: "focus-my-brain",
    animation: "water-ripple",
    isPrimary: true,
  }),
  sig({
    id: "sig-water-lilies",
    name: "Water Lilies",
    room: "sunroom-over-pond",
    emotionalPurpose: "Soft anchoring",
    catalogObjectId: "obj-dragonfly",
    animation: "water-ripple",
  }),
  sig({
    id: "sig-pergola-vines",
    name: "Pergola Vines",
    room: "sunroom-over-pond",
    emotionalPurpose: "Gentle enclosure",
    catalogObjectId: "obj-watering-can",
  }),
  sig({
    id: "sig-sunroom-journal",
    name: "Open Journal",
    room: "sunroom-over-pond",
    emotionalPurpose: "Evidence of presence",
    catalogObjectId: "obj-leather-journal",
  }),
  sig({
    id: "sig-sunroom-coffee",
    name: "Coffee Mug",
    room: "sunroom-over-pond",
    emotionalPurpose: "Nearby, not supervising",
    catalogObjectId: "obj-shari-signature-mug",
    animation: "steam",
  }),
];

export const READING_NOOK_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-book-stack", name: "Book Stack", room: "reading-nook", emotionalPurpose: "Learning waiting", catalogObjectId: "obj-book-stack", isPrimary: true }),
  sig({ id: "sig-open-novel", name: "Open Novel", room: "reading-nook", emotionalPurpose: "Learning", catalogObjectId: "obj-open-novel", animation: "page-lift" }),
  sig({ id: "sig-reading-glasses", name: "Reading Glasses", room: "reading-nook", emotionalPurpose: "See clearly", catalogObjectId: "obj-reading-glasses" }),
  sig({ id: "sig-bookmark", name: "Bookmark", room: "reading-nook", emotionalPurpose: "Pause and return", catalogObjectId: "obj-bookmark-ribbon" }),
  sig({ id: "sig-saltwater-aquarium", name: "Saltwater Aquarium", room: "reading-nook", emotionalPurpose: "Peace", catalogObjectId: "obj-aquarium-ornament", animation: "bubble" }),
  sig({ id: "sig-reading-chair", name: "Reading Chair", room: "reading-nook", emotionalPurpose: "Settle in", catalogObjectId: "obj-reading-chair" }),
  sig({ id: "sig-side-table", name: "Side Table", room: "reading-nook", emotionalPurpose: "Tea within reach", catalogObjectId: "obj-side-table" }),
  sig({ id: "sig-tea-cup", name: "Tea Cup", room: "reading-nook", emotionalPurpose: "Quiet pause", catalogObjectId: "obj-tea-cup-saucer", animation: "steam" }),
];

export const CREATIVE_STUDIO_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-crochet-basket", name: "Crochet Basket", room: "creative-studio", emotionalPurpose: "Creativity", catalogObjectId: "obj-crochet-basket", isPrimary: true }),
  sig({ id: "sig-yarn", name: "Yarn", room: "creative-studio", emotionalPurpose: "Color waiting", catalogObjectId: "obj-yarn-skeins" }),
  sig({ id: "sig-watercolor-palette", name: "Watercolor Palette", room: "creative-studio", emotionalPurpose: "Soft expression", catalogObjectId: "obj-watercolor-set" }),
  sig({ id: "sig-paint-brushes", name: "Paint Brushes", room: "creative-studio", emotionalPurpose: "Tools of making", catalogObjectId: "obj-paint-brushes" }),
  sig({ id: "sig-colored-pencils", name: "Colored Pencils", room: "creative-studio", emotionalPurpose: "Playful precision", catalogObjectId: "obj-colored-pencils" }),
  sig({ id: "sig-journal-covers", name: "Journal Covers", room: "creative-studio", emotionalPurpose: "Personal craft", catalogObjectId: "obj-journal-cover" }),
  sig({ id: "sig-ribbon", name: "Ribbon", room: "creative-studio", emotionalPurpose: "Finishing touch", catalogObjectId: "obj-ribbon-spools" }),
  sig({ id: "sig-fabric", name: "Fabric", room: "creative-studio", emotionalPurpose: "Texture choices", catalogObjectId: "obj-linen-fabric" }),
  sig({ id: "sig-craft-storage", name: "Craft Storage", room: "creative-studio", emotionalPurpose: "Everything for making", catalogObjectId: "obj-craft-box" }),
  sig({ id: "sig-half-finished-project", name: "Half-Finished Project", room: "creative-studio", emotionalPurpose: "Imperfect progress", catalogObjectId: "obj-half-finished-scarf" }),
];

export const BUSINESS_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-leather-portfolio", name: "Leather Portfolio", room: "business", emotionalPurpose: "Building something meaningful", catalogObjectId: "obj-contract-folder", isPrimary: true }),
  sig({ id: "sig-camera", name: "Camera", room: "business", emotionalPurpose: "Capture the work", catalogObjectId: "obj-camera" }),
  sig({ id: "sig-microphone", name: "Microphone", room: "business", emotionalPurpose: "Voice going out", catalogObjectId: "obj-microphone" }),
  sig({ id: "sig-laptop", name: "Laptop", room: "business", emotionalPurpose: "Work paused", catalogObjectId: "obj-laptop-closed" }),
  sig({ id: "sig-marketing-notebook", name: "Marketing Notebook", room: "business", emotionalPurpose: "Audience in mind", catalogObjectId: "obj-marketing-notebook" }),
  sig({ id: "sig-presentation-folder", name: "Presentation Folder", room: "business", emotionalPurpose: "Share the story", catalogObjectId: "obj-contract-folder" }),
  sig({ id: "sig-business-card-holder", name: "Business Card Holder", room: "business", emotionalPurpose: "Introduction ready", catalogObjectId: "obj-business-cards" }),
  sig({ id: "sig-whiteboard", name: "Whiteboard", room: "business", emotionalPurpose: "Think out loud", catalogObjectId: "obj-whiteboard" }),
];

export const KITCHEN_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-coffee-pot", name: "Coffee Pot", room: "kitchen", emotionalPurpose: "Ritual and patience", catalogObjectId: "obj-french-press", animation: "steam", isPrimary: true }),
  sig({ id: "sig-favorite-mug", name: "Favorite Mug", room: "kitchen", emotionalPurpose: "Welcome", catalogObjectId: "obj-shari-signature-mug", animation: "steam" }),
  sig({ id: "sig-herb-garden", name: "Herb Garden", room: "kitchen", emotionalPurpose: "Fresh and useful", catalogObjectId: "obj-herb-basket" }),
  sig({ id: "sig-recipe-box", name: "Recipe Box", room: "kitchen", emotionalPurpose: "Handed-down care", catalogObjectId: "obj-recipe-cards" }),
  sig({ id: "sig-wooden-spoon", name: "Wooden Spoon", room: "kitchen", emotionalPurpose: "Cooking as love", catalogObjectId: "obj-wooden-spoon" }),
  sig({ id: "sig-fresh-fruit-bowl", name: "Fresh Fruit Bowl", room: "kitchen", emotionalPurpose: "Abundance on the table", catalogObjectId: "obj-fruit-bowl" }),
  sig({ id: "sig-kitchen-nook", name: "Kitchen Nook", room: "kitchen", emotionalPurpose: "Hands dried with care", catalogObjectId: "obj-kitchen-towel" }),
  sig({ id: "sig-tea-tin", name: "Tea Tin", room: "kitchen", emotionalPurpose: "Choices and calm", catalogObjectId: "obj-tea-tin" }),
];

export const NATURE_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-hummingbird", name: "Hummingbird", room: "nature", emotionalPurpose: "Delicate hope", catalogObjectId: "obj-hummingbird", animation: "bird-visit", isPrimary: true }),
  sig({ id: "sig-goldfinch", name: "Goldfinch", room: "nature", emotionalPurpose: "Summer joy", catalogObjectId: "obj-goldfinch", animation: "bird-visit" }),
  sig({ id: "sig-cardinal", name: "Cardinal", room: "nature", emotionalPurpose: "Winter brightness", catalogObjectId: "obj-cardinal", animation: "bird-visit" }),
  sig({ id: "sig-butterfly", name: "Butterfly", room: "nature", emotionalPurpose: "Gentle transformation", catalogObjectId: "obj-butterfly", animation: "sway" }),
  sig({ id: "sig-dragonfly", name: "Dragonfly", room: "nature", emotionalPurpose: "Stillness over water", catalogObjectId: "obj-dragonfly" }),
  sig({ id: "sig-sunflower", name: "Sunflower", room: "nature", emotionalPurpose: "Bold warmth", catalogObjectId: "obj-sunflowers" }),
  sig({ id: "sig-lavender", name: "Lavender", room: "nature", emotionalPurpose: "Calm scent", catalogObjectId: "obj-lavender-bundle" }),
  sig({ id: "sig-wildflowers", name: "Wildflowers", room: "nature", emotionalPurpose: "Care", catalogObjectId: "obj-wildflower-bouquet" }),
  sig({ id: "sig-garden-gloves", name: "Garden Gloves", room: "nature", emotionalPurpose: "Hands in soil", catalogObjectId: "obj-garden-gloves" }),
  sig({ id: "sig-watering-can", name: "Watering Can", room: "nature", emotionalPurpose: "Tending life", catalogObjectId: "obj-watering-can" }),
];

export const KINSEY_SIGNATURES: SignatureCompanionObject[] = [
  sig({ id: "sig-kinsey-dog-bed", name: "Dog Bed", room: "kinsey", emotionalPurpose: "Companionship", catalogObjectId: "obj-kinsey-dog-bed", isPrimary: true }),
  sig({ id: "sig-kinsey-favorite-toy", name: "Favorite Toy", room: "kinsey", emotionalPurpose: "Joy", catalogObjectId: "obj-kinsey-favorite-toy" }),
  sig({ id: "sig-kinsey-water-bowl", name: "Water Bowl", room: "kinsey", emotionalPurpose: "Cared for", catalogObjectId: "obj-kinsey-water-bowl", animation: "water-ripple" }),
  sig({ id: "sig-kinsey-leash", name: "Leash", room: "kinsey", emotionalPurpose: "Adventures together", catalogObjectId: "obj-kinsey-leash" }),
  sig({ id: "sig-kinsey-treat-jar", name: "Treat Jar", room: "kinsey", emotionalPurpose: "Small rewards", catalogObjectId: "obj-kinsey-treat-jar" }),
  sig({ id: "sig-kinsey-blanket", name: "Blanket", room: "kinsey", emotionalPurpose: "Cozy nap", catalogObjectId: "obj-kinsey-blanket" }),
  sig({ id: "sig-kinsey-tennis-ball", name: "Tennis Ball", room: "kinsey", emotionalPurpose: "Play", catalogObjectId: "obj-kinsey-tennis-ball" }),
];

export const SIGNATURE_OBJECTS_BY_ROOM: Record<
  SignatureRoomZone,
  SignatureCompanionObject[]
> = {
  "living-room": LIVING_ROOM_SIGNATURES,
  "clear-my-mind": CLEAR_MY_MIND_SIGNATURES,
  "planning-table": PLANNING_TABLE_SIGNATURES,
  "sunroom-over-pond": SUNROOM_OVER_POND_SIGNATURES,
  "reading-nook": READING_NOOK_SIGNATURES,
  "creative-studio": CREATIVE_STUDIO_SIGNATURES,
  business: BUSINESS_SIGNATURES,
  kitchen: KITCHEN_SIGNATURES,
  nature: NATURE_SIGNATURES,
  kinsey: KINSEY_SIGNATURES,
};

export const SIGNATURE_COMPANION_OBJECTS: readonly SignatureCompanionObject[] =
  Object.values(SIGNATURE_OBJECTS_BY_ROOM).flat();
