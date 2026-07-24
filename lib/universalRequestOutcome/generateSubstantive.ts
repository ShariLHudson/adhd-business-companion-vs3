import type {
  CreationPackage,
  CreationPackageSection,
  DynamicCreationBlueprint,
  ResearchCollection,
  UniversalRequestUnderstanding,
  UniversalResearchStatus,
} from "./types";
import { buildDynamicCreationBlueprint } from "./dynamicBlueprint";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Production live web research is not wired in this environment. */
export function getLiveResearchProviderStatus(): {
  liveResearchAvailable: boolean;
  provider: string | null;
  note: string;
} {
  return {
    liveResearchAvailable: false,
    provider: null,
    note:
      "No production live web-research provider is configured in this environment. Stable instructional knowledge may be used and must be labeled honestly.",
  };
}

export function resolveResearchStatus(input: {
  requiresCurrentInformation: boolean;
  requiresResearch: boolean;
  liveAvailable: boolean;
  liveSucceeded: boolean;
  usedStableKnowledge: boolean;
}): UniversalResearchStatus {
  if (!input.requiresResearch && !input.requiresCurrentInformation) {
    return "not_required";
  }
  if (input.liveSucceeded) return "current_research_completed";
  if (input.liveAvailable && !input.liveSucceeded) {
    return input.usedStableKnowledge
      ? "current_research_partial"
      : "current_research_unavailable";
  }
  if (input.usedStableKnowledge) return "stable_knowledge_used";
  return "current_research_unavailable";
}

function section(
  title: string,
  content: string,
  order: number,
  kind: CreationPackageSection["kind"],
  metadata?: Record<string, unknown>,
): CreationPackageSection {
  return {
    id: newId("cps"),
    title,
    content,
    order,
    kind,
    metadata,
  };
}

