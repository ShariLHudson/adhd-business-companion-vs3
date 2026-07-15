/**
 * Journal Gazebo — hospitality copy.
 *
 * Spark Estate is designed to make people feel cared for.
 * Warmth over cleverness. Hospitality over efficiency.
 */

export const JOURNAL_RETURN_GREETINGS = [
  "I'm really glad you're here.",
  "It's nice to see you again.",
  "Your page is here whenever you're ready.",
] as const;

export const JOURNAL_ENVELOPE_HINT =
  "A note rests on the desk — open it when you wish.";

export const JOURNAL_DESK_OPEN_LETTER = "Open the note";

export const JOURNAL_DESK_OPEN_JOURNAL = "Open your journal";

export const JOURNAL_WELCOME_NOTE_TITLE = "Welcome to your Journal Gazebo";

export const JOURNAL_WELCOME_NOTE_PARAGRAPHS = [
  "A quiet place to capture thoughts, ideas, memories, and moments that matter.",
] as const;

export const JOURNAL_WELCOME_NOTE_CLOSING =
  "When you're ready, create a journal that feels like yours.";

export const JOURNAL_WELCOME_NOTE_SIGN = "— Shari";

/** @deprecated Use note card copy */
export const JOURNAL_WELCOME_LETTER_TITLE = JOURNAL_WELCOME_NOTE_TITLE;

/** @deprecated Use note card copy */
export const JOURNAL_WELCOME_LETTER_PARAGRAPHS = JOURNAL_WELCOME_NOTE_PARAGRAPHS;

/** @deprecated Use note card copy */
export const JOURNAL_WELCOME_LETTER_SIGN = JOURNAL_WELCOME_NOTE_SIGN;

export const JOURNAL_ENVELOPE_ADDRESS = "For You";

export const JOURNAL_CREATE_INVITE = "Let's Create Your Journal";

/** Table sanctuary — create a new journal. */
export const JOURNAL_TABLE_CREATE = {
  title: "Create New Journal",
  subtitle: "Begin a journal that's uniquely yours.",
} as const;

/** Table sanctuary — write in an existing journal. */
export const JOURNAL_TABLE_WRITE = {
  title: "Write",
  subtitle: "Continue where you left off.",
} as const;

/** @deprecated Prefer JOURNAL_TABLE_WRITE */
export const JOURNAL_TABLE_OPEN = JOURNAL_TABLE_WRITE;

/** @deprecated Use JOURNAL_TABLE_CREATE */
export const JOURNAL_WELCOME_CREATE_FIRST = JOURNAL_TABLE_CREATE;

/** @deprecated Use JOURNAL_TABLE_WRITE */
export const JOURNAL_WELCOME_OPEN_TODAY = JOURNAL_TABLE_WRITE;

export const JOURNAL_LIBRARY_SHELF_LABEL = "My special journals";

export const JOURNAL_DONE_LABEL = "Done";

export const JOURNAL_DONE_HINT = "Return to the gazebo and rest your journal on the shelf.";

export const JOURNAL_PICKER_TITLE = "Choose a journal:";

export const JOURNAL_PICKER_SUBTITLE = "Pick up where you left off.";

export const JOURNAL_DESIGN_COVER_PROMPT =
  "Create the cover that feels most like you.";

export const JOURNAL_DESIGN_NAME_PROMPT =
  "What would you like to name your journal?";

export const JOURNAL_DESIGN_INTENTION_PROMPT = "What is this journal for?";

export const JOURNAL_DESIGN_PAGE_IMAGES_PROMPT =
  "Would you like gentle images on the pages?";

export const JOURNAL_DESIGN_PAPER_PROMPT =
  "Choose the paper beneath your words.";

export const JOURNAL_DESIGN_FONT_PROMPT = "Choose how your words will look.";

export const JOURNAL_DESIGN_HANDWRITING_PROMPT =
  "Upload a sample of your handwriting — a photo of a few lines on plain paper works beautifully.";

export const JOURNAL_DESIGN_PEN_PROMPT = "Choose what you'll write with.";

export const JOURNAL_DESIGN_INK_PROMPT = "Choose your ink.";

export const JOURNAL_DESIGN_CRAFTING_MESSAGE =
  "We are building your journal with care.\nIt will be ready for you in just a moment.";

/** @deprecated Use fountain pen affordance */
export const JOURNAL_BEGIN_PREPARING = "Begin Preparing My Journal";

export const JOURNAL_WORKSHOP_COVER_SPARK =
  "Choose the leather that feels most like you.";

export const JOURNAL_WORKSHOP_TITLE_SPARK = "Every journal deserves a name.";

