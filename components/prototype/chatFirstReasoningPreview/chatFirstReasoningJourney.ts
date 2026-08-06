/**
 * Chat-First Reasoning Experience Preview (2026-08-06) — isolated prototype.
 *
 * Pure conversation logic for founder review of the proposed universal
 * chat-first Create experience. Four authored Build Journeys (SOP, Workshop,
 * Newsletter, Marketing strategy) demonstrate whether ONE conversation
 * pattern — acknowledge → understand → reflect → suggest — can carry
 * different kinds of work.
 *
 * Deliberately NOT connected to anything: no lib/createEstate/, no
 * lib/estateBrain/, no lib/currentFocus/, no records, no routing. The
 * "research" moments demonstrate the concept only — no research
 * infrastructure is touched.
 *
 * @see docs/create-experience/CHAT_FIRST_REASONING_EXPERIENCE_HANDOFF.md
 */

export type JourneyId =
  | "sop"
  | "workshop"
  | "event"
  | "newsletter"
  | "marketing";

export type JourneyQuestion = {
  id: string;
  prompt: string;
  /** Spoken after the member answers — acknowledge what was learned. */
  learnedAcknowledgment: string;
  /** "Help me think this through" — a gentler way into the same question. */
  thinkingHelp: string;
  /** Soft label used in the closing reflection — never a numbered form. */
  recapLabel: string;
};

export type BuildJourney = {
  id: JourneyId;
  /** Named only at the end, when Spark proposes direction. */
  outcomeLabel: string;
  /** Example chip shown on the opening screen. */
  chipExample: string;
  /** Rule 2 order: outcome → why it matters → who → what already exists. */
  questions: readonly JourneyQuestion[];
  researchOffer: string;
  /** What accepted research would bring back — concept demonstration only. */
  researchPreviewFinding: string;
  /** One thing still unsettled — the "what's missing or needs a decision" beat. */
  openDecisionNote: string;
};

export type JourneyState = {
  journeyId: JourneyId;
  originalText: string;
  /** Answers in question order, so far. */
  answers: string[];
};

export type PreviewMessage = {
  role: "user" | "assistant";
  content: string;
};

// Planning included (Founder, 2026-08-06) — many meaningful member goals are
// experiences, events, or outcomes rather than artifacts.
export const OPENING_QUESTION =
  "What would you like to create, plan, develop, or build?";

export const OPENING_SUPPORT =
  "Tell me what you're trying to make happen. It doesn't have to be fully figured out yet. We'll work through it together.";

// Never ask the member to repeat what they already said — acknowledge it and
// ask a forward-moving question instead.
export const UNCLEAR_REPLY =
  "That sounds worth making happen — I'd love to help. What would you most like to be different once it's done and working?";

export const RESEARCH_CHOICE_YES = "Yes — research this";

export const RESEARCH_CHOICE_NOT_NOW = "Not right now";

/** Rule 6 step 3 / Rule 7 — the member controls how research is used. */
export const RESEARCH_USE_PROMPT =
  "Before I look — how would you like me to use what I find?";

export type ResearchUse = "ideas" | "recommendation";

export const RESEARCH_USE_IDEAS_LABEL = "Ideas and examples to choose from";

export const RESEARCH_USE_RECOMMENDATION_LABEL = "A clear recommendation";

export const RESEARCH_USE_ACKS: Record<ResearchUse, string> = {
  ideas:
    "Perfect — I'll bring back ideas and examples, and you choose what fits.",
  recommendation:
    "Got it — I'll weigh what I find and bring you one clear recommendation.",
};

export const RESEARCH_KEPT_NOTE =
  "I'd keep what we find — and the decisions it helps you make — with this work, so nothing gets lost.";

export const RESEARCH_RETURN_LINE = "Now, back to where we were:";

export const RESEARCH_DECLINE_LINE =
  "No problem — research is always here whenever a decision could use it.";

export const PREVIEW_BOUNDARY_REPLY =
  "This is where the preview pauses. In the full experience, we'd carry everything you just shared straight into shaping the real thing together — and nothing would be created until you say go.";

export const PROGRESS_CAPTION = "We're understanding this together — no rush.";

