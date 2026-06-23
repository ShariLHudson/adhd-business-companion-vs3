export type WorkspaceAreaWorkflow = {
  id: string;
  steps: string[];
  tip?: string;
};

export const WORKSPACE_AREA_WORKFLOWS: Record<string, WorkspaceAreaWorkflow> = {
  "plan-my-day": {
    id: "plan-my-day",
    steps: [
      "Add what matters today — quick capture or pull from projects.",
      "Pick a view that fits your brain (List, Timeline, Cards, or Kanban).",
      "Move one item to Doing when you're ready to start.",
      "Open an item for duration, notes, or a linked momentum appointment.",
      "Park what isn't happening today — nothing gets deleted.",
      "Mark done when finished; reference items can stay visible if helpful.",
    ],
    tip: "Low energy? List keeps today simple. Open Visual Focus when you want to think spatially.",
  },
  "visual-focus": {
    id: "visual-focus",
    steps: [
      "Choose how you want to think — mind map, decision tree, project map, and more.",
      "Create a new map or open a saved one.",
      "Add branches, clusters, and connections as ideas unfold.",
      "Use Visual Kanban when you want flexible grouping beyond task columns.",
      "Chat stays open for coaching while you organize visually.",
    ],
    tip: "Visual Focus is for thinking — Plan My Day is for today's tasks.",
  },
  "brain-dump": {
    id: "brain-dump",
    steps: [
      "Capture — add as many thoughts as you want; separate with commas.",
      "If offered Smart Split, choose Separate Them or Keep As Entered.",
      "Tap See what's held to open the Mental Landscape.",
      "Tap a cluster, then View thoughts when you're ready.",
      "Select a thought for actions — schedule, move to project, keep here, and more.",
      "Tap Add More Thoughts anytime to continue the same session.",
    ],
    tip: "Relief first — you choose when to view thoughts or take action.",
  },
  projects: {
    id: "projects",
    steps: [
      "Create or open a project — your filing cabinet for one piece of work.",
      "Add a next action so you always know where to start.",
      "Expand only the section you need (tasks, notes, files, time).",
      "Schedule a momentum appointment when you're ready to work on it.",
      "Chat with Shari beside the project when you want help thinking it through.",
    ],
    tip: "One clear next action beats a long task list.",
  },
  "templates-library": {
    id: "templates-library",
    steps: [
      "Choose audience, tone, and template type.",
      "Browse saved templates or generate fresh ideas.",
      "Build With Shari to adapt a template in conversation.",
      "Agree on direction before anything opens in Create.",
      "Save frameworks you want to reuse later.",
    ],
    tip: "Templates are starting points — not finished documents.",
  },
  snippets: {
    id: "snippets",
    steps: [
      "Choose audience and voice tone.",
      "Generate snippet ideas for emails, posts, newsletters, and more.",
      "Save the lines you like for quick reuse.",
      "Copy or build with Shari when you need a full piece.",
    ],
    tip: "Snippets are small blocks — perfect when a full draft feels heavy.",
  },
  "client-avatars": {
    id: "client-avatars",
    steps: [
      "Create an avatar for who you help — one question at a time.",
      "Set a primary avatar so Shari adapts tone and examples.",
      "Edit anytime as your offer or audience sharpens.",
      "Use avatars when creating content, emails, and strategies.",
    ],
    tip: "A clear avatar makes every draft feel written for someone real.",
  },
  playbook: {
    id: "playbook",
    steps: [
      "Pick ADHD Strategies when you need a technique right now.",
      "Pick Business Strategies when you want a plan built with Shari.",
      "Browse by topic or search when you know what you're facing.",
      "Apply a strategy step-by-step or save ones that work for you.",
      "Open related tools (Focus, Clear My Mind) when a strategy points there.",
    ],
    tip: "ADHD strategies are for now; business strategies are for building systems.",
  },
  "time-block": {
    id: "time-block",
    steps: [
      "Name what you're moving forward — one intention at a time.",
      "Pick 15–45 minutes or Flexible duration.",
      "Set when it fits (or leave timing open).",
      "Start when ready; check in with How did it go?",
      "Made progress counts — done, partial, or not today are all valid.",
    ],
    tip: "Momentum appointments are gentle intentions, not rigid deadlines.",
  },
  "decision-compass": {
    id: "decision-compass",
    steps: [
      "Name what you're deciding — one decision at a time.",
      "Pick a decision type or let Shari suggest one.",
      "Work through each step; use the map to see your thinking.",
      "Compare options without pressure to be perfect.",
      "Save to a project, export, or turn insight into a next action.",
    ],
    tip: "Stopping mid-way is fine — your answers stay until you return.",
  },
  "content-generator": {
    id: "content-generator",
    steps: [
      "Pick what you want to make (email, proposal, SOP, post…).",
      "Answer one question at a time in chat beside Create.",
      "Review the living plan as sections take shape.",
      "Build a first draft when you're ready — or keep chatting.",
      "Refine, export, or save to My Work when it feels right.",
    ],
    tip: "Conversation first — you never have to configure a blank form.",
  },
};

export function getWorkspaceAreaWorkflow(
  areaId: string,
): WorkspaceAreaWorkflow | null {
  return WORKSPACE_AREA_WORKFLOWS[areaId] ?? null;
}
