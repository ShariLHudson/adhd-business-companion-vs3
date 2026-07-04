/**
 * Spark Estate Collection Framework™ — room registry.
 *
 * Add a room = one config object here. Do not build a new app.
 *
 * Room meaning & routing: Estate Collections Playbook™
 * @see docs/estate/ESTATE_COLLECTIONS_PLAYBOOK.md
 * @see docs/estate/ESTATE_COLLECTION_INTELLIGENCE.md
 * @see ./estateCollectionsPlaybook.ts
 */

import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { AppSection } from "@/lib/companionUi";
import {
  EVIDENCE_VAULT_ROOM_BG,
  GROWTH_ROOM_BG,
  JOURNAL_ROOM_BG,
} from "@/lib/growth/growthRoom";
import { CELEBRATION_GARDEN_ROOM_BG } from "@/lib/celebrationGarden/celebrationGardenRoom";
import { STORY_LIBRARY_ROOM_BG } from "@/lib/storyLibrary/storyLibraryRoom";
import { getEstateCollectionAdapter } from "./adapters";
import type {
  EstateCollectionBrowseConfig,
  EstateCollectionRoomDefinition,
  EstateCollectionRoomId,
} from "./types";

const CELEBRATION_HALL_ROOM_BG = estateBackgroundPath(
  "room-celebration-hall-background.png",
);

const CARD_EDIT = "Continue writing";
const CARD_FAVORITE = "Treasure this";

function browse(
  partial: Partial<EstateCollectionBrowseConfig> & Pick<EstateCollectionBrowseConfig, "searchPlaceholder">,
): EstateCollectionBrowseConfig {
  return {
    enableSearch: true,
    enableFavorites: false,
    enableCategoryFilter: false,
    pageSize: 24,
    loadMoreLabel: "Browse more of the collection",
    resultsLabel: "In this collection",
    emptyFilterMessage:
      "Nothing matched your search — the collection is still here, peaceful and waiting.",
    ...partial,
  };
}

const JOURNAL_CATEGORIES = [
  { value: "reflection", label: "Reflection" },
  { value: "gratitude", label: "Gratitude" },
  { value: "lesson", label: "Lesson" },
  { value: "prayer", label: "Prayer" },
  { value: "dream", label: "Dream" },
  { value: "idea", label: "Idea" },
  { value: "feelings", label: "Feelings" },
] as const;

const GREENHOUSE_CATEGORIES = [
  { value: "habit", label: "Habit" },
  { value: "skill", label: "Skill" },
  { value: "goal", label: "Goal" },
  { value: "relationship", label: "Relationship" },
  { value: "business-idea", label: "Business idea" },
  { value: "health", label: "Health" },
  { value: "character", label: "Character" },
] as const;

const EVIDENCE_CATEGORIES = [
  { value: "Business Growth", label: "Business growth" },
  { value: "Client Impact", label: "Client impact" },
  { value: "Personal Growth", label: "Personal growth" },
  { value: "Courage", label: "Courage" },
  { value: "Problem Solving", label: "Problem solving" },
  { value: "Moved Forward", label: "Moved forward" },
] as const;

const ACHIEVEMENT_TYPES = [
  { value: "book", label: "Book" },
  { value: "course", label: "Course" },
  { value: "presentation", label: "Presentation" },
  { value: "business", label: "Business" },
  { value: "award", label: "Award" },
  { value: "product", label: "Product" },
  { value: "podcast", label: "Podcast" },
  { value: "video", label: "Video" },
  { value: "project", label: "Project" },
  { value: "certification", label: "Certification" },
  { value: "speaking", label: "Speaking engagement" },
  { value: "milestone", label: "Major milestone" },
] as const;

