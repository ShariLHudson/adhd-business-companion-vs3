"use client";

type ReturnSceneProps = {
  onReadTomorrow: () => void;
  onClose: () => void;
};

export function ReturnScene({ onReadTomorrow, onClose }: ReturnSceneProps) {
  return (
    <section className="spark-studio-return" aria-label="Tea House return">
      <div className="spark-studio-return__veil" aria-hidden />
      <div className="spark-studio-return__panel">
        <p className="spark-studio-return__lead">
          You made meaningful progress today.
        </p>
        <p className="spark-studio-return__message">
          Before you go, I found one Spark Card that may help tomorrow:
        </p>
        <p className="spark-studio-return__card">
          <strong>Positioning:</strong> A clear promise makes every marketing
          message easier.
        </p>
        <div className="spark-studio-return__actions">
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--primary"
            onClick={onReadTomorrow}
          >
            Read it tomorrow
          </button>
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--ghost"
            onClick={onClose}
          >
            Close prototype
          </button>
        </div>
      </div>
    </section>
  );
}
