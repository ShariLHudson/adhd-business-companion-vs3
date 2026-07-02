/**
 * Companion Context Routing™ — separate Estate voice from system/debug channels.
 *
 * Estate Chat: places, feelings, navigation, Shari presence.
 * System channel: fetch/runtime failures — console + retry only.
 * Dev console: build/webpack — never member-visible.
 */

export type CompanionFailureSurface =
  | "chat"
  | "fresh-start"
  | "workspace-load"
  | "workspace-action";

export type CompanionFailureContext = {
  surface: CompanionFailureSurface;
  userText?: string;
};

export type RoutedCompanionFailure =
  | { channel: "silent" }
  | { channel: "estate"; message: string };
