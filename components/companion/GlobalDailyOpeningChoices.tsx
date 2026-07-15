"use client";

import type {
  DailyOpeningChoice,
  HelpMeChooseSuggestion,
} from "@/lib/dailyOpening";

type MainProps = {
  mode: "main";
  choices: DailyOpeningChoice[];
  onSelect: (choiceId: DailyOpeningChoice["id"]) => void;
};

type HelpProps = {
  mode: "help-me-choose";
  suggestions: HelpMeChooseSuggestion[];
  onSelectSuggestion: (suggestion: HelpMeChooseSuggestion) => void;
};

type Props = MainProps | HelpProps;

/**
 * Global Daily Companion Experience — exactly three actionable choices.
 * Help Me Choose reveals three navigable suggestions (first click navigates).
 */
export function GlobalDailyOpeningChoices(props: Props) {
  if (props.mode === "help-me-choose") {
    const suggestions = props.suggestions.slice(0, 3);
    if (suggestions.length === 0) return null;
    return (
      <div
        className="welcome-home-daily-choices"
        data-testid="global-daily-opening-choices"
        data-mode="help-me-choose"
      >
        <p className="welcome-home-daily-choices__prompt">
          Here are three paths that could help right now:
        </p>
        <ul className="welcome-home-daily-choices__list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="welcome-home-daily-choices__btn"
                onClick={() => props.onSelectSuggestion(suggestion)}
                data-testid={`global-daily-hmc-${suggestion.id}`}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const choices = props.choices.slice(0, 3);
  if (choices.length === 0) return null;

  return (
    <div
      className="welcome-home-daily-choices"
      data-testid="global-daily-opening-choices"
      data-mode="main"
    >
      <p className="welcome-home-daily-choices__prompt">
        What would help most today?
      </p>
      <ul className="welcome-home-daily-choices__list">
        {choices.map((choice) => (
          <li key={choice.id}>
            <button
              type="button"
              className="welcome-home-daily-choices__btn"
              onClick={() => props.onSelect(choice.id)}
              data-testid={`global-daily-choice-${choice.id}`}
            >
              {choice.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
