"use client";

import { useEffect, useState } from "react";
import { AudienceDropdownField } from "@/components/companion/AudienceDropdownField";
import { VoiceToneDropdownField } from "@/components/companion/VoiceToneDropdownField";
import { COMPANION_SETUP_ROW_CLASS } from "@/lib/companionFormControls";
import {
  getSelectedContentAudienceId,
  getSelectedContentToneId,
  selectedAudienceLabel,
  type ContentVoiceToneId,
} from "@/lib/contentAudience";

export function AudienceBadge({
  className = "",
}: {
  className?: string;
}) {
  const [label, setLabel] = useState(selectedAudienceLabel);

  useEffect(() => {
    const sync = () => setLabel(selectedAudienceLabel());
    sync();
    window.addEventListener("content-audience-updated", sync);
    return () => window.removeEventListener("content-audience-updated", sync);
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#1e4f4f]/25 bg-[#f0f5f5] px-2.5 py-0.5 text-xs font-semibold text-[#1e4f4f] ${className}`}
    >
      <span className="font-medium text-[#6b635a]">Audience:</span>
      {label}
    </span>
  );
}

export function AudienceSelector({
  compact: _compact = false,
  showTone = true,
  onChange,
}: {
  /** Kept for API compatibility — layout is always compact. */
  compact?: boolean;
  showTone?: boolean;
  onChange?: (audienceId: string, toneId: ContentVoiceToneId) => void;
}) {
  return (
    <div className={COMPANION_SETUP_ROW_CLASS} data-testid="audience-selector">
      <AudienceDropdownField
        onAudiencePick={(audienceId) =>
          onChange?.(audienceId, getSelectedContentToneId())
        }
      />
      {showTone ? (
        <VoiceToneDropdownField
          onChange={(toneId) =>
            onChange?.(getSelectedContentAudienceId(), toneId)
          }
        />
      ) : null}
    </div>
  );
}
