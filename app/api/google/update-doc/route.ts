import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, parseTokens, refreshIfNeeded } from "@/lib/google";

/** Replace a Google Doc body with plain text (files created by this app). */
export async function POST(request: NextRequest) {
  const stored = parseTokens(request.cookies.get(G_COOKIE)?.value);
  if (!stored) {
    return NextResponse.json({ error: "Not connected." }, { status: 401 });
  }

  const body = await request.json();
  const fileId = (body.fileId as string)?.trim();
  const content = (body.content as string) ?? "";
  const kind = (body.kind as string) === "sheet" ? "sheet" : "doc";

  if (!fileId) {
    return NextResponse.json({ error: "fileId required." }, { status: 400 });
  }

  const tokens = await refreshIfNeeded(stored);

  try {
    if (kind === "sheet") {
      const r = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A1:Z1000?valueRenderOption=FORMATTED_VALUE`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } },
      );
      if (!r.ok) {
        return NextResponse.json(
          { error: "Couldn't read sheet." },
          { status: r.status === 401 ? 401 : 502 },
        );
      }
      const lines = content.split("\n").map((line) => line.split(/\t|\|/).map((c) => c.trim()));
      const wr = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A1:clear`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!wr.ok) {
        /* clear may fail on empty — continue */
      }
      const ur = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A1?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: lines }),
        },
      );
      if (!ur.ok) {
        const detail = await ur.text();
        console.error("Sheets update error:", detail);
        return NextResponse.json(
          { error: "Couldn't update sheet." },
          { status: ur.status === 401 ? 401 : 502 },
        );
      }
    } else {
      const docRes = await fetch(
        `https://docs.googleapis.com/v1/documents/${fileId}`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } },
      );
      if (!docRes.ok) {
        return NextResponse.json(
          { error: "Couldn't read doc." },
          { status: docRes.status === 401 ? 401 : 502 },
        );
      }
      const doc = await docRes.json();
      const endIndex = doc.body?.content?.at(-1)?.endIndex ?? 2;
      const requests = [
        {
          deleteContentRange: {
            range: { startIndex: 1, endIndex: Math.max(2, endIndex - 1) },
          },
        },
        { insertText: { location: { index: 1 }, text: content } },
      ];
      const up = await fetch(
        `https://docs.googleapis.com/v1/documents/${fileId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        },
      );
      if (!up.ok) {
        const detail = await up.text();
        console.error("Docs update error:", detail);
        return NextResponse.json(
          { error: "Couldn't update doc." },
          { status: up.status === 401 ? 401 : 502 },
        );
      }
    }

    const res = NextResponse.json({ ok: true });
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
    console.error("update-doc error", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
