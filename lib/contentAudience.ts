/**
 * Audience-first content generation — audience drives language, examples, pain
 * points, and CTAs. Tone is optional and defaults to matching the audience.
 */

import { audienceContextForAI, getAudiences, type Audience } from "@/lib/audiences";
import {
  businessContextSummary,
  getAvatars,
  type IdealClientAvatar,
} from "@/lib/companionStore";

export type ContentAudienceKind = "preset" | "avatar" | "saved" | "custom";

export type ContentAudienceOption = {
  id: string;
  kind: ContentAudienceKind;
  label: string;
  /** Rich block for AI — problems, goals, language cues. */
  promptBlock: string;
};

export const MATCH_AUDIENCE_TONE_ID = "match-audience";

export const CONTENT_VOICE_TONES = [
  { id: MATCH_AUDIENCE_TONE_ID, label: "Match Audience" },
  { id: "supportive", label: "Supportive" },
  { id: "encouraging", label: "Encouraging" },
  { id: "direct", label: "Direct" },
  { id: "professional", label: "Professional" },
  { id: "educational", label: "Educational" },
  { id: "storytelling", label: "Storytelling" },
  { id: "funny", label: "Funny" },
  { id: "inspirational", label: "Inspirational" },
] as const;

export type ContentVoiceToneId = (typeof CONTENT_VOICE_TONES)[number]["id"];

const SELECTION_KEY = "companion-content-audience-selection-v1";
const CUSTOM_NAME_KEY = "companion-content-audience-custom-v1";

const PRESET_AUDIENCES: Omit<ContentAudienceOption, "kind">[] = [
  {
    id: "preset:adhd-business",
    label: "ADHD Business Clients",
    promptBlock: `AUDIENCE: ADHD Business Clients — solo founders and small business owners with ADHD.
Problems: overwhelm, trouble starting, perfectionism before shipping, scattered focus, too many open loops.
Goals: steady momentum, simple systems, finishing what they start, revenue without burnout.
Language: ADHD-aware — tiny steps, no shame, practical, momentum over perfection.
Example angle: "ADHD entrepreneurs often spend hours perfecting a task before sharing it. What would happen if you shipped version one today?"`,
  },
  {
    id: "preset:wisdom",
    label: "Wisdom Companion Prospects",
    promptBlock: `AUDIENCE: Wisdom Companion Prospects — reflective seekers wanting principle-led guidance.
Problems: noise, urgency culture, craving depth and meaning, decision fatigue.
Goals: clarity, timeless framing, calm confidence, living aligned with values.
Language: reflective, metaphor-friendly, unhurried, teaches without preaching.`,
  },
  {
    id: "preset:coaches",
    label: "Coaches",
    promptBlock: `AUDIENCE: Coaches — practitioners building programs, clients, and authority.
Problems: client results pressure, differentiation, content that converts without feeling salesy.
Goals: transformation stories, enrolled clients, repeatable frameworks, trusted expertise.
Language: peer-to-peer, outcomes-focused, client transformation, ethical persuasion.`,
  },
  {
    id: "preset:authors",
    label: "Authors",
    promptBlock: `AUDIENCE: Authors — writers building books, essays, and thought leadership.
Problems: finishing manuscripts, platform building, standing out in a crowded market.
Goals: readers, credibility, a body of work, speaking and consulting opportunities.
Language: literary when appropriate, intellectual authority, reader empathy.`,
  },
  {
    id: "preset:speakers",
    label: "Speakers",
    promptBlock: `AUDIENCE: Speakers — keynotes, workshops, and stage-ready messaging.
Problems: booking gigs, memorable talks, translating expertise to a room.
Goals: standing ovations, referrals, signature talk, clear takeaways.
Language: spoken-word rhythm, stories, callbacks, audience participation hooks.`,
  },
  {
    id: "preset:consultants",
    label: "Consultants",
    promptBlock: `AUDIENCE: Consultants — advisors selling expertise and outcomes to decision-makers.
Problems: proving ROI, long sales cycles, scope creep, commoditization.
Goals: trusted advisor status, premium engagements, clear outcomes.
Language: decision-maker friendly, evidence-based, risk reduction, business impact.`,
  },
  {
    id: "preset:workshop-attendees",
    label: "Workshop Attendees",
    promptBlock: `AUDIENCE: Workshop Attendees — people in a live or virtual learning session right now.
Problems: information overload, wanting actionable takeaways, fear of falling behind.
Goals: one clear win today, connection with peers, confidence to try the method.
Language: participatory, "you'll leave with…", exercises, live energy, practical next step.`,
  },
  {
    id: "preset:small-business",
    label: "Small Business Owners",
    promptBlock: `AUDIENCE: Small Business Owners — general SMB operators without ADHD-specific framing.
Problems: wearing every hat, cash flow, marketing consistency, time scarcity.
Goals: growth, stability, systems that run without them, loyal customers.
Language: practical, ROI-minded, respect their time, no jargon.`,
  },
];

