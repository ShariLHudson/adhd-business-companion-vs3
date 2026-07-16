"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ESTATE_CHROME_IDLE_HINT_FULLSCREEN,
  ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
} from "@/lib/estate/justBeHere";
import { useIdleChromeReveal } from "@/lib/estate/useIdleChromeReveal";
import { resolveWanderRoomDisplayName } from "@/lib/estate/manifest/estateWanderMode";
import {
  WELCOME_HOME_NAV_CATEGORIES,
  WELCOME_HOME_WANDER_GROUNDS,
  type WelcomeHomeFocusedPanelId,
  type WelcomeHomeNavDestination,
  type WelcomeHomeNavDestinationId,
} from "@/lib/estate/welcomeHomeNavigationStructure";

export type EstateRoomExperienceMenuProps = {
  roomId: string;
  visible?: boolean;
  /** When true, shift left so the estate menu trigger stays at the corner. */
  withEstateMenu?: boolean;
  /** When true, render inline inside EstateTopRightChrome (no separate portal). */
  embedded?: boolean;
  /** @deprecated Kept for chrome prop compatibility; controls moved to SH. */
  chatVisible?: boolean;
  /** @deprecated */
  onToggleChat?: () => void;
  /** @deprecated */
  onToggleSound?: () => void;
  /** @deprecated */
  soundEnabled?: boolean;
  onBackToEstate: () => void;
  /** Wander the Grounds — Explore Estate. */
  onExploreSpark?: () => void;
  /** Wander the Grounds — Spark Estate Guide (lazy-loaded flipbook). */
  onOpenSparkEstateGuide?: () => void;
  onReturnToExploreEstate?: () => void;
  /** Shared Adapt / Plan My Day entrance (PlanOrAdaptPathChooser). */
  onOpenAdaptPlanMyDay?: () => void;
  /** @deprecated Use onOpenAdaptPlanMyDay — kept for transitional callers. */
  onOpenPlanMyDay?: () => void;
  onOpenCalendar?: () => void;
  /** Shared Reminders / Rhythms explanatory entrance. */
  onOpenRemindersRhythms?: () => void;
  /** @deprecated Prefer onOpenRemindersRhythms from My Day. */
  onOpenReminders?: () => void;
  /** @deprecated Prefer onOpenRemindersRhythms from My Day. */
  onOpenRhythms?: () => void;
  onOpenProjects?: () => void;
  onOpenCreateStudio?: () => void;
  onOpenDestinationGallery?: () => void;
  onOpenCartographersStudio?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenParkingLot?: () => void;
  onOpenSpinTheWheel?: () => void;
  onOpenBreathe?: () => void;
  onOpenPeacefulPlaces?: () => void;
  onOpenSoundscapes?: () => void;
  onOpenJournal?: () => void;
  onOpenEvidenceVault?: () => void;
  onOpenHallOfAccomplishments?: () => void;
  onOpenChamber?: () => void;
  onOpenBoardroom?: () => void;
  /** @deprecated Soundscapes open a dedicated selection screen. */
  onPlaySoundscape?: (track: unknown) => void;
  backdropSurface?: "chat" | "clear-my-mind";
};

/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Look / sound / behave controls live under the SH profile menu.
 *
 * Two panel states: top-level categories, or a focused category submenu
 * that replaces the top-level list (never stacked underneath).
 */
