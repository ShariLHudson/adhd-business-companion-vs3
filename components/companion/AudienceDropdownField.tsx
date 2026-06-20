"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COMPANION_INPUT_CLASS,
  COMPANION_SELECT_CLASS,
  COMPANION_SETUP_LABEL_CLASS,
} from "@/lib/companionFormControls";
import {
  getCustomAudienceName,
  getSelectedContentAudienceId,
  listContentAudienceOptions,
  setContentAudienceSelection,
  setCustomAudienceName,
  type ContentAudienceOption,
} from "@/lib/contentAudience";

type AudienceDropdownFieldProps = {
  id?: string;
  className?: string;
  /** When set, audience changes call this instead of only persisting globally. */
  onAudiencePick?: (audienceId: string) => void;
};

export function AudienceDropdownField({
  id = "content-audience-select",
  className = "min-w-[7rem] flex-1",
  onAudiencePick,
}: AudienceDropdownFieldProps) {
  const [audienceId, setAudienceId] = useState(getSelectedContentAudienceId);
  const [customName, setCustomName] = useState(getCustomAudienceName);
  const [options, setOptions] = useState<ContentAudienceOption[]>([]);

  const refreshOptions = useCallback(() => {
    setOptions(listContentAudienceOptions());
  }, []);

  useEffect(() => {
    refreshOptions();
    const onUpdate = () => {
      setAudienceId(getSelectedContentAudienceId());
      setCustomName(getCustomAudienceName());
      refreshOptions();
    };
    window.addEventListener("content-audience-updated", onUpdate);
    window.addEventListener("companion-avatars-updated", onUpdate);
    return () => {
      window.removeEventListener("content-audience-updated", onUpdate);
      window.removeEventListener("companion-avatars-updated", onUpdate);
    };
  }, [refreshOptions]);

  const grouped = useMemo(() => {
    const presets = options.filter((o) => o.kind === "preset");
    const avatars = options.filter((o) => o.kind === "avatar");
    const saved = options.filter((o) => o.kind === "saved");
    return { presets, avatars, saved };
  }, [options]);

  function pick(id: string) {
    setAudienceId(id);
    if (id !== "custom") {
      setContentAudienceSelection(id);
    } else if (customName.trim()) {
      setCustomAudienceName(customName);
    }
    onAudiencePick?.(id);
  }

  function applyCustom(name: string) {
    setCustomName(name);
    setCustomAudienceName(name);
    if (name.trim()) {
      setAudienceId("custom");
      onAudiencePick?.("custom");
    }
  }

  return (
    <>
      <label className={className}>
        <span className={COMPANION_SETUP_LABEL_CLASS}>Audience</span>
        <select
          id={id}
          value={audienceId}
          onChange={(e) => pick(e.target.value)}
          className={`mt-0.5 ${COMPANION_SELECT_CLASS}`}
        >
          {grouped.presets.length > 0 ? (
            <optgroup label="Audiences">
              {grouped.presets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ) : null}
          {grouped.avatars.length > 0 ? (
            <optgroup label="Your Client Avatars">
              {grouped.avatars.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ) : null}
          {grouped.saved.length > 0 ? (
            <optgroup label="Saved">
              {grouped.saved.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ) : null}
          <option value="custom">Custom audience…</option>
        </select>
      </label>
      {audienceId === "custom" ? (
        <input
          type="text"
          value={customName}
          onChange={(e) => applyCustom(e.target.value)}
          placeholder="Who is this for?"
          className={`${COMPANION_INPUT_CLASS} w-full basis-full`}
        />
      ) : null}
    </>
  );
}
