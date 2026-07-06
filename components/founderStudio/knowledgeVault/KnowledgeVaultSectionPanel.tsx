"use client";

import type { KnowledgeVaultSection } from "@/lib/founderKnowledgeVault/types";

import { KnowledgeVaultItemCard } from "./KnowledgeVaultItemCard";

type KnowledgeVaultSectionPanelProps = {
  section: KnowledgeVaultSection;
  defaultOpen?: boolean;
};

export function KnowledgeVaultSectionPanel({
  section,
  defaultOpen = false,
}: KnowledgeVaultSectionPanelProps) {
  return (
    <details className="founder-vault__section" open={defaultOpen}>
      <summary className="founder-vault__section-summary">
        <span className="founder-vault__section-label">{section.label}</span>
        <span className="founder-vault__section-count">{section.items.length} items</span>
      </summary>
      <p className="founder-vault__section-purpose">{section.purpose}</p>
      <div className="founder-vault__grid">
        {section.items.map((item) => (
          <KnowledgeVaultItemCard key={item.id} item={item} />
        ))}
      </div>
    </details>
  );
}