/** @deprecated Conversational copy only — no step labels */
export const JOURNAL_WORKSHOP_STEP_COVER = JOURNAL_WORKSHOP_COVER_SPARK;

/** @deprecated */
export const JOURNAL_WORKSHOP_STEP_TITLE = JOURNAL_WORKSHOP_TITLE_SPARK;

export const JOURNAL_WORKSHOP_STEP_BOOKMARK =
  "A small ribbon — burgundy, forest, navy, or gold.";

export const JOURNAL_WORKSHOP_TITLE_TYPE_OWN = "Type your title on the cover.";

export const JOURNAL_TITLE_SUGGESTIONS_CYCLE = [
  "My Journey",
  "Becoming",
  "Quiet Thoughts",
  "My Legacy",
] as const;

export const JOURNAL_WORKSHOP_DEDICATION_SPARK =
  "Would you like to dedicate your journal to yourself?";

export const JOURNAL_WORKSHOP_DEDICATION_YES = "Yes";

export const JOURNAL_WORKSHOP_DEDICATION_LATER = "Maybe Later";

export const JOURNAL_HANDCRAFT_MESSAGE = "Preparing your journal…";

export const JOURNAL_CEREMONY_TITLE_SPARK = JOURNAL_WORKSHOP_TITLE_SPARK;

export const JOURNAL_CEREMONY_TITLE_QUESTION =
  "What would you like to call your journal?";

export const JOURNAL_CEREMONY_BELONGS_SPARK = "Who does this journal belong to?";

export const JOURNAL_CEREMONY_DEDICATION_SPARK =
  "Would you like to dedicate this journal to yourself?";

export const JOURNAL_COVER_ESTATE_MARK = "Spark Estate";

export const JOURNAL_COVER_ESTATE_MARK_LINES = ["SPARK", "ESTATE"] as const;

export const JOURNAL_WORKSHOP_PAPER_SPARK = "Choose the paper beneath your words.";

export const JOURNAL_WORKSHOP_PEN_SPARK = "Choose what you'll write with.";

export const JOURNAL_WORKSHOP_BOOKMARK_SPARK =
  "One small detail — a way to find your place again.";

export const JOURNAL_WORKSHOP_CONTINUE = "Continue";

export const JOURNAL_WORKSHOP_PAPER_NEXT = "Next paper";

export const JOURNAL_WORKSHOP_BOOKMARK_NEXT = "Another";

export const JOURNAL_NAMEPLATE_LABEL = "This Journal Belongs To";

export const JOURNAL_CREATION_NAME_PROMPT = "This Journal Belongs To";

export const JOURNAL_CREATION_DEDICATION_HEADING = "A Letter To My Future Self";

export const JOURNAL_CREATION_DEDICATION_INVITE =
  "Would you like to write something to the person you'll become?";

export const JOURNAL_CREATION_DEDICATION_BEGIN = "I'll write something";

export const JOURNAL_CREATION_DEDICATION_LATER = "Not right now";

export const JOURNAL_CREATION_DEDICATION_PROMPT =
  "Would you like to write a dedication to yourself that you'll always see when you open your journal?";

export const JOURNAL_CREATION_DEDICATION_SKIP = "Skip for now";

export const JOURNAL_CREATION_DEDICATION_CONTINUE = "Save dedication";

export const JOURNAL_CREATION_TURN_PAGE = "Turn the page";

export const JOURNAL_CREATION_BEGIN_WRITING = "Begin writing";

export const JOURNAL_FIRST_PAGE_PROMPT = "What is on your heart today?";

export const JOURNAL_CEREMONY_DEDICATION_TITLE = "This Journal Belongs To";

export const JOURNAL_CEREMONY_WELCOME_TITLE = "Welcome to the Journal Gazebo";

export const JOURNAL_CEREMONY_WELCOME_BODY =
  "This is your quiet place — for thoughts that matter, days that unfold, and words only you need to see.";

export const JOURNAL_CEREMONY_WELCOME_STORY = [
  "The Journal Gazebo was built for stillness — a place where the garden meets your thoughts, and nothing asks you to hurry.",
  "For generations on this estate, members have come here to mark what mattered: a decision made, a season survived, a quiet joy worth remembering.",
  "These pages are yours alone. Write what is true. Return whenever you need the hush of the garden again.",
] as const;

export const JOURNAL_CEREMONY_WELCOME_SIGN = "— Shari";

export const JOURNAL_CEREMONY_WELCOME_PACE =
  "Stay as long as you like, or only a moment — the gazebo keeps your pace.";

export const JOURNAL_CEREMONY_DEDICATION_INVITE =
  "Would you like to leave a few words for your future self?";

