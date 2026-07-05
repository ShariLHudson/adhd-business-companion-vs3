/**
 * Bare "help me" / "I need help" — warm clarify locally, no API, no create recovery.
 */

import { shouldSurfaceClarificationUi } from "@/lib/intentRoutingIntelligence";

export function isVagueHelpRequest(userText: string): boolean {
  return shouldSurfaceClarificationUi(userText);
}

export function vagueHelpLocalReply(): string {
  return "I'm glad you said something. What's pulling at you most — something to decide, something to make, or something you need to talk through?";
}
