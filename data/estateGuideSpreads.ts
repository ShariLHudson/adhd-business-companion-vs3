/**
 * Spark Estate Guidebook™ — spread data.
 * Each spread composes optional editorial blocks — not one repeated template.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateCollectionRoomId } from "@/lib/estate/collectionFramework/types";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

/** All guidebook spreads — single source of truth. */
export const ESTATE_GUIDE_SPREADS: readonly EstateGuideSpreadData[] = [
  {
    id: "estate-library",
    title: "The Estate Library™",
    image: estateBackgroundPath("estate-library-background.png"),
    imagePlaceId: "library",
    tagline: "Where stories are kept — never lost.",
    leftBlocks: [
      {
        type: "around-the-estate",
        title: "A destination that protects what matters",
        paragraphs: [
          "The Estate Library was built for permanence. Volumes line the shelves — accomplishments, journals, letters, collections, and the guide that helps you find your way.",
          "Nothing stored here is ever lost. This is not a folder tree or a filing system. It is a room where your story can rest with dignity.",
        ],
        visitReasons: [
          "When you want to revisit what you have written, built, or become.",
          "When you need proof that your work and growth have a home.",
        ],
      },
      {
        type: "found-among-archives",
        title: "A margin note, circa opening day",
        paragraphs: [
          "The first librarians wrote in the flyleaf: preserve what is true, leave out what was luck alone, and never hurry a member who is remembering.",
        ],
        source: "Estate Library opening ledger",
      },
      {
        type: "estate-saying",
        quote: "Some rooms hold tasks. This one holds your story.",
      },
    ],
    rightBlocks: [
      {
        type: "from-sharis-notebook",
        title: "On walking the aisles",
        paragraphs: [
          "The Library does not hurry you. It invites you to remember — gently — that what you have lived and made is worth keeping.",
        ],
        prompts: [
          "What story on these shelves would remind you who you are?",
          "What would you like the Library to hold for future-you?",
        ],
      },
      {
        type: "curators-note",
        paragraphs: [
          "What you preserve with care becomes easier to build upon tomorrow.",
        ],
      },
      {
        type: "stewards-note",
        paragraphs: [
          "You do not have to carry every chapter in your head. Leaders who honor their own history make steadier decisions than those who only chase the next milestone.",
        ],
      },
      {
        type: "leave-remembering-one-thing",
        line: "Walk the aisles slowly. Pull one volume that calls to you — we can open it together.",
      },
    ],
  },
  {
    id: "journal",
    title: "The White Gazebo™",
    image: estateBackgroundPath("gazebo-journal-background.png"),
    imagePlaceId: "journal",
    tagline: "A quiet place to write what matters.",
    leftBlocks: [
      {
        type: "around-the-estate",
        title: "Where reflection has room to breathe",
        paragraphs: [
          "The Gazebo sits apart from the hurry of the house — open air, soft light, nowhere to perform.",
          "This is where thoughts land before they become plans. Nothing here needs to be polished.",
        ],
        visitReasons: [
          "When your mind is full and you need paper, not pressure.",
          "When you want to remember what you felt — not only what you did.",
        ],
      },
      {
        type: "estate-tradition",
        title: "The unhurried page",
        paragraphs: [
          "Members have long come here with no agenda — one sentence, one prayer, one line of gratitude. The tradition is presence, not productivity.",
        ],
      },
      {
        type: "estate-saying",
        quote: "Some truths only arrive when we stop trying to solve them.",
      },
    ],
    rightBlocks: [
      {
        type: "from-sharis-notebook",
        paragraphs: [
          "Writing here is not homework. It is companionship with your own voice.",
          "Clarity often follows honesty — not effort. You are allowed to think slowly.",
        ],
        prompts: [
          "What would you write if no one were grading it?",
          "What felt true today, even if it was small?",
        ],
      },
      {
        type: "stewards-note",
        paragraphs: [
          "The best decisions rarely come from the noisiest hour of the day.",
        ],
      },
      {
        type: "leave-remembering-one-thing",
        line: "Sit for a moment. One sentence is enough — we can stay here as long as you like.",
      },
    ],
  },
  {
    id: "greenhouse",
    title: "The Greenhouse™",
    image: estateBackgroundPath("greenhouse-background.png"),
    imagePlaceId: "greenhouse",
    tagline: "Where possibilities begin — without rush.",
    leftBlocks: [
      {
        type: "around-the-estate",
        title: "A room for ideas still becoming",
        paragraphs: [
          "The Greenhouse is warm, patient, and a little messy in the best way. Things grow here before they are ready to show anyone.",
          "Not every seed becomes a launch. Some become understanding. Some become rest.",
        ],
        visitReasons: [
          "When an idea is tender and does not need a deadline yet.",
          "When you want hope without pressure to perform.",
        ],
      },
      {
        type: "estate-tradition",
        title: "Plant before you pitch",
        paragraphs: [
          "Estate custom holds that tender ideas deserve shelter first — labels and launches can wait for the season that fits.",
        ],
      },
    ],
    rightBlocks: [
      {
        type: "from-sharis-notebook",
        title: "On nurture",
        paragraphs: ["Nurture is not delay — it is respect for timing."],
      },
      {
        type: "curators-note",
        paragraphs: [
          "Protecting an idea early can save it later. Not everything must be shared the moment it appears.",
        ],
      },
      {
        type: "stewards-note",
        paragraphs: [
          "Founders who plant before they pitch often build sturdier work.",
        ],
      },
      {
        type: "estate-saying",
        quote: "Growth is allowed to be invisible for a while.",
      },
      {
        type: "from-sharis-notebook",
        prompts: [
          "What idea needs protection more than sunlight right now?",
          "What would nurturing look like — without launching?",
        ],
      },
      {
        type: "leave-remembering-one-thing",
        line: "Name one seed. We can let it rest here until the season changes.",
      },
    ],
  },
  {
    id: "evidence-vault",
    title: "The Evidence Vault™",
    image: estateBackgroundPath("evidence-vault-background.png"),
    imagePlaceId: "evidence-vault",
    tagline: "Proof of growth — for harder days.",
    leftBlocks: [
      {
        type: "around-the-estate",
        title: "When confidence forgets the facts",
        paragraphs: [
          "The Vault holds what actually happened — handled, survived, finished, improved.",
          "On days doubt speaks loudest, these records speak back — calmly, without argument.",
        ],
        visitReasons: [
          "When you forget how capable you have already been.",
          "When you want proof that is yours — not borrowed praise.",
        ],
      },
      {
        type: "found-among-archives",
        title: "Sealed record, first winter",
        paragraphs: [
          "Evidence is not ego. It is memory with integrity. Keep what is true. Leave out what was luck alone. Your effort still counts.",
        ],
      },
    ],
    rightBlocks: [
      {
        type: "stewards-note",
        paragraphs: [
          "Confidence grows when truth is easy to find. You have already done hard things.",
        ],
      },
      {
        type: "curators-note",
        paragraphs: [
          "Leaders who track real wins make braver calls in uncertainty.",
        ],
      },
      {
        type: "estate-saying",
        quote: "Evidence is not ego. It is memory with integrity.",
      },
      {
        type: "from-sharis-notebook",
        prompts: [
          "What have you handled better than a year ago?",
          "What would future-you want to read on a hard morning?",
        ],
      },
      {
        type: "leave-remembering-one-thing",
        line: "Place one truth in the vault today — even if it feels small.",
      },
    ],
  },
  {
    id: "celebration-garden",
    title: "The Celebration Garden™",
    image: estateBackgroundPath("celebration-garden-background.png"),
    imagePlaceId: "gardens",
    tagline: "Wins worth remembering — gathered gently.",
    leftBlocks: [
      {
        type: "around-the-estate",
        title: "Where good moments are allowed to bloom",
        paragraphs: [
          "The Garden is not a scoreboard. It is a place to notice what went well before the day rushes on.",
          "Celebration here is quiet dignity — not performance.",
        ],
        visitReasons: [
          "When you minimize wins that still mattered.",
          "When you want warmth without turning progress into pressure.",
        ],
      },
      {
        type: "estate-tradition",
        title: "The bloom mark",
        paragraphs: [
          "Each planted win receives a quiet mark — not a trophy, not a streak. The tradition is remembrance, not ranking.",
        ],
      },
      {
        type: "estate-saying",
        quote: "Joy kept gently becomes courage later.",
      },
    ],
    rightBlocks: [
      {
        type: "from-sharis-notebook",
        paragraphs: [
          "Naming a win does not make you complacent. It makes you human.",
          "What you celebrate, you strengthen. Small good days count.",
        ],
      },
      {
        type: "curators-note",
        paragraphs: [
          "Teams that honor real progress sustain momentum longer than those chasing only the next goal.",
        ],
      },
      {
        type: "from-sharis-notebook",
        prompts: [
          "What went well this week that you have not named yet?",
          "Who helped you get here?",
        ],
      },
      {
        type: "leave-remembering-one-thing",
        line: "Plant one moment in the garden — we can visit it whenever you need hope.",
      },
    ],
  },
  {
    id: "celebration-hall",
    title: "The Celebration Hall™",
    image: estateBackgroundPath("celebration-room-background.png"),
    imagePlaceId: "celebration-room",
    tagline: "Chapters honored — not rushed past.",
    leftBlocks: [
      {
        type: "around-the-estate",
        title: "A hall for seasons that shaped you",
        paragraphs: [
          "The Hall is where chapters receive their names — survived, turned, finished, outgrown.",
          "This is not a report card. It is a place to stand inside your own story with dignity.",
        ],
        visitReasons: [
          "When a season deserves to be named before you move on.",
          "When you want your journey visible — for you first.",
        ],
      },
      {
        type: "found-among-archives",
        title: "Inscription above the arch",
        paragraphs: [
          "Honoring a chapter is how you carry it forward wisely. Every hall has echoes — listen for what they taught you, not only what they cost.",
        ],
        source: "Celebration Hall dedication stone",
      },
    ],
    rightBlocks: [
      {
        type: "from-sharis-notebook",
        title: "On naming a season",
        paragraphs: [
          "Naming a season gives you power over how it follows you. You are more than your hardest chapter.",
        ],
      },
      {
        type: "stewards-note",
        paragraphs: [
          "Founders who integrate their story lead with steadier presence.",
        ],
      },
      {
        type: "estate-saying",
        quote: "Honoring a chapter is how you carry it forward wisely.",
      },
      {
        type: "from-sharis-notebook",
        prompts: [
          "What title would you give this season?",
          "What do you want to carry into the next hall?",
        ],
      },
      {
        type: "leave-remembering-one-thing",
        line: "Honor one chapter today — we can write its name together.",
      },
    ],
  },
];

const spreadById = new Map(
  ESTATE_GUIDE_SPREADS.map((spread) => [spread.id, spread]),
);

export function listEstateGuideSpreadIds(): string[] {
  return ESTATE_GUIDE_SPREADS.map((spread) => spread.id);
}

export function getEstateGuideSpread(
  id: string,
): EstateGuideSpreadData | undefined {
  return spreadById.get(id);
}

/** Collection room id → guide spread id (Achievement Library uses estate-library). */
const COLLECTION_ROOM_GUIDE_SPREAD_ID: Record<EstateCollectionRoomId, string> =
  {
    journal: "journal",
    greenhouse: "greenhouse",
    "evidence-vault": "evidence-vault",
    "achievement-library": "estate-library",
    "celebration-garden": "celebration-garden",
    "celebration-hall": "celebration-hall",
  };

export function getEstateGuideSpreadForCollectionRoom(
  roomId: EstateCollectionRoomId,
): EstateGuideSpreadData | undefined {
  return getEstateGuideSpread(COLLECTION_ROOM_GUIDE_SPREAD_ID[roomId]);
}

export function listCollectionRoomGuideSpreadIds(): string[] {
  return Object.values(COLLECTION_ROOM_GUIDE_SPREAD_ID);
}
