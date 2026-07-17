"use client";

import type {
  DailyOpeningChoiceCard,
  DailyOpeningChoiceId,
  DailyOpeningDiscoveryInvite,
} from "@/lib/dailyOpening";
import {
  SHOW_ME_SOMETHING_HELPFUL_LABEL,
  TODAYS_WELCOME_CARD_VERSION,
} from "@/lib/dailyOpening";
import type { HelpfulLesson } from "@/lib/dailyOpening/helpfulLessons/types";
import type {
  HelpMeChooseNeedOption,
  HelpMeChooseSupportOption,
} from "@/lib/dailyOpening/helpMeChooseNeeds";
import { HELP_ME_CHOOSE_PROMPT } from "@/lib/dailyOpening/helpMeChooseNeeds";

type MainProps = {
  mode: "main";
  greetingTitle?: string;
  welcomeLine?: string;
  choicesIntro?: string;
  discoveryInviteLine?: string;
  /** Joined fallback when structured fields are omitted. */
  welcomeMessage: string;
  teachingSentence?: string | null;
  choiceCards: DailyOpeningChoiceCard[];
  discovery?: DailyOpeningDiscoveryInvite | null;
  onSelect: (choiceId: DailyOpeningChoiceId) => void;
  onShowSomethingHelpful?: () => void;
  onDiscoveryPrimary?: () => void;
  onDiscoveryDismiss?: () => void;
};

type HelpNeedsProps = {
  mode: "help-me-choose-needs";
  needs: readonly HelpMeChooseNeedOption[];
  onSelectNeed: (needId: HelpMeChooseNeedOption["id"]) => void;
  onBackToToday: () => void;
};

type HelpSupportProps = {
  mode: "help-me-choose-support";
  prompt: string;
  options: HelpMeChooseSupportOption[];
  onSelectSupport: (option: HelpMeChooseSupportOption) => void;
  onBackToToday: () => void;
};

type HelpfulLessonProps = {
  mode: "show-something-helpful";
  lesson: HelpfulLesson;
  onShowMe: () => void;
  onSomethingElse: () => void;
  onMaybeLater: () => void;
};

type Props =
  | MainProps
  | HelpNeedsProps
  | HelpSupportProps
  | HelpfulLessonProps;

/**
 * Today's Welcome Card — shared Global Daily Companion Opening.
 * Used by first-of-day, absence return, Settings → New Day, and explicit New Day.
 * Never render Show Me Something Helpful as a fourth primary card.
 */
