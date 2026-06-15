/**
 * Detect environment friction from conversation and context.
 */

import type { DayEnvironment } from "@/lib/day-designer/types";
import type {
  ClutterLevel,
  EnvironmentAdjustment,
  EnvironmentInput,
  EnvironmentType,
  InterruptionLevel,
  SensoryLoad,
} from "./types";

export type EnvironmentSignal = {
  id: string;
  label: string;
  weight: number;
};

const PATTERNS: {
  id: string;
  label: string;
  re: RegExp;
  weight: number;
}[] = [
  { id: "noise", label: "Noise", re: /\b(noisy|loud|noise|kids yelling|tv on)\b/i, weight: 3 },
  { id: "clutter", label: "Clutter", re: /\b(clutter|messy|mess everywhere|piles)\b/i, weight: 3 },
  { id: "interruptions", label: "Interruptions", re: /\b(interrupt|keep getting pulled|people keep)\b/i, weight: 3 },
  { id: "people_around", label: "People around", re: /\b(people around|coworkers|family home|roommate)\b/i, weight: 2 },
  { id: "lighting", label: "Lighting issues", re: /\b(too bright|too dark|harsh light|glare)\b/i, weight: 2 },
  { id: "smells", label: "Smells", re: /\b(smell|odor|perfume|food smell)\b/i, weight: 2 },
  { id: "visual_overwhelm", label: "Visual overwhelm", re: /\b(visual overwhelm|too much to look at|chaotic)\b/i, weight: 4 },
  { id: "messy_desk", label: "Messy desk", re: /\b(messy desk|desk is a mess|can't find anything)\b/i, weight: 3 },
  { id: "too_many_tabs", label: "Too many tabs", re: /\b(too many tabs|50 tabs|tab overload)\b/i, weight: 3 },
  { id: "too_many_apps", label: "Too many apps", re: /\b(too many apps|too many windows|notifications)\b/i, weight: 3 },
  { id: "working_from_bed", label: "Working from bed", re: /\b(working from bed|in bed|on the couch)\b/i, weight: 3 },
  { id: "working_in_car", label: "Working in car", re: /\b(working in (the )?car|in my car)\b/i, weight: 2 },
  { id: "coffee_shop", label: "Coffee shop", re: /\b(coffee shop|cafe|starbucks)\b/i, weight: 1 },
  { id: "quiet_room", label: "Quiet room", re: /\b(quiet room|silent|peaceful|library)\b/i, weight: -2 },
  { id: "sensory_overload", label: "Sensory overload", re: /\b(sensory overload|overstimulat|too much input)\b/i, weight: 5 },
  { id: "phone_distraction", label: "Phone distraction", re: /\b(phone keeps|doom scroll|notifications)\b/i, weight: 3 },
];

const TYPE_PATTERNS: { type: EnvironmentType; re: RegExp }[] = [
  { type: "home", re: /\b(at home|in my house|my apartment|kitchen table)\b/i },
  { type: "office", re: /\b(office|workplace|desk at work)\b/i },
  { type: "coffee_shop", re: /\b(coffee shop|cafe|starbucks)\b/i },
  { type: "car", re: /\b(in (the )?car|parking lot|driving)\b/i },
  { type: "outdoors", re: /\b(outside|outdoors|park|porch)\b/i },
  { type: "shared_space", re: /\b(coworking|shared space|open office|we work)\b/i },
];

export function detectEnvironmentSignals(text: string): EnvironmentSignal[] {
  const hits: EnvironmentSignal[] = [];
  for (const p of PATTERNS) {
    if (p.re.test(text)) {
      hits.push({ id: p.id, label: p.label, weight: p.weight });
    }
  }
  return hits;
}

export function detectEnvironmentType(
  text: string,
  dayEnvironment?: DayEnvironment | null,
): EnvironmentType {
  for (const { type, re } of TYPE_PATTERNS) {
    if (re.test(text)) return type;
  }
  if (dayEnvironment === "office") return "office";
  if (dayEnvironment === "coffee_shop") return "coffee_shop";
  if (dayEnvironment === "mobile") return "car";
  if (dayEnvironment === "home_quiet" || dayEnvironment === "home_noisy") {
    return "home";
  }
  return "unknown";
}

export function mapDayEnvironmentToSignals(
  dayEnvironment: DayEnvironment,
): EnvironmentSignal[] {
  switch (dayEnvironment) {
    case "home_noisy":
      return [
        { id: "noise", label: "Noisy home", weight: 3 },
        { id: "interruptions", label: "Home interruptions", weight: 2 },
      ];
    case "coffee_shop":
      return [
        { id: "coffee_shop", label: "Coffee shop", weight: 1 },
        { id: "noise", label: "Ambient noise", weight: 2 },
      ];
    case "mobile":
      return [{ id: "working_in_car", label: "On the go", weight: 2 }];
    case "office":
      return [
        { id: "people_around", label: "Office", weight: 1 },
        { id: "interruptions", label: "Office interruptions", weight: 2 },
      ];
    case "home_quiet":
      return [{ id: "quiet_room", label: "Quiet home", weight: -2 }];
    default:
      return [];
  }
}

export function collectEnvironmentSignals(input: EnvironmentInput): EnvironmentSignal[] {
  const text = input.text?.trim() ?? "";
  const fromText = text ? detectEnvironmentSignals(text) : [];
  const fromDay = input.dayEnvironment
    ? mapDayEnvironmentToSignals(input.dayEnvironment)
    : [];
  const byId = new Map<string, EnvironmentSignal>();
  for (const s of [...fromText, ...fromDay]) {
    const existing = byId.get(s.id);
    if (!existing || s.weight > existing.weight) byId.set(s.id, s);
  }
  return [...byId.values()];
}

export function signalScore(signals: EnvironmentSignal[]): number {
  return signals.reduce((n, s) => n + Math.max(0, s.weight), 0);
}

export function shouldEvaluateEnvironment(text: string): boolean {
  return detectEnvironmentSignals(text).some((s) => s.weight > 0);
}

export function pickAdjustment(
  signals: EnvironmentSignal[],
  input: EnvironmentInput,
): EnvironmentAdjustment {
  const ids = new Set(signals.map((s) => s.id));
  if (ids.has("too_many_tabs") || ids.has("too_many_apps")) return "close_extra_tabs";
  if (ids.has("phone_distraction")) return "put_phone_away";
  if (ids.has("noise") || ids.has("sensory_overload")) return "use_headphones";
  if (ids.has("messy_desk") || ids.has("clutter") || ids.has("visual_overwhelm")) {
    return "clear_one_surface";
  }
  if (ids.has("working_from_bed") && input.recoveryLevel !== "fully_recovered") {
    return "change_location";
  }
  if (ids.has("interruptions") || ids.has("people_around")) return "put_phone_away";
  if (input.activationState === "stuck" && signalScore(signals) >= 3) {
    return "move_one_distraction";
  }
  if (input.cognitiveLoadLevel === "overloaded" || input.cognitiveLoadLevel === "heavy") {
    return "sensory_break";
  }
  if (ids.has("coffee_shop") && ids.has("noise")) return "focus_audio";
  if (signalScore(signals) >= 5) return "better_fit_location";
  return "move_one_distraction";
}

export function inferSensoryLoad(signals: EnvironmentSignal[]): SensoryLoad {
  const score = signalScore(signals);
  const hasOverload = signals.some((s) => s.id === "sensory_overload");
  if (hasOverload || score >= 8) return "overwhelming";
  if (score >= 5) return "high";
  if (score >= 2) return "moderate";
  return "low";
}

export function inferInterruptionLevel(
  signals: EnvironmentSignal[],
): InterruptionLevel {
  const ids = new Set(signals.map((s) => s.id));
  if (ids.has("interruptions") && ids.has("people_around")) return "constant";
  if (ids.has("interruptions") || ids.has("phone_distraction")) return "frequent";
  if (ids.has("people_around") || ids.has("noise")) return "occasional";
  if (signals.some((s) => s.id === "quiet_room")) return "quiet";
  return "occasional";
}

export function inferClutterLevel(signals: EnvironmentSignal[]): ClutterLevel {
  const ids = new Set(signals.map((s) => s.id));
  if (ids.has("visual_overwhelm") || (ids.has("clutter") && ids.has("messy_desk"))) {
    return "overwhelming";
  }
  if (ids.has("messy_desk") || ids.has("clutter")) return "distracting";
  if (ids.has("too_many_tabs") || ids.has("too_many_apps")) return "distracting";
  if (!signals.length) return "unknown";
  return "manageable";
}
