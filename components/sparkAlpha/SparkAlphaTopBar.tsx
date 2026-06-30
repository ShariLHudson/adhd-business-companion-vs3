"use client";

type SparkAlphaTopBarProps = {
  visible: boolean;
  displayMins: number;
  displaySecs: number;
  label: string | null;
  running: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function SparkAlphaTopBar({
  visible,
  displayMins,
  displaySecs,
  label,
  running,
  onPause,
  onResume,
  onEnd,
}: SparkAlphaTopBarProps) {
  if (!visible) return null;

  return (
    <div className="spark-alpha-topbar" role="status" aria-live="polite">
      <div className="spark-alpha-topbar__timer">
        <span className="spark-alpha-topbar__time">
          {displayMins}:{pad(displaySecs)}
        </span>
        {label ? (
          <span className="spark-alpha-topbar__label">{label}</span>
        ) : (
          <span className="spark-alpha-topbar__label">Focus</span>
        )}
      </div>
      <div className="spark-alpha-topbar__actions">
        {running ? (
          <button type="button" className="spark-alpha-topbar__btn" onClick={onPause}>
            Pause
          </button>
        ) : (
          <button type="button" className="spark-alpha-topbar__btn" onClick={onResume}>
            Resume
          </button>
        )}
        <button type="button" className="spark-alpha-topbar__btn" onClick={onEnd}>
          End
        </button>
      </div>
    </div>
  );
}
