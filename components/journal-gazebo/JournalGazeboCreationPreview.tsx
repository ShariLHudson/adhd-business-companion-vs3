"use client";

import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboHeroJournal } from "./JournalGazeboHeroJournal";
import { JournalGazeboDeskPen } from "./JournalGazeboDeskPen";

type Props = {
  config: JournalGazeboConfig;
  /** Dedication step — cover closed, embossing appearing */
  dedication?: boolean;
  compact?: boolean;
};

/** Live journal on the Writing Desk — updates as the visitor chooses. */
export function JournalGazeboCreationPreview({
  config,
  dedication = false,
  compact = false,
}: Props) {
  const moment = dedication ? "closed" : "closed";

  return (
    <div
      className={[
        "writing-desk-preview",
        compact ? "writing-desk-preview--compact" : "",
        dedication ? "writing-desk-preview--dedication" : "",
        config.coverMaterial === "linen" ? "writing-desk-preview--linen" : "",
        config.embossingStyle
          ? `writing-desk-preview--emboss-${config.embossingStyle}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-shelf={config.shelfTemplateId}
    >
      <div className="writing-desk-preview__surface" aria-hidden="true" />
      <JournalGazeboHeroJournal
        config={{
          ...config,
          embossedTitle: config.embossedTitle || config.name,
          showSparkFlame: dedication ? false : config.showSparkFlame,
        }}
        moment={moment}
      />
      <JournalGazeboDeskPen penVariant={config.penVariant} />
      {dedication ? (
        <p className="writing-desk-preview__emboss-glow" aria-hidden="true">
          {config.embossedTitle || config.name}
        </p>
      ) : null}
    </div>
  );
}
