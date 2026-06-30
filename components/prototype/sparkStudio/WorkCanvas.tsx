"use client";

type WorkCanvasProps = {
  audience: string;
  corePromise: string;
  whyMatters: string;
  strengthened: boolean;
  expanded?: boolean;
  onAudienceChange: (value: string) => void;
  onCorePromiseChange: (value: string) => void;
  onWhyMattersChange: (value: string) => void;
  onStrengthen: () => void;
};

export function WorkCanvas({
  audience,
  corePromise,
  whyMatters,
  strengthened,
  expanded,
  onAudienceChange,
  onCorePromiseChange,
  onWhyMattersChange,
  onStrengthen,
}: WorkCanvasProps) {
  return (
    <main
      className={`spark-studio-canvas${expanded ? " spark-studio-canvas--expanded" : ""}`}
      aria-label="Work canvas"
    >
      <header className="spark-studio-canvas__header">
        <div>
          <h2 className="spark-studio-canvas__title">Marketing Offer</h2>
          <p className="spark-studio-canvas__subtitle">
            Shape the promise for your workshop so people immediately understand
            why it matters.
          </p>
        </div>
        {strengthened && (
          <p className="spark-studio-canvas__confirmation" role="status">
            Your promise feels clearer and more specific now.
          </p>
        )}
      </header>

      <div className="spark-studio-canvas__sections">
        <label className="spark-studio-canvas__section">
          <span className="spark-studio-canvas__label">Audience</span>
          <textarea
            className="spark-studio-canvas__textarea"
            value={audience}
            onChange={(event) => onAudienceChange(event.target.value)}
            rows={3}
          />
        </label>

        <label className="spark-studio-canvas__section">
          <span className="spark-studio-canvas__label">Core Promise</span>
          <textarea
            className="spark-studio-canvas__textarea spark-studio-canvas__textarea--hero"
            value={corePromise}
            onChange={(event) => onCorePromiseChange(event.target.value)}
            rows={4}
          />
        </label>

        <label className="spark-studio-canvas__section">
          <span className="spark-studio-canvas__label">Why This Matters</span>
          <textarea
            className="spark-studio-canvas__textarea"
            value={whyMatters}
            onChange={(event) => onWhyMattersChange(event.target.value)}
            placeholder="Why would this feel valuable to the right person?"
            rows={3}
          />
        </label>

        <div className="spark-studio-canvas__prompt">
          <p className="spark-studio-canvas__prompt-text">
            <span className="spark-studio-canvas__prompt-label">Next best step</span>
            Spark suggests clarifying the transformation before writing the
            invitation email.
          </p>
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--primary"
            onClick={onStrengthen}
          >
            Strengthen This Offer
          </button>
        </div>
      </div>
    </main>
  );
}
