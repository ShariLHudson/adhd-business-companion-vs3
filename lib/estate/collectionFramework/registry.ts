/**
 * Spark Estate Collection Framework — room registry.
 *
 * Add a room = one config object here. Do not build a new app.
 *
 * Room meaning & routing: Estate Collections Playbook
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
import { CELEBRATION_GARDEN_CATEGORIES } from "@/lib/estate/celebrationGardenIntelligence";
import {
  EVIDENCE_VAULT_CEREMONIAL_SAVE,
  EVIDENCE_VAULT_DISCOVERY_PROMPT,
} from "@/lib/estate/evidenceVaultExperience";
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

/** Evidence Vault categories (246/248) — proof for hard days. */
const EVIDENCE_CATEGORIES = [
  { value: "Small Win", label: "Small win" },
  { value: "Testimonial", label: "Testimonial" },
  { value: "Encouraging Message", label: "Encouraging message" },
  { value: "Thank-You Note", label: "Thank-you note" },
  { value: "Gratitude", label: "Gratitude" },
  { value: "Progress", label: "Progress" },
  { value: "Problem Solving", label: "Problem solving" },
  { value: "Lives Impacted", label: "Lives impacted" },
  { value: "Client Result", label: "Client result" },
  { value: "Client Impact", label: "Client impact" },
  { value: "Personal Proof", label: "Personal proof" },
  { value: "Before/After", label: "Before/after" },
  { value: "Journal Evidence", label: "Journal evidence" },
  { value: "Business Growth", label: "Business growth" },
  { value: "Personal Growth", label: "Personal growth" },
  { value: "Health", label: "Health" },
  { value: "Courage", label: "Courage" },
  { value: "Prevented Problem", label: "Prevented problem" },
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
    kicker: "Your personal intelligence library",
    description:
      "Preserve meaningful experiences so Spark can gradually transform them into understanding, patterns, and wisdom.",
    backgroundImage: EVIDENCE_VAULT_ROOM_BG,
    imagePlaceId: "evidence-vault",
    openingSparkPrompt:
      "Every discovery you preserve becomes another piece of evidence. Over time, Spark connects experiences, notices patterns, and helps you rediscover the wisdom you've already earned.",
    returnSparkPrompt:
      "Welcome back. Your vault is growing — each piece of evidence helps Spark understand your story a little more clearly.",
    suggestedPrompts: [
      "What surprised you today?",
      "What lesson almost slipped by unnoticed?",
      "What would future you want to rediscover?",
    ],
    followUpQuestions: [],
    collectionTitle: "Discoveries at rest",
    collectionEmptyMessage:
      "The vault is ready. Your wisdom does not have to live only in memory.",
    capture: {
      primaryFieldId: "situation",
      composeTitle: "Today's Discovery",
      discoveryPreserveMode: true,
      fields: [
        {
          id: "situation",
          label: "Today's Discovery",
          placeholder: "Begin writing…",
          required: true,
          rows: 12,
          kind: "textarea",
          primary: true,
        },
        {
          id: "problem",
          label: "Problem Solved",
          placeholder: "What was the challenge — and how did you meet it?",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "whoBenefited",
          label: "People Helped",
          placeholder: "Who felt the difference?",
          rows: 2,
          kind: "textarea",
        },
        {
          id: "whyApproach",
          label: "What Improved",
          placeholder: "What is better now?",
          rows: 2,
          kind: "textarea",
        },
        {
          id: "whatIDid",
          label: "Progress Made",
          placeholder: "What moved forward?",
          rows: 2,
          kind: "textarea",
        },
        {
          id: "lessonsLearned",
          label: "Lesson Learned",
          placeholder: "What did this teach you?",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "whyItMattered",
          label: "Why It Matters",
          placeholder: "Why will you want to remember this?",
          rows: 3,
          kind: "textarea",
        },
        {
          id: "category",
          label: "Kind of evidence",
          kind: "select",
          options: EVIDENCE_CATEGORIES,
        },
        {
          id: "noteOrLink",
          label: "Supporting Evidence",
          placeholder: "Link, reference, or short note…",
          kind: "text",
        },
      ],
      saveLabel: "Preserve Today's Discovery",
      updateLabel: "Refine discovery",
      savedMessage: EVIDENCE_VAULT_CEREMONIAL_SAVE,
      updatedMessage: "Your discovery has been refined.",
      suggestedPromptsLabel: "Gentle starters",
      followUpSectionLabel: "",
      enableAttachments: true,
      attachmentLabel: "Attach something (optional)",
    },
    browse: browse({
      searchPlaceholder: "What would you like to rediscover?",
      enableCategoryFilter: true,
      categoryLabel: "Topic",
      enableSourceFilter: true,
      sourceLabel: "Source",
      enableEmotionFilter: true,
      emotionLabel: "Emotion",
      enableProjectFilter: true,
      projectLabel: "Project",
      enablePersonFilter: true,
      personLabel: "Person",
      enableConfidenceBoostFilter: true,
      enableRecentFilter: true,
      enableDatePresets: true,
      enableHallCandidateFilter: true,
      loadMoreLabel: "More evidence at rest",
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
        editLabel: "Refine discovery",
        favoriteLabel: CARD_FAVORITE,
        previewLines: 4,
      },
      removeLabel: "Remove from vault",
    },
    sparkSuggestionLines: [
      "Would you like to preserve this discovery in your Evidence Vault?",
      "This sounds like wisdom worth keeping — shall we preserve it in the Evidence Vault?",
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
    kicker: "Moments, not milestones",
    description:
      "A peaceful place to recognize progress — finished weeks, habits kept, help given, breakthroughs. Reflective, not an awards ceremony.",
    backgroundImage: CELEBRATION_GARDEN_ROOM_BG,
    imagePlaceId: "gardens",
    openingSparkPrompt:
      "This garden is for moments of progress. What went well lately — even something small?",
    returnSparkPrompt:
      "Welcome back to the Celebration Garden. Peaceful, beautiful, and ready for whatever is worth naming.",
    suggestedPrompts: [
      "Finished a difficult week",
      "Maintained a new habit",
      "Helped someone / a personal breakthrough",
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
          id: "category",
          label: "Kind of moment",
          kind: "select",
          options: CELEBRATION_GARDEN_CATEGORIES,
        },
        {
          id: "body",
          label: "What are we celebrating?",
          placeholder: "A moment of progress — not a museum milestone.",
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
      suggestedPromptsLabel: "Moments worth naming",
      followUpSectionLabel: "Before we move on",
      enableAttachments: true,
      attachmentLabel: "A photo from the moment (optional)",
    },
    browse: browse({
      searchPlaceholder: "Search your garden…",
      enableFavorites: true,
      enableCategoryFilter: true,
      categoryLabel: "Moment",
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
      "Would you like to visit the Celebration Garden to mark this progress?",
      "That sounds like a moment worth planting — not a Hall milestone. Shall we celebrate it in the garden?",
    ],
  },
  "celebration-hall": {
    id: "celebration-hall",
    placeId: "celebration-room",
    section: "growth-reports" as AppSection,
    roomName: "Celebration Room",
    kicker: "Honored chapters",
    description:
      "Major life moments — rare, grand, almost museum quality. Book published. Business launched. Wedding. Graduation.",
    backgroundImage: CELEBRATION_HALL_ROOM_BG,
    imagePlaceId: "celebration-room",
    openingSparkPrompt:
      "Some chapters are rare enough to honor. What moment in your life deserves that?",
    returnSparkPrompt:
      "Welcome back to the Celebration Room. Your honored chapters are here — take your time.",
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
      "This feels like a Celebration Room moment — a chapter worth honoring. Shall we?",
      "Some moments are rare enough for the Celebration Room. Would you like to preserve this one?",
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
