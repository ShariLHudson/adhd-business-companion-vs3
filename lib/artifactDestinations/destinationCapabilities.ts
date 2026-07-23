import {
  classifyArtifactFamily,
  isGuidedEventPlanDocumentType,
} from "./classifyArtifactFamily";
import type {
  ArtifactDestinationCapabilities,
  ArtifactDestinationDef,
  ArtifactDestinationId,
  ArtifactFamily,
} from "./types";

const EVENT_PLAN_CALENDAR_DESTINATIONS: readonly ArtifactDestinationDef[] = [
  {
    id: "google-calendar",
    label: "Google Calendar",
    requires: "google",
    alwaysOffer: true,
  },
  {
    id: "outlook-calendar",
    label: "Outlook Calendar",
    requires: "outlook",
    alwaysOffer: true,
  },
];

const DOC: readonly ArtifactDestinationDef[] = [
  { id: "google-docs", label: "Google Docs", requires: "google", alwaysOffer: true },
  {
    id: "microsoft-word",
    label: "Microsoft Word",
    alwaysOffer: true,
  },
  { id: "pdf", label: "PDF", alwaysOffer: true },
  { id: "print", label: "Print", requires: "print", alwaysOffer: true },
  { id: "download", label: "Download", alwaysOffer: true },
  { id: "copy", label: "Copy Text", alwaysOffer: true },
];

const SHEET: readonly ArtifactDestinationDef[] = [
  {
    id: "google-sheets",
    label: "Google Sheets",
    requires: "google",
    alwaysOffer: true,
  },
  { id: "microsoft-excel", label: "Excel", alwaysOffer: true },
  { id: "csv", label: "CSV", alwaysOffer: true },
  { id: "pdf", label: "PDF", alwaysOffer: true },
  { id: "print", label: "Print", requires: "print", alwaysOffer: true },
  { id: "download", label: "Download", alwaysOffer: true },
];

const CALENDAR: readonly ArtifactDestinationDef[] = [
  {
    id: "google-calendar",
    label: "Google Calendar",
    requires: "google",
    alwaysOffer: true,
  },
  {
    id: "outlook-calendar",
    label: "Outlook Calendar",
    requires: "outlook",
    alwaysOffer: true,
  },
  {
    id: "google-docs",
    label: "Google Docs",
    requires: "google",
    alwaysOffer: true,
  },
  { id: "pdf", label: "PDF", alwaysOffer: true },
  { id: "print", label: "Print", requires: "print", alwaysOffer: true },
];

const PRESENTATION: readonly ArtifactDestinationDef[] = [
  { id: "canva", label: "Canva", requires: "canva" },
  { id: "powerpoint", label: "PowerPoint", alwaysOffer: true },
  { id: "pdf", label: "PDF", alwaysOffer: true },
  { id: "print", label: "Print", requires: "print", alwaysOffer: true },
  { id: "download", label: "Download", alwaysOffer: true },
];

const FORM: readonly ArtifactDestinationDef[] = [
  { id: "google-forms", label: "Google Forms", requires: "google" },
  { id: "pdf", label: "PDF", alwaysOffer: true },
  { id: "print", label: "Print", requires: "print", alwaysOffer: true },
  { id: "download", label: "Download", alwaysOffer: true },
];

const IMAGE: readonly ArtifactDestinationDef[] = [
  { id: "download", label: "Download", alwaysOffer: true },
  { id: "copy", label: "Copy Text", alwaysOffer: true },
];

const OTHER: readonly ArtifactDestinationDef[] = [
  { id: "google-docs", label: "Google Docs", requires: "google" },
  { id: "pdf", label: "PDF", alwaysOffer: true },
  { id: "print", label: "Print", requires: "print", alwaysOffer: true },
  { id: "download", label: "Download", alwaysOffer: true },
  { id: "copy", label: "Copy Text", alwaysOffer: true },
];

const BY_FAMILY: Record<ArtifactFamily, ArtifactDestinationCapabilities> = {
  document: {
    family: "document",
    destinations: DOC,
    defaultDownloadFormat: "txt",
    downloadFormats: ["txt", "md", "pdf", "docx"],
  },
  spreadsheet: {
    family: "spreadsheet",
    destinations: SHEET,
    defaultDownloadFormat: "csv",
    downloadFormats: ["csv", "txt", "pdf"],
  },
  calendar: {
    family: "calendar",
    destinations: CALENDAR,
    defaultDownloadFormat: "txt",
    downloadFormats: ["txt", "md", "pdf"],
  },
  presentation: {
    family: "presentation",
    destinations: PRESENTATION,
    defaultDownloadFormat: "pdf",
    downloadFormats: ["pdf", "txt", "md"],
  },
  form: {
    family: "form",
    destinations: FORM,
    defaultDownloadFormat: "txt",
    downloadFormats: ["txt", "md", "pdf"],
  },
  image: {
    family: "image",
    destinations: IMAGE,
    defaultDownloadFormat: "txt",
    downloadFormats: ["txt"],
  },
  other: {
    family: "other",
    destinations: OTHER,
    defaultDownloadFormat: "txt",
    downloadFormats: ["txt", "md", "pdf", "docx"],
  },
};

export function destinationCapabilitiesForFamily(
  family: ArtifactFamily,
): ArtifactDestinationCapabilities {
  return BY_FAMILY[family];
}

export function destinationCapabilitiesForArtifact(
  artifactType: string | null | undefined,
  content = "",
): ArtifactDestinationCapabilities {
  const family = classifyArtifactFamily(artifactType, content);
  const base = destinationCapabilitiesForFamily(family);

  // Event Plan / Workshop = document destinations + intentional calendar crystals.
  if (family === "document" && isGuidedEventPlanDocumentType(artifactType)) {
    const seen = new Set(base.destinations.map((d) => d.id));
    const merged = [...base.destinations];
    for (const dest of EVENT_PLAN_CALENDAR_DESTINATIONS) {
      if (!seen.has(dest.id)) merged.push(dest);
    }
    return { ...base, destinations: merged };
  }

  return base;
}

export function artifactSupportsDestination(
  artifactType: string | null | undefined,
  destinationId: ArtifactDestinationId,
  content = "",
): boolean {
  return destinationCapabilitiesForArtifact(artifactType, content).destinations.some(
    (d) => d.id === destinationId,
  );
}

export function visibleDestinationIds(
  artifactType: string | null | undefined,
  content = "",
  options?: {
    googleConnected?: boolean;
    microsoftWordEnabled?: boolean;
    outlookConnected?: boolean;
    canvaConnected?: boolean;
    printSupported?: boolean;
  },
): ArtifactDestinationId[] {
  const caps = destinationCapabilitiesForArtifact(artifactType, content);
  const printSupported = options?.printSupported !== false;

  return caps.destinations
    .filter((d) => {
      if (d.id === "print") return true; // always list; UI may mark unavailable
      // Connected services still appear when alwaysOffer — UI marks needs_connection.
      if (d.requires === "google" && options?.googleConnected === false) {
        return d.alwaysOffer === true;
      }
      if (d.requires === "outlook" && options?.outlookConnected !== true) {
        return d.alwaysOffer === true;
      }
      if (d.requires === "canva" && options?.canvaConnected !== true) {
        return d.alwaysOffer === true;
      }
      if (d.requires === "print" && !printSupported && !d.alwaysOffer) {
        return false;
      }
      return true;
    })
    .map((d) => d.id);
}
