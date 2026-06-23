import type { EmotionalState, UserIntent } from "./companionEmotions";
import type { RoutingResult, ToolRoute, ToolRouteId } from "./companionRouting";
import { getRouteById } from "./companionRouting";

export type ContextChip = {
  id: string;
  label: string;
  route: ToolRoute;
};

const CHIP_POOL: Record<
  EmotionalState,
  Partial<Record<UserIntent, string[]>>
> = {
  stuck: {
    think: ["Clear my head", "Break into steps"],
    do: ["Get one step", "Start Clear My Mind"],
    reset: ["New Chat", "Clear my head"],
  },
  overwhelmed: {
    reset: ["New Chat", "Clear my head"],
    think: ["Start breathing", "Pause and organize"],
    do: ["One small step", "New Chat"],
  },
  focused: {
    do: ["Start 30-min focus session", "Start 25-min Pomodoro"],
    organize: ["Break into steps", "Name one priority"],
  },
  building: {
    create: ["Open Business Playbook", "Build a plan"],
    organize: ["Break into steps", "Structure this"],
  },
  emotional: {
    think: ["Start breathing", "Talk it through"],
    reset: ["New Chat", "Clear my head"],
  },
  unclear: {
    think: ["Talk it through", "Get one step"],
  },
};

const CHIP_TO_ROUTE: Record<string, ToolRouteId> = {
  "Clear my head": "brain-dump",
  "Start Clear My Mind": "brain-dump",
  "New Chat": "reset-day",
  "Get one step": "one-step",
  "One small step": "one-step",
  "Start breathing": "breathe",
  "Pause and organize": "talk-through",
  "Start 25-min Pomodoro": "pomodoro",
  "Start 30-min focus session": "focus-session",
  "Break into steps": "break-steps",
  "Open Business Playbook": "playbook",
  "Build a plan": "structured-plan",
  "Structure this": "structured-plan",
  "Talk it through": "talk-through",
  "Name one priority": "one-step",
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function buildContextualChips(
  state: EmotionalState,
  intent: UserIntent,
  routing: RoutingResult,
  recentLabels: string[],
): ContextChip[] {
  const recent = new Set(recentLabels.map(normalize));
  const pool =
    CHIP_POOL[state][intent] ??
    CHIP_POOL[state].think ??
  [];

  const candidates: string[] = [...pool];

  if (routing.primary && !candidates.includes(routing.primary.buttonLabel)) {
    candidates.unshift(routing.primary.buttonLabel);
  }
  if (routing.fallback) {
    candidates.push(routing.fallback.buttonLabel);
  }

  const chips: ContextChip[] = [];
  for (const label of candidates) {
    const key = normalize(label);
    if (recent.has(key)) continue;
    const routeId = CHIP_TO_ROUTE[label];
    if (!routeId) continue;
    chips.push({
      id: `chip-${routeId}-${label}`,
      label,
      route: getRouteById(routeId),
    });
    if (chips.length >= 2) break;
  }

  return chips;
}
