/**
 * Convert plain-text drafts into Google Docs API batchUpdate requests.
 * Preserves line breaks; applies heading, bullet, and numbered-list styles.
 */

type DocRequest = Record<string, unknown>;

function lineStyle(line: string): "heading1" | "heading2" | "bullet" | "numbered" | "normal" {
  const t = line.trim();
  if (/^#{1}\s/.test(t)) return "heading1";
  if (/^#{2,3}\s/.test(t)) return "heading2";
  if (/^[-•*]\s/.test(t)) return "bullet";
  if (/^\d+[.)]\s/.test(t)) return "numbered";
  if (t.length > 0 && t.length < 80 && t === t.toUpperCase() && /[A-Z]/.test(t)) {
    return "heading1";
  }
  return "normal";
}

function stripMarkers(line: string): string {
  return line
    .replace(/^#{1,3}\s+/, "")
    .replace(/^[-•*]\s+/, "")
    .replace(/^\d+[.)]\s+/, "");
}

/** Build batchUpdate requests: insert text, then apply paragraph styles. */
export function buildGoogleDocInsertRequests(content: string): DocRequest[] {
  const normalized = content.replace(/\r\n/g, "\n").trimEnd();
  if (!normalized) return [];

  const rawLines = normalized.split("\n");
  const displayLines = rawLines.map(stripMarkers);
  const fullText = `${displayLines.join("\n")}\n`;

  const requests: DocRequest[] = [
    { insertText: { location: { index: 1 }, text: fullText } },
  ];

  let index = 1;
  for (let i = 0; i < rawLines.length; i++) {
    const style = lineStyle(rawLines[i]!);
    const lineText = displayLines[i] ?? "";
    const startIndex = index;
    const endIndex = index + lineText.length;

    if (style === "heading1" && lineText.length > 0) {
      requests.push({
        updateParagraphStyle: {
          range: { startIndex, endIndex },
          paragraphStyle: { namedStyleType: "HEADING_1" },
          fields: "namedStyleType",
        },
      });
    } else if (style === "heading2" && lineText.length > 0) {
      requests.push({
        updateParagraphStyle: {
          range: { startIndex, endIndex },
          paragraphStyle: { namedStyleType: "HEADING_2" },
          fields: "namedStyleType",
        },
      });
    } else if (style === "bullet" && lineText.length > 0) {
      requests.push({
        createParagraphBullets: {
          range: { startIndex, endIndex },
          bulletPreset: "BULLET_DISC_CIRCLE_SQUARE",
        },
      });
    } else if (style === "numbered" && lineText.length > 0) {
      requests.push({
        createParagraphBullets: {
          range: { startIndex, endIndex },
          bulletPreset: "NUMBERED_DECIMAL_NESTED",
        },
      });
    }

    index += lineText.length + 1;
  }

  return requests;
}

export async function applyContentToGoogleDoc(
  accessToken: string,
  fileId: string,
  content: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false, error: "No content to export." };
  }

  const docRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${fileId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!docRes.ok) {
    return { ok: false, error: "Couldn't read the new Google Doc." };
  }

  const doc = await docRes.json();
  const endIndex = doc.body?.content?.at(-1)?.endIndex ?? 2;
  const requests: DocRequest[] = [];
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: endIndex - 1 },
      },
    });
  }
  requests.push(...buildGoogleDocInsertRequests(trimmed));

  const up = await fetch(
    `https://docs.googleapis.com/v1/documents/${fileId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    },
  );
  if (!up.ok) {
    const detail = await up.text();
    console.error("Docs batchUpdate error:", detail);
    return { ok: false, error: "Couldn't insert content into Google Doc." };
  }
  return { ok: true };
}
