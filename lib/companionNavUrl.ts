import type { CoachingMode } from "@/lib/companionPrompt";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";

export type CompanionOverlayParam = "profile" | "settings" | "signin";

export function companionSectionHref(section: AppSection): string {
  return `/companion?section=${section}`;
}

export function companionNavHref(
  nav: SidebarNavId,
  mode?: CoachingMode,
): string {
  const params = new URLSearchParams();
  params.set("nav", nav);
  if (mode) params.set("mode", mode);
  return `/companion?${params.toString()}`;
}

export function companionOverlayHref(overlay: CompanionOverlayParam): string {
  return `/companion?overlay=${overlay}`;
}

export function stripCompanionNavParams(
  params: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete("nav");
  next.delete("mode");
  next.delete("overlay");
  next.delete("settings");
  return next;
}
