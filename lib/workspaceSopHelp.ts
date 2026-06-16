// Field-specific help when the user asks for guidance (never saved as content).

import {
  getCurrentSopStep,
  setSopOptions,
  type WorkspaceSession,
} from "./workspaceSop";
import type {
  WorkspaceCoachTurn,
  WorkspaceFieldId,
} from "./workspaceAwareness";

function focusPrefix(fieldId: WorkspaceFieldId): string {
  return `[[focus:${fieldId}]]`;
}

export function titleOptions(session: WorkspaceSession): string[] {
  const ctx = session.openingContext.toLowerCase();
  if (/\bapp\b/.test(ctx)) {
    return [
      "Unlocking Productivity: Experience Our ADHD Business App",
      "Stop Spinning, Start Moving with the App",
      "From Overwhelmed to One Clear Step",
    ];
  }
  if (session.workflowId === "workshop") {
    return [
      "ADHD Business Momentum",
      "Stop Spinning, Start Moving",
      "From Overwhelmed to One Clear Step",
    ];
  }
  return [
    "Momentum Project",
    "One Clear Next Step",
    "Focus & Finish",
  ];
}

function outcomeOptions(session: WorkspaceSession): string[] {
  const ctx = session.openingContext.toLowerCase();
  if (/\bapp\b/.test(ctx)) {
    return [
      "understand how the app helps them focus",
      "see how it supports ADHD business owners",
      "take one clear action toward using the app",
    ];
  }
  return [
    "stop spinning and take one clear business action",
    "leave with a simple plan they can follow this week",
    "feel less overwhelmed about their next step",
  ];
}

function formatOptionsList(options: string[]): string {
  return options.map((o, i) => `${i + 1}. ${o}`).join("\n");
}

export function curiosityTitleOptions(): string[] {
  return [
    "What If You Could Finally Stop Spinning?",
    "The One Thing ADHD Entrepreneurs Overlook",
    "Why 'Busy' Isn't the Same as Moving Forward",
  ];
}

function stepExamples(
  session: WorkspaceSession,
  field: WorkspaceFieldId,
): string[] {
  const title = session.projectTitle ?? "your workshop";
  if (field === "workshop-audience") {
    return [
      "ADHD entrepreneurs running solo businesses",
      "Business owners with ADHD who feel stuck in planning",
      "Coaches supporting neurodivergent founders",
    ];
  }
  if (field === "workshop-sections") {
    return [
      "Why ADHD entrepreneurs feel stuck",
      "How to clear the noise and pick one priority",
      "One clear action to move the business forward",
    ];
  }
  if (field === "workshop-problem") {
    return [
      "Spinning on ideas without finishing anything",
      "Overwhelm from too many open loops",
      "Not knowing which business task matters today",
    ];
  }
  if (field === "project-goal") {
    return outcomeOptions(session);
  }
  return [
    `A concrete result someone gets from ${title}`,
    "A simple next step they can take this week",
    "Less overwhelm about what to work on",
  ];
}

export function buildHelpTurn(
  session: WorkspaceSession,
  userText = "",
): WorkspaceCoachTurn {
  const step = getCurrentSopStep(session);
  const field = step.fieldId;
  const t = userText.toLowerCase();

  if (
    field === "project-title" &&
    /\b(?:curiosity|make it more|more engaging|better title)\b/.test(t)
  ) {
    const options = /\bcuriosity\b/.test(t)
      ? curiosityTitleOptions()
      : titleOptions(session);
    const updated = setSopOptions(session, options, "Shari is refining title options.");
    return {
      reply: `${focusPrefix(field)}Here are some ${/\bcuriosity\b/.test(t) ? "curiosity-driven " : ""}title directions:\n\n${formatOptionsList(options)}\n\nSay **number 2**, pick one beside us, or tell me what to tweak.`,
      focusField: field,
      sessionPatch: updated,
    };
  }

  if (/\b(?:examples?|give me examples|can you give me examples)\b/.test(t)) {
    const examples = stepExamples(session, field);
    const updated = setSopOptions(session, examples, `Examples for ${step.label}.`);
    return {
      reply: `${focusPrefix(field)}Sure — here are examples for **${step.label.toLowerCase()}**:\n\n${formatOptionsList(examples)}\n\nPick one (**number 2**), adapt them, or type your own in the field beside us.`,
      focusField: field,
      sessionPatch: updated,
    };
  }

  if (field === "project-title") {
    const options = titleOptions(session);
    const updated = setSopOptions(
      session,
      options,
      "Shari is helping you name the workshop.",
    );
    return {
      reply: `${focusPrefix(field)}No problem. Based on what you told me, here are a few low-pressure title options:\n\n${formatOptionsList(options)}\n\nWhich one feels closest? You can say **number 2**, pick one in chat, or type your own in the field beside us.`,
      focusField: field,
      sessionPatch: updated,
    };
  }

  if (field === "project-goal") {
    const options = outcomeOptions(session);
    const updated = setSopOptions(
      session,
      options,
      "Shari is helping you define the outcome.",
    );
    return {
      reply: `${focusPrefix(field)}Absolutely. Let's make it simple.\n\nFinish this sentence: *By the end of this workshop, people will be able to ______.*\n\nOr pick one:\n${formatOptionsList(options)}\n\nSay **number 2**, type your own, or add the outcome in the panel beside us.`,
      focusField: field,
      sessionPatch: updated,
    };
  }

  const updated = setSopOptions(session, [], step.coachQuestion);
  return {
    reply: `${focusPrefix(field)}Happy to help. ${step.coachQuestion} Tell me what you're stuck on, or type directly in the field beside us.`,
    focusField: field,
    sessionPatch: updated,
  };
}
