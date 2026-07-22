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
  resolveWelcomeHomeDestinationAlias,
  type WelcomeHomeFocusedPanelId,
  type WelcomeHomeNavDropdownId,
  type WelcomeHomeNavDestination,
  type WelcomeHomeNavDestinationId,
  type WelcomeHomeNavDropdownChildId,
} from "@/lib/estate/welcomeHomeNavigationStructure";
import { welcomeHomeCategoryForDestination } from "@/lib/estate/welcomeHomeActiveDestination";
import { isNavLearningModeEnabled } from "@/lib/estate/navLearningMode";

export type EstateRoomExperienceMenuProps = {
  roomId: string;
  visible?: boolean;
  /** Spec 129 — highlight where the member is now. */
  activeDestinationId?: WelcomeHomeNavDestinationId | null;
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
  /** Spark Estate → Wander the Grounds (Explore Estate). */
  onExploreSpark?: () => void;
  /** Spark Estate → Spark Estate Guide (explicit open only). */
  onOpenSparkEstateGuide?: () => void;
  onReturnToExploreEstate?: () => void;
  /** Shared Plan/Adapt window (parent menu item). */
  onOpenAdaptPlanMyDay?: () => void;
  /** Shared Plan/Adapt window with Plan selected. */
  onOpenPlanMyDay?: () => void;
  /** Shared Plan/Adapt window with Adapt selected. */
  onOpenAdaptMyDay?: () => void;
  onOpenCalendar?: () => void;
  /** Shared Reminders/Rhythms window (parent menu item). */
  onOpenRemindersRhythms?: () => void;
  /** Shared Reminders/Rhythms window with Reminders selected. */
  onOpenReminders?: () => void;
  /** Shared Reminders/Rhythms window with Rhythms selected. */
  onOpenRhythms?: () => void;
  onOpenProjects?: () => void;
  /** My Work → Create estate entrance. */
  onOpenCreateStudio?: () => void;
  onOpenDestinationGallery?: () => void;
  onOpenCartographersStudio?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenParkingLot?: () => void;
  onOpenTalkItOut?: () => void;
  onOpenSpinTheWheel?: () => void;
  onOpenBreathe?: () => void;
  onOpenPeacefulPlaces?: () => void;
  onOpenSoundscapes?: () => void;
  onOpenJournal?: () => void;
  onOpenEvidenceVault?: () => void;
  onOpenHallOfAccomplishments?: () => void;
  onOpenChamber?: () => void;
  onOpenBoardroom?: () => void;
  /** Work to Create → Strategies (playbook / StrategiesPanel). */
  onOpenStrategyLibrary?: () => void;
  /** Audio → Focus Audio (when available; falls back to Peaceful Moments). */
  onOpenFocusAudio?: () => void;
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
  activeDestinationId = null,
  withEstateMenu = false,
  embedded = false,
  onBackToEstate,
  onExploreSpark,
  onOpenSparkEstateGuide,
  onReturnToExploreEstate,
  onOpenAdaptPlanMyDay,
  onOpenPlanMyDay,
  onOpenAdaptMyDay,
  onOpenCalendar,
  onOpenRemindersRhythms,
  onOpenReminders,
  onOpenRhythms,
  onOpenProjects,
  onOpenCreateStudio,
  onOpenClearMyMind,
  onOpenParkingLot,
  onOpenTalkItOut,
  onOpenSpinTheWheel,
  onOpenDestinationGallery,
  onOpenCartographersStudio,
  onOpenJournal,
  onOpenEvidenceVault,
  onOpenHallOfAccomplishments,
  onOpenChamber,
  onOpenBoardroom,
  onOpenStrategyLibrary,
  onOpenFocusAudio,
  onOpenBreathe,
  onOpenPeacefulPlaces,
  onOpenSoundscapes,
}: EstateRoomExperienceMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  /** Focused category submenu — replaces top-level on desktop and mobile. */
  const [focusedPanel, setFocusedPanel] =
    useState<WelcomeHomeFocusedPanelId | null>(null);
  /** Which My Day nested dropdown is expanded (at most one). */
  const [expandedDropdown, setExpandedDropdown] =
    useState<WelcomeHomeNavDropdownId | null>(null);
  const [learningMode, setLearningMode] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const placeDisplayName = resolveWanderRoomDisplayName(roomId);

  const { fullscreen: browserFullscreen, faded, bumpVisibility } =
    useIdleChromeReveal({
      fullscreenIdleMs: ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
      onlyWhenFullscreen: true,
    });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setLearningMode(isNavLearningModeEnabled());
    const sync = () => setLearningMode(isNavLearningModeEnabled());
    window.addEventListener("companion-nav-learning-mode-updated", sync);
    return () =>
      window.removeEventListener("companion-nav-learning-mode-updated", sync);
  }, []);

  useEffect(() => {
    if (faded) setOpen(false);
  }, [faded]);

  useEffect(() => {
    if (!open) {
      setFocusedPanel(null);
      setExpandedDropdown(null);
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (expandedDropdown) {
          setExpandedDropdown(null);
          return;
        }
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
  }, [open, focusedPanel, expandedDropdown]);

  const closeAndRun = useCallback(
    (action: (() => void) | undefined) => {
      if (!action) return;
      setOpen(false);
      setFocusedPanel(null);
      setExpandedDropdown(null);
      bumpVisibility();
      action();
    },
    [bumpVisibility],
  );

  const destinationAction = useCallback(
    (id: WelcomeHomeNavDestinationId): (() => void) | undefined => {
      const canonical = resolveWelcomeHomeDestinationAlias(id);
      const map: Record<WelcomeHomeNavDestinationId, (() => void) | undefined> =
        {
          // Parents open shared windows (103–105).
          "adapt-plan-my-day": onOpenAdaptPlanMyDay,
          calendar: onOpenCalendar,
          "reminders-rhythms": onOpenRemindersRhythms,
          create: onOpenCreateStudio,
          projects: onOpenProjects,
          "destination-gallery": onOpenDestinationGallery,
          "cartographers-studio": onOpenCartographersStudio,
          "clear-my-mind": onOpenClearMyMind,
          "parking-lot": onOpenParkingLot,
          "talk-it-out": onOpenTalkItOut,
          breathe: onOpenBreathe,
          "spin-the-wheel": onOpenSpinTheWheel,
          "peaceful-places": onOpenPeacefulPlaces,
          soundscapes: onOpenSoundscapes,
          "nature-sounds": onOpenPeacefulPlaces,
          "focus-audio": onOpenFocusAudio ?? onOpenPeacefulPlaces,
          "guided-audio": onOpenSoundscapes,
          "relaxation-audio": onOpenSoundscapes,
          journal: onOpenJournal,
          "evidence-vault": onOpenEvidenceVault,
          "hall-of-accomplishments": onOpenHallOfAccomplishments,
          // Browse more expands in-place — no parent navigation.
          "reflect-more": undefined,
          "chamber-of-momentum": onOpenChamber,
          boardroom: onOpenBoardroom,
          "strategy-library": onOpenStrategyLibrary,
          "wander-the-grounds": onExploreSpark,
          "explore-estate": onExploreSpark,
          "spark-estate-guide": onOpenSparkEstateGuide,
        };
      return map[canonical] ?? map[id];
    },
    [
      onOpenAdaptPlanMyDay,
      onOpenRemindersRhythms,
      onOpenCalendar,
      onOpenCreateStudio,
      onOpenProjects,
      onOpenDestinationGallery,
      onOpenCartographersStudio,
      onOpenClearMyMind,
      onOpenParkingLot,
      onOpenTalkItOut,
      onOpenBreathe,
      onOpenSpinTheWheel,
      onOpenPeacefulPlaces,
      onOpenSoundscapes,
      onOpenFocusAudio,
      onOpenJournal,
      onOpenEvidenceVault,
      onOpenHallOfAccomplishments,
      onOpenChamber,
      onOpenBoardroom,
      onOpenStrategyLibrary,
      onExploreSpark,
      onOpenSparkEstateGuide,
    ],
  );

  const dropdownChildAction = useCallback(
    (id: WelcomeHomeNavDropdownChildId): (() => void) | undefined => {
      const myDayMap: Partial<
        Record<WelcomeHomeNavDropdownChildId, (() => void) | undefined>
      > = {
        "plan-my-day": onOpenPlanMyDay ?? onOpenAdaptPlanMyDay,
        "adapt-my-day": onOpenAdaptMyDay ?? onOpenAdaptPlanMyDay,
        reminders: onOpenReminders ?? onOpenRemindersRhythms,
        rhythms: onOpenRhythms ?? onOpenRemindersRhythms,
      };
      if (id in myDayMap) return myDayMap[id];
      // Reflect → Browse more children share destination openers.
      return destinationAction(id as WelcomeHomeNavDestinationId);
    },
    [
      onOpenPlanMyDay,
      onOpenAdaptMyDay,
      onOpenAdaptPlanMyDay,
      onOpenReminders,
      onOpenRhythms,
      onOpenRemindersRhythms,
      destinationAction,
    ],
  );

  const openFocusedPanel = useCallback((id: WelcomeHomeFocusedPanelId) => {
    setExpandedDropdown(null);
    setFocusedPanel(id);
  }, []);

  const backToTopLevel = useCallback(() => {
    bumpVisibility();
    setExpandedDropdown(null);
    setFocusedPanel(null);
  }, [bumpVisibility]);

  const toggleDropdown = useCallback(
    (id: WelcomeHomeNavDropdownId) => {
      bumpVisibility();
      setExpandedDropdown((current) => (current === id ? null : id));
    },
    [bumpVisibility],
  );

  if (!mounted || !visible) return null;

  const activeCategory =
    WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === focusedPanel) ?? null;
  const activePanelLabel = activeCategory?.label ?? null;
  const activeDestinations = activeCategory?.destinations ?? null;
  const activeCategoryId = welcomeHomeCategoryForDestination(activeDestinationId);

  const renderDestinationButton = (dest: WelcomeHomeNavDestination) => {
    const children = dest.dropdownChildren;
    if (children && children.length > 0) {
      const dropdownId = dest.id as WelcomeHomeNavDropdownId;
      const isExpanded = expandedDropdown === dropdownId;
      const parentAction = destinationAction(dest.id);
      return (
        <div
          key={dest.id}
          className="estate-room-experience-menu__dropdown"
          data-testid={`welcome-home-dropdown-${dest.id}`}
          data-expanded={isExpanded ? "true" : "false"}
        >
          <div className="estate-room-experience-menu__dropdown-row">
            <button
              type="button"
              role="menuitem"
              className="estate-room-experience-menu__item estate-room-experience-menu__item--nav estate-room-experience-menu__item--dropdown-toggle"
              aria-label={`Open ${dest.label}`}
              data-testid={`estate-open-${dest.id}`}
              onClick={() => {
                if (parentAction) closeAndRun(parentAction);
                else toggleDropdown(dropdownId);
              }}
            >
              <span className="estate-room-experience-menu__item-label">
                {dest.label}
              </span>
            </button>
            <button
              type="button"
              className="estate-room-experience-menu__item-chevron estate-room-experience-menu__item-chevron--dropdown"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? "Hide" : "Show"} ${dest.label} options`}
              data-testid={`welcome-home-dropdown-toggle-${dest.id}`}
              onClick={() => toggleDropdown(dropdownId)}
            >
              <span aria-hidden>{isExpanded ? "▾" : "›"}</span>
            </button>
          </div>
          {isExpanded ? (
            <div
              className="estate-room-experience-menu__dropdown-children"
              role="group"
              aria-label={dest.label}
              data-testid={`welcome-home-dropdown-children-${dest.id}`}
            >
              {children.map((child) => {
                const childAction = dropdownChildAction(child.id);
                if (!childAction) return null;
                return (
                  <button
                    key={child.id}
                    type="button"
                    role="menuitem"
                    className="estate-room-experience-menu__item estate-room-experience-menu__item--nav estate-room-experience-menu__item--dropdown-child"
                    aria-label={`Open ${child.label}`}
                    data-testid={`estate-open-${child.id}`}
                    onClick={() => closeAndRun(childAction)}
                  >
                    <span className="estate-room-experience-menu__item-label">
                      {child.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }

    const action = destinationAction(dest.id);
    if (!action) return null;
    const isHere = activeDestinationId === dest.id;
    return (
      <button
        key={dest.id}
        type="button"
        role="menuitem"
        className={[
          "estate-room-experience-menu__item estate-room-experience-menu__item--nav",
          isHere ? "estate-room-experience-menu__item--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={
          dest.supportLine
            ? `Open ${dest.label}. ${dest.supportLine}`
            : `Open ${dest.label}`
        }
        aria-current={isHere ? "page" : undefined}
        data-testid={`estate-open-${dest.id}`}
        data-nav-active={isHere ? "true" : undefined}
        onClick={() => closeAndRun(action)}
      >
        <span className="estate-room-experience-menu__item-copy">
          <span className="estate-room-experience-menu__item-label">
            {dest.label}
          </span>
          {dest.supportLine ? (
            <span className="estate-room-experience-menu__item-support">
              {dest.supportLine}
            </span>
          ) : null}
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
                          className={[
                            "estate-room-experience-menu__category",
                            category.id === "spark-estate"
                              ? "estate-room-experience-menu__category--spark-estate"
                              : "",
                            category.id === activeCategoryId
                              ? "estate-room-experience-menu__category--active"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          aria-expanded={false}
                          aria-current={
                            category.id === activeCategoryId ? "true" : undefined
                          }
                          data-testid={`estate-room-menu-section-${category.id}`}
                          data-nav-active={
                            category.id === activeCategoryId ? "true" : undefined
                          }
                          onClick={() => {
                            bumpVisibility();
                            openFocusedPanel(category.id);
                          }}
                        >
                          <span className="estate-room-experience-menu__category-text">
                            <span className="estate-room-experience-menu__category-label">
                              {category.label}
                            </span>
                            {learningMode && category.subtitle ? (
                              <span
                                className="estate-room-experience-menu__category-subtitle"
                                data-testid={`welcome-home-category-subtitle-${category.id}`}
                              >
                                {category.subtitle}
                              </span>
                            ) : null}
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

                    <button
                      type="button"
                      role="menuitem"
                      className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                      aria-label="Welcome Home"
                      data-testid="estate-return-to-estate"
                      onClick={() => closeAndRun(onBackToEstate)}
                    >
                      <span className="estate-room-experience-menu__item-label">
                        Welcome Home
                      </span>
                    </button>
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