function buildFiveDaySocialPlan(
  u: UniversalRequestUnderstanding,
  webinar: boolean,
): CreationPackageSection[] {
  const days = u.requestedDuration?.unit === "day" ? u.requestedDuration.value : 5;
  const themes = webinar
    ? [
        {
          topic: "Problem awareness — why this webinar matters",
          format: "Short video or carousel",
          caption:
            "Name the frustration your webinar solves in one plain sentence, then invite curiosity without pressure.",
          cta: "Save the date / join the waitlist",
          visual: "Simple problem → relief visual with webinar date",
        },
        {
          topic: "What you will learn",
          format: "Carousel or static graphic",
          caption:
            "List three concrete takeaways attendees will walk away with. Keep language practical, not hype.",
          cta: "Register for the free webinar",
          visual: "Three takeaway cards with icons",
        },
        {
          topic: "Social proof or story",
          format: "Story post or short testimonial graphic",
          caption:
            "Share a brief before/after moment or who this session is for, so the right people self-select.",
          cta: "See if this webinar is for you — register",
          visual: "Quote card or simple story slide",
        },
        {
          topic: "Objection handling / FAQ",
          format: "Text post or FAQ carousel",
          caption:
            "Answer time, cost, and “is this for beginners?” clearly. Reduce hesitation with honesty.",
          cta: "Reserve your seat",
          visual: "FAQ style with calm typography",
        },
        {
          topic: "Final reminder + registration push",
          format: "Countdown or reminder graphic",
          caption:
            "Remind people of the start time and the one outcome they will leave with. Keep the CTA singular.",
          cta: "Register now — seats are open",
          visual: "Date/time reminder with single button cue",
        },
      ]
    : [
        {
          topic: "Introduce a helpful idea",
          format: "Carousel or short video",
          caption:
            "Share one clear insight your audience can use today. Lead with the benefit, not your offer.",
          cta: "Save this for later / comment with your take",
          visual: "Clean tip card with one sentence takeaway",
        },
        {
          topic: "Show a practical example",
          format: "Static post or reel",
          caption:
            "Walk through a tiny example of the idea in action so people can picture themselves doing it.",
          cta: "Try this and tell me how it went",
          visual: "Before/after or simple how-it-works panel",
        },
        {
          topic: "Answer a common question",
          format: "Text + graphic",
          caption:
            "Name a frequent sticking point and answer it calmly. Position yourself as a steady guide.",
          cta: "Ask your question in the comments",
          visual: "Question-and-answer layout",
        },
        {
          topic: "Invite engagement or story",
          format: "Story prompt or poll",
          caption:
            "Invite a small share — a challenge, a win, or a preference — so the feed becomes a conversation.",
          cta: "Reply with one word that describes your week",
          visual: "Warm prompt graphic with open space",
        },
        {
          topic: "Soft offer or next step",
          format: "Single image or short video",
          caption:
            "Connect the week’s theme to a gentle next step — resource, list, or conversation — without hard sell.",
          cta: "Send me a message / grab the free resource",
          visual: "Simple next-step card with one action",
        },
      ];

  const sections: CreationPackageSection[] = [
    section(
      "Overall campaign purpose",
      webinar
        ? "Build awareness and trust across five days so the right people feel ready to register for the webinar."
        : "Build a coherent five-day social presence that teaches, engages, and invites one clear next step.",
      0,
      "overview",
    ),
    section(
      "Audience assumption",
      "Busy professionals who want practical help without noise. Adapt tone to your known Business Estate audience when available.",
      1,
      "note",
    ),
    section(
      "Content progression",
      "Day 1 opens the theme → Days 2–3 deepen usefulness → Day 4 reduces friction → Day 5 invites action.",
      2,
      "overview",
    ),
    section(
      "Engagement strategy",
      "Ask one easy question every other day. Reply to comments the same day when possible. Keep each post to one idea.",
      3,
      "note",
    ),
  ];

  for (let i = 0; i < days; i++) {
    const theme = themes[i % themes.length]!;
    const dayNum = i + 1;
    sections.push(
      section(
        `Day ${dayNum}`,
        [
          `Objective: Move the audience one step further in the ${dayNum === days ? "action" : "trust-building"} arc.`,
          `Topic: ${theme.topic}`,
          `Format: ${theme.format}`,
          `Caption framework: ${theme.caption}`,
          `Call to action: ${theme.cta}`,
          `Visual idea: ${theme.visual}`,
          `Platform adaptation: Keep the idea constant; shorten captions for Instagram, expand slightly for LinkedIn, and use a clear first line for Facebook.`,
        ].join("\n"),
        10 + i,
        "day",
        { day: dayNum },
      ),
    );
  }

  sections.push(
    section(
      "Adaptation notes",
      "If your offer, webinar date, or audience differs, keep the five-day arc and swap topics — do not collapse to a single post.",
      40,
      "note",
    ),
    section(
      "Optional metrics",
      "Track saves, comments, link clicks, and (for webinars) registration conversions — not vanity reach alone.",
      41,
      "metric",
    ),
  );

  return sections;
}