const JOURNEYS: Record<JourneyId, BuildJourney> = {
  sop: {
    id: "sop",
    outcomeLabel: "SOP",
    chipExample: "I need an SOP for onboarding clients.",
    questions: [
      {
        id: "sop-success",
        prompt:
          "What should someone be able to accomplish after following this SOP?",
        learnedAcknowledgment:
          "That's a clear destination. A process is only worth writing down if it makes something like that reliably true.",
        thinkingHelp:
          "One way in: picture the last time this went really well. What was true at the end that you'd want every single time?",
        recapLabel: "What it should make possible",
      },
      {
        id: "sop-why",
        prompt:
          "Why now — what's happening in your business that makes this the moment for it?",
        learnedAcknowledgment:
          "That's the real reason we're doing this — and it tells us what this process has to protect.",
        thinkingHelp:
          "Sometimes it's a moment: a mistake that stung, a new hire, a growth spurt, or just being tired of holding it all in your head.",
        recapLabel: "Why it matters now",
      },
      {
        id: "sop-who",
        prompt: "Who will use this process once it is created?",
        learnedAcknowledgment:
          "Good to know — that changes how we write it. The right level of detail depends entirely on who's holding it.",
        thinkingHelp:
          "Think about the person most likely to follow this when you're not in the room. What do they already know? What would they need spelled out?",
        recapLabel: "Who will use it",
      },
      {
        id: "sop-existing",
        prompt:
          "Do you already have a process, notes, documents, or examples we can build from?",
        learnedAcknowledgment:
          "That helps me know where we're starting from. Whatever exists — even just the way you've been doing it — counts as material.",
        thinkingHelp:
          "Even if nothing's written down, you have a way you already do this. Where would a teammate look to see how it happens today — emails, notes, past client threads, or the steps in your head?",
        recapLabel: "Where we're starting",
      },
    ],
    researchOffer:
      "Would it help if I researched current client onboarding best practices before we design this section?",
    researchPreviewFinding:
      "Here's the kind of thing I'd bring back: how other service businesses welcome new clients, the first-week missteps that quietly cost trust, and what clients say makes them feel taken care of — applied to your decisions, not delivered as a report. (Concept demonstration — no real research runs in this preview.)",
    openDecisionNote:
      "One thing we haven't settled yet: what should happen when a step doesn't go to plan. That's the kind of decision we'd think through together as we build — not something you need to answer now.",
  },
  workshop: {
    id: "workshop",
    outcomeLabel: "workshop",
    chipExample: "I want to plan a workshop.",
    questions: [
      {
        id: "workshop-transformation",
        prompt:
          "When people leave your workshop, what should they understand, believe, or be able to do?",
        learnedAcknowledgment:
          "That's the heart of it. Everything else — the agenda, the exercises, the pacing — exists to make that happen.",
        thinkingHelp:
          "Try finishing this sentence: “They walked in unsure about ___, and walked out able to ___.”",
        recapLabel: "The transformation",
      },
      {
        id: "workshop-why",
        prompt: "Why this workshop, and why now — what makes it matter to you?",
        learnedAcknowledgment:
          "Knowing why keeps every choice honest — the agenda serves that reason, not the other way around.",
        thinkingHelp:
          "Maybe it grows your business, maybe it's a message you can't not share — both are good reasons, and naming yours helps us design for it.",
        recapLabel: "Why it matters",
      },
      {
        id: "workshop-audience",
        prompt:
          "Who do you most hope shows up — and where are they starting from?",
        learnedAcknowledgment:
          "That matters more than most people realize. Where they start decides what we can skip and what we need to build carefully.",
        thinkingHelp:
          "Picture one real person you'd love to see in the room. What do they already know? What are they nervous about?",
        recapLabel: "Who's in the room",
      },
      {
        id: "workshop-material",
        prompt:
          "Have you taught or shared any of this before, or is it coming together for the first time?",
        learnedAcknowledgment:
          "Good — that tells me what we can lean on and what we get to design fresh.",
        thinkingHelp:
          "Past talks, client conversations, posts you've written — anywhere you've explained this before counts.",
        recapLabel: "What we're building from",
      },
    ],
    researchOffer:
      "Would it help if I looked into how similar workshops are running right now — lengths, group sizes, what participants respond to — before we design yours?",
    researchPreviewFinding:
      "Here's the kind of thing I'd bring back: how workshops like yours are being run right now, what keeps people engaged past the first hour, and where first-time attendees tend to get lost — applied to your design choices, not delivered as a report. (Concept demonstration — no real research runs in this preview.)",
    openDecisionNote:
      "One thing we haven't settled yet: how long it should be. That choice follows from the transformation you named — not the other way around — and we'd decide it together.",
  },
  event: {
    id: "event",
    outcomeLabel: "event plan",
    chipExample: "I want to plan a retreat for my clients.",
    questions: [
      {
        id: "event-memory",
        prompt:
          "When it's over and people are heading home, what do you want them to be saying about what they just experienced?",
        learnedAcknowledgment:
          "That's the experience we're really planning — everything else is in service of people leaving with exactly that.",
        thinkingHelp:
          "Picture the drive home. Someone calls a friend and says “You won't believe what this was like…” — how does that sentence end?",
        recapLabel: "What people should leave saying",
      },
      {
        id: "event-why",
        prompt: "Why does this gathering matter — for them, and for you?",
        learnedAcknowledgment:
          "That's the heartbeat of it. Experiences built on a real why feel different the moment people walk in.",
        thinkingHelp:
          "There's usually a business reason and a personal one. Name whichever is louder right now.",
        recapLabel: "Why it matters",
      },
      {
        id: "event-audience",
        prompt: "Who is this for — and what do they need most from time with you?",
        learnedAcknowledgment:
          "That tells us a lot. An experience designed for *them* will feel completely different from one designed for everyone.",
        thinkingHelp:
          "Think of two or three people you'd love to see there. What are they each hoping will change for them?",
        recapLabel: "Who it's for",
      },
      {
        id: "event-inplace",
        prompt:
          "What's already in place — a date, a place, past events you've run — or is this starting from a blank page?",
        learnedAcknowledgment:
          "Good — now I know what's fixed and what's still ours to shape. Both are useful.",
        thinkingHelp:
          "Anything counts: a venue you love, a season that works, something you ran before that people still mention.",
        recapLabel: "What's already in place",
      },
    ],
    researchOffer:
      "Would it help if I looked into how similar retreats and events are being run right now — pricing, length, what attendees remember most — before we shape yours?",
    researchPreviewFinding:
      "Here's the kind of thing I'd bring back: how similar experiences are priced and structured right now, what attendees say they remember a year later, and the logistics people most often wish they'd planned earlier — applied to your choices, not delivered as a report. (Concept demonstration — no real research runs in this preview.)",
    openDecisionNote:
      "One thing we haven't settled yet: the size. Intimate and deep, or bigger and higher-energy — that choice shapes everything else, and we'd make it together.",
  },
  newsletter: {
    id: "newsletter",
    outcomeLabel: "newsletter",
    chipExample: "I need a newsletter.",
    questions: [
      {
        id: "newsletter-purpose",
        prompt:
          "When someone finishes reading an issue, what do you hope they feel, understand, or do?",
        learnedAcknowledgment:
          "That's the purpose — and it will quietly shape every choice we make, from the first line to how each issue ends.",
        thinkingHelp:
          "Imagine your favorite reader closing the email. What did it leave them with — a feeling, an idea, a next step?",
        recapLabel: "What each issue should leave behind",
      },
      {
        id: "newsletter-why",
        prompt:
          "Why a newsletter, and why now — what makes this matter for your business?",
        learnedAcknowledgment:
          "That's worth holding onto — it will keep the newsletter honest when writing weeks get busy.",
        thinkingHelp:
          "Maybe it's staying close to people between launches, or owning your audience instead of renting it. What's yours?",
        recapLabel: "Why it matters",
      },
      {
        id: "newsletter-audience",
        prompt:
          "Who are you writing to — and what do they already come to you for?",
        learnedAcknowledgment:
          "Knowing that keeps the writing honest. We're not writing to everyone — we're writing to them.",
        thinkingHelp:
          "Think of the people who already ask you questions. What do they ask about most?",
        recapLabel: "Who it's for",
      },
      {
        id: "newsletter-voice",
        prompt:
          "Is there anything you've already written — posts, emails, notes — that sounds like the voice you want?",
        learnedAcknowledgment:
          "That helps. Your voice already exists; our job is to let it through, not invent a new one.",
        thinkingHelp:
          "Look for a moment you wrote something and it felt like you. Even one paragraph is enough to learn from.",
        recapLabel: "The voice we're building from",
      },
    ],
    researchOffer:
      "Would it help if I researched what's working in newsletters for audiences like yours before we settle on the shape?",
    researchPreviewFinding:
      "Here's the kind of thing I'd bring back: what newsletters your readers already open and why, subject-line patterns that feel human instead of salesy, and the length people actually finish — applied to your choices, not delivered as a report. (Concept demonstration — no real research runs in this preview.)",
    openDecisionNote:
      "One thing we haven't settled yet: how often it should arrive. Rhythm matters more than frequency, and it's worth deciding together rather than defaulting to weekly.",
  },
  marketing: {
    id: "marketing",
    outcomeLabel: "marketing strategy",
    chipExample: "I need a marketing strategy.",
    questions: [
      {
        id: "marketing-success",
        prompt:
          "If this strategy works, what's different in your business three months from now?",
        learnedAcknowledgment:
          "Now we have a destination. Strategy is just the honest path between today and that picture.",
        thinkingHelp:
          "Be concrete if you can — more of what? Fewer of what? What would you stop worrying about?",
        recapLabel: "What success looks like",
      },
      {
        id: "marketing-why",
        prompt:
          "Why does this matter right now — what's happening in your business that brought it up today?",
        learnedAcknowledgment:
          "That context changes everything — strategy for where you actually are beats strategy for an ideal version of you.",
        thinkingHelp:
          "A slow season, an income goal, a shift you're making — whatever's behind it is useful for us to know.",
        recapLabel: "Why now",
      },
      {
        id: "marketing-audience",
        prompt:
          "Who are you trying to reach — and where does their attention already live?",
        learnedAcknowledgment:
          "That's where we'll meet them. Good marketing goes where people already are instead of asking them to come find us.",
        thinkingHelp:
          "Think about your favorite past client. Where did they find you? Where do they spend time — online or off?",
        recapLabel: "Who we're reaching",
      },
      {
        id: "marketing-tried",
        prompt: "What have you already tried, and what did you learn from it?",
        learnedAcknowledgment:
          "Nothing you tried was wasted — it was all information. We get to build on what it taught you.",
        thinkingHelp:
          "Even “I posted for a while and stopped” counts. What felt sustainable? What drained you?",
        recapLabel: "What we've learned so far",
      },
    ],
    researchOffer:
      "Would it help if I researched how businesses like yours are reaching similar audiences right now before we choose a direction?",
    researchPreviewFinding:
      "Here's the kind of thing I'd bring back: where businesses like yours are actually finding clients right now, what's working for audiences like the one you described, and what tends to burn people out — applied to your direction, not delivered as a report. (Concept demonstration — no real research runs in this preview.)",
    openDecisionNote:
      "One thing we haven't settled yet: where to focus first. We don't need to be everywhere — we need the one place that fits you, and that's a decision we'd make together.",
  },
};

