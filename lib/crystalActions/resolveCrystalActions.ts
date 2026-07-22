/**
 * Resolve the smallest Crystal Actions set for an item — reuse connection +
 * preference knowledge; ask which provider only when more than one is valid.
 */

import {
  readDigitalWorkspacePreferences,
  type DigitalWorkspacePreferences,
} from "@/lib/connections/digitalWorkspacePreferences";
import type { CrystalConnectionSnapshot } from "@/lib/destinationGallery/crystalConnectionMapping";
import {
  actionsForItemKind,
  CRYSTAL_ACTIONS_PANEL_TITLE,
} from "./actionCatalog";
import {
  getRememberedDestination,
  readCrystalActionDestinations,
  type CrystalActionDestinationMemory,
} from "./rememberedDestinations";
import type {
  CrystalActionDestinationId,
  CrystalActionId,
  CrystalActionItemKind,
  CrystalActionProviderOption,
  CrystalActionsPanelModel,
  ResolvedCrystalAction,
} from "./types";

export type ResolveCrystalActionsInput = {
  itemKind: CrystalActionItemKind;
  connections: CrystalConnectionSnapshot;
  preferences?: DigitalWorkspacePreferences;
  memory?: CrystalActionDestinationMemory;
  /** Social profile URLs present (any) */
  hasSocialLinks?: boolean;
};

function googleReady(connections: CrystalConnectionSnapshot): boolean {
  return connections.google.configured && connections.google.connected;
}

function providersForAction(
  actionId: CrystalActionId,
  connections: CrystalConnectionSnapshot,
  preferences: DigitalWorkspacePreferences,
  hasSocialLinks: boolean,
): CrystalActionProviderOption[] {
  switch (actionId) {
    case "save":
    case "export": {
      const options: CrystalActionProviderOption[] = [
        { id: "spark-estate", label: "Spark Estate Documents" },
      ];
      if (googleReady(connections)) {
        options.push({ id: "google-docs", label: "Google Docs" });
      }
      if (preferences.documents === "microsoft-word") {
        options.push({ id: "microsoft-word", label: "Microsoft Word" });
      }
      options.push({ id: "local", label: "Download" });
      return options;
    }
    case "download": {
      const options: CrystalActionProviderOption[] = [
        { id: "spark-estate", label: "Spark Estate Storage" },
        { id: "local", label: "Download" },
      ];
      if (googleReady(connections)) {
        options.push({ id: "google-drive", label: "Google Drive" });
      }
      return options;
    }
    case "print":
      return [
        { id: "print-dialog", label: "Print" },
        { id: "save-pdf", label: "Save as PDF" },
      ];
    case "add-to-calendar": {
      const options: CrystalActionProviderOption[] = [];
      if (googleReady(connections)) {
        options.push({ id: "google-calendar", label: "Google Calendar" });
      }
      if (connections.outlookConnected) {
        options.push({ id: "outlook-calendar", label: "Outlook Calendar" });
      }
      return options;
    }
    case "share":
      return hasSocialLinks
        ? [{ id: "social", label: "Share" }]
        : [{ id: "social", label: "Share" }];
    case "continue-working":
    case "archive":
      return [{ id: "spark-estate", label: "Spark Estate" }];
    default:
      return [{ id: "spark-estate", label: "Spark Estate" }];
  }
}

function pickAutoDestination(
  actionId: CrystalActionId,
  providers: CrystalActionProviderOption[],
  preferences: DigitalWorkspacePreferences,
  remembered: CrystalActionDestinationId | null,
): CrystalActionDestinationId | null {
  if (providers.length === 0) return null;
  if (remembered && providers.some((p) => p.id === remembered)) {
    return remembered;
  }
  if (providers.length === 1) return providers[0]!.id;

  // Quiet preference alignment when multiple are valid
  if (actionId === "save" || actionId === "export") {
    const prefMap: Partial<
      Record<string, CrystalActionDestinationId>
    > = {
      "spark-estate": "spark-estate",
      "google-docs": "google-docs",
      "microsoft-word": "microsoft-word",
      local: "local",
    };
    const mapped = prefMap[preferences.documents];
    if (mapped && providers.some((p) => p.id === mapped)) return mapped;
  }
  if (actionId === "download") {
    const prefMap: Partial<
      Record<string, CrystalActionDestinationId>
    > = {
      "spark-estate": "spark-estate",
      "google-drive": "google-drive",
    };
    const mapped = prefMap[preferences.storage];
    if (mapped && providers.some((p) => p.id === mapped)) return mapped;
  }
  if (actionId === "print") {
    const mapped =
      preferences.printing === "print-dialog" ? "print-dialog" : "save-pdf";
    if (providers.some((p) => p.id === mapped)) return mapped;
  }
  if (actionId === "add-to-calendar") {
    const preferGoogle = preferences.calendar === "google";
    const preferred = preferGoogle ? "google-calendar" : "outlook-calendar";
    if (providers.some((p) => p.id === preferred)) return preferred;
  }

  return null;
}

export function resolveCrystalActions(
  input: ResolveCrystalActionsInput,
): CrystalActionsPanelModel {
  const preferences =
    input.preferences ?? readDigitalWorkspacePreferences();
  const memory = input.memory ?? readCrystalActionDestinations();
  const hasSocialLinks = input.hasSocialLinks !== false;

  const actions: ResolvedCrystalAction[] = actionsForItemKind(
    input.itemKind,
  ).map((def) => {
    const providers = providersForAction(
      def.id,
      input.connections,
      preferences,
      hasSocialLinks,
    );
    const remembered = getRememberedDestination(
      input.itemKind,
      def.id,
      memory,
    );
    const autoDestinationId = pickAutoDestination(
      def.id,
      providers,
      preferences,
      remembered,
    );
    const needsProviderChoice =
      providers.length > 1 && autoDestinationId == null;

    return {
      ...def,
      needsProviderChoice,
      providers,
      autoDestinationId,
    };
  });

  return {
    title: CRYSTAL_ACTIONS_PANEL_TITLE,
    itemKind: input.itemKind,
    actions,
  };
}

/** Map a chosen destination onto digital workspace preferences when appropriate. */
export function preferencePatchForDestination(
  actionId: CrystalActionId,
  destinationId: CrystalActionDestinationId,
): Partial<DigitalWorkspacePreferences> | null {
  if (actionId === "save" || actionId === "export") {
    if (destinationId === "spark-estate") return { documents: "spark-estate" };
    if (destinationId === "google-docs") return { documents: "google-docs" };
    if (destinationId === "microsoft-word")
      return { documents: "microsoft-word" };
    if (destinationId === "local") return { documents: "local" };
  }
  if (actionId === "download") {
    if (destinationId === "spark-estate") return { storage: "spark-estate" };
    if (destinationId === "google-drive") return { storage: "google-drive" };
  }
  if (actionId === "print") {
    if (destinationId === "print-dialog") return { printing: "print-dialog" };
    if (destinationId === "save-pdf") return { printing: "save-pdf" };
  }
  if (actionId === "add-to-calendar") {
    if (destinationId === "google-calendar") return { calendar: "google" };
    if (destinationId === "outlook-calendar") return { calendar: "outlook" };
  }
  return null;
}