export function TodaysWelcomeCard(props: Props) {
  if (props.mode === "help-me-choose-needs") {
    return (
      <section
        className="global-daily-opening todays-welcome-card"
        data-testid="todays-welcome-card"
        data-daily-opening-version={TODAYS_WELCOME_CARD_VERSION}
        data-mode="help-me-choose-needs"
        aria-label="Help me choose"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Shari</p>
          <h2 className="global-daily-opening__title">{HELP_ME_CHOOSE_PROMPT}</h2>
          <p className="global-daily-opening__message">
            Tell me what kind of support you need — not which room to open.
          </p>
        </header>

        <ul className="global-daily-opening__cards">
          {props.needs.map((need, index) => (
            <li key={need.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => props.onSelectNeed(need.id)}
                data-testid={`global-daily-hmc-need-${need.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {index + 1}. {need.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="global-daily-opening__back"
          onClick={props.onBackToToday}
          data-testid="global-daily-back-to-today"
        >
          Back to Today&apos;s Choices
        </button>
      </section>
    );
  }

  if (props.mode === "help-me-choose-support") {
    const options = props.options.slice(0, 4);
    if (options.length === 0) return null;

    return (
      <section
        className="global-daily-opening todays-welcome-card"
        data-testid="todays-welcome-card"
        data-daily-opening-version={TODAYS_WELCOME_CARD_VERSION}
        data-mode="help-me-choose-support"
        aria-label="Help me choose — next step"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Shari</p>
          <h2 className="global-daily-opening__title">{props.prompt}</h2>
          <p className="global-daily-opening__message">
            Choose one, and I&apos;ll take you there.
          </p>
        </header>

        <ul className="global-daily-opening__cards">
          {options.map((option, index) => (
            <li key={option.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => props.onSelectSupport(option)}
                data-testid={`global-daily-hmc-support-${option.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {index + 1}. {option.title}
                </span>
                <span className="global-daily-opening__card-explain">
                  {option.benefit}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="global-daily-opening__back"
          onClick={props.onBackToToday}
          data-testid="global-daily-back-to-today"
        >
          Back to Today&apos;s Choices
        </button>
      </section>
    );
  }

  if (props.mode === "show-something-helpful") {
    const { lesson } = props;
    return (
      <section
        className="global-daily-opening todays-welcome-card"
        data-testid="todays-welcome-card"
        data-daily-opening-version={TODAYS_WELCOME_CARD_VERSION}
        data-mode="show-something-helpful"
        aria-label="Show me something helpful"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Shari</p>
          <h2 className="global-daily-opening__title">
            Here&apos;s something that may be useful
          </h2>
        </header>

        <div
          className="global-daily-opening__lesson"
          data-testid="helpful-lesson-offer"
        >
          <p className="global-daily-opening__lesson-title">{lesson.title}</p>
          <p className="global-daily-opening__lesson-body">
            {lesson.shortExplanation}
          </p>
        </div>

        <div className="global-daily-opening__discovery-actions">
          <button
            type="button"
            className="global-daily-opening__discovery-primary"
            onClick={props.onShowMe}
            data-testid="helpful-lesson-show-me"
          >
            {lesson.actionLabel || "Show Me"}
          </button>
          <button
            type="button"
            className="global-daily-opening__discovery-secondary"
            onClick={props.onSomethingElse}
            data-testid="helpful-lesson-something-else"
          >
            Something Else
          </button>
          <button
            type="button"
            className="global-daily-opening__back"
            onClick={props.onMaybeLater}
            data-testid="helpful-lesson-maybe-later"
          >
            Maybe Later
          </button>
        </div>
      </section>
    );
  }

  const cards = props.choiceCards.slice(0, 3);
  if (cards.length === 0) return null;

  const discovery =
    props.discovery?.show === true ? props.discovery : null;

  const greetingTitle = props.greetingTitle?.trim() || null;
  const welcomeLine = props.welcomeLine?.trim() || null;
  const choicesIntro = props.choicesIntro?.trim() || null;
  const discoveryInviteLine = props.discoveryInviteLine?.trim() || null;
  const useStructuredHeader = Boolean(
    greetingTitle || welcomeLine || choicesIntro || discoveryInviteLine,
  );

  return (
    <section
      className="global-daily-opening todays-welcome-card"
      data-testid="todays-welcome-card"
      data-daily-opening-version={TODAYS_WELCOME_CARD_VERSION}
      data-mode="main"
      aria-label="Today's Welcome Card"
    >
      <header className="global-daily-opening__header">
        <p className="global-daily-opening__eyebrow">Shari</p>
        {useStructuredHeader ? (
          <>
            {greetingTitle ? (
              <h2
                className="global-daily-opening__greeting-title"
                data-testid="global-daily-greeting-title"
              >
                {greetingTitle}
              </h2>
            ) : null}
            {welcomeLine ? (
              <p className="global-daily-opening__welcome-line">{welcomeLine}</p>
            ) : null}
            {choicesIntro ? (
              <p
                className="global-daily-opening__choices-intro"
                data-testid="global-daily-choices-intro"
              >
                {choicesIntro}
              </p>
            ) : null}
            {discoveryInviteLine ? (
              <p
                className="global-daily-opening__discovery-invite"
                data-testid="global-daily-discovery-invite"
              >
                {discoveryInviteLine}
              </p>
            ) : null}
          </>
        ) : (
          <p className="global-daily-opening__message">{props.welcomeMessage}</p>
        )}
      </header>

      {props.onShowSomethingHelpful ? (
        <button
          type="button"
          className="global-daily-opening__secondary-action"
          onClick={props.onShowSomethingHelpful}
          data-testid="show-me-something-helpful"
        >
          {SHOW_ME_SOMETHING_HELPFUL_LABEL}
        </button>
      ) : null}

      <ul className="global-daily-opening__cards">
        {cards.map((card) => {
          const supportLines =
            card.supportLines?.map((line) => line.trim()).filter(Boolean) ??
            [];
          const explainLines =
            supportLines.length > 0 ? supportLines : [card.explanation];
          return (
            <li key={card.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className={[
                  "global-daily-opening__card",
                  card.recommended
                    ? "global-daily-opening__card--recommended"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => props.onSelect(card.id)}
                data-testid={`global-daily-choice-${card.id}`}
                data-recommended={card.recommended ? "true" : "false"}
                aria-label={`${card.title}. ${card.explanation}${
                  card.estimateLabel ? ` ${card.estimateLabel}.` : ""
                }`}
              >
                {card.recommended ? (
                  <span className="global-daily-opening__recommended">
                    Recommended Today
                  </span>
                ) : null}
                <span className="global-daily-opening__card-title">
                  {card.title}
                </span>
                {explainLines.map((line, index) => (
                  <span
                    key={`${card.id}-line-${index}`}
                    className="global-daily-opening__card-explain"
                  >
                    {line}
                  </span>
                ))}
                {card.estimateLabel ? (
                  <span className="global-daily-opening__card-estimate">
                    {card.estimateLabel}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {discovery ? (
        <aside
          className="global-daily-opening__discovery"
          data-testid="global-daily-discovery"
          aria-label={discovery.title}
        >
          <p className="global-daily-opening__discovery-title">
            {discovery.title}
          </p>
          <p className="global-daily-opening__discovery-line">{discovery.line}</p>
          <div className="global-daily-opening__discovery-actions">
            <button
              type="button"
              className="global-daily-opening__discovery-primary"
              onClick={props.onDiscoveryPrimary}
              data-testid="global-daily-discovery-learn"
            >
              {discovery.primaryLabel}
            </button>
            <button
              type="button"
              className="global-daily-opening__discovery-secondary"
              onClick={props.onDiscoveryDismiss}
              data-testid="global-daily-discovery-later"
            >
              {discovery.secondaryLabel}
            </button>
          </div>
        </aside>
      ) : null}
    </section>
  );
}

/** Shared name used across the platform — same component as TodaysWelcomeCard. */
export const GlobalDailyCompanionOpening = TodaysWelcomeCard;

/** @deprecated Prefer TodaysWelcomeCard / GlobalDailyCompanionOpening */
export const GlobalDailyOpeningChoices = TodaysWelcomeCard;
