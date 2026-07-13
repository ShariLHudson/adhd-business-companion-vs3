"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChatBackdropPicker } from "@/components/companion/ChatBackdropPicker";
import {
  isEstateAmbienceEnabled,
  setEstateAmbienceEnabled,
} from "@/lib/estate/estateAmbiencePreference";
import { subscribeEstateAudioSettings } from "@/lib/estate/estateAudioSettings";
import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import {
  isEstateBrowserFullscreen,
  toggleEstateBrowserFullscreen,
} from "@/lib/estate/estateBrowserFullscreen";
import {
  ESTATE_CHROME_IDLE_HINT_FULLSCREEN,
  ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
} from "@/lib/estate/justBeHere";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";
import {
  activeEstateAmbienceRoomId,
  kickstartEstateRoomAmbience,
} from "@/lib/estate/estateRoomAmbience";
import { resolveCanonicalPlaceId } from "@/lib/estate/canonicalEstateRegistry";
import { resolveWanderRoomDisplayName } from "@/lib/estate/manifest/estateWanderMode";
import { useIdleChromeReveal } from "@/lib/estate/useIdleChromeReveal";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  PEACEFUL_PLACES_MUSIC_TRACKS,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";

type MenuSection =
  | "experience-controls"
  | "estate-navigation"
  | "my-day-and-work"
  | "my-story-and-progress"
  | "knowledge-and-advisory"
  | "experiences";

const MENU_SECTIONS: readonly { id: MenuSection; label: string }[] = [
  { id: "experience-controls", label: "Experience Controls" },
  { id: "estate-navigation", label: "Estate Navigation" },
  { id: "my-day-and-work", label: "My Day & Work" },
  { id: "my-story-and-progress", label: "My Story & Progress" },
  { id: "knowledge-and-advisory", label: "Knowledge & Advisory" },
  { id: "experiences", label: "Experiences" },
] as const;

export type EstateRoomExperienceMenuProps = {
  roomId: string;
  visible?: boolean;
  /** When true, shift left so the estate menu trigger stays at the corner. */
  withEstateMenu?: boolean;
  /** When true, render inline inside EstateTopRightChrome (no separate portal). */
  embedded?: boolean;
  chatVisible: boolean;
  onToggleChat: () => void;
  onToggleSound?: () => void;
  soundEnabled?: boolean;
  onBackToEstate: () => void;
  /** Estate Navigation — Explore Estate visual directory. */
  onExploreSpark?: () => void;
  /** Shown after visiting a place from Explore Estate. */
  onReturnToExploreEstate?: () => void;
  /** My Day & Work */
  onOpenPlanMyDay?: () => void;
  onOpenRhythms?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
  onOpenProjects?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenParkingLot?: () => void;
  onOpenDestinationGallery?: () => void;
  onOpenCartographersStudio?: () => void;
  /** My Story & Progress */
  onOpenJournal?: () => void;
  onOpenEvidenceVault?: () => void;
  onOpenHallOfAccomplishments?: () => void;
  /** Knowledge & Advisory */
  onOpenChamber?: () => void;
  onOpenBoardroom?: () => void;
  /** Experiences — Breathe; Peaceful Places / Soundscapes stay here. */
  onOpenBreathe?: () => void;
  /** Play an owned soundscape or Peaceful Places music track in-room. */
  onPlaySoundscape?: (track: ExperienceSoundscapeTrack) => void;
  /**
   * Which photograph surface Change background updates.
   * Defaults from roomId (Clear My Mind → clear-my-mind; else chat).
   */
  backdropSurface?: "chat" | "clear-my-mind";
};

/**
 * Room button — one doorway for room identity, experience controls, and estate navigation.
 * @see spark-notes-files/ESTATE_ROOM_BUTTON_AND_WANDER_NAVIGATION_SPECIFICATION.md
 */
