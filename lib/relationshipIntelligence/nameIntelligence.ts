import type {
  NameIntelligenceInput,
  NameIntelligenceVerdict,
  NameLineContext,
  NameUseScenario,
} from "./types";
import { PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE } from "./types";

const INSTRUCTION_CONTEXTS = new Set<NameLineContext>([
  "instruction",
  "research",
  "list",
]);

export function countNameOccurrences(text: string, firstName: string): number {
  const name = firstName.trim();
  if (!name) return 0;
  const re = new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi");
  return (text.match(re) ?? []).length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveScenario(input: NameIntelligenceInput): NameUseScenario {
  if (input.scenario) return input.scenario;
  if (input.isFirstGreetingOfDay) return "first_greeting_of_day";
  if (input.celebrationActive || input.projectRecentlyCompleted) {
    return "celebration";
  }
  if (input.recoveryGentle) return "encouragement";
  if (input.returnIntervalDays != null && input.returnIntervalDays >= 3) {
    return "reconnect_after_absence";
  }
  return "ordinary";
}

/**
 * Name Intelligence — intentionally decide whether the name warms the moment.
 */
export function evaluateNameIntelligence(
  input: NameIntelligenceInput,
): NameIntelligenceVerdict {
  const name = input.firstName?.trim();
  if (!name) {
    return {
      useName: false,
      principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
      reason: "no-name-known",
    };
  }

  const context = input.lineContext ?? "greeting";
  if (INSTRUCTION_CONTEXTS.has(context)) {
    return {
      useName: false,
      principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
      reason: "instruction-or-research-context",
    };
  }

  if ((input.namesUsedThisConversation ?? 0) >= 2) {
    return {
      useName: false,
      principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
      reason: "already-used-in-conversation",
    };
  }

  const scenario = resolveScenario(input);

  switch (scenario) {
    case "first_greeting_of_day":
      return {
        useName: true,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: "first-greeting-of-day",
      };
    case "celebration":
      return {
        useName: true,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: "celebration",
      };
    case "encouragement":
      return {
        useName: true,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: "encouragement-before-difficulty",
      };
    case "reconnect_after_absence":
      return {
        useName: true,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: "reconnect-after-absence",
      };
    case "important_personal":
      return {
        useName: true,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: "important-personal-conversation",
      };
    case "long_conversation_reconnect": {
      const count = input.messageCountInConversation ?? 0;
      const occasional = count >= 8 && count % 7 === 0;
      return {
        useName: occasional,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: occasional ? "long-conversation-reconnect" : "ordinary-moment",
      };
    }
    default:
      return {
        useName: false,
        principle: PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE,
        reason: "ordinary-moment",
      };
  }
}

/**
 * Apply a first name naturally — mid-greeting for warmth, never tacked on awkwardly.
 */
export function applyNameNaturally(
  text: string,
  firstName: string | null | undefined,
  useName: boolean,
): string {
  const name = firstName?.trim();
  if (!name || !useName) return text;
  if (countNameOccurrences(text, name) > 0) return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  if (/^good morning[.!]?$/i.test(trimmed)) {
    return `Good morning, ${name}.`;
  }
  if (/^morning[.!]?$/i.test(trimmed)) {
    return `Morning, ${name}.`;
  }
  if (/^good afternoon[.!]?$/i.test(trimmed)) {
    return `Good afternoon, ${name}.`;
  }
  if (/^good evening[.!]?$/i.test(trimmed)) {
    return `Good evening, ${name}.`;
  }
  if (/^hi[.!]?$/i.test(trimmed)) {
    return `Hi, ${name}.`;
  }
  if (/^hey[.!]?$/i.test(trimmed)) {
    return `Hey, ${name}.`;
  }
  if (/^welcome back[.!]?$/i.test(trimmed)) {
    return `Welcome back, ${name}.`;
  }

  if (/^happy birthday/i.test(trimmed)) {
    if (trimmed.includes("—")) {
      const rest = trimmed.replace(/^happy birthday\s*—\s*/i, "");
      return `Happy birthday, ${name} — ${rest}`;
    }
    if (trimmed.endsWith(".")) {
      return `Happy birthday, ${name}.`;
    }
    return `Happy birthday, ${name}`;
  }

  if (trimmed.includes("{name}")) {
    return trimmed.replace(/\{name\}/g, name);
  }

  if (trimmed.endsWith(".") && !trimmed.includes(",")) {
    const lead = trimmed.slice(0, -1);
    if (/^(good morning|morning|good afternoon|good evening)$/i.test(lead)) {
      return `${lead}, ${name}.`;
    }
    return `${lead}, ${name}.`;
  }
  if (trimmed.endsWith("?") && !trimmed.includes(",")) {
    return `${trimmed.slice(0, -1)}, ${name}?`;
  }

  return trimmed;
}

export function nameIntelligenceHintForChat(verdict: NameIntelligenceVerdict): string {
  return [
    "NAME INTELLIGENCE — Personal Without Performance:",
    verdict.principle,
    verdict.useName
      ? "Using their first name in this moment is appropriate — once, naturally."
      : "Do NOT insert their name in this response — ordinary moment, instruction, or already used enough.",
    "Never use the name in every response, every paragraph, or every question.",
    "Avoid personalization theater — sound like Shari, not software.",
  ].join("\n");
}
