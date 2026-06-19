import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, parseTokens, refreshIfNeeded } from "@/lib/google";
import { applyContentToGoogleDoc } from "@/lib/googleDocContent";
import {
  createGoogleFormWithQuestions,
  extractFormQuestions,
  formDescriptionFromContent,
  isFormFriendlyContent,
} from "@/lib/googleFormContent";
import { contentToSheetCsv } from "@/lib/googleSheetContent";
import { googleUrlForFile } from "@/lib/googleDriveServer";
import type { GoogleFileKind } from "@/lib/googleWorkspace";

/** Create a Google Doc/Sheet/Form with content and return its URL + file id. */
export async function POST(request: NextRequest) {
  const stored = parseTokens(request.cookies.get(G_COOKIE)?.value);
  if (!stored) {
    return NextResponse.json({ error: "Not connected." }, { status: 401 });
  }

  const body = await request.json();
  const title = ((body.title as string) || "Untitled").slice(0, 120);
  const content = (body.content as string) || "";
  const rawKind = (body.kind as string) ?? "doc";
  const kind: GoogleFileKind =
    rawKind === "sheet" ? "sheet" : rawKind === "form" ? "form" : "doc";
  const forceExport = Boolean(body.forceExport);

  if (!content.trim()) {
    return NextResponse.json(
      { error: "No draft content to export." },
      { status: 400 },
    );
  }

  if (kind === "form" && !forceExport && !isFormFriendlyContent(content)) {
    return NextResponse.json(
      {
        error: "not-form-friendly",
        message: "Would you like me to turn this into form questions first?",
      },
      { status: 422 },
    );
  }

  const tokens = await refreshIfNeeded(stored);

  try {
    let fileId: string;
    let url: string;

    if (kind === "form") {
      const questions = extractFormQuestions(content);
      const description = formDescriptionFromContent(content, title);
      const result = await createGoogleFormWithQuestions(
        tokens.access_token,
        title,
        description,
        questions.length ? questions : [content.split("\n")[0]?.trim() || title],
      );
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
      fileId = result.fileId;
      url = result.url;
    } else if (kind === "sheet") {
      const csv = contentToSheetCsv(content);
      const mimeType = "application/vnd.google-apps.spreadsheet";
      const boundary = `spark${Date.now()}`;
      const metadata = { name: title.slice(0, 120), mimeType };
      const multipart =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: text/csv; charset=UTF-8\r\n\r\n` +
        `${csv}\r\n` +
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
        console.error("Drive sheet create error:", detail);
        return NextResponse.json(
          { error: "Couldn't create the sheet." },
          { status: r.status === 401 ? 401 : 502 },
        );
      }
      const j = await r.json();
      fileId = j.id as string;
      url = googleUrlForFile("sheet", fileId);
    } else {
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
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
      url = googleUrlForFile("doc", fileId);
    }

    const res = NextResponse.json({ url, id: fileId, kind });
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
