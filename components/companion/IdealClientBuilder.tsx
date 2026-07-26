"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteAvatar,
  getAvatars,
  saveAvatar,
  setPrimaryAvatar,
  setActiveAvatar,
  getActiveAvatar,
  duplicateAvatar,
  CLIENT_BEHAVIOR_TRAITS,
  TRAIT_EMOJI,
  AVATAR_RESEARCH_VERSION,
  type IdealClientAvatar,
  type AvatarResearch,
  type ResearchThreadMessage,
} from "@/lib/companionStore";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { ContextualWorkspaceShell } from "@/components/companion/contextualWorkspace/ContextualWorkspaceShell";
import { WorkspaceStepControls } from "@/components/companion/contextualWorkspace/WorkspaceStepControls";
import { ContextualResearchPanel } from "@/components/companion/contextualWorkspace/ContextualResearchPanel";
import {
  addResponseToAnswer,
  addSessionToAnswer,
  buildAvatarResearchAutoPrompt,
  buildAvatarResearchSystemPrompt,
  describeResearchArea,
  researchThreadKey,
  setResearchAreaValue,
} from "@/lib/clientAvatarResearch";
import {
  avatarReportGroups,
  avatarStatus,
  buildAvatarPrintHtml,
  buildAvatarReportHtml,
  isAvatarComplete,
  type AvatarPrintMode,
} from "@/lib/clientAvatarPrint";
import type { WorkspaceFieldId } from "@/lib/workspaceAwareness";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";
import type { ClientAvatarStepKey } from "@/lib/clientAvatarCoach";
import { snapshotFromBuilderInput } from "@/lib/clientAvatarCoach";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";

// Curated identity marks — double as quick "icons" and emoji avatars.
const EMOJI_CHOICES = [
  "🧑‍💻",
  "🧠",
  "🌿",
  "🚀",
  "💼",
  "✨",
  "🌱",
  "⛰️",
  "🧭",
  "🎯",
  "❤️",
  "👤",
];

type StepKey =
  | "who"
  | "painPoints"
  | "goals"
  | "currentBehavior"
  | "solution"
  | "behavior"
  | "insights"
  | "expand"
  | "research"
  | "identity"
  | "revenue";

// The Step 10 research modules that hold printable answer content (distinct from
// the research-notebook metadata keys threads/summaries/addedResponses/…).
type ResearchModuleKey =
  | "behavioral"
  | "motivation"
  | "buying"
  | "communication"
  | "market"
  | "notes";

// Level 3 research modules — optional depth.
const RESEARCH_MODULES: {
  key: ResearchModuleKey;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  {
    key: "behavioral",
    emoji: "📊",
    label: "Behavioral patterns",
    hint: "How they react under stress, procrastinate, make decisions.",
  },
  {
    key: "motivation",
    emoji: "💡",
    label: "Motivation drivers",
    hint: "Urgency vs calm, reward sensitivity, fear-based vs growth.",
  },
  {
    key: "buying",
    emoji: "💸",
    label: "Buying behavior",
    hint: "What makes them buy fast, what delays them, trust triggers.",
  },
  {
    key: "communication",
    emoji: "🧠",
    label: "Communication preferences",
    hint: "Short vs detailed, emotional vs logical, steps vs overview.",
  },
  {
    key: "market",
    emoji: "🌍",
    label: "Market insights",
    hint: "Industry patterns, common objections, content preferences.",
  },
  {
    key: "notes",
    emoji: "✍️",
    label: "What I notice about this client",
    hint: "Your own observations and patterns from experience.",
  },
];

// Per-area research scoping: module key → "label — hint" so Step 10 research is
// automatically anchored to the exact area the member is refining.
const RESEARCH_MODULE_LABELS: Record<string, string> = Object.fromEntries(
  RESEARCH_MODULES.map((m) => [m.key, `${m.label} — ${m.hint}`]),
);

