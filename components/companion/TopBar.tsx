"use client";

import { useEffect, useRef, useState } from "react";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { TopBarCenteredMenu } from "@/components/companion/TopBarCenteredMenu";
import {
  CompanionObjectLabel,
  CompanionObjectVisual,
} from "@/components/companion/CompanionObjectVisual";
import {
  countActivePlanItems,
  PLAN_MY_DAY_UPDATED,
} from "@/lib/planMyDay";
import {
  CLEAR_MY_MIND_MENU_ITEMS,
  NEW_CONVERSATION_MENU_ITEMS,
  PLAN_MY_DAY_MENU_ITEMS,
  type ClearMyMindMenuItemId,
  type NewConversationLens,
  type PlanMyDayMenuItemId,
} from "@/lib/topBarNavigation";
import {
  MENU_DROPDOWN_ITEM_LG,
  MENU_SECTION_HEADING,
  MENU_TRIGGER_BTN,
} from "@/lib/menuNavStyles";
import type { HomeNavVisibility } from "@/lib/arrivalIntelligence";
import { ASSETS } from "@/lib/companionUi";

type TopBarProps = {
  calmHome?: boolean;
  navVisibility?: HomeNavVisibility;
  showPlanMyDay?: boolean;
  onOpenClearMyMindItem?: (itemId: ClearMyMindMenuItemId) => void;
  onOpenPlanMyDayItem?: (itemId: PlanMyDayMenuItemId) => void;
  onOpenPeacefulPlaces?: () => void;
  onStartConversation?: (lens: NewConversationLens) => void;
  onOpenWelcomeRoom?: () => void;
  onOpenMyStory?: () => void;
  onOpenWhatsNew?: () => void;
  onOpenSettings: (section?: SettingsSection | null) => void;
  onOpenProfile: () => void;
};

function usePlanActiveCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(countActivePlanItems());
    sync();
    window.addEventListener(PLAN_MY_DAY_UPDATED, sync);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, sync);
  }, []);
  return count;
}

export function TopBar({
  calmHome = false,
  navVisibility = "calm",
  showPlanMyDay = false,
  onOpenClearMyMindItem,
  onOpenPlanMyDayItem,
  onOpenPeacefulPlaces,
  onStartConversation,
  onOpenWelcomeRoom,
  onOpenMyStory,
  onOpenWhatsNew,
  onOpenSettings,
  onOpenProfile,
}: TopBarProps) {
  const planActiveCount = usePlanActiveCount();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  function closeMenus() {
    setAccountMenuOpen(false);
  }

  function runHeaderAction(action: () => void) {
    closeMenus();
    action();
  }

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const accountRoot = accountMenuRef.current;
      if (accountRoot?.contains(event.target as Node)) {
        return;
      }
      closeMenus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  return (
    <div
      className={`companion-top-bar sticky top-0 z-50 flex shrink-0 items-center justify-end gap-2 px-4 py-2.5 backdrop-blur-sm sm:px-6 ${calmHome ? "companion-top-bar-calm" : ""} companion-nav-${navVisibility}`}
      data-companion-topbar=""
      data-home-calm={calmHome ? "" : undefined}
      data-nav-visibility={navVisibility}
    >
      {onOpenClearMyMindItem ? (
        <TopBarCenteredMenu
          menuId="clear-my-mind"
          triggerObjectId="clear-my-mind"
          label="Clear My Mind"
          items={CLEAR_MY_MIND_MENU_ITEMS.map((item) => ({
            id: item.id,
            label: item.label,
            objectId: item.objectId,
            onSelect: () => runHeaderAction(() => onOpenClearMyMindItem(item.id)),
          }))}
        />
      ) : null}

      {showPlanMyDay && onOpenPlanMyDayItem ? (
        <TopBarCenteredMenu
          menuId="plan-my-day"
          triggerObjectId="plan-my-day"
          label="Plan My Day"
          badge={planActiveCount}
          items={PLAN_MY_DAY_MENU_ITEMS.map((item) => ({
            id: item.id,
            label: item.label,
            objectId: item.objectId,
            onSelect: () => runHeaderAction(() => onOpenPlanMyDayItem(item.id)),
          }))}
        />
      ) : null}

      {onOpenPeacefulPlaces ? (
        <button
          type="button"
          className={MENU_TRIGGER_BTN}
          title="Focus My Brain"
          aria-label="Focus My Brain — Peaceful Places"
          data-top-bar-menu="focus-my-brain"
          onClick={() => runHeaderAction(onOpenPeacefulPlaces)}
        >
          <CompanionObjectVisual objectId="focus-my-brain" size="xs" variant="icon" />
          <span className="hidden sm:inline">Focus My Brain</span>
        </button>
      ) : null}

      {onStartConversation ? (
        <TopBarCenteredMenu
          menuId="new-conversation"
          triggerObjectId="messages"
          label="New Conversation"
          items={NEW_CONVERSATION_MENU_ITEMS.map((item) => ({
            id: item.id,
            label: item.label,
            objectId: item.objectId,
            onSelect: () => runHeaderAction(() => onStartConversation(item.lens)),
          }))}
        />
      ) : null}

      <div ref={accountMenuRef} className="relative z-50">
        <button
          type="button"
          onClick={() => setAccountMenuOpen((open) => !open)}
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
          aria-label="Shari's menu"
          title="Shari"
          className="relative z-50 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#c9bdb0] bg-white shadow-sm transition-colors hover:border-[#1e4f4f]/40 hover:bg-[#fff8ef]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.profile}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
        {accountMenuOpen ? (
          <div
            className="absolute right-0 z-[60] mt-1 w-56 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg"
            role="menu"
            aria-label="Shari"
          >
            <p className={`border-b border-[#e7dfd4] px-4 py-2 ${MENU_SECTION_HEADING}`}>
              Shari
            </p>
            {onOpenWelcomeRoom ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => runHeaderAction(onOpenWelcomeRoom)}
                className={MENU_DROPDOWN_ITEM_LG}
              >
                <CompanionObjectLabel objectId="welcome-room" label="Welcome Room" size="xs" />
              </button>
            ) : null}
            {onOpenMyStory ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => runHeaderAction(onOpenMyStory)}
                className={MENU_DROPDOWN_ITEM_LG}
              >
                <CompanionObjectLabel objectId="life-experience" label="My Story" size="xs" />
              </button>
            ) : null}
            {onOpenWhatsNew ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => runHeaderAction(onOpenWhatsNew)}
                className={MENU_DROPDOWN_ITEM_LG}
              >
                <CompanionObjectLabel objectId="help" label="What's New" size="xs" />
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              onClick={() => runHeaderAction(() => onOpenSettings(null))}
              className={MENU_DROPDOWN_ITEM_LG}
            >
              <CompanionObjectLabel objectId="settings" label="Settings" size="xs" />
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => runHeaderAction(onOpenProfile)}
              className={`${MENU_DROPDOWN_ITEM_LG} border-t border-[#e7dfd4]`}
            >
              <CompanionObjectLabel objectId="profile" label="Profile" size="xs" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
