import { NextRequest, NextResponse } from "next/server";
import { G_COOKIE, parseTokens, refreshIfNeeded } from "@/lib/google";
import {
  applyContentToGoogleDoc,
  createGoogleDocWithContent,
} from "@/lib/googleDocContent";
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
      const created = await createGoogleDocWithContent(
        tokens.access_token,
        title,
        content,
      );
      if (!created.ok) {
        return NextResponse.json(
          { error: created.error },
          { status: created.error.includes("connected") ? 401 : 502 },
        );
      }
      fileId = created.fileId;
      // Best-effort headings/bullets when Google Docs API is enabled; content
      // is already in the file from the Drive upload above.
      await applyContentToGoogleDoc(tokens.access_token, fileId, content);
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
