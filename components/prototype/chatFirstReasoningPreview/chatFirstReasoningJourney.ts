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

export type JourneyId = "sop" | "workshop" | "newsletter" | "marketing";

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
  questions: readonly [JourneyQuestion, JourneyQuestion, JourneyQuestion];
  researchOffer: string;
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

export const OPENING_QUESTION = "What would you like to create, develop, or build?";

export const OPENING_SUPPORT =
  "Tell me what you're trying to make happen. It doesn't have to be fully figured out yet. We'll work through it together.";

export const UNCLEAR_REPLY =
  "I'd love to help. Tell me a little more about what you'd like to create, develop, or build — even a rough version is plenty to start from.";

export const RESEARCH_CONCEPT_NOTE =
  "(Preview note: research here is a concept demonstration. In the full experience, I'd actually gather this and bring back what matters for your decision.)";

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
  },
};

export const JOURNEY_CHIP_EXAMPLES: readonly string[] = (
  ["sop", "workshop", "newsletter", "marketing"] as const
).map((id) => JOURNEYS[id].chipExample);

export function journeyFor(id: JourneyId): BuildJourney {
  return JOURNEYS[id];
}

export function detectJourney(userText: string): JourneyId | null {
  const t = userText.trim();
  if (!t) return null;
  if (/\bsops?\b|standard operating procedure/i.test(t)) return "sop";
  if (/\bworkshops?\b/i.test(t)) return "workshop";
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
