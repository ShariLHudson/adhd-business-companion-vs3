/**
 * Spark Alpha — print, PDF, and Google export from conversation content.
 */

export type ConversationLine = {
  role: "user" | "assistant";
  text: string;
};

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatConversationTranscript(lines: ConversationLine[]): string {
  return lines
    .map((line) => {
      const speaker = line.role === "user" ? "You" : "Shari";
      return `${speaker}:\n${line.text.trim()}`;
    })
    .join("\n\n");
}

export function conversationTitle(lines: ConversationLine[]): string {
  const firstUser = lines.find((line) => line.role === "user")?.text.trim();
  if (firstUser) return firstUser.slice(0, 60);
  return "Conversation";
}

export function printConversation(title: string, text: string): string | null {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return "Allow pop-ups to print.";
  w.document.write(
    `<html><head><title>${escHtml(title)}</title></head>` +
      `<body><pre style="white-space:pre-wrap;font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65;padding:28px;color:#1f1c19;">${escHtml(text)}</pre></body></html>`,
  );
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 300);
  return null;
}

export async function downloadConversationPdf(
  title: string,
  text: string,
): Promise<string | null> {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const safeTitle = title.replace(/[^\w.-]+/g, "-").slice(0, 40) || "conversation";
    const wrapped = doc.splitTextToSize(text, 180);
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 14;
    const lineHeight = 6;

    for (const line of wrapped) {
      if (y > pageHeight - 14) {
        doc.addPage();
        y = 14;
      }
      doc.text(line, 14, y);
      y += lineHeight;
    }

    doc.save(`${safeTitle}.pdf`);
    return null;
  } catch {
    return "Couldn't create the PDF — try print instead.";
  }
}

export type GoogleStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
};

export async function fetchGoogleStatus(): Promise<GoogleStatus> {
  try {
    const res = await fetch("/api/google/status");
    const data = (await res.json()) as GoogleStatus;
    return data;
  } catch {
    return { configured: false, connected: false, email: null };
  }
}

export function googleConnectUrl(returnPath = "/spark-alpha"): string {
  return `/api/google/auth?returnTo=${encodeURIComponent(returnPath)}`;
}

export type GoogleExportResult =
  | { ok: true; url: string }
  | { ok: false; message: string; connect?: boolean };

export async function createGoogleDocFromConversation(
  title: string,
  content: string,
): Promise<GoogleExportResult> {
  if (!content.trim()) {
    return { ok: false, message: "Nothing to export yet — say a little more first." };
  }

  const status = await fetchGoogleStatus();
  if (!status.configured) {
    return {
      ok: false,
      message: "Google isn't set up on this app yet.",
    };
  }
  if (!status.connected) {
    return {
      ok: false,
      message: "Connect Google first — I'll open that for you.",
      connect: true,
    };
  }

  try {
    const res = await fetch("/api/google/create-doc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.slice(0, 120),
        content,
        kind: "doc",
      }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) {
      if (res.status === 401) {
        return {
          ok: false,
          message: "Google isn't connected — connect in Settings first.",
          connect: true,
        };
      }
      return { ok: false, message: data.error ?? "Couldn't create the Google Doc." };
    }
    if (data.url) {
      window.open(data.url, "_blank");
      return { ok: true, url: data.url };
    }
    return { ok: false, message: "Couldn't create the Google Doc." };
  } catch {
    return { ok: false, message: "Couldn't reach Google — try again in a moment." };
  }
}

export function openGoogleCalendarPrefill(title: string, details: string): void {
  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title.slice(0, 120))}` +
    `&details=${encodeURIComponent(details.slice(0, 1500))}`;
  window.open(url, "_blank");
}

export async function saveToGoogleDriveViaDoc(
  title: string,
  content: string,
): Promise<GoogleExportResult> {
  const result = await createGoogleDocFromConversation(title, content);
  if (result.ok) return result;
  return result;
}
