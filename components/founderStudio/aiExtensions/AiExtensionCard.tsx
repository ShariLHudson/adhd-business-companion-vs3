"use client";

import type { AiExtensionTool } from "@/lib/founderAiExtensions/types";

import { CopyPlaceholderButton } from "../shared/CopyPlaceholderButton";

type AiExtensionCardProps = {
  tool: AiExtensionTool;
};

export function AiExtensionCard({ tool }: AiExtensionCardProps) {
  return (
    <article
      className={`founder-ai-ext__card${tool.isFuture ? " founder-ai-ext__card--future" : ""}`}
    >
      <header className="founder-ai-ext__card-header">
        <h3 className="founder-ai-ext__card-name">{tool.name}</h3>
        {tool.isFuture ? (
          <span className="founder-ai-ext__badge">Planned</span>
        ) : null}
      </header>

      <p className="founder-ai-ext__purpose">{tool.purpose}</p>

      <div className="founder-ai-ext__field">
        <span className="founder-ai-ext__field-label">Best used for</span>
        <span className="founder-ai-ext__field-value">{tool.bestUsedFor}</span>
      </div>

      {tool.notes ? <p className="founder-ai-ext__notes">{tool.notes}</p> : null}

      <div className="founder-ai-ext__placeholders">
        <p className="founder-ai-ext__placeholder-line">
          <span className="founder-ai-ext__field-label">Related mission</span>
          <span className="founder-ai-ext__field-value">{tool.relatedMissionPlaceholder}</span>
        </p>
      </div>

      <div className="founder-ai-ext__actions">
        <a
          className="founder-ai-ext__action founder-ai-ext__action--primary"
          href={tool.openUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open tool
        </a>
        <CopyPlaceholderButton
          label="Copy prompt"
          text={tool.copyPromptPlaceholder}
          className="founder-ai-ext__action"
        />
      </div>
    </article>
  );
}
