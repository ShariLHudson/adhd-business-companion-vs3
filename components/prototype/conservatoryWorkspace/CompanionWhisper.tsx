"use client";

type CompanionWhisperProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
};

export function CompanionWhisper({
  message,
  visible,
  onDismiss,
}: CompanionWhisperProps) {
  if (!visible) return null;

  return (
    <div className="cw-whisper" role="status">
      <div className="cw-whisper__card">
        <p className="cw-whisper__label">Spark</p>
        <p className="cw-whisper__text">{message}</p>
        <button type="button" className="cw-whisper__dismiss" onClick={onDismiss}>
          Thank you
        </button>
      </div>
    </div>
  );
}
