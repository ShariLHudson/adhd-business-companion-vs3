/**
 * Template conversation routing — chat-first unless explicit Create consent.
 */

const TEMPLATE_MENTION_RE = /\btemplates?\b/i;

const TEMPLATE_DISCOVERY_RE =
  /\b(?:need|want|looking for|find|get|help (?:me )?(?:with|create)|make)\s+(?:a\s+)?template\b/i;

const TEMPLATE_FOR_RE = /\btemplate\s+for\b/i;

const EXPLICIT_TEMPLATE_CREATE_OPEN_RE =
  /\bopen\s+create\b[\s\S]{0,40}\btemplate\b/i;

const EXPLICIT_BUILD_TEMPLATE_RE =
  /\b(?:build|use|adapt|customize)\s+(?:this\s+)?template\b/i;

/** User is exploring what template they need — stay in chat. */
export function isTemplateDiscoveryRequest(text: string): boolean {
  const t = text.trim();
  if (!t || !TEMPLATE_MENTION_RE.test(t)) return false;
  if (/\bopen (?:the )?templates?\b/i.test(t)) return false;
  if (isExplicitTemplateCreateOpen(text)) return false;
  if (isExplicitBuildTemplateRequest(text)) return false;
  return (
    TEMPLATE_DISCOVERY_RE.test(t) ||
    TEMPLATE_FOR_RE.test(t) ||
    /\bi need a .+ template\b/i.test(t)
  );
}

/** User explicitly asked to open Create for a template. */
export function isExplicitTemplateCreateOpen(text: string): boolean {
  return EXPLICIT_TEMPLATE_CREATE_OPEN_RE.test(text.trim());
}

/** User asked to build/adapt a specific template — offer/consent first. */
export function isExplicitBuildTemplateRequest(text: string): boolean {
  return EXPLICIT_BUILD_TEMPLATE_RE.test(text.trim());
}

export function templateDiscoveryHintForChat(text: string): string {
  return (
    `TEMPLATE CONVERSATION FIRST: User said "${text.slice(0, 120)}". ` +
    `Stay in chat. Ask one gentle question about what kind of template they need. ` +
    `Do NOT open Create or Templates until they explicitly ask to open Create or confirm building.`
  );
}
