"use client";

import { COMPANION_WHISPER } from "./mockData";

type CompanionPresenceProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function CompanionPresence({ visible, onDismiss }: CompanionPresenceProps) {
  if (!visible) return null;

  return (
    <aside className="uw-companion" role="note" aria-label="Spark">
      <p className="uw-companion__text">{COMPANION_WHISPER}</p>
      <button type="button" className="uw-companion__dismiss" onClick={onDismiss}>
        Noted
      </button>
    </aside>
  );
}
