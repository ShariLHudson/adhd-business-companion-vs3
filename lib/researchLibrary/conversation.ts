import {
  getLiveResearchProviderStatus,
  runUniversalRequestToOutcome,
} from "@/lib/universalRequestOutcome";
import {
  addFindingsToCollection,
  createResearchCollection,
  makeStableFinding,
} from "./collection";
import { appendSessionTurn, createResearchSession } from "./session";
import type {
  ResearchCollectionRecord,
  ResearchFindingRecord,
  ResearchOutcomeArtifact,
  ResearchSession,
} from "./types";

export type ResearchTurnResult = {
  session: ResearchSession;
  collection: ResearchCollectionRecord;
  assistantMessage: string;
  offerUseThisResearch: boolean;
  autoOutcome: ResearchOutcomeArtifact | null;
  currentResearchNotice: string | null;
};

export type TopicPack = {
  match: RegExp;
  intro: string;
  findings: Array<{
    title: string;
    content: string;
    kind: ResearchFindingRecord["kind"];
  }>;
  followUp: string;
};

// Exported (additive, no behavior change) so researchLibraryConfig can surface
// these as built_in_guidance without duplicating the content. The packs move
// fully into the config when this engine path is retired (RL-4).
export const TOPIC_PACKS: TopicPack[] = [
  {
    match: /advisory\s*board/i,
    intro:
      "An advisory board is a group of people who provide guidance, perspective, and expertise without usually carrying the formal legal responsibilities of a governing board.\n\nFor a small business, it can help with areas such as strategy, industry knowledge, introductions, credibility, and decision support.",
    findings: [
      {
        title: "Advisory vs governing board",
        content:
          "Advisors typically guide; they do not usually hold formal fiduciary duties of a governing board unless structured that way.",
        kind: "fact",
      },
      {
        title: "Common value areas",
        content:
          "Strategy, industry knowledge, introductions, credibility, and decision support are common reasons to form an advisory board.",
        kind: "theme",
      },
      {
        title: "Typical structure",
        content:
          "Many small businesses start with 3–5 advisors, clear meeting cadence, and written expectations for roles and confidentiality.",
        kind: "example",
      },
      {
        title: "Recruitment caution",
        content:
          "Vague invitations and unclear time expectations are a common reason advisory relationships stall.",
        kind: "caution",
      },
    ],
    followUp:
      "Are you mainly considering one for your own business, or are you trying to understand how advisory boards work generally?",
  },
  {
    match: /podcast/i,
    intro:
      "Starting a podcast usually means clarifying the show’s purpose, choosing a format, setting up recording and hosting, and planning how episodes will stay consistent.\n\nThe technical pieces matter, but the clearer the audience and cadence, the easier everything else becomes.",
    findings: [
      {
        title: "Core launch pieces",
        content:
          "Purpose, audience, format, recording setup, hosting, and a sustainable episode cadence.",
        kind: "theme",
      },
      {
        title: "Equipment basics",
        content:
          "A clear microphone, quiet space, and simple editing software are enough for a strong first season.",
        kind: "recommendation",
      },
      {
        title: "Hosting",
        content:
          "A podcast host typically distributes RSS to major listening apps after you publish.",
        kind: "fact",
      },
      {
        title: "Consistency risk",
        content:
          "Overbuilding the launch and under-planning a realistic episode schedule is a common stall point.",
        kind: "risk",
      },
    ],
    followUp:
      "Do you want to go deeper on launch steps, equipment and hosting, or how to promote the show?",
  },
  {
    match: /webinar|social\s*media|content\s*plan/i,
    intro:
      "Webinar promotion usually works best when the message, audience, and channel rhythm stay coordinated across a short campaign window.\n\nA focused run of posts can build awareness, remind people why the session matters, and make registration feel easy.",
    findings: [
      {
        title: "Promotion rhythm",
        content:
          "A short campaign often includes awareness, value, social proof, urgency, and a clear registration path.",
        kind: "theme",
      },
      {
        title: "Channel fit",
        content:
          "Choose platforms where the audience already pays attention rather than posting everywhere thinly.",
        kind: "recommendation",
      },
      {
        title: "Offer clarity",
        content:
          "Each post should make the webinar outcome obvious in one glance.",
        kind: "fact",
      },
    ],
    followUp:
      "Are you promoting a specific webinar date, or building a reusable promotion pattern?",
  },
  {
    match: /medicare/i,
    intro:
      "Medicare is the U.S. federal health insurance program that primarily serves people 65 and older and some younger people with qualifying conditions.\n\nCoverage is organized into parts that handle hospital care, medical services, and optional private plans — and the right path depends on someone’s situation.",
    findings: [
      {
        title: "Program purpose",
        content:
          "Medicare is federal health insurance mainly for people 65+ and certain younger people with qualifying conditions.",
        kind: "fact",
      },
      {
        title: "Parts overview",
        content:
          "Parts cover hospital care, medical services, and optional private plan structures; details can change and should be verified with official sources for current decisions.",
        kind: "theme",
      },
      {
        title: "Current-sensitive caution",
        content:
          "Enrollment windows, plan details, and costs can change — official Medicare sources should be checked before decisions.",
        kind: "caution",
      },
    ],
    followUp:
      "Are you trying to understand the basics, or help someone compare coverage options?",
  },
  {
    match: /customer\s*onboarding|onboarding/i,
    intro:
      "Customer onboarding is the path that helps a new customer get set up, understand value, and take the first successful actions.\n\nStrong onboarding reduces confusion, shortens time-to-value, and makes later support lighter.",
    findings: [
      {
        title: "Onboarding goal",
        content:
          "Help new customers reach a first clear win with as little friction as possible.",
        kind: "theme",
      },
      {
        title: "Common stages",
        content:
          "Welcome, setup, first success, habit building, and a check-in when something stalls.",
        kind: "example",
      },
      {
        title: "Overwhelm risk",
        content:
          "Too many steps or too much information at once is a common reason onboarding fails.",
        kind: "risk",
      },
    ],
    followUp:
      "Is this for a product, a service relationship, or an internal process?",
  },
];

