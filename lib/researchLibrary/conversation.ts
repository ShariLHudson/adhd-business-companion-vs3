import type {
  ResearchCollectionRecord,
  ResearchFindingRecord,
  ResearchSession,
} from "./types";

/**
 * Topic packs — authored framework guidance for the Research Library.
 *
 * The canned conversation engine that once consumed these (startResearch /
 * continueResearchConversation and their helpers) was retired in RL-4; the
 * Research Library now runs on the shared engine (`runResearch`). The packs
 * remain the single source of that framework content: `researchLibraryConfig`
 * reads them (via `pickTopicPack`) and surfaces them to the shared engine as
 * `built_in_guidance` — never as citations. They live here, unduplicated.
 */
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

/**
 * Retry current research. Live retrieval is not connected yet (Stage 3B), so
 * this is honestly a no-op that preserves the collection and marks it
 * retryable — it never fabricates a "current research completed" success. The
 * genuine live path is implemented when a real provider lands, alongside the
 * shared engine's Sources mode.
 */
export function refreshCurrentResearch(
  session: ResearchSession,
  collection: ResearchCollectionRecord,
): {
  session: ResearchSession;
  collection: ResearchCollectionRecord;
  message: string;
} {
  const now = new Date().toISOString();
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
