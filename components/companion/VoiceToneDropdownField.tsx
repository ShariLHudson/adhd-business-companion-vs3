"use client";

import { useEffect, useState } from "react";
import {
  COMPANION_SELECT_CLASS,
  COMPANION_SETUP_LABEL_CLASS,
} from "@/lib/companionFormControls";
import {
  CONTENT_VOICE_TONES,
  getSelectedContentToneId,
  setContentToneId,
  type ContentVoiceToneId,
} from "@/lib/contentAudience";

export function VoiceToneDropdownField({
  id = "content-voice-tone-select",
  className = "min-w-[7rem] flex-1",
  onChange,
}: {
  id?: string;
  className?: string;
  onChange?: (toneId: ContentVoiceToneId) => void;
}) {
  const [toneId, setToneId] = useState(getSelectedContentToneId);

  useEffect(() => {
    const sync = () => setToneId(getSelectedContentToneId());
    window.addEventListener("content-audience-updated", sync);
    return () => window.removeEventListener("content-audience-updated", sync);
  }, []);

  function pick(id: ContentVoiceToneId) {
    setToneId(id);
    setContentToneId(id);
    onChange?.(id);
  }

  return (
    <label className={className}>
      <span className={COMPANION_SETUP_LABEL_CLASS}>Voice / Tone</span>
      <select
        id={id}
        value={toneId}
        onChange={(e) => pick(e.target.value as ContentVoiceToneId)}
        className={`mt-0.5 ${COMPANION_SELECT_CLASS}`}
      >
        {CONTENT_VOICE_TONES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
