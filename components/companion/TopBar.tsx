"use client";

import { useEffect, useState } from "react";
import { TopBarNavButton } from "@/components/companion/TopBarNavButton";
import { RhythmNotificationsGlance } from "@/components/companion/RhythmNotificationsGlance";
import {
  countActivePlanItems,
  PLAN_MY_DAY_UPDATED,
} from "@/lib/planMyDay";
import { collectDueDeliverables } from "@/lib/rhythms";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import type { HomeNavVisibility } from "@/lib/arrivalIntelligence";
import type { AppSection } from "@/lib/companionUi";

type TopBarProps = {
  calmHome?: boolean;
  navVisibility?: HomeNavVisibility;
  activeSection?: AppSection;
  onOpenClearMyMind?: () => void;
  onOpenPlanMyDay?: () => void;
  onOpenTodaysReality?: () => void;
  /** @deprecated Profile/settings menu is global — kept for call-site compat */
  onEstateMenuAction?: (actionId: EstateMenuActionId) => void;
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

function useDueGlanceCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(collectDueDeliverables().length);
    sync();
    const id = window.setInterval(sync, 30_000);
    window.addEventListener("companion-rhythms-updated", sync);
    window.addEventListener("companion-reminders-updated", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("companion-rhythms-updated", sync);
      window.removeEventListener("companion-reminders-updated", sync);
    };
  }, []);
  return count;
}

export function TopBar({
  calmHome = false,
  navVisibility: _navVisibility = "normal",
  activeSection = "home",
  onOpenClearMyMind,
  onOpenPlanMyDay,
  onOpenTodaysReality,
}: TopBarProps) {
  const planActiveCount = usePlanActiveCount();
  const dueCount = useDueGlanceCount();
  const [glanceOpen, setGlanceOpen] = useState(false);

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
            onClick={onOpenClearMyMind}
          />
        ) : null}

        {onOpenPlanMyDay ? (
          <TopBarNavButton
            menuId="plan-my-day"
            objectId="plan-my-day"
            label="Plan My Day"
            badge={planActiveCount}
            active={activeSection === "plan-my-day"}
            onClick={onOpenPlanMyDay}
          />
        ) : null}

        {onOpenTodaysReality ? (
          <TopBarNavButton
            menuId="todays-reality"
            objectId="todays-reality"
            label="Today's Reality"
            active={activeSection === "energy"}
            onClick={onOpenTodaysReality}
          />
        ) : null}

        <TopBarNavButton
          menuId="rhythms-glance"
          objectId="rhythms-glance"
          label="For you"
          badge={dueCount || undefined}
          active={glanceOpen}
          onClick={() => setGlanceOpen((o) => !o)}
        />
      </div>

      <RhythmNotificationsGlance
        open={glanceOpen}
        onClose={() => setGlanceOpen(false)}
      />
    </div>
  );
}
