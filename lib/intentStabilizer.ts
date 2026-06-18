// Pre-routing intent normalization — runs before Chat, Create, or bridge decisions.

import { catalogIntentTypeRules } from "./createCatalog";
import { isInformationIntent } from "./companionIntentRouting";
import {
  isExplicitCreationRequest,
  isContentBrainstorming,
  shouldSuppressCreatePending,
} from "./messageClassification";

export type IntentAction = "chat" | "make" | "stabilize" | "edit-draft";

export type ResolvedIntent = {
  action: IntentAction;
  type?: string;
  confidence: number;
  topic: string;
  rawText: string;
  reason: string;
  multiIntent: boolean;
  vague: boolean;
  draftContent?: string;
};

export const MAKE_CONFIDENCE_THRESHOLD = 0.85;

const STRONG_INTENT_SHIFT_RE =
  /\b(actually|rather|switch(?:ing)? to|change to|make it an?)\b/gi;

const CREATE_VERB_RE =
  /\b(write|draft|create|compose|generate|put together|need to write|want to write|help me write|help me create|help me draft|help me with a|help me with an|build(?:ing)?|start(?:ing)?)\b/i;

/** Global variant — for stripping only (never .test() this). */
const CREATE_VERBS_G =
  /\b(write|draft|create|compose|generate|put together|need to write|want to write|help me write|help me create|help me draft|help me with a|help me with an|build(?:ing)?|start(?:ing)?)\b/gi;

/** "I need a …", "want a …", "make a …" (not "make it better"). */
const NEED_WANT_DELIVERABLE_RE =
  /\b(?:i\s+)?(?:need|want)\s+(?:to\s+)?(?:a|an|the|my)\s+/i;

const MAKE_DELIVERABLE_RE =
  /\b(?:make|making)\s+(?:a|an|the|my)\s+(?!it\b|this\b|that\b)/i;

const TYPE_RULES: { type: string; re: RegExp }[] = catalogIntentTypeRules();

const OTHER_TASK_RE =
  /\b(homepage|home\s+page|website|fix\s+my|invoice|bookkeeping|taxes|call\s+the|meeting|schedule)\b/gi;

const VAGUE_CREATE =
  /\b(help me write something|write something|something for my business|help (?:me )?with (?:some )?content|need to do a message|can you help me write|help me with a message)\b/i;

const EDIT_RE =
  /\b(rewrite|re-?write|edit|revise|customi[sz]e|make it better|make this better|adjust|tweak|reword|shorten|punch it up|change this|polish)\b/i;

export type ResolveIntentContext = {
  overwhelmed?: boolean;
  askingHow?: boolean;
  lastAct?: {
    kind: string;
    contentType?: string;
    content?: string;
    title?: string;
  } | null;
};