export function pickTopicPack(text: string): TopicPack | null {
  for (const pack of TOPIC_PACKS) {
    if (pack.match.test(text)) return pack;
  }
  return null;
}

function genericIntro(topic: string): {
  intro: string;
  findings: ResearchFindingRecord[];
  followUp: string;
} {
  const findings = [
    makeStableFinding({
      title: `What ${topic} usually involves`,
      content: `Understanding ${topic} typically starts with clarifying the goal, the audience or context, the main options, and the risks of moving too quickly.`,
      kind: "theme",
    }),
    makeStableFinding({
      title: "Useful first lens",
      content:
        "Separate what is already known, what needs current information, and what decision this research is meant to support.",
      kind: "recommendation",
    }),
    makeStableFinding({
      title: "Open questions",
      content: `What success looks like for ${topic}, and what constraints matter most.`,
      kind: "question",
    }),
  ];
  return {
    intro: `Let’s explore ${topic}.\n\nI’ll start with a clear overview from stable knowledge, then we can go wherever your next question points.`,
    findings,
    followUp: `What part of ${topic} do you most want to understand next?`,
  };
}

function buildFindingsFromPack(
  pack: TopicPack,
): ResearchFindingRecord[] {
  return pack.findings.map((f) =>
    makeStableFinding({
      title: f.title,
      content: f.content,
      kind: f.kind,
    }),
  );
}

function currentResearchNotice(session: ResearchSession): string | null {
  if (session.liveResearchAvailable) return null;
  if (!session.currentInformationRequired) {
    return "I’m using stable knowledge for this. If you need current public research, I can retry when a live research provider is available.";
  }
  return "Current research isn’t available right now, so I’m continuing with stable knowledge and marking current-sensitive areas carefully. You can retry current research when ready.";
}

