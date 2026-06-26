"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DEFAULT_DIRECTOR_STATE,
  evaluateSceneValidation,
  exportSceneJson,
  orchestrateCompanionUniverse,
  prepareHomeFromBrief,
  productionSurpriseBrief,
  resolveSceneIntegrity,
  saveDirectorState,
  saveFavoriteBrief,
  saveSceneToLibrary,
  startAmbientHospitalityAudio,
  type DirectorBrief,
  DEFAULT_DIRECTOR_BRIEF,
} from "@/lib/companionUniverse";
import {
  resolveEffectiveHospitalityProfile,
  type HospitalityProfileSource,
} from "@/lib/companionHospitalityProfile";
import { showDirectorStudio } from "@/lib/companionEnvironmentIntelligence";
import type { CompanionHospitalityProfile } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import { getRecognitionStore } from "@/lib/recognition/recognitionStore";
import { ChatInputBar } from "@/components/companion/ChatInputBar";
import { SimpleChat } from "@/components/companion/SimpleChat";
import { HospitalityLivingRoom } from "./HospitalityLivingRoom";
import { CompanionDirectorsStudio } from "./CompanionDirectorsStudio";
import { DirectorsStudioPresentationDrawer } from "./DirectorsStudioPresentationDrawer";
import { useHospitalityRoomChat } from "./useHospitalityRoomChat";

