"use client";

type Props = {
  onStop: () => void;
  onContinue: () => void;
};

export function BusinessEstateSessionPause({ onStop, onContinue }: Props) {
  return (
    <div className="be-session-pause" data-testid="be-session-pause">
      <h2 className="be-session-pause__title">You Made Useful Progress</h2>
      <p className="be-session-pause__body">
        Your answers are saved. Shari already understands more about your
        business.
      </p>
      <div className="be-session-pause__actions">
        <button
          type="button"
          className="be-btn be-btn--primary"
          onClick={onStop}
          data-testid="be-session-pause-stop"
        >
          Stop for Now
        </button>
        <button
          type="button"
          className="be-btn be-btn--secondary"
          onClick={onContinue}
          data-testid="be-session-pause-continue"
        >
          Continue One More Step
        </button>
      </div>
    </div>
  );
}
