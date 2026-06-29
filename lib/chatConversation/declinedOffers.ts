import type { ToolSuggestion } from "@/lib/companionToolSuggestions";
import type { WorkspaceOffer } from "@/lib/workspaceMode";

export const FOCUS_AUDIO_OFFER_KEY = "focus-audio";

export function workspaceOfferDeclineKey(offer: WorkspaceOffer): string {
  return offer.section;
}

export function toolSuggestionDeclineKey(offer: ToolSuggestion): string {
  if (
    offer.kind === "focus-session" ||
    (offer.action.type === "tool" && offer.action.tool === "focus-audio")
  ) {
    return FOCUS_AUDIO_OFFER_KEY;
  }
  return offer.kind;
}

export function isConversationOfferDeclined(
  declined: ReadonlySet<string>,
  key: string,
): boolean {
  return declined.has(key);
}

export function declineConversationOffer(
  declined: Set<string>,
  key: string,
): void {
  declined.add(key);
}
