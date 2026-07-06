"use client";

import { useMemo, useState } from "react";

import { listVaultDecisions } from "@/lib/founder/memory/decisionVault";
import { listLessonsLearned } from "@/lib/founder/memory/lessons";
import { listCompanyMilestones } from "@/lib/founder/memory/milestones";
import { searchFounderMemory } from "@/lib/founder/memory/search";
import { getMemoryVaultOverview } from "@/lib/founder/memory/services";
import { listMemoryTimeline } from "@/lib/founder/memory/timeline";
import type { FounderMemorySearchScope } from "@/lib/founder/memory/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { DecisionVaultCard } from "./memory/DecisionVaultCard";
import { FounderJournalPanel } from "./memory/FounderJournalPanel";
import { LessonsPanel } from "./memory/LessonsPanel";
import { MemorySearchBar } from "./memory/MemorySearchBar";
import { MemorySearchResults } from "./memory/MemorySearchResults";
import { MemoryTimeline } from "./memory/MemoryTimeline";
import { MilestonesPanel } from "./memory/MilestonesPanel";

export function FounderDecisionVault() {
  const overview = useMemo(() => getMemoryVaultOverview(), []);
  const decisions = useMemo(() => listVaultDecisions(), []);
  const timeline = useMemo(() => listMemoryTimeline(), []);
  const lessons = useMemo(() => listLessonsLearned(), []);
  const milestones = useMemo(() => listCompanyMilestones(), []);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<FounderMemorySearchScope>("all");
  const [expandedDecisionId, setExpandedDecisionId] = useState<string | null>(
    decisions[0]?.id ?? null,
  );

  const searchResults = useMemo(
    () => searchFounderMemory(query, scope),
    [query, scope],
  );

  return (
    <div className="founder-memory-vault">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Founder Memory & Decision Vault™"
        title="Decision Vault"
        question="What did we decide — and why?"
        purpose="Institutional memory for Visual Spark Studios. Every major decision, lesson, and milestone preserved."
      />

      <MemorySearchBar
        query={query}
        scope={scope}
        onQueryChange={setQuery}
        onScopeChange={setScope}
      />
      <MemorySearchResults results={searchResults} query={query} />

      <section className="founder-memory-vault__decisions" aria-labelledby="decision-vault-heading">
        <h2 className="founder-memory-vault__section-title" id="decision-vault-heading">
          Decision Vault
        </h2>
        <p className="founder-memory-vault__section-note">
          {overview.links.length} cross-links in sample archive ·{" "}
          {overview.memories.length} memory anchors
        </p>
        <div className="founder-memory-vault__decision-grid">
          {decisions.map((decision) => (
            <DecisionVaultCard
              key={decision.id}
              decision={decision}
              expanded={expandedDecisionId === decision.id}
              onToggle={() =>
                setExpandedDecisionId(
                  expandedDecisionId === decision.id ? null : decision.id,
                )
              }
            />
          ))}
        </div>
      </section>

      <MemoryTimeline events={timeline} />
      <LessonsPanel lessons={lessons} />
      <MilestonesPanel milestones={milestones} />
      <FounderJournalPanel sampleEntries={overview.journal} />
    </div>
  );
}
