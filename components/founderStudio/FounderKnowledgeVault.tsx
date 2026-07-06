"use client";

import { useMemo } from "react";

import { getKnowledgeVaultBootstrap } from "@/lib/founder/knowledgeVaultCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { KnowledgeVaultSectionPanel } from "./knowledgeVault/KnowledgeVaultSectionPanel";

export function FounderKnowledgeVault() {
  const vault = useMemo(() => getKnowledgeVaultBootstrap(), []);

  return (
    <div className="founder-vault">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Founder Knowledge Vault™"
        title="Executive Archive"
        question="Where does our source of truth live?"
        purpose="Constitutions, blueprints, prompts, Cursor rules, and recovery documents — organized for calm retrieval, not file hunting."
      />

      <section className="founder-vault__hero" aria-labelledby="vault-hero">
        <p className="founder-vault__lead" id="vault-hero">
          {vault.summary}
        </p>
        <p className="founder-vault__stats">
          {vault.sections.length} sections ·{" "}
          {vault.sections.reduce((n, s) => n + s.items.length, 0)} documents indexed
        </p>
      </section>

      <div className="founder-vault__sections">
        {vault.sections.map((section, index) => (
          <KnowledgeVaultSectionPanel
            key={section.id}
            section={section}
            defaultOpen={index < 2}
          />
        ))}
      </div>
    </div>
  );
}
