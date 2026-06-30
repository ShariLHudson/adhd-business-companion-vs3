"use client";

type ArrivalSceneProps = {
  onBegin: () => void;
  onChangeEnvironment: () => void;
};

export function ArrivalScene({ onBegin, onChangeEnvironment }: ArrivalSceneProps) {
  return (
    <section className="spark-studio-arrival" aria-label="Tea House arrival">
      <div className="spark-studio-arrival__veil" aria-hidden />
      <div className="spark-studio-arrival__panel">
        <p className="spark-studio-arrival__greeting">Good morning, Shari.</p>
        <p className="spark-studio-arrival__message">
          I prepared the Tea House today because this feels like a good place for
          focused, thoughtful work.
        </p>
        <p className="spark-studio-arrival__waiting">
          Your <strong>Workshop Offer</strong> is waiting on the writing table.
        </p>
        <div className="spark-studio-arrival__actions">
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--primary"
            onClick={onBegin}
          >
            Begin
          </button>
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--ghost"
            onClick={onChangeEnvironment}
          >
            Change environment
          </button>
        </div>
      </div>
    </section>
  );
}
