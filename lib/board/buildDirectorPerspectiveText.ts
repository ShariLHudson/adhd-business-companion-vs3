/**
 * Build a distinct spoken perspective for one Board Director.
 * Order and language vary by response profile — no shared closing script.
 */

import type { BoardDirectorDefinition } from "@/lib/board/types";
import {
  getDirectorResponseProfile,
  type DirectorResponseBeat,
  type DirectorResponseProfile,
} from "@/lib/board/directorResponseProfiles";
import { boardPossessiveMatter } from "@/lib/board/resolveBoardAddressName";

export function buildDirectorPerspectiveText(params: {
  director: BoardDirectorDefinition;
  decision: string;
  addressName: string | null;
  whyNow?: string | null;
  concerns?: string | null;
}): string {
  const { director, decision, addressName, whyNow, concerns } = params;
  const profile = getDirectorResponseProfile(director.id);
  const questionMatter = boardPossessiveMatter(addressName, "question");
  const linesByBeat = buildBeats({
    director,
    profile,
    decision,
    addressName,
    questionMatter,
    whyNow: whyNow?.trim() || null,
    concerns: concerns?.trim() || null,
  });

  const ordered = profile.beatOrder
    .map((beat) => linesByBeat[beat])
    .filter(Boolean) as string[];

  return [
    `I'm ${director.name}, ${director.shortRole}.`,
    ...ordered,
  ].join("\n\n");
}

function buildBeats(params: {
  director: BoardDirectorDefinition;
  profile: DirectorResponseProfile;
  decision: string;
  addressName: string | null;
  questionMatter: string;
  whyNow: string | null;
  concerns: string | null;
}): Partial<Record<DirectorResponseBeat, string>> {
  const {
    director,
    profile,
    decision,
    addressName,
    questionMatter,
    whyNow,
    concerns,
  } = params;
  const q1 = profile.primaryQuestions[0] ?? director.questionsAsked[0];
  const q2 = profile.primaryQuestions[1] ?? director.questionsAsked[1];
  const lens = profile.coreLens.slice(0, 2).join(", ");
  const protect = profile.protectedInterests[0];
  const nameLead = addressName ? `${addressName}, ` : "";

  switch (director.id) {
    case "vice-chair":
      return {
        notice: `${nameLead}when I look at ${questionMatter} — “${decision}” — I ask whether it is complete enough to execute.`,
        concern: `The risk I watch for: ${profile.riskDefinition}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: name the owner of the first concrete move and the date it starts.`,
      };
    case "founder-advocate":
      return {
        notice: addressName
          ? `${addressName}, the part of this decision I examine first is whether it still fits the business and life you want.`
          : `The part of this decision I examine first is whether it still fits the business and life you want to build.`,
        questions: [q1, q2].filter(Boolean).join(" "),
        concern: whyNow
          ? `You named urgency around “${whyNow}” — I still want to know the personal cost of carrying that urgency.`
          : `I protect ${protect}. ${profile.riskDefinition}`,
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful check: write one sentence on what this asks of you over the next ninety days.`,
      };
    case "strategy-director":
      return {
        notice: `On strategy, “${decision}” is really a question of focus versus dilution.`,
        concern: `I am watching for ${lens}. ${profile.riskDefinition}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: list what you are saying no to if you say yes here.`,
      };
    case "financial-stewardship":
      return {
        notice: `${nameLead}the first number I would want for “${decision}” is the full monthly cost — not only the obvious line item.`,
        concern: `Financial risk, as I define it: ${profile.riskDefinition}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: put cash timing and downside on one page before you commit.`,
      };
    case "operations-capacity":
      return {
        concern: `The risk is not simply choosing wrong. It is approving work before capacity and role clarity can support it.`,
        notice: `For “${decision}”, I look at delivery load, supervision, and whether someone can actually succeed.`,
        questions: [q1, q2].filter(Boolean).join(" "),
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: map who absorbs the extra load if this works — and if it doesn't.`,
      };
    case "customer-market":
      return {
        notice: `I would start with the customer-facing problem inside ${questionMatter}: “${decision}”.`,
        questions: [q1, q2].filter(Boolean).join(" "),
        concern: concerns
          ? `You already named concerns — I would add: do buyers care enough to act?`
          : `I protect ${protect}. ${profile.riskDefinition}`,
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: gather one clear demand signal in the customer's own language.`,
      };
    case "growth-opportunity":
      return {
        notice: `I am looking for the upside in “${decision}” — and whether a smaller entry still captures it.`,
        view: `My current view: ${profile.recommendationStyle}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        concern: `The risk I worry about is waiting so carefully that the window closes.`,
        nextTest: `Next useful test: name the smallest reversible move that keeps the door open.`,
      };
    case "risk-resilience":
      return {
        concern: `Assume a key assumption fails. ${profile.riskDefinition}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        notice: `For “${decision}”, I want the failure mode and recovery path visible before enthusiasm takes over.`,
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: write the failure threshold that would stop further spend or commitment.`,
      };
    case "technology-future":
      return {
        notice: `On technology, “${decision}” makes me ask what we are locking into — and for how long.`,
        concern: `I define risk as ${profile.riskDefinition.toLowerCase()}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: estimate exit cost if the tooling landscape shifts in eighteen months.`,
      };
    case "values-trust":
      return {
        notice: addressName
          ? `${addressName}, I look at whether this choice strengthens trust with the people you serve.`
          : `I look at whether this choice strengthens trust with the people you serve.`,
        questions: [q1, q2].filter(Boolean).join(" "),
        concern: `Values risk: ${profile.riskDefinition}`,
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful check: would you still be proud of this if it became public tomorrow?`,
      };
    case "devils-advocate":
      return {
        concern: `Let us assume “${decision}” does not deliver what you hope. What is the most likely reason?`,
        questions: [q1, q2].filter(Boolean).join(" "),
        notice: `I am here to stress-test premature certainty, not to be contrary for sport.`,
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `Next useful test: name the evidence that would change your mind before you commit further.`,
      };
    default:
      return {
        notice: `${nameLead}evaluating ${questionMatter} about “${decision}”, I notice ${lens}.`,
        concern: `What I protect first: ${protect}. ${profile.riskDefinition}`,
        questions: [q1, q2].filter(Boolean).join(" "),
        view: `My current view: ${profile.recommendationStyle}`,
        nextTest: `A useful next consideration: ${profile.tradeoffStyle}`,
      };
  }
}