function resolveBackdropSurface(
  roomId: string,
  explicit?: "chat" | "clear-my-mind",
): "chat" | "clear-my-mind" {
  if (explicit) return explicit;
  if (
    roomId === "clear-my-mind" ||
    roomId === "clear-my-mind-thoughts" ||
    roomId === "brain-dump" ||
    roomId === "greenhouse" ||
    roomId === "sunroom"
  ) {
    return "clear-my-mind";
  }
  return "chat";
}

export function EstateRoomExperienceMenu({
  roomId,
  visible = true,
  withEstateMenu = false,
  embedded = false,
  chatVisible,
  onToggleChat,
  onToggleSound,
  soundEnabled: soundEnabledProp,
  onBackToEstate,
  onExploreSpark,
  onReturnToExploreEstate,
  onOpenPlanMyDay,
  onOpenRhythms,
  onOpenReminders,
  onOpenCalendar,
  onOpenProjects,
  onOpenClearMyMind,
  onOpenParkingLot,
  onOpenDestinationGallery,
  onOpenCartographersStudio,
  onOpenJournal,
  onOpenEvidenceVault,
  onOpenHallOfAccomplishments,
  onOpenChamber,
  onOpenBoardroom,
  onOpenBreathe,
  onPlaySoundscape,
  backdropSurface: backdropSurfaceProp,
}: EstateRoomExperienceMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pickingBackdrop, setPickingBackdrop] = useState(false);
  const [expandedSection, setExpandedSection] = useState<MenuSection | null>(null);
  const [soundscapesExpanded, setSoundscapesExpanded] = useState(false);
  const [peacefulPlacesExpanded, setPeacefulPlacesExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const profile = resolveEstatePlaceAmbientProfile(roomId);
  const soundAvailable = Boolean(profile);
  const placeDisplayName = resolveWanderRoomDisplayName(roomId);
  const backdropRoomId = resolveCanonicalPlaceId(roomId);
  const backdropSurface = resolveBackdropSurface(roomId, backdropSurfaceProp);

  const { fullscreen: browserFullscreen, faded, bumpVisibility } =
    useIdleChromeReveal({
      fullscreenIdleMs: ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
      onlyWhenFullscreen: true,
    });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const syncSound = () => {
      if (soundEnabledProp !== undefined) {
        setSoundEnabled(soundEnabledProp);
        return;
      }
      /**
       * Welcome Home stays silent until Sound on (kickstart). Do not show
       * "Sound on" from a global preference while nothing is playing.
       */
      if (roomId === "welcome-home") {
        setSoundEnabled(
          isEstateAmbienceEnabled() &&
            activeEstateAmbienceRoomId() === "welcome-home",
        );
        return;
      }
      setSoundEnabled(isEstateAmbienceEnabled());
    };
    syncSound();
    if (soundEnabledProp !== undefined) return;
    return subscribeEstateAudioSettings(syncSound);
  }, [soundEnabledProp, roomId]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(isEstateBrowserFullscreen());
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (faded) {
      setOpen(false);
      setPickingBackdrop(false);
    }
  }, [faded]);

  useEffect(() => {
    if (!open) {
      setPickingBackdrop(false);
      setExpandedSection(null);
      setSoundscapesExpanded(false);
      setPeacefulPlacesExpanded(false);
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
      setPickingBackdrop(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (pickingBackdrop) {
          setPickingBackdrop(false);
          return;
        }
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pickingBackdrop]);

  const toggleSection = useCallback((section: MenuSection) => {
    setExpandedSection((current) => (current === section ? null : section));
  }, []);

  const closeAndRun = useCallback((action: () => void) => {
    setOpen(false);
    setPickingBackdrop(false);
    bumpVisibility();
    action();
  }, [bumpVisibility]);

  const toggleSound = useCallback(() => {
    if (onToggleSound) {
      onToggleSound();
      return;
    }
    if (soundEnabled) {
      setEstateAmbienceEnabled(false);
      setSoundEnabled(false);
      void stopAllEstateEnvironmentalAudio();
      return;
    }
    if (!profile) return;
    setEstateAmbienceEnabled(true);
    setSoundEnabled(true);
    kickstartEstateRoomAmbience(roomId, profile);
  }, [onToggleSound, soundEnabled, profile, roomId]);

  const toggleFullscreen = useCallback(async () => {
    await toggleEstateBrowserFullscreen();
    setFullscreen(isEstateBrowserFullscreen());
  }, []);

  if (!mounted || !visible) return null;

  const menu = (
    <div
      ref={rootRef}
      className={[
        "estate-room-experience-menu",
        !embedded && withEstateMenu
          ? "estate-room-experience-menu--with-estate-menu"
          : "",
        embedded ? "estate-room-experience-menu--embedded" : "",
        soundEnabled ? "estate-room-experience-menu--sound-on" : "",
        open ? "estate-room-experience-menu--open" : "",
        browserFullscreen ? "estate-room-experience-menu--fullscreen" : "",
        faded ? "estate-room-experience-menu--faded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="estate-room-experience-menu"
      onMouseMove={browserFullscreen ? bumpVisibility : undefined}
      onTouchStart={browserFullscreen ? bumpVisibility : undefined}
    >
      {faded ? (
        <button
          type="button"
          className="estate-room-experience-menu__hint"
          aria-label="Show Room menu — move mouse or tap"
          onClick={() => {
            bumpVisibility();
          }}
        >
          {ESTATE_CHROME_IDLE_HINT_FULLSCREEN}
        </button>
      ) : (
        <>
          <button
            type="button"
            className="estate-room-experience-menu__trigger"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={`${placeDisplayName} — room menu`}
            title={placeDisplayName}
            onClick={() => {
              bumpVisibility();
              setOpen((value) => !value);
            }}
          >
            <span className="estate-room-experience-menu__trigger-label">
              {placeDisplayName}
            </span>
            <span className="estate-room-experience-menu__trigger-chevron" aria-hidden>
              ▼
            </span>
          </button>

          {open ? (
            <div
              className={[
                "estate-room-experience-menu__panel",
                pickingBackdrop
                  ? "estate-room-experience-menu__panel--backdrop"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="menu"
              aria-label="Room menu"
              data-testid="estate-room-quick-choices"
            >
              <div className="estate-room-experience-menu__panel-scroll">
              {pickingBackdrop ? (
                <>
                  <button
                    type="button"
                    className="estate-room-experience-menu__item"
                    data-testid="estate-room-backdrop-back"
                    onClick={() => setPickingBackdrop(false)}
                  >
                    <span className="estate-room-experience-menu__item-icon" aria-hidden>
                      ←
                    </span>
                    <span className="estate-room-experience-menu__item-label">
                      Back
                    </span>
                  </button>
                  <p className="estate-room-experience-menu__section-label">
                    Change background
                  </p>
                  <ChatBackdropPicker
                    surface={backdropSurface}
                    roomId={backdropRoomId}
                    onPicked={() => {
                      bumpVisibility();
                      setPickingBackdrop(false);
                    }}
                  />
                </>
              ) : (
                <>
                  {MENU_SECTIONS.map((section) => {
                    const isExpanded = expandedSection === section.id;
                    return (
                      <div
                        key={section.id}
                        className={[
                          "estate-room-experience-menu__section",
                          isExpanded
                            ? "estate-room-experience-menu__section--open"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <button
                          type="button"
                          className="estate-room-experience-menu__category"
                          aria-expanded={isExpanded}
                          data-testid={`estate-room-menu-section-${section.id}`}
                          onClick={() => {
                            bumpVisibility();
                            toggleSection(section.id);
                          }}
                        >
                          <span className="estate-room-experience-menu__category-label">
                            {section.label}
                          </span>
                          <span
                            className="estate-room-experience-menu__category-chevron"
                            aria-hidden
                          >
                            ›
                          </span>
                        </button>

                        {isExpanded && section.id === "experience-controls" ? (
                          <div
                            className="estate-room-experience-menu__section-items"
                            role="group"
                            aria-label="Experience Controls"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className={[
                                "estate-room-experience-menu__item",
                                chatVisible
                                  ? "estate-room-experience-menu__item--active"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              aria-pressed={chatVisible}
                              data-testid="estate-room-chat-toggle"
                              onClick={() => closeAndRun(onToggleChat)}
                            >
                              <span
                                className="estate-room-experience-menu__item-icon"
                                aria-hidden
                              >
                                💬
                              </span>
                              <span className="estate-room-experience-menu__item-label">
                                {chatVisible ? "Chat on" : "Chat off"}
                              </span>
                            </button>
                            {soundAvailable ? (
                              <button
                                type="button"
                                role="menuitem"
                                className={[
                                  "estate-room-experience-menu__item",
                                  soundEnabled
                                    ? "estate-room-experience-menu__item--active"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                aria-pressed={soundEnabled}
                                data-testid="estate-room-sound-toggle"
                                onClick={() => closeAndRun(toggleSound)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🔊
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  {soundEnabled ? "Sound on" : "Sound off"}
                                </span>
                              </button>
                            ) : null}
                            <button
                              type="button"
                              role="menuitem"
                              className={[
                                "estate-room-experience-menu__item",
                                fullscreen
                                  ? "estate-room-experience-menu__item--active"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              aria-pressed={fullscreen}
                              data-testid="estate-room-fullscreen-toggle"
                              onClick={() => {
                                void closeAndRun(() => {
                                  void toggleFullscreen();
                                });
                              }}
                            >
                              <span
                                className="estate-room-experience-menu__item-icon"
                                aria-hidden
                              >
                                {fullscreen ? "⤡" : "⛶"}
                              </span>
                              <span className="estate-room-experience-menu__item-label">
                                {fullscreen ? "Full screen on" : "Full screen off"}
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="estate-room-experience-menu__item"
                              data-testid="estate-room-change-background"
                              onClick={() => {
                                bumpVisibility();
                                setPickingBackdrop(true);
                              }}
                            >
                              <span
                                className="estate-room-experience-menu__item-icon"
                                aria-hidden
                              >
                                🖼
                              </span>
                              <span className="estate-room-experience-menu__item-label">
                                Change background
                              </span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                              data-testid="estate-return-to-estate"
                              onClick={() => closeAndRun(onBackToEstate)}
                            >
                              <span
                                className="estate-room-experience-menu__item-icon"
                                aria-hidden
                              >
                                🏡
                              </span>
                              <span className="estate-room-experience-menu__item-label">
                                Return to Estate
                              </span>
                            </button>
                          </div>
                        ) : null}

                        {isExpanded && section.id === "estate-navigation" ? (
                          <div
                            className="estate-room-experience-menu__section-items"
                            role="group"
                            aria-label="Estate Navigation"
                          >
                            {onExploreSpark ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Explore Estate"
                                data-testid="estate-open-explore-spark"
                                onClick={() => closeAndRun(onExploreSpark)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🚶
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Explore Estate
                                </span>
                              </button>
                            ) : null}
                            {onReturnToExploreEstate ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Return to Explore Estate"
                                data-testid="estate-return-to-explore-estate"
                                onClick={() => closeAndRun(onReturnToExploreEstate)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🗺
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Return to Explore Estate
                                </span>
                              </button>
                            ) : null}
                          </div>
                        ) : null}

                        {isExpanded && section.id === "my-day-and-work" ? (
                          <div
                            className="estate-room-experience-menu__section-items"
                            role="group"
                            aria-label="My Day & Work"
                          >
                            {onOpenPlanMyDay ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Plan My Day"
                                data-testid="estate-open-plan-my-day"
                                onClick={() => closeAndRun(onOpenPlanMyDay)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  ☀
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Plan My Day
                                </span>
                              </button>
                            ) : null}
                            {onOpenRhythms ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Rhythms"
                                data-testid="estate-open-rhythms"
                                onClick={() => closeAndRun(onOpenRhythms)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  ♻
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Rhythms
                                </span>
                              </button>
                            ) : null}
                            {onOpenReminders ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Reminders"
                                data-testid="estate-open-reminders"
                                onClick={() => closeAndRun(onOpenReminders)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🔔
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Reminders
                                </span>
                              </button>
                            ) : null}
                            {onOpenCalendar ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Calendar"
                                data-testid="estate-open-calendar"
                                onClick={() => closeAndRun(onOpenCalendar)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  📅
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Calendar
                                </span>
                              </button>
                            ) : null}
                            {onOpenProjects ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Projects"
                                data-testid="estate-open-projects"
                                onClick={() => closeAndRun(onOpenProjects)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  📁
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Projects
                                </span>
                              </button>
                            ) : null}
                            {onOpenClearMyMind ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Clear My Mind"
                                data-testid="estate-open-clear-my-mind"
                                onClick={() => closeAndRun(onOpenClearMyMind)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🧠
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Clear My Mind
                                </span>
                              </button>
                            ) : null}
                            {onOpenParkingLot ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Parking Lot"
                                data-testid="estate-open-parking-lot"
                                onClick={() => closeAndRun(onOpenParkingLot)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🅿️
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Parking Lot
                                </span>
                              </button>
                            ) : null}
                            {onOpenDestinationGallery ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Destination Gallery"
                                data-testid="estate-open-destination-gallery"
                                onClick={() => closeAndRun(onOpenDestinationGallery)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🖼
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Destination Gallery
                                </span>
                              </button>
                            ) : null}
                            {onOpenCartographersStudio ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Cartographer's Studio"
                                data-testid="estate-open-cartographers-studio"
                                onClick={() => closeAndRun(onOpenCartographersStudio)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🗺
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Cartographer&apos;s Studio
                                </span>
                              </button>
                            ) : null}
                          </div>
                        ) : null}

                        {isExpanded && section.id === "my-story-and-progress" ? (
                          <div
                            className="estate-room-experience-menu__section-items"
                            role="group"
                            aria-label="My Story & Progress"
                          >
                            {onOpenJournal ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Journal Gazebo"
                                data-testid="estate-open-journal"
                                onClick={() => closeAndRun(onOpenJournal)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  📖
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Journal Gazebo
                                </span>
                              </button>
                            ) : null}
                            {onOpenEvidenceVault ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Evidence Vault"
                                data-testid="estate-open-evidence-vault"
                                onClick={() => closeAndRun(onOpenEvidenceVault)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  📜
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Evidence Vault
                                </span>
                              </button>
                            ) : null}
                            {onOpenHallOfAccomplishments ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Hall of Accomplishments"
                                data-testid="estate-open-hall-of-accomplishments"
                                onClick={() => closeAndRun(onOpenHallOfAccomplishments)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🏆
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Hall of Accomplishments
                                </span>
                              </button>
                            ) : null}
                          </div>
                        ) : null}

                        {isExpanded && section.id === "knowledge-and-advisory" ? (
                          <div
                            className="estate-room-experience-menu__section-items"
                            role="group"
                            aria-label="Knowledge & Advisory"
                          >
                            {onOpenChamber ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Chamber of Momentum"
                                data-testid="estate-open-chamber"
                                onClick={() => closeAndRun(onOpenChamber)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🏛
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Chamber of Momentum
                                </span>
                              </button>
                            ) : null}
                            {onOpenBoardroom ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Boardroom"
                                data-testid="estate-open-boardroom"
                                onClick={() => closeAndRun(onOpenBoardroom)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🪑
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Boardroom
                                </span>
                              </button>
                            ) : null}
                          </div>
                        ) : null}

                        {isExpanded && section.id === "experiences" ? (
                          <div
                            className="estate-room-experience-menu__section-items"
                            role="group"
                            aria-label="Experiences"
                          >
                            {onOpenBreathe ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                                aria-label="Open Breathe"
                                data-testid="estate-open-breathe"
                                onClick={() => closeAndRun(onOpenBreathe)}
                              >
                                <span
                                  className="estate-room-experience-menu__item-icon"
                                  aria-hidden
                                >
                                  🌿
                                </span>
                                <span className="estate-room-experience-menu__item-label">
                                  Breathe
                                </span>
                              </button>
                            ) : null}
                            {onPlaySoundscape ? (
                              <>
                                <div className="estate-room-experience-menu__nested-group">
                                  <button
                                    type="button"
                                    className={[
                                      "estate-room-experience-menu__category",
                                      "estate-room-experience-menu__category--nested",
                                      peacefulPlacesExpanded
                                        ? "estate-room-experience-menu__category--open"
                                        : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                    aria-expanded={peacefulPlacesExpanded}
                                    data-testid="estate-open-peaceful-places"
                                    onClick={() => {
                                      bumpVisibility();
                                      setPeacefulPlacesExpanded((current) => !current);
                                    }}
                                  >
                                    <span className="estate-room-experience-menu__category-label">
                                      Peaceful Places
                                    </span>
                                    <span
                                      className="estate-room-experience-menu__category-chevron"
                                      aria-hidden
                                    >
                                      ›
                                    </span>
                                  </button>
                                  {peacefulPlacesExpanded ? (
                                    <div
                                      className="estate-room-experience-menu__section-items estate-room-experience-menu__section-items--nested"
                                      role="group"
                                      aria-label="Peaceful Places"
                                    >
                                      {PEACEFUL_PLACES_MUSIC_TRACKS.map((track) => (
                                        <button
                                          key={track.id}
                                          type="button"
                                          role="menuitem"
                                          className="estate-room-experience-menu__item estate-room-experience-menu__item--nested"
                                          data-testid={`estate-play-peaceful-place-${track.id}`}
                                          onClick={() =>
                                            closeAndRun(() => onPlaySoundscape(track))
                                          }
                                        >
                                          <span
                                            className="estate-room-experience-menu__item-icon"
                                            aria-hidden
                                          >
                                            🎵
                                          </span>
                                          <span className="estate-room-experience-menu__item-label">
                                            {track.title}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="estate-room-experience-menu__nested-group">
                                  <button
                                    type="button"
                                    className={[
                                      "estate-room-experience-menu__category",
                                      "estate-room-experience-menu__category--nested",
                                      soundscapesExpanded
                                        ? "estate-room-experience-menu__category--open"
                                        : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                    aria-expanded={soundscapesExpanded}
                                    data-testid="estate-open-soundscapes"
                                    onClick={() => {
                                      bumpVisibility();
                                      setSoundscapesExpanded((current) => !current);
                                    }}
                                  >
                                    <span className="estate-room-experience-menu__category-label">
                                      Soundscapes
                                    </span>
                                    <span
                                      className="estate-room-experience-menu__category-chevron"
                                      aria-hidden
                                    >
                                      ›
                                    </span>
                                  </button>
                                  {soundscapesExpanded ? (
                                    <div
                                      className="estate-room-experience-menu__section-items estate-room-experience-menu__section-items--nested"
                                      role="group"
                                      aria-label="Soundscapes"
                                    >
                                      {EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.map((track) => (
                                        <button
                                          key={track.id}
                                          type="button"
                                          role="menuitem"
                                          className="estate-room-experience-menu__item estate-room-experience-menu__item--nested"
                                          data-testid={`estate-play-soundscape-${track.id}`}
                                          onClick={() =>
                                            closeAndRun(() => onPlaySoundscape(track))
                                          }
                                        >
                                          <span
                                            className="estate-room-experience-menu__item-icon"
                                            aria-hidden
                                          >
                                            🔊
                                          </span>
                                          <span className="estate-room-experience-menu__item-label">
                                            {track.title}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </>
              )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  if (embedded) return menu;

  return createPortal(menu, document.body);
}
