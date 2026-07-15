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
  type WelcomeHomeNavCategoryId,
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
  onReturnToExploreEstate?: () => void;
  onOpenPlanMyDay?: () => void;
  onOpenRhythms?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
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
 */
export function EstateRoomExperienceMenu({
  roomId,
  visible = true,
  withEstateMenu = false,
  embedded = false,
  onExploreSpark,
  onReturnToExploreEstate,
  onOpenPlanMyDay,
  onOpenRhythms,
  onOpenReminders,
  onOpenCalendar,
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
  const [expandedCategory, setExpandedCategory] =
    useState<WelcomeHomeNavCategoryId | null>(null);
  const [mobileDrillIn, setMobileDrillIn] =
    useState<WelcomeHomeNavCategoryId | null>(null);
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
      setExpandedCategory(null);
      setMobileDrillIn(null);
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (mobileDrillIn) {
          setMobileDrillIn(null);
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
  }, [open, mobileDrillIn]);

  const closeAndRun = useCallback(
    (action: (() => void) | undefined) => {
      if (!action) return;
      setOpen(false);
      setExpandedCategory(null);
      setMobileDrillIn(null);
      bumpVisibility();
      action();
    },
    [bumpVisibility],
  );

  const destinationAction = useCallback(
    (id: WelcomeHomeNavDestinationId): (() => void) | undefined => {
      const map: Record<WelcomeHomeNavDestinationId, (() => void) | undefined> = {
        "plan-my-day": onOpenPlanMyDay,
        reminders: onOpenReminders,
        calendar: onOpenCalendar,
        rhythms: onOpenRhythms,
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
        "wander-the-grounds": onExploreSpark,
      };
      return map[id];
    },
    [
      onOpenPlanMyDay,
      onOpenReminders,
      onOpenCalendar,
      onOpenRhythms,
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
    ],
  );

  const openCategory = useCallback((id: WelcomeHomeNavCategoryId) => {
    const isNarrow =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (isNarrow) {
      setMobileDrillIn(id);
      setExpandedCategory(id);
      return;
    }
    setExpandedCategory((current) => (current === id ? null : id));
  }, []);

  if (!mounted || !visible) return null;

  const activeCategory =
    WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === mobileDrillIn) ?? null;

  const renderDestinationButton = (
    id: WelcomeHomeNavDestinationId,
    label: string,
  ) => {
    const action = destinationAction(id);
    if (!action) return null;
    return (
      <button
        key={id}
        type="button"
        role="menuitem"
        className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
        aria-label={`Open ${label}`}
        data-testid={`estate-open-${id}`}
        onClick={() => closeAndRun(action)}
      >
        <span className="estate-room-experience-menu__item-label">{label}</span>
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
              aria-label="Welcome Home"
              data-testid="estate-room-quick-choices"
            >
              <div className="estate-room-experience-menu__panel-scroll">
                {mobileDrillIn && activeCategory ? (
                  <>
                    <button
                      type="button"
                      className="estate-room-experience-menu__item"
                      data-testid="welcome-home-nav-back"
                      onClick={() => {
                        bumpVisibility();
                        setMobileDrillIn(null);
                        setExpandedCategory(null);
                      }}
                    >
                      <span className="estate-room-experience-menu__item-label">
                        ← Back
                      </span>
                    </button>
                    <p className="estate-room-experience-menu__section-label">
                      {activeCategory.label}
                    </p>
                    {activeCategory.destinations.map((dest) =>
                      renderDestinationButton(dest.id, dest.label),
                    )}
                  </>
                ) : (
                  <>
                    {WELCOME_HOME_NAV_CATEGORIES.map((category) => {
                      const isExpanded = expandedCategory === category.id;
                      return (
                        <div
                          key={category.id}
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
                            data-testid={`estate-room-menu-section-${category.id}`}
                            onClick={() => {
                              bumpVisibility();
                              openCategory(category.id);
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
                          {isExpanded && !mobileDrillIn ? (
                            <div
                              className="estate-room-experience-menu__section-items"
                              role="group"
                              aria-label={category.label}
                            >
                              {category.destinations.map((dest) =>
                                renderDestinationButton(dest.id, dest.label),
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}

                    <div
                      className="estate-room-experience-menu__divider"
                      role="separator"
                      aria-hidden
                    />

                    {onExploreSpark ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="estate-room-experience-menu__item estate-room-experience-menu__item--wander"
                        aria-label={WELCOME_HOME_WANDER_GROUNDS.label}
                        data-testid="estate-open-wander-the-grounds"
                        onClick={() => closeAndRun(onExploreSpark)}
                      >
                        <span className="estate-room-experience-menu__item-label">
                          {WELCOME_HOME_WANDER_GROUNDS.label}
                        </span>
                      </button>
                    ) : null}

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
