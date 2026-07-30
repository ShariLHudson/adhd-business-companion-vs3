"use client";

import Image from "next/image";
import { useId, useRef, useState, type FormEvent } from "react";
import type { ChamberMemberRecommendation } from "@/lib/chamber/chamberPerspectiveGuide";
import {
  matchChamberIntake,
  type ChamberIntakeMatch,
} from "@/lib/chamber/chamberIntakeMatch";
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
 * Sentence starters revealed by the quiet "Not sure how to describe it?"
 * disclosure. They only POPULATE and FOCUS the same intake field — they are
 * not routes or categories.
 */
const SENTENCE_STARTERS: readonly string[] = [
  "I need help deciding…",
  "I am trying to plan…",
  "Something in my business is not working…",
  "I feel stuck because…",
  "I need another perspective on…",
];

/** Labels for the three distinct recommendation slots. */
const REC_LABELS = [
  "Best fit",
  "Supporting perspective",
  "Different perspective",
] as const;
const REC_TESTIDS = [
  "chamber-recs-best",
  "chamber-recs-another",
  "chamber-recs-different",
] as const;

type EntryStage =
  | { view: "intake"; followUp: string | null }
  | {
      view: "recs";
      primary: ChamberMemberRecommendation;
      additional: ChamberMemberRecommendation[];
    };

/**
 * Focused Chamber entry — a single natural-language intake. Does not mount
 * gallery, profile, or chat.
 */
