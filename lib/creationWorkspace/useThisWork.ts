import type { CreationWorkspace, CreationWorkspaceUseOption } from "./types";

/**
 * Infer ~3–5 destination options for Use This Work.
 */
export function inferUseThisWorkOptions(
  workspace: CreationWorkspace,
): CreationWorkspaceUseOption[] {
  const title = `${workspace.title} ${workspace.purpose} ${workspace.primaryOutcome}`.toLowerCase();
  const options: CreationWorkspaceUseOption[] = [];

  const push = (opt: CreationWorkspaceUseOption) => {
    if (options.some((o) => o.id === opt.id)) return;
    options.push(opt);
  };

  if (/social|content plan|campaign|webinar/.test(title)) {
    push({
      id: "create_plan",
      label: "Continue Editing in Create",
      description: "Open the full plan as an editable written asset.",
      destination: "create",
      reason: "Written content plan is ready for polish.",
      confidence: 0.93,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "project_posting",
      label: "Build the Posting Project",
      description: "Propose phases and tasks for review before creating a project.",
      destination: "projects",
      reason: "Execution structure helps keep the campaign moving.",
      confidence: 0.88,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "strategy_marketing",
      label: "Add to Marketing Strategy",
      description: "Carry campaign choices into Strategic Planning as proposals.",
      destination: "strategic_planning",
      reason: "Campaign work often shapes marketing direction.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "visual_campaign",
      label: "Show the Campaign Visually",
      description: "Open Visual Thinking Studio with the substantive plan.",
      destination: "visual_thinking",
      reason: "Sequence and channels are clearer visually.",
      confidence: 0.78,
      primary: false,
      requiresClarification: false,
    });
  } else if (/volunteer|handbook/.test(title)) {
    push({
      id: "create_handbook",
      label: "Finish as a Document in Create",
      description: "Open the full handbook for formatting and final polish.",
      destination: "create",
      reason: "Handbooks belong in Create as written assets.",
      confidence: 0.94,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "project_onboarding",
      label: "Build the Volunteer Onboarding Project",
      description: "Propose implementation tasks for review.",
      destination: "projects",
      reason: "Handbooks often need an execution path.",
      confidence: 0.86,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "create_forms",
      label: "Create Supporting Forms",
      description: "Keep developing forms from the handbook sections.",
      destination: "create",
      reason: "Supporting forms commonly follow handbook drafts.",
      confidence: 0.76,
      primary: false,
      requiresClarification: false,
    });
  } else if (/podcast|launch guide|step/.test(title)) {
    push({
      id: "create_guide",
      label: "Open as a Guide in Create",
      description: "Continue the guide as a polished document.",
      destination: "create",
      reason: "Guides finish well in Create.",
      confidence: 0.92,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "project_launch",
      label: "Build a Podcast Launch Project",
      description: "Propose launch phases and tasks for approval.",
      destination: "projects",
      reason: "Launch work benefits from execution structure.",
      confidence: 0.87,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "visual_process",
      label: "Show the Process Visually",
      description: "Project steps into Visual Thinking Studio.",
      destination: "visual_thinking",
      reason: "Process guides map cleanly to visuals.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
  } else if (/advisory|mentor|onboarding|program/.test(title)) {
    push({
      id: "create_program",
      label: "Finish the Written Program in Create",
      description: "Open the full program document for polish.",
      destination: "create",
      reason: "Program narrative belongs in Create.",
      confidence: 0.9,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "project_impl",
      label: "Build the Implementation Project",
      description: "Propose phases and tasks — review required.",
      destination: "projects",
      reason: "Programs usually need execution planning.",
      confidence: 0.88,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "strategy",
      label: "Add to Strategic Planning",
      description: "Carry objectives and options as proposals.",
      destination: "strategic_planning",
      reason: "Programs often shape direction.",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "visual",
      label: "Show Structure Visually",
      description: "Open Visual Thinking with roles and relationships.",
      destination: "visual_thinking",
      reason: "Structure is easier to see than read.",
      confidence: 0.78,
      primary: false,
      requiresClarification: false,
    });
  } else {
    push({
      id: "create_default",
      label: "Continue Editing in Create",
      description: "Open the full content as an editable asset.",
      destination: "create",
      reason: "Create owns polished written assets.",
      confidence: 0.88,
      primary: true,
      requiresClarification: false,
    });
    push({
      id: "project_default",
      label: "Turn Into a Project Proposal",
      description: "Infer phases and tasks for review before creating records.",
      destination: "projects",
      reason: "Actionable work can become execution.",
      confidence: 0.78,
      primary: false,
      requiresClarification: false,
    });
    push({
      id: "visual_default",
      label: "Show This Visually",
      description: "Pass the substantive package to Visual Thinking Studio.",
      destination: "visual_thinking",
      reason: "Structure may be clearer visually.",
      confidence: 0.72,
      primary: false,
      requiresClarification: false,
    });
  }

  if (/business|audience|offer|mission|positioning/.test(title)) {
    push({
      id: "estate",
      label: "Propose Business Estate Updates",
      description: "Nothing changes without field-level approval.",
      destination: "business_estate",
      reason: "Findings may touch authoritative business information.",
      confidence: 0.7,
      primary: false,
      requiresClarification: false,
    });
  }

  push({
    id: "research",
    label: "Return to Research",
    description: "Continue researching without losing this workspace.",
    destination: "research_library",
    reason: "Research and creation stay linked.",
    confidence: 0.85,
    primary: false,
    requiresClarification: false,
  });

  push({
    id: "save",
    label: "Save as Working Material",
    description: "Keep the workspace for later without a destination handoff.",
    destination: "save",
    reason: "Saving preserves momentum without forcing a destination.",
    confidence: 0.9,
    primary: false,
    requiresClarification: false,
  });

  const primary = options.find((o) => o.primary);
  const rest = options
    .filter((o) => o.id !== primary?.id)
    .sort((a, b) => b.confidence - a.confidence);
  return [...(primary ? [primary] : []), ...rest].slice(0, 5);
}
