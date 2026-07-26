"use client";

import { initialsFromDisplayName } from "@/lib/userProfileDisplay";

/**
 * ClientAvatarMark — the single visual identity for a Client Avatar, everywhere
 * one is shown (builder preview, gallery, pickers, "Using" indicator).
 *
 * Fallback order: uploaded image → monogram initials from the name → a neutral
 * estate-style silhouette (for unnamed avatars). No emoji is ever rendered as
 * the primary identity. The name is always shown separately as text by callers,
 * so the initials/silhouette fallback is decorative (aria-hidden); an uploaded
 * image carries meaningful, name-based alt text.
 *
 * Estate styling: cream surface, warm-stone ring, teal ink — no cartoon glyphs.
 */
function EstateSilhouette({ px }: { px: number }) {
  // Mirrors the profile GenericProfileIcon pattern (currentColor, 24x24).
  return (
    <svg
      viewBox="0 0 24 24"
      width={px}
      height={px}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 12a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12Zm0 1.75c-3.4 0-7.25 1.7-7.25 4.25V19.5A1.25 1.25 0 0 0 6 20.75h12a1.25 1.25 0 0 0 1.25-1.25v-1.5c0-2.55-3.85-4.25-7.25-4.25Z"
      />
    </svg>
  );
}

export function ClientAvatarMark({
  name,
  image,
  size,
  className = "",
}: {
  name?: string;
  image?: string;
  size: number;
  className?: string;
}) {
  const trimmedName = (name ?? "").trim();

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={trimmedName ? `${trimmedName} avatar image` : "Client avatar image"}
        className={`shrink-0 rounded-full border border-[#d4cdc3] object-cover ${className}`}
        style={{ width: size, height: size }}
        data-testid="client-avatar-mark-image"
      />
    );
  }

  const initials = initialsFromDisplayName(trimmedName);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-[#d4cdc3] bg-[#faf7f2] text-[#1e4f4f] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      data-testid={
        initials ? "client-avatar-mark-initials" : "client-avatar-mark-silhouette"
      }
    >
      {initials ? (
        <span
          className="font-semibold leading-none"
          style={{ fontSize: Math.round(size * 0.4) }}
        >
          {initials}
        </span>
      ) : (
        <EstateSilhouette px={Math.round(size * 0.6)} />
      )}
    </div>
  );
}
