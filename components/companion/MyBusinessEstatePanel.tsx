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

const SECTION_ICONS: Record<BusinessEstateSectionId, string> = {
  identity: "🏛",
  offers: "✨",
  brand: "💬",
  direction: "🧭",
  "work-style": "⚡",
  tools: "🛠",
};

function formatSnapshot(snapshot: string): string {
  return snapshot.includes("\n") ? snapshot.split("\n").join(" · ") : snapshot;
}

type Props = {
  onClose: () => void;
};

/** My Business Estate — editable section overview (separate from People I Help). */
export function MyBusinessEstatePanel({ onClose }: Props) {
  const [snapshot, setSnapshot] = useState(() => buildApprovedBusinessSnapshot());
  const [activeSection, setActiveSection] =
    useState<BusinessEstateSectionId | null>(null);
  const [sectionDirty, setSectionDirty] = useState(false);
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

  function handleClose() {
    if (sectionDirty) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and close My Business Estate?",
      );
      if (!discard) return;
    }
    onClose();
  }

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
            onDirtyChange={setSectionDirty}
            onBack={() => {
              setSectionDirty(false);
              setActiveSection(null);
              refresh();
            }}
          />
        ) : (
          <>
            <header className="my-business-estate-panel__header">
              <div className="my-business-estate-panel__header-row">
                <div>
                  <p className="estate-workspace__kicker">Profile</p>
                  <h1 className="estate-workspace__title">My Business Estate</h1>
                </div>
                <button
                  type="button"
                  className="my-business-estate-panel__close"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
              <p className="my-business-estate-panel__lead">
                Your business home inside Spark Estate — where the important
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
                          <div className="my-business-estate-panel__section-card-title-row">
                            <span
                              className="my-business-estate-panel__section-icon"
                              aria-hidden
                            >
                              {SECTION_ICONS[section.id]}
                            </span>
                            <h3 className="my-business-estate-panel__section-card-title">
                              {section.title}
                            </h3>
                          </div>
                          <span
                            className={`my-business-estate-panel__section-status my-business-estate-panel__section-status--${status}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                        <p className="my-business-estate-panel__section-card-desc">
                          {section.description}
                        </p>
                        <p className="my-business-estate-panel__section-card-summary">
                          {summarizeBusinessEstateSection(section.id)}
                        </p>
                        <button
                          type="button"
                          className="my-business-estate-panel__section-open"
                          onClick={() => setActiveSection(section.id)}
                        >
                          <span>
                            {status === "not-started" ? "Open" : "Edit"}
                          </span>
                          <span aria-hidden>›</span>
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
