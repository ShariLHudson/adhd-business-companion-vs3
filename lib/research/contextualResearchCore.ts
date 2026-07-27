/**
 * Shared contextual-research core — config-driven prompts + pure, per-area
 * append-only accumulation. One home for the mechanics that Client Avatar,
 * Business Estate, and the Research Library all reuse; only the persona/labels
 * (config) and the fields being researched differ.
 *
 * Pure + testable; panels and builders stay thin.
 */

/** What the workspace already knows about the active question/field. */
export type ResearchContext = {
  questionLabel: string;
  /** The current answer/draft for this question, if any. */
  currentAnswer?: string;
  /** Relevant prior answers already captured, e.g. { label, value }. */
  priorAnswers?: Array<{ label: string; value: string }>;
  /** Entity identity (avatar name / business name), if available. */
  entityName?: string;
};

/**
 * The per-context copy that makes the shared prompt speak in the right voice.
 * Client Avatar and Business Estate supply different values; the assembly is
 * identical, so the two experiences read and behave the same.
 */
export type ResearchPersonaConfig = {
  /** Opening persona + entity framing lines. */
  intro: string[];
  /** Prefix for the optional entity name line, e.g. "Client name/label: ". */
  nameLinePrefix?: string;
  /** Header shown before prior answers. */
  priorsHeader: string;
  /** Label for the current draft answer, e.g. "Their current draft answer:". */
  draftLabel: string;
  /** Text used when the draft is empty, e.g. "(empty so far)". */
  emptyDraftText: string;
  /** Guidance / guardrail lines appended at the end. */
  guidance: string[];
};

