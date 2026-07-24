"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CHAMBER_PERSPECTIVE_CHOICES,
  recommendChamberMembersForPerspective,
  type ChamberPerspectiveChoiceId,
} from "@/lib/chamber/chamberPerspectiveGuide";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import { chamberMemberTalkLabel } from "@/lib/chamber/chamberMemberCardDisplay";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  onTalkWithMember: (memberId: ChamberMemberId) => void;
  onBrowseAll: () => void;
  onAboutMember?: (memberId: ChamberMemberId) => void;
};

/**
 * Recommendation-first Chamber entry — ask for perspective, then suggest ≤3 members.
 */
export function ChamberPerspectiveGuide({
  onTalkWithMember,
  onBrowseAll,
  onAboutMember,
}: Props) {
  const [choiceId, setChoiceId] =
    useState<ChamberPerspectiveChoiceId | null>(null);
  const recommendations = choiceId
    ? recommendChamberMembersForPerspective(choiceId)
    : [];

  return (
    <section
      className="chamber-member-gallery"
      aria-label="Chamber perspective guide"
      data-testid="chamber-perspective-guide"
    >
      <header className="chamber-member-gallery__header">
        <p className="chamber-member-gallery__kicker">Chamber of Momentum</p>
        <h1 className="chamber-member-gallery__title">The Chamber</h1>
        <p className="chamber-member-gallery__subtitle">
          What kind of perspective would help right now?
        </p>
      </header>

      {!choiceId ? (
        <div
          className="flex flex-col gap-2 px-4 pb-6"
          data-testid="chamber-perspective-choices"
        >
          {CHAMBER_PERSPECTIVE_CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-left text-base font-semibold text-white transition hover:bg-white/20"
              data-testid={`chamber-perspective-${choice.id}`}
              onClick={() => setChoiceId(choice.id)}
            >
              {choice.label}
            </button>
          ))}
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-white/80 underline-offset-2 hover:underline"
            data-testid="chamber-perspective-browse-all"
            onClick={onBrowseAll}
          >
            Browse All Members
          </button>
        </div>
      ) : (
        <div className="px-4 pb-8" data-testid="chamber-perspective-recs">
          <button
            type="button"
            className="mb-4 text-sm font-semibold text-white/85 underline-offset-2 hover:underline"
            onClick={() => setChoiceId(null)}
            data-testid="chamber-perspective-back"
          >
            ← Ask a different question
          </button>
          <p className="mb-4 text-base text-white/90">
            Here are a few members who fit — pick one, or browse everyone.
          </p>
          <div className="chamber-member-gallery__grid" role="list">
            {recommendations.map(({ member, whyFits, canHelpWith }) => (
              <article
                key={member.id}
                className="chamber-member-card"
                data-testid={`chamber-rec-card-${member.id}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="chamber-member-card__portrait-btn"
                  aria-label={chamberMemberTalkLabel(member)}
                  onClick={() => onTalkWithMember(member.id)}
                >
                  <span className="chamber-member-card__frame">
                    <Image
                      src={member.cardImagePath}
                      alt=""
                      className="chamber-member-card__image"
                      width={320}
                      height={480}
                      sizes="(max-width: 34rem) 90vw, (max-width: 52rem) 45vw, 28vw"
                    />
                  </span>
                </button>
                <div className="chamber-member-card__body">
                  <h2 className="chamber-member-card__name">
                    {member.displayName}
                  </h2>
                  <p className="chamber-member-card__specialty">
                    {member.specialty}
                  </p>
                  <p className="chamber-member-card__purpose">{whyFits}</p>
                  <p className="mt-2 text-sm text-white/80">{canHelpWith}</p>
                  <div className="chamber-member-card__actions">
                    {onAboutMember ? (
                      <button
                        type="button"
                        className="chamber-member-card__about"
                        data-testid={`chamber-rec-about-${member.id}`}
                        onClick={() => onAboutMember(member.id)}
                      >
                        About This Member
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="chamber-member-card__talk"
                      data-testid={`chamber-rec-talk-${member.id}`}
                      onClick={() => onTalkWithMember(member.id)}
                    >
                      {chamberMemberTalkLabel(member)}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 text-sm font-semibold text-white/85 underline-offset-2 hover:underline"
            data-testid="chamber-perspective-browse-all"
            onClick={onBrowseAll}
          >
            Browse All Members
          </button>
        </div>
      )}
    </section>
  );
}
