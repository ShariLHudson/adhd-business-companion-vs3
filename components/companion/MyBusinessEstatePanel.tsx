"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateHowToGuide } from "@/components/companion/EstateHowToGuide";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { MyBusinessEstateRoomShell } from "@/components/companion/MyBusinessEstateRoomShell";
import { BusinessEstateSectionEditor } from "@/components/companion/business-estate/BusinessEstateSectionEditor";
import { BusinessEstateOverview } from "@/components/companion/business-estate/redesign/BusinessEstateOverview";
import { IdentityOfficeEntrance } from "@/components/companion/business-estate/redesign/IdentityOfficeEntrance";
import { IdentitySectionBrowser } from "@/components/companion/business-estate/redesign/IdentitySectionBrowser";
import { BusinessBasicsFlow } from "@/components/companion/business-estate/redesign/BusinessBasicsFlow";
import { GetExpertHelpPanel } from "@/components/companion/advisory/GetExpertHelpPanel";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import { getBusinessAreaPresentation } from "@/lib/profile/executiveOfficePresentation";
import type { IdentitySectionId } from "@/lib/profile/businessEstateRedesign";
import {
  BUSINESS_ESTATE_HOW_TO_GUIDE,
  consumePendingEstateHowToGuide,
  subscribeEstateHowToGuideOpen,
} from "@/lib/estateRoomGuides";
import { setUnsavedWorkGuard } from "@/lib/unsavedWorkGuard";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/my-business-estate.css";
import "@/app/companion/estate-how-to-guide.css";

type Props = {
  onClose: () => void;
  /** Optional — open People I Help overlay without losing estate data. */
  onOpenPeopleIHelp?: () => void;
};

type View =
  | { kind: "overview" }
  | { kind: "identity-entrance" }
  | { kind: "business-basics" }
  | { kind: "legacy-room"; sectionId: Exclude<BusinessEstateSectionId, "identity"> };

/**
 * My Business Estate — calm optional overview + Identity Office pattern (first slice).
 * Other rooms still use the existing section editor until redesigned.
 */
