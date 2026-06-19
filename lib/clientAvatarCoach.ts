/**
 * Client Avatar Builder — step-by-step coach beside the form.
 */

import type { WorkspaceFieldId } from "./workspaceAwareness";
import { inferAvatarFieldFromContext } from "./workspaceAwareness";
import {
  extractPendingBuilderContent,
  isBuilderAddCommand,
  isBuilderApprovalPhrase,
  isUserQuestionText,
  tryResolveBuilderApproval,
} from "./builderContentSync";

export type ClientAvatarStepKey =
  | "who"
  | "identity"
  | "painPoints"
  | "goals"
  | "currentBehavior"
  | "expand"
  | "behavior"
  | "insights"
  | "solution"
  | "research"
  | "revenue";

export type ClientAvatarBuilderSnapshot = {
  step: ClientAvatarStepKey;
  stepIndex: number;
  building: boolean;
  name: string;
  who: string;
  tagline: string;
  painPoints: string;
  goals: string;
  currentBehavior: string;
  solution: string;
};

export type ClientAvatarCoachTurn = {
  reply: string;
  fills?: { field: WorkspaceFieldId; value: string }[];
  focusField?: WorkspaceFieldId | null;
  taglineOptions?: string[];
};

const STEP_ORDER: ClientAvatarStepKey[] = [
  "who",
  "identity",
  "painPoints",
  "goals",
  "currentBehavior",
  "expand",
  "behavior",
  "insights",
  "solution",
  "research",
  "revenue",
];

const STEP_FIELD: Partial<Record<ClientAvatarStepKey, WorkspaceFieldId>> = {
  who: "avatar-who",
  identity: "avatar-tagline",
  painPoints: "avatar-pain",
  goals: "avatar-goals",
  currentBehavior: "avatar-behavior",
  solution: "avatar-solution",
};

export const CLIENT_AVATAR_COACH_INTRO =
  "Let's build your Client Avatar together. I'll guide you one step at a time, and you can type in the fields or answer me here.";

export function buildClientAvatarCoachOpenMessages(): {
  role: "assistant";
  content: string;
}[] {
  return [
    {
      role: "assistant",
      content:
        "[[focus:avatar-name]]Who do you help most often? Give them a simple name and quick description.",
    },
  ];
}

export function clientAvatarStepLabel(step: ClientAvatarStepKey): string {
  const labels: Record<ClientAvatarStepKey, string> = {
    who: "Who they are",
    identity: "Face & tagline",
    painPoints: "Struggles",
    goals: "Goals",
    currentBehavior: "Obstacles",
    expand: "AI expand",
    behavior: "Behavior traits",
    insights: "Motivation",
    solution: "Your edge",
    research: "Research",
    revenue: "Revenue",
  };
  return labels[step];
}

/** Right-panel source of truth — which field chat should coach toward. */
export function resolveActiveAvatarField(
  snapshot: ClientAvatarBuilderSnapshot,
): WorkspaceFieldId | null {
  if (!snapshot.building) return null;

  if (snapshot.step === "who") {
    if (!snapshot.name.trim()) return "avatar-name";
    if (!snapshot.who.trim()) return "avatar-who";
    return "avatar-who";
  }

  return STEP_FIELD[snapshot.step] ?? null;
}

export function suggestWhoDescription(name: string): string {
  const label = name.trim();
  if (!label) {
    return "people who want practical support without overwhelm";
  }
  if (/\bcoach/i.test(label)) {
    return "coaches, authors, and speakers who want to turn their knowledge into digital products";
  }
  return `${label} who want practical support turning expertise into real momentum`;
}

function stepComplete(step: ClientAvatarStepKey, s: ClientAvatarBuilderSnapshot): boolean {
  switch (step) {
    case "who":
      return Boolean(s.name.trim() && s.who.trim());
    case "identity":
      return Boolean(s.tagline.trim() || s.name.trim());
    case "painPoints":
      return Boolean(s.painPoints.trim());
    case "goals":
      return Boolean(s.goals.trim());
    case "currentBehavior":
      return Boolean(s.currentBehavior.trim());
    case "solution":
      return Boolean(s.solution.trim());
    case "expand":
    case "behavior":
    case "insights":
    case "research":
    case "revenue":
      return true;
    default:
      return false;
  }
}

