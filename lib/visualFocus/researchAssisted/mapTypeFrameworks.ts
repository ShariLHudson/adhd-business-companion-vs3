/**
 * Map-type research frameworks.
 *
 * For each map type, Spark contributes a well-formed *starting framework* that
 * matches how that kind of map is normally structured — not one template reused
 * everywhere. These are honest scaffolds: structure is high/moderate confidence,
 * anything that depends on the member's specific tools/account/context is marked
 * "needs-confirmation" rather than guessed.
 *
 * The frameworks are deterministic and offline-safe. They do not fabricate
 * external citations; the recorded source is Spark's built-in estate knowledge.
 */

import type { VisualFocusMode } from "../types";
import type {
  MapDetailLevel,
  ResearchConfidence,
} from "./types";

/** A researched branch: a heading plus optional child steps/points. */
export type FrameworkSection = {
  label: string;
  children: string[];
  confidence: ResearchConfidence;
};

export type MapFramework = {
  sections: FrameworkSection[];
  assumptions: string[];
  unresolvedQuestions: string[];
  /** Whether the subject is time-sensitive (tools/regulations/market). */
  timeSensitive: boolean;
};

function depthChildren(
  base: string[],
  detail: MapDetailLevel,
  detailedExtras: string[] = [],
): string[] {
  if (detail === "overview") return [];
  if (detail === "working") return base;
  return [...base, ...detailedExtras];
}

/** True when the topic reads like a software/tool how-to (freshness matters). */
function looksToolCentric(topic: string): boolean {
  return /\b(loom|zoom|teams|meet|canva|notion|figma|slack|software|app|tool|account|settings|plugin|integration|api|website|wordpress|shopify)\b/i.test(
    topic,
  );
}

/* ------------------------------ Process Map ------------------------------ */

function loomProcessFramework(detail: MapDetailLevel): MapFramework {
  const sections: FrameworkSection[] = [
    {
      label: "1. Clarify the purpose of the video",
      children: depthChildren(
        ["Define who it is for", "Decide the one outcome it should create"],
        detail,
        ["Write a one-line goal you can check against later"],
      ),
      confidence: "high",
    },
    {
      label: "2. Prepare what you want to show",
      children: depthChildren(
        ["Open the tabs or files you'll show", "Close private or distracting windows"],
        detail,
        ["Draft a short opening and closing", "Decide if the camera should be on"],
      ),
      confidence: "high",
    },
    {
      label: "3. Open Loom and choose recording settings",
      children: depthChildren(
        ["Pick screen, camera, or both", "Choose which screen or window"],
        detail,
        ["Set resolution and countdown if available"],
      ),
      confidence: "needs-confirmation",
    },
    {
      label: "4. Test microphone, camera, and screen",
      children: depthChildren(
        ["Confirm the right mic is selected", "Check lighting and framing"],
        detail,
        ["Record a five-second test and play it back"],
      ),
      confidence: "moderate",
    },
    {
      label: "5. Record the video",
      children: depthChildren(
        ["Start recording", "Speak to the outcome, not every detail"],
        detail,
        ["Pause and resume if the tool allows"],
      ),
      confidence: "high",
    },
    {
      label: "6. Review and trim the recording",
      children: depthChildren(
        ["Watch it back once", "Trim the start and end"],
        detail,
        ["Cut long pauses or mistakes"],
      ),
      confidence: "moderate",
    },
    {
      label: "7. Add a title, description, or call to action",
      children: depthChildren(
        ["Write a clear title", "Add a short description"],
        detail,
        ["Add a call to action if the viewer should do something"],
      ),
      confidence: "high",
    },
    {
      label: "8. Set sharing permissions",
      children: depthChildren(
        ["Choose who can view", "Decide if a link or workspace share fits"],
        detail,
        ["Check whether viewers need an account"],
      ),
      confidence: "needs-confirmation",
    },
    {
      label: "9. Copy and send the link",
      children: depthChildren(
        ["Copy the share link", "Send it where the viewer will see it"],
        detail,
      ),
      confidence: "high",
    },
    {
      label: "10. Confirm the viewer can access it",
      children: depthChildren(
        ["Open the link in a private window to test", "Ask the viewer to confirm"],
        detail,
      ),
      confidence: "moderate",
    },
  ];

  const trimmed =
    detail === "overview" ? condense(sections, 7) : sections;

  return {
    sections: trimmed,
    assumptions: [
      "You have a Loom account and can install or open it.",
    ],
    unresolvedQuestions: [
      "Which Loom plan are you on? Sharing and workspace permissions vary by plan.",
    ],
    timeSensitive: true,
  };
}

