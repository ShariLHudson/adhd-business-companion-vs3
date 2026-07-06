import {
  AI_EXTENSIONS_HEADLINE,
  AI_EXTENSION_TOOLS,
  AI_EXTENSIONS_SUMMARY,
} from "../sample/aiExtensionsData";
import type { AiExtensionsCenterView } from "../types";

export function composeAiExtensionsCenterView(): AiExtensionsCenterView {
  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    headline: AI_EXTENSIONS_HEADLINE,
    summary: AI_EXTENSIONS_SUMMARY,
    tools: [...AI_EXTENSION_TOOLS],
  };
}