function approvalConfirmReply(
  snapshot: ClientAvatarBuilderSnapshot,
  field: WorkspaceFieldId,
  content: string,
): string {
  const section = clientAvatarStepLabel(snapshot.step);
  const nextIndex = snapshot.stepIndex + 1;
  const nextStep = STEP_ORDER[nextIndex];
  const nextLabel = nextStep ? clientAvatarStepLabel(nextStep) : null;
  const nextLine = nextLabel
    ? ` You're ready for Step ${nextIndex + 1}: **${nextLabel}**. Click **Next** and we'll work through it together.`
    : " Click **Next** when you're ready.";
  return `[[fill:${field}:${content}]]I've added those to **${section}**.${nextLine}`;
}

function clickNextLine(step: ClientAvatarStepKey): string {
  const label = clientAvatarStepLabel(step);
  return `**${label}** is filled in. Click **Next** when you're ready, and I'll help with the next section.`;
}

export function coachMessageForStepAdvance(
  step: ClientAvatarStepKey,
  snapshot: ClientAvatarBuilderSnapshot,
): string {
  switch (step) {
    case "identity":
      return (
        "Now we're giving this avatar a face and a one-line tagline. " +
        "Pick an emoji or photo on the right, and tell me if you want help writing the tagline."
      );
    case "painPoints":
      return "[[focus:avatar-pain]]What are they struggling with most? One or two sentences is plenty.";
    case "goals":
      return "[[focus:avatar-goals]]What are they trying to achieve?";
    case "currentBehavior":
      return "[[focus:avatar-behavior]]What slows them down or holds them back?";
    case "expand":
      return (
        "I can suggest behavior patterns from what you've shared — tap **Help me expand this profile** on the right, or click **Next** to skip for now."
      );
    case "behavior":
      return "Tap the behavior traits that fit them on the right — overwhelmed, analytical, and so on.";
    case "insights":
      return "Optional: motivations, objections, or triggers. Edit anything on the right, or click **Next**.";
    case "solution":
      return "[[focus:avatar-solution]]How do you help them in a way others don't?";
    case "research":
      return "Optional research layers — open any module on the right if you want depth, or click **Next**.";
    case "revenue":
      return "Last optional step: track revenue from this client type, or click **Save client** to finish.";
    default:
      return `Let's work on **${clientAvatarStepLabel(step)}** — tell me what to add on the right, or answer here.`;
  }
}

export function clientAvatarCompletionMessage(): string {
  return [
    "Your Client Avatar is ready to save.",
    "",
    "What would you like to do next?",
    "1. **Review avatar**",
    "2. **Improve weak sections**",
    "3. **Generate content from avatar**",
    "4. **Build marketing plan from avatar**",
    "5. **Finish for now**",
  ].join("\n");
}

