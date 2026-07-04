/**
 * Spark Estate Guidebook™ — premium coffee-table room pages.
 *
 * Layout: top-half photograph → title under image → caretaker sections across two pages.
 */

/** Current guidebook section types */
export type EstateGuideEditorialBlockType =
  | "estate-journals"
  | "estate-history"
  | "estate-traditions"
  | "visitors-miss"
  | "did-you-know"
  | "from-shari"
  | "before-you-leave"
  | "gardeners-philosophy"
  | "seasonal-notes"
  | "estate-lore"
  | "orchard-lore"
  | "wicker-basket"
  | "estate-table"
  | "estate-heart"
  | "coffee-conversation"
  | "discovery-key"
  | "room-possibility"
  | "estate-whisper"
  | "gardeners-table"
  | "living-classroom"
  | "why-this-room-exists"
  | "shelves-of-life"
  | "fire-that-never-rushes"
  | "stones-could-talk"
  | "every-frame-holds-a-beginning"
  | "a-final-note"
  | "five-minute-rule"
  | "why-we-play"
  | "marble-island"
  | "copper-hearth"
  | "cooks-notebook"
  | "why-this-place-exists"
  | "great-oak"
  | "branches-could-speak"
  | "front-entrance"
  | "why-doors-remain-open"
  | "welcome-hall"
  | "before-you-continue"
  | "doors-could-speak"
  | "more-than-a-telescope"
  | "circle-room"
  | "reflections-beneath-the-dome"
  | "room-without-expectations"
  | "evening-lantern"
  | "sunset-ritual"
  | "view-could-speak"
  | "the-window"
  | "books-that-have-lingered"
  | "window-could-speak"
  | "hidden-library"
  | "legendary-chair"
  | "favorite-tradition"
  | "things-people-often-miss"
  | "shelves-could-speak"
  | "story-of-spark-estate"
  | "why-estate-was-built"
  | "front-gates"
  | "the-fountain"
  | "spark-estate-gardens"
  | "before-you-walk-inside"
  | "the-horses"
  | "white-fence"
  | "morning-tradition"
  | "old-estate-legend"
  | "stables-could-speak"
  | "story-of-reflection-pond"
  | "the-waterfall"
  | "the-bench"
  | "quiet-estate-tradition"
  | "reflection-pond-could-speak"
  | "story-of-study-hall"
  | "the-tables"
  | "the-blackboard"
  | "flip-chart-tradition"
  | "learning-philosophy"
  | "study-hall-could-speak"
  | "story-of-momentum-room"
  | "cabinet-of-small-steps"
  | "drawer-tradition"
  | "mathematics-of-momentum"
  | "momentum-room-could-speak"
  | "story-of-summer-terrace"
  | "summer-evenings"
  | "outdoor-pavilion"
  | "summer-terrace-could-speak"
  | "keepers-notes"
  | "through-the-seasons"
  | "room-memories"
  | "artists-corner"
  | "studio-philosophy"
  | "tradition-worth-keeping"
  | "working-wall"
  | "caretakers-notebook"
  | "studio-spirit"
  | "caretakers-observation"
  | "final-estate-tradition"
  | "caretakers-closing-note"
  | "enjoy-visiting-next"
  /** Legacy — retained until pages are migrated */
  | "welcome-home"
  | "story"
  | "estate-secret"
  | "look-closely"
  | "reflection"
  | "tradition"
  | "walls-could-talk"
  | "collectors-corner"
  | "quiet-tradition"
  | "little-estate-tradition"
  | "legacy-tree"
  | "gardens-could-speak"
  | "gift-tradition"
  | "next-stop";

type BlockBase = {
  type: EstateGuideEditorialBlockType;
};

export type EstateGuideJournalBlock = BlockBase & {
  type: "estate-journals";
  date?: string;
  paragraphs: string[];
  attribution?: string[];
};

export type EstateGuideCaretakersNotebookBlock = BlockBase & {
  type: "caretakers-notebook";
  paragraphs: string[];
  attribution?: string[];
};

