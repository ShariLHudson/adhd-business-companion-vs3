"use client";

import Image from "next/image";
import { useId, useState } from "react";
import {
  CHAMBER_PERSPECTIVE_CHOICES,
  recommendChamberMembersForPerspective,
  type ChamberPerspectiveChoiceId,
} from "@/lib/chamber/chamberPerspectiveGuide";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import { chamberMemberTalkLabel } from "@/lib/chamber/chamberMemberCardDisplay";
import "@/app/companion/chamber-entry.css";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  onTalkWithMember: (memberId: ChamberMemberId) => void;
  onBrowseAll: () => void;
  onAboutMember?: (memberId: ChamberMemberId) => void;
};

/**
 * Focused Chamber entry card — one calm panel, compact choices, secondary browse.
 * Does not mount gallery, profile, or chat.
 */
export function ChamberPerspectiveGuide({
  onTalkWithMember,
  onBrowseAll,
  onAboutMember,
}: Props) {
  const [choiceId, setChoiceId] =
    useState<ChamberPerspectiveChoiceId | null>(null);
  const [howWorksOpen, setHowWorksOpen] = useState(false);
  const howWorksId = useId();
  const recommendations = choiceId
    ? recommendChamberMembersForPerspective(choiceId)
    : [];

  return (
    <section
      className="chamber-entry-card"
      aria-label="Chamber perspective guide"
      data-testid="chamber-perspective-guide"
      data-chamber-entry="focused"
    >
      <header className="chamber-entry-card__header">
        <p className="chamber-entry-card__eyebrow">Chamber of Momentum</p>
        <h1 className="chamber-entry-card__title">The Chamber</h1>
        <p className="chamber-entry-card__question">
          What kind of perspective would help right now?
        </p>
      </header>

      {!choiceId ? (
        <>
          <div
            className="chamber-entry-card__choices"
            data-testid="chamber-perspective-choices"
            role="group"
            aria-label="Perspective choices"
          >
            {CHAMBER_PERSPECTIVE_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={[
                  "chamber-entry-card__choice",
                  choice.secondary
                    ? "chamber-entry-card__choice--secondary"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`chamber-perspective-${choice.id}`}
                onClick={() => setChoiceId(choice.id)}
              >
                <span className="chamber-entry-card__choice-label">
                  {choice.label}
                </span>
                <span className="chamber-entry-card__choice-hint">
                  {choice.hint}
                </span>
              </button>
            ))}
          </div>

          <div className="chamber-entry-card__secondary">
            <button
              type="button"
              className="chamber-entry-card__browse"
              data-testid="chamber-perspective-browse-all"
              onClick={onBrowseAll}
            >
              Browse All Members
            </button>
          </div>

          <details
            className="chamber-entry-card__how"
            data-testid="chamber-how-it-works"
            open={howWorksOpen}
            onToggle={(e) =>
              setHowWorksOpen((e.target as HTMLDetailsElement).open)
            }
          >
            <summary
              className="chamber-entry-card__how-summary"
              id={`${howWorksId}-summary`}
            >
              How the Chamber Works
            </summary>
            <div
              className="chamber-entry-card__how-body"
              role="region"
              aria-labelledby={`${howWorksId}-summary`}
            >
              <p>Choose the kind of perspective you need.</p>
              <p>
                Spark Estate suggests relevant Chamber members — never more than
                a few at a time.
              </p>
              <p>
                You may read about a member or begin a conversation when you are
                ready.
              </p>
              <p>Your current work and context stay connected.</p>
            </div>
          </details>
        </>
      ) : (
        <div
          className="chamber-entry-card__recs"
          data-testid="chamber-perspective-recs"
        >
          <button
            type="button"
            className="chamber-entry-card__back"
            onClick={() => setChoiceId(null)}
            data-testid="chamber-perspective-back"
          >
            ← Ask a different question
          </button>
          <p className="chamber-entry-card__recs-lead">
            Here are a few members who fit — pick one, or browse everyone.
          </p>
          <div
            className="chamber-entry-card__recs-grid"
            role="list"
            data-testid="chamber-perspective-recs-list"
          >
            {recommendations.map(({ member, whyFits }) => (
              <article
                key={member.id}
                className="chamber-entry-card__rec"
                data-testid={`chamber-rec-card-${member.id}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="chamber-entry-card__rec-portrait"
                  aria-label={chamberMemberTalkLabel(member)}
                  onClick={() => onTalkWithMember(member.id)}
                >
                  <Image
                    src={member.cardImagePath}
                    alt=""
                    width={96}
                    height={144}
                    className="chamber-entry-card__rec-image"
                  />
                </button>
                <div className="chamber-entry-card__rec-body">
                  <h2 className="chamber-entry-card__rec-name">
                    {member.displayName}
                  </h2>
                  <p className="chamber-entry-card__rec-specialty">
                    {member.specialty}
                  </p>
                  <p className="chamber-entry-card__rec-why">{whyFits}</p>
                  <div className="chamber-entry-card__rec-actions">
                    {onAboutMember ? (
                      <button
                        type="button"
                        className="chamber-entry-card__rec-about"
                        data-testid={`chamber-rec-about-${member.id}`}
                        onClick={() => onAboutMember(member.id)}
                      >
                        About
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="chamber-entry-card__rec-talk"
                      data-testid={`chamber-rec-talk-${member.id}`}
                      onClick={() => onTalkWithMember(member.id)}
                    >
                      Talk
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="chamber-entry-card__browse chamber-entry-card__browse--after-recs"
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
