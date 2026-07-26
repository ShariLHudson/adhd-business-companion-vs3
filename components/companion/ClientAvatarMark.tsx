"use client";

import type { ClientAvatarVisualReferenceId } from "@/lib/clientAvatarVisualReferences";
import { ClientAvatarVisualGlyph } from "@/components/companion/clientAvatarVisualReferences";

/**
 * ClientAvatarMark — the single visual identity for a Client Avatar, everywhere
 * one is shown (builder preview, gallery, pickers, "Using" indicator).
 *
 * A Client Avatar represents a TYPE of client, not one person, so the mark is an
 * archetype/dossier cue — never a portrait, emoji, or (by default) initials.
 *
 * Priority: uploaded reference image → chosen estate-style archetype emblem →
 * neutral estate dossier emblem. The name is shown separately as text by
 * callers, so the emblem is decorative (aria-hidden); an uploaded image carries
 * meaningful, name-based alt text.
 */
export function ClientAvatarMark({
  name,
  image,
  visualReferenceId,
  size,
  className = "",
}: {
  name?: string;
  image?: string;
  visualReferenceId?: ClientAvatarVisualReferenceId;
  size: number;
  className?: string;
}) {
  const trimmedName = (name ?? "").trim();

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={
          trimmedName
            ? `${trimmedName} visual reference`
            : "Client avatar visual reference"
        }
        className={`shrink-0 rounded-full border border-[#d4cdc3] object-cover ${className}`}
        style={{ width: size, height: size }}
        data-testid="client-avatar-mark-image"
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-[#d4cdc3] bg-[#faf7f2] text-[#1e4f4f] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      data-testid={
        visualReferenceId
          ? "client-avatar-mark-emblem"
          : "client-avatar-mark-default"
      }
    >
      <ClientAvatarVisualGlyph
        referenceId={visualReferenceId}
        px={Math.round(size * 0.66)}
      />
    </div>
  );
}
