/**
 * Shared title guards — no dependency on Creation Identity.
 * Used by humanReadableIdentity and deriveCreationIdentity.
 */

/** Technical / system labels that must never be the member-facing title. */
const TECHNICAL_TITLE_RE =
  /\b(?:creation workspace|event workspace|project workspace|runtime creation record|workspace id|schema version|untitled workspace)\b/i;

const BARE_TYPE_RE =
  /^(workshop|event|document|project|sop|course|retreat|webinar|email|newsletter|event plan|creation)$/i;

/** e.g. "Default Workshop Template" — never a member-facing title */
export const DEFAULT_TEMPLATE_RE = /^default\b.+\btemplate$/i;

const UNTITLED_TYPE_FALLBACK = "Untitled Work";

export function isTechnicalWorkspaceTitle(title: string | null | undefined): boolean {
  const t = title?.trim() ?? "";
  if (!t) return true;
  if (TECHNICAL_TITLE_RE.test(t)) return true;
  if (DEFAULT_TEMPLATE_RE.test(t)) return true;
  if (/^workspace[_-][a-z0-9]+$/i.test(t)) return true;
  return false;
}

/** True when title is only the creation type (e.g. "Workshop") — never permanent. */
export function isBareCreationTypeTitle(
  title: string | null | undefined,
  creationType?: string | null,
): boolean {
  const t = title?.trim() ?? "";
  if (!t) return true;
  if (BARE_TYPE_RE.test(t)) return true;
  if (DEFAULT_TEMPLATE_RE.test(t)) return true;
  const type = (creationType || "").trim();
  if (type && t.toLowerCase() === type.toLowerCase()) return true;
  return false;
}

/** True when a stored title is still a force-new / meta instruction, not a name. */
export function isCreationMetaTitle(title: string | null | undefined): boolean {
  const t = title?.trim() ?? "";
  if (!t) return false;
  if (
    /^(?:start something new|new workspace|separate workspace|start fresh|create a separate|create another|begin a different)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/^brand new(?:\s+separate)?(?:\s+workspace)?(?:\s*[—\-:].*)?$/i.test(t)) {
    return true;
  }
  if (/^brand new project\b/i.test(t)) return true;
  return false;
}

export function isUsableHumanTitle(
  title: string | null | undefined,
  creationType?: string | null,
): boolean {
  const t = title?.trim() ?? "";
  if (!t) return false;
  if (isTechnicalWorkspaceTitle(t)) return false;
  if (isBareCreationTypeTitle(t, creationType)) return false;
  if (isCreationMetaTitle(t)) return false;
  return true;
}

export function safeUntitledLabel(creationType?: string | null): string {
  const type = (creationType || "").trim();
  if (!type || /^creation$/i.test(type)) return UNTITLED_TYPE_FALLBACK;
  return `Untitled ${type}`;
}

/** Strip force-new / meta wrappers so they never become the workspace title. */
export function stripCreationMetaPreamble(requestText: string): string {
  let cleaned = requestText.trim();
  for (let i = 0; i < 4; i += 1) {
    const next = cleaned
      .replace(
        /^(?:start something new|brand new(?:\s+(?:separate|project))?(?:\s+workspace)?|new workspace|separate workspace|start fresh|fresh(?:\s+new)?(?:\s+workspace)?)\s*[—\-:,.]?\s*/i,
        "",
      )
      .replace(
        /^(?:create a separate|create another|begin a different|don'?t continue(?:\s+the\s+current\s+one)?|do not continue(?:\s+the\s+current\s+one)?)\s*/i,
        "",
      )
      .replace(
        /^(?:i(?:'d| would)? like to |i want to |help me |can you |let'?s |please )?(?:create|build|write|draft|make|plan|design|start)\s+(?:a |an |the |my |separate )?/i,
        "",
      )
      .replace(/^(?:brand new,?|(?:completely\s+)?separate)\s+/i, "")
      .replace(
        /^(?:brand new(?:\s+project)?(?:\s+for\s+(?:a|an|the))?|project for (?:a|an|the))\s+/i,
        "",
      )
      .replace(
        /^(?:completely\s+separate\s+)?project\s+for\s+(?:a|an|the)\s+/i,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();
    if (next === cleaned) break;
    cleaned = next;
  }
  return cleaned;
}
