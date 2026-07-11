/**
 * Per-room welcome and empty-state copy — Estate Room Template layer 2 & 5.
 */

import type {
  EstateRoomTemplateEmptyState,
  EstateRoomTemplateHero,
  EstateRoomTemplateWelcome,
} from "./types";

/** Overrides registry hero fields when room copy is more specific than registry. */
export const ESTATE_ROOM_HERO_COPY: Partial<
  Record<string, Partial<EstateRoomTemplateHero>>
> = {
  greenhouse: {
    subtitle: "Every thriving business began as a tiny seed of an idea.",
    purpose: "This is where possibilities begin.",
  },
};

export const ESTATE_ROOM_WELCOME_COPY: Record<string, EstateRoomTemplateWelcome> =
  {
    "evidence-vault": {
      shariLine:
        "Welcome back to your Evidence Vault.",
      shariParagraphs: [
        "Every experience has something to teach us.",
        "What discovery would you like to preserve today?",
      ],
    },
    journal: {
      shariLine:
        "This is a quiet place for your thoughts. We can write together, or we can simply sit with what's on your mind.",
    },
    portfolio: {
      shariLine:
        "Everything you've made lives here — not to impress anyone, but so you can see how far you've come.",
    },
    "growth-profile": {
      shariLine:
        "Growth isn't always loud. This room holds the quieter proof of who you're becoming.",
    },
    "institute-cabinet": {
      shariLine:
        "What you've saved from the Institute is filed here — ready whenever you want to pick it back up.",
    },
    "seeds-planted": {
      shariLine:
        "Every idea starts small. These are the seeds you're tending — some will grow into something beautiful.",
    },
    "apple-orchard": {
      shariLine:
        "Let's slow down for a moment. Growth happens one season at a time.",
    },
    conservatory: {
      shariLine:
        "We can simply enjoy the space, or if you'd like, I can help you with one of these.",
    },
    "coffee-house": {
      shariLine: "Pull up a chair — what's worth talking through?",
    },
    "music-room": {
      shariLine: "What kind of sound would help you think?",
    },
    gardens: {
      shariLine:
        "Things grow here at their own pace. There's no rush.",
    },
    greenhouse: {
      shariLine: "Welcome.",
      shariParagraphs: [
        "This is where possibilities begin.",
        "Some ideas become businesses. Some become books. Some become products. Some simply need more time.",
        "Nothing is rushed here.",
      ],
    },
    "peaceful-places": {
      shariLine: "What kind of calm would help most right now?",
    },
  };

export const ESTATE_ROOM_EMPTY_STATE_COPY: Record<
  string,
  EstateRoomTemplateEmptyState
> = {
  "evidence-vault": {
    headline: "This room is waiting for your first discovery.",
    detail:
      "When you're ready, preserve something meaningful — a win, kind words, or wisdom from your journey.",
  },
  journal: {
    headline: "This room is waiting to tell your story.",
    detail: "Your first entry can be one sentence. That's enough.",
  },
  portfolio: {
    headline: "This room is waiting to tell your story.",
    detail: "What you've built will have a home here when you're ready.",
  },
  "growth-profile": {
    headline: "This room is waiting to tell your story.",
    detail: "Your growth will gather here over time — quietly, honestly.",
  },
  "institute-cabinet": {
    headline: "This room is waiting to tell your story.",
    detail: "Saved lessons and cards will line these shelves when you file them.",
  },
  "seeds-planted": {
    headline: "This room is waiting to tell your story.",
    detail: "Plant an idea when one feels worth tending.",
  },
  greenhouse: {
    headline: "This room is waiting to tell your story.",
    detail:
      "A few seedlings are enough for now. Over time, this greenhouse will overflow with everything you've grown.",
  },
};

export const ESTATE_ROOM_TEMPLATE_DEFAULT_WELCOME: EstateRoomTemplateWelcome = {
  shariLine: "I'm glad you're here.",
};

export const ESTATE_ROOM_TEMPLATE_DEFAULT_EMPTY: EstateRoomTemplateEmptyState =
  {
    headline: "This room is waiting to tell your story.",
  };