/**
 * The four core ways Spark helps founders think (Founder, 2026-08-06).
 * Each example demonstrates a reasoning pattern — not a product category —
 * and starts the journey that carries that pattern.
 */
export type ReasoningPatternExample = {
  verb: "Create" | "Plan" | "Develop" | "Build";
  pattern: string;
  example: string;
};

export const REASONING_PATTERN_EXAMPLES: readonly ReasoningPatternExample[] = [
  {
    verb: "Create",
    pattern: "Build communication or content that connects",
    example: "I need a newsletter my clients actually read.",
  },
  {
    verb: "Plan",
    pattern: "Design meaningful experiences",
    example: "I want to plan a retreat for my clients.",
  },
  {
    verb: "Develop",
    pattern: "Create repeatable systems and processes",
    example: "I need an SOP for onboarding clients.",
  },
  {
    verb: "Build",
    pattern: "Turn ideas into business assets or growth opportunities",
    example: "I want a marketing strategy that grows my business.",
  },
];

export function journeyFor(id: JourneyId): BuildJourney {
  return JOURNEYS[id];
}

export function detectJourney(userText: string): JourneyId | null {
  const t = userText.trim();
  if (!t) return null;
  if (/\bsops?\b|standard operating procedure/i.test(t)) return "sop";
  if (/\bworkshops?\b/i.test(t)) return "workshop";
  if (/\bretreats?\b|\bevents?\b|\bwebinars?\b|\bsummits?\b|\bconferences?\b|\bopen house\b/i.test(t)) {
    return "event";
  }
  if (/\bnewsletters?\b/i.test(t)) return "newsletter";
  if (/\bmarketing\b|\bmarket my\b|\bpromot(?:e|ing|ion)\b/i.test(t)) {
    return "marketing";
  }
  return null;
}