function buildStepByStepGuide(
  u: UniversalRequestUnderstanding,
): CreationPackageSection[] {
  const podcast = /\bpodcast\b/.test(u.normalizedRequest.toLowerCase());
  if (podcast) {
    const steps = [
      ["Clarify the show promise", "Name the audience and the one transformation each episode supports."],
      ["Choose a format", "Solo, interview, or hybrid — pick one default so production stays light."],
      ["Select essential equipment", "A clear USB mic, headphones, and a quiet recording space are enough to start."],
      ["Set up recording software", "Use a simple recorder (desktop or phone app) and test levels before episode one."],
      ["Outline episode one", "Hook, three points, and a close — keep the first episode shorter than you think."],
      ["Record a clean take", "Speak naturally, pause between sections, and avoid perfectionism on take one."],
      ["Edit lightly", "Remove long silence and mistakes; do not over-produce the first episodes."],
      ["Choose hosting", "Pick a host that gives an RSS feed and simple distribution to major apps."],
      ["Write show notes", "Title, short description, and one link — enough for discovery without overwhelm."],
      ["Distribute and submit", "Publish the RSS feed to Apple, Spotify, and other apps your audience uses."],
      ["Plan a simple launch", "Tell your list/social once with a clear listen link; invite one reply or review."],
      ["Create a repeatable episode cadence", "Weekly or biweekly — consistency beats intensity."],
    ];
    const sections: CreationPackageSection[] = [
      section(
        "Purpose",
        "Launch a podcast you can sustain — clear promise, simple gear, and a repeatable episode rhythm.",
        0,
        "overview",
      ),
      section(
        "What you need",
        "Microphone, quiet space, recording app, hosting account, and a short episode outline.",
        1,
        "section",
      ),
      section(
        "Preparation",
        "Write the show name, one-sentence promise, and episode-one outline before you buy more gear.",
        2,
        "section",
      ),
    ];
    steps.forEach(([title, body], i) => {
      sections.push(section(title!, body!, 10 + i, "step", { step: i + 1 }));
    });
    sections.push(
      section(
        "Common mistakes",
        "Overbuying gear, waiting for a perfect studio, and launching without a repeatable outline.",
        40,
        "note",
      ),
      section(
        "Troubleshooting",
        "Muddy audio: move closer to the mic and reduce room echo. No listings yet: confirm RSS submission and give apps 24–48 hours.",
        41,
        "note",
      ),
      section(
        "Completion check",
        "Episode one published, RSS live, at least one directory submitted, and a simple next-episode date chosen.",
        42,
        "checklist",
      ),
    );
    return sections;
  }

  // Generic instructional scaffold
  return [
    section("Purpose", u.desiredOutcome, 0, "overview"),
    section(
      "What you need",
      "Gather the tools, accounts, and information named in your request before the first action.",
      1,
      "section",
    ),
    section(
      "Preparation",
      "Clarify the finished result in one sentence so every step serves that outcome.",
      2,
      "section",
    ),
    section(
      "Step 1 — Begin with the first concrete action",
      "Do the smallest visible action that moves the work forward.",
      10,
      "step",
    ),
    section(
      "Step 2 — Continue in order",
      "Complete the middle sequence without jumping ahead to polish.",
      11,
      "step",
    ),
    section(
      "Step 3 — Review and finish",
      "Confirm the outcome matches your sentence, then save or share.",
      12,
      "step",
    ),
    section(
      "Completion check",
      "You can repeat the sequence without re-deriving the steps from scratch.",
      20,
      "checklist",
    ),
  ];
}

function buildProgramScaffold(
  u: UniversalRequestUnderstanding,
): CreationPackageSection[] {
  return [
    section("Purpose", u.desiredOutcome, 0, "overview"),
    section(
      "Roles",
      "Define mentors/leads, participants, and any adult supervisors with clear expectations.",
      1,
      "section",
    ),
    section(
      "Structure",
      "Outline phases: orientation → skill building → practice → showcase/reflection.",
      2,
      "section",
    ),
    section(
      "Training",
      "List the essential skills and how they will be taught (demo, practice, feedback).",
      3,
      "section",
    ),
    section(
      "Schedule",
      "Propose a realistic cadence (weekly sessions + milestones) that fits school calendars.",
      4,
      "section",
    ),
    section(
      "Safety",
      "Include supervision norms, tool safety, and escalation paths appropriate to minors.",
      5,
      "section",
    ),
    section(
      "Communication",
      "How volunteers, students, and families stay informed without channel chaos.",
      6,
      "section",
    ),
    section(
      "Evaluation",
      "Simple measures: attendance, skill demos, participant confidence, and mentor feedback.",
      7,
      "section",
    ),
  ];
}

