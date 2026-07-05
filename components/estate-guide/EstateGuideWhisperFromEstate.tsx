type Props = {
  line: string;
  className?: string;
};

/** Recurring corner element — one short line per spread. */
export function EstateGuideWhisperFromEstate({ line, className }: Props) {
  return (
    <aside
      className={["eg-guide-whisper", className].filter(Boolean).join(" ")}
      aria-label="Whisper from the Estate"
    >
      <p className="eg-guide-whisper__label">Whisper from the Estate</p>
      <p className="eg-guide-whisper__line">&ldquo;{line}&rdquo;</p>
    </aside>
  );
}