/**
 * Reflect the member's own subject back when the wording offers one
 * ("an SOP for onboarding clients" → "onboarding clients"). Falls back to
 * the journey's plain acknowledgment when it doesn't.
 */
function sopSubjectFrom(userText: string): string | null {
  const match = /\bsop\b\s+(?:for|to|about|on)\s+(.+?)[.!?]?\s*$/i.exec(
    userText.trim(),
  );
  const subject = match?.[1]?.trim();
  return subject && subject.length <= 80 ? subject : null;
}

export function journeyAcknowledgment(
  journeyId: JourneyId,
  userText: string,
): string {
  switch (journeyId) {
    case "sop": {
      const subject = sopSubjectFrom(userText);
      const naming = subject
        ? `I hear that you're looking to create an SOP for ${subject}.`
        : "I hear that you're looking to create an SOP.";
      return `${naming} Before we start writing steps, let's understand what this process needs to accomplish.`;
    }
    case "workshop":
      return "A workshop — I'd love to help you build it. Before we think about slides or schedules, let's think about the transformation.";
    case "event":
      return "An experience for real people — that's worth planning well. Before dates and logistics, let's start with what it should feel like.";
    case "newsletter":
      return "I'd love to help. Before we write a single line, let's make sure we know what this newsletter is really for.";
    case "marketing":
      return "Let's build this thoughtfully. Before we talk tactics, let's get clear on what growth actually looks like for you.";
  }
}

