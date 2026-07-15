"use client";

type Props = {
  muted: boolean;
  onToggle: () => void;
};

/** Top-right ambience toggle — quiet until clicked on; click again to silence. */
export function JournalGazeboSoundControl({ muted, onToggle }: Props) {
  return (
    <button
      type="button"
      className={[
        "jg-sound-control",
        muted ? "jg-sound-control--muted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
      aria-label={muted ? "Turn gazebo sound on" : "Turn gazebo sound off"}
      aria-pressed={!muted}
      title={muted ? "Sound off — click to hear the garden" : "Sound on — click to quiet"}
      data-testid="jg-sound-control"
    >
      <span className="jg-sound-control__icon" aria-hidden="true">
        {muted ? "🔇" : "🔊"}
      </span>
    </button>
  );
}
