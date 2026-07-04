/**
 * Estate navigation decision tree — high / medium / low confidence.
 *
 * High-confidence immediate opens are handled in createExperienceRouting +
 * frictionlessActionLayer. This module covers medium disambiguation and low discovery.
 */

import type {
  EstateNavigationChoice,
  EstateNavigationDisambiguation,
  EstateNavigationDiscovery,
} from "./types";
import { estateExperienceDefaultSpace } from "./registry";
import { searchEstateBrain } from "@/lib/estateBrain/search";
import {
  estateEnvironmentById,
  type EstateEnvironment,
} from "@/lib/estateBrain/environmentRegistry";
import type { EstateExperienceId } from "./types";

const WRITE_VAGUE_RE =
  /\b(?:help me write|want to write|need to write|help me draft|i(?:'m| am) writing)\b/i;

const WRITE_SPECIFIC_RE =
  /\b(?:email|sop|newsletter|proposal|book|chapter|article|blog|script|mind map)\b/i;

const BUSINESS_VAGUE_RE =
  /\b(?:work on (?:my )?business|my business|business today|on my business|for my business)\b/i;

const WORK_VAGUE_RE =
  /\b(?:need to work|get (?:some )?work done|be productive today|productive day)\b/i;

const LOW_START_RE =
  /\b(?:don'?t know where to start|not sure where to start|no idea where to (?:start|begin)|where (?:do i|should i) (?:even )?start)\b/i;

const VAGUE_HELP_RE =
  /^(?:help(?: me)?|i need help|not sure what i need)\.?$/i;

function choicesFromBrainSearch(
  query: string,
): EstateNavigationDisambiguation["choices"] | null {
  const result = searchEstateBrain(query, { limit: 3, experiencesOnly: true });
  if (result.matches.length < 2) return null;
  const choices = result.matches.slice(0, 3).map((m) => ({
    experienceId: m.entry.experienceId as EstateExperienceId,
    headline:
      m.entry.experienceId === "business" ? "Boardroom" : m.entry.name,
    detail: m.entry.purpose,
    spaceId: m.entry.spaceId,
  }));
  if (choices.length < 3) return null;
  return [choices[0]!, choices[1]!, choices[2]!];
}

function businessWorkChoices(): EstateNavigationDisambiguation["choices"] {
  return (
    choicesFromBrainSearch("business work build strategy create momentum") ?? [
      {
        experienceId: "momentum",
        headline: "Momentum",
        detail: "Move an existing project, launch, or business plan forward.",
        spaceId: estateExperienceDefaultSpace("momentum"),
      },
      {
        experienceId: "create",
        headline: "Create",
        detail: "Build something new like an email, proposal, or SOP.",
        spaceId: estateExperienceDefaultSpace("create"),
      },
      {
        experienceId: "business",
        headline: "Boardroom",
        detail: "Think through strategy, offers, or operations.",
        spaceId: estateExperienceDefaultSpace("business"),
      },
    ]
  );
}

export function formatEstateNavigationChoiceMenu(
  disambiguation: EstateNavigationDisambiguation,
): string {
  const lines = disambiguation.choices.map(
    (choice, index) =>
      `${index + 1}. ${choice.headline} — ${choice.detail}`,
  );
  return [disambiguation.intro, "", ...lines].join("\n");
}

function environmentWriteChoices(): EstateNavigationDisambiguation["choices"] {
  const createStudio = estateEnvironmentById("create-studio");
  const writingRoom = estateEnvironmentById("writing-room");
  if (!createStudio || !writingRoom) return businessWorkChoices();

  return [
    environmentToChoice(createStudio, "create"),
    environmentToChoice(writingRoom, "create"),
    {
      experienceId: "think",
      headline: "Study Hall",
      detail: "Research or learn before you write.",
      spaceId: estateExperienceDefaultSpace("think"),
    },
  ];
}

function environmentToChoice(
  env: EstateEnvironment,
  experienceId: EstateExperienceId,
): EstateNavigationChoice {
  return {
    experienceId,
    headline: env.name,
    detail: env.purpose,
    spaceId: env.spaceId,
  };
}

function resolveWriteEnvironmentDisambiguation(
  userText: string,
): EstateNavigationDisambiguation | null {
  const t = userText.trim();
  if (!t || !WRITE_VAGUE_RE.test(t) || WRITE_SPECIFIC_RE.test(t)) return null;
  return {
    confidence: "medium",
    intro: "I can help with that in a couple of ways.",
    choices: environmentWriteChoices(),
  };
}

export function resolveEstateNavigationDisambiguation(
  userText: string,
): EstateNavigationDisambiguation | null {
  const t = userText.trim();
  if (!t) return null;

  const writeDisambiguation = resolveWriteEnvironmentDisambiguation(t);
  if (writeDisambiguation) return writeDisambiguation;

  if (BUSINESS_VAGUE_RE.test(t) || WORK_VAGUE_RE.test(t)) {
    return {
      confidence: "medium",
      intro: "A few places come to mind. Which feels right today?",
      choices: businessWorkChoices(),
    };
  }
  return null;
}

export function resolveEstateNavigationDiscovery(
  userText: string,
): EstateNavigationDiscovery | null {
  const t = userText.trim();
  if (!t) return null;
  if (LOW_START_RE.test(t) || VAGUE_HELP_RE.test(t)) {
    return {
      confidence: "low",
      intro: "Let's figure it out together.",
      question:
        "What's weighing on you most right now — making something new, moving something forward, or finding some calm?",
    };
  }
  return null;
}

export function parseEstateNavigationChoiceReply(
  reply: string,
  choices: readonly EstateNavigationChoice[],
): EstateNavigationChoice | null {
  const t = reply.trim().toLowerCase();
  if (!t) return null;
  const num = /^[123]$/.test(t) ? Number(t) - 1 : -1;
  if (num >= 0 && num < choices.length) return choices[num] ?? null;
  for (const choice of choices) {
    if (t.includes(choice.headline.toLowerCase())) return choice;
    if (t.includes(choice.experienceId)) return choice;
  }
  if (/\bmomentum\b/.test(t)) {
    return choices.find((c) => c.experienceId === "momentum") ?? null;
  }
  if (/\bcreate\b/.test(t)) {
    return choices.find((c) => c.experienceId === "create") ?? null;
  }
  if (/\b(?:boardroom|business|strategy)\b/.test(t)) {
    return choices.find((c) => c.experienceId === "business") ?? null;
  }
  return null;
}
