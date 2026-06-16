import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, parseTokens, refreshIfNeeded } from "@/lib/google";
import { applyContentToGoogleDoc } from "@/lib/googleDocContent";

/** Create a Google Doc/Sheet with content and return its URL + file id. */
export async function POST(request: NextRequest) {
  const stored = parseTokens(request.cookies.get(G_COOKIE)?.value);
  if (!stored) {
    return NextResponse.json({ error: "Not connected." }, { status: 401 });
  }

  const body = await request.json();
  const title = ((body.title as string) || "Untitled").slice(0, 120);
  const content = (body.content as string) || "";
  const rawKind = (body.kind as string) ?? "doc";
  const kind =
    rawKind === "sheet" ? "sheet" : rawKind === "form" ? "form" : "doc";

  if (!content.trim()) {
    return NextResponse.json(
      { error: "No draft content to export." },
      { status: 400 },
    );
  }

  const tokens = await refreshIfNeeded(stored);

  const fileTitle =
    kind === "form" && !title.toLowerCase().includes("form")
      ? `Form: ${title}`
      : title;

  try {
    let fileId: string;

    if (kind === "doc" || kind === "form") {
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileTitle,
          mimeType: "application/vnd.google-apps.document",
        }),
      });
      if (!createRes.ok) {
        const detail = await createRes.text();
        console.error("Drive create error:", detail);
        return NextResponse.json(
          { error: "Couldn't create the doc." },
          { status: createRes.status === 401 ? 401 : 502 },
        );
      }
      const created = await createRes.json();
      fileId = created.id as string;

      const applied = await applyContentToGoogleDoc(
        tokens.access_token,
        fileId,
        content,
      );
      if (!applied.ok) {
        return NextResponse.json({ error: applied.error }, { status: 502 });
      }
    } else {
      const mimeType = "application/vnd.google-apps.spreadsheet";
      const boundary = `spark${Date.now()}`;
      const metadata = { name: fileTitle, mimeType };
      const multipart =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: text/csv; charset=UTF-8\r\n\r\n` +
        `${content}\r\n` +
        `--${boundary}--`;

      const r = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipart,
        },
      );
      if (!r.ok) {
        const detail = await r.text();
        console.error("Drive create error:", detail);
        return NextResponse.json(
          { error: "Couldn't create the sheet." },
          { status: r.status === 401 ? 401 : 502 },
        );
      }
      const j = await r.json();
      fileId = j.id as string;
    }

    const url =
      kind === "sheet"
        ? `https://docs.google.com/spreadsheets/d/${fileId}/edit`
        : `https://docs.google.com/document/d/${fileId}/edit`;

    const res = NextResponse.json({ url, id: fileId });
    if (tokens.access_token !== stored.access_token) {
      res.cookies.set(G_COOKIE, JSON.stringify(tokens), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 60,
      });
    }
    return res;
  } catch (e) {
    console.error("create-doc error", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