export function startJourney(
  userText: string,
): { state: JourneyState; messages: string[] } | null {
  const journeyId = detectJourney(userText);
  if (!journeyId) return null;
  const journey = JOURNEYS[journeyId];
  const state: JourneyState = {
    journeyId,
    originalText: userText.trim(),
    answers: [],
  };
  return {
    state,
    messages: [
      journeyAcknowledgment(journeyId, userText),
      journey.questions[0].prompt,
    ],
  };
}

export function currentQuestion(state: JourneyState): JourneyQuestion | null {
  return JOURNEYS[state.journeyId].questions[state.answers.length] ?? null;
}

export function isJourneyComplete(state: JourneyState): boolean {
  return state.answers.length >= JOURNEYS[state.journeyId].questions.length;
}

/** The closing reflection — what Spark is carrying forward, then direction. */
export function completionMessages(state: JourneyState): string[] {
  const journey = JOURNEYS[state.journeyId];
  const recapLines = journey.questions
    .map((q, i) => {
      const answer = state.answers[i]?.trim();
      return answer ? `${q.recapLabel} — ${answer}` : null;
    })
    .filter((line): line is string => Boolean(line));

  const recap =
    recapLines.length > 0
      ? `Here's what I'm carrying forward for us:\n\n${recapLines.join("\n")}`
      : "Thank you — I have a much clearer picture now.";

  const direction =
    `When you're ready, here's how I'd suggest we move: we shape your ${journey.outcomeLabel} together, ` +
    "one thoughtful piece at a time — starting where it makes the biggest difference. " +
    "I'll bring what I know as we go, and nothing gets created until you say go.";

  return [
    recap,
    journey.openDecisionNote,
    direction,
    "(This preview pauses here. The full experience would continue from this exact conversation into creating together.)",
  ];
}

export function answerCurrentQuestion(
  state: JourneyState,
  reply: string,
): { state: JourneyState; messages: string[] } {
  const question = currentQuestion(state);
  if (!question) {
    return { state, messages: [PREVIEW_BOUNDARY_REPLY] };
  }
  const next: JourneyState = {
    ...state,
    answers: [...state.answers, reply.trim()],
  };
  const upcoming = currentQuestion(next);
  if (!upcoming) {
    return {
      state: next,
      messages: [question.learnedAcknowledgment, ...completionMessages(next)],
    };
  }
  return {
    state: next,
    messages: [question.learnedAcknowledgment, upcoming.prompt],
  };
}

export function thinkingHelpFor(state: JourneyState): string | null {
  return currentQuestion(state)?.thinkingHelp ?? null;
}

export function researchOfferFor(state: JourneyState): string {
  return JOURNEYS[state.journeyId].researchOffer;
}

/**
 * Member said yes to research. Before anything is gathered, Spark asks how
 * they want the information used (Rule 6 step 3 / Rule 7) — the member
 * controls how research is applied, always.
 */
export function researchAcceptMessages(_state: JourneyState): string[] {
  return [RESEARCH_USE_PROMPT];
}

/**
 * Member chose how to use it: acknowledge their choice, show what research
 * would bring back (concept only), promise the learning stays with the work,
 * then return them to the exact question they paused on. Research is a
 * capability at every step — never a detour they have to find their way
 * back from.
 */
export function researchUseMessages(
  state: JourneyState,
  use: ResearchUse,
): string[] {
  const journey = JOURNEYS[state.journeyId];
  const question = currentQuestion(state);
  const returnTo = question
    ? [`${RESEARCH_RETURN_LINE}\n\n${question.prompt}`]
    : [];
  return [
    RESEARCH_USE_ACKS[use],
    journey.researchPreviewFinding,
    RESEARCH_KEPT_NOTE,
    ...returnTo,
  ];
}

/** Member said not now: no friction, straight back to the exact question. */
export function researchDeclineMessages(state: JourneyState): string[] {
  const question = currentQuestion(state);
  const returnTo = question
    ? [`${RESEARCH_RETURN_LINE}\n\n${question.prompt}`]
    : [];
  return [RESEARCH_DECLINE_LINE, ...returnTo];
}
