"use client";

import {
  businessAreaActionForStatus,
  businessAreaStatusLabel,
  type BusinessAreaPresentation,
} from "@/lib/profile/executiveOfficePresentation";
import {
  getBusinessEstateSectionStatus,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";

type Props = {
  area: BusinessAreaPresentation;
  onEnter: (sectionId: BusinessEstateSectionId) => void;
};

/** Compact Business Area door — name, purpose, status, Estate action. */
export function BusinessAreaCard({ area, onEnter }: Props) {
  const status = getBusinessEstateSectionStatus(area.sectionId);
  const action = businessAreaActionForStatus(status);

  return (
    <article className="business-area-card">
      <div
        className="business-area-card__cover"
        style={{ backgroundImage: `url(${area.coverImageUrl})` }}
        aria-hidden
      />
      <div className="business-area-card__body">
        <div className="business-area-card__head">
          <h3 className="business-area-card__name">{area.areaName}</h3>
          <span
            className={`business-area-card__status business-area-card__status--${status}`}
          >
            {businessAreaStatusLabel(status)}
          </span>
        </div>
        <p className="business-area-card__blurb">{area.placeBlurb}</p>
        <button
          type="button"
          className="business-area-card__action"
          onClick={() => onEnter(area.sectionId)}
          data-testid={`business-area-action-${area.sectionId}`}
          aria-label={`${action} ${area.areaName}`}
        >
          <span>{action}</span>
          <span aria-hidden>›</span>
        </button>
      </div>
    </article>
  );
}