export function MyBusinessEstatePanel({ onClose, onOpenPeopleIHelp }: Props) {
  const [view, setView] = useState<View>({ kind: "overview" });
  const [sectionDirty, setSectionDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [expertHelpOpen, setExpertHelpOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [sectionBrowserOpen, setSectionBrowserOpen] = useState(false);
  const [expandedSectionId, setExpandedSectionId] =
    useState<IdentitySectionId | null>(null);
  const [showHowHelps, setShowHowHelps] = useState(false);
  const [legacyEdit, setLegacyEdit] = useState(false);

  const openHowTo = useCallback(() => {
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

  const { requestClose } = useDismissibleWindow({
    open: true,
    onClose,
    isDirty: sectionDirty,
    confirmDiscard: () =>
      window.confirm(
        "You have unsaved changes. Discard them and close My Business Estate?",
      ),
  });

  function dismissOutside() {
    if (sectionBrowserOpen) {
      setSectionBrowserOpen(false);
      return;
    }
    if (howToOpen) {
      setHowToOpen(false);
      return;
    }
    if (expertHelpOpen) {
      setExpertHelpOpen(false);
      return;
    }
    requestClose();
  }

  function goOverview() {
    setSectionDirty(false);
    setLegacyEdit(false);
    setSectionBrowserOpen(false);
    setShowHowHelps(false);
    setView({ kind: "overview" });
    refresh();
  }

  function enterIdentity() {
    setView({ kind: "identity-entrance" });
    setShowHowHelps(false);
  }

  function enterRoom(sectionId: BusinessEstateSectionId) {
    if (sectionId === "identity") {
      enterIdentity();
      return;
    }
    setLegacyEdit(false);
    setView({ kind: "legacy-room", sectionId });
  }

  const howToLink = (
    <button
      type="button"
      className="estate-how-to-open-action business-estate-how-to-link"
      onClick={openHowTo}
      data-testid="estate-how-to-open-my-business-estate"
      aria-label={BUSINESS_ESTATE_HOW_TO_GUIDE.openActionLabel}
    >
      {BUSINESS_ESTATE_HOW_TO_GUIDE.openActionLabel}
    </button>
  );

  const backgroundUrl =
    view.kind === "identity-entrance" || view.kind === "business-basics"
      ? getBusinessAreaPresentation("identity").coverImageUrl
      : view.kind === "legacy-room"
        ? getBusinessAreaPresentation(view.sectionId).coverImageUrl
        : "/backgrounds/room-library-estate-background.png";

  const activeSectionAttr =
    view.kind === "overview"
      ? "overview"
      : view.kind === "legacy-room"
        ? view.sectionId
        : "identity";

  void revision;

  return (
    <MyBusinessEstateRoomShell backgroundUrl={backgroundUrl}>
      <EstateWorkspace
        className="my-business-estate-panel executive-office-panel estate-workspace--landing my-business-estate-panel--how-to-host be-redesign-panel"
        onDismissOutside={dismissOutside}
      >
        {expertHelpOpen ? (
          <GetExpertHelpPanel
            sourceType="business_estate"
            areaId="identity"
            onClose={() => setExpertHelpOpen(false)}
            onReturn={() => setExpertHelpOpen(false)}
          />
        ) : null}

        <EstateHowToGuide
          content={BUSINESS_ESTATE_HOW_TO_GUIDE}
          open={howToOpen}
          onClose={closeHowTo}
          onPrimaryAction={() => {
            closeHowTo();
            goOverview();
          }}
        />

        <div
          hidden={expertHelpOpen ? true : undefined}
          aria-hidden={expertHelpOpen || howToOpen || undefined}
          data-testid="my-business-estate-main"
          data-active-section={activeSectionAttr}
          data-section-dirty={sectionDirty ? "true" : "false"}
          data-be-view={view.kind}
        >
          {view.kind === "overview" ? (
            <BusinessEstateOverview
              onClose={requestClose}
              onStartBusinessBasics={() => {
                setView({ kind: "business-basics" });
              }}
              onEnterRoom={enterRoom}
              onOpenPeopleIHelp={onOpenPeopleIHelp}
              howToControl={howToLink}
            />
          ) : null}

          {view.kind === "identity-entrance" ? (
            <>
              <IdentityOfficeEntrance
                onStartBasics={() => setView({ kind: "business-basics" })}
                onChooseSection={() => {
                  setSectionBrowserOpen(true);
                  setExpandedSectionId("business-basics");
                }}
                onHowThisHelps={() => setShowHowHelps((v) => !v)}
                onBack={goOverview}
                showHowThisHelps={showHowHelps}
              />
              <IdentitySectionBrowser
                open={sectionBrowserOpen}
                onClose={() => setSectionBrowserOpen(false)}
                expandedId={expandedSectionId}
                onExpand={setExpandedSectionId}
                onSelectImplemented={() => {
                  setSectionBrowserOpen(false);
                  setView({ kind: "business-basics" });
                }}
              />
            </>
          ) : null}

          {view.kind === "business-basics" ? (
            <BusinessBasicsFlow
              onExitToEntrance={() => setView({ kind: "identity-entrance" })}
              onFinished={() => {
                refresh();
                setView({ kind: "identity-entrance" });
              }}
            />
          ) : null}

          {view.kind === "legacy-room" ? (
            <BusinessEstateSectionEditor
              sectionId={view.sectionId}
              title={getBusinessAreaPresentation(view.sectionId).areaName}
              purpose={getBusinessAreaPresentation(view.sectionId).placeBlurb}
              initialMode={legacyEdit ? "edit" : "view"}
              onDirtyChange={setSectionDirty}
              onOpenExpertHelp={() => setExpertHelpOpen(true)}
              helpControl={howToLink}
              onBack={goOverview}
            />
          ) : null}
        </div>
      </EstateWorkspace>
    </MyBusinessEstateRoomShell>
  );
}
