"use client";

import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";

type PlaceholderPanelProps = {
  title: string;
  objectId?: string;
  /** @deprecated Use objectId — legacy emoji prop ignored in UI */
  emoji?: string;
  description: string;
};

export function PlaceholderPanel({
  title,
  objectId = "other-tools",
  description,
}: PlaceholderPanelProps) {
  return (
    <div className="companion-fade-in flex flex-col items-center justify-center px-8 py-16 text-center">
      <CompanionObjectVisual
        objectId={objectId}
        size="lg"
        variant="mini-scene"
        animate
      />
      <h2 className="mt-4 text-2xl font-semibold text-[#1f1c19]">{title}</h2>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-[#6b635a]">
        {description}
      </p>
    </div>
  );
}
