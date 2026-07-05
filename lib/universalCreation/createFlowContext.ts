/**
 * Create-flow assistant context — shared by orchestrator and session exit gate.
 * Kept separate to avoid circular imports.
 */

import { UNIVERSAL_DOCUMENT_PLUGINS } from "./documentRegistry";
import { isCreateFastPathRecoveryMessage } from "./createFastPath";
import { isGuidedCreationAssistantContext } from "./guidedCreationFlow";

export const CREATION_MARKER_RE =
  /let me understand what you'?re trying|what would success look like|what would a good response look like|who is this for|who is in the room|main reason you'?re giving|main reason you'?re creating|is this sop for|what process are we documenting|shape a plan you can actually work from|shape a presentation that lands|what(?:'s| is) the setting|about how long do you have|what(?:'s| is) the one idea you need|what skepticism|what should they do when|shape website copy|map a funnel|a couple of quick questions one at a time|who is the workshop for|transformation do you want|how long will the workshop|starting from scratch|for your own business, or for a client|will one person use this|enough to draft your sop|want me to start the draft|start the draft now|want me to write it now|discovery is complete|clear picture of who this is for|one thing you most want readers|introducing or inviting|how should this sound|one action you'?d love|story, win, or proof|who is receiving this email|what(?:'s| is) your relationship with them|what do they already know|what(?:'s| is) the one thing you need them|what offer sits at the bottom|take a look|what would you change|does this feel ready|what would you like to do with it|here'?s a first draft|here'?s the draft/i;

function normalizeDiscoveryMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function inferDocumentTypeFromAssistantContext(
  lastAssistantText: string,
): import("./types").UniversalDocumentType | null {
  const norm = normalizeDiscoveryMatch(lastAssistantText);
  if (!norm) return null;

  for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
    if (
      plugin.intro &&
      norm.includes(normalizeDiscoveryMatch(plugin.intro.slice(0, 45)))
    ) {
      return plugin.id;
    }
    for (const q of plugin.discoveryQuestions) {
      const promptNorm = normalizeDiscoveryMatch(q.prompt);
      if (
        norm.includes(promptNorm) ||
        norm.includes(normalizeDiscoveryMatch(q.prompt.slice(0, 40)))
      ) {
        return plugin.id;
      }
    }
  }
  return null;
}

export function isUniversalCreationMessage(text: string): boolean {
  return CREATION_MARKER_RE.test(text);
}

export function isCreateFlowAssistantContext(
  lastAssistantText?: string | null,
): boolean {
  const last = lastAssistantText?.trim() ?? "";
  if (!last) return false;
  return (
    isUniversalCreationMessage(last) ||
    isCreateFastPathRecoveryMessage(last) ||
    isGuidedCreationAssistantContext(last) ||
    inferDocumentTypeFromAssistantContext(last) != null
  );
}