export function EstateRoomExperienceMenu({
  roomId,
  visible = true,
  withEstateMenu = false,
  embedded = false,
  onExploreSpark,
  onOpenSparkEstateGuide,
  onReturnToExploreEstate,
  onOpenAdaptPlanMyDay,
  onOpenPlanMyDay,
  onOpenCalendar,
  onOpenRemindersRhythms,
  onOpenProjects,
  onOpenClearMyMind,
  onOpenParkingLot,
  onOpenSpinTheWheel,
  onOpenDestinationGallery,
  onOpenCartographersStudio,
  onOpenJournal,
  onOpenEvidenceVault,
  onOpenHallOfAccomplishments,
  onOpenChamber,
  onOpenBoardroom,
  onOpenBreathe,
  onOpenPeacefulPlaces,
  onOpenSoundscapes,
}: EstateRoomExperienceMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  /** Focused category submenu — replaces top-level on desktop and mobile. */
  const [focusedPanel, setFocusedPanel] =
    useState<WelcomeHomeFocusedPanelId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const placeDisplayName = resolveWanderRoomDisplayName(roomId);

  const { fullscreen: browserFullscreen, faded, bumpVisibility } =
    useIdleChromeReveal({
      fullscreenIdleMs: ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
      onlyWhenFullscreen: true,
    });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (faded) setOpen(false);
  }, [faded]);

  useEffect(() => {
    if (!open) {
      setFocusedPanel(null);
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (focusedPanel) {
          setFocusedPanel(null);
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
  }, [open, focusedPanel]);

  const closeAndRun = useCallback(
    (action: (() => void) | undefined) => {
      if (!action) return;
      setOpen(false);
      setFocusedPanel(null);
      bumpVisibility();
      action();
    },
    [bumpVisibility],
  );

  const openAdaptPlanMyDay = onOpenAdaptPlanMyDay ?? onOpenPlanMyDay;

  const destinationAction = useCallback(
    (id: WelcomeHomeNavDestinationId): (() => void) | undefined => {
      const map: Record<WelcomeHomeNavDestinationId, (() => void) | undefined> =
        {
          "adapt-plan-my-day": openAdaptPlanMyDay,
          calendar: onOpenCalendar,
          "reminders-rhythms": onOpenRemindersRhythms,
          projects: onOpenProjects,
          "destination-gallery": onOpenDestinationGallery,
          "cartographers-studio": onOpenCartographersStudio,
          "clear-my-mind": onOpenClearMyMind,
          "parking-lot": onOpenParkingLot,
          breathe: onOpenBreathe,
          "spin-the-wheel": onOpenSpinTheWheel,
          "peaceful-places": onOpenPeacefulPlaces,
          soundscapes: onOpenSoundscapes,
          journal: onOpenJournal,
          "evidence-vault": onOpenEvidenceVault,
          "hall-of-accomplishments": onOpenHallOfAccomplishments,
          "chamber-of-momentum": onOpenChamber,
          boardroom: onOpenBoardroom,
          "explore-estate": onExploreSpark,
          "spark-estate-guide": onOpenSparkEstateGuide,
        };
      return map[id];
    },
    [
      openAdaptPlanMyDay,
      onOpenCalendar,
      onOpenRemindersRhythms,
      onOpenProjects,
      onOpenDestinationGallery,
      onOpenCartographersStudio,
      onOpenClearMyMind,
      onOpenParkingLot,
      onOpenBreathe,
      onOpenSpinTheWheel,
      onOpenPeacefulPlaces,
      onOpenSoundscapes,
      onOpenJournal,
      onOpenEvidenceVault,
      onOpenHallOfAccomplishments,
      onOpenChamber,
      onOpenBoardroom,
      onExploreSpark,
      onOpenSparkEstateGuide,
    ],
  );

  const openFocusedPanel = useCallback((id: WelcomeHomeFocusedPanelId) => {
    setFocusedPanel(id);
  }, []);

  const backToTopLevel = useCallback(() => {
    bumpVisibility();
    setFocusedPanel(null);
  }, [bumpVisibility]);

  if (!mounted || !visible) return null;

  const activeCategory =
    WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === focusedPanel) ?? null;
  const wanderFocused = focusedPanel === WELCOME_HOME_WANDER_GROUNDS.id;
  const activePanelLabel = wanderFocused
    ? WELCOME_HOME_WANDER_GROUNDS.label
    : activeCategory?.label ?? null;
  const activeDestinations = wanderFocused
    ? WELCOME_HOME_WANDER_GROUNDS.destinations
    : activeCategory?.destinations ?? null;

  const renderDestinationButton = (dest: WelcomeHomeNavDestination) => {
    const action = destinationAction(dest.id);
    if (!action) return null;
    return (
      <button
        key={dest.id}
        type="button"
        role="menuitem"
        className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
        aria-label={`Open ${dest.label}`}
        data-testid={`estate-open-${dest.id}`}
        onClick={() => closeAndRun(action)}
      >
        <span className="estate-room-experience-menu__item-label">
          {dest.label}
        </span>
        {dest.selectionExperience ? (
          <span
            className="estate-room-experience-menu__item-chevron"
            aria-hidden
          >
            ›
          </span>
        ) : null}
      </button>
    );
  };

  const menu = (
    <div
      ref={rootRef}
      className={[
        "estate-room-experience-menu",
        !embedded && withEstateMenu
          ? "estate-room-experience-menu--with-estate-menu"
          : "",
        embedded ? "estate-room-experience-menu--embedded" : "",
        open ? "estate-room-experience-menu--open" : "",
        focusedPanel
          ? "estate-room-experience-menu--submenu"
          : "",
        browserFullscreen ? "estate-room-experience-menu--fullscreen" : "",
        faded ? "estate-room-experience-menu--faded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="estate-room-experience-menu"
      data-welcome-home-view={focusedPanel ? "submenu" : "top-level"}
      onMouseMove={browserFullscreen ? bumpVisibility : undefined}
      onTouchStart={browserFullscreen ? bumpVisibility : undefined}
    >
      {faded ? (
        <button
          type="button"
          className="estate-room-experience-menu__hint"
          aria-label="Show Welcome Home menu — move mouse or tap"
          onClick={() => bumpVisibility()}
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
            aria-label={`${placeDisplayName} — Welcome Home menu`}
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
              className="estate-room-experience-menu__panel"
              role="menu"
              aria-label={
                activePanelLabel
                  ? `Welcome Home — ${activePanelLabel}`
                  : "Welcome Home"
              }
              data-testid="estate-room-quick-choices"
              data-welcome-home-panel={
                activeDestinations ? "focused-submenu" : "top-level"
              }
            >
              <div className="estate-room-experience-menu__panel-scroll">
                {activeDestinations && activePanelLabel && focusedPanel ? (
                  <>
                    <button
                      type="button"
                      className="estate-room-experience-menu__item estate-room-experience-menu__item--back"
                      data-testid="welcome-home-nav-back"
                      aria-label="Back to Welcome Home"
                      onClick={backToTopLevel}
                    >
                      <span className="estate-room-experience-menu__item-label">
                        ‹ Back to Welcome Home
                      </span>
                    </button>
                    <p
                      className="estate-room-experience-menu__section-label"
                      data-testid="welcome-home-submenu-heading"
                    >
                      {activePanelLabel}
                    </p>
                    <div
                      className="estate-room-experience-menu__submenu-items"
                      role="group"
                      aria-label={activePanelLabel}
                      data-testid={`welcome-home-submenu-${focusedPanel}`}
                    >
                      {activeDestinations.map((dest) =>
                        renderDestinationButton(dest),
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {WELCOME_HOME_NAV_CATEGORIES.map((category) => (
                      <div
                        key={category.id}
                        className="estate-room-experience-menu__section"
                      >
                        <button
                          type="button"
                          className="estate-room-experience-menu__category"
                          aria-expanded={false}
                          data-testid={`estate-room-menu-section-${category.id}`}
                          onClick={() => {
                            bumpVisibility();
                            openFocusedPanel(category.id);
                          }}
                        >
                          <span className="estate-room-experience-menu__category-label">
                            {category.label}
                          </span>
                          <span
                            className="estate-room-experience-menu__category-chevron"
                            aria-hidden
                          >
                            ›
                          </span>
                        </button>
                      </div>
                    ))}

                    <div
                      className="estate-room-experience-menu__divider"
                      role="separator"
                      aria-hidden
                    />

                    <button
                      type="button"
                      className="estate-room-experience-menu__category estate-room-experience-menu__category--wander"
                      aria-expanded={false}
                      aria-label={WELCOME_HOME_WANDER_GROUNDS.label}
                      data-testid="estate-open-wander-the-grounds"
                      onClick={() => {
                        bumpVisibility();
                        openFocusedPanel(WELCOME_HOME_WANDER_GROUNDS.id);
                      }}
                    >
                      <span className="estate-room-experience-menu__category-label">
                        {WELCOME_HOME_WANDER_GROUNDS.label}
                      </span>
                      <span
                        className="estate-room-experience-menu__category-chevron"
                        aria-hidden
                      >
                        ›
                      </span>
                    </button>

                    {onReturnToExploreEstate ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="estate-room-experience-menu__item estate-room-experience-menu__item--wander"
                        aria-label="Return to Explore Estate"
                        data-testid="estate-return-to-explore-estate"
                        onClick={() => closeAndRun(onReturnToExploreEstate)}
                      >
                        <span className="estate-room-experience-menu__item-label">
                          Return to Explore Estate
                        </span>
                      </button>
                    ) : null}
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
