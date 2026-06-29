import type { AppSection } from "@/lib/companionUi";

export type HomeMode = "welcome" | "chat";

/** Welcome = entering the room. Chat = conversation has started on home. */
export function resolveHomeMode(input: {
  activeSection: AppSection;
  homeCalm: boolean;
  hasUserMessages: boolean;
}): HomeMode | null {
  if (input.activeSection !== "home") return null;
  if (input.hasUserMessages || !input.homeCalm) return "chat";
  return "welcome";
}

export function homeModeDataAttr(mode: HomeMode | null): string | undefined {
  return mode ?? undefined;
}
