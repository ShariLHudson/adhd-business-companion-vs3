import type { CoachingMode } from "./companionPrompt";
import type { Situation } from "./companionIntents";
import type { SessionMemory } from "./companionMemory";
import type { SidebarToolId } from "./companionUi";

export const USER_NAME = "Shari";

export type NextStepAction = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  mode?: CoachingMode;
  tool?: SidebarToolId;
  prompt?: string;
};

export function getTimeGreeting(name = USER_NAME): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export const QUICK_ACTION_HEADING = "What would you like to do next?";

export function getDashboardHeading(_mode: CoachingMode): string {
  return QUICK_ACTION_HEADING;
}

type StepDef = Omit<NextStepAction, "id"> & { id: string };

function step(def: StepDef): NextStepAction {
  return def;
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function poolForSituation(
  situation: Situation,
  memory: SessionMemory,
  coachingMode: CoachingMode,
): NextStepAction[] {
  const task = memory.lastTask ?? "";
  const taskLower = task.toLowerCase();

  if (situation === "overwhelmed") {
    return [
      step({
        id: "reset-day",
        label: "Reset Day",
        description: "Fresh start — clear the mental clutter",
        emoji: "🔄",
        tool: "reset-day",
        mode: "today",
      }),
      step({
        id: "plan-my-day",
        label: "Help me plan my day",
        description: "A gentle, adaptive plan — no packed schedule",
        emoji: "📅",
        mode: "today",
        prompt: "Help me plan my day",
      }),
      step({
        id: "one-small-step",
        label: "One small step",
        description: "Pick just one thing — nothing else",
        emoji: "🟢",
        mode: "today",
        prompt: "Help me pick one small step I can do right now",
      }),
      step({
        id: "talk-through",
        label: "Talk it through",
        description: "Sort what's swirling in your head",
        emoji: "💬",
        mode: "today",
        prompt: "I'm feeling overwhelmed — help me talk through what's on my mind",
      }),
      step({
        id: "brain-dump",
        label: "Clear your head",
        description: "Clear My Mind — get it all out",
        emoji: "🧠",
        tool: "brain-dump",
        mode: "today",
      }),
    ];
  }

  if (situation === "create_content" || coachingMode === "playbook") {
    return [
      step({
        id: "start-draft",
        label: "Start drafting with me",
        description: task
          ? truncate(`Continue: ${task}`, 72)
          : "Open Business Playbook and begin",
        emoji: "✍️",
        mode: "playbook",
        prompt: task
          ? `Help me draft this in Business Playbook: ${task}`
          : "Help me start drafting — guide me through Business Playbook",
      }),
      step({
        id: "use-template",
        label: "Use a template",
        description: "Email, letter, or structured format",
        emoji: "📋",
        mode: "playbook",
        prompt: "Help me use a template for what I'm writing",
      }),
      step({
        id: "organize-ideas",
        label: "Organize ideas",
        description: "Sort thoughts before you write",
        emoji: "🗂️",
        mode: "playbook",
        prompt: "Help me organize my ideas before I start writing",
      }),
      step({
        id: "write-playbook",
        label: "Write in Business Playbook",
        description: "Create, format, and polish",
        emoji: "📘",
        mode: "playbook",
        prompt: "Help me write this in Business Playbook",
      }),
    ];
  }

  if (memory.lastTask && situation === "daily_task") {
    return [
      step({
        id: "resume",
        label: "Continue where I left off",
        description: truncate(task, 72),
        emoji: "↩️",
        mode: memory.lastMode,
        prompt: `Let's continue where we left off: ${task}`,
      }),
      step({
        id: "write-playbook",
        label: "Write this in Business Playbook",
        description: "Turn it into polished output",
        emoji: "📘",
        mode: "playbook",
        prompt: `Help me write this in Business Playbook: ${task}`,
      }),
      step({
        id: "break-steps",
        label: "Break into steps",
        description: "Make it manageable, one piece at a time",
        emoji: "🪜",
        mode: "today",
        prompt: `Break this into clear steps: ${task}`,
      }),
      step({
        id: "focus-25",
        label: "Start Focus session",
        description: "25 minutes of calm attention",
        emoji: "🎯",
        mode: "focus",
        tool: "focus-timer",
      }),
    ];
  }

  if (situation === "focus_execution" || coachingMode === "focus") {
    return [
      step({
        id: "focus-now",
        label: "Begin focus block now",
        description: "Name your task and start",
        emoji: "⏱",
        mode: "focus",
        prompt: "Help me name what I'm focusing on and start a 25-minute block",
      }),
      step({
        id: "focus-25",
        label: "Start Focus session",
        description: "25 minutes — Pomodoro timer",
        emoji: "🎯",
        mode: "focus",
        tool: "focus-timer",
      }),
      step({
        id: "break-steps",
        label: "Break into steps",
        description: "Smaller pieces before you begin",
        emoji: "🪜",
        mode: "focus",
        prompt: task
          ? `Break this into focus-sized steps: ${task}`
          : "Help me break my task into focus-sized steps",
      }),
      step({
        id: "one-priority",
        label: "Name one priority",
        description: "What matters most right now?",
        emoji: "🟢",
        mode: "today",
        prompt: "Help me name the one priority to focus on",
      }),
    ];
  }

  if (situation === "track_progress" || coachingMode === "progress") {
    return [
      step({
        id: "log-win",
        label: "Log what you finished",
        description: "Capture a win from today",
        emoji: "📈",
        mode: "progress",
        prompt: "Help me log what I completed and what's next",
      }),
      step({
        id: "review-progress",
        label: "Review your progress",
        description: "See what's done and what's open",
        emoji: "✅",
        mode: "progress",
        prompt: "Help me review what I've done and what's still open",
      }),
      step({
        id: "next-followup",
        label: "Plan the follow-up",
        description: "What's the next move?",
        emoji: "➡️",
        mode: "progress",
        prompt: "What's the best follow-up for what I was working on?",
      }),
      ...(memory.lastTask
        ? [
            step({
              id: "resume",
              label: "Continue where I left off",
              description: truncate(task, 72),
              emoji: "↩️",
              mode: memory.lastMode,
              prompt: `Let's continue where we left off: ${task}`,
            }),
          ]
        : []),
    ];
  }

  if (memory.lastTask) {
    return [
      step({
        id: "resume",
        label: "Continue where I left off",
        description: truncate(task, 72),
        emoji: "↩️",
        mode: memory.lastMode,
        prompt: `Let's continue where we left off: ${task}`,
      }),
      ...(taskLower.includes("email") ||
      taskLower.includes("write") ||
      taskLower.includes("draft")
        ? [
            step({
              id: "write-playbook",
              label: "Write in Business Playbook",
              description: "Draft and format it properly",
              emoji: "📘",
              mode: "playbook",
              prompt: `Help me write this in Business Playbook: ${task}`,
            }),
          ]
        : []),
      step({
        id: "focus-25",
        label: "Start Focus session",
        description: "25 minutes of calm attention",
        emoji: "🎯",
        mode: "focus",
        tool: "focus-timer",
      }),
      step({
        id: "break-steps",
        label: "Break into steps",
        description: "Make it manageable",
        emoji: "🪜",
        mode: "today",
        prompt: `Break this into clear steps: ${task}`,
      }),
      step({
        id: "one-small-step",
        label: "One small step",
        description: "Just the next move — nothing more",
        emoji: "🟢",
        mode: "today",
        prompt: "What's one small step I can take on this?",
      }),
    ];
  }

  return [
    step({
      id: "one-small-step",
      label: "One small step",
      description: "Pick just one thing to start",
      emoji: "🟢",
      mode: "today",
      prompt: "Help me pick one small step to start with today",
    }),
    step({
      id: "focus-25",
      label: "Start Focus session",
      description: "25 minutes of calm attention",
      emoji: "🎯",
      mode: "focus",
      tool: "focus-timer",
    }),
    step({
      id: "brain-dump",
      label: "Clear your head",
      description: "Brain Dump — get it all out",
      emoji: "🧠",
      tool: "brain-dump",
      mode: "today",
    }),
    step({
      id: "start-draft",
      label: "Start drafting with me",
      description: "Business Playbook — create something",
      emoji: "✍️",
      mode: "playbook",
      prompt: "Help me start drafting something in Business Playbook",
    }),
    step({
      id: "reset-5",
      label: "Do a 5-min reset",
      description: "Breathe, then pick one priority",
      emoji: "🌿",
      mode: "today",
      prompt: "Help me do a quick 5-minute reset and pick one priority",
    }),
  ];
}

export function buildNextSteps(
  memory: SessionMemory,
  coachingMode: CoachingMode,
  situation: Situation,
  recentActionIds: string[],
): NextStepAction[] {
  const lastUsed = recentActionIds[recentActionIds.length - 1];
  const used = new Set(recentActionIds);
  const pool = poolForSituation(situation, memory, coachingMode);

  const picked: NextStepAction[] = [];
  for (const candidate of pool) {
    if (used.has(candidate.id)) continue;
    if (candidate.id === lastUsed) continue;
    if (picked.some((p) => p.id === candidate.id)) continue;
    picked.push(candidate);
    if (picked.length >= 4) break;
  }

  if (picked.length < 3) {
    for (const candidate of pool) {
      if (picked.some((p) => p.id === candidate.id)) continue;
      if (candidate.id === lastUsed) continue;
      picked.push(candidate);
      if (picked.length >= 3) break;
    }
  }

  return picked.slice(0, 4);
}