export function parseAvatarWhoAnswer(text: string): {
  name?: string;
  who?: string;
} {
  const t = text.trim();
  if (!t) return {};

  const helpMatch = t.match(/^i help (.+)$/i);
  if (helpMatch) {
    return { name: helpMatch[1]!.trim() };
  }

  const namedMatch = t.match(
    /^(?:they are|they're|my (?:ideal )?client is|audience is)\s+(.+)$/i,
  );
  if (namedMatch) {
    return { name: namedMatch[1]!.trim() };
  }

  const dashSplit = t.split(/\s+[—–-]\s+/);
  if (dashSplit.length >= 2) {
    return {
      name: dashSplit[0]!.trim(),
      who: dashSplit.slice(1).join(" — ").trim(),
    };
  }

  if (t.length <= 48 && !t.includes(".")) {
    return { name: t };
  }

  return { who: t };
}

export function suggestAvatarTaglines(
  name: string,
  who: string,
): string[] {
  const label = name.trim() || "your ideal client";
  const base = who.trim();
  const options = [
    `For ${label} who are ready for real momentum`,
    `Helping ${label} stop spinning and start shipping`,
    base
      ? `${label}: ${base.slice(0, 60)}${base.length > 60 ? "…" : ""}`
      : `The guide ${label} trust when focus matters`,
    `Built for ${label} — practical support, zero fluff`,
  ];
  return [...new Set(options.map((o) => o.trim()).filter(Boolean))].slice(0, 4);
}

function parseTaglineChoice(
  userText: string,
  options: string[],
  lastAssistant: string,
): string | null {
  const t = userText.trim();
  if (!t || options.length === 0) return null;

  const num = t.match(/^(?:option\s*)?([1-4])\b/i);
  if (num) {
    const idx = Number(num[1]) - 1;
    return options[idx] ?? null;
  }

  if (/^(?:the )?(?:first|1st)\b/i.test(t)) return options[0] ?? null;
  if (/^(?:the )?(?:second|2nd)\b/i.test(t)) return options[1] ?? null;
  if (/^(?:the )?(?:third|3rd)\b/i.test(t)) return options[2] ?? null;

  const exact = options.find(
    (o) => o.toLowerCase() === t.toLowerCase() || t.toLowerCase().includes(o.toLowerCase()),
  );
  if (exact) return exact;

  if (
    /\b(?:that one|use that|sounds good|perfect|yes)\b/i.test(t) &&
    options.length === 1
  ) {
    return options[0]!;
  }

  const listed = lastAssistant.match(/\d+\.\s+(.+)/g);
  if (listed?.length && /^(?:yes|that one|the second)/i.test(t)) {
    return null;
  }

  return null;
}

function extractTaglineOptions(lastAssistant: string): string[] {
  const lines = lastAssistant.split("\n");
  const opts: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\d+\.\s+(.+)$/);
    if (m?.[1]) opts.push(m[1].trim());
  }
  return opts;
}

function isAvatarConceptQuestion(text: string): boolean {
  return isUserQuestionText(text);
}

function wantsTaglineHelp(text: string): boolean {
  return /\b(?:tagline|one.?line|slogan|help.*writing|write.*tagline)\b/i.test(
    text,
  );
}

