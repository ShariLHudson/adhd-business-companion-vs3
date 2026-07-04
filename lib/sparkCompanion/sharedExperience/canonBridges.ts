import type { SharedExperienceBridge } from "./types";
import { SHARED_EXPERIENCE_HUMILITY_LINE } from "./types";

/**
 * Founder-authored bridges only — never LLM-invented "I once…" stories.
 * Every bridge includes humility: one possibility, not shared identity.
 */
export const SHARED_EXPERIENCE_CANON_BRIDGES: readonly SharedExperienceBridge[] =
  [
    {
      id: "focus.drift",
      theme: "focus",
      triggers: [
        /\b(?:can'?t|cannot) stay focused\b/i,
        /\b(?:keep )?(?:losing|lose) focus\b/i,
        /\b(?:mind|attention) (?:keeps? )?drift/i,
        /\bhard to focus\b/i,
      ],
      relate:
        "Staying focused can be difficult for me too. When I notice my mind drifting, I've tried a few things that sometimes help.",
      humilityFrame: SHARED_EXPERIENCE_HUMILITY_LINE,
      helpfulOffers: [
        "clear everything out of my head first",
        "put on focus music",
        "work in short blocks of time",
      ],
      inviteQuestion: "Do any of those sound like they might help today?",
    },
    {
      id: "perfectionism.rewrite",
      theme: "perfectionism",
      triggers: [
        /\b(?:keep )?rewriting everything\b/i,
        /\b(?:can'?t|cannot) stop (?:editing|polishing|tweaking)\b/i,
        /\bperfect (?:first )?draft\b/i,
        /\bnever (?:feels? )?(?:good enough|done|finished)\b/i,
      ],
      relate:
        "I've done that more times than I can count. Sometimes I have to remind myself that a finished first draft is much easier to improve than a perfect one that never gets written.",
      humilityFrame:
        "What works for me might not be your rhythm — but if you'd like, we can see what a first draft could look like for you.",
      helpfulOffers: ["get a rough first draft down", "set a small done-for-now bar"],
      inviteQuestion: "Would you like help getting a first draft down?",
    },
    {
      id: "overwhelm.too_much",
      theme: "overwhelm",
      triggers: [
        /\b(?:so much|too much) to do\b/i,
        /\beverything (?:feels? )?(?:important|urgent)\b/i,
        /\b(?:keep )?getting overwhelmed\b/i,
        /\boverwhelm(?:ed|ing)?(?: trying to| building| running)?\b/i,
      ],
      relate:
        "I understand that feeling. When everything feels important, I usually start by getting everything out of my head so I can actually see it.",
      humilityFrame:
        "That approach has helped me — it may or may not fit you, but we can try it together if you'd like.",
      helpfulOffers: [
        "get every thought out of my head first",
        "see what actually deserves attention first",
      ],
      inviteQuestion:
        "Would you like to get everything out of your head first, or talk through what feels heaviest?",
    },
    {
      id: "research.confidence",
      theme: "research_confidence",
      triggers: [
        /\b(?:don'?t|do not) know enough about\b/i,
        /\bneed to (?:learn|research) everything\b/i,
        /\b(?:afraid|scared) (?:i'?m|i am) (?:missing|getting) something\b/i,
      ],
      relate:
        "I've found that one of the best ways to build confidence is to research just enough to take the next step rather than trying to learn everything first.",
      humilityFrame:
        "That's been true for me — your next step might look different, and we can figure that out together.",
      helpfulOffers: ["research just enough for the next step", "name one small question to answer first"],
      inviteQuestion: "Would you like to find the next small piece to learn together?",
    },
    {
      id: "creativity.stuck",
      theme: "creativity_stuck",
      triggers: [
        /\b(?:i'?m|i am) stuck\b/i,
        /\b(?:feel|feeling) stuck\b/i,
        /\b(?:can'?t|cannot) (?:think|create|write|start)\b/i,
        /\b(?:creative )?block\b/i,
      ],
      relate:
        "When I get stuck, changing my environment often helps me think differently — sometimes by the lake, sometimes sketching ideas visually, sometimes just talking them through.",
      humilityFrame: SHARED_EXPERIENCE_HUMILITY_LINE,
      helpfulOffers: [
        "change environment",
        "sketch ideas visually",
        "talk it through out loud",
      ],
      inviteQuestion: "Let's figure out what might help you — what feels closest right now?",
    },
    {
      id: "finishing.incomplete",
      theme: "finishing",
      triggers: [
        /\b(?:can'?t|cannot) seem to finish\b/i,
        /\b(?:never|don'?t) finish\b/i,
        /\bstart(?:s|ing)? (?:things|projects) but (?:never|don'?t) finish\b/i,
      ],
      relate:
        "I know that feeling well. One thing that's helped me is making the next step so small that it feels almost impossible not to begin.",
      humilityFrame:
        "It may or may not fit you — but if you'd like, we can find a tiny next step that feels doable for you.",
      helpfulOffers: ["make the next step tiny", "define done-for-now instead of perfect"],
      inviteQuestion:
        "Would you like us to figure out what that next tiny step could be?",
    },
    {
      id: "thoughts.scattered",
      theme: "scattered_thoughts",
      triggers: [
        /\b(?:thoughts|mind) (?:are |is )?everywhere\b/i,
        /\b(?:all over the place|scattered|jumbled)\b/i,
        /\b(?:too many )?thoughts (?:in my head|at once)\b/i,
      ],
      relate:
        "That happens to me too sometimes. Before I try to organize anything, I usually get every thought out of my head first.",
      humilityFrame:
        "Once they're in one place, it's easier for me to see what matters — we can see if that helps you too.",
      helpfulOffers: ["brain dump everything first", "sort after capture, not before"],
      inviteQuestion: "Would you like to get your thoughts out first?",
    },
  ] as const;
