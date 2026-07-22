"use client";

import { useEffect, useState } from "react";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import {
  SOCIAL_PROFILE_FIELDS,
  socialProfileOpenHref,
  socialProfileUrlHint,
  type SocialProfilePrefKey,
} from "@/lib/socialProfileUrls";

type Props = {
  /** Optional heading level styling */
  showHeading?: boolean;
};

/**
 * Settings → Connections → Social Media (website + social URLs).
 * Optional fields; soft URL hints; never blocks saving other fields.
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

      <div className="mt-3 flex flex-col gap-4">
        {SOCIAL_PROFILE_FIELDS.map((platform) => {
          const value = urls[platform.prefKey] ?? "";
          const openHref = socialProfileOpenHref(value);
          const hint = socialProfileUrlHint(platform.id, value);
          return (
            <div key={platform.id} data-testid={`social-profile-${platform.id}`}>
              <label
                className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]"
                htmlFor={`presence-${platform.id}`}
              >
                {platform.label}
              </label>
              <input
                id={`presence-${platform.id}`}
                value={value}
                onChange={(e) => updateField(platform.prefKey, e.target.value)}
                placeholder={value.trim() ? undefined : platform.placeholder}
                className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
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
          );
        })}
      </div>
      <p className="mt-4 text-sm text-[#9a8f82]">
        Social posts use copy-and-paste: the app copies your text and opens your
        profile page so you can paste it there.
      </p>
    </section>
  );
}
