import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";

export const CONSERVATORY_BG = CLEAR_MY_MIND_CONSERVATORY_BG;

export type ChatMessage = {
  id: string;
  role: "shari" | "member";
  text: string;
};

export const GREETING =
  "Good morning, Shari.\nI've been thinking about our conversation yesterday.";

export const WORKSHOP_QUESTION =
  "Yesterday we talked about your workshop.\nCan I ask you something?\n\nWho do you most want to walk away feeling relieved — and what would relief look like for them?";

export const MOCK_FIRST_ANSWER =
  "Honestly I'm not totally sure. I know it's ADHD entrepreneurs but I keep going back and forth on whether the promise is clarity or momentum or just not feeling alone.";

export const UNCERTAINTY_MESSAGE =
  "We could figure this out together.\n\nWould you like me to ask another question… show you examples… or research what people are saying?";

export const RESEARCH_FINDINGS = [
  {
    id: "1",
    title: "What they're saying",
    body: "Many ADHD entrepreneurs describe feeling \"behind\" even when they're working hard — the pain is scattered priorities, not laziness.",
  },
  {
    id: "2",
    title: "What they want",
    body: "Relief often sounds like: \"Tell me the one thing that matters this week\" — not another system to maintain.",
  },
  {
    id: "3",
    title: "Language that lands",
    body: "Phrases like \"one clear next move\" and \"without burning out\" appear repeatedly in how they talk about wanting help.",
  },
] as const;

export const POST_RESEARCH_MESSAGE =
  "That helps. Relief and one clear next move keep showing up — I think we're onto something real.";

export const SECOND_QUESTION =
  "If someone trusted you for ninety minutes, what would you want them to leave able to do that they can't do confidently today?";

export const MOCK_SECOND_ANSWER =
  "Choose their next best business move and leave with one action plan they can actually follow — without the shame spiral.";

export const DRAFT_OFFER =
  "I think we have enough to create a first draft.\n\nWould you like me to show you what I've been putting together?";

export const DRAFT_DOCUMENT = {
  title: "Workshop Offer — First Draft",
  sections: [
    {
      id: "for",
      label: "For",
      text: "ADHD entrepreneurs who feel overwhelmed trying to organize and grow their business.",
    },
    {
      id: "promise",
      label: "Promise",
      text: "A focused workshop that helps you choose your next best business move and leave with one clear action plan you can actually follow.",
      editable: true,
    },
    {
      id: "relief",
      label: "The relief",
      text: "Less scattered thinking. More calm momentum. No shame about being behind.",
    },
  ],
} as const;

export const EDIT_ACKNOWLEDGMENT =
  "I like that change.";

export const SAVE_OFFER =
  "Would you like me to save this as your Workshop Business Asset?";

export const SAVE_RESPONSES = {
  yes: "Beautiful. It's saved — and we can keep shaping it whenever you're ready.",
  "not-yet": "Of course. It stays right here whenever you want it.",
  continue:
    "Let's keep thinking. I'm still here — no rush.",
} as const;