function presetOption(
  p: (typeof PRESET_AUDIENCES)[number],
): ContentAudienceOption {
  return { ...p, kind: "preset" };
}

function avatarOption(avatar: IdealClientAvatar): ContentAudienceOption {
  const parts = [
    `AUDIENCE: ${avatar.name}${avatar.tagline ? ` — ${avatar.tagline}` : ""}.`,
    avatar.who && `Who they are: ${avatar.who}`,
    avatar.painPoints && `Pain points: ${avatar.painPoints}`,
    avatar.motivations && `Motivations: ${avatar.motivations}`,
    avatar.objections && `Objections: ${avatar.objections}`,
    avatar.triggers && `Buying triggers: ${avatar.triggers}`,
    avatar.contentPrefs && `Content preferences: ${avatar.contentPrefs}`,
  ].filter(Boolean);
  return {
    id: `avatar:${avatar.id}`,
    kind: "avatar",
    label: avatar.name,
    promptBlock: parts.join("\n"),
  };
}

function savedAudienceOption(a: Audience): ContentAudienceOption {
  return {
    id: `saved:${a.id}`,
    kind: "saved",
    label: a.name,
    promptBlock: audienceContextForAI(a.id),
  };
}

export function listContentAudienceOptions(): ContentAudienceOption[] {
  const presets = PRESET_AUDIENCES.map(presetOption);
  const presetLabels = new Set(presets.map((p) => p.label.toLowerCase()));

  const avatars =
    typeof window === "undefined"
      ? []
      : getAvatars().map(avatarOption);

  const saved =
    typeof window === "undefined"
      ? []
      : getAudiences()
          .filter((a) => !presetLabels.has(a.name.toLowerCase()))
          .map(savedAudienceOption);

  return [...presets, ...avatars, ...saved];
}

export function findContentAudienceOption(
  id: string | null | undefined,
): ContentAudienceOption | undefined {
  if (!id) return undefined;
  if (id === "custom") {
    const name = getCustomAudienceName();
    if (!name.trim()) return undefined;
    return {
      id: "custom",
      kind: "custom",
      label: name.trim(),
      promptBlock: `AUDIENCE (custom): ${name.trim()}. Write specifically for this group — use their language, pain points, and desired outcomes. Do not write generic advice.`,
    };
  }
  return listContentAudienceOptions().find((o) => o.id === id);
}

export function getSelectedContentAudienceId(): string {
  if (typeof window === "undefined") return PRESET_AUDIENCES[0]!.id;
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    if (!raw) return PRESET_AUDIENCES[0]!.id;
    const parsed = JSON.parse(raw) as { audienceId?: string };
    const id = parsed.audienceId;
    if (id === "custom" && getCustomAudienceName().trim()) return "custom";
    if (id && findContentAudienceOption(id)) return id;
  } catch {
    /* fall through */
  }
  return PRESET_AUDIENCES[0]!.id;
}

export function getSelectedContentToneId(): ContentVoiceToneId {
  if (typeof window === "undefined") return MATCH_AUDIENCE_TONE_ID;
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    if (!raw) return MATCH_AUDIENCE_TONE_ID;
    const parsed = JSON.parse(raw) as { toneId?: string };
    const found = CONTENT_VOICE_TONES.find((t) => t.id === parsed.toneId);
    return found?.id ?? MATCH_AUDIENCE_TONE_ID;
  } catch {
    return MATCH_AUDIENCE_TONE_ID;
  }
}

