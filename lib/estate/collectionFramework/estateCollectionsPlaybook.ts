/**
 * Estate Collections Playbook™
 *
 * Canonical reference for where meaningful moments belong in Spark Estate.
 * Philosophy first — technology follows. Used by collection offer intelligence,
 * conversation coaching, and future features.
 *
 * @see docs/estate/ESTATE_COLLECTIONS_PLAYBOOK.md
 */

import { getEstateCollectionRoom } from "./registry";
import type { EstateCollectionRoomId } from "./types";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";

export type EstateCollectionPlaybookRoom = {
  id: EstateCollectionRoomId;
  purpose: string;
  belongsHere: readonly string[];
};

/** Spark's first-pass routing — what the member is sharing. */
export type EstateCollectionDecisionTreeRule = {
  signal: string;
  roomId: EstateCollectionRoomId;
};

export type EstateCollectionCrossRoomExample = {
  moment: string;
  rooms: readonly EstateCollectionRoomId[];
};

export const ESTATE_COLLECTIONS_PLAYBOOK_TITLE =
  "Estate Collections Playbook™";

export const ESTATE_COLLECTIONS_PLAYBOOK_ROOMS: Record<
  EstateCollectionRoomId,
  EstateCollectionPlaybookRoom
> = {
  journal: {
    id: "journal",
    purpose:
      "Capture thoughts, reflections, emotions, ideas, and life as it happens.",
    belongsHere: [
      "Feeling overwhelmed",
      "Great idea",
      "Prayer",
      "Gratitude",
      "Vacation memory",
      "Tough day",
      "Brainstorming",
      "Family story",
      "Dream you had",
      "Quote you love",
      "Something you learned",
      "Book notes",
      "Random thought",
      "Lesson from today",
      "Conversation that touched you",
      "Letter you'll never send",
      "Reflection after a coaching session",
      "Personal insight",
      "Business idea",
      "Daily journal",
    ],
  },
  greenhouse: {
    id: "greenhouse",
    purpose: "Record things that are still developing.",
    belongsHere: [
      "Becoming more patient",
      "Improving communication",
      "Building confidence",
      "Health journey",
      "Learning to delegate",
      "Better boundaries",
      "Public speaking confidence",
      "Better listener",
      "Exercise consistency",
      "Spiritual growth",
      "Marriage improving",
      "Leadership development",
      "Better habits",
      "Learning AI",
      "Building resilience",
      "Time management improving",
      "More organized",
      "Emotional growth",
    ],
  },
  "evidence-vault": {
    id: "evidence-vault",
    purpose:
      "Preserve proof that you solved problems and made a difference.",
    belongsHere: [
      "Solved a difficult client issue",
      "Prevented a major mistake",
      "Improved a process",
      "Resolved a conflict",
      "Saved a project",
      "Helped a customer",
      "Fixed software",
      "Negotiated successfully",
      "Handled criticism well",
      "Solved a family problem",
      "Saved money",
      "Improved efficiency",
      "Created a workaround",
      "Helped someone succeed",
      "Took initiative",
      "Made a difficult decision",
      "Managed a crisis",
      "Learned from failure",
    ],
  },
  "achievement-library": {
    id: "achievement-library",
    purpose: "Preserve your life's work.",
    belongsHere: [
      "Published a book",
      "Finished a course",
      "Started a business",
      "Built a website",
      "Created a workshop",
      "Designed a product",
      "Recorded a podcast",
      "Wrote an article",
      "Received certification",
      "Won an award",
      "Created a journal",
      "Built Spark Estate",
      "Finished a presentation",
      "Created a template",
      "Invented a process",
      "Developed a GPT",
      "Finished a major project",
      "Created artwork",
    ],
  },
  "celebration-garden": {
    id: "celebration-garden",
    purpose: "Celebrate progress.",
    belongsHere: [
      "Drank enough water today",
      "Walked today",
      "Lost 2 pounds",
      "Finished laundry",
      "Asked for help",
      "Sent the email",
      "Called a friend",
      "Took a break",
      "Stayed calm",
      "Finished today's priority",
      "Ate healthy",
      "Got outside",
      "Meditated",
      "Cleaned the office",
      "Finished a chapter",
      "Good family moment",
      "Small client win",
      "Great compliment",
      "Wonderful conversation",
      "Did something brave",
    ],
  },
  "celebration-hall": {
    id: "celebration-hall",
    purpose: "Preserve landmark life moments.",
    belongsHere: [
      "Published first book",
      "Million-dollar milestone",
      "Retirement",
      "Wedding",
      "Graduation",
      "Major anniversary",
      "Grandchild born",
      "Business launch",
      "National award",
      "TED Talk",
      "Bought dream home",
      "Lifetime achievement",
      "Company acquisition",
      "Hall of Fame",
      "Major patent",
      "Best-selling author",
      "Landmark court victory",
      "Thirty-year business anniversary",
    ],
  },
};