export type EstateGuideCaretakersObservationBlock = BlockBase & {
  type: "caretakers-observation";
  paragraphs: string[];
  attribution?: string[];
};

export type EstateGuideParagraphBlock = BlockBase & {
  type:
    | "estate-history"
    | "estate-traditions"
    | "visitors-miss"
    | "did-you-know"
    | "from-shari"
    | "before-you-leave"
    | "gardeners-philosophy"
    | "seasonal-notes"
    | "estate-lore"
    | "orchard-lore"
    | "wicker-basket"
    | "estate-table"
    | "estate-heart"
    | "coffee-conversation"
    | "discovery-key"
    | "room-possibility"
    | "estate-whisper"
    | "gardeners-table"
    | "living-classroom"
    | "why-this-room-exists"
    | "shelves-of-life"
    | "fire-that-never-rushes"
    | "stones-could-talk"
    | "every-frame-holds-a-beginning"
    | "a-final-note"
    | "five-minute-rule"
    | "why-we-play"
    | "marble-island"
    | "copper-hearth"
    | "cooks-notebook"
    | "why-this-place-exists"
    | "great-oak"
    | "branches-could-speak"
    | "front-entrance"
    | "why-doors-remain-open"
    | "welcome-hall"
    | "before-you-continue"
    | "doors-could-speak"
    | "more-than-a-telescope"
    | "circle-room"
    | "reflections-beneath-the-dome"
    | "room-without-expectations"
    | "evening-lantern"
    | "sunset-ritual"
    | "view-could-speak"
    | "the-window"
    | "books-that-have-lingered"
    | "window-could-speak"
    | "hidden-library"
    | "legendary-chair"
    | "favorite-tradition"
    | "things-people-often-miss"
    | "shelves-could-speak"
    | "story-of-spark-estate"
    | "why-estate-was-built"
    | "front-gates"
    | "the-fountain"
    | "spark-estate-gardens"
    | "before-you-walk-inside"
    | "the-horses"
    | "white-fence"
    | "morning-tradition"
    | "old-estate-legend"
    | "stables-could-speak"
    | "story-of-reflection-pond"
    | "the-waterfall"
    | "the-bench"
    | "quiet-estate-tradition"
    | "reflection-pond-could-speak"
    | "story-of-study-hall"
    | "the-tables"
    | "the-blackboard"
    | "flip-chart-tradition"
    | "learning-philosophy"
    | "study-hall-could-speak"
    | "story-of-momentum-room"
    | "cabinet-of-small-steps"
    | "drawer-tradition"
    | "mathematics-of-momentum"
    | "momentum-room-could-speak"
    | "story-of-summer-terrace"
    | "summer-evenings"
    | "outdoor-pavilion"
    | "summer-terrace-could-speak"
    | "keepers-notes"
    | "through-the-seasons"
    | "room-memories"
    | "artists-corner"
    | "studio-philosophy"
    | "tradition-worth-keeping"
    | "working-wall"
    | "studio-spirit"
    | "final-estate-tradition"
    | "caretakers-closing-note"
    | "welcome-home"
    | "story"
    | "estate-secret"
    | "look-closely"
    | "reflection"
    | "tradition"
    | "walls-could-talk"
    | "collectors-corner"
    | "quiet-tradition"
    | "little-estate-tradition"
    | "legacy-tree"
    | "gardens-could-speak"
    | "gift-tradition";
  paragraphs: string[];
  bullets?: string[];
  closingParagraphs?: string[];
  attribution?: string[];
  moments?: { title: string; text?: string; paragraphs?: string[] }[];
};

export type EstateGuideNextStopBlock = BlockBase & {
  type: "next-stop";
  destination: string;
};

export type EstateGuideVisitSuggestion = {
  place: string;
  note?: string;
};

export type EstateGuideEnjoyVisitingBlock = BlockBase & {
  type: "enjoy-visiting-next";
  destinations?: string[];
  visits?: EstateGuideVisitSuggestion[];
};