const ROOM_CONFIGS = {
  journal: {
    id: "journal",
    placeId: "journal",
    section: "growth-journal" as AppSection,
    roomName: "Journal Gazebo",
    kicker: "The White Gazebo",
    description:
      "A quiet page for thoughts, reflections, gratitude, prayers, and life as it happens.",
    backgroundImage: JOURNAL_ROOM_BG,
    imagePlaceId: "journal",
    openingSparkPrompt:
      "This is your quiet page — no audience, no hurry. What is on your heart today?",
    returnSparkPrompt:
      "It is nice to see you in the Gazebo again. Your pages are here whenever you want them.",
    suggestedPrompts: [
      "What felt heavy today?",
      "What am I grateful for?",
      "A lesson I want to remember",
      "Something I hope for",
    ],
    followUpQuestions: [
      "Would you like to keep writing?",
      "Is there one line you want to remember tomorrow?",
      "Should we treasure this entry?",
    ],
    collectionTitle: "Pages at rest",
    collectionEmptyMessage:
      "The gazebo is quiet. When you are ready, your words may rest here.",
    capture: {
      primaryFieldId: "body",
      composeTitle: "A quiet page",
      fields: [
        {
          id: "body",
          label: "What is on your mind?",
          placeholder:
            "Begin anywhere. Thoughts, gratitude, prayers, dreams — no polish required.",
          required: true,
          rows: 14,
          kind: "textarea",
          primary: true,
        },
        {
          id: "category",
          label: "Kind of entry (optional)",
          kind: "select",
          options: JOURNAL_CATEGORIES,
        },
        {
          id: "title",
          label: "A line to remember (optional)",
          placeholder: "A few words for the margin",
          kind: "text",
        },
        {
          id: "estatePlace",
          label: "Where in the Estate (optional)",
          placeholder: "A quiet note — where you were when this was written",
          kind: "text",
        },
      ],
      saveLabel: "Rest this page",
      updateLabel: "Continue writing",
      savedMessage:
        "Your thoughts have been tucked quietly into the Gazebo.",
      updatedMessage: "Your page has been updated.",
      suggestedPromptsLabel: "You might begin with",
      followUpSectionLabel: "When you are ready",
      enableAttachments: true,
      attachmentLabel: "Photos or keepsakes (optional)",
    },
    browse: browse({
      searchPlaceholder: "Search your journal pages…",
      enableFavorites: true,
      enableCategoryFilter: true,
      categoryLabel: "Kind of entry",
      loadMoreLabel: "More pages at rest",
      resultsLabel: "Pages here",
    }),
    display: {
      style: "reflection",
      card: {
        showMeta: true,
        showTitle: true,
        showIcon: false,
        showBadge: false,
        showExtraFields: false,
        showProgress: false,
        bodyEmphasis: "prose",
        layout: "stack",
        editLabel: "Continue writing",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 8,
      },
      removeLabel: "Remove page",
    },
    sparkSuggestionLines: [
      "I'd love to preserve this in your Journal Gazebo — would you like to rest it on a quiet page?",
      "This sounds like something your Journal Gazebo would hold gently. Shall we?",
    ],
  },
  greenhouse: {
    id: "greenhouse",
    placeId: "greenhouse",
    section: "growth-greenhouse" as AppSection,
    roomName: "Growth Greenhouse",
    kicker: "Where life is still becoming",
    description:
      "What is growing in my life — habits, skills, goals, relationships, ideas, and character. Not projects. Growth.",
    backgroundImage: GROWTH_ROOM_BG,
    imagePlaceId: "greenhouse",
    openingSparkPrompt:
      "Some things cannot be rushed. What is growing in you right now?",
    returnSparkPrompt:
      "Good to see you in the Greenhouse. A few things are still becoming here.",
    suggestedPrompts: [
      "A habit I'm nurturing",
      "A skill taking root",
      "A relationship I'm tending",
      "An idea not ready to launch",
    ],
    followUpQuestions: [
      "Does this need protection or sunlight right now?",
      "What would nurturing look like — not forcing?",
      "How has it changed since you last visited?",
    ],
    collectionTitle: "Still becoming",
    collectionEmptyMessage:
      "The benches are open. Tender growth may wait here — no deadline required.",
    capture: {
      primaryFieldId: "body",
      composeTitle: "Something taking root",
      fields: [
        {
          id: "body",
          label: "What is growing?",
          placeholder:
            "A habit, skill, relationship, idea, or part of you still becoming.",
          required: true,
          rows: 8,
          kind: "textarea",
          primary: true,
        },
        {
          id: "category",
          label: "Kind of growth",
          kind: "select",
          options: GREENHOUSE_CATEGORIES,
          required: true,
        },
        {
          id: "nurture",
          label: "What would nurturing look like?",
          placeholder: "Protection, sunlight, patience — not pressure.",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "progress",
          label: "Season (optional)",
          placeholder: "Early roots, midsummer, quietly taking shape",
          kind: "text",
        },
      ],
      saveLabel: "Place here gently",
      updateLabel: "Refine growth",
      savedMessage:
        "Placed here gently — it can keep growing as long as it needs.",
      updatedMessage: "Your growth has been updated.",
      suggestedPromptsLabel: "A tender start",
      followUpSectionLabel: "As the season shifts",
    },
    browse: browse({
      searchPlaceholder: "Search what is growing…",
      enableCategoryFilter: true,
      categoryLabel: "Kind of growth",
      loadMoreLabel: "More still becoming",
      resultsLabel: "Growing here",
    }),
    display: {
      style: "seedling",
      card: {
        showMeta: false,
        showTitle: false,
        showIcon: false,
        showBadge: false,
        showExtraFields: true,
        showProgress: false,
        bodyEmphasis: "quote",
        layout: "stack",
        editLabel: "Refine growth",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 5,
      },
      removeLabel: "Let go",
    },
    sparkSuggestionLines: [
      "This sounds like something still growing — would you like to place it in the Growth Greenhouse?",
      "I notice something taking root. Your Greenhouse might be the right place for it.",
    ],
  },
  "evidence-vault": {
    id: "evidence-vault",
    placeId: "evidence-vault",
    section: "evidence-bank" as AppSection,
    roomName: "Evidence Vault",
    kicker: "Proof you can solve hard things",
    description:
      "Private proof for the days confidence needs reminding — situations you faced and strength you showed.",
    backgroundImage: EVIDENCE_VAULT_ROOM_BG,
    imagePlaceId: "evidence-vault",
    openingSparkPrompt:
      "You have handled hard things before. What difficult moment deserves proof in the Vault?",
    returnSparkPrompt:
      "Welcome back to the Vault. Your proof is here whenever confidence needs reminding.",
    suggestedPrompts: [
      "A problem I solved or prevented",
      "A hard conversation I navigated",
      "Proof I kept going when it was difficult",
    ],
    followUpQuestions: [
      "What does this prove about you?",
      "Who benefited — including future-you?",
      "Would this help on a harder day?",
    ],
    collectionTitle: "Records at rest",
    collectionEmptyMessage:
      "The vault is ready. Your strength does not have to live only in memory.",
    capture: {
      primaryFieldId: "situation",
      composeTitle: "Preserve evidence",
      fields: [
        {
          id: "category",
          label: "Kind of evidence",
          kind: "select",
          options: EVIDENCE_CATEGORIES,
          required: true,
        },
        {
          id: "situation",
          label: "Situation",
          placeholder: "What was happening?",
          required: true,
          rows: 3,
          kind: "textarea",
        },
        {
          id: "problem",
          label: "Problem",
          placeholder: "What was difficult or at risk?",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "whatIDid",
          label: "What I did",
          placeholder: "The action you took.",
          required: true,
          rows: 4,
          kind: "textarea",
          primary: true,
        },
        {
          id: "whyApproach",
          label: "Why I chose that approach",
          placeholder: "Your reasoning — even if it was instinct.",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "outcome",
          label: "Outcome",
          placeholder: "What changed?",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "whoBenefited",
          label: "Who benefited",
          placeholder: "Clients, family, team, future-you…",
          rows: 2,
          kind: "textarea",
        },
        {
          id: "whyItMattered",
          label: "Why it mattered",
          rows: 2,
          kind: "textarea",
        },
        {
          id: "lessonsLearned",
          label: "Lessons learned",
          placeholder: "What this proves about you.",
          rows: 3,
          kind: "textarea",
        },
      ],
      saveLabel: "Preserve in vault",
      updateLabel: "Open record",
      savedMessage: "This story now lives safely in your Vault.",
      updatedMessage: "Your record has been updated.",
      suggestedPromptsLabel: "Proof easily overlooked",
      followUpSectionLabel: "On a harder day",
      enableAttachments: true,
      attachmentLabel: "Screenshots or proof (optional)",
    },
    browse: browse({
      searchPlaceholder: "Search your vault…",
      enableCategoryFilter: true,
      categoryLabel: "Kind of evidence",
      loadMoreLabel: "More records at rest",
      resultsLabel: "In the vault",
    }),
    display: {
      style: "vault",
      card: {
        showMeta: true,
        showTitle: false,
        showIcon: false,
        showBadge: false,
        showExtraFields: true,
        showProgress: false,
        bodyEmphasis: "prose",
        layout: "stack",
        editLabel: "Open record",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 4,
      },
      removeLabel: "Remove from vault",
    },
    sparkSuggestionLines: [
      "This sounds like a wonderful addition to your Evidence Vault — may I help you preserve it?",
      "You handled something real there. Would you like proof of that in your vault?",
    ],
  },
  "achievement-library": {
    id: "achievement-library",
    placeId: "library",
    section: "growth-library" as AppSection,
    roomName: "Achievement Library",
    kicker: "The Estate Library",
    description:
      "Your life's work on elegant shelves — books, courses, businesses, and milestones preserved with dignity.",
    backgroundImage: STORY_LIBRARY_ROOM_BG,
    imagePlaceId: "library",
    openingSparkPrompt:
      "This is where your life's work gets a shelf. What have you created that deserves to stay?",
    returnSparkPrompt:
      "It is good to be back in the Achievement Library. Your shelf has grown since you were last here.",
    suggestedPrompts: [
      "Something I published or launched",
      "An award or certification",
      "A body of work I'm proud of",
    ],
    followUpQuestions: [
      "What thread connects this to who you're becoming?",
      "What would future-you want to remember?",
      "Who shared this journey with you?",
    ],
    collectionTitle: "Volumes on the shelf",
    collectionEmptyMessage:
      "The shelves hold stillness and room. Your life's work may rest here, one volume at a time.",
    capture: {
      primaryFieldId: "body",
      composeTitle: "A place on the shelf",
      fields: [
        {
          id: "achievementType",
          label: "Kind of work",
          kind: "select",
          options: ACHIEVEMENT_TYPES,
          required: true,
        },
        {
          id: "title",
          label: "Title on the spine",
          placeholder: "Name what you created or achieved.",
          required: true,
          kind: "text",
        },
        {
          id: "body",
          label: "The story behind it",
          placeholder: "Why it matters — the season, the courage, the work.",
          required: true,
          rows: 8,
          kind: "textarea",
          primary: true,
        },
        {
          id: "year",
          label: "Year (optional)",
          placeholder: "e.g. 2024",
          kind: "text",
        },
      ],
      saveLabel: "Rest on the shelf",
      updateLabel: "Update volume",
      savedMessage: "Another volume now rests on your shelf.",
      updatedMessage: "Your volume has been updated.",
      suggestedPromptsLabel: "Worth keeping",
      followUpSectionLabel: "For future-you",
      enableAttachments: true,
      attachmentLabel: "Cover image or file (optional)",
    },
    browse: browse({
      searchPlaceholder: "Search the shelves…",
      enableFavorites: true,
      enableCategoryFilter: true,
      categoryLabel: "Kind of work",
      loadMoreLabel: "More volumes on the shelf",
      resultsLabel: "On the shelf",
    }),
    display: {
      style: "shelf",
      card: {
        showMeta: true,
        showTitle: true,
        showIcon: false,
        showBadge: false,
        showExtraFields: false,
        showProgress: false,
        bodyEmphasis: "prose",
        layout: "shelf",
        editLabel: "Open volume",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 2,
      },
      removeLabel: "Remove from shelf",
    },
    sparkSuggestionLines: [
      "This belongs in your Achievement Library — would you like help placing it on the shelf?",
      "You've created something worth preserving. Shall we add it to your library?",
    ],
  },
  "celebration-garden": {
    id: "celebration-garden",
    placeId: "gardens",
    section: "wins-this-week" as AppSection,
    roomName: "Celebration Garden",
    kicker: "Celebrations in bloom",
    description:
      "Celebrate progress — large, small, and everything in between. Hopeful, elegant, never childish.",
    backgroundImage: CELEBRATION_GARDEN_ROOM_BG,
    imagePlaceId: "gardens",
    openingSparkPrompt:
      "Celebrations of every size belong here. What went well lately?",
    returnSparkPrompt:
      "It is lovely to see you in the Celebration Garden. Your garden has grown since your last visit.",
    suggestedPrompts: [
      "A celebration I keep minimizing",
      "Something unexpectedly good",
      "A small courage worth naming",
    ],
    followUpQuestions: [
      "What made this possible?",
      "Should we save proof in the Evidence Vault too?",
      "Who helped you get here?",
    ],
    collectionTitle: "In bloom",
    collectionEmptyMessage:
      "Your garden is peaceful. When something goes well, it can bloom here.",
    capture: {
      primaryFieldId: "body",
      composeTitle: "Plant a celebration",
      fields: [
        {
          id: "body",
          label: "What are we celebrating?",
          placeholder: "A moment worth remembering — any size.",
          required: true,
          rows: 5,
          kind: "textarea",
          primary: true,
        },
        {
          id: "whyItMatters",
          label: "Why it matters",
          placeholder: "The meaning beneath the moment.",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "gratitude",
          label: "Who or what helped?",
          placeholder: "Optional — someone, a habit, or quiet strength.",
          rows: 2,
          kind: "textarea",
        },
        {
          id: "winDate",
          label: "Date (optional)",
          kind: "date",
        },
      ],
      saveLabel: "Plant in garden",
      updateLabel: "Refine bloom",
      savedMessage: "Your celebration has been planted.",
      updatedMessage: "Your bloom has been updated.",
      suggestedPromptsLabel: "Celebrations worth naming",
      followUpSectionLabel: "Before we move on",
      enableAttachments: true,
      attachmentLabel: "A photo from the moment (optional)",
    },
    browse: browse({
      searchPlaceholder: "Search your garden…",
      enableFavorites: true,
      loadMoreLabel: "More in bloom",
      resultsLabel: "In bloom",
    }),
    display: {
      style: "bloom",
      card: {
        showMeta: true,
        showTitle: false,
        showIcon: true,
        showBadge: false,
        showExtraFields: true,
        showProgress: false,
        bodyEmphasis: "quote",
        layout: "bloom",
        editLabel: "Refine bloom",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 4,
      },
      removeLabel: "Clear from garden",
    },
    sparkSuggestionLines: [
      "I noticed something today that might belong in your Celebration Garden — would you like to plant it there?",
      "That is worth celebrating in the garden. May I help you plant it there?",
    ],
  },
  "celebration-hall": {
    id: "celebration-hall",
    placeId: "celebration-room",
    section: "growth-reports" as AppSection,
    roomName: "Celebration Hall",
    kicker: "Honored chapters",
    description:
      "Major life moments — rare, grand, almost museum quality. Book published. Business launched. Wedding. Graduation.",
    backgroundImage: CELEBRATION_HALL_ROOM_BG,
    imagePlaceId: "celebration-room",
    openingSparkPrompt:
      "Some chapters are rare enough to honor. What moment in your life deserves that?",
    returnSparkPrompt:
      "Welcome back to the Celebration Hall. Your honored chapters are here — take your time.",
    suggestedPrompts: [
      "A season I'm proud I survived",
      "A turning point I want to name",
      "A milestone I'll tell for years",
    ],
    followUpQuestions: [
      "Who shared this journey with you?",
      "What do you want to carry into the next chapter?",
      "What title would future-you give this moment?",
    ],
    collectionTitle: "Honored chapters",
    collectionEmptyMessage:
      "The hall is open. Major chapters can rest here with dignity.",
    capture: {
      primaryFieldId: "body",
      composeTitle: "Honor a chapter",
      fields: [
        {
          id: "chapterTitle",
          label: "Chapter title",
          placeholder: "Name this season or turning point.",
          required: true,
          kind: "text",
        },
        {
          id: "milestoneDate",
          label: "Milestone date",
          kind: "date",
        },
        {
          id: "body",
          label: "What belongs in this chapter?",
          placeholder: "The story you want honored here.",
          required: true,
          rows: 7,
          kind: "textarea",
          primary: true,
        },
      ],
      saveLabel: "Honor chapter",
      updateLabel: "Refine chapter",
      savedMessage: "This chapter is honored in the Hall.",
      updatedMessage: "Your chapter has been updated.",
      suggestedPromptsLabel: "Chapters worth naming",
      followUpSectionLabel: "Carrying forward",
    },
    browse: browse({
      searchPlaceholder: "Search honored chapters…",
      pageSize: 12,
      loadMoreLabel: "View more chapters",
      resultsLabel: "Honored here",
    }),
    display: {
      style: "chapter",
      card: {
        showMeta: true,
        showTitle: true,
        showIcon: false,
        showBadge: false,
        showExtraFields: true,
        showProgress: false,
        bodyEmphasis: "chapter",
        layout: "museum",
        editLabel: "Refine chapter",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 5,
      },
      removeLabel: "Remove chapter",
    },
    sparkSuggestionLines: [
      "This feels like a Celebration Hall moment — a chapter worth honoring. Shall we?",
      "Some moments are rare enough for the Hall. Would you like to preserve this one?",
    ],
  },
} as const satisfies Record<
  EstateCollectionRoomId,
  Omit<EstateCollectionRoomDefinition, "adapter">