/** Scoped system prompt — the assistant helps think through ONE question. */
export function buildResearchSystemPrompt(
  config: ResearchPersonaConfig,
  ctx: ResearchContext,
): string {
  const priors = (ctx.priorAnswers ?? [])
    .filter((p) => p.value.trim())
    .map((p) => `- ${p.label}: ${p.value.trim()}`);
  const nameLine =
    ctx.entityName?.trim() && config.nameLinePrefix
      ? `${config.nameLinePrefix}${ctx.entityName.trim()}`
      : "";
  const draftLine = ctx.currentAnswer?.trim()
    ? `${config.draftLabel} "${ctx.currentAnswer.trim()}"`
    : `${config.draftLabel} ${config.emptyDraftText}`;
  return [
    ...config.intro,
    "",
    `The question: "${ctx.questionLabel}"`,
    nameLine,
    priors.length ? config.priorsHeader : "",
    ...priors,
    draftLine,
    "",
    ...config.guidance,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** The automatic first request, sent for the member so they need not type it. */
export function buildResearchAutoPrompt(ctx: ResearchContext): string {
  const answer = ctx.currentAnswer?.trim();
  return answer
    ? `Help me think through this question. Here's my draft so far: "${answer}". Give me a few angles, examples, and possible wording I could adapt.`
    : `Help me think through this question. Give me a few concrete angles, examples, and possible wording I could adapt to write my own answer.`;
}

/**
 * Append a research response to an existing answer without ever overwriting.
 * Preserves prior text and separates additions with a clean blank line.
 */
export function appendResearchToAnswer(existing: string, addition: string): string {
  const add = addition.trim();
  if (!add) return existing;
  const base = existing ?? "";
  if (!base.trim()) return add;
  return `${base.replace(/\s+$/, "")}\n\n${add}`;
}

/**
 * Research is scoped per area. An area key is either a plain field key
 * (e.g. "behavioral") or a custom field addressed by its PERMANENT id
 * ("custom:<id>") — never by array index, so threads survive reorder / insert /
 * delete / rename. These helpers keep routing pure so hosts stay thin and
 * "Add to This Area" is append-only, per area, always.
 */
export type ResearchAreaField = { id?: string; label: string; value: string };
export type ResearchAreaData = Record<string, unknown> & {
  custom?: ResearchAreaField[];
};

const CUSTOM_PREFIX = "custom:";

/** Parse a `custom:<id>` key into its field id, or null for module keys. */
export function customFieldId(areaKey: string): string | null {
  if (!areaKey.startsWith(CUSTOM_PREFIX)) return null;
  const id = areaKey.slice(CUSTOM_PREFIX.length);
  return id ? id : null;
}

/** The thread key for an area. Areas are prefixed with `research:` so they
 * never collide with normal question keys. */
export function researchThreadKey(areaKey: string): string {
  return `research:${areaKey}`;
}

/**
 * Resolve an area key to its display label and current text. `moduleLabels`
 * maps module keys to labels. Returns null for keys that don't resolve (e.g. a
 * custom field that was deleted), so callers can skip cleanly.
 */
export function describeResearchArea(
  research: ResearchAreaData,
  areaKey: string,
  moduleLabels: Record<string, string>,
): { label: string; currentAnswer: string } | null {
  const id = customFieldId(areaKey);
  if (id !== null) {
    const field = research.custom?.find((c) => c.id === id);
    if (!field) return null;
    return {
      label: field.label.trim() || "Custom research field",
      currentAnswer: field.value ?? "",
    };
  }
  const label = moduleLabels[areaKey];
  if (!label) return null;
  return { label, currentAnswer: String(research[areaKey] ?? "") };
}

/**
 * Append a chosen research reply into a single area, never overwriting and
 * never touching any other area. A `custom:<id>` key with no matching field
 * (e.g. deleted) returns the research unchanged; a module key that is empty is
 * created, since an empty module is valid, not unknown.
 */
export function appendToResearchArea(
  research: ResearchAreaData,
  areaKey: string,
  text: string,
): ResearchAreaData {
  if (!areaKey) return research;
  const id = customFieldId(areaKey);
  if (id !== null) {
    const custom = [...(research.custom ?? [])];
    const at = custom.findIndex((c) => c.id === id);
    if (at < 0) return research;
    custom[at] = {
      ...custom[at]!,
      value: appendResearchToAnswer(custom[at]!.value ?? "", text),
    };
    return { ...research, custom };
  }
  return {
    ...research,
    [areaKey]: appendResearchToAnswer(String(research[areaKey] ?? ""), text),
  };
}

/**
 * Set (replace) a single area's value — used by accumulation, which computes the
 * full append-only answer and writes it back. A `custom:<id>` with no matching
 * field returns the research unchanged.
 */
export function setResearchAreaValue(
  research: ResearchAreaData,
  areaKey: string,
  value: string,
): ResearchAreaData {
  if (!areaKey) return research;
  const id = customFieldId(areaKey);
  if (id !== null) {
    const custom = [...(research.custom ?? [])];
    const at = custom.findIndex((c) => c.id === id);
    if (at < 0) return research;
    custom[at] = { ...custom[at]!, value };
    return { ...research, custom };
  }
  return { ...research, [areaKey]: value };
}

/**
 * Research accumulation. Dedup is by stable message id ONLY — never by
 * comparing text — so legitimately repeated ideas are preserved and the same
 * response is never appended twice.
 */
export type ResearchMessageLike = {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
  error?: boolean;
};

/** Result of an accumulation action: the new (append-only) answer plus the ids
 * that were newly added (to record in the thread's added set). */
export type ResearchAdditionResult = { answer: string; addedIds: string[] };

/** Useful assistant responses (non-error, non-hidden) not yet added, in order. */
export function collectAddableResponses(
  messages: readonly ResearchMessageLike[],
  addedResponseIds: readonly string[],
): ResearchMessageLike[] {
  const added = new Set(addedResponseIds);
  return messages.filter(
    (m) => m.role === "assistant" && !m.error && !m.hidden && !added.has(m.id),
  );
}

/** Append one response, unless it was already added or isn't a useful reply. */
export function addResponseToAnswer(
  answer: string,
  message: ResearchMessageLike,
  addedResponseIds: readonly string[],
): ResearchAdditionResult {
  if (message.role !== "assistant" || message.error || message.hidden) {
    return { answer, addedIds: [] };
  }
  if (addedResponseIds.includes(message.id)) return { answer, addedIds: [] };
  return {
    answer: appendResearchToAnswer(answer, message.content),
    addedIds: [message.id],
  };
}

/** Append the whole session's useful, not-yet-added responses in order. */
export function addSessionToAnswer(
  answer: string,
  messages: readonly ResearchMessageLike[],
  addedResponseIds: readonly string[],
): ResearchAdditionResult {
  const addable = collectAddableResponses(messages, addedResponseIds);
  let next = answer;
  const addedIds: string[] = [];
  for (const m of addable) {
    next = appendResearchToAnswer(next, m.content);
    addedIds.push(m.id);
  }
  return { answer: next, addedIds };
}
