"use client";

type CompletionOverlayProps = {
  onReturn: () => void;
  onKeepWorking: () => void;
};

export function CompletionOverlay({
  onReturn,
  onKeepWorking,
}: CompletionOverlayProps) {
  return (
    <div className="spark-studio-completion" role="dialog" aria-modal="true">
      <div className="spark-studio-completion__veil" aria-hidden />
      <div className="spark-studio-completion__panel">
        <p className="spark-studio-completion__lead">Great work.</p>
        <p className="spark-studio-completion__message">
          Your Workshop Offer is clearer and more specific now.
        </p>
        <p className="spark-studio-completion__detail">
          I updated your Workshop Launch Business Asset and saved today&apos;s
          session notes.
        </p>
        <div className="spark-studio-completion__actions">
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--primary"
            onClick={onReturn}
          >
            Return to Tea House
          </button>
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--soft"
            onClick={onKeepWorking}
          >
            Keep Working
          </button>
        </div>
      </div>
    </div>
  );
}
