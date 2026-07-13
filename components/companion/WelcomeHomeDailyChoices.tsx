"use client";

import type {
  WelcomeHomeDailyChoice,
  WelcomeHomeDiscoveryInvitation,
} from "@/lib/welcomeHome/resolveWelcomeHomeDailyChoices";

type Props = {
  choices: WelcomeHomeDailyChoice[];
  discoveryInvitation?: WelcomeHomeDiscoveryInvitation | null;
  onSelect: (choiceId: WelcomeHomeDailyChoice["id"]) => void;
  onDiscoveryInvite?: () => void;
};

/**
 * ARCH-018 — small companion decision area for Welcome Home (max 3 choices).
 * Not a dashboard or feature menu.
 */
export function WelcomeHomeDailyChoices({
  choices,
  discoveryInvitation,
  onSelect,
  onDiscoveryInvite,
}: Props) {
  if (choices.length === 0) return null;

  return (
    <div
      className="welcome-home-daily-choices"
      data-testid="welcome-home-daily-choices"
    >
      <p className="welcome-home-daily-choices__prompt">
        What would help most today?
      </p>
      <ul className="welcome-home-daily-choices__list">
        {choices.slice(0, 3).map((choice) => (
          <li key={choice.id}>
            <button
              type="button"
              className="welcome-home-daily-choices__btn"
              onClick={() => onSelect(choice.id)}
              data-testid={`welcome-home-choice-${choice.id}`}
            >
              {choice.label}
            </button>
          </li>
        ))}
      </ul>
      {discoveryInvitation?.show ? (
        <button
          type="button"
          className="welcome-home-daily-choices__discovery"
          onClick={onDiscoveryInvite}
          data-testid="welcome-home-discovery-invite"
        >
          {discoveryInvitation.line}
        </button>
      ) : null}
    </div>
  );
}
