import type { TemplateItem } from "./companionStore";
import { selectedAudienceLabel } from "./contentAudience";
import { itemTypeFromTemplate } from "./templateItemType";
import type { CreationWorkspaceInput } from "./workspaceCreation";

/** Conversation-first entry when starting from a saved template. */
export function templateBuildWithShariChatPrompt(template: {
  title: string;
  category?: string;
  body?: string;
}): string {
  const excerpt = template.body?.trim();
  const categoryBit = template.category ? ` (${template.category})` : "";
  if (!excerpt && (!template.title || template.title === "New template")) {
    return (
      "I want to create a new template with Shari. " +
      "What kind of template do you want to create? Ask me one gentle question before we draft anything."
    );
  }
  return (
    `I want to use my **${template.title}** template${categoryBit} as a starting point.` +
    (excerpt
      ? `\n\nTemplate excerpt:\n${excerpt.slice(0, 600)}${excerpt.length > 600 ? "…" : ""}`
      : "") +
    `\n\nHelp me adapt it for **${selectedAudienceLabel()}** — ask me one question before we draft anything.`
  );
}

/** Chat entry for a new template from the blank editor. */
export function templateBlankEditorHelpPrompt(): string {
  return (
    "I'm starting a blank template framework. " +
    "What kind of template do you want to create? Ask me one gentle question — don't draft anything yet."
  );
}

export function templateToCreationInput(template: TemplateItem): CreationWorkspaceInput {
  const itemType = itemTypeFromTemplate(template);
  const audience = selectedAudienceLabel();
  return {
    itemType,
    title: template.title,
    draftContent: template.body,
    brief: `Audience: ${audience}. Template: ${template.title}`,
    templateId: template.id,
    source: "template",
    stage: "using template",
  };
}
