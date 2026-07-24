import type {
  ResearchCollectionRecord,
  ResearchSession,
  ResearchUseOption,
} from "./types";

/**
 * Infer ~3–5 relevant Use This Research options. Never dump the full catalog.
 */
export function inferResearchUseOptions(input: {
  collection: ResearchCollectionRecord;
  session?: ResearchSession | null;
  userPurpose?: string | null;
}): ResearchUseOption[] {
  const topic = input.collection.topic.toLowerCase();
  const purpose = (
    input.userPurpose ||
    input.collection.intendedOutcome ||
    input.session?.intendedOutcome ||
    input.collection.purpose ||
    ""
  ).toLowerCase();
  const findings = input.collection.findings;
  const hasComparison =
    input.collection.options.length > 1 ||
    input.collection.comparisons.length > 0 ||
    /\bcompare|options?\b/.test(topic + purpose);
  const hasSequence =
    /\blaunch|step|process|onboard|plan|day|week\b/.test(topic + purpose) ||
    findings.some((f) => /step|phase|stage/i.test(f.content));
  const hasStrategy =
    /\bstrateg|recruit|direction|priorit/i.test(topic + purpose);
  const hasBusiness =
    /\bbusiness|offer|audience|market|client|advisor/i.test(topic + purpose);

  const options: ResearchUseOption[] = [];

  const push = (opt: ResearchUseOption) => {
    if (options.some((o) => o.id === opt.id)) return;
    options.push(opt);
  };

  if (/advisory\s*board/.test(topic)) {
    push({
      id: "advisory_plan",
      label: "Create an Advisory Board Plan",
      description: "Turn the research into a practical plan for building a board.",
      outcomeType: "plan",
      destination: "create",
      reason: "Topic and findings support a structured plan.",
      confidence: 0.92,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "advisor_roles",
      label: "Draft Role and Responsibility Document",
      description: "Clarify what advisors are asked to do.",
      outcomeType: "document",
      destination: "create",
      reason: "Role clarity is a common next step from this research.",
      confidence: 0.88,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "advisor_invite",
      label: "Draft an Advisor Invitation Package",
      description: "Create something you can send when inviting advisors.",
      outcomeType: "document",
      destination: "create",
      reason: "Recruitment often follows understanding the board model.",
      confidence: 0.84,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "advisory_strategy",
      label: "Add This to Strategic Planning",
      description: "Carry evidence and options into Strategic Planning as proposals.",
      outcomeType: "strategy",
      destination: "strategic_planning",
      reason: "Advisory boards often shape business direction.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "advisory_visual",
      label: "Show the Advisory Structure Visually",
      description: "Open Visual Thinking Studio with roles and relationships.",
      outcomeType: "visual_map",
      destination: "visual_thinking",
      reason: "Structure and relationships are easier to see than read.",
      confidence: 0.78,
      primary: false,
      requiresClarification: false,
    });
  } else if (/podcast/.test(topic)) {
    push({
      id: "podcast_guide",
      label: "Create a Step-by-Step Launch Guide",
      description: "Organize the research into ordered launch steps.",
      outcomeType: "guide",
      destination: "create",
      reason: "Launch research maps cleanly to a guide.",
      confidence: 0.93,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "podcast_project",
      label: "Build a Podcast Launch Project",
      description: "Propose phases and tasks for review before creating a project.",
      outcomeType: "project",
      destination: "projects",
      reason: "Launch work benefits from execution structure.",
      confidence: 0.88,
      primary: false,
      requiresClarification: false,
    });
    if (hasComparison || /equipment|platform|host/.test(topic + purpose)) {
      push({
        id: "podcast_compare",
        label: "Compare Equipment and Platforms",
        description: "Organize options side by side.",
        outcomeType: "comparison",
        destination: "create",
        reason: "Comparison signals are present.",
        confidence: 0.82,
        primary: false,
        requiresClarification: false,
      });
    }
    push({
      id: "podcast_visual",
      label: "Show the Launch Process Visually",
      description: "Project the process into Visual Thinking Studio.",
      outcomeType: "visual_map",
      destination: "visual_thinking",
      reason: "Process research is strong for a visual sequence.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
  } else if (/webinar|social\s*media|content/.test(topic + purpose)) {
    push({
      id: "content_plan",
      label: "Create a Five-Day Content Plan",
      description: "Turn promotion research into a coordinated short plan.",
      outcomeType: "plan",
      destination: "create",
      reason: "Promotion research often becomes a timed content plan.",
      confidence: 0.9,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "campaign_strategy",
      label: "Build a Campaign Strategy",
      description: "Carry evidence into a strategy proposal.",
      outcomeType: "strategy",
      destination: "strategic_planning",
      reason: "Campaign work benefits from strategic framing.",
      confidence: 0.84,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "posting_project",
      label: "Create a Posting Project",
      description: "Propose tasks for review in Projects.",
      outcomeType: "project",
      destination: "projects",
      reason: "Execution structure helps keep the campaign moving.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
    if (hasComparison) {
      push({
        id: "platform_compare",
        label: "Compare Platforms",
        description: "Organize channel options from the research.",
        outcomeType: "comparison",
        destination: "create",
        reason: "Multiple options appear in the findings.",
        confidence: 0.76,
        primary: false,
        requiresClarification: false,
      });
    }
  } else {
    if (hasSequence) {
      push({
        id: "generic_guide",
        label: "Create a Step-by-Step Guide",
        description: "Organize findings into an ordered guide.",
        outcomeType: "guide",
        destination: "create",
        reason: "Sequence signals are present in the research.",
        confidence: 0.86,
        primary: true,
        requiresClarification: false,
      });
    } else {
      push({
        id: "generic_summary",
        label: "Create a Clear Summary Document",
        description: "Capture the useful findings in a shareable document.",
        outcomeType: "document",
        destination: "create",
        reason: "A document is a safe, useful first format.",
        confidence: 0.82,
        primary: true,
        requiresClarification: false,
      });
    }
    push({
      id: "generic_list",
      label: "Make a Prioritized List",
      description: "Pull out the most useful next actions or findings.",
      outcomeType: "list",
      destination: "create",
      reason: "Lists reduce cognitive load after research.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
    if (hasStrategy) {
      push({
        id: "generic_strategy",
        label: "Draft a Strategy Proposal",
        description: "Carry evidence, options, and risks into Strategic Planning.",
        outcomeType: "strategy",
        destination: "strategic_planning",
        reason: "Strategic signals are present.",
        confidence: 0.78,
        primary: false,
        requiresClarification: false,
      });
    }
    push({
      id: "generic_project",
      label: "Turn This into a Project Proposal",
      description: "Propose phases and tasks for review before creating a project.",
      outcomeType: "project",
      destination: "projects",
      reason: "Actionable findings can become execution.",
      confidence: 0.75,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "generic_visual",
      label: "Show This Visually",
      description: "Open Visual Thinking Studio with the research content.",
      outcomeType: "visual_map",
      destination: "visual_thinking",
      reason: "Relationships and structure may be clearer visually.",
      confidence: 0.72,
      primary: false,
      requiresClarification: false,
    });
  }

  if (hasBusiness) {
    push({
      id: "estate_review",
      label: "Review in My Business Estate",
      description: "Propose relevant notes or updates — nothing changes without approval.",
      outcomeType: "estate_note",
      destination: "business_estate",
      reason: "Findings may relate to business foundation.",
      confidence: 0.7,
      primary: false,
      requiresClarification: false,
    });
  }

  push({
    id: "keep_researching",
    label: "Keep Researching",
    description: "Stay in the Research Library and continue the conversation.",
    outcomeType: "continue",
    destination: "stay",
    reason: "Research remains useful without creating anything.",
    confidence: 0.95,
    primary: false,
    requiresClarification: false,
  });

  // Cap at 5, keep primary + highest confidence
  const primary = options.find((o) => o.primary);
  const rest = options
    .filter((o) => o.id !== primary?.id)
    .sort((a, b) => b.confidence - a.confidence);
  const selected = [
    ...(primary ? [primary] : []),
    ...rest,
  ].slice(0, 5);

  return selected;
}

export function shouldAskAboutFormat(input: {
  collection: ResearchCollectionRecord;
  session: ResearchSession;
  userAskedWhatNext?: boolean;
}): boolean {
  if (input.session.intendedOutcome) return false;
  if (input.collection.findings.length < 3) return false;
  if (input.session.currentStatus === "conversing") {
    return Boolean(input.userAskedWhatNext);
  }
  return (
    input.userAskedWhatNext ||
    input.session.currentStatus === "awaiting_use" ||
    input.collection.findings.length >= 6
  );
}
