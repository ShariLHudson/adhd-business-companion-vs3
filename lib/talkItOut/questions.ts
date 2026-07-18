import type { TalkItOutQuestion } from "./types";

/** One-at-a-time question bank — never present as a menu. */
export const TALK_IT_OUT_QUESTIONS: readonly TalkItOutQuestion[] = [
  {
    id: "wh-important",
    area: "what-happened",
    text: "What part of this feels most important to talk through?",
  },
  {
    id: "wh-pov",
    area: "what-happened",
    text: "What happened from your point of view?",
  },
  {
    id: "wh-unresolved",
    area: "what-happened",
    text: "What feels unresolved?",
  },
  {
    id: "m-really-about",
    area: "meaning",
    text: "What part of this feels most central for you right now?",
  },
  {
    id: "wh-hire-why",
    area: "what-happened",
    text: "What is making you consider hiring someone now?",
  },
  {
    id: "wh-hire-plate",
    area: "what-happened",
    text: "What would you hope a marketing or sales person could take off your plate?",
  },
  {
    id: "wh-hire-judge",
    area: "what-happened",
    text: "What feels hardest to judge right now — the cost, the timing, or what you would want them to accomplish?",
  },
  {
    id: "m-weight",
    area: "meaning",
    text: "What part seems to carry the most weight?",
  },
  {
    id: "m-afraid",
    area: "meaning",
    text: "What are you afraid this might mean?",
  },
  {
    id: "v-matters",
    area: "values",
    // Package 203/206 — concrete substitute; abstract "what matters most" banned
    text: "What would you want this choice to protect?",
  },
  {
    id: "v-aligned",
    area: "values",
    text: "What would feel most aligned with who you want to be?",
  },
  {
    id: "v-protect",
    area: "values",
    text: "Is there a value you want this choice to protect?",
  },
  {
    id: "n-need",
    area: "needs",
    text: "What do you need that you may not be getting right now?",
  },
  {
    id: "n-safer",
    area: "needs",
    text: "What would help you feel safer, clearer, or more settled?",
  },
  {
    id: "n-understand",
    area: "needs",
    text: "What are you hoping the other person understands?",
  },
  {
    id: "o-considered",
    area: "options",
    text: "What possibilities have you considered?",
  },
  {
    id: "o-dismissing",
    area: "options",
    text: "Is there an option you keep dismissing?",
  },
  {
    id: "o-nothing",
    area: "options",
    text: "What would happen if you did nothing for now?",
  },
  {
    id: "t-gain",
    area: "trade-offs",
    text: "What might you gain from that choice?",
  },
  {
    id: "t-cost",
    area: "trade-offs",
    text: "What might it cost you?",
  },
  {
    id: "t-hardest",
    area: "trade-offs",
    text: "Which trade-off feels hardest?",
  },
  {
    id: "p-remind",
    area: "patterns",
    text: "Does this remind you of anything you have faced before?",
  },
  {
    id: "p-usually",
    area: "patterns",
    text: "What usually happens when you respond this way?",
  },
  {
    id: "p-notice",
    area: "patterns",
    text: "Is there a pattern you are beginning to notice?",
  },
  {
    id: "r-possible",
    area: "readiness",
    text: "What feels possible right now?",
  },
  {
    id: "r-ready",
    area: "readiness",
    text: "What part are you ready to handle?",
  },
  {
    id: "r-too-much",
    area: "readiness",
    text: "What would be too much today?",
  },
  {
    id: "ff-feel-handled",
    area: "future-feeling",
    text: "How do you think you would feel once this was handled?",
  },
  {
    id: "ff-hanging",
    area: "future-feeling",
    text: "What might feel different once this was no longer hanging over you?",
  },
  {
    id: "ff-finished",
    area: "future-feeling",
    text: "If this were finished, what would that give you?",
  },
  {
    id: "ff-tomorrow",
    area: "future-feeling",
    text: "How might tomorrow feel if this were already taken care of?",
  },
  {
    id: "ff-afterward",
    area: "future-feeling",
    text: "If you made that choice, how do you imagine you would feel afterward?",
  },
  {
    id: "ff-future-self",
    area: "future-feeling",
    text: "What do you think your future self would appreciate about doing this — or about waiting?",
  },
] as const;
