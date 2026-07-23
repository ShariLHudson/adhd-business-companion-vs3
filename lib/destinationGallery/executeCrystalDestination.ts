/**
 * Execute a Destination Gallery crystal destination without a button menu.
 * Local downloads / print / Google create — crystal click is the primary action.
 */

import {
  buildDownloadArtifact,
  destinationCapabilitiesForArtifact,
  triggerBrowserDownload,
  type ArtifactDestinationFormat,
  type ArtifactDestinationId,
} from "@/lib/artifactDestinations";

export type CrystalDestinationExecutionResult = {
  ok: boolean;
  message: string;
  /** Open after success (Google Doc URL, calendar template, etc.) */
  openUrl?: string | null;
  /** Parent should open Estate Calendar room */
  openEstateCalendar?: boolean;
  /** Parent should open Connections */
  openConnections?: boolean;
  /** Retry is meaningful */
  canRetry?: boolean;
};

export type ExecuteCrystalDestinationInput = {
  destinationId: ArtifactDestinationId;
  title: string;
  body: string;
  artifactType?: string;
  googleConnected?: boolean;
  googleConfigured?: boolean;
  outlookConnected?: boolean;
  canvaConnected?: boolean;
  printSupported?: boolean;
  canvaDestinationUrl?: string | null;
};

function formatForDestination(
  destinationId: ArtifactDestinationId,
  artifactType: string | undefined,
  body: string,
): ArtifactDestinationFormat {
  const caps = destinationCapabilitiesForArtifact(artifactType, body);
  switch (destinationId) {
    case "pdf":
      return "pdf";
    case "microsoft-word":
      return "docx";
    case "csv":
    case "microsoft-excel":
      return "csv";
    case "powerpoint":
    case "markdown":
      return caps.downloadFormats.includes("md") ? "md" : "txt";
    case "download":
    default:
      return caps.defaultDownloadFormat === "pdf"
        ? "txt"
        : caps.defaultDownloadFormat;
  }
}

async function downloadDestination(
  destinationId: ArtifactDestinationId,
  title: string,
  body: string,
  artifactType?: string,
): Promise<CrystalDestinationExecutionResult> {
  if (!body.trim()) {
    return {
      ok: false,
      message: "Bring something we’ve written together, and I can send it from here.",
      canRetry: false,
    };
  }
  try {
    const format = formatForDestination(destinationId, artifactType, body);
    const artifact = await buildDownloadArtifact({
      title: title || "Spark work",
      body,
      format,
    });
    triggerBrowserDownload(artifact);
    const message =
      format === "pdf"
        ? "Downloaded PDF — open it in a PDF reader."
        : format === "docx"
          ? "Downloaded Word document."
          : format === "csv"
            ? "Downloaded spreadsheet file."
            : `Downloaded ${artifact.filename}`;
    return { ok: true, message };
  } catch {
    return {
      ok: false,
      message: "That download didn’t finish. You can try again.",
      canRetry: true,
    };
  }
}

function printDestination(
  title: string,
  body: string,
  printSupported: boolean,
): CrystalDestinationExecutionResult {
  if (!printSupported) {
    return {
      ok: false,
      message: "Printing isn’t available here. Try the PDF crystal instead.",
      canRetry: false,
    };
  }
  if (!body.trim()) {
    return {
      ok: false,
      message: "Bring something we’ve written together, and I can print it from here.",
      canRetry: false,
    };
  }
  if (typeof window === "undefined") {
    return {
      ok: false,
      message: "Printing isn’t available here right now.",
      canRetry: true,
    };
  }
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) {
    return {
      ok: false,
      message: "Allow pop-ups to print, then try again.",
      canRetry: true,
    };
  }
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  w.document.write(
    `<html><head><title>${esc(title || "Content")}</title></head>` +
      `<body><pre style="white-space:pre-wrap;font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65;padding:28px;color:#1f1c19;">${esc(body)}</pre></body></html>`,
  );
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 300);
  return { ok: true, message: "Opening print…" };
}