export function processClientAvatarCoachTurn(
  userText: string,
  snapshot: ClientAvatarBuilderSnapshot,
  lastAssistantText: string,
  pendingTaglineOptions: string[] = [],
): ClientAvatarCoachTurn | null {
  if (!snapshot.building) return null;

  const t = userText.trim();
  if (!t) return null;

  const activeField = resolveActiveAvatarField(snapshot);

  if (activeField) {
    const approvalFill = tryResolveBuilderApproval(t, lastAssistantText, activeField);
    if (approvalFill) {
      return {
        reply: approvalConfirmReply(snapshot, approvalFill.field, approvalFill.value),
        fills: [{ field: approvalFill.field, value: approvalFill.value }],
        focusField: approvalFill.field,
      };
    }
    if (isBuilderAddCommand(t)) {
      const pending = extractPendingBuilderContent(lastAssistantText);
      if (!pending) {
        return {
          reply:
            "I don't see content to add yet — tell me what to generate, or paste what you want in the field.",
          focusField: activeField,
        };
      }
    }
  }

  if (isAvatarConceptQuestion(t) && !wantsTaglineHelp(t)) {
    if (
      snapshot.step === "who" &&
      snapshot.name.trim() &&
      !snapshot.who.trim() &&
      /\bdescription|who they are|what (?:kind|should)|example/i.test(t)
    ) {
      const suggestion = suggestWhoDescription(snapshot.name);
      return {
        reply:
          `A good description is one sentence about who they are and what they need help with. ` +
          `For example: ${suggestion}. Want to use that or adjust it?`,
        focusField: "avatar-who",
      };
    }
    return null;
  }

  if ((isBuilderApprovalPhrase(t) || isUserQuestionText(t)) && !wantsTaglineHelp(t)) {
    return null;
  }

  const field = activeField ?? inferAvatarFieldFromContext(lastAssistantText, t);
  if (field && field !== activeField) {
    const approvalFill = tryResolveBuilderApproval(t, lastAssistantText, field);
    if (approvalFill) {
      return {
        reply: approvalConfirmReply(snapshot, approvalFill.field, approvalFill.value),
        fills: [{ field: approvalFill.field, value: approvalFill.value }],
        focusField: approvalFill.field,
      };
    }
    if (isBuilderAddCommand(t)) {
      const pending = extractPendingBuilderContent(lastAssistantText);
      if (!pending) {
        return {
          reply:
            "I don't see content to add yet — tell me what to generate, or paste what you want in the field.",
          focusField: field,
        };
      }
    }
  }

  const taglineOpts =
    pendingTaglineOptions.length > 0
      ? pendingTaglineOptions
      : extractTaglineOptions(lastAssistantText);
  const chosen = parseTaglineChoice(t, taglineOpts, lastAssistantText);
  if (chosen) {
    return {
      reply: `[[fill:avatar-tagline:${chosen}]]I added that tagline. Click **Next** when you're ready.`,
      fills: [{ field: "avatar-tagline", value: chosen }],
      focusField: "avatar-tagline",
    };
  }

  if (snapshot.step === "identity" && wantsTaglineHelp(t)) {
    const options = suggestAvatarTaglines(snapshot.name, snapshot.who);
    const list = options.map((o, i) => `${i + 1}. ${o}`).join("\n");
    return {
      reply: `Here are a few tagline options:\n\n${list}\n\nReply with **1**, **2**, **3**, or **4** — or tell me your own.`,
      taglineOptions: options,
      focusField: "avatar-tagline",
    };
  }

  if (snapshot.step === "who") {
    const parsed = parseAvatarWhoAnswer(t);
    const fills: { field: WorkspaceFieldId; value: string }[] = [];
    const nextName = parsed.name ?? (parsed.who ? "" : snapshot.name);
    const nextWho = parsed.who ?? snapshot.who;

    if (parsed.name) {
      fills.push({ field: "avatar-name", value: parsed.name });
    }
    if (parsed.who) {
      fills.push({ field: "avatar-who", value: parsed.who });
    }
    if (
      !parsed.name &&
      !parsed.who &&
      t.length >= 8 &&
      !isUserQuestionText(t) &&
      !isBuilderApprovalPhrase(t)
    ) {
      fills.push({ field: "avatar-who", value: t });
    }

    const merged: ClientAvatarBuilderSnapshot = {
      ...snapshot,
      name: parsed.name ?? snapshot.name,
      who:
        parsed.who ??
        (parsed.name ? snapshot.who : t || snapshot.who),
    };

    if (!merged.name.trim() && merged.who.trim()) {
      const shortName = merged.who.split(/[.,]/)[0]!.trim().slice(0, 48);
      fills.push({ field: "avatar-name", value: shortName });
      merged.name = shortName;
    }

    if (!merged.name.trim()) {
      return {
        reply:
          "Great start. What **simple name** should we give this audience? (e.g. Burned Out Coach)",
        fills: fills.length ? fills : undefined,
        focusField: "avatar-name",
      };
    }

    if (!merged.who.trim() || (parsed.name && !parsed.who)) {
      return {
        reply: `I added the name. Now give me a short description of who they are.`,
        fills: fills.length ? fills : undefined,
        focusField: "avatar-who",
      };
    }

    if (stepComplete("who", merged)) {
      return {
        reply: clickNextLine("who"),
        fills: fills.length ? fills : undefined,
        focusField: "avatar-who",
      };
    }
  }

  const stepField = activeField ?? STEP_FIELD[snapshot.step];
  if (stepField && stepField !== "avatar-who" && stepField !== "avatar-name") {
    if (isBuilderAddCommand(t) || isUserQuestionText(t)) {
      return null;
    }
    if (t.length >= 6 && !/^(?:next|skip|done)$/i.test(t)) {
      const merged = { ...snapshot };
      if (stepField === "avatar-pain") merged.painPoints = t;
      if (stepField === "avatar-goals") merged.goals = t;
      if (stepField === "avatar-behavior") merged.currentBehavior = t;
      if (stepField === "avatar-solution") merged.solution = t;
      if (stepField === "avatar-tagline") merged.tagline = t;

      if (stepComplete(snapshot.step, merged)) {
        return {
          reply: `[[fill:${stepField}:${t}]]${clickNextLine(snapshot.step)}`,
          fills: [{ field: stepField, value: t }],
          focusField: stepField,
        };
      }
      return {
        reply: `[[fill:${stepField}:${t}]]I've added that beside you.`,
        fills: [{ field: stepField, value: t }],
        focusField: stepField,
      };
    }
  }

  return null;
}