>;

export function listEstateCollectionRoomIds(): EstateCollectionRoomId[] {
  return Object.keys(ROOM_CONFIGS) as EstateCollectionRoomId[];
}

export function getEstateCollectionRoom(
  roomId: EstateCollectionRoomId,
): EstateCollectionRoomDefinition {
  const config = ROOM_CONFIGS[roomId];
  return {
    ...config,
    adapter: getEstateCollectionAdapter(roomId),
  };
}

export function getEstateCollectionRoomByPlaceId(
  placeId: string,
): EstateCollectionRoomDefinition | undefined {
  const match = listEstateCollectionRoomIds().find(
    (id) => ROOM_CONFIGS[id].placeId === placeId,
  );
  return match ? getEstateCollectionRoom(match) : undefined;
}

export function getEstateCollectionRoomBySection(
  section: string,
): EstateCollectionRoomDefinition | undefined {
  const match = listEstateCollectionRoomIds().find(
    (id) => ROOM_CONFIGS[id].section === section,
  );
  return match ? getEstateCollectionRoom(match) : undefined;
}

export function openEstateCollectionRoomSection(
  roomId: EstateCollectionRoomId,
): AppSection {
  return ROOM_CONFIGS[roomId].section;
}

/** @deprecated internal — configs reference estate plates */
export const _ESTATE_COLLECTION_ROOM_BG = ESTATE_ROOM_BG;
