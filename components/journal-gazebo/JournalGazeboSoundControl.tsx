"use client";

type Props = {
  muted: boolean;
  onToggle: () => void;
};

/** Top-right ambience toggle — fades, never snaps. */
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
      aria-pressed={muted}
    >
      <span className="jg-sound-control__icon" aria-hidden="true">
        {muted ? "🔇" : "🔊"}
      </span>
    </button>
  );
}
