import type { AppSection } from "@/lib/companionUi";

export type StrategyStruggleId =
  | "too-many-ideas"
  | "too-many-projects"
  | "too-many-tasks"
  | "too-many-decisions";

export type StrategyStruggle = {
  id: StrategyStruggleId;
  label: string;
  section: AppSection;
  openLabel: string;
  hint: string;
  /** When set, opening this route should also start a coached chat. */
  chatPrompt?: (strategyTitle: string) => string;
};

export const STRATEGY_STRUGGLES: StrategyStruggle[] = [
  {
    id: "too-many-ideas",
    label: "Too many ideas",
    section: "brain-dump",
    openLabel: "Open Clear My Mind",
    hint: "Get everything out of your head so you can use this strategy on one thing.",
  },
  {
    id: "too-many-projects",
    label: "Too many projects",
    section: "projects",
    openLabel: "Open Projects",
    hint: "See what's open, pick one door, and park the rest.",
  },
  {
    id: "too-many-tasks",
    label: "Too many tasks",
    section: "energy",
    openLabel: "Open Today's Reality",
    hint: "Shrink today to what actually fits your energy and time.",
  },
  {
    id: "too-many-decisions",
    label: "Too many decisions",
    section: "home",
    openLabel: "Open Decision Support",
    hint: "Talk through options one at a time — no pressure to get it perfect.",
    chatPrompt: (title) =>
      `I'm working with the "${title}" strategy and I'm stuck with too many decisions competing for attention. ` +
      `Help me narrow to the one decision that matters most right now. Ask me one short question at a time.`,
  },
];

export function struggleById(id: StrategyStruggleId): StrategyStruggle {
  return STRATEGY_STRUGGLES.find((s) => s.id === id)!;
}

/** Guess which struggle fits a built-in strategy (highlights the chip). */
export function suggestedStruggleForStrategy(
  strategyId: string,
  categoryId: string,
): StrategyStruggleId {
  const id = strategyId.toLowerCase();
  const cat = categoryId.toLowerCase();
  if (
    /one-door|idea|channel|content-from|repurpose|talk-to-five/.test(id) ||
    cat === "content" ||
    cat === "marketing"
  ) {
    return "too-many-ideas";
  }
  if (
    /project|scope|check-in|three-task|one-page|productivity|planning|systems/.test(
      id,
    ) ||
    cat === "productivity" ||
    cat === "planning" ||
    cat === "systems"
  ) {
    return "too-many-tasks";
  }
  if (
    /pick-then-learn|decision|offer|pricing|ask-directly|one-clear/.test(id) ||
    cat === "decision-making" ||
    cat === "business-decisions" ||
    cat === "offers" ||
    cat === "pricing"
  ) {
    return "too-many-decisions";
  }
  if (cat === "sales" || cat === "customer-relations") {
    return "too-many-projects";
  }
  return "too-many-tasks";
}
