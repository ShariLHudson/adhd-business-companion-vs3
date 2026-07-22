/**
 * Spec 130 — titles from user intent, not template names.
 * Low structure confidence → member's own wording (cleaned).
 */

import { deriveCreationIdentity } from "@/lib/creationIdentity/deriveCreationIdentity";
import {
  isBareCreationTypeTitle,
  isUsableHumanTitle,
  stripCreationMetaPreamble,
} from "@/lib/activeWorkspaceRegistry/titleGuards";

export type CreateTitleFromIntentInput = {
  /** Member words / NL request */
  requestText?: string | null;
  /** Resolved artifact / catalog type */
  artifactType?: string | null;
  /** Template or schema display name — never preferred over intent */
  templateName?: string | null;
};

function titleCasePhrase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      if (
        i > 0 &&
        /^(?:and|or|of|for|the|a|an|to|in|on)$/i.test(w)
      ) {
        return w.toLowerCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Helpful temporary title when there is no member request yet. */
export function newWorkTemporaryTitle(artifactType?: string | null): string {
  const type = artifactType?.trim();
  if (!type || /^creation$/i.test(type)) return "New Work";
  return `New ${type}`;
}

/**
 * Prefer intent-derived titles. Never return a template catalog name when
 * the member described something different (e.g. "Announcement Newsletter"
 * for "Weekly newsletter for coaching clients").
 */
export function createTitleFromIntent(
  input: CreateTitleFromIntentInput,
): string {
  const type = input.artifactType?.trim() || null;
  const request = input.requestText?.trim() || "";
  const template = input.templateName?.trim() || "";

  if (!request) {
    if (
      template &&
      isUsableHumanTitle(template, type) &&
      !isBareCreationTypeTitle(template, type)
    ) {
      // Browse-only with a real custom name — keep it.
      // Schema display names that equal the type fall through to New {Type}.
      if (template.toLowerCase() !== (type || "").toLowerCase()) {
        return template;
      }
    }
    return newWorkTemporaryTitle(type);
  }

  const derived = deriveCreationIdentity({
    originalRequest: request,
    creationType: type,
  }).humanWorkspaceTitle;

  const cleaned = stripCreationMetaPreamble(request);
  const wording = titleCasePhrase(
    cleaned
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 72),
  );

  const derivedWeak =
    !derived ||
    /^untitled\b/i.test(derived) ||
    /^new\b/i.test(derived) ||
    isBareCreationTypeTitle(derived, type) ||
    // Single adjective + type (e.g. "Weekly Newsletter") while request has more topic
    (derived.split(/\s+/).length <= 2 && cleaned.split(/\s+/).length >= 4);

  if (derivedWeak && wording.length >= 8 && isUsableHumanTitle(wording, type)) {
    return wording;
  }

  if (derived && isUsableHumanTitle(derived, type) && !/^untitled\b/i.test(derived)) {
    // Reject template name when it does not appear in the request.
    if (
      template &&
      derived.toLowerCase() === template.toLowerCase() &&
      !request.toLowerCase().includes(template.toLowerCase())
    ) {
      if (isUsableHumanTitle(wording, type)) return wording;
      return newWorkTemporaryTitle(type);
    }
    return derived;
  }

  if (isUsableHumanTitle(wording, type)) return wording;
  return newWorkTemporaryTitle(type);
}

/** True when a stored title looks like a catalog/template label, not intent. */
export function isTemplateLikeTitle(
  title: string | null | undefined,
  requestText?: string | null,
): boolean {
  const t = title?.trim() ?? "";
  if (!t) return false;
  const req = requestText?.trim().toLowerCase() ?? "";
  if (!req) return false;
  if (req.includes(t.toLowerCase())) return false;
  // Template-ish compound names that don't appear in the request
  return /\b(announcement|default|starter|sample|example)\b/i.test(t);
}