// Permanent id for a custom research field — minted on create so research
// threads survive reorder / insert / delete / rename (never keyed by index).
let customFieldSeq = 0;
function newCustomFieldId(): string {
  customFieldSeq += 1;
  return `cf_${customFieldSeq}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Load-time normalization for backward compatibility: legacy avatars whose
 * custom research fields predate stable ids get one minted here so their
 * research threads can key by id. Everything else is left untouched.
 */
function normalizeResearch(research: AvatarResearch | undefined): AvatarResearch {
  const r = research ?? {};
  if (!r.custom || r.custom.length === 0) return r;
  let changed = false;
  const custom = r.custom.map((c) => {
    if (c.id) return c;
    changed = true;
    return { ...c, id: newCustomFieldId() };
  });
  return changed ? { ...r, custom } : r;
}

// Research-first flow: quick identity → lightweight discovery → AI expand →
// review → optional deep refine. Early understanding = sharper AI sooner.
const STEPS: { key: StepKey; q: string; hint?: string }[] = [
  {
    key: "who",
    q: "Who do you help most often?",
    hint: "Give them a name and a quick description.",
  },
  {
    key: "identity",
    q: "Give them a face.",
    hint: "An emoji or photo makes them feel real — pick fast.",
  },
  { key: "painPoints", q: "What are they struggling with most?" },
  { key: "goals", q: "What are they trying to achieve?" },
  { key: "currentBehavior", q: "What slows them down or holds them back?" },
  {
    key: "expand",
    q: "🧠 Let's understand them — fast.",
    hint: "I'll turn your answers into a behavior profile you can tweak.",
  },
  {
    key: "behavior",
    q: "How do they tend to behave?",
    hint: "These shape tone, length, and CTA. (I may have pre-filled some.)",
  },
  {
    key: "insights",
    q: "A little more on what moves them (optional).",
    hint: "These insights help Spark shape future messaging, offers, content, and sales conversations for this client. Edit anything suggested, or add your own.",
  },
  { key: "solution", q: "How do you help them in a way others don't?" },
  {
    key: "research",
    q: "🔬 Refine this avatar further (optional).",
    hint: "Deeper research layers — only if you want. You can always come back.",
  },
  {
    key: "revenue",
    q: "Note the revenue from this client type? (optional)",
    hint: "This just saves a note for yourself — it doesn't track anything yet. It prepares this avatar for revenue features later. When you finish, you'll return to your Client Avatars, where you can review, print, or keep refining anytime.",
  },
];

type TextFieldKey = "painPoints" | "goals" | "currentBehavior" | "solution";

export type Form = {
  id?: string;
  name: string;
  who: string;
  painPoints: string;
  goals: string;
  currentBehavior: string;
  solution: string;
  tagline: string;
  emoji?: string;
  image?: string;
  revenue?: string;
  behaviorTraits: string[];
  motivations?: string;
  objections?: string;
  triggers?: string;
  contentPrefs?: string;
  research: AvatarResearch;
};

const AVATAR_FIELD_TO_FORM: Partial<
  Record<
    WorkspaceFieldId,
    keyof Pick<Form, TextFieldKey | "who" | "name" | "tagline">
  >
> = {
  "avatar-name": "name",
  "avatar-who": "who",
  "avatar-tagline": "tagline",
  "avatar-pain": "painPoints",
  "avatar-goals": "goals",
  "avatar-behavior": "currentBehavior",
  "avatar-solution": "solution",
};

const AVATAR_FIELD_TO_STEP: Partial<Record<WorkspaceFieldId, StepKey>> = {
  "avatar-name": "who",
  "avatar-who": "who",
  "avatar-tagline": "identity",
  "avatar-pain": "painPoints",
  "avatar-goals": "goals",
  "avatar-behavior": "currentBehavior",
  "avatar-solution": "solution",
};

const AVATAR_REPLACE_FIELDS = new Set(["name", "who", "tagline"]);

export const EMPTY: Form = {
  name: "",
  who: "",
  painPoints: "",
  goals: "",
  currentBehavior: "",
  solution: "",
  tagline: "",
  emoji: "👤",
  behaviorTraits: [],
  research: {},
};

// Free-text questions where an inline research conversation adds the most value.
const TEXT_RESEARCH_STEPS: readonly StepKey[] = [
  "who",
  "painPoints",
  "goals",
  "currentBehavior",
  "solution",
];

/**
 * Content signature (ignores id) — drives the "unsaved changes" (dirty) state
 * that enables Save Progress. Exported for focused tests: any change to a
 * standard answer, a Step 10 research area, or a custom field changes the
 * signature, so Save Progress enables regardless of which field the member
 * edited (and without requiring the question to be "complete").
 */
export function formSignature(f: Form): string {
  const { id: _id, ...rest } = f;
  void _id;
  return JSON.stringify(rest);
}

function AvatarMark({
  avatar,
  size,
}: {
  avatar: { emoji?: string; image?: string };
  size: number;
}) {
  if (avatar.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatar.image}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#1e4f4f]/10"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {avatar.emoji ?? "👤"}
    </div>
  );
}

export type IdealClientBuilderPresentation = {
  destinationKicker?: string;
  listHeading?: string;
  newAvatarLabel?: string;
  backToDestinationLabel?: string;
  newAvatarTitle?: string;
};

export function IdealClientBuilder({
  focusField,
  focusStamp,
  chatFieldFill,
  coachKickoff,
  onStartNew,
  onAvatarSaved,
  onContextChange,
  onStepAdvance,
  onBuildComplete,
  onCoachSnapshot,
  onReturnHome,
  presentation,
}: {
  focusField?: WorkspaceFieldId | null;
  focusStamp?: number;
  chatFieldFill?: {
    field: WorkspaceFieldId;
    value: string;
    key: number;
  } | null;
  /** When set, starts a fresh coach-guided build flow. */
  coachKickoff?: number;
  /** Opens split chat + Step 1 kickoff (New Avatar). */
  onStartNew?: () => void;
  onAvatarSaved?: (avatar: IdealClientAvatar) => void;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  onStepAdvance?: (step: ClientAvatarStepKey, stepIndex: number) => void;
  onBuildComplete?: () => void;
  onCoachSnapshot?: (snapshot: ReturnType<typeof snapshotFromBuilderInput>) => void;
  /**
   * Leave the whole workspace for Welcome Home. When provided, the builder
   * shows an always-visible workspace-level exit (in addition to the
   * question-level Back). The host wires this to its canonical home nav.
   */
  onReturnHome?: () => void;
  presentation?: IdealClientBuilderPresentation;
} = {}) {
  const listHeading = presentation?.listHeading ?? "Client Avatars";
  const newAvatarLabel = presentation?.newAvatarLabel ?? "New Avatar";
  const backToDestinationLabel =
    presentation?.backToDestinationLabel ?? "Back";
  const newAvatarTitle = presentation?.newAvatarTitle ?? "New Client Avatar";
  const destinationKicker = presentation?.destinationKicker;
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [aiBusy, setAiBusy] = useState(false);
  const [savedHint, setSavedHint] = useState(false);
  // Phase 2: one shared research panel for the whole workspace, keyed by the
  // active THREAD key — a question key (text steps) or `research:<area>` (Step
  // 10 module / `research:custom:<id>`). null = closed. Threads themselves live
  // in form.research.threads, so they persist and survive open/close/switch.
  const [activeResearchKey, setActiveResearchKey] = useState<string | null>(
    null,
  );
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const appliedChatFillKey = useRef<number | null>(null);
  const focusTargetRef = useRef<HTMLDivElement | null>(null);
  // Contextual Workspace save/draft: signature-based dirty tracking so
  // "Save Progress" is only active when there is genuinely something new.
  const formRef = useRef(form);
  formRef.current = form;
  const stepRef = useRef(step);
  stepRef.current = step;
  const savedSigRef = useRef(formSignature(EMPTY));
  const dirty = formSignature(form) !== savedSigRef.current;

  function refresh() {
    setAvatars(getAvatars());
    setActiveId(getActiveAvatar()?.id);
  }
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!coachKickoff) return;
    setForm({ ...EMPTY });
    setStep(0);
    savedSigRef.current = formSignature(EMPTY);
    setSavedHint(false);
    setActiveResearchKey(null);
    setBuilding(true);
  }, [coachKickoff]);

  useEffect(() => {
    if (!onContextChange) return;
    onContextChange({
      view: building ? "build" : "list",
      stage: building ? STEPS[step]?.key : undefined,
      selectedItemName: form.name.trim() || null,
      selectedItemGoal: form.who.trim() || null,
      draftPreview: form.tagline.trim() || null,
    });
  }, [building, step, form.name, form.who, form.tagline, onContextChange]);

  useEffect(() => {
    if (!onCoachSnapshot) return;
    const stepKey = STEPS[step]?.key;
    if (!stepKey) return;
    onCoachSnapshot(
      snapshotFromBuilderInput({
        stepIndex: step,
        stepKey: stepKey as ClientAvatarStepKey,
        building,
        form,
      }),
    );
  }, [
    building,
    step,
    form,
    onCoachSnapshot,
  ]);

  useEffect(() => {
    if (!chatFieldFill) return;
    if (appliedChatFillKey.current === chatFieldFill.key) return;
    appliedChatFillKey.current = chatFieldFill.key;

    const formKey = AVATAR_FIELD_TO_FORM[chatFieldFill.field];
    const stepKey = AVATAR_FIELD_TO_STEP[chatFieldFill.field];
    if (!formKey) return;

    if (!building) {
      setBuilding(true);
      const active = getActiveAvatar();
      const base: Form = active
        ? {
            id: active.id,
            name: active.name,
            who: active.who,
            painPoints: active.painPoints,
            goals: active.goals,
            currentBehavior: active.currentBehavior,
            solution: active.solution,
            tagline: active.tagline,
            emoji: active.emoji ?? "👤",
            image: active.image,
            revenue: active.revenue,
            behaviorTraits: active.behaviorTraits ?? [],
            motivations: active.motivations,
            objections: active.objections,
            triggers: active.triggers,
            contentPrefs: active.contentPrefs,
            research: normalizeResearch(active.research),
          }
        : { ...EMPTY };
      const current = String(base[formKey] ?? "").trim();
      const nextValue =
        AVATAR_REPLACE_FIELDS.has(formKey) || !current
          ? chatFieldFill.value.trim()
          : `${current}\n${chatFieldFill.value.trim()}`;
      setForm({ ...base, [formKey]: nextValue });
    } else {
      setForm((prev) => {
        const current = String(prev[formKey] ?? "").trim();
        const nextValue =
          AVATAR_REPLACE_FIELDS.has(formKey) || !current
            ? chatFieldFill.value.trim()
            : `${current}\n${chatFieldFill.value.trim()}`;
        return { ...prev, [formKey]: nextValue };
      });
    }

    if (stepKey) {
      const idx = STEPS.findIndex((s) => s.key === stepKey);
      if (idx >= 0) setStep((current) => Math.max(current, idx));
    }
  }, [chatFieldFill, building]);

  useEffect(() => {
    if (!focusField || !focusStamp) return;
    const stepKey = AVATAR_FIELD_TO_STEP[focusField];
    if (!stepKey) return;
    const idx = STEPS.findIndex((s) => s.key === stepKey);
    if (idx >= 0) setStep((current) => Math.max(current, idx));
    requestAnimationFrame(() => {
      focusTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [focusField, focusStamp]);

  function startNew() {
    setForm({ ...EMPTY });
    setStep(0);
    savedSigRef.current = formSignature(EMPTY);
    setSavedHint(false);
    setActiveResearchKey(null);
    setBuilding(true);
    onStartNew?.();
  }

  function startEdit(a: IdealClientAvatar) {
    // Build once so the form and the saved-signature match exactly (legacy
    // custom fields get permanent ids here, but that must not read as "dirty").
    const loaded: Form = {
      id: a.id,
      name: a.name,
      who: a.who,
      painPoints: a.painPoints,
      goals: a.goals,
      currentBehavior: a.currentBehavior,
      solution: a.solution,
      tagline: a.tagline,
      emoji: a.emoji ?? "👤",
      image: a.image,
      revenue: a.revenue,
      behaviorTraits: a.behaviorTraits ?? [],
      motivations: a.motivations,
      objections: a.objections,
      triggers: a.triggers,
      contentPrefs: a.contentPrefs,
      research: normalizeResearch(a.research),
    };
    setForm(loaded);
    const resumeIdx = a.draftStepKey
      ? STEPS.findIndex((s) => s.key === a.draftStepKey)
      : -1;
    setStep(resumeIdx >= 0 ? resumeIdx : 0);
    savedSigRef.current = formSignature(loaded);
    setSavedHint(false);
    setActiveResearchKey(null);
    setBuilding(true);
  }

  function setResearch(key: ResearchModuleKey, value: string) {
    setForm((f) => ({ ...f, research: { ...f.research, [key]: value } }));
  }

  async function aiMarketInsights() {
    setAiBusy(true);
    try {
      const res = await fetch("/api/avatar-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idealClient: [form.who, form.painPoints]
            .filter(Boolean)
            .join(". "),
          traits: form.behaviorTraits,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        const join = (a: unknown) =>
          Array.isArray(a) ? a.filter(Boolean).join("; ") : "";
        const ct = (d.contentTriggers ?? {}) as {
          works?: string[];
          avoids?: string[];
        };
        const market = [
          typeof d.guidance === "string" ? d.guidance : "",
          ct.works?.length ? `Works: ${ct.works.join("; ")}.` : "",
          ct.avoids?.length ? `Avoid: ${ct.avoids.join("; ")}.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        setForm((f) => ({
          ...f,
          research: {
            ...f.research,
            behavioral: f.research.behavioral || join(d.behaviorPatterns),
            buying: f.research.buying || join(d.buyingBehavior),
            communication:
              f.research.communication || join(d.communicationStyle),
            market: market || f.research.market,
          },
        }));
      }
    } catch {
      /* optional */
    }
    setAiBusy(false);
  }

  // Quick-edit: open an avatar straight to a given section (no wizard lock).
  function startEditAt(a: IdealClientAvatar, key: StepKey) {
    startEdit(a);
    const i = STEPS.findIndex((s) => s.key === key);
    if (i >= 0) setStep(i);
  }

  function toggleTrait(t: string) {
    setForm((f) => ({
      ...f,
      behaviorTraits: f.behaviorTraits.includes(t)
        ? f.behaviorTraits.filter((x) => x !== t)
        : [...f.behaviorTraits, t],
    }));
  }

  function finish() {
    // Completed avatars reopen at the top for review — not on the last
    // (optional) step where "Save and Finish" was clicked.
    const saved: Form = {
      ...form,
      draftStepKey: STEPS[0]?.key,
    } as Form & { draftStepKey?: string };
    const list = saveAvatar(saved);
    const persisted =
      list.find((a) => a.id === saved.id) ?? list[0] ?? null;
    refresh();
    setBuilding(false);
    setForm({ ...EMPTY });
    setStep(0);
    setSavedHint(false);
    setActiveResearchKey(null);
    savedSigRef.current = formSignature(EMPTY);
    if (persisted) onAvatarSaved?.(persisted);
    onBuildComplete?.();
  }

  /**
   * Persist the in-progress avatar without leaving the builder. Mints the id on
   * first save so partial drafts survive, and records the active step so
   * re-entry resumes exactly where the member left off. Deliberately does NOT
   * fire onAvatarSaved — that belongs to finish(), so a mid-build save never
   * navigates away.
   */
  function persist() {
    const cur = {
      ...formRef.current,
      draftStepKey: STEPS[stepRef.current]?.key,
    };
    const list = saveAvatar(cur);
    if (!formRef.current.id) {
      const mintedId = list[0]?.id;
      if (mintedId) {
        formRef.current = { ...formRef.current, id: mintedId };
        setForm((f) => ({ ...f, id: mintedId }));
      }
    }
    savedSigRef.current = formSignature(formRef.current);
    setSavedHint(true);
    setAvatars(getAvatars());
    setActiveId(getActiveAvatar()?.id);
  }

  // ---- Contextual Workspace controls (never leave the room) ---------------
  function exitToList() {
    // Save on the way out so nothing is lost and the resume pointer reflects
    // the step they actually left from — but never mint an empty draft from a
    // builder that was opened and closed without any input.
    if (dirty || formRef.current.id) persist();
    setBuilding(false);
    setActiveResearchKey(null);
  }

  /**
   * Leave the whole Client Avatar workspace for Welcome Home. Never discards
   * work: it persists any in-progress draft (so name, all answers, the current
   * step, Step 10 areas, and custom fields survive), closes any open research,
   * then hands off to the host's canonical home nav (which does not show the
   * Estate map).
   */
  function handleReturnHome() {
    if (dirty || formRef.current.id) persist();
    setActiveResearchKey(null);
    onReturnHome?.();
  }

  function handleBack() {
    if (step === 0) {
      exitToList();
      return;
    }
    if (dirty) persist();
    setActiveResearchKey(null);
    setStep(step - 1);
  }

  function handleSkip() {
    if (dirty) persist();
    setActiveResearchKey(null);
    if (step >= STEPS.length - 1) {
      setBuilding(false);
      return;
    }
    setStep(step + 1);
  }

  function handleSaveProgress() {
    persist();
  }

  function handleSaveAndContinue() {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    persist();
    setActiveResearchKey(null);
    const next = step + 1;
    setStep(next);
    const nextKey = STEPS[next]?.key;
    if (nextKey) onStepAdvance?.(nextKey as ClientAvatarStepKey, next);
  }

  /**
   * Persist a research thread's messages onto the avatar draft (marks it dirty,
   * so Save Progress lights up and the thread travels with the avatar). Threads
   * are keyed by question key or `research:<area>` — never mounted-component
   * state — so they survive close/reopen, switching, saving, and reopening.
   */
  function setThreadMessages(key: string, next: ResearchThreadMessage[]) {
    const now = new Date().toISOString();
    setForm((f) => ({
      ...f,
      research: {
        ...f.research,
        version: AVATAR_RESEARCH_VERSION,
        threads: {
          ...(f.research.threads ?? {}),
          [key]: { messages: next, updatedAt: now },
        },
        lastResearched: {
          ...(f.research.lastResearched ?? {}),
          [key]: now,
        },
      },
    }));
  }

  /**
   * Apply a research addition to exactly one answer/area, append-only, marking
   * the draft dirty and recording added message ids for dedup. `compute` returns
   * the new (append-only) answer plus the ids newly added. Never overwrites and
   * never touches any other field.
   */
  function applyResearchAdd(
    target: { key: string; isArea: boolean; areaKey: string },
    compute: (
      currentAnswer: string,
      addedIds: string[],
    ) => { answer: string; addedIds: string[] },
  ) {
    setForm((f) => {
      const addedIds0 = f.research.addedResponses ?? [];
      const current = target.isArea
        ? describeResearchArea(f.research, target.areaKey, RESEARCH_MODULE_LABELS)
            ?.currentAnswer ?? ""
        : String((f as unknown as Record<string, unknown>)[target.key] ?? "");
      const { answer, addedIds } = compute(current, addedIds0);
      if (!addedIds.length) return f;
      const addedResponses = [...addedIds0, ...addedIds];
      if (target.isArea) {
        const research2 = setResearchAreaValue(
          f.research,
          target.areaKey,
          answer,
        ) as AvatarResearch;
        return { ...f, research: { ...research2, addedResponses } };
      }
      return {
        ...f,
        [target.key]: answer,
        research: { ...f.research, addedResponses },
      };
    });
  }

  function printAvatar(mode: AvatarPrintMode) {
    setPrintMenuOpen(false);
    if (typeof window === "undefined") return;
    // Persist first so the report reflects saved data (and has created/updated
    // dates), without advancing or losing the current step.
    if (dirty || formRef.current.id) persist();
    const cur = STEPS[stepRef.current];
    const title = form.name?.trim() || "Client Avatar";
    const saved = formRef.current.id
      ? getAvatars().find((a) => a.id === formRef.current.id)
      : undefined;
    const printInput = {
      name: form.name,
      tagline: form.tagline,
      emoji: form.emoji,
      image: form.image,
      who: form.who,
      painPoints: form.painPoints,
      goals: form.goals,
      currentBehavior: form.currentBehavior,
      solution: form.solution,
      behaviorTraits: form.behaviorTraits,
      motivations: form.motivations,
      objections: form.objections,
      triggers: form.triggers,
      contentPrefs: form.contentPrefs,
      revenue: form.revenue,
      research: form.research as Record<string, unknown>,
      createdAt: saved?.createdAt,
      updatedAt: saved?.updatedAt,
    };
    const stepAnswer = (key: StepKey): string => {
      switch (key) {
        case "who":
          return [form.name, form.who].filter(Boolean).join("\n");
        case "painPoints":
          return form.painPoints;
        case "goals":
          return form.goals;
        case "currentBehavior":
          return form.currentBehavior;
        case "solution":
          return form.solution;
        case "revenue":
          return form.revenue ?? "";
        case "behavior":
          return (form.behaviorTraits ?? []).join(", ");
        default:
          return "";
      }
    };
    // "current" prints just the active question; "progress"/"complete" produce
    // the full professional grouped report.
    const html =
      mode === "current" && cur
        ? buildAvatarPrintHtml({
            title,
            subtitle: "Current Question",
            sections: [{ label: cur.q, value: stepAnswer(cur.key) }],
          })
        : buildAvatarReportHtml({
            name: title,
            status: avatarStatus(printInput),
            tagline: form.tagline,
            image: form.image,
            createdAt: printInput.createdAt,
            updatedAt: printInput.updatedAt,
            groups: avatarReportGroups(printInput),
          });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function onUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, image: String(reader.result), emoji: undefined }));
    reader.readAsDataURL(file);
  }

  // ---- Interview ----------------------------------------------------------
  if (building) {
    const current = STEPS[step]!;
    const isLast = step === STEPS.length - 1;
    const editing = Boolean(form.id);
    const showResearch = TEXT_RESEARCH_STEPS.includes(current.key);
    // Relevant prior answers to ground the research (exclude the active one).
    const researchPriors = (
      [
        ["Who they help", form.who],
        ["What they're struggling with", form.painPoints],
        ["What they're trying to achieve", form.goals],
        ["What holds them back", form.currentBehavior],
      ] as Array<[string, string]>
    )
      .filter(([, v]) => v.trim())
      .map(([label, value]) => ({ label, value }));

    // Phase 2: one shared, controlled research panel. `activeResearchKey` is a
    // THREAD key — a question key (text steps) or `research:<area>` (Step 10
    // module / `research:custom:<id>`). Threads live in form.research.threads
    // and persist with the avatar, so they survive open/close, switching, save,
    // and reopening. `addedResponses` (message ids) drives dedup.
    const threadMessagesFor = (key: string): ResearchThreadMessage[] =>
      form.research.threads?.[key]?.messages ?? [];
    const addedResponseIds = form.research.addedResponses ?? [];

    const activeResearch = (() => {
      const key = activeResearchKey;
      if (!key) return null;
      if (key.startsWith("research:")) {
        const areaKey = key.slice("research:".length);
        const desc = describeResearchArea(
          form.research,
          areaKey,
          RESEARCH_MODULE_LABELS,
        );
        if (!desc) return null;
        return {
          key,
          label: desc.label,
          currentAnswer: desc.currentAnswer,
          isArea: true as const,
          areaKey,
        };
      }
      const label = STEPS.find((s) => s.key === key)?.q ?? key;
      const currentAnswer = String(
        (form as unknown as Record<string, unknown>)[key] ?? "",
      );
      return { key, label, currentAnswer, isArea: false as const, areaKey: "" };
    })();
    const activeResearchContext = activeResearch
      ? {
          questionLabel: activeResearch.label,
          currentAnswer: activeResearch.currentAnswer,
          priorAnswers: researchPriors,
          avatarName: form.name,
        }
      : null;
    const avatarComplete = isAvatarComplete({
      name: form.name,
      who: form.who,
      painPoints: form.painPoints,
      goals: form.goals,
      solution: form.solution,
    });
    return (
      <ContextualWorkspaceShell>
        {onReturnHome ? (
          <div
            className="mb-3 flex flex-wrap items-center gap-2"
            data-testid="avatar-workspace-exit"
          >
            <button
              type="button"
              onClick={exitToList}
              className="people-i-help-panel__back"
              data-testid="avatar-exit-to-list"
            >
              ← Back to Client Avatars
            </button>
            <button
              type="button"
              onClick={handleReturnHome}
              className="people-i-help-panel__back"
              data-testid="avatar-exit-home"
            >
              Return to Welcome Home
            </button>
          </div>
        ) : null}
        {destinationKicker ? (
          <div className="mb-3">
            <button
              type="button"
              onClick={exitToList}
              className="people-i-help-panel__back"
            >
              ← {backToDestinationLabel}
            </button>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
              {destinationKicker}
            </p>
            {!editing ? (
              <p className="text-lg font-semibold text-[#1f1c19]">
                {newAvatarTitle}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="rounded-2xl border border-[#d9d2c6] bg-[#fbf8f3]/95 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#1e4f4f]">
              Step {step + 1} of {STEPS.length}
            </p>
            <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setPrintMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={printMenuOpen}
                className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-white"
                data-testid="avatar-print-toggle"
              >
                🖨 Print ▾
              </button>
              {printMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-1 w-64 rounded-xl border border-[#d4cdc3] bg-white p-1 shadow-lg"
                >
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => printAvatar("current")}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#2d2926] hover:bg-[#1e4f4f]/8"
                    data-testid="print-current-question"
                  >
                    Print Current Question
                  </button>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => printAvatar("progress")}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#2d2926] hover:bg-[#1e4f4f]/8"
                    data-testid="print-progress"
                  >
                    Print Progress So Far
                  </button>
                  {avatarComplete ? (
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => printAvatar("complete")}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#2d2926] hover:bg-[#1e4f4f]/8"
                      data-testid="print-complete"
                    >
                      Print Complete Client Avatar
                    </button>
                  ) : (
                    <span className="block px-3 py-2 text-left text-xs italic text-[#9a8f82]">
                      Print Complete Client Avatar — finish the key questions
                      first
                    </span>
                  )}
                </div>
              ) : null}
            </div>
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold leading-snug text-[#1f1c19]">
            {current.q}
          </p>
          {current.hint && (
            <p className="mt-1 text-base text-[#4b463f]">{current.hint}</p>
          )}
        </div>

        <div className="mt-6 flex-1">
          {current.key === "who" && (
            <div className="flex flex-col gap-3" ref={focusTargetRef}>
              <VoiceAnswerField
                hideMic
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
                multiline={false}
                id="avatar-name"
                placeholder="Name (optional) — e.g. Burned Out Coach"
                inputClassName="rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              />
              <VoiceAnswerField
                hideMic
                value={form.who}
                onChange={(who) => setForm({ ...form, who })}
                id="avatar-who"
                placeholder="Describe who they are…"
              />
            </div>
          )}

          {(current.key === "painPoints" ||
            current.key === "goals" ||
            current.key === "currentBehavior" ||
            current.key === "solution") && (
            <VoiceAnswerField
              hideMic
              value={form[current.key as TextFieldKey]}
              onChange={(v) =>
                setForm({
                  ...form,
                  [current.key as TextFieldKey]: v,
                })
              }
              placeholder="Take your time — a sentence or two is plenty."
              inputClassName="min-h-[200px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              micTitle={current.q}
            />
          )}

          {current.key === "expand" && (
            <div className="flex flex-col gap-3">
              <p className="text-base text-[#4b463f]">
                From what you just told me, I can suggest behavior patterns,
                buying behavior, and how to talk to them — all editable in the
                next steps.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!aiBusy) void aiMarketInsights();
                }}
                disabled={aiBusy}
                className="w-fit rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
              >
                {aiBusy ? "Thinking…" : "🧠 Help me expand this profile"}
              </button>
              {(form.research.behavioral ||
                form.research.buying ||
                form.research.communication ||
                form.research.market) && (
                <div className="rounded-xl border border-[#1e4f4f]/20 bg-white/85 p-3 text-sm leading-relaxed text-[#2d2926]">
                  <p className="font-semibold text-[#1f1c19]">
                    Here&apos;s a starting profile:
                  </p>
                  {form.research.behavioral && (
                    <p className="mt-1">📊 {form.research.behavioral}</p>
                  )}
                  {form.research.buying && (
                    <p className="mt-1">💸 {form.research.buying}</p>
                  )}
                  {form.research.communication && (
                    <p className="mt-1">🧠 {form.research.communication}</p>
                  )}
                  {form.research.market && (
                    <p className="mt-1">🌍 {form.research.market}</p>
                  )}
                  <p className="mt-2 text-xs text-[#9a8f82]">
                    Tweak any of this in the next steps — it&apos;s a draft.
                  </p>
                </div>
              )}
              <p className="text-sm text-[#9a8f82]">
                Prefer to skip? Just tap Next — you can expand later.
              </p>
            </div>
          )}

          {current.key === "behavior" && (
            <div className="flex flex-wrap gap-2">
              {CLIENT_BEHAVIOR_TRAITS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTrait(t)}
                  className={`rounded-full border px-4 py-2 text-base font-medium transition-colors ${
                    form.behaviorTraits.includes(t)
                      ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                      : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
                  }`}
                >
                  {TRAIT_EMOJI[t] ?? ""} {t}
                </button>
              ))}
            </div>
          )}

          {current.key === "insights" && (
            <div className="flex flex-col gap-3">
              {(
                [
                  ["motivations", "What truly motivates them?"],
                  ["objections", "What makes them hesitate to buy?"],
                  ["triggers", "What pushes them to finally decide?"],
                  ["contentPrefs", "How do they like to consume content?"],
                ] as [
                  "motivations" | "objections" | "triggers" | "contentPrefs",
                  string,
                ][]
              ).map(([key, label]) => (
                <div key={String(key)}>
                  <p className="mb-1 text-sm font-semibold text-[#6b635a]">
                    {label}
                  </p>
                  <textarea
                    value={(form[key] as string) ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder="Optional…"
                    className="min-h-[64px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  />
                </div>
              ))}
            </div>
          )}

          {current.key === "research" && (
            <div className="flex flex-col gap-3">
              {RESEARCH_MODULES.map((m) => {
                const tKey = researchThreadKey(m.key);
                const hasThread = threadMessagesFor(tKey).length > 0;
                return (
                  <details
                    key={m.key}
                    className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-2 text-base font-semibold text-[#1f1c19]">
                      <span>
                        {m.emoji} {m.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveResearchKey(tKey);
                        }}
                        className="shrink-0 rounded-md bg-[#1e4f4f]/10 px-2 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                        data-testid={`research-area-${m.key}`}
                      >
                        {hasThread ? "🔬 Continue Research" : "🔍 Research this area"}
                      </button>
                    </summary>
                    <p className="mt-1 text-sm text-[#6b635a]">{m.hint}</p>
                    <textarea
                      value={(form.research[m.key] as string) ?? ""}
                      onChange={(e) => setResearch(m.key, e.target.value)}
                      placeholder="Optional…"
                      className="mt-2 min-h-[64px] w-full resize-none rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                    />
                  </details>
                );
              })}

              {/* Custom research fields — experiments, content ideas, tests */}
              <div className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3">
                <p className="text-base font-semibold text-[#1f1c19]">
                  ➕ Custom research fields
                </p>
                <p className="mt-1 text-sm text-[#9a8f82]">
                  e.g. “What I want to test”, “Messaging experiments”, “Content
                  ideas”.
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {(form.research.custom ?? []).map((c, i) => {
                    const tKey = researchThreadKey(`custom:${c.id}`);
                    const hasThread = threadMessagesFor(tKey).length > 0;
                    return (
                      <div key={c.id ?? i} className="flex gap-2">
                        <input
                          value={c.label}
                          onChange={(e) => {
                            const custom = [...(form.research.custom ?? [])];
                            custom[i] = { ...custom[i]!, label: e.target.value };
                            setForm({
                              ...form,
                              research: { ...form.research, custom },
                            });
                          }}
                          placeholder="Label"
                          className="w-1/3 rounded-lg border border-[#c9bfb0] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                        />
                        <input
                          value={c.value}
                          onChange={(e) => {
                            const custom = [...(form.research.custom ?? [])];
                            custom[i] = { ...custom[i]!, value: e.target.value };
                            setForm({
                              ...form,
                              research: { ...form.research, custom },
                            });
                          }}
                          placeholder="Notes…"
                          className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#1e4f4f]"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveResearchKey(tKey)}
                          title={hasThread ? "Continue research" : "Research this area"}
                          aria-label={
                            hasThread ? "Continue research" : "Research this area"
                          }
                          className="shrink-0 rounded-md bg-[#1e4f4f]/10 px-2 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                          data-testid={`research-area-custom-${c.id}`}
                        >
                          {hasThread ? "🔬" : "🔍"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const custom = (form.research.custom ?? []).filter(
                              (_, j) => j !== i,
                            );
                            setForm({
                              ...form,
                              research: { ...form.research, custom },
                            });
                            // Threads key by permanent id, so other fields are
                            // safe; just close research if this field was active.
                            if (activeResearchKey === tKey) {
                              setActiveResearchKey(null);
                            }
                          }}
                          className="shrink-0 px-2 text-[#a85c4a]"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        research: {
                          ...form.research,
                          custom: [
                            ...(form.research.custom ?? []),
                            { id: newCustomFieldId(), label: "", value: "" },
                          ],
                        },
                      })
                    }
                    className="w-fit rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                  >
                    + Add field
                  </button>
                </div>
              </div>
            </div>
          )}

          {current.key === "identity" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <AvatarMark avatar={form} size={72} />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                  >
                    Upload image
                  </button>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: undefined })}
                      className="text-xs font-medium text-[#a85c4a]"
                    >
                      Remove image
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                  }}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#6b635a]">
                  Or pick an emoji
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, emoji: e, image: undefined })
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors ${
                        form.emoji === e && !form.image
                          ? "bg-[#1e4f4f]/15 ring-2 ring-[#1e4f4f]"
                          : "bg-white hover:bg-[#f0f5f5]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <input
                id="avatar-tagline"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="A one-line tagline (optional)"
                className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              />
            </div>
          )}

          {current.key === "revenue" && (
            <input
              value={form.revenue ?? ""}
              onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              placeholder="e.g. ~$2k/mo — or leave blank to skip"
              className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
          )}
        </div>

        {/* Compact research entry for normal questions (near the answer). */}
        {showResearch && activeResearchKey !== current.key ? (
          <button
            type="button"
            onClick={() => setActiveResearchKey(current.key)}
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1e4f4f]/30 bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
            data-testid="research-question-entry"
          >
            {threadMessagesFor(current.key).length > 0
              ? "🔬 Continue Research"
              : "🔍 Need ideas? Research this question"}
          </button>
        ) : null}

        {/* One shared, controlled research panel for the whole workspace —
            mounted once, keyed by the active thread. Threads persist on the
            avatar, so switching / closing / reopening never loses them. */}
        {activeResearch && activeResearchContext ? (
          <ContextualResearchPanel
            open
            onToggle={() => setActiveResearchKey(null)}
            questionKey={activeResearch.key}
            questionLabel={activeResearch.label}
            systemPrompt={buildAvatarResearchSystemPrompt(activeResearchContext)}
            autoPrompt={buildAvatarResearchAutoPrompt(activeResearchContext)}
            messages={threadMessagesFor(activeResearch.key)}
            onMessagesChange={(next) =>
              setThreadMessages(activeResearch.key, next)
            }
            addedResponseIds={addedResponseIds}
            onAddResponse={(msg) =>
              applyResearchAdd(
                {
                  key: activeResearch.key,
                  isArea: activeResearch.isArea,
                  areaKey: activeResearch.areaKey,
                },
                (cur, added) => addResponseToAnswer(cur, msg, added),
              )
            }
            onAddSession={() =>
              applyResearchAdd(
                {
                  key: activeResearch.key,
                  isArea: activeResearch.isArea,
                  areaKey: activeResearch.areaKey,
                },
                (cur, added) =>
                  addSessionToAnswer(
                    cur,
                    threadMessagesFor(activeResearch.key),
                    added,
                  ),
              )
            }
            addLabel={
              activeResearch.isArea
                ? "Add This Response to This Area"
                : "Add This Response"
            }
            addAllLabel={
              activeResearch.isArea
                ? "Add Entire Research Session to This Area"
                : "Add Entire Research Session"
            }
            addedLabel={
              activeResearch.isArea
                ? "Added to this area ✓"
                : "Added to your answer ✓"
            }
            toggleLabel={
              activeResearch.isArea ? "Research this area" : "Research this question"
            }
          />
        ) : null}

        <WorkspaceStepControls
          onBack={handleBack}
          backLabel={
            step === 0
              ? destinationKicker
                ? backToDestinationLabel
                : "Back to list"
              : "Back"
          }
          onSkip={handleSkip}
          onSaveProgress={handleSaveProgress}
          canSaveProgress={dirty}
          onSaveAndContinue={handleSaveAndContinue}
          continueLabel={isLast ? "Save and Finish" : "Save and Continue"}
          savedHint={savedHint}
        />
      </ContextualWorkspaceShell>
    );
  }

  // ---- List of avatars ----------------------------------------------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      {onReturnHome ? (
        <button
          type="button"
          onClick={onReturnHome}
          className="people-i-help-panel__back mb-3 self-start"
          data-testid="avatar-list-exit-home"
        >
          ← Return to Welcome Home
        </button>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">{listHeading}</p>
        <button
          type="button"
          onClick={startNew}
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          + {newAvatarLabel}
        </button>
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        Who you help. Everything Shari writes adapts to whoever&apos;s in use.
      </p>
      <div className="mt-4">
        <WorkspaceAreaWorksGuide areaId="client-avatars" />
      </div>
      {(() => {
        const active = avatars.find((a) => a.id === activeId);
        return active ? (
          <p className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
            👤 Using: {active.name}
          </p>
        ) : null;
      })()}

      {avatars.length === 0 ? (
        <p className="mt-8 text-base text-[#6b635a]">
          No ideal clients yet. Tap “New ideal client” and I&apos;ll walk you
          through it, one question at a time.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {avatars.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-[#d4cdc3] bg-white/85 p-4"
            >
              <div className="flex items-center gap-3">
                <AvatarMark avatar={a} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-base font-semibold text-[#1f1c19]">
                    {a.name}
                    {a.isPrimary ? (
                      <span className="shrink-0 rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-bold text-[#1e4f4f]">
                        ⭐ Primary
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[#f3efe8] px-2 py-0.5 text-xs font-semibold text-[#9a8f82]">
                        Secondary
                      </span>
                    )}
                  </p>
                  {a.tagline && (
                    <p className="truncate text-sm text-[#6b635a]">
                      {a.tagline}
                    </p>
                  )}
                </div>
              </div>
              {a.who && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#4b463f]">
                  {a.who}
                </p>
              )}
              {a.behaviorTraits && a.behaviorTraits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.behaviorTraits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#f3efe8] px-2 py-0.5 text-xs text-[#6b635a]"
                    >
                      {TRAIT_EMOJI[t] ?? ""} {t}
                    </span>
                  ))}
                </div>
              )}
              {a.research &&
                Object.values(a.research).some((v) =>
                  Array.isArray(v) ? v.length : v,
                ) && (
                  <p className="mt-2 text-xs font-semibold text-[#1e4f4f]">
                    🧠 Research added
                  </p>
                )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                {activeId === a.id ? (
                  <span className="rounded-md bg-[#1e4f4f] px-2.5 py-1 text-white">
                    ✓ In use
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAvatar(a.id);
                      setActiveId(a.id);
                    }}
                    className="rounded-md bg-[#1e4f4f]/10 px-2.5 py-1 text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
                  >
                    Use in AI
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="rounded-md px-2.5 py-1 text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => startEditAt(a, "behavior")}
                  className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                >
                  Behavior
                </button>
                <button
                  type="button"
                  onClick={() => startEditAt(a, "research")}
                  className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                >
                  Research
                </button>
                {!a.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setAvatars(setPrimaryAvatar(a.id))}
                    className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                  >
                    Make primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAvatars(duplicateAvatar(a.id))}
                  className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-[#1e4f4f]/10"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatars(deleteAvatar(a.id));
                    setActiveId(getActiveAvatar()?.id);
                  }}
                  className="rounded-md px-2.5 py-1 text-[#a85c4a] hover:bg-[#a85c4a]/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
