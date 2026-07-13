"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateHowToGuide } from "@/components/companion/EstateHowToGuide";
import { EstateHowToOpenControls } from "@/components/companion/EstateHowToOpenControls";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { BusinessEstateSectionEditor } from "@/components/companion/business-estate/BusinessEstateSectionEditor";
import { BusinessAreaCard } from "@/components/companion/business-estate/BusinessAreaCard";
import { ExecutiveBusinessSnapshot } from "@/components/companion/business-estate/ExecutiveBusinessSnapshot";
import { ShariNote } from "@/components/companion/business-estate/ShariNote";
import { BusinessEstateResearchAction } from "@/components/companion/business-estate/BusinessEstateResearchAction";
import { BusinessEstateResearchPanel } from "@/components/companion/business-estate/BusinessEstateResearchPanel";
import { GetExpertHelpAction } from "@/components/companion/advisory/GetExpertHelpAction";
import { GetExpertHelpPanel } from "@/components/companion/advisory/GetExpertHelpPanel";
import {
  BUSINESS_ESTATE_SECTIONS,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_AREA_PRESENTATION,
  getBusinessAreaPresentation,
} from "@/lib/profile/executiveOfficePresentation";
import type { BusinessEstateResearchReturnContext } from "@/lib/profile/businessEstateResearch";
import {
  BUSINESS_ESTATE_HOW_TO_GUIDE,
  consumePendingEstateHowToGuide,
  subscribeEstateHowToGuideOpen,
} from "@/lib/estateRoomGuides";
import { setUnsavedWorkGuard } from "@/lib/unsavedWorkGuard";
import "@/app/companion/my-business-estate.css";
import "@/app/companion/estate-how-to-guide.css";

type Props = {
  onClose: () => void;
};

/**
 * My Business Estate — Executive Office overview.
 * Estate-level Research + Need Another Perspective? (not per-field).
 */
export function MyBusinessEstatePanel({ onClose }: Props) {
  const [activeSection, setActiveSection] =
    useState<BusinessEstateSectionId | null>(null);
  const [openSectionInEdit, setOpenSectionInEdit] = useState(false);
  const [sectionDirty, setSectionDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [researchOpen, setResearchOpen] = useState(false);
  const [expertHelpOpen, setExpertHelpOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [researchReturn, setResearchReturn] =
    useState<BusinessEstateResearchReturnContext>({
      sectionId: null,
    });

  const openHowTo = useCallback(() => {
    setResearchOpen(false);
    setExpertHelpOpen(false);
    setHowToOpen(true);
  }, []);
  const closeHowTo = useCallback(() => setHowToOpen(false), []);

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
    if (consumePendingEstateHowToGuide("my-business-estate")) {
      setHowToOpen(true);
    }
    return subscribeEstateHowToGuideOpen("my-business-estate", openHowTo);
  }, [openHowTo]);

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

  function openResearch() {
    setResearchReturn({
      sectionId: activeSection,
      stageId: null,
    });
    setHowToOpen(false);
    setResearchOpen(true);
  }

  function closeOverlayKeepDrafts() {
    setResearchOpen(false);
    setExpertHelpOpen(false);
    setHowToOpen(false);
  }

  const blockingOverlay = researchOpen || expertHelpOpen;
  const overlayOpen = blockingOverlay || howToOpen;

  const activeMeta = BUSINESS_ESTATE_SECTIONS.find(
    (section) => section.id === activeSection,
  );
  const activeArea = activeSection
    ? getBusinessAreaPresentation(activeSection)
    : null;

  const howToControls = (
    <EstateHowToOpenControls
      content={BUSINESS_ESTATE_HOW_TO_GUIDE}
      onOpen={openHowTo}
      className="business-estate-how-to-controls"
    />
  );

  return (
    <MyBusinessEstateRoomShell backgroundUrl="/backgrounds/founder-office-background.png">
      <EstateWorkspace className="my-business-estate-panel executive-office-panel estate-workspace--landing my-business-estate-panel--how-to-host">
        {researchOpen ? (
          <BusinessEstateResearchPanel
            returnContext={researchReturn}
            onClose={closeOverlayKeepDrafts}
            onReturnToEstate={closeOverlayKeepDrafts}
          />
        ) : null}

        {expertHelpOpen ? (
          <GetExpertHelpPanel
            sourceType="business_estate"
            areaId={activeSection ?? "identity"}
            onClose={closeOverlayKeepDrafts}
            onReturn={closeOverlayKeepDrafts}
          />
        ) : null}

        <EstateHowToGuide
          content={BUSINESS_ESTATE_HOW_TO_GUIDE}
          open={howToOpen}
          onClose={closeHowTo}
          onPrimaryAction={() => {
            closeHowTo();
            setOpenSectionInEdit(false);
            setActiveSection(null);
          }}
        />

        <div
          className={
            overlayOpen ? "business-estate-research-host--dimmed" : undefined
          }
          hidden={blockingOverlay ? true : undefined}
          aria-hidden={overlayOpen || undefined}
          data-testid="my-business-estate-main"
          data-active-section={activeSection ?? "overview"}
          data-section-dirty={sectionDirty ? "true" : "false"}
        >
          {activeSection && activeMeta && activeArea ? (
            <>
              <div className="business-estate-persistent-actions">
                {howToControls}
                <BusinessEstateResearchAction
                  onOpen={openResearch}
                  className="business-estate-research-action--in-area"
                />
                <GetExpertHelpAction
                  onOpen={() => {
                    setHowToOpen(false);
                    setExpertHelpOpen(true);
                  }}
                  className="get-expert-help-action--in-area"
                />
              </div>
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
            </>
          ) : (
            <>
              <header className="executive-office-panel__header">
                <div className="executive-office-panel__header-row">
                  <div>
                    <p className="estate-workspace__kicker">Executive Office</p>
                    <h1 className="estate-workspace__title">
                      My Business Estate
                    </h1>
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

              <div className="business-estate-persistent-actions">
                {howToControls}
                <BusinessEstateResearchAction onOpen={openResearch} />
                <GetExpertHelpAction
                  onOpen={() => {
                    setHowToOpen(false);
                    setExpertHelpOpen(true);
                  }}
                />
              </div>

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
        </div>
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
