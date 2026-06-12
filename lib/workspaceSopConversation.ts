// Conversation-mode replies (question / feedback) — never write to fields.

import {
  getCurrentSopStep,
  getSopProgress,
  getStepValue,
  setSopOptions,
  type WorkspaceSession,
} from "./workspaceSop";
import type { WorkspaceCoachTurn, WorkspaceContext } from "./workspaceAwareness";
import type { WorkspaceFieldId } from "./workspaceAwareness";
import type { DayLevel } from "./companionStore";
import { extractProjectQuery } from "./workspaceIntent";
import { searchProjects } from "./workspaceProjectLookup";
import { titleOptions } from "./workspaceSopHelp";

function focusPrefix(fieldId: WorkspaceFieldId): string {
  return `[[focus:${fieldId}]]`;
}

export function buildQuestionTurn(
  session: WorkspaceSession,
  ctx: WorkspaceContext,
  userText: string,
): WorkspaceCoachTurn {
  const t = userText.toLowerCase();
  const step = getCurrentSopStep(session);
  const title =
    getStepValue(session, "workshop-title") ||
    getStepValue(session, "project-name") ||
    ctx.selectedItemName?.trim() ||
    "";

  if (
    /\b(?:where.*project|project.*go|disappear|lost my|find my project|show me my)\b/.test(
      t,
    )
  ) {
    const query = extractProjectQuery(userText);
    if (query && ctx.view === "list") {
      const matches = searchProjects(query);
      if (matches.length === 1) {
        return {
          reply: `${focusPrefix("project-title")}**${matches[0]!.name}** is in your Projects list — tap it in the panel beside us, or tell me **open ${matches[0]!.name}** and I'll bring it up.`,
          focusField: "project-title",
          sessionPatch: session,
        };
      }
    }
    if (ctx.view === "create") {
      return {
        reply: `${focusPrefix("project-title")}Your project is right here beside us — still in the create flow${title ? ` as **${title}**` : ""}. Nothing disappeared. Edit the fields in the panel, or tap **Create project** when you're ready to save it to your Projects list.`,
        focusField: "project-title",
        sessionPatch: session,
      };
    }
    if (ctx.view === "detail" && title) {
      return {
        reply: `${focusPrefix("project-title")}**${title}** is open in Projects beside us — it's saved in your project list. Use **‹ All projects** in the panel if you want to switch.`,
        focusField: "project-title",
        sessionPatch: session,
      };
    }
    return {
      reply: `${focusPrefix("project-title")}Projects is open beside us. ${ctx.view === "list" ? "Pick a project from the list or tap **New project**." : "Tell me what you see in the panel."}`,
      focusField: "project-title",
      sessionPatch: session,
    };
  }

  if (/\b(?:what happened|why did|what went wrong)\b/.test(t)) {
    return {
      reply: `${focusPrefix(step.fieldId)}Nothing was deleted — we're still building${title ? ` **${title}**` : " this project"} step by step in the panel beside us. Current step: **${step.label}**.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  return {
    reply: `${focusPrefix(step.fieldId)}Good question — I'll answer in chat, not in your project fields. Right now we're on **${step.label}**. ${step.coachQuestion}`,
    focusField: step.fieldId,
    sessionPatch: session,
  };
}

export function buildProgressTurn(session: WorkspaceSession): WorkspaceCoachTurn {
  const progress = getSopProgress(session);
  const done = progress.filter((p) => p.status === "done").map((p) => p.label);
  const step = getCurrentSopStep(session);
  const upcoming = progress
    .filter((p) => p.status === "upcoming")
    .slice(0, 3)
    .map((p) => p.label);
  const title =
    getStepValue(session, "workshop-title") ||
    session.projectTitle ||
    "your workshop";

  const doneLine =
    done.length > 0
      ? `✓ Done: **${done.join("**, **")}**`
      : "✓ Done: (we're just getting started)";
  const nextLine =
    upcoming.length > 0
      ? `Next up: **${upcoming[0]}**${upcoming.length > 1 ? `, then **${upcoming.slice(1).join("**, **")}**` : ""}`
      : `We're on **${step.label}** now.`;

  return {
    reply: `${focusPrefix(step.fieldId)}Here's where we are on **${title}**:\n\n${doneLine}\n→ Current step: **${step.label}**\n→ ${nextLine}\n\nNothing changes unless you edit a field or say **next**.`,
    focusField: step.fieldId,
    sessionPatch: session,
  };
}

export function buildFeedbackTurn(
  session: WorkspaceSession,
  userText = "",
): WorkspaceCoachTurn {
  const step = getCurrentSopStep(session);
  const title =
    getStepValue(session, "workshop-title") ||
    getStepValue(session, "project-name") ||
    session.projectTitle ||
    "";

  if (/\b(?:don'?t like|not like).*(?:title|that)\b/i.test(userText)) {
    const current = title || getStepValue(session, "workshop-title") || "(not set yet)";
    const options = titleOptions(session);
    const updated = setSopOptions(
      session,
      options,
      "Shari is helping you pick a different title.",
    );
    return {
      reply: `${focusPrefix("project-title")}No problem — we don't have to keep **${current}**. Here are other directions:\n\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\nSay **number 2**, tell me what you'd prefer, or edit the title field directly.`,
      focusField: "project-title",
      sessionPatch: updated,
    };
  }

  if (/\bconfusing\b/i.test(userText)) {
    return {
      reply: `${focusPrefix(step.fieldId)}Let me slow down. ${title ? `**${title}** is still right here beside us` : "Your project is still beside us"} — we're on **${step.label}**. Nothing was saved from that message. Tell me what feels unclear, or edit the field directly.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  return {
    reply: `${focusPrefix(step.fieldId)}Thanks for telling me. You can edit the **${step.label}** field directly beside us, or tell me what you'd like instead — I won't overwrite it until you give me the new wording.`,
    focusField: step.fieldId,
    sessionPatch: session,
  };
}

export function buildClarificationTurn(
  session: WorkspaceSession,
  ctx: WorkspaceContext,
): WorkspaceCoachTurn {
  const step = getCurrentSopStep(session);
  const title =
    getStepValue(session, "workshop-title") ||
    getStepValue(session, "project-name") ||
    session.projectTitle ||
    ctx.selectedItemName?.trim() ||
    "your workshop";
  const contextBlob = `${session.openingContext} ${title}`.toLowerCase();
  const appWorkshop = /\bapp\b/.test(contextBlob);

  if (step.id === "workshop-sections" || step.fieldId === "workshop-sections") {
    const examples = appWorkshop
      ? [
          "Why ADHD entrepreneurs feel stuck",
          "How the app helps them clear the noise",
          "How to take one clear action using the app",
        ]
      : [
          "Why your audience feels stuck",
          `How ${title} helps them see clearly`,
          "One clear action they can take right away",
        ];
    return {
      reply: `${focusPrefix(step.fieldId)}Yes. This part is where we outline the main pieces of **${title}**.\n\nThink of **Sections** as the 3 main things you'll teach:\n1. ${examples[0]}\n2. ${examples[1]}\n3. ${examples[2]}\n\nYou can type your own sections in the field beside us, or tell me if you want help choosing them.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  if (step.fieldId === "project-title") {
    return {
      reply: `${focusPrefix(step.fieldId)}**Title** is simply what you'll call this workshop — the name people see first. It doesn't need to be perfect. Type one in the field beside us, or ask me for title ideas.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  if (step.fieldId === "project-goal") {
    return {
      reply: `${focusPrefix(step.fieldId)}**Outcome** is one sentence on what someone can *do* after your workshop — the result they'll walk away with. Your question won't be saved into the field. When you're ready, type it beside us or ask for examples.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  if (step.fieldId === "workshop-audience") {
    return {
      reply: `${focusPrefix(step.fieldId)}**Audience** is who this workshop is for — be specific (e.g. ADHD business owners, solo entrepreneurs). Nothing you asked goes into the field until you choose the wording.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  return {
    reply: `${focusPrefix(step.fieldId)}Good question. **${step.label}** is this step: ${step.coachQuestion} I won't save your question into the project — edit the field beside us when you're ready, or keep asking here.`,
    focusField: step.fieldId,
    sessionPatch: session,
  };
}

export function buildConversationTurn(
  session: WorkspaceSession,
  userText: string,
): WorkspaceCoachTurn {
  const t = userText.toLowerCase();
  const step = getCurrentSopStep(session);
  const title =
    getStepValue(session, "workshop-title") ||
    getStepValue(session, "project-name") ||
    session.projectTitle ||
    "";

  if (
    /\b(?:already did|already finished|first few steps|we already|what have we already done|what we'?ve already done|where are we in|what comes next)\b/.test(
      t,
    )
  ) {
    return buildProgressTurn(session);
  }

  if (/\b(?:overwhelmed|slow (?:this )?down|can you slow)\b/.test(t)) {
    return {
      reply: `${focusPrefix(step.fieldId)}That's okay — we can slow down. We're only on **${step.label}**${title ? ` for **${title}**` : ""} right now. One field, one step. Tell me what feels like too much, or just edit the field beside us when you're ready.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  if (/\bchanged my mind\b/.test(t)) {
    return {
      reply: `${focusPrefix(step.fieldId)}What changed for you? We can redirect — I won't change any fields unless you ask.${title ? ` We're on **${title}**, step **${step.label}**.` : ` Current step: **${step.label}**.`}`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  if (/\b(?:not sure.*title|title.*(?:right|wrong)|unsure about.*title)\b/.test(t)) {
    const current =
      title || getStepValue(session, "workshop-title") || "(not set yet)";
    const options = titleOptions(session).slice(0, 3);
    const updated = setSopOptions(
      session,
      options,
      "Shari is discussing title options with you.",
    );
    const optionsBlock = options
      .map((o, i) => `${i + 1}. ${o}`)
      .join("\n");
    return {
      reply: `${focusPrefix("project-title")}Your title right now is **${current}**. We can talk it through — no rush to move on.\n\nOther directions:\n${optionsBlock}\n\nSay **number 2**, tell me what you prefer, or edit the title field beside us.`,
      focusField: "project-title",
      sessionPatch: updated,
    };
  }

  if (/\b(?:stuck|confused|too much|not sure if)\b/.test(t)) {
    return {
      reply: `${focusPrefix(step.fieldId)}That's okay — we don't have to rush. We're on **${step.label}**${title ? ` for **${title}**` : ""}. Tell me what's feeling hard, or edit the field beside us whenever you're ready.`,
      focusField: step.fieldId,
      sessionPatch: session,
    };
  }

  return {
    reply: `${focusPrefix(step.fieldId)}I'm with you. We're on **${step.label}**${title ? ` for **${title}**` : ""} — chat here, edit in the panel, whatever feels easier.`,
    focusField: step.fieldId,
    sessionPatch: session,
  };
}

export function buildWorkflowCompletionMessage(
  session: WorkspaceSession,
  ctx: WorkspaceContext,
  energy: DayLevel,
): string {
  const progress = getSopProgress(session);
  const completed = progress
    .filter((p) => p.status === "done")
    .map((p) => p.label);
  const remaining = progress
    .filter((p) => p.status === "upcoming")
    .map((p) => p.label);
  const title =
    getStepValue(session, "workshop-title") ||
    getStepValue(session, "project-name") ||
    ctx.selectedItemName?.trim() ||
    "your project";

  const saved =
    ctx.view === "detail"
      ? `**${title}** is saved in your **Projects** list (open beside us).`
      : `**${title}** is in the panel beside us — tap **Create project** to save it to your Projects list.`;

  const completedLine =
    completed.length > 0
      ? `✓ Completed: ${completed.join(", ")}`
      : "✓ Completed: (fields captured in the panel)";
  const remainingLine =
    remaining.length > 0
      ? `○ For a later session: ${remaining.join(", ")}`
      : energy === "low"
        ? "○ We kept today's scope small on purpose — you can add more when you have energy."
        : "○ Full workflow steps are available when you want to continue.";

  return `${focusPrefix(getCurrentSopStep(session).fieldId)}${saved}\n\n${completedLine}\n${remainingLine}`;
}
