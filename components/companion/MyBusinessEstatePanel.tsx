"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { BusinessEstateSectionEditor } from "@/components/companion/business-estate/BusinessEstateSectionEditor";
import { BusinessAreaCard } from "@/components/companion/business-estate/BusinessAreaCard";
import { ExecutiveBusinessSnapshot } from "@/components/companion/business-estate/ExecutiveBusinessSnapshot";
import { ShariNote } from "@/components/companion/business-estate/ShariNote";
import {
  BUSINESS_ESTATE_SECTIONS,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_AREA_PRESENTATION,
  getBusinessAreaPresentation,
} from "@/lib/profile/executiveOfficePresentation";
import { setUnsavedWorkGuard } from "@/lib/unsavedWorkGuard";
import "@/app/companion/my-business-estate.css";

type Props = {
  onClose: () => void;
};

/**
 * My Business Estate — Executive Office overview.
 * Presentation/navigation redesign; section editor + storage unchanged.
 */
export function MyBusinessEstatePanel({ onClose }: Props) {
  const [activeSection, setActiveSection] =
    useState<BusinessEstateSectionId | null>(null);
  const [openSectionInEdit, setOpenSectionInEdit] = useState(false);
  const [sectionDirty, setSectionDirty] = useState(false);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
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

  useEffect(() => {
    if (!sectionDirty) {
      setUnsavedWorkGuard(null);
      return;
    }
    setUnsavedWorkGuard(() =>
      window.confirm(
        "You have unsaved changes. Discard them and leave My Business Estate?",
      ),
    );
    return () => setUnsavedWorkGuard(null);
  }, [sectionDirty]);

  function handleClose() {
    if (sectionDirty) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and close My Business Estate?",
      );
      if (!discard) return;
    }
    onClose();
  }

  function enterArea(sectionId: BusinessEstateSectionId, edit = false) {
    setOpenSectionInEdit(edit);
    setActiveSection(sectionId);
  }

  const activeMeta = BUSINESS_ESTATE_SECTIONS.find(
    (section) => section.id === activeSection,
  );
  const activeArea = activeSection
    ? getBusinessAreaPresentation(activeSection)
    : null;

  return (
    <MyBusinessEstateRoomShell backgroundUrl="/backgrounds/founder-office-background.png">
      <EstateWorkspace className="my-business-estate-panel executive-office-panel estate-workspace--landing">
        {activeSection && activeMeta && activeArea ? (
          <BusinessEstateSectionEditor
            sectionId={activeSection}
            title={activeArea.areaName}
            description={activeMeta.description}
            initialMode={openSectionInEdit ? "edit" : "view"}
            onDirtyChange={setSectionDirty}
            onBack={() => {
              setSectionDirty(false);
              setOpenSectionInEdit(false);
              setActiveSection(null);
              refresh();
            }}
          />
        ) : (
          <>
            <header className="executive-office-panel__header">
              <div className="executive-office-panel__header-row">
                <div>
                  <p className="estate-workspace__kicker">Executive Office</p>
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
              <p className="executive-office-panel__lead">
                Your business headquarters inside Spark Estate.
              </p>
            </header>

            <ExecutiveBusinessSnapshot revision={revision} />

            <ShariNote revision={revision} />

            <section
              className="executive-office-areas"
              aria-label="Business Areas"
            >
              <h2 className="executive-office-areas__title">Business Areas</h2>
              <ul className="executive-office-areas__list" key={revision}>
                {BUSINESS_AREA_PRESENTATION.map((area) => (
                  <li key={area.sectionId}>
                    <BusinessAreaCard area={area} onEnter={enterArea} />
                  </li>
                ))}
              </ul>
              <div className="executive-office-areas__secondary">
                <button
                  type="button"
                  className="executive-office-areas__identity-update"
                  onClick={() => enterArea("identity", true)}
                  data-testid="my-business-estate-edit-profile"
                >
                  Update Identity Office
                </button>
              </div>
            </section>
          </>
        )}
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
