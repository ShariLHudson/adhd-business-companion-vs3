"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import {
  GALLERY_BACKGROUND_SRC,
  GALLERY_BOTTOM_PLAQUES,
  GALLERY_DESTINATION_ACTIONS,
  GALLERY_DEMO_DISCLAIMER,
  GALLERY_DEMO_SCENE_HINT,
  GALLERY_DEMO_SCENE_ORDER,
  GALLERY_ENTER_FADE_MS,
  GALLERY_FOYER_AUTO_ENTER_MS,
  GALLERY_FOYER_ENTER_LABEL,
  GALLERY_FOYER_FADE_MS,
  GALLERY_INSCRIPTION,
  curateGalleryExhibition,
  defaultGalleryDemoSceneId,
  galleryEnvironmentClass,
  isGalleryDemoGuideDismissed,
  readGalleryDemoQuery,
  resolveGalleryEnvironment,
  resolveGalleryDemoScene,
  useGalleryWalk,
  type GalleryDemoSceneId,
  type GalleryDestinationId,
} from "@/lib/gallery";
import {
  GALLERY_AMBIENCE_LABELS,
  GALLERY_AMBIENCE_SRC,
  GALLERY_AMBIENCE_VOLUME,
} from "@/lib/gallery/galleryAudio";
import { startAmbientHospitalityAudio } from "@/lib/companionHospitalityPrototype/ambientAudio";
import { GalleryWallFrames } from "@/components/companion/GalleryWallFrames";
import { GalleryDemoGuide } from "@/components/companion/GalleryDemoGuide";
import { GrowthUniversalCapture } from "@/components/companion/GrowthUniversalCapture";
import { AssetLibraryPanel } from "@/components/companion/AssetLibraryPanel";

type Props = {
  onBackToChat: () => void;
  onOpenSection: (section: AppSection, nav: SidebarNavId) => void;
};

type GalleryPhase = "capture" | "library" | "foyer" | "hallway";

/**
 * Asset Library hub — universal capture + browse; legacy hallway walk retained for V1.
 */
