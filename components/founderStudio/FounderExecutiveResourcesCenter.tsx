"use client";

import { useMemo } from "react";

import { getExecutiveResourcesCenterBootstrap } from "@/lib/founder/resourcesCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { AiExtensionCard } from "./aiExtensions/AiExtensionCard";
import { RoomHeader } from "./executive/RoomHeader";
import { EcosystemSystemsStatusTable } from "./integrationCenter/EcosystemSystemsStatusTable";
import { ResourceAdmissionGate } from "./resourcesCenter/ResourceAdmissionGate";

export function FounderExecutiveResourcesCenter() {
  const center = useMemo(() => getExecutiveResourcesCenterBootstrap(), []);

  return (
    <div className="founder-resources">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Resources Center™"
        title="All Important External Resources"
        question="Where do I go for systems, tools, and documents?"
        purpose="One authoritative place — external systems, AI tools, calendars, documents, dashboards, and executive links. Founder orchestrates; resources live here."
      />

      <section className="founder-resources__hero" aria-labelledby="resources-hero">
        <p className="founder-resources__lead" id="resources-hero">
          {center.summary}
        </p>
      </section>

      <ResourceAdmissionGate
        rule={center.admissionRule}
        questions={center.admissionQuestions}
      />

      <EcosystemSystemsStatusTable />

      <section className="founder-resources__nav" aria-labelledby="resources-nav-title">
        <h2 className="founder-resources__section-title" id="resources-nav-title">
          Connected departments
        </h2>
        <div className="founder-resources__nav-links">
          <a className="founder-resources__nav-link" href={center.integrationCenterHref}>
            Executive Integration Center — full Mission Control
          </a>
          <a className="founder-resources__nav-link" href={center.knowledgeVaultHref}>
            Founder Knowledge Vault — constitutions, prompts, recovery docs
          </a>
        </div>
      </section>

      <section className="founder-resources__ai" aria-labelledby="resources-ai-title">
        <h2 className="founder-resources__section-title" id="resources-ai-title">
          AI extensions
        </h2>
        <p className="founder-resources__lead">{center.aiExtensions.summary}</p>
        <div className="founder-ai-ext__grid">
          {center.aiExtensions.tools.map((tool) => (
            <AiExtensionCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