export function HospitalityExperiencePrototype() {
  const searchParams = useSearchParams();
  const studioEnabled = showDirectorStudio(
    searchParams.get("studio"),
    searchParams.get("demo"),
  );
  const presentationParam = searchParams.get("present") === "1";

  const [brief, setBrief] = useState<DirectorBrief>(DEFAULT_DIRECTOR_BRIEF);
  const [controls, setControls] = useState(DEFAULT_DIRECTOR_STATE);
  const [studioOpen, setStudioOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(presentationParam);
  const [presentDrawerOpen, setPresentDrawerOpen] = useState(false);
  const [profileSource, setProfileSource] =
    useState<HospitalityProfileSource>("memory");
  const [demoKey, setDemoKey] = useState("tea-gardener");
  const [manualProfile, setManualProfile] = useState<
    Partial<CompanionHospitalityProfile>
  >({});
  const [memoryRefresh, setMemoryRefresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const audioRef = useRef<ReturnType<typeof startAmbientHospitalityAudio> | null>(
    null,
  );
  const chat = useHospitalityRoomChat();

  const previewControls = useMemo(() => prepareHomeFromBrief(brief), [brief]);
  const previewResolved = useMemo(
    () => resolveSceneIntegrity(previewControls),
    [previewControls],
  );

  useEffect(() => {
    setStudioOpen(studioEnabled);
  }, [studioEnabled]);

  useEffect(() => {
    setPresentationMode(presentationParam);
  }, [presentationParam]);

  useEffect(() => {
    const refresh = () => setMemoryRefresh((value) => value + 1);
    window.addEventListener("companion-hospitality-profile-updated", refresh);
    window.addEventListener("companion-recognition-updated", refresh);
    window.addEventListener("companion-discovery-updated", refresh);
    return () => {
      window.removeEventListener("companion-hospitality-profile-updated", refresh);
      window.removeEventListener("companion-recognition-updated", refresh);
      window.removeEventListener("companion-discovery-updated", refresh);
    };
  }, []);

  const hospitalityResolution = useMemo(() => {
    void memoryRefresh;
    return resolveEffectiveHospitalityProfile({
      source: profileSource,
      demoKey: profileSource === "demo" ? demoKey : undefined,
      manualProfile: profileSource === "manual" ? manualProfile : undefined,
      recognition: getRecognitionStore(),
    });
  }, [profileSource, demoKey, manualProfile, memoryRefresh]);

  const orchestration = useMemo(
    () =>
      orchestrateCompanionUniverse({
        placeId: brief.placeId,
        directorControls: controls,
        hospitalityProfile: hospitalityResolution.profile,
      }),
    [brief.placeId, controls, hospitalityResolution.profile],
  );
  const scene = orchestration.resolvedScene!;

  const previewOrchestration = useMemo(
    () =>
      orchestrateCompanionUniverse({
        placeId: brief.placeId,
        directorControls: previewControls,
        hospitalityProfile: hospitalityResolution.profile,
      }),
    [brief.placeId, previewControls, hospitalityResolution.profile],
  );

  const validation = useMemo(
    () =>
      evaluateSceneValidation({
        resolved: previewResolved,
        constitutionPassed: previewOrchestration.constitutionPassed,
        hospitalityPrinciplePassed: previewOrchestration.hospitalityPrinciplePassed,
        layers: previewOrchestration.layers,
      }),
    [previewResolved, previewOrchestration],
  );

  const profileLabel = useMemo(() => {
    if (profileSource === "demo") {
      return DEFAULT_DIRECTOR_DEMO_LABEL(demoKey);
    }
    if (profileSource === "memory" && hospitalityResolution.summary.hasMemory) {
      return hospitalityResolution.summary.recognized.join(" · ");
    }
    return "Companion Memory";
  }, [profileSource, demoKey, hospitalityResolution.summary]);

  useEffect(() => {
    audioRef.current?.stop();
    audioRef.current = startAmbientHospitalityAudio(
      scene.audio,
      scene.audioEnabled,
    );
    return () => audioRef.current?.stop();
  }, [scene.audio, scene.audioEnabled]);

  const flashToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const prepareHome = useCallback(() => {
    const next = prepareHomeFromBrief(brief);
    setControls(next);
    saveDirectorState(next);
    flashToast("Home prepared — scene resolved.");
  }, [brief, flashToast]);

  const surpriseMe = useCallback(() => {
    const nextBrief = productionSurpriseBrief();
    setBrief(nextBrief);
    const next = prepareHomeFromBrief(nextBrief);
    setControls(next);
    saveDirectorState(next);
    flashToast("Companion Brain chose today's experience.");
  }, [flashToast]);

  const saveScene = useCallback(() => {
    const label = `${labelize(brief.season)} ${labelize(brief.weather)} · ${labelize(brief.lifeEvent)}`;
    saveSceneToLibrary(label, brief);
    flashToast("Scene saved to library.");
  }, [brief, flashToast]);

  const favoriteScene = useCallback(() => {
    saveFavoriteBrief(brief);
    flashToast("Added to favorites.");
  }, [brief, flashToast]);

  const exportScene = useCallback(() => {
    const json = exportSceneJson(brief, previewControls);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(json);
      flashToast("Scene JSON copied to clipboard.");
      return;
    }
    console.info(json);
    flashToast("Scene JSON logged to console.");
  }, [brief, previewControls, flashToast]);

  const showStudioPanel = studioEnabled && studioOpen && !presentationMode;
  const showPresentationDrawer = studioEnabled && presentationMode;

  return (
    <div
      className={`hospitality-experience${
        presentationMode ? " hospitality-experience--presentation" : ""
      }`}
    >
      {studioEnabled && !presentationMode ? (
        <button
          type="button"
          className="hospitality-experience__studio-toggle"
          onClick={() => setStudioOpen((open) => !open)}
        >
          {studioOpen ? "Hide" : "Show"} Director&apos;s Studio
        </button>
      ) : null}

      {toast ? <p className="directors-studio-v2__toast">{toast}</p> : null}

      <div
        className={`hospitality-experience__layout${
          showStudioPanel ? "" : " hospitality-experience__layout--immersive"
        }`}
      >
        <div className="hospitality-experience__stage">
          {chat.messages.length > 0 ? (
            <div className="hospitality-room__thread" aria-live="polite">
              <SimpleChat
                messages={chat.messages}
                stateHint={null}
                showHint={false}
                isLoading={chat.isLoading}
                hideEmptyState
              />
            </div>
          ) : null}

          <HospitalityLivingRoom
            scene={scene}
            preparationLine={orchestration.layers.layer3.contextualLines[0] ?? null}
            presence={orchestration.presence}
          >
            <ChatInputBar
              input={chat.input}
              isLoading={chat.isLoading}
              isListening={chat.isListening}
              speechSupported={chat.speechSupported}
              inputRef={chat.inputRef}
              onInputChange={chat.handleInputChange}
              onKeyDown={chat.handleKeyDown}
              onToggleListening={chat.toggleListening}
              onSend={() => void chat.handleSend()}
            />
          </HospitalityLivingRoom>
        </div>

        {showStudioPanel ? (
          <CompanionDirectorsStudio
            brief={brief}
            onBriefChange={setBrief}
            appliedResolved={scene}
            previewResolved={previewResolved}
            validation={validation}
            layers={orchestration.layers}
            hospitalityPrinciple={orchestration.hospitalityPrinciple}
            profileSource={profileSource}
            onProfileSourceChange={setProfileSource}
            memorySummary={hospitalityResolution.summary}
            demoKey={demoKey}
            onDemoKeyChange={setDemoKey}
            onPrepareHome={prepareHome}
            onSurprise={surpriseMe}
            onSaveScene={saveScene}
            onFavorite={favoriteScene}
            onExport={exportScene}
            presentationMode={presentationMode}
            onPresentationModeChange={setPresentationMode}
            profileLabel={profileLabel}
          />
        ) : null}
      </div>

      {showPresentationDrawer ? (
        <DirectorsStudioPresentationDrawer
          brief={brief}
          onBriefChange={setBrief}
          onPrepareHome={prepareHome}
          onSurprise={surpriseMe}
          drawerOpen={presentDrawerOpen}
          onDrawerOpenChange={setPresentDrawerOpen}
        />
      ) : null}

      {studioEnabled && !presentationMode ? (
        <p className="hospitality-experience__hint">
          Director&apos;s Studio™ demo — add ?present=1 for Presentation Mode
        </p>
      ) : null}
    </div>
  );
}

function labelize(value: string): string {
  if (value === "none") return "Everyday";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DEFAULT_DIRECTOR_DEMO_LABEL(key: string): string {
  const labels: Record<string, string> = {
    "tea-gardener": "Tea + Gardening",
    "coffee-traveler": "Coffee + Dogs",
    "reading-quiet": "Reading + Quiet",
    "creative-color": "Creative + Color",
    traveler: "Traveler",
    minimalist: "Minimalist",
  };
  return labels[key] ?? key;
}
