"use client";

import { useEffect, useRef, useState } from "react";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { TopBarCenteredMenu } from "@/components/companion/TopBarCenteredMenu";
import { TopBarNavButton } from "@/components/companion/TopBarNavButton";
import { CompanionObjectLabel } from "@/components/companion/CompanionObjectVisual";
import {
  countActivePlanItems,
  PLAN_MY_DAY_UPDATED,
} from "@/lib/planMyDay";
import {
  NEW_CONVERSATION_MENU_ITEMS,
  type NewConversationMenuItemId,
} from "@/lib/topBarNavigation";
import {
  MENU_DROPDOWN_ITEM_LG,
  MENU_SECTION_HEADING,
} from "@/lib/menuNavStyles";
import type { HomeNavVisibility } from "@/lib/arrivalIntelligence";
import type { AppSection } from "@/lib/companionUi";
import { getPrefs } from "@/lib/companionStore";
import {
  userProfileImageUrl,
  userProfileInitials,
} from "@/lib/userProfileDisplay";

type TopBarProps = {
  calmHome?: boolean;
  navVisibility?: HomeNavVisibility;
  activeSection?: AppSection;
  onOpenClearMyMind?: () => void;
  onOpenPlanMyDay?: () => void;
  onOpenTodaysReality?: () => void;
  onNewConversationItem?: (itemId: NewConversationMenuItemId) => void;
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

function useUserProfileDisplay() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const sync = () => {
      setImageUrl(userProfileImageUrl());
      setInitials(userProfileInitials());
    };
    sync();
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);

  return { imageUrl, initials, name: getPrefs().name };
}

export function TopBar({
  calmHome = false,
  navVisibility: _navVisibility = "normal",
  activeSection = "home",
  onOpenClearMyMind,
  onOpenPlanMyDay,
  onOpenTodaysReality,
  onNewConversationItem,
  onOpenSettings,
  onOpenProfile,
}: TopBarProps) {
  const planActiveCount = usePlanActiveCount();
  const { imageUrl, initials } = useUserProfileDisplay();
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
      className={`companion-top-bar sticky top-0 z-[200] flex shrink-0 items-start justify-end gap-2 px-4 pb-2 pt-0 backdrop-blur-sm sm:px-6 companion-nav-normal ${calmHome ? "companion-top-bar-calm" : ""}`}
      data-companion-topbar=""
      data-home-calm={calmHome ? "" : undefined}
      data-nav-visibility="normal"
    >
      <div className="companion-top-bar__signs">
      {onOpenClearMyMind ? (
        <TopBarNavButton
          menuId="clear-my-mind"
          objectId="clear-my-mind"
          label="Clear My Mind"
          active={activeSection === "brain-dump"}
          onClick={() => runHeaderAction(onOpenClearMyMind)}
        />
      ) : null}

      {onOpenPlanMyDay ? (
        <TopBarNavButton
          menuId="plan-my-day"
          objectId="plan-my-day"
          label="Plan My Day"
          badge={planActiveCount}
          active={activeSection === "plan-my-day"}
          onClick={() => runHeaderAction(onOpenPlanMyDay)}
        />
      ) : null}

      {onOpenTodaysReality ? (
        <TopBarNavButton
          menuId="todays-reality"
          objectId="todays-reality"
          label="Today's Reality"
          active={activeSection === "energy"}
          onClick={() => runHeaderAction(onOpenTodaysReality)}
        />
      ) : null}

      {onNewConversationItem ? (
        <TopBarCenteredMenu
          menuId="new-conversation"
          triggerObjectId="messages"
          label="New Conversation"
          showCaret={false}
          items={NEW_CONVERSATION_MENU_ITEMS.map((item) => ({
            id: item.id,
            label: item.label,
            objectId: item.objectId,
            onSelect: () =>
              runHeaderAction(() =>
                onNewConversationItem(item.id as NewConversationMenuItemId),
              ),
          }))}
        />
      ) : null}
      </div>

      <div ref={accountMenuRef} className="relative z-50">
        <button
          type="button"
          onClick={() => setAccountMenuOpen((open) => !open)}
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
          title="Account"
          className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#6B5010] bg-[#3D3028] text-[#E8DDD4] shadow-sm transition-colors hover:border-[#6B5010] hover:bg-[#4A3A28]"
          data-top-bar-menu="account"
        >
          <span className="text-xl leading-none" aria-hidden>
            ⋯
          </span>
        </button>
        {accountMenuOpen ? (
          <div
            className="absolute right-0 z-[60] mt-1 w-56 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg"
            role="menu"
            aria-label="Account"
          >
            <div className="flex items-center gap-3 border-b border-[#e7dfd4] px-4 py-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8e2d8] text-sm font-semibold text-[#4b463f]"
                  aria-hidden
                >
                  {initials}
                </span>
              )}
              <p className={`${MENU_SECTION_HEADING} !normal-case !tracking-normal`}>
                Account
              </p>
            </div>
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
