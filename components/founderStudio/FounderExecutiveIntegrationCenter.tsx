"use client";

import { useCallback, useMemo, useState } from "react";

import { composeIntegrationCenterView, composeIntegrationSearch } from "@/lib/executiveIntegration";
import { getIntegrationCenterBootstrap } from "@/lib/founder/integrationCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import type { IntegrationSearchView } from "@/lib/executiveIntegration/types";

import { RoomHeader } from "./executive/RoomHeader";
import { IntegrationGroupPanel } from "./integrationCenter/IntegrationGroupPanel";
import { IntegrationSearchPanel } from "./integrationCenter/IntegrationSearchPanel";

export function FounderExecutiveIntegrationCenter() {
  const bootstrap = useMemo(() => getIntegrationCenterBootstrap(), []);
  const center = useMemo(() => composeIntegrationCenterView(), []);
  const [query, setQuery] = useState("");
  const [searchView, setSearchView] = useState<IntegrationSearchView | null>(null);

  const runSearch = useCallback(() => {
    setSearchView(composeIntegrationSearch(query));
  }, [query]);

  return (
    <div className="founder-integration">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Integration Center™"
        title="Mission Control for Visual Spark Studios"
        question="What do I need from my connected systems today?"
        purpose="One calm executive headquarters — Founder orchestrates. PostCraft creates. GHL delivers. Cursor builds. You run the company."
      />

      <section className="founder-integration__hero" aria-labelledby="integration-hero">
        <h2 className="founder-integration__section-title" id="integration-hero">
          The One Office Principle™
        </h2>
        <p className="founder-integration__overnight">{bootstrap.oneOfficeMessage}</p>
        <p className="founder-integration__stats">
          {bootstrap.connectedCount} connected · {bootstrap.needsConfigurationCount} need configuration ·{" "}
          {bootstrap.groupCount} departments
        </p>
      </section>

      <IntegrationSearchPanel
        query={query}
        onQueryChange={setQuery}
        onSearch={runSearch}
        searchView={searchView}
      />

      <div className="founder-integration__groups">
        {center.groups.map((group, index) => (
          <IntegrationGroupPanel
            key={group.id}
            group={group}
            defaultOpen={index < 3}
          />
        ))}
      </div>
    </div>
  );
}