export const ESTATE_COLLECTIONS_DECISION_TREE: readonly EstateCollectionDecisionTreeRule[] =
  [
    {
      signal: "Thoughts, feelings, ideas",
      roomId: "journal",
    },
    {
      signal: "Something that's improving over time",
      roomId: "greenhouse",
    },
    {
      signal: "A problem they solved or improvement they made",
      roomId: "evidence-vault",
    },
    {
      signal: "Something they created or completed",
      roomId: "achievement-library",
    },
    {
      signal: "A success or happy moment",
      roomId: "celebration-garden",
    },
    {
      signal: "A once-in-a-lifetime milestone",
      roomId: "celebration-hall",
    },
  ];

export const ESTATE_COLLECTIONS_CROSS_ROOM_EXAMPLES: readonly EstateCollectionCrossRoomExample[] =
  [
    { moment: "Had a great idea", rooms: ["journal"] },
    { moment: "Solved difficult client issue", rooms: ["evidence-vault", "celebration-garden"] },
    { moment: "Built new website", rooms: ["achievement-library", "celebration-garden"] },
    {
      moment: "Published first book",
      rooms: ["achievement-library", "celebration-garden", "celebration-hall"],
    },
    { moment: "Feeling discouraged", rooms: ["journal"] },
    { moment: "Becoming more patient", rooms: ["greenhouse"] },
    { moment: "Lost 20 pounds", rooms: ["greenhouse", "celebration-garden"] },
    {
      moment: "Finished Guidebook",
      rooms: ["achievement-library", "celebration-garden"],
    },
    {
      moment: "Spark Estate launched",
      rooms: [
        "evidence-vault",
        "achievement-library",
        "celebration-garden",
        "celebration-hall",
      ],
    },
    { moment: "Wonderful family vacation", rooms: ["journal", "celebration-garden"] },
    { moment: "Learned something important", rooms: ["journal", "greenhouse"] },
    {
      moment: "Helped a friend through crisis",
      rooms: ["evidence-vault", "celebration-garden"],
    },
  ];

/** Pairs that may deserve a multi-room offer when both score highly. */
export const ESTATE_COLLECTIONS_COMPLEMENTARY_PAIRS: ReadonlyArray<
  readonly [EstateCollectionRoomId, EstateCollectionRoomId]
> = [
  ["achievement-library", "celebration-garden"],
  ["achievement-library", "celebration-hall"],
  ["evidence-vault", "celebration-garden"],
  ["journal", "greenhouse"],
  ["greenhouse", "celebration-garden"],
  ["journal", "celebration-garden"],
];

/** How Spark phrases a single-room permission offer. */
export const ESTATE_COLLECTIONS_ROOM_OFFER_PHRASE: Record<
  EstateCollectionRoomId,
  string
> = {
  journal: "rest it quietly in your Journal Gazebo",
  greenhouse: "place it in the Growth Greenhouse",
  "evidence-vault": "preserve it in the Evidence Vault",
  "achievement-library":
    "preserve it in your Achievement Library as part of your life's work",
  "celebration-garden": "celebrate it in the Celebration Garden",
  "celebration-hall": "honor it in the Celebration Hall",
};

export type PlaybookRoomSignal = {
  id: EstateCollectionRoomId;
  patterns: readonly RegExp[];
  weight: number;
};

