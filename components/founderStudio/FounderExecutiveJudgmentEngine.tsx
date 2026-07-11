"use client";

import { useCallback, useMemo, useState } from "react";

import { composeExecutiveJudgmentView, composeJudgmentDetail } from "@/lib/executiveJudgmentEngine";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { JudgmentDetailPanel } from "./judgmentEngine/JudgmentDetailPanel";
import { JudgmentEntryZone } from "./judgmentEngine/JudgmentEntryZone";
import { JudgmentPyramidView } from "./judgmentEngine/JudgmentPyramidView";

export function FounderExecutiveJudgmentEngine() {
  const view = useMemo(() => composeExecutiveJudgmentView(), []);
  const [showPyramid, setShowPyramid] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const detailView = useMemo(
    () => (selectedId ? composeJudgmentDetail(selectedId) : null),
    [selectedId],
  );

  const handleBackFromDetail = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleBackToEntry = useCallback(() => {
    setShowPyramid(false);
    setSelectedId(null);
  }, []);

  return (
    <div className="founder-judgment">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Judgment Engine"
        title="The Executive Brain of Founder"
        question="What would I recommend today?"
        purpose="Judgment — not certainty. Everything competes. Founder decides what deserves your attention before speaking."
      />

      {detailView ? (
        <JudgmentDetailPanel view={detailView} onBack={handleBackFromDetail} />
      ) : showPyramid ? (
        <JudgmentPyramidView
          view={view}
          onSelectRecommendation={setSelectedId}
          onBack={handleBackToEntry}
        />
      ) : (
        <JudgmentEntryZone view={view} onOpenPyramid={() => setShowPyramid(true)} />
      )}
    </div>
  );
}
