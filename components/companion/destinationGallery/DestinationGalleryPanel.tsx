"use client";

import Image from "next/image";
import {
  DESTINATION_GALLERY_BG,
  DESTINATION_GALLERY_CRYSTALS,
  DESTINATION_CRYSTAL_STATUS_META,
  type DestinationCrystal,
} from "@/lib/destinationGallery";

type Props = {
  onBack?: () => void;
  onReturnToEstate?: () => void;
  onSelectCrystal?: (crystal: DestinationCrystal) => void;
};

/**
 * Destination Gallery — Architecture 156 outcome crystals.
 * Uses approved registry constants and background; not Asset Library / the-gallery.
 */
export function DestinationGalleryPanel({
  onBack,
  onReturnToEstate,
  onSelectCrystal,
}: Props) {
  return (
    <div
      className="destination-gallery-panel relative flex h-full min-h-0 w-full flex-col"
      data-testid="destination-gallery-panel"
      role="region"
      aria-label="Destination Gallery"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={DESTINATION_GALLERY_BG.split("?")[0] ?? DESTINATION_GALLERY_BG}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[rgba(28,22,16,0.42)]" />
      </div>

      <header className="relative z-10 flex items-start justify-between gap-4 px-5 pb-2 pt-5 md:px-8 md:pt-7">
        <div>
          <h1 className="font-serif text-3xl text-[#f7f0e4] md:text-4xl">
            Destination Gallery
          </h1>
          <p className="mt-1 max-w-xl text-base text-[#e8dcc8] md:text-lg">
            Choose where this work should go. Spark handles the rest.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {onBack ? (
            <button
              type="button"
              className="rounded-full border border-[#e8dcc8]/40 bg-[rgba(28,22,16,0.55)] px-4 py-2 text-sm text-[#f7f0e4]"
              onClick={onBack}
            >
              Back
            </button>
          ) : null}
          {onReturnToEstate ? (
            <button
              type="button"
              className="rounded-full border border-[#e8dcc8]/40 bg-[rgba(28,22,16,0.55)] px-4 py-2 text-sm text-[#f7f0e4]"
              onClick={onReturnToEstate}
            >
              Return to Estate
            </button>
          ) : null}
        </div>
      </header>

      <ul className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 pb-8 pt-4 sm:grid-cols-2 lg:grid-cols-3 md:px-8">
        {DESTINATION_GALLERY_CRYSTALS.map((crystal) => {
          const status = DESTINATION_CRYSTAL_STATUS_META.ready;
          return (
            <li key={crystal.id}>
              <button
                type="button"
                className="destination-gallery-crystal flex h-full w-full flex-col rounded-2xl border border-[#e8dcc8]/35 bg-[rgba(28,22,16,0.62)] px-5 py-5 text-left text-[#f7f0e4] shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm transition hover:border-[#e8dcc8]/70 hover:bg-[rgba(28,22,16,0.75)]"
                data-testid={`destination-crystal-${crystal.id}`}
                onClick={() => onSelectCrystal?.(crystal)}
              >
                <span className="text-xs tracking-wide text-[#d4c4a8]">
                  {status.glyph} {status.label}
                </span>
                <span className="mt-2 font-serif text-2xl">{crystal.name}</span>
                <span className="mt-2 text-sm leading-relaxed text-[#e8dcc8]">
                  {crystal.purpose}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
