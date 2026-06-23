export type FreshStartKind = "clear-context" | "begin-new-day";

export type FreshStartCopy = {
  menuEmoji: string;
  menuLabel: string;
  menuHint: string;
  title: string;
  intro: string;
  willDo: string[];
  willNot: string[];
  confirmLabel: string;
};

export const CLEAR_TODAY_CONTEXT_COPY: FreshStartCopy = {
  menuEmoji: "🧹",
  menuLabel: "Clear Today's Context",
  menuHint:
    "Clear conversation context and active workspace state while keeping your memory, projects, avatars, and history.",
  title: "Clear Today's Context",
  intro: "Reset where you are right now — nothing important gets deleted.",
  willDo: [
    "Clear today's conversation context",
    "Close active workspaces",
    "Reset temporary session state",
  ],
  willNot: [
    "Delete projects",
    "Delete memories",
    "Delete avatars",
    "Delete saved work",
  ],
  confirmLabel: "Clear Context",
};

export const BEGIN_NEW_DAY_COPY: FreshStartCopy = {
  menuEmoji: "🌅",
  menuLabel: "Begin New Day",
  menuHint:
    "Start a new day, archive yesterday's activity, refresh momentum planning, and create today's starting point.",
  title: "Begin New Day",
  intro: "A fresh daily session — your long-term work stays safe.",
  willDo: [
    "Archive yesterday's activity",
    "Start a fresh daily session",
    "Reset today's planning view",
  ],
  willNot: [
    "Delete projects",
    "Delete memories",
    "Delete saved work",
  ],
  confirmLabel: "Begin New Day",
};

export function freshStartCopy(kind: FreshStartKind): FreshStartCopy {
  return kind === "clear-context"
    ? CLEAR_TODAY_CONTEXT_COPY
    : BEGIN_NEW_DAY_COPY;
}

export const BEGIN_NEW_DAY_GREETING =
  "New day — fresh start. What feels most important right now?";

/** Top navigation — short labels; confirm dialogs keep full copy in title/intro. */
export const TOP_BAR_RESET_WORKSPACE_LABEL = "Reset workspace";
export const TOP_BAR_NEW_DAY_LABEL = "New day";
