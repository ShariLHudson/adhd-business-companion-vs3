"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { BusinessEstateSectionEditor } from "@/components/companion/business-estate/BusinessEstateSectionEditor";
import {
  BUSINESS_ESTATE_SECTIONS,
  getBusinessEstateSectionStatus,
  summarizeBusinessEstateSection,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import { buildApprovedBusinessSnapshot } from "@/lib/profile/businessSnapshot";
import "@/app/companion/my-business-estate.css";

const STATUS_LABELS = {
  "not-started": "Not started",
  started: "Started",
  "ready-to-review": "Ready to review",
  updated: "Updated",
} as const;

function formatSnapshot(snapshot: string): string {
  return snapshot.includes("\n") ? snapshot.split("\n").join(" · ") : snapshot;
}

/** My Business Estate — editable section overview (separate from People I Help). */
export function MyBusinessEstatePanel() {
  const [snapshot, setSnapshot] = useState(() => buildApprovedBusinessSnapshot());
  const [activeSection, setActiveSection] =
    useState<BusinessEstateSectionId | null>(null);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setSnapshot(buildApprovedBusinessSnapshot());
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("companion-business-estate-updated", onUpdate);
    window.addEventListener("companion-prefs-updated", onUpdate);
    return () => {
      window.removeEventListener("companion-business-estate-updated", onUpdate);
      window.removeEventListener("companion-prefs-updated", onUpdate);
    };
  }, [refresh]);

  const activeMeta = BUSINESS_ESTATE_SECTIONS.find(
    (section) => section.id === activeSection,
  );

  return (
    <MyBusinessEstateRoomShell>
      <EstateWorkspace className="my-business-estate-panel estate-workspace--landing">
        {activeSection && activeMeta ? (
          <BusinessEstateSectionEditor
            sectionId={activeSection}
            title={activeMeta.title}
            description={activeMeta.description}
            onBack={() => {
              setActiveSection(null);
              refresh();
            }}
          />
        ) : (
          <>
            <header className="my-business-estate-panel__header">
              <p className="estate-workspace__kicker">Profile</p>
              <h1 className="estate-workspace__title">My Business Estate</h1>
              <p className="my-business-estate-panel__lead">
                Your business home inside Spark Estate — where approved
                information about your business can come together and grow over
                time.
              </p>
            </header>

            <section
              className="my-business-estate-panel__snapshot"
              aria-label="Business Snapshot"
            >
              <h2 className="my-business-estate-panel__snapshot-title">
                Business Snapshot
              </h2>
              <p className="my-business-estate-panel__snapshot-body">
                {formatSnapshot(snapshot)}
              </p>
            </section>

            <section
              className="my-business-estate-panel__sections"
              aria-label="Business Estate sections"
            >
              <h2 className="my-business-estate-panel__section-title">
                Your business sections
              </h2>
              <ul className="my-business-estate-panel__section-list" key={revision}>
                {BUSINESS_ESTATE_SECTIONS.map((section) => {
                  const status = getBusinessEstateSectionStatus(section.id);
                  return (
                    <li key={section.id}>
                      <article className="my-business-estate-panel__section-card">
                        <div className="my-business-estate-panel__section-card-head">
                          <h3 className="my-business-estate-panel__section-card-title">
                            {section.title}
                          </h3>
                          <span
                            className={`my-business-estate-panel__section-status my-business-estate-panel__section-status--${status}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                        <p className="my-business-estate-panel__section-card-summary">
                          {summarizeBusinessEstateSection(section.id)}
                        </p>
                        <button
                          type="button"
                          className="my-business-estate-panel__section-open"
                          onClick={() => setActiveSection(section.id)}
                        >
                          {status === "not-started" ? "Open" : "Edit"}
                        </button>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
