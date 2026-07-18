/**
 * Profile migration bridge — preserves NavigationOriginContext API shape
 * while storing Profile origin as a stack frame.
 */

import type { ProfileDestinationOverlayId } from "@/lib/profile/profileDestination";
import { canonicalizeProfileDestinationOverlay } from "@/lib/profile/profileDestination";
import {
  clearNavigationStack,
  getNavigationStack,
  peekNavigationFrame,
  popNavigationFrame,
  pushNavigationFrame,
  setNavigationCurrent,
  subscribeNavigationStack,
} from "./stack";
import { labelForDestinationId } from "./labels";
import {
  DESTINATION_LABELS,
  SETTINGS_SAVED_MESSAGE,
  type NavigationBreadcrumbCrumb,
  type NavigationFrame,
} from "./types";

/** @deprecated Prefer NavigationFrame — kept for Profile call sites during migration. */
export type NavigationOriginContext = {
  originDestination: "profile";
  originRoute: Exclude<ProfileDestinationOverlayId, "profile">;
  originTab?: string;
  originSection?: string;
  originStep?: string;
  originAccordion?: string;
  editingFieldId?: string;
  originScrollY?: number;
  returnLabel?: string;
  openedDestination: string;
  openedDestinationLabel?: string;
  breadcrumbParent?: string;
  openedSettingsSection?: string;
  createdAt: string;
  expiresAt: string;
};

export type ProfileBreadcrumbCrumb = NavigationBreadcrumbCrumb;

export const PROFILE_SETTINGS_SECTION_LABELS = DESTINATION_LABELS;

export { SETTINGS_SAVED_MESSAGE };

const LEGACY_ORIGIN_KEY = "spark:navigation-origin:v1";

function migrateLegacyOriginIfNeeded(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (getNavigationStack().frames.length > 0) return;
    const raw = sessionStorage.getItem(LEGACY_ORIGIN_KEY);
    if (!raw) return;
    const legacy = JSON.parse(raw) as NavigationOriginContext;
    if (legacy?.originDestination !== "profile" || !legacy.originRoute) return;
    pushNavigationFrame({
      destinationId: legacy.originRoute,
      label: labelForProfileRoute(legacy.originRoute),
      kind: "destination",
      tab: legacy.originTab,
      section: legacy.originSection,
      accordion: legacy.originAccordion,
      step: legacy.originStep,
      scrollY: legacy.originScrollY,
      editingFieldId: legacy.editingFieldId,
      meta: {
        breadcrumbParent: legacy.breadcrumbParent,
        openedSettingsSection: legacy.openedSettingsSection,
        openedDestination: legacy.openedDestination,
      },
    });
    setNavigationCurrent({
      destinationId: legacy.openedDestination,
      label:
        legacy.openedDestinationLabel ??
        labelForDestinationId(
          legacy.openedSettingsSection ?? legacy.openedDestination,
        ),
      kind: "overlay",
    });
    sessionStorage.removeItem(LEGACY_ORIGIN_KEY);
  } catch {
    /* ignore */
  }
}

function labelForProfileRoute(
  route: NavigationOriginContext["originRoute"],
): string {
  if (route === "my-business-estate") return "My Business Estate";
  if (route === "people-i-help") return "People I Help";
  if (route === "growth-profile") return "Growth Profile";
  return "My Profile";
}

export function defaultProfileReturnLabel(
  originRoute: NavigationOriginContext["originRoute"],
  setupActive?: boolean,
): string {
  if (setupActive) return "Continue Profile Setup";
  if (originRoute === "my-business-estate") {
    return "Return to My Business Estate";
  }
  if (originRoute === "people-i-help") {
    return "Return to People I Help";
  }
  if (originRoute === "growth-profile") {
    return "Return to Growth Profile";
  }
  return "Back to My Profile";
}

export function labelForOpenedDestination(
  openedDestination: string,
  settingsSection?: string | null,
): string {
  if (openedDestination === "experience-controls") {
    return "Accessibility & display";
  }
  if (openedDestination === "people-i-help") {
    return "People I Help";
  }
  if (openedDestination === "settings" && settingsSection) {
    return DESTINATION_LABELS[settingsSection] ?? "Settings";
  }
  if (openedDestination === "settings") return "Settings";
  return DESTINATION_LABELS[openedDestination] ?? openedDestination;
}

function frameToOrigin(frame: NavigationFrame): NavigationOriginContext {
  const openedDestination =
    (frame.meta?.openedDestination as string | undefined) ?? "settings";
  const openedSettingsSection =
    (frame.meta?.openedSettingsSection as string | undefined) ?? undefined;
  const originRoute = canonicalizeProfileDestinationOverlay(
    frame.destinationId === "profile"
      ? "my-business-estate"
      : (frame.destinationId as NavigationOriginContext["originRoute"]),
  );
  return {
    originDestination: "profile",
    originRoute,
    originTab: frame.tab,
    originSection: frame.section,
    originStep: frame.step,
    originAccordion: frame.accordion,
    editingFieldId: frame.editingFieldId,
    originScrollY: frame.scrollY,
    returnLabel: defaultProfileReturnLabel(
      originRoute,
      frame.meta?.setupActive === true,
    ),
    openedDestination,
    openedDestinationLabel: labelForOpenedDestination(
      openedDestination,
      openedSettingsSection,
    ),
    breadcrumbParent: frame.meta?.breadcrumbParent as string | undefined,
    openedSettingsSection,
    createdAt: frame.openedAt,
    expiresAt: frame.expiresAt,
  };
}