function genericProcessFramework(
  topic: string,
  detail: MapDetailLevel,
): MapFramework {
  const sections: FrameworkSection[] = [
    {
      label: "1. Clarify the goal and starting point",
      children: depthChildren(
        ["Define what 'done' looks like", "Note what triggers this process"],
        detail,
        ["Identify who owns the process"],
      ),
      confidence: "high",
    },
    {
      label: "2. Prepare what you need",
      children: depthChildren(
        ["Gather inputs, tools, or information", "Remove obvious blockers"],
        detail,
        ["List prerequisites that must be true first"],
      ),
      confidence: "moderate",
    },
    {
      label: "3. Do the core steps in order",
      children: depthChildren(
        ["First working step", "Middle steps", "Final step before review"],
        detail,
        ["Note where a decision or branch happens"],
      ),
      confidence: "moderate",
    },
    {
      label: "4. Check the result",
      children: depthChildren(
        ["Confirm quality against the goal", "Fix anything that fell short"],
        detail,
        ["Add a simple quality check or checklist"],
      ),
      confidence: "high",
    },
    {
      label: "5. Deliver, share, or hand off",
      children: depthChildren(
        ["Send it where it needs to go", "Confirm it was received"],
        detail,
        ["Note common failure points and how to recover"],
      ),
      confidence: "moderate",
    },
  ];
  return {
    sections,
    assumptions: [
      "This is a general working structure — your real steps may differ.",
    ],
    unresolvedQuestions: [
      "Are there decision points or exceptions unique to how you do this?",
    ],
    timeSensitive: looksToolCentric(topic),
  };
}

/* ------------------------------ Decision Map ----------------------------- */

function decisionFramework(topic: string, detail: MapDetailLevel): MapFramework {
  const sections: FrameworkSection[] = [
    {
      label: "Options to compare",
      children: depthChildren(
        ["Option A", "Option B", "Option C (or do nothing)"],
        detail,
        ["A reversible smaller version of the choice"],
      ),
      confidence: "needs-confirmation",
    },
    {
      label: "Criteria that matter",
      children: depthChildren(
        ["Cost", "Time or effort", "Fit with your goals"],
        detail,
        ["Risk", "Reversibility"],
      ),
      confidence: "high",
    },
    {
      label: "Tradeoffs and risks",
      children: depthChildren(
        ["What each option gives up", "What could go wrong"],
        detail,
        ["Which risks are recoverable vs. permanent"],
      ),
      confidence: "moderate",
    },
    {
      label: "A suggested next step (you decide)",
      children: depthChildren(
        ["The strongest option on today's criteria", "One small way to test it"],
        detail,
      ),
      confidence: "moderate",
    },
  ];
  return {
    sections,
    assumptions: [
      "The options above are placeholders until you name the real ones.",
    ],
    unresolvedQuestions: [
      "Which criterion matters most to you right now?",
    ],
    timeSensitive: false,
  };
}

/* ---------------------------- Relationship Map --------------------------- */

function relationshipFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "People and roles",
        children: depthChildren(
          ["Who is at the center", "Key people involved"],
          detail,
          ["What each person is responsible for"],
        ),
        confidence: "needs-confirmation",
      },
      {
        label: "Organizations and stakeholders",
        children: depthChildren(
          ["Teams or companies involved", "Who has a stake in the outcome"],
          detail,
        ),
        confidence: "moderate",
      },
      {
        label: "Dependencies and influence",
        children: depthChildren(
          ["Who depends on whom", "Where influence flows"],
          detail,
          ["Communication paths that must stay open"],
        ),
        confidence: "moderate",
      },
      {
        label: "Gaps or missing relationships",
        children: depthChildren(
          ["A connection that should exist but doesn't", "Where tension shows up"],
          detail,
        ),
        confidence: "needs-confirmation",
      },
    ],
    assumptions: [
      "For private relationships, only you can fill in the real people.",
    ],
    unresolvedQuestions: ["Who is missing from this picture?"],
    timeSensitive: false,
  };
}

