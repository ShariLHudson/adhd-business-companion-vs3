"use client";

import { useState } from "react";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_BROWSE_GROUPS,
  BUSINESS_ESTATE_LEAD,
  BUSINESS_ESTATE_OPTIONAL_REASSURANCE,
  getEstateRecommendation,
  type EstateGroupId,
  type EstateRecommendation,
} from "@/lib/profile/businessEstateRedesign";
import { BusinessEstateRecommendationCard } from "./BusinessEstateRecommendationCard";
import { BusinessEstateGroupAccordion } from "./BusinessEstateGroupAccordion";

type Props = {
  onClose: () => void;
  onStartBusinessBasics: () => void;
  onEnterRoom: (sectionId: BusinessEstateSectionId) => void;
  onOpenPeopleIHelp?: () => void;
  howToControl?: React.ReactNode;
};

export function BusinessEstateOverview({
  onClose,
  onStartBusinessBasics,
  onEnterRoom,
  onOpenPeopleIHelp,
  howToControl,
}: Props) {
  const [openGroupId, setOpenGroupId] = useState<EstateGroupId | null>(null);
  const recommendation = getEstateRecommendation();

  function handlePrimary(rec: EstateRecommendation) {
    if (rec.target.kind === "business-basics") {
      onStartBusinessBasics();
      return;
    }
    if (rec.target.kind === "people-i-help") {
      onOpenPeopleIHelp?.();
      return;
    }
    if (rec.target.kind === "room") {
      onEnterRoom(rec.target.sectionId);
    }
  }

  function toggleGroup(id: EstateGroupId) {
    setOpenGroupId((prev) => (prev === id ? null : id));
  }

  function chooseSomethingElse() {
    setOpenGroupId("understand");
  }

  return (
    <div className="be-overview" data-testid="be-overview">
      <header className="be-overview__header">
        <div className="be-overview__header-row">
          <div>
            <p
              className="estate-workspace__kicker"
              data-testid="be-overview-breadcrumb"
            >
              My Spark Estate › My Business Estate
            </p>
            <h1 className="be-overview__title">My Business Estate</h1>
            <p className="be-overview__lead">{BUSINESS_ESTATE_LEAD}</p>
          </div>
          <button
            type="button"
            className="be-btn be-btn--ghost"
            onClick={onClose}
            data-testid="be-overview-close"
          >
            Close
          </button>
        </div>
        <p
          className="be-overview__reassurance"
          data-testid="be-optional-reassurance"
        >
          {BUSINESS_ESTATE_OPTIONAL_REASSURANCE}
        </p>
        {howToControl ? (
          <div className="be-overview__howto">{howToControl}</div>
        ) : null}
      </header>

      <BusinessEstateRecommendationCard
        recommendation={recommendation}
        onPrimary={() => handlePrimary(recommendation)}
        onChooseSomethingElse={chooseSomethingElse}
      />

      <BusinessEstateGroupAccordion
        groups={BUSINESS_ESTATE_BROWSE_GROUPS}
        openGroupId={openGroupId}
        onToggleGroup={toggleGroup}
        onEnterRoom={onEnterRoom}
        onOpenPeopleIHelp={onOpenPeopleIHelp}
      />
    </div>
  );
}