export type EstateGuideEditorialBlock =
  | EstateGuideJournalBlock
  | EstateGuideCaretakersObservationBlock
  | EstateGuideCaretakersNotebookBlock
  | EstateGuideParagraphBlock
  | EstateGuideNextStopBlock
  | EstateGuideEnjoyVisitingBlock;

export type EstateGuideSpreadData = {
  id: string;
  title: string;
  image: string;
  imagePlaceId?: string;
  guideSubtitle?: string;
  /** Parenthetical place name — e.g. "The Estate Boardroom" */
  roomSubtitle?: string;
  openingLine?: string;
  epigraph?: string;
  blocks: EstateGuideEditorialBlock[];
};

const BLOCK_LABELS: Record<EstateGuideEditorialBlockType, string> = {
  "estate-journals": "From the Estate Journals",
  "estate-history": "Estate History",
  "estate-traditions": "Estate Traditions",
  "visitors-miss": "Things Most Visitors Miss",
  "did-you-know": "Did You Know?",
  "from-shari": "From Shari",
  "before-you-leave": "Before You Leave",
  "gardeners-philosophy": "The Gardener's Philosophy",
  "seasonal-notes": "Seasonal Notes",
  "estate-lore": "Estate Lore",
  "orchard-lore": "Orchard Lore",
  "wicker-basket": "The Wicker Basket",
  "estate-table": "The Estate Table",
  "estate-heart": "The Heart of the Estate",
  "coffee-conversation": "Coffee, Conversation & Quiet Moments",
  "discovery-key": "The Discovery Key",
  "room-possibility": "A Room Designed for Possibility",
  "estate-whisper": "An Estate Whisper",
  "gardeners-table": "The Gardener's Table",
  "living-classroom": "A Living Classroom",
  "why-this-room-exists": "Why This Room Exists",
  "shelves-of-life": "The Shelves of a Life Well Lived",
  "fire-that-never-rushes": "The Fire That Never Rushes",
  "stones-could-talk": "If These Stones Could Talk",
  "every-frame-holds-a-beginning": "Every Frame Holds a Beginning",
  "a-final-note": "A Final Note",
  "five-minute-rule": "The Five-Minute Rule",
  "why-we-play": "Why We Play",
  "marble-island": "The Marble Island",
  "copper-hearth": "The Copper Hearth",
  "cooks-notebook": "From the Cook's Notebook",
  "why-this-place-exists": "Why This Place Exists",
  "great-oak": "The Great Oak",
  "branches-could-speak": "If These Branches Could Speak",
  "front-entrance": "The Front Entrance",
  "why-doors-remain-open": "Why the Doors Remain Open",
  "welcome-hall": "The Welcome Hall",
  "before-you-continue": "Before You Continue",
  "doors-could-speak": "If These Doors Could Speak",
  "more-than-a-telescope": "More Than a Telescope",
  "circle-room": "The Circle Room",
  "reflections-beneath-the-dome": "Reflections Beneath the Dome",
  "room-without-expectations": "A Room Without Expectations",
  "evening-lantern": "The Evening Lantern",
  "sunset-ritual": "The Sunset Ritual",
  "view-could-speak": "If This View Could Speak",
  "the-window": "The Window",
  "books-that-have-lingered": "Books That Have Lingered Here",
  "window-could-speak": "If This Window Could Speak",
  "hidden-library": "The Hidden Library",
  "legendary-chair": "The Chair",
  "favorite-tradition": "A Favorite Tradition",
  "things-people-often-miss": "Things People Often Miss",
  "shelves-could-speak": "If These Shelves Could Speak",
  "story-of-spark-estate": "The Story of Spark Estate",
  "why-estate-was-built": "Why the Estate Was Built",
  "front-gates": "The Front Gates",
  "the-fountain": "The Fountain",
  "spark-estate-gardens": "The Gardens",
  "before-you-walk-inside": "Before You Walk Inside",
  "the-horses": "The Horses",
  "white-fence": "The White Fence",
  "morning-tradition": "The Morning Tradition",
  "old-estate-legend": "An Old Estate Legend",
  "stables-could-speak": "If These Stables Could Speak",
  "story-of-reflection-pond": "The Story of the Reflection Pond",
  "the-waterfall": "The Waterfall",
  "the-bench": "The Bench",
  "quiet-estate-tradition": "A Quiet Estate Tradition",
  "reflection-pond-could-speak": "If The Reflection Pond Could Speak",
  "story-of-study-hall": "The Story of the Study Hall",
  "the-tables": "The Tables",
  "the-blackboard": "The Blackboard",
  "flip-chart-tradition": "The Flip Chart Tradition",
  "learning-philosophy": "The Estate's Learning Philosophy",
  "study-hall-could-speak": "If The Study Hall Could Speak",
  "story-of-momentum-room": "The Story of the Momentum Room",
  "cabinet-of-small-steps": "The Cabinet of Small Steps",
  "drawer-tradition": "The Drawer Tradition",
  "mathematics-of-momentum": "The Mathematics of Momentum",
  "momentum-room-could-speak": "If The Momentum Room Could Speak",
  "story-of-summer-terrace": "The Story of the Summer Terrace",
  "summer-evenings": "The Summer Evenings",
  "outdoor-pavilion": "The Outdoor Pavilion",
  "summer-terrace-could-speak": "If The Summer Terrace Could Speak",
  "keepers-notes": "The Keeper's Notes",
  "through-the-seasons": "Through the Seasons",
  "room-memories": "A Room Filled With Memories",
  "artists-corner": "The Artist's Corner",
  "studio-philosophy": "The Studio Philosophy",
  "tradition-worth-keeping": "A Tradition Worth Keeping",
  "working-wall": "The Working Wall",
  "caretakers-notebook": "A Page from the Caretaker's Notebook",
  "studio-spirit": "The Spirit of the Strategy Studio",
  "caretakers-observation": "The Caretaker's Observation",
  "final-estate-tradition": "A Final Estate Tradition",
  "caretakers-closing-note": "Caretaker's Closing Note",
  "enjoy-visiting-next": "You May Enjoy Visiting Next",
  "welcome-home": "Welcome Home",
  story: "The Story",
  "estate-secret": "Estate Secret",
  "look-closely": "Look Closely",
  reflection: "Reflection",
  tradition: "Estate Tradition",
  "walls-could-talk": "If These Walls Could Talk...",
  "collectors-corner": "Collector's Corner",
  "quiet-tradition": "A Quiet Tradition",
  "little-estate-tradition": "A Little Estate Tradition",
  "legacy-tree": "The Legacy Tree",
  "gardens-could-speak": "If These Gardens Could Speak",
  "gift-tradition": "A Quiet Tradition",
  "next-stop": "Next Stop",
};

