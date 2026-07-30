"use client";

import Image from "next/image";
import { useId, useState, type FormEvent } from "react";
import {
  CHAMBER_PERSPECTIVE_CHOICES,
  recommendChamberMembersForPerspective,
  type ChamberMemberRecommendation,
  type ChamberPerspectiveChoiceId,
} from "@/lib/chamber/chamberPerspectiveGuide";
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

/** Example descriptions shown beneath the intake field (optional prompts). */
const INTAKE_EXAMPLES: readonly string[] = [
  "I cannot decide whether to launch now.",
  "My marketing is not working.",
  "I have too many ideas and do not know where to start.",
];

type EntryStage =
  | { view: "intake"; followUp: string | null }
  | {
      view: "recs";
      primary: ChamberMemberRecommendation;
      additional: ChamberMemberRecommendation[];
    };

/**
 * Focused Chamber entry card — natural-language intake first, with the guided
 * quick-start choices kept as optional shortcuts and a secondary browse.
 * Does not mount gallery, profile, or chat.
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
  const howWorksId = useId();

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

  function handleQuickStart(choiceId: ChamberPerspectiveChoiceId) {
    const recs = recommendChamberMembersForPerspective(choiceId);
    const [primary, ...rest] = recs;
    if (!primary) return;
    setStage({ view: "recs", primary, additional: rest.slice(0, 2) });
  }

  function resetToIntake() {
    setStage({ view: "intake", followUp: null });
  }

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
          Tell us what you are working through, and we will help you find the
          right person around the table.
        </p>
      </header>

      {stage.view === "intake" ? (
        <>
          <form
            className="chamber-entry-card__intake"
            data-testid="chamber-intake"
            onSubmit={handleSubmit}
          >
            <label
              className="chamber-entry-card__intake-label"
              htmlFor={`${howWorksId}-intake`}
            >
              Describe your situation in your own words
            </label>
            <textarea
              id={`${howWorksId}-intake`}
              className="chamber-entry-card__intake-input"
              data-testid="chamber-intake-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              placeholder="For example: I need another perspective on an important business decision."
              aria-describedby={
                stage.followUp ? `${howWorksId}-follow-up` : undefined
              }
            />

            {stage.followUp ? (
              <p
                className="chamber-entry-card__follow-up"
                id={`${howWorksId}-follow-up`}
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
              Find the right Chamber member
            </button>
          </form>

          <div
            className="chamber-entry-card__examples"
            data-testid="chamber-intake-examples"
          >
            <p className="chamber-entry-card__examples-label">
              Not sure how to start? Try one of these:
            </p>
            <div className="chamber-entry-card__examples-list">
              {INTAKE_EXAMPLES.map((example, index) => (
                <button
                  key={example}
                  type="button"
                  className="chamber-entry-card__example"
                  data-testid={`chamber-intake-example-${index}`}
                  onClick={() => {
                    setQuery(example);
                    applyMatch(matchChamberIntake(example));
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="chamber-entry-card__quick-start">
            <p className="chamber-entry-card__quick-start-label">
              Or pick a starting point:
            </p>
            <div
              className="chamber-entry-card__choices"
              data-testid="chamber-perspective-choices"
              role="group"
              aria-label="Optional quick-start choices"
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
                  onClick={() => handleQuickStart(choice.id)}
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
              <p>Tell us what you are working through.</p>
              <p>
                We suggest the Chamber member or members best suited to help —
                never more than a few at a time.
              </p>
              <p>You can accept a suggestion or choose anyone yourself.</p>
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
            <RecommendationGroup
              heading="Recommended starting point"
              testId="chamber-recs-primary"
              recommendations={[stage.primary]}
              onTalkWithMember={onTalkWithMember}
              onAboutMember={onAboutMember}
            />

            {stage.additional.length > 0 ? (
              <p
                className="chamber-entry-card__more-cue"
                data-testid="chamber-recs-more-cue"
                role="note"
              >
                More perspectives below
              </p>
            ) : null}

            {stage.additional.length > 0 ? (
              <RecommendationGroup
                heading={
                  stage.additional.length > 1
                    ? "Additional perspectives"
                    : "Additional perspective"
                }
                testId="chamber-recs-additional"
                recommendations={stage.additional}
                onTalkWithMember={onTalkWithMember}
                onAboutMember={onAboutMember}
              />
            ) : null}
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

function RecommendationGroup({
  heading,
  testId,
  recommendations,
  onTalkWithMember,
  onAboutMember,
}: {
  heading: string;
  testId: string;
  recommendations: ChamberMemberRecommendation[];
  onTalkWithMember: (memberId: ChamberMemberId) => void;
  onAboutMember?: (memberId: ChamberMemberId) => void;
}) {
  return (
    <div className="chamber-entry-card__recs-group" data-testid={testId}>
      <h2 className="chamber-entry-card__recs-heading">{heading}</h2>
      <div className="chamber-entry-card__recs-grid" role="list">
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
              <h3 className="chamber-entry-card__rec-name">
                {member.displayName}
              </h3>
              <p className="chamber-entry-card__rec-specialty">
                {member.specialty}
              </p>
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
        ))}
      </div>
    </div>
  );
}