/* ------------------------------ Journey Map ------------------------------ */

function journeyFramework(detail: MapDetailLevel): MapFramework {
  const stages = ["Awareness", "Consideration", "Decision", "Onboarding", "Growth"];
  return {
    sections: stages.map((stage) => ({
      label: stage,
      children: depthChildren(
        ["Goal at this stage", "What they do"],
        detail,
        ["What they feel", "Friction or drop-off", "An opportunity to help"],
      ),
      confidence: stage === "Onboarding" || stage === "Growth" ? "moderate" : "high",
    })),
    assumptions: [
      "These are common industry stages — your real users may move differently.",
    ],
    unresolvedQuestions: [
      "Do you have actual user evidence, or should we treat this as a pattern for now?",
    ],
    timeSensitive: false,
  };
}

/* ------------------------------ Timeline Map ----------------------------- */

function timelineFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "Beginning — set the foundation",
        children: depthChildren(["First milestone", "What must be ready"], detail, [
          "Rough duration",
        ]),
        confidence: "moderate",
      },
      {
        label: "Build phase — core work",
        children: depthChildren(["Middle milestones", "Dependencies to watch"], detail, [
          "Estimated durations",
        ]),
        confidence: "moderate",
      },
      {
        label: "Launch / delivery window",
        children: depthChildren(["Go-live milestone", "Final checks"], detail),
        confidence: "needs-confirmation",
      },
      {
        label: "After — follow-through",
        children: depthChildren(["Wrap-up", "Review and next cycle"], detail),
        confidence: "moderate",
      },
    ],
    assumptions: ["Durations are estimates until you set real dates."],
    unresolvedQuestions: ["What is your fixed deadline, if any?"],
    timeSensitive: true,
  };
}

/* ------------------------------ Strategy Map ----------------------------- */

function strategyFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "Goal / vision",
        children: depthChildren(["Where you want to be", "Why it matters now"], detail),
        confidence: "high",
      },
      {
        label: "Strategic pillars",
        children: depthChildren(
          ["Pillar 1", "Pillar 2", "Pillar 3"],
          detail,
          ["The capability each pillar needs"],
        ),
        confidence: "moderate",
      },
      {
        label: "Initiatives",
        children: depthChildren(
          ["A few concrete initiatives", "Who leads each"],
          detail,
          ["Sequencing — what comes first"],
        ),
        confidence: "moderate",
      },
      {
        label: "Measures and assumptions",
        children: depthChildren(
          ["How you'll know it's working", "Key assumptions to watch"],
          detail,
          ["Biggest risks to the plan"],
        ),
        confidence: "moderate",
      },
    ],
    assumptions: ["A strategy is not a task list — these pillars still need your judgment."],
    unresolvedQuestions: ["Which pillar is most fragile if an assumption is wrong?"],
    timeSensitive: false,
  };
}

/* ---------------------------- Opportunity Map ---------------------------- */

function opportunityFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "Needs and problems",
        children: depthChildren(["A real pain point", "Who feels it most"], detail, [
          "How they solve it today",
        ]),
        confidence: "moderate",
      },
      {
        label: "Trends and gaps (hypotheses)",
        children: depthChildren(["A shift worth riding", "An underserved audience"], detail),
        confidence: "needs-confirmation",
      },
      {
        label: "Potential offers",
        children: depthChildren(["Offer idea", "Rough shape of it"], detail, [
          "What would make it different",
        ]),
        confidence: "moderate",
      },
      {
        label: "Validation questions",
        children: depthChildren(
          ["What must be true for this to work", "Cheapest way to test it"],
          detail,
        ),
        confidence: "high",
      },
    ],
    assumptions: ["Items marked as trends are hypotheses, not confirmed evidence."],
    unresolvedQuestions: ["What evidence would make you confident enough to act?"],
    timeSensitive: true,
  };
}

