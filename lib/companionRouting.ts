import type { EmotionalState, UserIntent } from "./companionEmotions";
import { pickClarifyingQuestion } from "./companionEmotions";
import type { CoachingMode } from "./companionPrompt";
import type { SessionMemory } from "./companionMemory";
import type { AppSection, SidebarToolId } from "./companionUi";

export type ToolRouteId =
  | "brain-dump"
  | "reset-day"
  | "one-step"
  | "breathe"
  | "pomodoro"
  | "focus-session"
  | "focus-mode"
  | "playbook"
  | "structured-plan"
  | "break-steps"
  | "talk-through";

export type ToolRoute = {
  id: ToolRouteId;
  label: string;
  description: string;
  emoji: string;
  buttonLabel: string;
  section?: AppSection;
  tool?: SidebarToolId;
  mode?: CoachingMode;
  prompt?: string;
};

export type RoutingResult = {
  state: EmotionalState;
  primary: ToolRoute | null;
  fallback: ToolRoute | null;
  clarifyingQuestion?: string;
};

type RouteDef = Omit<ToolRoute, "id"> & { id: ToolRouteId };

function route(id: ToolRouteId, def: Omit<ToolRoute, "id">): ToolRoute {
  return { id, ...def };
}

const ROUTES: Record<ToolRouteId, RouteDef> = {
  "brain-dump": route("brain-dump", {
    label: "Clear My Mind",
    description: "Let's get everything out of your head — no structure needed",
    emoji: "🧠",
    buttonLabel: "Let's clear your mind",
    section: "brain-dump",
    tool: "brain-dump",
    mode: "today",
  }),
  "reset-day": route("reset-day", {
    label: "New Chat",
    description:
      "Start a fresh conversation — memory, projects, and learning stay safe",
    emoji: "💬",
    buttonLabel: "Start New Chat",
    tool: "reset-day",
    mode: "today",
  }),
  "one-step": route("one-step", {
    label: "One Step Plan",
    description: "Pick just one tiny move — nothing else",
    emoji: "👣",
    buttonLabel: "Get one step",
    mode: "today",
    prompt: "Help me pick one small step I can do right now",
  }),
  breathe: route("breathe", {
    label: "Breathe",
    description: "Ground first — a calm minute before anything else",
    emoji: "🌬",
    buttonLabel: "Start breathing",
    section: "breathe",
    tool: "breathe",
    mode: "today",
  }),
  pomodoro: route("pomodoro", {
    label: "Pomodoro Timer",
    description: "25 minutes of calm, focused attention",
    emoji: "⏱",
    buttonLabel: "Start 25-min Pomodoro",
    section: "focus-timer",
    tool: "focus-timer",
    mode: "focus",
  }),
  "focus-session": route("focus-session", {
    label: "Focus Session",
    description: "Name your task and begin now",
    emoji: "🎯",
    buttonLabel: "Start focus session",
    mode: "focus",
    prompt:
      "Help me name what I'm focusing on and start a 25-minute focus block",
  }),
  "focus-mode": route("focus-mode", {
    label: "Focus Mode",
    description: "Minimize distractions and go deep",
    emoji: "🚫",
    buttonLabel: "Enable Focus Mode",
    mode: "focus",
  }),
  playbook: route("playbook", {
    label: "Business Playbook",
    description: "Create, write, and structure what you're building",
    emoji: "📘",
    buttonLabel: "Open Business Playbook",
    mode: "playbook",
    prompt: "Help me work on this in Business Playbook",
  }),
  "structured-plan": route("structured-plan", {
    label: "Structured plan",
    description: "Turn your idea into a clear outline",
    emoji: "✍️",
    buttonLabel: "Build a plan",
    mode: "playbook",
    prompt: "Help me create a structured plan for what I'm building",
  }),
  "break-steps": route("break-steps", {
    label: "Break into steps",
    description: "Smaller pieces so it feels doable",
    emoji: "🧩",
    buttonLabel: "Break it down",
    mode: "today",
    prompt: "Break this into clear, manageable steps",
  }),
  "talk-through": route("talk-through", {
    label: "Talk it through",
    description: "Sort it out together in conversation",
    emoji: "💬",
    buttonLabel: "Talk it through",
    mode: "today",
    prompt: "I'm not sure where to start — help me talk through what's going on",
  }),
};

const STATE_ROUTING: Record<
  EmotionalState,
  { primary: ToolRouteId | null; fallbacks: ToolRouteId[] }
> = {
  stuck: { primary: "one-step", fallbacks: ["brain-dump"] },
  overwhelmed: { primary: "brain-dump", fallbacks: ["breathe"] },
  unclear: { primary: null, fallbacks: ["talk-through"] },
  focused: { primary: "pomodoro", fallbacks: ["focus-session"] },
  building: { primary: "playbook", fallbacks: ["break-steps"] },
  emotional: { primary: "breathe", fallbacks: ["brain-dump"] },
};

export function routeToTools(
  state: EmotionalState,
  memory: SessionMemory,
  _coachingMode: CoachingMode,
  lastPrimaryId?: ToolRouteId,
): RoutingResult {
  const config = STATE_ROUTING[state];

  if (state === "unclear") {
    return {
      state,
      primary: null,
      fallback: ROUTES["talk-through"],
      clarifyingQuestion: pickClarifyingQuestion(memory.lastTask ?? ""),
    };
  }

  let primaryId = config.primary!;
  let fallbacks = [...config.fallbacks];

  if (lastPrimaryId === primaryId && fallbacks.length > 0) {
    primaryId = fallbacks[0];
    fallbacks = [config.primary!, ...fallbacks.filter((id) => id !== primaryId)];
  }

  const primary = { ...ROUTES[primaryId] };
  if (memory.lastTask && primary.prompt) {
    primary.prompt = `${primary.prompt}: ${memory.lastTask}`;
  }

  const fallbackId = fallbacks.find((id) => id !== primaryId);
  const fallback = fallbackId ? { ...ROUTES[fallbackId] } : null;

  return { state, primary, fallback, clarifyingQuestion: undefined };
}

export function getRouteById(id: ToolRouteId): ToolRoute {
  return { ...ROUTES[id] };
}