function buildHandbookScaffold(
  u: UniversalRequestUnderstanding,
): CreationPackageSection[] {
  return [
    section("Welcome", `Welcome to this handbook — ${u.desiredOutcome}`, 0, "overview"),
    section(
      "Roles and expectations",
      "Who this handbook is for and what good participation looks like.",
      1,
      "section",
    ),
    section(
      "Core policies",
      "Attendance, communication, conduct, and how decisions get made.",
      2,
      "section",
    ),
    section(
      "Day-to-day procedures",
      "How work begins, how questions are asked, and how completion is confirmed.",
      3,
      "section",
    ),
    section(
      "Resources",
      "Tools, templates, and links volunteers or team members need most often.",
      4,
      "section",
    ),
    section(
      "Contacts",
      "Who to ask for help, and what belongs in writing vs conversation.",
      5,
      "section",
    ),
  ];
}

/**
 * Generate a substantive Creation Package from understanding + blueprint.
 * Exact templates optional — dynamic structure is enough for a useful first draft.
 */
export function generateCreationPackage(input: {
  understanding: UniversalRequestUnderstanding;
  blueprint?: DynamicCreationBlueprint;
  researchCollection?: ResearchCollection | null;
  sourceExperience?: string | null;
}): CreationPackage {
  const u = input.understanding;
  const blueprint = input.blueprint ?? buildDynamicCreationBlueprint(u);
  const live = getLiveResearchProviderStatus();
  const researchStatus = resolveResearchStatus({
    requiresCurrentInformation: u.requiresCurrentInformation,
    requiresResearch: u.requiresResearch,
    liveAvailable: live.liveResearchAvailable,
    liveSucceeded: false,
    usedStableKnowledge: true,
  });

  const webinar = /\bwebinar\b/.test(u.normalizedRequest.toLowerCase());
  let sections: CreationPackageSection[];
  if (u.creationFamily === "content_plan") {
    sections = buildFiveDaySocialPlan(u, webinar);
  } else if (
    u.creationFamily === "step_by_step_instructions" ||
    u.creationFamily === "guide"
  ) {
    sections = buildStepByStepGuide(u);
  } else if (u.creationFamily === "program") {
    sections = buildProgramScaffold(u);
  } else if (u.creationFamily === "handbook") {
    sections = buildHandbookScaffold(u);
  } else {
    sections = [
      section("Purpose", u.desiredOutcome, 0, "overview"),
      section(
        "Core content",
        `A first substantive draft for: ${u.normalizedRequest}`,
        1,
        "section",
      ),
      section(
        "Next steps",
        "Refine in Create, turn into a Project, or show structurally in Visual Thinking Studio.",
        2,
        "note",
      ),
    ];
  }

  if (researchStatus === "stable_knowledge_used") {
    sections.push(
      section(
        "Research status",
        "Built using stable instructional knowledge. Current live web research was not available in this environment — verify time-sensitive details before publishing.",
        90,
        "note",
        { researchStatus },
      ),
    );
  }

  const title =
    u.creationFamily === "content_plan" && u.requestedDuration?.unit === "day"
      ? `${u.requestedDuration.value}-Day Social Media Content Plan`
      : u.primaryDeliverable;

  const timestamp = nowIso();
  return {
    id: newId("cpkg"),
    title,
    purpose: u.desiredOutcome,
    audience: u.intendedAudience,
    desiredOutcome: u.desiredOutcome,
    requestUnderstandingId: u.id,
    blueprintId: blueprint.id,
    researchCollectionIds: input.researchCollection
      ? [input.researchCollection.id]
      : [],
    primaryDeliverableId: newId("cpd"),
    supportingDeliverableIds: [],
    sections,
    knowledgeItemIds: [],
    sourceReferences: input.researchCollection?.sourceReferences ?? [],
    status: "substantive",
    completionAssessment: "Substantive first draft generated from dynamic blueprint.",
    validationResults: [],
    researchStatus,
    sourceExperience: input.sourceExperience ?? null,
    currentDestination: null,
    availableHandoffs: [],
    linkedProjectId: null,
    linkedVisualWorkspaceId: null,
    linkedStrategyId: null,
    linkedEstateRecords: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
