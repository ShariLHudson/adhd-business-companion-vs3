"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrivalMoment } from "./ArrivalMoment";
import { ClosingMoment } from "./ClosingMoment";
import { CompanionWhisper } from "./CompanionWhisper";
import { ConservatoryAmbience } from "./ConservatoryAmbience";
import { DeskNotebook } from "./DeskNotebook";
import { DeskObjects } from "./DeskObjects";
import { FrostedWorkspace } from "./FrostedWorkspace";
import { COMPANION_WHISPER, CONSERVATORY_BACKGROUND } from "./mockData";
import { ResourcesFolio } from "./ResourcesFolio";
import type { ConservatoryStage, DeskObjectId } from "./types";

export function ConservatoryWorkspacePage() {
  const [stage, setStage] = useState<ConservatoryStage>("arrival");
  const [showArrival, setShowArrival] = useState(true);
  const [whisperVisible, setWhisperVisible] = useState(false);
  const [openObject, setOpenObject] = useState<DeskObjectId>(null);
  const [answer, setAnswer] = useState("");
  const [addedParagraph, setAddedParagraph] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [showClosing, setShowClosing] = useState(false);

  const handleDismissArrival = useCallback(() => {
    setShowArrival(false);
    setStage("notebook-ready");
  }, []);

  const handleOpenNotebook = useCallback(() => {
    setStage("workspace-open");
    window.setTimeout(() => setWhisperVisible(true), 1800);
  }, []);

  const handleCloseNotebook = useCallback(() => {
    setStage("closing");
    setWhisperVisible(false);
    setOpenObject(null);
    window.setTimeout(() => {
      setStage("complete");
      setShowClosing(true);
    }, 900);
  }, []);

  const handleAddToDocument = useCallback(() => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    setAddedParagraph(trimmed);
    setAnswer("");
  }, [answer]);

  useEffect(() => {
    if (!whisperVisible) return;
    const timer = window.setTimeout(() => setWhisperVisible(false), 12000);
    return () => window.clearTimeout(timer);
  }, [whisperVisible]);

  return (
    <div
      className={`cw-root cw-root--${stage}${focusMode ? " cw-root--focus" : ""}`}
      style={{ backgroundImage: `url(${CONSERVATORY_BACKGROUND})` }}
    >
      <p className="cw-dev-link">
        Conservatory Workspace V3 ·{" "}
        <a href="/companion">Companion</a>
        {" · "}
        <a href="/prototype/universal-work">Universal Work 01</a>
        {" · "}
        <a href="/workspace-prototype">Workspace prototype</a>
        {" · "}
        <a href="/prototype/spark-studio">Spark Studio</a>
      </p>

      <ConservatoryAmbience active={stage !== "complete" || showClosing} />

      <ArrivalMoment visible={showArrival} onDismiss={handleDismissArrival} />

      <DeskNotebook stage={stage} onOpen={handleOpenNotebook} />

      <DeskObjects
        visible={stage === "workspace-open"}
        openObject={openObject}
        onOpen={setOpenObject}
      />

      <FrostedWorkspace
        stage={stage}
        answer={answer}
        addedParagraph={addedParagraph}
        focusMode={focusMode}
        onAnswerChange={setAnswer}
        onAddToDocument={handleAddToDocument}
        onCloseNotebook={handleCloseNotebook}
        onToggleFocus={() => setFocusMode((value) => !value)}
      />

      <CompanionWhisper
        message={COMPANION_WHISPER}
        visible={whisperVisible && stage === "workspace-open"}
        onDismiss={() => setWhisperVisible(false)}
      />

      <ResourcesFolio openObject={openObject} onClose={() => setOpenObject(null)} />

      <ClosingMoment
        visible={showClosing}
        onStay={() => setShowClosing(false)}
      />
    </div>
  );
}
