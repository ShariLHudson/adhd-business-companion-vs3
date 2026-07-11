"use client";

import { useMemo } from "react";

import { getExecutiveResourcesCenterBootstrap } from "@/lib/founder/resourcesCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { ResourceAdmissionGate } from "./resourcesCenter/ResourceAdmissionGate";
import { ResourceDepartmentPanel } from "./resourcesCenter/ResourceDepartmentPanel";

export function FounderExecutiveResourcesCenter() {
  const center = useMemo(() => getExecutiveResourcesCenterBootstrap(), []);

  return (
    <div className="founder-resources">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Resources Center"
        title="Executive Headquarters — Every Department"
        question="Where is it? Why do I use it? When should I use it?"
        purpose="One calm executive control center — external systems, AI tools, calendars, documents, and executive links. Founder orchestrates; departments execute."
      />

      <section className="founder-resources__hero" aria-labelledby="resources-hero">
        <h2 className="founder-resources__section-title" id="resources-hero">
          The One Office Principle
        </h2>
        <p className="founder-resources__lead">{center.summary}</p>
      </section>

      <ResourceAdmissionGate
        rule={center.admissionRule}
        questions={center.admissionQuestions}
      />

      <section className="founder-resources__nav" aria-labelledby="resources-nav-title">
        <h2 className="founder-resources__section-title" id="resources-nav-title">
          Permanent knowledge
        </h2>
        <div className="founder-resources__nav-links">
          <a className="founder-resources__nav-link" href={center.integrationCenterHref}>
            Executive Integration Center — Mission Control
          </a>
          <a className="founder-resources__nav-link" href={center.knowledgeVaultHref}>
            Founder Knowledge Vault — curated executive archive
          </a>
          <a className="founder-resources__nav-link" href={center.masterLibraryHref}>
            Spark Master Library — permanent knowledge index
          </a>
        </div>
      </section>

      <section className="founder-resources__departments" aria-labelledby="resources-dept-title">
        <h2 className="founder-resources__section-title" id="resources-dept-title">
          Departments
        </h2>
        <p className="founder-resources__lead">
          Every external application is a specialized department. Founder decides. Founder prepares.
          Founder recommends.
        </p>
        <div className="founder-resource__departments">
          {center.departments.map((department, index) => (
            <ResourceDepartmentPanel
              key={department.id}
              department={department}
              defaultOpen={index < 2}
            />
          ))}
        </div>
      </section>

      <section className="founder-resources__search" aria-labelledby="resources-search-title">
        <h2 className="founder-resources__section-title" id="resources-search-title">
          {center.executiveSearch.headline}
        </h2>
        <p className="founder-resources__lead">{center.executiveSearch.summary}</p>
        <ul className="founder-resources__search-scopes">
          {center.executiveSearch.scopes.map((scope) => (
            <li key={scope.id} className="founder-resources__search-scope">
              <span className="founder-resources__search-label">{scope.label}</span>
              <span className="founder-resources__search-desc">{scope.description}</span>
              <span className={`founder-resources__search-status founder-resources__search-status--${scope.status}`}>
                {scope.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
