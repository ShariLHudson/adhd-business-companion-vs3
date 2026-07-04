"use client";

import { JOURNAL_TOOLS } from "@/lib/journalGazebo/hospitality";

type Props = {
  onReturnToGazebo: () => void;
  onSpeak?: () => void;
  speakSupported?: boolean;
  isListening?: boolean;
  onToggleTime: () => void;
  showTime: boolean;
  onPrint: () => void;
  printDisabled?: boolean;
};

/** Leather writing tray — estate objects, not floating UI pills. */
export function JournalGazeboWritingTray({
  onReturnToGazebo,
  onSpeak,
  speakSupported = false,
  isListening = false,
  onToggleTime,
  showTime,
  onPrint,
  printDisabled = false,
}: Props) {
  return (
    <div className="jg-writing-tray" aria-label="Writing desk">
      <div className="jg-writing-tray__surface" aria-hidden="true">
        <span className="jg-writing-tray__leather-grain" />
        <span className="jg-writing-tray__leather-edge" />
      </div>

      <div className="jg-writing-tray__objects">
        {speakSupported && onSpeak ? (
          <button
            type="button"
            className={[
              "jg-writing-tray__object",
              "jg-writing-tray__object--quill",
              isListening ? "jg-writing-tray__object--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onSpeak}
            aria-pressed={isListening}
          >
            <span className="jg-writing-tray__icon" aria-hidden="true">
              🪶
            </span>
            <span className="jg-writing-tray__label">
              {isListening ? JOURNAL_TOOLS.listening : "Speak"}
            </span>
          </button>
        ) : null}

        <button
          type="button"
          className="jg-writing-tray__object jg-writing-tray__object--gazebo"
          onClick={onReturnToGazebo}
        >
          <span className="jg-writing-tray__icon" aria-hidden="true">
            📖
          </span>
          <span className="jg-writing-tray__label">Return to Gazebo</span>
        </button>

        <button
          type="button"
          className="jg-writing-tray__object jg-writing-tray__object--print"
          onClick={onPrint}
          disabled={printDisabled}
        >
          <span className="jg-writing-tray__icon" aria-hidden="true">
            🖨
          </span>
          <span className="jg-writing-tray__label">Print</span>
        </button>

        <button
          type="button"
          className="jg-writing-tray__object jg-writing-tray__object--clock"
          onClick={onToggleTime}
        >
          <span className="jg-writing-tray__icon" aria-hidden="true">
            🕰
          </span>
          <span className="jg-writing-tray__label">
            {showTime ? "Hide Clock" : "Show Clock"}
          </span>
        </button>
      </div>
    </div>
  );
}
