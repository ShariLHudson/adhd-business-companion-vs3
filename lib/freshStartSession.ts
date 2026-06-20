import { clearHomeResumeDismissForSession } from "@/lib/homeResumeItem";
import { clearPlanMyDayDismissForSession } from "@/lib/todayPanelDismiss";

/** Session-only flags cleared when beginning a new day. */
export function clearDailySessionFlags(): void {
  clearPlanMyDayDismissForSession();
  clearHomeResumeDismissForSession();
}