/* ------------------------------ System Map ------------------------------- */

function systemFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "Components",
        children: depthChildren(["Main parts of the system", "What each part does"], detail),
        confidence: "moderate",
      },
      {
        label: "Inputs and outputs",
        children: depthChildren(["What comes in", "What comes out"], detail, [
          "Where information enters",
        ]),
        confidence: "moderate",
      },
      {
        label: "Flows and feedback loops",
        children: depthChildren(["How work moves through", "Where loops form"], detail),
        confidence: "moderate",
      },
      {
        label: "Bottlenecks and boundaries",
        children: depthChildren(["Where things slow down", "What sits outside the system"], detail, [
          "External influences",
        ]),
        confidence: "needs-confirmation",
      },
    ],
    assumptions: ["The components are a starting view — your system may have more."],
    unresolvedQuestions: ["Where does work most often get stuck?"],
    timeSensitive: false,
  };
}

/* ------------------------------ Priority Map ----------------------------- */

function priorityFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "Items to compare",
        children: depthChildren(["Item 1", "Item 2", "Item 3"], detail, ["Item 4"]),
        confidence: "needs-confirmation",
      },
      {
        label: "Criteria",
        children: depthChildren(["Impact", "Urgency", "Effort"], detail, ["Risk", "Your values"]),
        confidence: "high",
      },
      {
        label: "How the score is formed",
        children: depthChildren(
          ["High impact + low effort rises first", "Urgent-but-low-impact gets watched, not chased"],
          detail,
        ),
        confidence: "moderate",
      },
      {
        label: "Suggested focus (you confirm)",
        children: depthChildren(["The item that scores highest today"], detail),
        confidence: "moderate",
      },
    ],
    assumptions: ["Scores depend on your real items and weights."],
    unresolvedQuestions: ["Which single outcome matters most this month?"],
    timeSensitive: false,
  };
}

/* -------------------------------- Mind Map ------------------------------- */

function mindFramework(detail: MapDetailLevel): MapFramework {
  return {
    sections: [
      {
        label: "Major concepts",
        children: depthChildren(["Core theme 1", "Core theme 2", "Core theme 3"], detail, [
          "A supporting idea for each",
        ]),
        confidence: "moderate",
      },
      {
        label: "Subtopics and examples",
        children: depthChildren(["A concrete example", "A variation"], detail),
        confidence: "moderate",
      },
      {
        label: "Related questions to explore",
        children: depthChildren(["An open question", "Something to research later"], detail),
        confidence: "high",
      },
    ],
    assumptions: ["These branches are prompts — reshape them to fit your thinking."],
    unresolvedQuestions: ["Which branch do you most want to expand?"],
    timeSensitive: false,
  };
}

/** Keep only the first N sections (used to condense to overview). */
function condense(sections: FrameworkSection[], max: number): FrameworkSection[] {
  return sections.slice(0, max);
}

/**
 * Produce the research framework for a map type + detail level, lightly
 * specialized by topic where it helps (e.g. Loom video → real process steps).
 */
export function buildMapFramework(
  mode: VisualFocusMode,
  topic: string,
  detail: MapDetailLevel,
): MapFramework {
  const t = topic.toLowerCase();
  switch (mode) {
    case "process-map":
      if (/\bloom\b/.test(t) || (/\bvideo\b/.test(t) && /(record|screen|share)/.test(t))) {
        return loomProcessFramework(detail);
      }
      return genericProcessFramework(topic, detail);
    case "decision-tree":
      return decisionFramework(topic, detail);
    case "relationship-map":
      return relationshipFramework(detail);
    case "journey-map":
      return journeyFramework(detail);
    case "timeline-map":
      return timelineFramework(detail);
    case "strategy-map":
      return strategyFramework(detail);
    case "opportunity-map":
      return opportunityFramework(detail);
    case "system-map":
      return systemFramework(detail);
    case "priority-map":
      return priorityFramework(detail);
    case "project-map":
      return genericProcessFramework(topic, detail);
    case "mind-map":
    default:
      return mindFramework(detail);
  }
}