async function googleCreate(
  kind: "doc" | "sheet" | "form",
  title: string,
  body: string,
): Promise<CrystalDestinationExecutionResult> {
  if (!body.trim()) {
    return {
      ok: false,
      message: "Bring something we’ve written together, and I can send it from here.",
      canRetry: false,
    };
  }
  try {
    const r = await fetch("/api/google/create-doc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Content",
        content: body,
        kind,
      }),
    });
    const j = (await r.json()) as {
      url?: string;
      id?: string;
      error?: string;
      message?: string;
    };
    if (r.status === 401) {
      return {
        ok: false,
        message:
          "Google isn’t connected yet — connect in Settings. Your work stays saved here.",
        openConnections: true,
        canRetry: true,
      };
    }
    if (r.ok && j.url) {
      return {
        ok: true,
        message:
          kind === "sheet"
            ? "Your Google Sheet is ready."
            : kind === "form"
              ? "Your Google Form is ready."
              : "Your Google Doc is ready.",
        openUrl: j.url,
      };
    }
    return {
      ok: false,
      message: "Something got tangled sending that. You can try again.",
      canRetry: true,
    };
  } catch {
    return {
      ok: false,
      message: "Something got tangled sending that. You can try again.",
      canRetry: true,
    };
  }
}

/**
 * Run the crystal’s destination action.
 * Callers should set processing → completed/failed from the result.
 */
export async function executeCrystalDestination(
  input: ExecuteCrystalDestinationInput,
): Promise<CrystalDestinationExecutionResult> {
  const {
    destinationId,
    title,
    body,
    artifactType,
    googleConnected = false,
    googleConfigured = true,
    outlookConnected = false,
    canvaConnected = false,
    printSupported = true,
    canvaDestinationUrl = null,
  } = input;

  switch (destinationId) {
    case "print":
      return printDestination(title, body, printSupported);

    case "pdf":
    case "download":
    case "microsoft-word":
    case "microsoft-excel":
    case "csv":
    case "powerpoint":
    case "markdown":
      return downloadDestination(destinationId, title, body, artifactType);

    case "google-docs":
      if (!googleConfigured) {
        return {
          ok: false,
          message: "Google isn’t available here right now.",
          canRetry: false,
        };
      }
      if (!googleConnected) {
        return {
          ok: false,
          message: "Connect Google Docs in Connections, then try this crystal again.",
          openConnections: true,
          canRetry: true,
        };
      }
      return googleCreate("doc", title, body);

    case "google-sheets":
      if (!googleConfigured || !googleConnected) {
        return {
          ok: false,
          message: "Connect Google Sheets in Connections, then try this crystal again.",
          openConnections: true,
          canRetry: true,
        };
      }
      return googleCreate("sheet", title, body);

    case "google-forms":
      if (!googleConfigured || !googleConnected) {
        return {
          ok: false,
          message: "Connect Google Forms in Connections, then try this crystal again.",
          openConnections: true,
          canRetry: true,
        };
      }
      return googleCreate("form", title, body);

    case "google-calendar":
      if (!googleConfigured || !googleConnected) {
        return {
          ok: false,
          message:
            "Connect Google Calendar in Connections, then try this crystal again.",
          openConnections: true,
          canRetry: true,
        };
      }
      return {
        ok: true,
        message: "Opening your calendar…",
        openEstateCalendar: true,
        openUrl:
          "https://calendar.google.com/calendar/render?action=TEMPLATE" +
          `&text=${encodeURIComponent(title || "Spark work")}` +
          `&details=${encodeURIComponent(body.slice(0, 1500))}`,
      };

    case "outlook-calendar":
      if (!outlookConnected) {
        return {
          ok: false,
          message:
            "Connect Outlook Calendar in Connections, then try this crystal again.",
          openConnections: true,
          canRetry: true,
        };
      }
      return {
        ok: true,
        message: "Opening Outlook Calendar…",
        openEstateCalendar: true,
      };

    case "canva":
      if (!canvaConnected || !canvaDestinationUrl?.trim()) {
        return {
          ok: false,
          message: "Connect Canva in Connections, then try this crystal again.",
          openConnections: true,
          canRetry: true,
        };
      }
      return {
        ok: true,
        message: "Opening Canva…",
        openUrl: canvaDestinationUrl.trim(),
      };

    default:
      return {
        ok: false,
        message: "That destination isn’t available for this work.",
        canRetry: false,
      };
  }
}
