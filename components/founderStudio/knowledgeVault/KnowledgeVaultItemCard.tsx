"use client";

import type { KnowledgeVaultItem } from "@/lib/founderKnowledgeVault/types";

import { CopyPlaceholderButton } from "../shared/CopyPlaceholderButton";

const STATUS_LABEL: Record<KnowledgeVaultItem["status"], string> = {
  active: "Active",
  reference: "Reference",
  archive: "Archive",
  draft: "Draft",
};

type KnowledgeVaultItemCardProps = {
  item: KnowledgeVaultItem;
};

export function KnowledgeVaultItemCard({ item }: KnowledgeVaultItemCardProps) {
  const promptText = item.promptExcerpt ?? `Open: ${item.documentPath}`;

  return (
    <article className="founder-vault__card">
      <header className="founder-vault__card-header">
        <h4 className="founder-vault__card-title">{item.title}</h4>
        <span className={`founder-vault__status founder-vault__status--${item.status}`}>
          {STATUS_LABEL[item.status]}
        </span>
      </header>

      <p className="founder-vault__card-purpose">{item.purpose}</p>

      <dl className="founder-vault__meta">
        <div>
          <dt>Last updated</dt>
          <dd>{item.lastUpdated}</dd>
        </div>
        <div>
          <dt>Path</dt>
          <dd className="founder-vault__path">{item.documentPath}</dd>
        </div>
      </dl>

      {item.notes ? <p className="founder-vault__notes">{item.notes}</p> : null}

      <div className="founder-vault__actions">
        <CopyPlaceholderButton
          label="Open document"
          text={item.documentPath}
          className="founder-vault__action founder-vault__action--primary"
        />
        <CopyPlaceholderButton
          label="Copy prompt"
          text={promptText}
          className="founder-vault__action"
        />
      </div>
    </article>
  );
}
