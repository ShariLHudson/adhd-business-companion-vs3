"use client";

import type {
  DailyOpeningChoiceCard,
  DailyOpeningChoiceId,
  DailyOpeningDiscoveryInvite,
  HelpMeChooseSuggestion,
} from "@/lib/dailyOpening";
import { TODAYS_WELCOME_CARD_VERSION } from "@/lib/dailyOpening";
import type { PlanOrAdaptChoiceCard } from "@/lib/dailyAdaptation";
import { PLAN_OR_ADAPT_MESSAGE } from "@/lib/dailyAdaptation";

type MainProps = {
  mode: "main";
  welcomeMessage: string;
  teachingSentence?: string | null;
  choiceCards: DailyOpeningChoiceCard[];
  discovery?: DailyOpeningDiscoveryInvite | null;
  onSelect: (choiceId: DailyOpeningChoiceId) => void;
  onDiscoveryPrimary?: () => void;
  onDiscoveryDismiss?: () => void;
};

type HelpProps = {
  mode: "help-me-choose";
  suggestions: HelpMeChooseSuggestion[];
  onSelectSuggestion: (suggestion: HelpMeChooseSuggestion) => void;
  onBackToToday: () => void;
};

type PlanOrAdaptProps = {
  mode: "plan-or-adapt";
  choices: PlanOrAdaptChoiceCard[];
  onSelect: (choiceId: PlanOrAdaptChoiceCard["id"]) => void;
  onBackToToday: () => void;
};

type Props = MainProps | HelpProps | PlanOrAdaptProps;

/**
 * Today's Welcome Card — shared Global Daily Companion Opening.
 * Used by first-of-day, absence return, Settings → New Day, and explicit New Day.
 * Never render as plain chat text or as a fourth discovery choice.
 */
export function TodaysWelcomeCard(props: Props) {
  if (props.mode === "help-me-choose") {
    const suggestions = props.suggestions.slice(0, 3);
    if (suggestions.length === 0) return null;

    return (
      <section
        className="global-daily-opening todays-welcome-card"
        data-testid="todays-welcome-card"
        data-daily-opening-version={TODAYS_WELCOME_CARD_VERSION}
        data-mode="help-me-choose"
        aria-label="Help me choose"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Shari</p>
          <h2 className="global-daily-opening__title">
            Here Are Three Good Options
          </h2>
          <p className="global-daily-opening__message">
            Choose one and I&apos;ll take you there.
          </p>
        </header>

        <ul className="global-daily-opening__cards">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className="global-daily-opening__card"
                onClick={() => props.onSelectSuggestion(suggestion)}
                data-testid={`global-daily-hmc-${suggestion.id}`}
              >
                <span className="global-daily-opening__card-title">
                  {suggestion.title || suggestion.label}
                </span>
                <span className="global-daily-opening__card-explain">
                  {suggestion.benefit}
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

  if (props.mode === "plan-or-adapt") {
    const choices = props.choices.slice(0, 2);
    if (choices.length === 0) return null;

    return (
      <section
        className="global-daily-opening todays-welcome-card"
        data-testid="todays-welcome-card"
        data-daily-opening-version={TODAYS_WELCOME_CARD_VERSION}
        data-mode="plan-or-adapt"
        aria-label="Plan or Adapt My Day"
      >
        <header className="global-daily-opening__header">
          <p className="global-daily-opening__eyebrow">Shari</p>
          <h2 className="global-daily-opening__title">
            Plan or Adapt My Day
          </h2>
          <p className="global-daily-opening__message">
            {PLAN_OR_ADAPT_MESSAGE}
          </p>
        </header>

        <ul className="global-daily-opening__cards global-daily-opening__cards--two">
          {choices.map((choice) => (
            <li key={choice.id} className="global-daily-opening__card-item">
              <button
                type="button"
                className={[
                  "global-daily-opening__card",
                  choice.recommended
                    ? "global-daily-opening__card--recommended"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => props.onSelect(choice.id)}
                data-testid={`plan-or-adapt-${choice.id}`}
                data-recommended={choice.recommended ? "true" : "false"}
              >
                {choice.recommended ? (
                  <span className="global-daily-opening__recommended">
                    Recommended
                  </span>
                ) : null}
                <span className="global-daily-opening__card-title">
                  {choice.title}
                </span>
                <span className="global-daily-opening__card-explain">
                  {choice.explanation}
                </span>
                <span className="global-daily-opening__card-estimate">
                  {choice.buttonLabel}
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
          Back to Today&apos;s Welcome Card
        </button>
      </section>
    );
  }

  const cards = props.choiceCards.slice(0, 3);
  if (cards.length === 0) return null;

  const discovery =
    props.discovery?.show === true ? props.discovery : null;

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
        <p className="global-daily-opening__message">{props.welcomeMessage}</p>
        {props.teachingSentence ? (
          <p
            className="global-daily-opening__teaching"
            data-testid="global-daily-teaching"
          >
            {props.teachingSentence}
          </p>
        ) : null}
      </header>

      <ul className="global-daily-opening__cards">
        {cards.map((card) => (
          <li key={card.id} className="global-daily-opening__card-item">
            <button
              type="button"
              className={[
                "global-daily-opening__card",
                card.recommended ? "global-daily-opening__card--recommended" : "",
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
              <span className="global-daily-opening__card-explain">
                {card.explanation}
              </span>
              {card.estimateLabel ? (
                <span className="global-daily-opening__card-estimate">
                  {card.estimateLabel}
                </span>
              ) : null}
            </button>
          </li>
        ))}
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
