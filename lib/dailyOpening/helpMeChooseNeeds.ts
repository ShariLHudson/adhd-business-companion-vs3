/**
 * Help Me Choose — need-based support selection (not Welcome discovery).
 * Distinct from Show Me Something Helpful lessons.
 */

import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type { DailyOpeningDestination } from "./types";
import { registerPendingChoice } from "@/lib/pendingChoice/manager";
import type { PendingChoiceItem } from "@/lib/pendingChoice/types";

export type HelpMeChooseNeedId =
  | "overwhelmed"
  | "make-progress"
  | "something-on-mind"
  | "need-decision"
  | "not-sure";

export type HelpMeChooseNeedOption = {
  id: HelpMeChooseNeedId;
  label: string;
  aliases: string[];
};

export type HelpMeChooseSupportOption = {
  id: string;
  title: string;
  benefit: string;
  destination: DailyOpeningDestination | { kind: "stay-in-chat"; cue?: string };
};

export const HELP_ME_CHOOSE_PROMPT =
  "What would help most right now?" as const;

export const HELP_ME_CHOOSE_NEED_OPTIONS: readonly HelpMeChooseNeedOption[] = [
  {
    id: "overwhelmed",
    label: "I feel overwhelmed",
    aliases: ["overwhelmed", "overwhelm", "too much", "stressed"],
  },
  {
    id: "make-progress",
    label: "I want to make progress on something",
    aliases: ["make progress", "progress", "get something done", "momentum"],
  },
  {
    id: "something-on-mind",
    label: "I have something on my mind",
    aliases: ["on my mind", "something on my mind", "thinking about"],
  },
  {
    id: "need-decision",
    label: "I need to make a decision",
    aliases: ["decision", "decide", "choose between"],
  },
  {
    id: "not-sure",
    label: "I'm not sure",
    aliases: ["not sure", "unsure", "i don't know", "dont know"],
  },
] as const;

export function resolveHelpMeChooseSupportOptions(
  needId: HelpMeChooseNeedId,
  continueOption: CompanionContinueOption | null,
): HelpMeChooseSupportOption[] {
  switch (needId) {
    case "overwhelmed":
      return [
        {
          id: "ov-clear-mind",
          title: "Clear My Mind",
          benefit:
            "Best when there is more than one thing on your mind — empty everything competing for attention.",
          destination: { kind: "clear-my-mind" },
        },
        {
          id: "ov-parking",
          title: "Park It",
          benefit:
            "Best for one task, idea, worry, follow-up, or reminder you are not ready to deal with yet.",
          destination: { kind: "section", section: "parking-lot" },
        },
        {
          id: "ov-plan",
          title: "Shape or adapt today",
          benefit: "Give the day a smaller, clearer shape.",
          destination: { kind: "plan-my-day" },
        },
        {
          id: "ov-talk",
          title: "Stay with me here",
          benefit: "Talk it through without opening another place yet.",
          destination: {
            kind: "stay-in-chat",
            cue: "I'm here with you. What's taking up the most space right now — too many thoughts, too many tasks, or something heavier?",
          },
        },
      ];
    case "make-progress": {
      const options: HelpMeChooseSupportOption[] = [];
      if (continueOption) {
        options.push({
          id: "prog-continue",
          title: continueOption.title.trim() || "Continue what you started",
          benefit: "Return to the meaningful work already in motion.",
          destination: { kind: "continue", option: continueOption },
        });
      }
      options.push(
        {
          id: "prog-projects",
          title: "Open Projects",
          benefit: "Choose one project home and take the next step there.",
          destination: { kind: "section", section: "projects" },
        },
        {
          id: "prog-shari",
          title: "Work with me here",
          benefit: "Stay in conversation and we'll pick one next step together.",
          destination: {
            kind: "stay-in-chat",
            cue: "What are you hoping to move forward — even a little — today?",
          },
        },
      );
      return options.slice(0, 3);
    }
    case "something-on-mind":
      return [
        {
          id: "mind-talk",
          title: "Talk It Out",
          benefit:
            "Think through one situation with Shari, one thoughtful question at a time.",
          destination: { kind: "section", section: "talk-it-out" },
        },
        {
          id: "mind-clear",
          title: "Clear My Mind",
          benefit:
            "Empty everything competing for attention onto a calm surface.",
          destination: { kind: "clear-my-mind" },
        },
        {
          id: "mind-journal",
          title: "Journal",
          benefit: "Write privately when talking out loud doesn't fit.",
          destination: { kind: "section", section: "growth-journal" },
        },
      ];
    case "need-decision":
      return [
        {
          id: "dec-compass",
          title: "Decision Compass",
          benefit: "A calm structure when the options feel tangled.",
          destination: { kind: "section", section: "decision-compass" },
        },
        {
          id: "dec-chamber",
          title: "Chamber of Momentum",
          benefit: "Invite a thoughtful perspective without rushing.",
          destination: { kind: "section", section: "chamber-of-momentum" },
        },
        {
          id: "dec-talk",
          title: "Talk It Out",
          benefit:
            "Reflect first with one question at a time — before formal comparison.",
          destination: { kind: "section", section: "talk-it-out" },
        },
      ];
    case "not-sure":
      return [
        {
          id: "unsure-one",
          title: "One gentle question",
          benefit: "We won't open a big menu — just the next useful question.",
          destination: {
            kind: "stay-in-chat",
            cue: "No rush. Is today more about settling your mind, making progress, or making a decision?",
          },
        },
      ];
    default:
      return [];
  }
}

export function registerHelpMeChooseNeedsPending(): void {
  const choices: PendingChoiceItem[] = HELP_ME_CHOOSE_NEED_OPTIONS.map(
    (need, index) => ({
      id: need.id,
      label: need.label,
      visibleNumber: index + 1,
      aliases: need.aliases,
      callback: { kind: "stay_in_chat" },
    }),
  );
  const menuText = [
    HELP_ME_CHOOSE_PROMPT,
    ...HELP_ME_CHOOSE_NEED_OPTIONS.map((n, i) => `${i + 1}. ${n.label}`),
  ].join("\n");
  registerPendingChoice({
    type: "generic",
    choices,
    menuText,
    activeWorkflow: "daily-opening-help-me-choose-needs",
  });
}

export function registerHelpMeChooseSupportPending(
  options: HelpMeChooseSupportOption[],
): void {
  const choices: PendingChoiceItem[] = options.map((opt, index) => ({
    id: opt.id,
    label: opt.title,
    visibleNumber: index + 1,
    callback: { kind: "stay_in_chat" },
  }));
  const menuText = options
    .map((o, i) => `${i + 1}. ${o.title}`)
    .join("\n");
  registerPendingChoice({
    type: "generic",
    choices,
    menuText,
    activeWorkflow: "daily-opening-help-me-choose-support",
  });
}
