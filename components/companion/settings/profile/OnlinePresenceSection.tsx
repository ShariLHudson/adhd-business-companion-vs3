"use client";

import { useEffect, useState } from "react";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import { SettingsDropdown, SETTINGS_TEXT } from "@/components/companion/settings";
import {
  SOCIAL_PROFILE_FIELDS,
  socialProfileOpenHref,
  socialProfileUrlHint,
  type SocialProfilePlatformId,
  type SocialProfilePrefKey,
} from "@/lib/socialProfileUrls";

type Props = {
  /** Optional heading level styling */
  showHeading?: boolean;
};

/**
 * Settings → Connections → Social Media (website + social URLs).
 * Presented as a single dropdown — pick a platform to see and edit its
 * link. Only one platform's link is open at a time; choosing another
 * platform replaces it. Optional fields; soft URL hints; never blocks
 * saving other fields.
 */
export function OnlinePresenceSection({ showHeading = true }: Props) {
  const [urls, setUrls] = useState<Record<SocialProfilePrefKey, string>>({
    websiteUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    tiktokUrl: "",
    pinterestUrl: "",
  });
  const [selectedId, setSelectedId] = useState<SocialProfilePlatformId>(
    SOCIAL_PROFILE_FIELDS[0].id,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const p = getPrefs();
    setUrls({
      websiteUrl: p.websiteUrl ?? "",
      facebookUrl: p.facebookUrl ?? "",
      instagramUrl: p.instagramUrl ?? "",
      linkedinUrl: p.linkedinUrl ?? "",
      tiktokUrl: p.tiktokUrl ?? "",
      pinterestUrl: p.pinterestUrl ?? "",
    });
  }, []);

  function updateField(prefKey: SocialProfilePrefKey, next: string) {
    setUrls((prev) => ({ ...prev, [prefKey]: next }));
    savePrefs({ [prefKey]: next });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  }

  const platform =
    SOCIAL_PROFILE_FIELDS.find((f) => f.id === selectedId) ??
    SOCIAL_PROFILE_FIELDS[0];
  const value = urls[platform.prefKey] ?? "";
  const openHref = socialProfileOpenHref(value);
  const hint = socialProfileUrlHint(platform.id, value);

  const dropdownOptions = SOCIAL_PROFILE_FIELDS.map((field) => ({
    value: field.id,
    label: (urls[field.prefKey] ?? "").trim()
      ? `${field.label} — added`
      : field.label,
  }));

  return (
    <section data-testid="online-presence-section">
      {showHeading ? (
        <>
          <p className="text-lg font-semibold text-[#1f1c19]">Online Presence</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Optional links for your website and social profiles. Leave any blank
            — nothing here is required.
          </p>
        </>
      ) : null}

      {savedFlash ? (
        <p
          className="mt-2 text-sm font-semibold text-[#1e4f4f]"
          role="status"
          aria-live="polite"
          data-testid="online-presence-saved"
        >
          Social links saved.
        </p>
      ) : null}

      <div className="mt-3">
        <SettingsDropdown
          id="online-presence-platform"
          label="Choose a link to view or edit"
          value={selectedId}
          options={dropdownOptions}
          onChange={(next) => setSelectedId(next as SocialProfilePlatformId)}
          testId="social-profile-select"
        />
      </div>

      <div
        className="mt-3 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3.5"
        data-testid={`social-profile-${platform.id}`}
      >
        <label
          className={`text-sm font-semibold uppercase tracking-wide ${SETTINGS_TEXT.helper}`}
          htmlFor={`presence-${platform.id}`}
        >
          {platform.label}
        </label>
        <input
          id={`presence-${platform.id}`}
          value={value}
          onChange={(e) => updateField(platform.prefKey, e.target.value)}
          placeholder={value.trim() ? undefined : platform.placeholder}
          className="mt-1.5 w-full min-h-11 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
          data-testid={`social-profile-input-${platform.id}`}
          autoComplete="url"
          inputMode="url"
        />
        {hint ? (
          <p
            className="mt-1 text-xs text-[#6b635a]"
            data-testid={`social-profile-hint-${platform.id}`}
          >
            {hint}
          </p>
        ) : null}
        {value.trim() ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {openHref ? (
              <a
                href={openHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
                data-testid={`social-profile-open-${platform.id}`}
              >
                {platform.openLabel}
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => updateField(platform.prefKey, "")}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
              data-testid={`social-profile-clear-${platform.id}`}
            >
              Remove
            </button>
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-[#9a8f82]">
        Social posts use copy-and-paste: the app copies your text and opens your
        profile page so you can paste it there.
      </p>
    </section>
  );
}