export function setContentAudienceSelection(
  audienceId: string,
  toneId?: ContentVoiceToneId,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SELECTION_KEY,
      JSON.stringify({
        audienceId,
        toneId: toneId ?? getSelectedContentToneId(),
      }),
    );
    window.dispatchEvent(new Event("content-audience-updated"));
  } catch {
    /* storage unavailable */
  }
}

export function setContentToneId(toneId: ContentVoiceToneId): void {
  setContentAudienceSelection(getSelectedContentAudienceId(), toneId);
}

export function getCustomAudienceName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(CUSTOM_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setCustomAudienceName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_NAME_KEY, name);
    if (name.trim()) {
      setContentAudienceSelection("custom");
    }
  } catch {
    /* storage unavailable */
  }
}

export function selectedAudienceLabel(): string {
  const opt = findContentAudienceOption(getSelectedContentAudienceId());
  return opt?.label ?? "ADHD Business Clients";
}

export function avatarIdFromAudienceId(
  audienceId: string | null | undefined,
): string | undefined {
  if (!audienceId?.startsWith("avatar:")) return undefined;
  return audienceId.slice("avatar:".length);
}

export function resolveToneForGeneration(
  toneId: ContentVoiceToneId = getSelectedContentToneId(),
  audienceBlock?: string,
): string {
  if (toneId === MATCH_AUDIENCE_TONE_ID) {
    return audienceBlock
      ? "Match the audience's natural voice — use their language, pain points, and goals. Do not default to generic motivational tone."
      : "warm, clear, and audience-appropriate";
  }
  const tone = CONTENT_VOICE_TONES.find((t) => t.id === toneId);
  return tone?.label.toLowerCase() ?? "warm and clear";
}

const AUDIENCE_FIRST_RULES = `AUDIENCE-FIRST RULES:
- The audience is more important than tone or category.
- Use audience-specific language, examples, pain points, desired outcomes, stories, and calls to action.
- Do NOT write generic content that could apply to anyone.
- BAD (generic): "Feeling overwhelmed by perfectionism? Remember, done is better than perfect."
- GOOD (ADHD business): "ADHD entrepreneurs often spend hours trying to perfect a task before sharing it. What would happen if you shipped version one today and improved it later?"`;

export function buildAudiencePromptBlock(
  audienceId?: string | null,
): string | undefined {
  const opt = findContentAudienceOption(audienceId ?? getSelectedContentAudienceId());
  if (!opt?.promptBlock.trim()) return undefined;
  return `${AUDIENCE_FIRST_RULES}\n\nPRIMARY AUDIENCE:\n${opt.promptBlock}`;
}

/** Combined context for snippets, templates, create, and draft generation. */
export function buildContentGenerationContext(opts?: {
  audienceId?: string;
  toneId?: ContentVoiceToneId;
  businessContext?: string;
}): string {
  const audienceBlock = buildAudiencePromptBlock(opts?.audienceId);
  const toneId = opts?.toneId ?? getSelectedContentToneId();
  const toneLine =
    toneId === MATCH_AUDIENCE_TONE_ID
      ? "Voice/Tone: Match Audience (derive from the primary audience above)."
      : `Voice/Tone: ${resolveToneForGeneration(toneId, audienceBlock)}.`;

  const parts = [audienceBlock, toneLine, opts?.businessContext].filter(Boolean);
  return parts.join("\n\n");
}

export function audienceIdsForStorage(audienceId?: string): string[] | undefined {
  const id = audienceId ?? getSelectedContentAudienceId();
  if (!id || id === "custom") return undefined;
  return [id];
}

/** Business + audience + tone — use for all generation API calls. */
export function buildGenerationContextWithBusiness(opts?: {
  audienceId?: string;
  toneId?: ContentVoiceToneId;
  /** Legacy avatar override (e.g. email generator). */
  avatarId?: string;
}): string {
  const audienceId =
    opts?.avatarId != null
      ? `avatar:${opts.avatarId}`
      : (opts?.audienceId ?? getSelectedContentAudienceId());
  const avatarId = opts?.avatarId ?? avatarIdFromAudienceId(audienceId);
  return buildContentGenerationContext({
    audienceId,
    toneId: opts?.toneId ?? getSelectedContentToneId(),
    businessContext: businessContextSummary(avatarId),
  });
}