function shouldOfferUseThisResearch(
  session: ResearchSession,
  collection: ResearchCollectionRecord,
  userText: string,
): boolean {
  if (session.intendedOutcome) return false;
  if (/\b(use this|turn this into|make this|create|build a)\b/i.test(userText)) {
    return false;
  }
  if (collection.findings.length < 3) return false;
  if (session.conversationTurns.filter((t) => t.role === "user").length < 1) {
    return false;
  }
  // Offer after substantive findings, not every turn — only when natural pause signals
  const pause =
    /\b(enough|that helps|thanks|got it|what can i do|organize|use this)\b/i.test(
      userText,
    ) || collection.findings.length >= 6;
  return pause || session.conversationTurns.filter((t) => t.role === "user").length >= 3;
}

function autoBuildOutcomeFromRequest(
  session: ResearchSession,
  collection: ResearchCollectionRecord,
): ResearchOutcomeArtifact | null {
  if (!session.intendedOutcome) return null;
  const request = `${session.currentQuestion}`;
  const result = runUniversalRequestToOutcome(request, {
    sourceExperience: "research_library",
  });
  const pkg = result.creationPackage;
  const content =
    pkg?.sections?.map((s) => `${s.title}\n${s.content}`).join("\n\n") ||
    collection.summary;
  const sections =
    pkg?.sections?.map((s) => ({
      title: s.title,
      body: s.content,
    })) ||
    collection.findings.slice(0, 6).map((f) => ({
      title: f.title,
      body: f.content,
    }));

  return {
    id: `out_${Date.now().toString(36)}`,
    kind: /\bform\b/i.test(session.intendedOutcome)
      ? "form"
      : /\blist|checklist\b/i.test(session.intendedOutcome)
        ? "list"
        : /\bproject\b/i.test(session.intendedOutcome)
          ? "project_proposal"
          : /\bstrateg/i.test(session.intendedOutcome)
            ? "strategy_proposal"
            : /\bguide|step/i.test(session.intendedOutcome)
              ? "guide"
              : "document",
    title: pkg?.title || session.intendedOutcome || collection.title,
    content,
    sections,
    researchCollectionId: collection.id,
    destinationHint: "create",
    createdAt: new Date().toISOString(),
  };
}

export function startResearchConversation(input: {
  text: string;
  sourceExperience?: string | null;
  sourceEntityId?: string | null;
  sourceSelectionIds?: string[];
  knownUserContext?: string | null;
}): ResearchTurnResult {
  let session = createResearchSession(input);
  session = appendSessionTurn(session, {
    role: "user",
    content: input.text.trim(),
  });

  let collection = createResearchCollection(session);
  session = {
    ...session,
    currentResearchCollectionId: collection.id,
    currentResearchStatus: getLiveResearchProviderStatus().liveResearchAvailable
      ? "current_research_in_progress"
      : "stable_knowledge_used",
  };

  const pack = pickTopicPack(input.text);
  let intro: string;
  let findings: ResearchFindingRecord[];
  let followUp: string;

  if (pack) {
    intro = pack.intro;
    findings = buildFindingsFromPack(pack);
    followUp = pack.followUp;
  } else {
    const g = genericIntro(session.primaryTopic);
    intro = g.intro;
    findings = g.findings;
    followUp = g.followUp;
  }

  collection = addFindingsToCollection(collection, findings);
  collection = {
    ...collection,
    currentResearchStatus: session.currentResearchStatus,
    questions: [...collection.questions, followUp],
  };

  const notice = currentResearchNotice(session);
  const autoOutcome = autoBuildOutcomeFromRequest(session, collection);

  let assistantMessage: string;
  if (autoOutcome) {
    assistantMessage = [
      intro,
      "",
      notice,
      "",
      `You asked me to ${session.intendedOutcome}. Here’s that result based on the research so far:`,
      "",
      `**${autoOutcome.title}**`,
      "",
      autoOutcome.sections
        .slice(0, 8)
        .map((s, i) => `${i + 1}. ${s.title}\n${s.body}`)
        .join("\n\n"),
      "",
      "I’ve kept the Research Collection linked so we can keep refining or use this elsewhere.",
    ]
      .filter(Boolean)
      .join("\n");
    session = {
      ...session,
      currentStatus: "complete",
      researchMode: "research_with_outcome",
      lastUsefulSummary: autoOutcome.title,
    };
  } else {
    assistantMessage = [intro, "", notice, "", followUp]
      .filter(Boolean)
      .join("\n");
    session = {
      ...session,
      currentStatus: "conversing",
      lastUsefulSummary: collection.summary,
      nextSuggestedInquiry: followUp,
    };
  }

  session = appendSessionTurn(session, {
    role: "assistant",
    content: assistantMessage,
    findingIdsAdded: findings.map((f) => f.id),
  });

  return {
    session,
    collection,
    assistantMessage,
    offerUseThisResearch:
      !autoOutcome && collection.findings.length >= 3 ? false : false,
    autoOutcome,
    currentResearchNotice: notice,
  };
}