export function estateGuideBlockLabel(
  type: EstateGuideEditorialBlockType,
): string {
  return BLOCK_LABELS[type];
}

export function estateGuideBlockDisplayLabel(
  type: EstateGuideEditorialBlockType,
): string {
  return estateGuideBlockLabel(type);
}

export function resolveEstateGuideSpreadBlocks(
  spread: EstateGuideSpreadData,
): EstateGuideEditorialBlock[] {
  return spread.blocks;
}

/** All block types (canonical + legacy until pages migrate). */
export const ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES = [
  "estate-journals",
  "estate-history",
  "estate-traditions",
  "visitors-miss",
  "did-you-know",
  "from-shari",
  "before-you-leave",
  "gardeners-philosophy",
  "seasonal-notes",
  "estate-lore",
  "orchard-lore",
  "wicker-basket",
  "estate-table",
  "estate-heart",
  "coffee-conversation",
  "discovery-key",
  "room-possibility",
  "estate-whisper",
  "gardeners-table",
  "living-classroom",
  "why-this-room-exists",
  "shelves-of-life",
  "fire-that-never-rushes",
  "stones-could-talk",
  "every-frame-holds-a-beginning",
  "a-final-note",
  "five-minute-rule",
  "why-we-play",
  "marble-island",
  "copper-hearth",
  "cooks-notebook",
  "why-this-place-exists",
  "great-oak",
  "branches-could-speak",
  "front-entrance",
  "why-doors-remain-open",
  "welcome-hall",
  "before-you-continue",
  "doors-could-speak",
  "more-than-a-telescope",
  "circle-room",
  "reflections-beneath-the-dome",
  "room-without-expectations",
  "evening-lantern",
  "sunset-ritual",
  "view-could-speak",
  "the-window",
  "books-that-have-lingered",
  "window-could-speak",
  "hidden-library",
  "legendary-chair",
  "favorite-tradition",
  "things-people-often-miss",
  "shelves-could-speak",
  "story-of-spark-estate",
  "why-estate-was-built",
  "front-gates",
  "the-fountain",
  "spark-estate-gardens",
  "before-you-walk-inside",
  "the-horses",
  "white-fence",
  "morning-tradition",
  "old-estate-legend",
  "stables-could-speak",
  "story-of-reflection-pond",
  "the-waterfall",
  "the-bench",
  "quiet-estate-tradition",
  "reflection-pond-could-speak",
  "story-of-study-hall",
  "the-tables",
  "the-blackboard",
  "flip-chart-tradition",
  "learning-philosophy",
  "study-hall-could-speak",
  "story-of-momentum-room",
  "cabinet-of-small-steps",
  "drawer-tradition",
  "mathematics-of-momentum",
  "momentum-room-could-speak",
  "story-of-summer-terrace",
  "summer-evenings",
  "outdoor-pavilion",
  "summer-terrace-could-speak",
  "keepers-notes",
  "through-the-seasons",
  "room-memories",
  "artists-corner",
  "studio-philosophy",
  "tradition-worth-keeping",
  "working-wall",
  "caretakers-notebook",
  "studio-spirit",
  "caretakers-observation",
  "final-estate-tradition",
  "caretakers-closing-note",
  "enjoy-visiting-next",
  "welcome-home",
  "story",
  "estate-secret",
  "look-closely",
  "reflection",
  "tradition",
  "walls-could-talk",
  "collectors-corner",
  "quiet-tradition",
  "little-estate-tradition",
  "legacy-tree",
  "gardens-could-speak",
  "gift-tradition",
  "next-stop",
] as const satisfies readonly EstateGuideEditorialBlockType[];