/** Regex signals derived from the Playbook decision tree and belongs-here themes. */
export const PLAYBOOK_ROOM_SIGNALS: readonly PlaybookRoomSignal[] = [
  {
    id: "celebration-garden",
    weight: 1,
    patterns: [
      /\b(?:went well|win|won|proud|celebrat|finished|completed|shipped|posted|knocked it out|got it done|small victory|good day|walked today|stayed calm|took a break|asked for help|sent the email|called a friend|meditated|got outside)\b/i,
      /\b(?:finally did|pulled it off|nailed it|drank enough water|finished laundry|finished today's priority|small client win|great compliment|did something brave)\b/i,
    ],
  },
  {
    id: "evidence-vault",
    weight: 1.1,
    patterns: [
      /\b(?:solved|figured out|handled|overcame|fixed|prevented|navigated|worked through|difficult|hard conversation|stuck with it|negotiated|managed a crisis|took initiative|saved a project|helped a customer|created a workaround|learned from failure)\b/i,
      /\b(?:problem i|issue i|crisis|fire drill|difficult client|resolved a conflict|improved a process|saved money)\b/i,
    ],
  },
  {
    id: "journal",
    weight: 1,
    patterns: [
      /\b(?:grateful|thankful|reflecting|realized|learning about myself|on my mind|feeling|prayer|dreamed|journal|overwhelmed|tough day|brainstorm|family story|book notes|random thought|personal insight|business idea|vacation|letter i'll never send)\b/i,
      /\b(?:lesson i|what i learned|processing|quote i love|coaching session)\b/i,
    ],
  },
  {
    id: "greenhouse",
    weight: 0.95,
    patterns: [
      /\b(?:trying to build|working on becoming|nurturing|growing in|new habit|learning to|still becoming|tender idea|becoming more|improving communication|building confidence|health journey|better boundaries|spiritual growth|leadership development|building resilience|emotional growth)\b/i,
      /\b(?:not ready to launch|taking root|exercise consistency|time management improving|more organized)\b/i,
    ],
  },
  {
    id: "achievement-library",
    weight: 1.05,
    patterns: [
      /\b(?:published|launched|released|built my|created a|finished my|completed my|certification|award|course|book|podcast|website|workshop|template|presentation|major project|body of work|portfolio piece|spark estate|developed a gpt|created artwork)\b/i,
      /\b(?:started a business|designed a product|wrote an article|won an award|invented a process)\b/i,
    ],
  },
  {
    id: "celebration-hall",
    weight: 1.2,
    patterns: [
      /\b(?:retirement|wedding|graduation|million|anniversary|major milestone|book published|business launch|grandchild|national award|ted talk|dream home|lifetime achievement|company acquisition|hall of fame|major patent|best-selling|landmark|thirty-year)\b/i,
      /\b(?:turning point|chapter of my life|once in a lifetime|first book)\b/i,
    ],
  },
];

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreBelongsHerePhrase(userText: string, phrase: string): number {
  const normalized = normalizeForMatch(userText);
  const target = normalizeForMatch(phrase);
  if (target.length < 6) return 0;
  if (normalized.includes(target)) return 1.15;
  const words = target.split(" ").filter((w) => w.length > 3);
  if (!words.length) return 0;
  const hits = words.filter((w) => normalized.includes(w)).length;
  const ratio = hits / words.length;
  if (ratio >= 0.65) return 0.85 * ratio;
  return 0;
}

function scoreCrossRoomExamples(userText: string): Map<EstateCollectionRoomId, number> {
  const boosts = new Map<EstateCollectionRoomId, number>();
  const normalized = normalizeForMatch(userText);
  for (const example of ESTATE_COLLECTIONS_CROSS_ROOM_EXAMPLES) {
    const words = normalizeForMatch(example.moment)
      .split(" ")
      .filter((w) => w.length > 3);
    if (!words.length) continue;
    const hits = words.filter((w) => normalized.includes(w)).length;
    const threshold = words.length <= 3 ? 1 : 2;
    if (hits >= threshold) {
      for (const roomId of example.rooms) {
        boosts.set(roomId, (boosts.get(roomId) ?? 0) + 0.75);
      }
    }
  }
  return boosts;
}

export function scorePlaybookRooms(
  userText: string,
): Array<{ id: EstateCollectionRoomId; score: number }> {
  const scores = new Map<EstateCollectionRoomId, number>();

  for (const signal of PLAYBOOK_ROOM_SIGNALS) {
    let roomScore = 0;
    for (const pattern of signal.patterns) {
      if (pattern.test(userText)) roomScore += signal.weight;
    }
    if (roomScore > 0) scores.set(signal.id, roomScore);
  }

  for (const roomId of ESTATE_COLLECTION_ROOM_IDS) {
    const room = ESTATE_COLLECTIONS_PLAYBOOK_ROOMS[roomId];
    let phraseScore = 0;
    for (const phrase of room.belongsHere) {
      phraseScore += scoreBelongsHerePhrase(userText, phrase);
    }
    if (phraseScore > 0) {
      scores.set(roomId, (scores.get(roomId) ?? 0) + phraseScore);
    }
  }

  const crossBoosts = scoreCrossRoomExamples(userText);
  for (const [roomId, boost] of crossBoosts) {
    scores.set(roomId, (scores.get(roomId) ?? 0) + boost);
  }

  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

export function isComplementaryRoomPair(
  a: EstateCollectionRoomId,
  b: EstateCollectionRoomId,
): boolean {
  return ESTATE_COLLECTIONS_COMPLEMENTARY_PAIRS.some(
    ([left, right]) =>
      (left === a && right === b) || (left === b && right === a),
  );
}

export function roomName(roomId: EstateCollectionRoomId): string {
  return getEstateCollectionRoom(roomId).roomName;
}

export function singleRoomOfferLine(roomId: EstateCollectionRoomId): string {
  const phrase = ESTATE_COLLECTIONS_ROOM_OFFER_PHRASE[roomId];
  const name = roomName(roomId);
  if (roomId === "journal") {
    return `That feels like a meaningful reflection. Would you like to ${phrase}?`;
  }
  if (roomId === "greenhouse") {
    return `That sounds like something still growing in your life. Would you like to ${phrase}?`;
  }
  if (roomId === "evidence-vault") {
    return `This sounds like strong evidence of a problem you solved. Would you like to ${phrase}?`;
  }
  if (roomId === "achievement-library") {
    return `That sounds like part of your life's body of work. Would you like to ${phrase}?`;
  }
  if (roomId === "celebration-garden") {
    return `That sounds like something worth celebrating. Would you like to ${phrase}?`;
  }
  return `That feels like a chapter worth honoring. Would you like to ${phrase}?`;
}

export function formatMultiRoomCollectionOffer(
  primaryId: EstateCollectionRoomId,
  alternateIds: readonly EstateCollectionRoomId[],
): string {
  const unique = [
    primaryId,
    ...alternateIds.filter((id) => id !== primaryId),
  ];
  if (unique.length < 2) return singleRoomOfferLine(primaryId);

  const phrases = unique.map((id) => ESTATE_COLLECTIONS_ROOM_OFFER_PHRASE[id]);
  if (unique.length === 2) {
    return `I think this deserves more than one place in the Estate. We could ${phrases[0]}, and we could also ${phrases[1]}. Would you like to do both?`;
  }
  const last = phrases[phrases.length - 1]!;
  const rest = phrases.slice(0, -1).join(", ");
  return `I think this deserves more than one place in the Estate. We could ${rest}, and we could also ${last}. Where would you like to begin?`;
}

export function resolvePlaybookRoomFromSignal(
  text: string,
): EstateCollectionRoomId | null {
  const ranked = scorePlaybookRooms(text);
  return ranked[0]?.id ?? null;
}

export function playbookRoomForDecisionTreeKeyword(
  text: string,
): EstateCollectionRoomId | null {
  const t = text.toLowerCase();
  for (const rule of ESTATE_COLLECTIONS_DECISION_TREE) {
    const keywords = rule.signal.toLowerCase().split(/,\s*/);
    if (keywords.some((k) => t.includes(k.split(" ")[0]!))) {
      return rule.roomId;
    }
  }
  return resolvePlaybookRoomFromSignal(text);
}
