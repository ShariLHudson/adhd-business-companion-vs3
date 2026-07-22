/**
 * Round Table Boardroom entry — home is the default unless the member
 * explicitly asked for a Director, intake, or history destination.
 */

import type { BoardroomView } from "@/lib/boardroom/types";

export const BOARDROOM_WELCOME_MESSAGE =
  "Welcome to the Round Table Boardroom. This is where you can bring an important decision, hear several thoughtful perspectives, and decide what feels right for you. The Board will help you examine the opportunities, risks, tradeoffs, and long-term effects without choosing for you.";

export const BOARDROOM_HOME_PRIMARY_CHOICES = [
  {
    id: "bring-decision",
    title: "Bring a Decision to the Board",
    description:
      "State your decision, accept recommended Directors, and hear distinct perspectives.",
    testId: "boardroom-start-discussion",
    prominence: "primary" as const,
  },
  {
    id: "meet-directors",
    title: "Meet the Directors",
    description:
      "Get to know who sits around the Round Table and how each Director thinks.",
    testId: "boardroom-meet-directors",
    prominence: "secondary" as const,
  },
  {
    id: "review-past",
    title: "Past Discussions",
    description:
      "Return to previous discussions, recommendations, and outcomes.",
    testId: "boardroom-review-past",
    prominence: "secondary" as const,
  },
] as const;

/** Short Board-versus-Chamber explanation near Boardroom entry. */
export const BOARDROOM_CHAMBER_CONTRAST_BLURB =
  "The Board helps you evaluate important decisions from several perspectives. When you need deep subject-specific help, Spark Estate may suggest the right Chamber Intelligence—with your permission.";

export type BoardroomHomePrimaryChoiceId =
  (typeof BOARDROOM_HOME_PRIMARY_CHOICES)[number]["id"];

/** How the Boardroom should open for this visit. */
export type BoardroomEntryIntent =
  | "home"
  | "meet-directors"
  | "meet-thomas"
  | "meet-shari"
  | "meet-marcus"
  | "meet-david"
  | "meet-maya"
  | "meet-carlos"
  | "meet-mateo"
  | "intake"
  | "past";

export const BOARDROOM_HOW_TO_USE_POINTS = [
  "Bring a decision, accept the recommended Directors, or customize who sits at the table.",
  "You remain the decision-maker — Directors advise; they do not choose for you.",
  "Each Director brings a different lens to the Round Table.",
  "The Board does not replace Chamber specialists.",
  "When you are ready to implement, Spark may later hand work to the Chamber — with your permission.",
] as const;

export const BOARDROOM_HOW_TO_SUMMARY_LABEL = "How the Boardroom Works";

/**
 * Resolve a chat / command phrase into a Boardroom entry intent.
 * Ambiguous or general Boardroom phrases → home (never auto-open Thomas).
 */
export function resolveBoardroomEntryIntent(
  rawText: string | null | undefined,
): BoardroomEntryIntent {
  const t = (rawText ?? "").trim().toLowerCase();
  if (!t) return "home";

  if (
    /\bmeet\s+thomas\b/.test(t) ||
    /\bthomas\s+ellison\b/.test(t) ||
    /\bopen\s+thomas\b/.test(t) ||
    /\bshow\s+me\s+thomas\b/.test(t) ||
    /\bchair\s+of\s+the\s+board\b/.test(t)
  ) {
    return "meet-thomas";
  }

  if (
    /\bmeet\s+shari\b/.test(t) ||
    /\bshari\s+menon\b/.test(t) ||
    /\bopen\s+shari\b/.test(t) ||
    /\bshow\s+me\s+shari\b/.test(t) ||
    /\bvice\s+chair\b/.test(t)
  ) {
    return "meet-shari";
  }

  if (
    /\bmeet\s+marcus\b/.test(t) ||
    /\bmarcus\s+whitaker\b/.test(t) ||
    /\bopen\s+marcus\b/.test(t) ||
    /\bshow\s+me\s+marcus\b/.test(t) ||
    /\boperations\s+(and|&)\s+capacity\b/.test(t)
  ) {
    return "meet-marcus";
  }

  if (
    /\bmeet\s+david\b/.test(t) ||
    /\bdavid\s+kim\b/.test(t) ||
    /\bopen\s+david\b/.test(t) ||
    /\bshow\s+me\s+david\b/.test(t) ||
    /\bfounder\s+advocate\b/.test(t)
  ) {
    return "meet-david";
  }

  if (
    /\bmeet\s+maya\b/.test(t) ||
    /\bmaya\s+chen\b/.test(t) ||
    /\bopen\s+maya\b/.test(t) ||
    /\bshow\s+me\s+maya\b/.test(t) ||
    /\btechnology\s+(and|&)\s+future\b/.test(t)
  ) {
    return "meet-maya";
  }

  if (
    /\bmeet\s+carlos\b/.test(t) ||
    /\bcarlos\s+rivera\b/.test(t) ||
    /\bopen\s+carlos\b/.test(t) ||
    /\bshow\s+me\s+carlos\b/.test(t) ||
    /\bvalues\s+(and|&)\s+trust\b/.test(t)
  ) {
    return "meet-carlos";
  }

  if (
    /\bmeet\s+mateo\b/.test(t) ||
    /\bmateo\s+vargas\b/.test(t) ||
    /\bopen\s+mateo\b/.test(t) ||
    /\bshow\s+me\s+mateo\b/.test(t) ||
    /\bdevil'?s\s+advocate\b/.test(t)
  ) {
    return "meet-mateo";
  }

  if (
    /\bmeet\s+the\s+directors?\b/.test(t) ||
    /\bshow\s+me\s+the\s+directors?\b/.test(t) ||
    /\bwho\s+(sits|is)\s+(on|around)\s+the\s+(board|round\s+table)\b/.test(t)
  ) {
    return "meet-directors";
  }

  if (
    /\breview\s+(my\s+)?past\s+board\b/.test(t) ||
    /\bpast\s+board\s+discussions?\b/.test(t) ||
    /\bboard\s+(discussion\s+)?history\b/.test(t) ||
    /\bprevious\s+board\s+discussions?\b/.test(t)
  ) {
    return "past";
  }

  if (
    /\bstart\s+a\s+board\s+discussion\b/.test(t) ||
    /\bbring\s+a\s+decision\b/.test(t) ||
    /\bboard\s+discussion\s+intake\b/.test(t) ||
    /\btake\s+this\s+to\s+the\s+board\b/.test(t)
  ) {
    return "intake";
  }

  // "Open the Boardroom", "Take me to the Round Table", menu, Explore Spark, etc.
  return "home";
}

export function boardroomViewFromEntryIntent(
  intent: BoardroomEntryIntent,
): BoardroomView {
  switch (intent) {
    case "meet-directors":
    case "meet-thomas":
    case "meet-shari":
    case "meet-marcus":
    case "meet-david":
    case "meet-maya":
    case "meet-carlos":
    case "meet-mateo":
      return "meet-directors";
    case "intake":
      return "board-director-intake";
    case "past":
      return "past";
    case "home":
    default:
      return "home";
  }
}

export function shouldOpenThomasFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-thomas";
}

export function shouldOpenShariFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-shari";
}

export function shouldOpenMarcusFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-marcus";
}

export function shouldOpenDavidFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-david";
}

export function shouldOpenMayaFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-maya";
}

export function shouldOpenCarlosFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-carlos";
}

export function shouldOpenMateoFromEntry(
  intent: BoardroomEntryIntent,
): boolean {
  return intent === "meet-mateo";
}