export function clientAvatarCoachHintForChat(
  snapshot: ClientAvatarBuilderSnapshot | null,
): string | undefined {
  if (!snapshot?.building) return undefined;

  const step = snapshot.step;
  const lines = [
    "CLIENT AVATAR BUILDER COACH (mandatory — Define With Shari):",
    "- The Client Avatar builder is open on the right. Stay in this workflow only.",
    "- Do NOT mention Strategies, Create drafts, or ask what they want to work on next.",
    `- Current step: ${clientAvatarStepLabel(step)} (${step}).`,
    "- When the user gives content, prefix [[fill:field-id:value]] once, confirm briefly, ask only for missing pieces.",
    "- NEVER write user questions, instructions, or approval phrases into fields.",
    `- Active field: ${resolveActiveAvatarField(snapshot) ?? "none"} — follow the right panel step (${clientAvatarStepLabel(step)}).`,
    "- When you generate a list or draft for the current step, end with: Would you like me to add these to the avatar?",
    "- On approval (yes, looks good, add to avatar, these are good): apply the GENERATED content — never the approval phrase.",
    "- When a step is complete, tell them to click **Next** on the builder — do not skip ahead.",
    "- For tagline help on the identity step, offer 3–4 short options as a numbered list.",
    "- Answer side questions briefly, then return to the same step.",
  ];

  if (step === "who") {
    lines.push(
      "- Step 1 needs **name** (avatar-name) and **description** (avatar-who). Parse chat answers into both fields.",
    );
  }
  if (step === "identity") {
    lines.push(
      "- Step 2: emoji/photo + tagline. Offer tagline help if they ask.",
    );
  }

  if (step === "revenue" && stepComplete(step, snapshot)) {
    lines.push(
      "- Avatar build is complete. Offer: Review avatar, Improve weak sections, Generate content, Build marketing plan, Finish for now.",
    );
  }

  return lines.join("\n");
}

export function snapshotFromBuilderInput(input: {
  stepIndex: number;
  stepKey: ClientAvatarStepKey;
  building: boolean;
  form: {
    name: string;
    who: string;
    tagline: string;
    painPoints: string;
    goals: string;
    currentBehavior: string;
    solution: string;
  };
}): ClientAvatarBuilderSnapshot {
  return {
    step: input.stepKey,
    stepIndex: input.stepIndex,
    building: input.building,
    name: input.form.name,
    who: input.form.who,
    tagline: input.form.tagline,
    painPoints: input.form.painPoints,
    goals: input.form.goals,
    currentBehavior: input.form.currentBehavior,
    solution: input.form.solution,
  };
}

export function isClientAvatarCoachComplete(
  snapshot: ClientAvatarBuilderSnapshot,
): boolean {
  const idx = STEP_ORDER.indexOf(snapshot.step);
  return idx === STEP_ORDER.length - 1 && stepComplete("solution", snapshot);
}
