"use client";

import { CompanionPanel } from "./CompanionPanel";
import { ResourcesPanel } from "./ResourcesPanel";
import { WorkCanvas } from "./WorkCanvas";
import type { CompanionMode } from "./types";

type StudioSessionProps = {
  companionMode: CompanionMode;
  audience: string;
  corePromise: string;
  whyMatters: string;
  strengthened: boolean;
  onCompanionGuide: () => void;
  onCompanionOptions: () => void;
  onCompanionWriteFirst: () => void;
  onAudienceChange: (value: string) => void;
  onCorePromiseChange: (value: string) => void;
  onWhyMattersChange: (value: string) => void;
  onStrengthen: () => void;
  onFinishSession: () => void;
};

export function StudioSession({
  companionMode,
  audience,
  corePromise,
  whyMatters,
  strengthened,
  onCompanionGuide,
  onCompanionOptions,
  onCompanionWriteFirst,
  onAudienceChange,
  onCorePromiseChange,
  onWhyMattersChange,
  onStrengthen,
  onFinishSession,
}: StudioSessionProps) {
  const writeFirst = companionMode === "writeFirst";
  const dimSides = writeFirst;

  return (
    <section className="spark-studio-session" aria-label="Spark Studio session">
      <header className="spark-studio-session__topbar">
        <div className="spark-studio-session__breadcrumb">
          <span>Workshop Launch</span>
          <span className="spark-studio-session__sep" aria-hidden>
            /
          </span>
          <span className="spark-studio-session__current">Marketing Offer</span>
        </div>
        <div className="spark-studio-session__meta">
          <span className="spark-studio-session__saved">Saved just now</span>
          <span className="spark-studio-session__env">Tea House</span>
        </div>
        <button
          type="button"
          className="spark-studio-btn spark-studio-btn--finish"
          onClick={onFinishSession}
        >
          Finish Session
        </button>
      </header>

      <div
        className={`spark-studio-session__workspace${writeFirst ? " spark-studio-session__workspace--write-first" : ""}`}
      >
        <CompanionPanel
          mode={companionMode}
          dimmed={dimSides}
          onGuide={onCompanionGuide}
          onOptions={onCompanionOptions}
          onWriteFirst={onCompanionWriteFirst}
        />
        <WorkCanvas
          audience={audience}
          corePromise={corePromise}
          whyMatters={whyMatters}
          strengthened={strengthened}
          expanded={writeFirst}
          onAudienceChange={onAudienceChange}
          onCorePromiseChange={onCorePromiseChange}
          onWhyMattersChange={onWhyMattersChange}
          onStrengthen={onStrengthen}
        />
        <ResourcesPanel dimmed={dimSides} />
      </div>
    </section>
  );
}