export function continueResearchConversation(input: {
  session: ResearchSession;
  collection: ResearchCollectionRecord;
  text: string;
}): ResearchTurnResult {
  let { session, collection } = input;
  const userText = input.text.trim();
  session = appendSessionTurn(session, { role: "user", content: userText });

  // Freeform format / use requests
  if (
    /\b(turn this into|make this|create|build|use this|organize this)\b/i.test(
      userText,
    )
  ) {
    const outcome = runUniversalRequestToOutcome(
      `${userText} based on research about ${collection.topic}: ${collection.summary}`,
      { sourceExperience: "research_library" },
    );
    const pkg = outcome.creationPackage;
    const artifact: ResearchOutcomeArtifact = {
      id: `out_${Date.now().toString(36)}`,
      kind: /\bform\b/i.test(userText)
        ? "form"
        : /\blist|checklist|priorit/i.test(userText)
          ? "list"
          : /\bproject\b/i.test(userText)
            ? "project_proposal"
            : /\bstrateg/i.test(userText)
              ? "strategy_proposal"
              : /\bguide|step/i.test(userText)
                ? "guide"
                : "document",
      title: pkg?.title || `From research: ${collection.topic}`,
      content:
        pkg?.sections?.map((s) => `${s.title}\n${s.content}`).join("\n\n") ||
        collection.findings.map((f) => `• ${f.title}: ${f.content}`).join("\n"),
      sections:
        pkg?.sections?.map((s) => ({
          title: s.title,
          body: s.content,
        })) ||
        collection.findings.slice(0, 8).map((f) => ({
          title: f.title,
          body: f.content,
        })),
      researchCollectionId: collection.id,
      destinationHint: "create",
      createdAt: new Date().toISOString(),
    };

    const assistantMessage = [
      `Here’s ${artifact.title} from our research:`,
      "",
      artifact.sections
        .slice(0, 10)
        .map((s, i) => `${i + 1}. ${s.title}\n${s.body}`)
        .join("\n\n"),
      "",
      "The Research Collection stays linked. We can keep researching or open this in Create, Projects, Visual Thinking, or Strategic Planning when you’re ready.",
    ].join("\n");

    session = appendSessionTurn(session, {
      role: "assistant",
      content: assistantMessage,
    });
    session = {
      ...session,
      currentStatus: "complete",
      lastUsefulSummary: artifact.title,
      intendedOutcome: session.intendedOutcome || userText,
    };

    return {
      session,
      collection,
      assistantMessage,
      offerUseThisResearch: false,
      autoOutcome: artifact,
      currentResearchNotice: currentResearchNotice(session),
    };
  }

  // Follow-up research deepening
  const pack = pickTopicPack(`${collection.topic} ${userText}`);
  const extra: ResearchFindingRecord[] = [];
  let answer: string;

  if (/\b(my (own )?business|for my business)\b/i.test(userText) && pack) {
    answer =
      "For your own business, the useful path is usually: clarify the purpose of the board, decide what decisions you want help with, invite a small first group with clear expectations, and set a light meeting rhythm you can sustain.\n\nI’d keep the first version small and specific rather than perfect.";
    extra.push(
      makeStableFinding({
        title: "Business-first advisory path",
        content:
          "Purpose → decision support needs → small first group → clear expectations → sustainable meeting rhythm.",
        kind: "recommendation",
      }),
      makeStableFinding({
        title: "Next question for your business",
        content:
          "Which decisions or gaps would you most want advisors to help with in the next 90 days?",
        kind: "question",
      }),
    );
  } else if (/\bcompare|versus|vs\b/i.test(userText)) {
    answer =
      "Here’s a simple comparison lens: options differ by cost, control, learning curve, and how quickly they get you to a useful result. For your topic, compare against those four before locking a direction.";
    extra.push(
      makeStableFinding({
        title: "Comparison criteria",
        content: "Cost, control, learning curve, and time-to-useful-result.",
        kind: "option",
      }),
    );
  } else if (pack && collection.findings.length < 8) {
    const unused = pack.findings.filter(
      (f) => !collection.findings.some((c) => c.title === f.title),
    );
    if (unused.length) {
      const next = unused[0];
      extra.push(
        makeStableFinding({
          title: next.title,
          content: next.content,
          kind: next.kind,
        }),
      );
      answer = `${next.content}\n\nWhat would you like to understand next?`;
    } else {
      answer = `We’ve covered the main foundation for ${collection.topic}. I can go deeper on a specific part, compare options, or help you use what we’ve gathered.`;
    }
  } else {
    answer = `That makes sense. Building on what we have about ${collection.topic}: ${collection.summary || "the key themes so far"}.\n\nWhat do you want to explore next?`;
    extra.push(
      makeStableFinding({
        title: "Follow-up focus",
        content: userText,
        kind: "question",
      }),
    );
  }

  if (extra.length) {
    collection = addFindingsToCollection(collection, extra);
  }

  const notice = currentResearchNotice(session);
  const offer = shouldOfferUseThisResearch(session, collection, userText);
  const assistantMessage = [answer, notice && offer ? "" : null, notice]
    .filter((x) => x != null && x !== "")
    .join("\n");

  session = appendSessionTurn(session, {
    role: "assistant",
    content: assistantMessage,
    findingIdsAdded: extra.map((f) => f.id),
  });
  session = {
    ...session,
    lastUsefulSummary: collection.summary,
    currentStatus: offer ? "awaiting_use" : "conversing",
  };

  return {
    session,
    collection,
    assistantMessage,
    offerUseThisResearch: offer,
    autoOutcome: null,
    currentResearchNotice: notice,
  };
}

export function refreshCurrentResearch(
  session: ResearchSession,
  collection: ResearchCollectionRecord,
): {
  session: ResearchSession;
  collection: ResearchCollectionRecord;
  message: string;
} {
  const live = getLiveResearchProviderStatus();
  const now = new Date().toISOString();
  if (!live.liveResearchAvailable) {
    return {
      session: {
        ...session,
        currentResearchStatus: "current_research_unavailable",
        updatedAt: now,
      },
      collection: {
        ...collection,
        currentResearchStatus: "current_research_unavailable",
        retryState: "retry_current_research",
        updatedAt: now,
      },
      message:
        "Current research still isn’t available. Your Research Collection and notes are preserved. We can keep using stable knowledge, or retry current research later.",
    };
  }
  return {
    session: {
      ...session,
      currentResearchStatus: "current_research_completed",
      liveResearchAvailable: true,
      updatedAt: now,
    },
    collection: {
      ...collection,
      currentResearchStatus: "current_research_completed",
      freshness: "current",
      retryState: null,
      updatedAt: now,
    },
    message: "Current research completed. I’ve updated the Research Collection.",
  };
}