export const JOURNAL_CEREMONY_DEDICATION_OPTIONAL =
  "Only if you'd like. You can always return to this later.";

export const JOURNAL_CEREMONY_READY_LEDE =
  "This journal is yours — for the days you want to remember and the thoughts you want to keep.";

export const JOURNAL_CEREMONY_TODAY_INTRO =
  "When you're ready, turn the page and begin.";

export const JOURNAL_CEREMONY_DEDICATION_PRESENTED =
  "Presented with love by Spark Estate";

export const JOURNAL_CEREMONY_DEDICATION_WISH =
  "May these pages become part of the story only you can tell.";

export const JOURNAL_PLAQUE_CREATE = {
  title: "Begin Preparing My Journal",
  subtitle: "A companion you'll return to for years.",
} as const;

export const JOURNAL_PLAQUE_TODAY = {
  title: "Open My Journal",
  subtitle: "Return to today's page.",
} as const;

export const JOURNAL_PAGE_SAVED = "I've kept this safe for you.";

export const JOURNAL_PAGE_PLACEHOLDER = "";

/** Gentle cue when a journal has used all writing pages. */
export const JOURNAL_FULL_SPARK =
  "This journal is full — two hundred pages of your story. Create a new journal when you're ready to keep writing.";

export const JOURNAL_OPEN_TODAY_SPARK = "Perfect.\nYour page is waiting.";

export const JOURNAL_READY_SPARK = "Your journal is ready whenever you are.";

export const JOURNAL_ON_DESK_SPARK = "Your journal is on the desk.";

export const JOURNAL_OPEN_INVITE = "Open your journal when you're ready.";

export const JOURNAL_CREATION_INTRO =
  "Let's make something that's truly yours — one gentle choice at a time.";

export const JOURNAL_WRITING_DESK_ARRIVAL =
  "Your journal is waiting on the desk.";

export const JOURNAL_CREATION_SPARK: Record<string, string> = {
  name: "What would you like to call your journal?",
  "cover-leather": "Let's begin with the leather for your cover.",
  "cover-embossing": "How shall we emboss your journal's name?",
  "cover-art": "Would you like something on the cover?",
  paper: "Every writer has a favorite page.",
  "writing-style": "How would you like your words to appear?",
  pen: "And what shall we write with?",
  ink: "Choose the ink that feels like you.",
  "gift-preparing":
    "Thank you.\nI'd like just a moment to prepare something especially for you.",
  "gift-wrapped": "Whenever you're ready…",
};

export const JOURNAL_DESK_INTRO =
  "Your Writing Desk — adjust anything, whenever you like.";

/** Gentle openers instead of “Step 1 of 5”. */
export const JOURNAL_CREATION_STEP_OPENERS: readonly string[] = [
  "First, a name for your journal",
  "Next, the paper beneath your words",
  "How your writing will look on the page",
  "The cover — classic leather, made yours",
  "One last thing — how quietly I'll sit with you",
];

export const JOURNAL_CREATION_STEP_HINTS: Record<
  "name" | "paper" | "writing-hand" | "cover" | "presence",
  string
> = {
  name: "Your story deserves a place that feels like home. You can always rename it later.",
  paper: "Subtle differences only — each one elegant, each one yours.",
  "writing-hand": "The way your words appear matters. Choose what feels most like you.",
  cover: "A leather journal prepared for a life worth remembering.",
  presence: "Some people prefer silence. Others like a gentle question now and then. You decide.",
};

export const JOURNAL_CREATION_STEP_TITLES: Record<
  "name" | "paper" | "writing-hand" | "cover" | "presence",
  string
> = {
  name: "What would you like to call it?",
  paper: "Choose your paper",
  "writing-hand": "Your writing hand",
  cover: "The cover",
  presence: "My presence while you write",
};

export const JOURNAL_TOOLS = {
  writingDesk: "Writing Desk",
  speak: "Write by voice",
  listening: "I'm listening…",
  writingStyle: "Writing Style",
  pageSettings: "Page Settings",
  hideClock: "Hide Clock",
  showClock: "Show Clock",
  chooseAnother: "Choose Another Journal",
  returnGazebo: "Return to Gazebo",
  closeJournal: "Close Journal",
  hideTime: "Hide the hour",
  showTime: "Show the hour",
  printPage: "Print this page",
  returnToPage: "Return to your page",
  stepBackIntoGazebo: "Step back into the Gazebo",
  turnPage: "Turn the page",
  beginWriting: "Your page is waiting",
  continue: "When you're ready",
  backToWelcome: "Back to the welcome note",
  back: "Go back",
} as const;