export function isEstateGuideEditorialBlockType(
  value: string,
): value is EstateGuideEditorialBlockType {
  return (ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES as readonly string[]).includes(
    value,
  );
}

export function validateEstateGuideSpread(
  spread: EstateGuideSpreadData,
): string[] {
  const errors: string[] = [];
  if (!spread.blocks.length) {
    errors.push(`${spread.id}: spread has no editorial blocks`);
  }
  for (const block of spread.blocks) {
    if (!isEstateGuideEditorialBlockType(block.type)) {
      errors.push(`${spread.id}: unknown block type "${block.type}"`);
    }
    if (block.type === "estate-journals" && !block.paragraphs.length) {
      errors.push(`${spread.id}: journal entry is empty`);
    }
    if (block.type === "caretakers-observation" && !block.paragraphs.length) {
      errors.push(`${spread.id}: caretaker observation is empty`);
    }
    if (block.type === "caretakers-notebook" && !block.paragraphs.length) {
      errors.push(`${spread.id}: caretaker notebook entry is empty`);
    }
    if (
      block.type !== "estate-journals" &&
      block.type !== "caretakers-observation" &&
      block.type !== "caretakers-notebook" &&
      block.type !== "next-stop" &&
      block.type !== "enjoy-visiting-next" &&
      "paragraphs" in block &&
      !block.paragraphs?.length &&
      !("bullets" in block && block.bullets?.length) &&
      !("moments" in block && block.moments?.length)
    ) {
      errors.push(`${spread.id}: block "${block.type}" has no content`);
    }
  }
  return errors;
}
