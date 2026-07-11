/** AI Extensions Center — specialist AI tools; Founder remains Executive Headquarters. */

export type AiExtensionTool = {
  id: string;
  name: string;
  purpose: string;
  bestUsedFor: string;
  openUrl: string;
  copyPromptPlaceholder: string;
  relatedMissionPlaceholder: string;
  notes?: string;
  isFuture?: boolean;
};

export type AiExtensionsCenterView = {
  product: "founder";
  generatedAt: string;
  headline: string;
  summary: string;
  tools: AiExtensionTool[];
};