export function GalleryExperiencePanel({ onBackToChat, onOpenSection }: Props) {
  const environment = useMemo(() => resolveGalleryEnvironment(), []);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setDemoMode(readGalleryDemoQuery(window.location.search));
  }, []);
  const [demoSceneId, setDemoSceneId] = useState<GalleryDemoSceneId>(
    defaultGalleryDemoSceneId(),
  );
  const demoScene = useMemo(
    () => resolveGalleryDemoScene(demoSceneId),
    [demoSceneId],
  );
  const wallExhibits = useMemo(
    () =>
      curateGalleryExhibition({
        demoMode,
        demoSceneId,
      }),
    [demoMode, demoSceneId],
  );
  const [entered, setEntered] = useState(false);
  const [phase, setPhase] = useState<GalleryPhase>("capture");
  const [foyerLeaving, setFoyerLeaving] = useState(false);
  const [walkPaused, setWalkPaused] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [natureOn, setNatureOn] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [demoGuideOpen, setDemoGuideOpen] = useState(false);
  const [exhibitsFading, setExhibitsFading] = useState(false);
  const noticeTimerRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const hallwayRef = useRef<HTMLImageElement>(null);
  const { nudgeForward, resetWalk } = useGalleryWalk(
    walkPaused || phase !== "hallway",
    viewportRef,
    plateRef,
    hallwayRef,
  );

  const showNotice = useCallback((message: string, durationMs = 4200) => {
    setNotice(message);
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, durationMs);
  }, []);

  const enterHallway = useCallback(() => {
    setFoyerLeaving(true);
    window.setTimeout(() => {
      setPhase("hallway");
      setWalkPaused(false);
      setFoyerLeaving(false);
      if (demoMode) {
        setDemoGuideOpen(!isGalleryDemoGuideDismissed());
      }
    }, GALLERY_FOYER_FADE_MS);
  }, [demoMode]);

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "foyer" || !entered) return;
    const t = window.setTimeout(() => enterHallway(), GALLERY_FOYER_AUTO_ENTER_MS);
    return () => window.clearTimeout(t);
  }, [entered, enterHallway, phase]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!natureOn) return;
    const handle = startAmbientHospitalityAudio(["birds", "wind-chimes"], true);
    return () => handle.stop();
  }, [natureOn]);

  useEffect(() => {
    if (!musicOn) return;
    const audio = new Audio(GALLERY_AMBIENCE_SRC);
    audio.loop = true;
    audio.volume = GALLERY_AMBIENCE_VOLUME;
    void audio.play().catch(() => {
      showNotice(GALLERY_AMBIENCE_LABELS.unavailable);
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicOn, showNotice]);

  const selectDemoScene = useCallback(
    (sceneId: GalleryDemoSceneId) => {
      if (sceneId === demoSceneId) return;
      setExhibitsFading(true);
      window.setTimeout(() => {
        setDemoSceneId(sceneId);
        resetWalk();
        setExhibitsFading(false);
        const scene = resolveGalleryDemoScene(sceneId);
        if (scene.companionWhisper) {
          showNotice(scene.companionWhisper, 5200);
        }
      }, 280);
    },
    [demoSceneId, resetWalk, showNotice],
  );

  useEffect(() => {
    if (!demoMode || phase !== "hallway") return;
    if (!demoScene.companionWhisper) return;
    const t = window.setTimeout(
      () => showNotice(demoScene.companionWhisper!, 5200),
      2400,
    );
    return () => window.clearTimeout(t);
  }, [demoMode, demoScene.companionWhisper, phase, showNotice]);

  const handleDestination = useCallback(
    (id: GalleryDestinationId) => {
      const action = GALLERY_DESTINATION_ACTIONS[id];
      if (action.kind === "resume-walk") {
        if (phase === "foyer") {
          enterHallway();
          return;
        }
        if (walkPaused) {
          setWalkPaused(false);
          return;
        }
        nudgeForward();
        return;
      }
      if (action.kind === "placeholder") {
        showNotice(action.message);
        return;
      }
      onOpenSection(action.section, action.nav);
    },
    [enterHallway, nudgeForward, onOpenSection, phase, showNotice, walkPaused],
  );

  const inFoyer = phase === "foyer";
  const inCapture = phase === "capture";
  const inLibrary = phase === "library";

  const enterFoyer = useCallback(() => {
    setPhase("foyer");
  }, []);

  return (
    <div
      className={`gallery ${galleryEnvironmentClass(environment)} ${entered ? "gallery--entered" : ""} ${inCapture ? "gallery--capture" : inFoyer ? "gallery--foyer" : "gallery--hallway"} ${foyerLeaving ? "gallery--foyer-leaving" : ""} ${demoMode ? "gallery--demo" : ""}`}
      data-testid="gallery-experience-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Asset Library"
      style={
        {
          "--gallery-enter-ms": `${GALLERY_ENTER_FADE_MS}ms`,
          "--gallery-foyer-ms": `${GALLERY_FOYER_FADE_MS}ms`,
        } as React.CSSProperties
      }
    >
      <div className="gallery__camera-viewport" ref={viewportRef}>
        <div ref={rigRef} className="gallery__camera-rig">
          <div ref={plateRef} className="gallery__hallway-plate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={hallwayRef}
              src={GALLERY_BACKGROUND_SRC}
              alt=""
              className="gallery__hallway"
            />
            <GalleryWallFrames
              memories={wallExhibits}
              fading={exhibitsFading}
            />
            <div className="gallery__aisle-floor" aria-hidden="true" />
            <div className="gallery__light-wash" aria-hidden="true" />
          </div>
        </div>
        <div className="gallery__chrome-veil gallery__chrome-veil--top" aria-hidden="true" />
        <div className="gallery__chrome-veil gallery__chrome-veil--bottom" aria-hidden="true" />
      </div>

      {inLibrary ? (
        <AssetLibraryPanel onBack={() => setPhase("capture")} />
      ) : null}

      {inCapture ? (
        <GrowthUniversalCapture
          embedded
          onBackToChat={onBackToChat}
          onBrowseAssetLibrary={() => setPhase("library")}
          onExploreGallery={enterFoyer}
          onOpenSection={onOpenSection}
        />
      ) : null}

      {inFoyer ? (
        <div className="gallery__foyer">
          <div className="gallery__foyer-vignette" aria-hidden="true" />
          <p className="gallery__inscription gallery__inscription--foyer">
            {GALLERY_INSCRIPTION}
          </p>
          <button
            type="button"
            className="gallery__brass-plaque gallery__brass-plaque--craft-0"
            onClick={enterHallway}
          >
            <span className="gallery__brass-plaque-engrave">
              {GALLERY_FOYER_ENTER_LABEL}
            </span>
          </button>
        </div>
      ) : !inCapture && !inLibrary ? (
        <>
          <p className="gallery__inscription">{GALLERY_INSCRIPTION}</p>

          {demoMode ? (
            <div className="gallery__demo-panel">
              <p className="gallery__demo-kicker">{GALLERY_DEMO_DISCLAIMER}</p>
              <p className="gallery__demo-mood">{demoScene.mood}</p>
              <p className="gallery__demo-hint">{GALLERY_DEMO_SCENE_HINT}</p>
              <div className="gallery__demo-panel-actions">
                <button
                  type="button"
                  className="gallery__demo-help-btn"
                  onClick={() => setDemoGuideOpen(true)}
                >
                  How this works
                </button>
              </div>
              <div
                className="gallery__demo-scene-rail"
                role="tablist"
                aria-label="Gallery demo journey"
              >
                {GALLERY_DEMO_SCENE_ORDER.map((sceneId) => {
                  const scene = resolveGalleryDemoScene(sceneId);
                  const active = sceneId === demoSceneId;
                  return (
                    <button
                      key={sceneId}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`gallery__demo-scene-chip ${active ? "is-active" : ""}`}
                      onClick={() => selectDemoScene(sceneId)}
                    >
                      <span className="gallery__demo-scene-chip-label">
                        {scene.label}
                      </span>
                      <span className="gallery__demo-scene-chip-period">
                        {scene.periodLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <GalleryDemoGuide
            open={demoMode && demoGuideOpen && phase === "hallway"}
            onDismiss={() => setDemoGuideOpen(false)}
          />

          <nav
            className="gallery__plaque-rail"
            aria-label="Gallery destinations"
          >
            {GALLERY_BOTTOM_PLAQUES.map((plaque, index) => (
              <button
                key={plaque.id}
                type="button"
                className={`gallery__brass-plaque gallery__brass-plaque--craft-${index}`}
                style={
                  {
                    "--plaque-rotate": `${plaque.craftRotate}deg`,
                    "--plaque-y": `${plaque.craftYOffset}px`,
                  } as React.CSSProperties
                }
                onClick={() => handleDestination(plaque.id)}
              >
                <span className="gallery__brass-plaque-engrave">
                  {plaque.label}
                </span>
              </button>
            ))}
          </nav>
        </>
      ) : null}

      <header className={`gallery__header ${inCapture || inLibrary ? "gallery__header--hidden" : ""}`}>
        <button
          type="button"
          className="gallery__back"
          onClick={onBackToChat}
          aria-label="Back to chat"
        >
          ←
        </button>
        <div className="gallery__header-spacer" aria-hidden="true" />
        <div className="gallery__ambient-controls" aria-label="Gallery ambience">
          <button
            type="button"
            className={`gallery__ambient-chip ${musicOn ? "is-on" : ""}`}
            onClick={() => setMusicOn((v) => !v)}
            aria-pressed={musicOn}
          >
            {GALLERY_AMBIENCE_LABELS.music}
          </button>
          <button
            type="button"
            className={`gallery__ambient-chip ${natureOn ? "is-on" : ""}`}
            onClick={() => setNatureOn((v) => !v)}
            aria-pressed={natureOn}
          >
            Nature
          </button>
          {!inFoyer ? (
            <button
              type="button"
              className={`gallery__ambient-chip ${walkPaused ? "is-on" : ""}`}
              onClick={() => setWalkPaused((v) => !v)}
              aria-pressed={walkPaused}
            >
              Pause Walk
            </button>
          ) : null}
        </div>
      </header>

      {notice ? (
        <div
          className="gallery__notice gallery__notice--whisper"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}
