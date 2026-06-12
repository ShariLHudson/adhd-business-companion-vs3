import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, parseTokens, refreshIfNeeded } from "@/lib/google";

// Create a real Google Doc with the given content and return its URL.
// Uses Drive's multipart upload: text/plain converted to a Google Doc.
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

  const tokens = await refreshIfNeeded(stored);

  const mimeType =
    kind === "sheet"
      ? "application/vnd.google-apps.spreadsheet"
      : "application/vnd.google-apps.document";
  const partType = kind === "sheet" ? "text/csv" : "text/plain";
  const fileTitle =
    kind === "form" && !title.toLowerCase().includes("form")
      ? `Form: ${title}`
      : title;

  const boundary = `spark${Date.now()}`;
  const metadata = { name: fileTitle, mimeType };
  const multipart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${partType}; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  try {
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
      // Token likely expired/invalid — signal the client to reconnect.
      return NextResponse.json(
        { error: "Couldn't create the doc." },
        { status: r.status === 401 ? 401 : 502 },
      );
    }
    const j = await r.json();
    const url =
      kind === "sheet"
        ? `https://docs.google.com/spreadsheets/d/${j.id}/edit`
        : kind === "form"
          ? `https://docs.google.com/document/d/${j.id}/edit`
          : `https://docs.google.com/document/d/${j.id}/edit`;
    const res = NextResponse.json({ url });
    // Persist any refreshed access token.
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
