/**
 * Classification of companion "thinking" / blocking states.
 * Principle: The interface should pause only when there is no honest way to continue.
 *
 * | Class | Meaning | UI behavior |
 * |-------|---------|-------------|
 * | deterministic | Navigation, rooms, chamber members, known commands, local data | Never show thinking; never call AI |
 * | background | Reminders, indexing, analytics, sync | Non-blocking; no thinking flame |
 * | lightweight_ai | Short model calls with progressive/stream feedback | Thinking only after ~200ms; input stays open |
 * | heavy_ai | Long generation (drafts, research) | Thinking after ~200ms; interruptible; prefer progressive updates |
 */

export type CompanionThinkingClass =
  | "deterministic"
  | "background"
  | "lightweight_ai"
  | "heavy_ai";

export const COMPANION_THINKING_CLASS_GUIDANCE: Record<
  CompanionThinkingClass,
  string
> = {
  deterministic:
    "Route immediately from app state. Never set isLoading or call /api/companion-chat.",
  background:
    "Fire-and-forget or parallel with navigation. Never block chat input.",
  lightweight_ai:
    "May call the model; reveal Spark thinking only after VISIBLE_THINKING_REVEAL_MS; keep mic/send enabled; newer messages abort in-flight work.",
  heavy_ai:
    "Stream when possible; same interrupt + delayed thinking rules; never lock the estate on local side effects.",
};

/** Surfaces that must stay deterministic (no AI pause). */
export const DETERMINISTIC_COMPANION_ACTIONS = [
  "estate_place_navigation",
  "chamber_member_switch",
  "menu_choice_resolution",
  "frictionless_local_reply",
  "estate_guide_local",
  "known_command_kernel",
  "open_local_workspace",
  "load_local_store_data",
] as const;