export function setNavigationOrigin(
  input: Omit<
    NavigationOriginContext,
    "createdAt" | "expiresAt" | "returnLabel"
  > & {
    returnLabel?: string;
    setupActive?: boolean;
  },
): NavigationOriginContext {
  migrateLegacyOriginIfNeeded();
  clearNavigationStack();
  const originRoute = canonicalizeProfileDestinationOverlay(
    input.originRoute === "profile"
      ? "my-business-estate"
      : input.originRoute,
  );
  const openedSettingsSection = input.openedSettingsSection;
  pushNavigationFrame({
    destinationId: originRoute,
    label: labelForProfileRoute(originRoute),
    kind: "destination",
    tab: input.originTab,
    section: input.originSection,
    accordion: input.originAccordion,
    step: input.originStep,
    scrollY: input.originScrollY,
    editingFieldId: input.editingFieldId,
    meta: {
      breadcrumbParent: input.breadcrumbParent,
      openedSettingsSection,
      openedDestination: input.openedDestination,
      setupActive: input.setupActive === true,
    },
  });
  setNavigationCurrent({
    destinationId: input.openedDestination,
    label:
      input.openedDestinationLabel ??
      labelForOpenedDestination(input.openedDestination, openedSettingsSection),
    kind: "overlay",
  });
  const frame = peekNavigationFrame();
  if (!frame) {
    throw new Error("setNavigationOrigin failed to push frame");
  }
  const origin = frameToOrigin(frame);
  if (input.returnLabel) origin.returnLabel = input.returnLabel;
  else if (input.setupActive) {
    origin.returnLabel = defaultProfileReturnLabel(originRoute, true);
  }
  return origin;
}

const PROFILE_ORIGIN_IDS = new Set([
  "profile-personal",
  "my-business-estate",
  "people-i-help",
  "growth-profile",
]);

export function getNavigationOrigin(
  now = Date.now(),
): NavigationOriginContext | null {
  migrateLegacyOriginIfNeeded();
  const stack = getNavigationStack(now);
  const frame = stack.frames[stack.frames.length - 1] ?? null;
  if (!frame) return null;
  if (!PROFILE_ORIGIN_IDS.has(frame.destinationId)) return null;
  const exp = Date.parse(frame.expiresAt);
  if (!Number.isFinite(exp) || exp <= now) {
    clearNavigationStack();
    return null;
  }
  return frameToOrigin(frame);
}

export function patchNavigationOriginOpenedDestination(input: {
  openedDestination: string;
  openedSettingsSection?: string | null;
  openedDestinationLabel?: string;
}): NavigationOriginContext | null {
  const current = getNavigationOrigin();
  if (!current) return null;
  return setNavigationOrigin({
    ...current,
    openedDestination: input.openedDestination,
    openedSettingsSection: input.openedSettingsSection ?? undefined,
    openedDestinationLabel: input.openedDestinationLabel,
  });
}

export function clearNavigationOrigin(): void {
  clearNavigationStack();
}

export function consumeNavigationOrigin(): NavigationOriginContext | null {
  migrateLegacyOriginIfNeeded();
  const frame = popNavigationFrame();
  if (!frame) return null;
  return frameToOrigin(frame);
}

export function buildProfileReturnBreadcrumb(
  ctx: NavigationOriginContext,
): ProfileBreadcrumbCrumb[] {
  const crumbs: ProfileBreadcrumbCrumb[] = [
    {
      id: "profile",
      label: labelForProfileRoute(ctx.originRoute),
      stackIndex: 0,
      clickable: true,
    },
  ];
  const parent =
    ctx.breadcrumbParent ??
    (ctx.originSection === "preferences" ? "Preferences" : undefined);
  if (parent) {
    crumbs.push({
      id: "parent",
      label: parent,
      stackIndex: 0,
      clickable: true,
    });
  }
  const destLabel =
    ctx.openedDestinationLabel ??
    labelForOpenedDestination(
      ctx.openedDestination,
      ctx.openedSettingsSection,
    );
  if (destLabel) {
    crumbs.push({
      id: "destination",
      label: destLabel,
      stackIndex: getNavigationStack().frames.length,
      clickable: false,
    });
  }
  return crumbs;
}

export function subscribeNavigationOrigin(listener: () => void): () => void {
  return subscribeNavigationStack(listener);
}

export function clearNavigationOriginForTests(): void {
  clearNavigationStack();
  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.removeItem(LEGACY_ORIGIN_KEY);
    } catch {
      /* ignore */
    }
  }
}

export { LEGACY_ORIGIN_KEY as NAVIGATION_ORIGIN_STORAGE_KEY };
