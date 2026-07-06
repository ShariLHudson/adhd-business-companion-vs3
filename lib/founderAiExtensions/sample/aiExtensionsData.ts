import type { AiExtensionTool } from "../types";

export const AI_EXTENSIONS_HEADLINE = "AI Extensions Center™";
export const AI_EXTENSIONS_SUMMARY =
  "Specialist AI tools for Visual Spark Studios. Extensions only — Founder Studio remains the Executive Headquarters. No paid APIs connected in this sprint.";

export const AI_EXTENSION_TOOLS: readonly AiExtensionTool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    purpose: "General executive thinking, drafting, and exploration.",
    bestUsedFor: "Fast drafts, brainstorming, rewriting in Shari's voice.",
    openUrl: "https://chat.openai.com",
    copyPromptPlaceholder: "Paste your ChatGPT system prompt here when ready.",
    relatedMissionPlaceholder: "Link to current Founder mission (sample).",
    notes: "External link only — no API in V1.",
  },
  {
    id: "vss-command-center",
    name: "VSS Command Center GPT",
    purpose: "Visual Spark Studios executive command — research, images, prompts.",
    bestUsedFor: "Executive research, image generation, prompt development.",
    openUrl: "https://chat.openai.com/gpts",
    copyPromptPlaceholder: "Command Center GPT custom instructions…",
    relatedMissionPlaceholder: "Listening Rooms restart · Integration Center",
  },
  {
    id: "claude",
    name: "Claude",
    purpose: "Long-form analysis, careful reasoning, document review.",
    bestUsedFor: "Architecture review, constitution checks, long documents.",
    openUrl: "https://claude.ai",
    copyPromptPlaceholder: "Claude project prompt placeholder.",
    relatedMissionPlaceholder: "Architecture freeze review",
  },
  {
    id: "gemini",
    name: "Gemini",
    purpose: "Google ecosystem research and multimodal exploration.",
    bestUsedFor: "Workspace-adjacent research, quick comparisons.",
    openUrl: "https://gemini.google.com",
    copyPromptPlaceholder: "Gemini prompt placeholder.",
    relatedMissionPlaceholder: "Google Workspace integration planning",
  },
  {
    id: "cursor",
    name: "Cursor",
    purpose: "Development implementation assistant for Spark codebase.",
    bestUsedFor: "Founder-approved builds, tests, and surgical fixes.",
    openUrl: "https://cursor.com",
    copyPromptPlaceholder: "Current implementation sprint prompt…",
    relatedMissionPlaceholder: "Knowledge Vault + AI Extensions sprint",
    notes: "Follow Founder Knowledge Vault rule before architecture changes.",
  },
  {
    id: "image-creation-gpt",
    name: "Image Creation GPT",
    purpose: "Estate imagery, workshop visuals, and brand assets.",
    bestUsedFor: "Estate scenes, social visuals, concept art.",
    openUrl: "https://chat.openai.com/gpts",
    copyPromptPlaceholder: "Estate image prompt — scene, light, mood…",
    relatedMissionPlaceholder: "Estate room backgrounds",
  },
  {
    id: "future-ai",
    name: "Future AI Tools",
    purpose: "Reserved for additional specialist tools as they earn a place.",
    bestUsedFor: "Not yet assigned.",
    openUrl: "https://chat.openai.com",
    copyPromptPlaceholder: "Future tool prompt slot.",
    relatedMissionPlaceholder: "TBD",
    notes: "Placeholder card — add tools without redesigning Founder.",
    isFuture: true,
  },
] as const;