function cleanTopic(s: string): string {
  return s
    .replace(/^[\s,.:;!?-]+|[\s,.:;!?-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull a human topic from natural language (about X, for X, or stripped remainder). */
export function extractTopic(text: string, makeType?: string | null): string {
  const t = text.trim();
  if (!t) return "";

  const needA = t.match(/\b(?:i\s+)?need\s+(?:a|an)\s+(.+?)(?:[.!?]|$)/i);
  if (needA?.[1] && needA[1].trim().length > 3) {
    return cleanTopic(needA[1]).slice(0, 160);
  }

  const wantA = t.match(/\b(?:i\s+)?want\s+(?:a|an)\s+(.+?)(?:[.!?]|$)/i);
  if (wantA?.[1] && wantA[1].trim().length > 3) {
    return cleanTopic(wantA[1]).slice(0, 160);
  }

  const makeA = t.match(
    /\b(?:make|create|write|draft)\s+(?:a|an)\s+(.+?)(?:[.!?]|$)/i,
  );
  if (makeA?.[1] && makeA[1].trim().length > 3) {
    return cleanTopic(makeA[1]).slice(0, 160);
  }

  const about = t.match(/\babout\s+(.+?)(?:[.!?]|$)/i);
  if (about?.[1] && about[1].trim().length > 3) {
    return cleanTopic(about[1]).slice(0, 160);
  }

  const regarding = t.match(/\bregarding\s+(.+?)(?:[.!?]|$)/i);
  if (regarding?.[1]) return cleanTopic(regarding[1]).slice(0, 160);

  const onTopic = t.match(/\bon\s+(.+?)(?:[.!?]|$)/i);
  if (
    onTopic?.[1] &&
    !/\b(my|the)\s+(website|homepage|day)\b/i.test(onTopic[1])
  ) {
    return cleanTopic(onTopic[1]).slice(0, 160);
  }

  const forM = t.match(/\bfor\s+(.+?)(?:[.!?]|$)/i);
  if (forM?.[1] && forM[1].trim().length > 4) {
    const candidate = cleanTopic(forM[1]);
    if (!/^my\s+business$/i.test(candidate)) {
      return candidate.slice(0, 160);
    }
  }

  let s = t
    .replace(STRONG_INTENT_SHIFT_RE, " ")
    .replace(/\binstead\b/gi, " ")
    .replace(CREATE_VERBS_G, " ")
    .replace(
      /\b(please|can you|could you|i need to|i want to|help me|just)\b/gi,
      " ",
    );

  for (const { re } of TYPE_RULES) {
    s = s.replace(re, " ");
  }
  if (makeType) {
    s = s.replace(new RegExp(`\\b${makeType}s?\\b`, "gi"), " ");
  }

  s = cleanTopic(
    s.replace(/\b(a|an|the|my|to|for|with|instead|actually)\b/gi, " "),
  );

  if (s.length > 3) return s.slice(0, 160);
  return "";
}

function buildIntent(
  action: IntentAction,
  rawText: string,
  fields: {
    type?: string;
    confidence: number;
    reason: string;
    multiIntent?: boolean;
    vague?: boolean;
    topic?: string;
    draftContent?: string;
  },
): ResolvedIntent {
  const topic =
    fields.topic ??
    (fields.type ? extractTopic(rawText, fields.type) : extractTopic(rawText));
  return {
    action,
    type: fields.type,
    confidence: fields.confidence,
    topic,
    rawText,
    reason: fields.reason,
    multiIntent: fields.multiIntent ?? false,
    vague: fields.vague ?? false,
    draftContent: fields.draftContent,
  };
}

/** When the user corrects mid-sentence, only the tail after the last shift counts. */
export function effectiveIntentText(text: string): {
  segment: string;
  shifted: boolean;
} {
  const strong = [...text.matchAll(STRONG_INTENT_SHIFT_RE)];
  if (strong.length) {
    const last = strong[strong.length - 1]!;
    return { segment: text.slice(last.index!), shifted: true };
  }

  const typedInstead = text.match(
    /\b(?:make it )?(?:an? )?(?:emails?|posts?|plans?)\s+instead\b/i,
  );
  if (typedInstead?.index !== undefined) {
    return { segment: text.slice(typedInstead.index), shifted: true };
  }

  const insteadAt = text.search(/\binstead\b/i);
  if (insteadAt > 0) {
    const tail = text.slice(insteadAt);
    if (findLastMakeType(tail)) {
      return { segment: tail, shifted: true };
    }
  }

  return { segment: text, shifted: false };
}

export function hasCreateIntent(text: string): boolean {
  if (isInformationIntent(text)) return false;
  if (isContentBrainstorming(text)) return false;
  if (isExplicitCreationRequest(text)) return true;
  if (shouldSuppressCreatePending(text)) return false;
  if (CREATE_VERB_RE.test(text)) return true;
  if (NEED_WANT_DELIVERABLE_RE.test(text) && findLastMakeType(text)) return true;
  if (MAKE_DELIVERABLE_RE.test(text) && findLastMakeType(text)) return true;
  if (/\bhelp me\b/i.test(text) && findLastMakeType(text)) return true;
  return false;
}

export function findLastMakeType(text: string): string | null {
  let best: { type: string; index: number } | null = null;
  for (const { type, re } of TYPE_RULES) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (!best || m.index > best.index) best = { type, index: m.index };
    }
  }
  return best?.type ?? null;
}

function countDistinctMakeTypes(text: string): number {
  const found = new Set<string>();
  for (const { type, re } of TYPE_RULES) {
    re.lastIndex = 0;
    if (re.test(text)) found.add(type);
  }
  return found.size;
}

function hasOtherTasks(text: string): boolean {
  OTHER_TASK_RE.lastIndex = 0;
  return OTHER_TASK_RE.test(text);
}

/** Multiple deliverables or mixed create + unrelated work → chat only. */
export function isMultiIntent(text: string): boolean {
  if (countDistinctMakeTypes(text) >= 2) return true;
  const makeType = findLastMakeType(text);
  if (makeType && hasOtherTasks(text)) return true;
  const clauses = text.split(/\band\b|,/i).filter((c) => c.trim().length > 3);
  if (clauses.length >= 2) {
    const types = new Set<string>();
    for (const c of clauses) {
      const t = findLastMakeType(c);
      if (t) types.add(t);
    }
    if (types.size >= 2) return true;
    if (types.size >= 1 && clauses.some((c) => hasOtherTasks(c))) return true;
  }
  return false;
}

export function resolveIntent(
  text: string,
  ctx: ResolveIntentContext = {},
): ResolvedIntent {
  const rawText = text.trim();

  if (!rawText) {
    return buildIntent("chat", rawText, {
      confidence: 0,
      reason: "empty input",
    });
  }

  if (isInformationIntent(rawText)) {
    return buildIntent("chat", rawText, {
      confidence: 1,
      reason: "information intent — stay in chat",
    });
  }

  if (ctx.overwhelmed || ctx.askingHow) {
    return buildIntent("chat", rawText, {
      confidence: 1,
      reason: "overwhelm or how-to — stay in chat",
    });
  }

  if (
    ctx.lastAct?.kind === "draft" &&
    ctx.lastAct.content &&
    EDIT_RE.test(rawText)
  ) {
    return buildIntent("edit-draft", rawText, {
      type: ctx.lastAct.contentType,
      topic: ctx.lastAct.title ?? extractTopic(rawText, ctx.lastAct.contentType),
      confidence: 1,
      reason: "edit existing draft",
      draftContent: ctx.lastAct.content,
    });
  }

  const { segment, shifted } = effectiveIntentText(rawText);
  const scope = shifted ? segment : rawText;

  if (isMultiIntent(scope)) {
    return buildIntent("chat", rawText, {
      confidence: 0.25,
      reason: "multi-intent — reduce in chat first",
      multiIntent: true,
    });
  }

  const type = findLastMakeType(scope);
  const hasCreate = hasCreateIntent(rawText);
  const vague =
    VAGUE_CREATE.test(rawText) ||
    (hasCreate &&
      !type &&
      /\b(something|anything|stuff|content|message)\b/i.test(rawText));

  if (vague && hasCreate) {
    return buildIntent("stabilize", rawText, {
      confidence: 0.55,
      reason: "vague create intent — pick type",
      vague: true,
    });
  }

  if (!type) {
    return buildIntent("chat", rawText, {
      confidence: 0.5,
      reason: "no deliverable type detected",
    });
  }

  let confidence = 0.5;
  if (hasCreate) confidence += 0.35;
  if (shifted) confidence += 0.1;
  if (/\b(client|customer|subscriber|audience)\b/i.test(rawText)) {
    confidence += 0.05;
  }
  confidence = Math.min(confidence, 0.98);

  const topic = extractTopic(rawText, type);

  if (!hasCreate) {
    return buildIntent("chat", rawText, {
      type,
      topic,
      confidence: Math.min(0.75, confidence),
      reason: "type mentioned without create verb",
    });
  }

  if (confidence >= MAKE_CONFIDENCE_THRESHOLD) {
    return buildIntent("make", rawText, {
      type,
      topic,
      confidence,
      reason: shifted ? "intent override wins" : "explicit create intent",
    });
  }

  return buildIntent("chat", rawText, {
    type,
    topic,
    confidence,
    reason: "below confidence threshold — clarify in chat",
  });
}

export function bridgeFromResolved(
  resolved: ResolvedIntent,
): { type: string; brief: string; label: string } | null {
  if (shouldSuppressCreatePending(resolved.rawText)) return null;
  if (
    resolved.multiIntent ||
    resolved.action === "make" ||
    resolved.action === "stabilize" ||
    resolved.action === "edit-draft"
  ) {
    return null;
  }
  if (!resolved.type || resolved.confidence < 0.6) return null;

  const labels: Record<string, string> = {
    Email: "Want me to turn this into an email?",
    Post: "Want me to draft this as a post?",
    Plan: "Want me to turn this into a plan?",
  };

  return {
    type: resolved.type,
    brief: resolved.topic || resolved.rawText,
    label: labels[resolved.type] ?? "Want me to open this in Create?",
  };
}

/** Chat line when the app auto-opens Create beside the user. */
export function buildCreateRouteMessage(resolved: ResolvedIntent): string {
  const topic = resolved.topic?.trim();
  if (topic) {
    return `I'm opening **Create** so we can build ${topic}.`;
  }
  const type = resolved.type?.toLowerCase();
  if (type && type !== "content") {
    return `I'm opening **Create** so we can build a ${type}.`;
  }
  return `I'm opening **Create** so we can build this together.`;
}

export function intentHintForChat(resolved: ResolvedIntent): string | undefined {
  if (resolved.multiIntent) {
    return "MULTI-INTENT TURN: User listed several tasks. Pick ONE priority only. Do NOT draft emails/posts/plans in chat. Do NOT list every task. One suggestion OR one clarifying question — nothing else.";
  }
  if (resolved.reason === "below confidence threshold — clarify in chat" && resolved.type) {
    return `Intent may be a ${resolved.type} but is not confirmed. Clarify briefly — do NOT produce the full ${resolved.type} in chat.`;
  }
  return undefined;
}

/** Map stabilizer output → Create panel seed. */
export function toGenSeed(
  resolved: ResolvedIntent,
  extra?: { draft?: string },
): {
  type?: string;
  brief?: string;
  topic?: string;
  sourceText?: string;
  draft?: string;
} {
  return {
    type: resolved.type,
    brief: resolved.topic || resolved.rawText,
    topic: resolved.topic || undefined,
    sourceText: resolved.rawText,
    draft: extra?.draft ?? resolved.draftContent,
  };
}