export function ChamberPerspectiveGuide({
  onTalkWithMember,
  onBrowseAll,
  onAboutMember,
}: Props) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<EntryStage>({
    view: "intake",
    followUp: null,
  });
  const [howWorksOpen, setHowWorksOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const baseId = useId();

  function applyMatch(match: ChamberIntakeMatch) {
    if (match.kind === "follow_up") {
      setStage({ view: "intake", followUp: match.question });
      return;
    }
    setStage({
      view: "recs",
      primary: match.primary,
      additional: match.additional,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    applyMatch(matchChamberIntake(query));
  }

  /** A starter only seeds + focuses the intake — it does not route. */
  function useStarter(starter: string) {
    setQuery((prev) => (prev.trim() ? prev : starter));
    inputRef.current?.focus();
  }

  function resetToIntake() {
    setStage({ view: "intake", followUp: null });
  }

  const recSlots =
    stage.view === "recs"
      ? [stage.primary, ...stage.additional].slice(0, 3)
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
        <h1 className="chamber-entry-card__title">
          What would you like help with today?
        </h1>
        <p className="chamber-entry-card__question">
          Describe what you are trying to decide, plan, improve, or move forward.
        </p>
      </header>

      {stage.view === "intake" ? (
        <>
          <form
            className="chamber-entry-card__intake"
            data-testid="chamber-intake"
            onSubmit={handleSubmit}
          >
            <textarea
              ref={inputRef}
              id={`${baseId}-intake`}
              className="chamber-entry-card__intake-input"
              data-testid="chamber-intake-input"
              aria-label="Describe what you would like help with"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              placeholder="For example: I need another perspective on an important business decision."
              aria-describedby={
                stage.followUp ? `${baseId}-follow-up` : undefined
              }
            />

            {stage.followUp ? (
              <p
                className="chamber-entry-card__follow-up"
                id={`${baseId}-follow-up`}
                data-testid="chamber-intake-follow-up"
                role="status"
              >
                {stage.followUp}
              </p>
            ) : null}

            <button
              type="submit"
              className="chamber-entry-card__intake-submit"
              data-testid="chamber-intake-submit"
              disabled={!query.trim()}
            >
              Find the right Chamber members
            </button>
          </form>

          <details
            className="chamber-entry-card__starters"
            data-testid="chamber-intake-starters"
          >
            <summary className="chamber-entry-card__starters-summary">
              Not sure how to describe it?
            </summary>
            <div className="chamber-entry-card__starters-list">
              {SENTENCE_STARTERS.map((starter, index) => (
                <button
                  key={starter}
                  type="button"
                  className="chamber-entry-card__starter"
                  data-testid={`chamber-intake-starter-${index}`}
                  onClick={() => useStarter(starter)}
                >
                  {starter}
                </button>
              ))}
            </div>
          </details>

          <div className="chamber-entry-card__secondary">
            <button
              type="button"
              className="chamber-entry-card__browse"
              data-testid="chamber-perspective-browse-all"
              onClick={onBrowseAll}
            >
              Browse all Chamber members
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
              id={`${baseId}-how`}
            >
              How the Chamber works
            </summary>
            <div
              className="chamber-entry-card__how-body"
              role="region"
              aria-labelledby={`${baseId}-how`}
            >
              <p>Describe what you are working through.</p>
              <p>
                We suggest the Chamber members best suited to help — a few, never
                all twenty-four.
              </p>
              <p>You can talk with a suggestion or choose anyone yourself.</p>
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
            onClick={resetToIntake}
            data-testid="chamber-perspective-back"
          >
            ← Try another description
          </button>

          <div
            className="chamber-entry-card__recs-list"
            data-testid="chamber-perspective-recs-list"
          >
            {recSlots.map((rec, index) => (
              <div key={rec.member.id}>
                {index === 1 && recSlots.length > 1 ? (
                  <p
                    className="chamber-entry-card__more-cue"
                    data-testid="chamber-recs-more-cue"
                    role="note"
                  >
                    More perspectives below
                  </p>
                ) : null}
                <RecommendationSlot
                  heading={REC_LABELS[index] ?? "Another perspective"}
                  testId={REC_TESTIDS[index] ?? `chamber-recs-${index}`}
                  recommendation={rec}
                  onTalkWithMember={onTalkWithMember}
                  onAboutMember={onAboutMember}
                />
              </div>
            ))}
          </div>

          <div className="chamber-entry-card__recs-footer">
            <button
              type="button"
              className="chamber-entry-card__browse"
              data-testid="chamber-recs-try-another"
              onClick={resetToIntake}
            >
              Try another description
            </button>
            <button
              type="button"
              className="chamber-entry-card__browse"
              data-testid="chamber-recs-choose-myself"
              onClick={onBrowseAll}
            >
              Choose someone myself
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function RecommendationSlot({
  heading,
  testId,
  recommendation,
  onTalkWithMember,
  onAboutMember,
}: {
  heading: string;
  testId: string;
  recommendation: ChamberMemberRecommendation;
  onTalkWithMember: (memberId: ChamberMemberId) => void;
  onAboutMember?: (memberId: ChamberMemberId) => void;
}) {
  const { member, whyFits } = recommendation;
  return (
    <div
      className="chamber-entry-card__recs-group"
      data-testid={testId}
      role="listitem"
    >
      <h2 className="chamber-entry-card__recs-heading">{heading}</h2>
      <article
        className="chamber-entry-card__rec"
        data-testid={`chamber-rec-card-${member.id}`}
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
          <h3 className="chamber-entry-card__rec-name">{member.displayName}</h3>
          <p className="chamber-entry-card__rec-specialty">{member.specialty}</p>
          <p className="chamber-entry-card__rec-why">{whyFits}</p>
          <div className="chamber-entry-card__rec-actions">
            <button
              type="button"
              className="chamber-entry-card__rec-talk"
              data-testid={`chamber-rec-talk-${member.id}`}
              onClick={() => onTalkWithMember(member.id)}
            >
              {chamberMemberTalkLabel(member)}
            </button>
            {onAboutMember ? (
              <button
                type="button"
                className="chamber-entry-card__rec-about"
                data-testid={`chamber-rec-about-${member.id}`}
                onClick={() => onAboutMember(member.id)}
              >
                Learn about this member
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
