"use client";

import { useCallback, useEffect, useState } from "react";
import { CompanionPresence } from "./CompanionPresence";
import { MaterialsOverlay } from "./MaterialsOverlay";
import { CONSERVATORY_BG } from "./mockData";
import { QuietArrival } from "./QuietArrival";
import { RoomLife } from "./RoomLife";
import { StillnessMoment } from "./StillnessMoment";
import { WorkSurface } from "./WorkSurface";
import type { UniversalWorkStage } from "./types";

/**
 * Spark Universal Work Experience — Prototype 01
 *
 * Design intent: the room never disappears. Work quietly appears,
 * then quietly fades. No launch. No dashboard. One prepared next step.
 */

export function UniversalWorkPrototypePage() {
  const [stage, setStage] = useState<UniversalWorkStage>("arriving");
  const [companionVisible, setCompanionVisible] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [addedLine, setAddedLine] = useState<string | null>(null);
  const [showStillness, setShowStillness] = useState(false);

  useEffect(() => {
    const emerge = window.setTimeout(() => setStage("present"), 2200);
    return () => window.clearTimeout(emerge);
  }, []);

  useEffect(() => {
    if (stage !== "present") return;
    const whisper = window.setTimeout(() => setCompanionVisible(true), 4500);
    return () => window.clearTimeout(whisper);
  }, [stage]);

  useEffect(() => {
    if (!companionVisible) return;
    const fade = window.setTimeout(() => setCompanionVisible(false), 14000);
    return () => window.clearTimeout(fade);
  }, [companionVisible]);

  const handleCommitReflection = useCallback(() => {
    const trimmed = reflection.trim();
    if (!trimmed) return;
    setAddedLine(trimmed);
    setReflection("");
  }, [reflection]);

  const handleSetDown = useCallback(() => {
    setStage("fading");
    setCompanionVisible(false);
    setMaterialsOpen(false);
    window.setTimeout(() => {
      setStage("stillness");
      setShowStillness(true);
    }, 1100);
  }, []);

  return (
    <div
      className={`uw-root uw-root--${stage}`}
      style={{ backgroundImage: `url(${CONSERVATORY_BG})` }}
    >
      <p className="uw-dev-link">
        Universal Work prototype 01 ·{" "}
        <a href="/companion">Companion</a>
        {" · "}
        <a href="/prototype/relationship">Relationship 4</a>
        {" · "}
        <a href="/prototype/conservatory-workspace">Conservatory V3</a>
        {" · "}
        <a href="/workspace-prototype">Workspace</a>
        {" · "}
        <a href="/prototype/spark-studio">Spark Studio</a>
      </p>

      <RoomLife />

      <QuietArrival stage={stage} />

      <WorkSurface
        stage={stage}
        reflection={reflection}
        addedLine={addedLine}
        onReflectionChange={setReflection}
        onCommitReflection={handleCommitReflection}
        onSetDown={handleSetDown}
      />

      <CompanionPresence
        visible={companionVisible && stage === "present"}
        onDismiss={() => setCompanionVisible(false)}
      />

      {stage === "present" && !materialsOpen && (
        <button
          type="button"
          className="uw-materials-trigger"
          onClick={() => setMaterialsOpen(true)}
          aria-label="Open materials"
        >
          Materials
        </button>
      )}

      <MaterialsOverlay open={materialsOpen} onClose={() => setMaterialsOpen(false)} />

      <StillnessMoment visible={showStillness} />
    </div>
  );
}
