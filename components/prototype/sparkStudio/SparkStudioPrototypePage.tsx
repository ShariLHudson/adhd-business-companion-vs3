"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrivalScene } from "./ArrivalScene";
import { CompletionOverlay } from "./CompletionOverlay";
import { ReturnScene } from "./ReturnScene";
import { StudioSession } from "./StudioSession";
import {
  MOCK_AUDIENCE,
  MOCK_CORE_PROMISE,
  MOCK_STRENGTHENED_PROMISE,
  TEA_HOUSE_BACKGROUND,
} from "./mockData";
import type { CompanionMode, SparkStudioStage } from "./types";

const TRANSITION_MS = 1600;

export function SparkStudioPrototypePage() {
  const [stage, setStage] = useState<SparkStudioStage>("arrival");
  const [transitioning, setTransitioning] = useState(false);
  const [companionMode, setCompanionMode] = useState<CompanionMode>("default");
  const [audience, setAudience] = useState(MOCK_AUDIENCE);
  const [corePromise, setCorePromise] = useState(MOCK_CORE_PROMISE);
  const [whyMatters, setWhyMatters] = useState("");
  const [strengthened, setStrengthened] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [envNote, setEnvNote] = useState<string | null>(null);

  const handleBegin = useCallback(() => {
    setTransitioning(true);
    window.setTimeout(() => {
      setStage("studio");
      setTransitioning(false);
    }, TRANSITION_MS);
  }, []);

  const handleChangeEnvironment = useCallback(() => {
    setEnvNote("Tea House is the only environment in this prototype for now.");
    window.setTimeout(() => setEnvNote(null), 3200);
  }, []);

  const handleStrengthen = useCallback(() => {
    setCorePromise(MOCK_STRENGTHENED_PROMISE);
    setStrengthened(true);
  }, []);

  const handleReturnToTeaHouse = useCallback(() => {
    setShowCompletion(false);
    setStage("return");
  }, []);

  const handleClosePrototype = useCallback(() => {
    window.location.href = "/companion";
  }, []);

  useEffect(() => {
    if (stage !== "arrival" && stage !== "return") return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [stage]);

  const showArrival = stage === "arrival" && !transitioning;
  const showStudio = stage === "studio" || transitioning;

  return (
    <div
      className={`spark-studio-root spark-studio-root--${stage}${transitioning ? " spark-studio-root--transitioning" : ""}`}
      style={{ backgroundImage: `url(${TEA_HOUSE_BACKGROUND})` }}
    >
      <p className="spark-studio-dev-link">
        Spark Studio™ prototype ·{" "}
        <a href="/companion">Back to companion</a>
        {" · "}
        <a href="/prototype/universal-work">Universal Work 01</a>
        {" · "}
        <a href="/workspace-prototype">Spark Workspace prototype</a>
        {" · "}
        <a href="/prototype/conservatory-workspace">Conservatory V3</a>
      </p>

      {envNote && (
        <p className="spark-studio-toast" role="status">
          {envNote}
        </p>
      )}

      {showArrival && (
        <ArrivalScene
          onBegin={handleBegin}
          onChangeEnvironment={handleChangeEnvironment}
        />
      )}

      {showStudio && (
        <div
          className={`spark-studio-stage-wrap${transitioning ? " spark-studio-stage-wrap--entering" : ""}`}
        >
          <StudioSession
            companionMode={companionMode}
            audience={audience}
            corePromise={corePromise}
            whyMatters={whyMatters}
            strengthened={strengthened}
            onCompanionGuide={() => setCompanionMode("guide")}
            onCompanionOptions={() => setCompanionMode("options")}
            onCompanionWriteFirst={() => setCompanionMode("writeFirst")}
            onAudienceChange={setAudience}
            onCorePromiseChange={(value) => {
              setCorePromise(value);
              setStrengthened(false);
            }}
            onWhyMattersChange={setWhyMatters}
            onStrengthen={handleStrengthen}
            onFinishSession={() => setShowCompletion(true)}
          />
        </div>
      )}

      {stage === "return" && (
        <ReturnScene
          onReadTomorrow={handleClosePrototype}
          onClose={handleClosePrototype}
        />
      )}

      {showCompletion && (
        <CompletionOverlay
          onReturn={handleReturnToTeaHouse}
          onKeepWorking={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
}
