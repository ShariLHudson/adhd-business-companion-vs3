/**
 * Explicit Create detection for recognition Create-gate.
 * Discoveries must not open Create unless the member clearly asks to build.
 */

/**
 * True when the member explicitly asks to open Create / draft / build something.
 * Weak "I discovered how to create…" language is NOT enough.
 */
export function isExplicitCreateRequestForRecognition(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Hard open Create / workspace
  if (
    /\b(?:open (?:the )?create|open create(?:\s+workspace)?|start (?:a )?draft|open (?:the )?content generator)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Imperative create/draft/write of a concrete artifact
  if (
    /^(?:please\s+)?(?:help me\s+)?(?:write|draft|create|build|generate|compose)\s+(?:a|an|my|the|this|that)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // "write it" / "draft it" after prior context
  if (/^(?:please\s+)?(?:write|draft|generate|create)\s+it\b/i.test(t)) {
    return true;
  }

  // Explicit "I want you to create/build…"
  if (
    /\b(?:i want you to|please)\s+(?:write|draft|create|build|generate)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Discovery language that must stay in recognition — even if it contains "create".
 * Example: "I discovered how to create an amazing app…"
 */
export function isDiscoveryLanguageNotCreate(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;

  const discoveryStems = [
    "i figured",
    "i discovered",
    "i learned",
    "i solved",
    "i don't want to forget",
    "i do not want to forget",
    "i helped",
    "i prevented",
    "i made progress",
    "it worked",
    "i realized",
    "worth remembering",
  ];
  if (discoveryStems.some((s) => t.includes(s))) return true;

  // "how to create X" as a discovery narrative, not a create command
  if (
    /\b(?:discovered|figured out|learned)\b.+\b(?:how to|way to)\s+create\b/i.test(
      text,
    )
  ) {
    return true;
  }

  return false;
}
