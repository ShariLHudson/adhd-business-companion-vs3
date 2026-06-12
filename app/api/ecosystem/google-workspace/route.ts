import { NextRequest, NextResponse } from "next/server";

import {
  buildContentFromDraft,
  buildContentFromFounderNote,
  buildContentFromOpportunity,
  executeFounderGoogleAction,
  executeGoogleWorkspaceAutomation,
  GOOGLE_ASSET_SOURCE_TYPES,
  loadAllEcosystemGoogleAssets,
  type GoogleAssetSourceType,
  type GoogleWorkspaceAutomationAction,
  type FounderGoogleWorkspaceAction,
} from "@/lib/ecosystem/googleWorkspaceAutomation";
import { loadContentDrafts } from "@/lib/ecosystem/postcraftDraftStore";
import { G_COOKIE, googleConfigured, parseTokens, refreshIfNeeded } from "@/lib/google";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

const AUTOMATION_ACTIONS = new Set<GoogleWorkspaceAutomationAction>([
  "create_doc",
  "create_sheet",
  "create_form",
  "save_to_drive",
  "update_document",
]);

const FOUNDER_ACTIONS = new Set<FounderGoogleWorkspaceAction>([
  "open_in_google",
  "save_to_drive",
  "create_folder",
  "archive_asset",
]);

async function getGoogleTokens(request: NextRequest) {
  const stored = parseTokens(request.cookies.get(G_COOKIE)?.value);
  if (!stored) return null;
  return refreshIfNeeded(stored);
}

export async function GET(request: NextRequest) {
  const isDashboard = await isGhlDashboardAuthorized(request);
  if (!isDashboard && !parseTokens(request.cookies.get(G_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const assets = await loadAllEcosystemGoogleAssets();
    return NextResponse.json({
      configured: googleConfigured(),
      connected: Boolean(parseTokens(request.cookies.get(G_COOKIE)?.value)),
      assets: assets.filter((a) => a.status === "active"),
    });
  } catch (e) {
    console.error("GET /api/ecosystem/google-workspace", e);
    return NextResponse.json({ error: "Could not load assets." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isDashboard = await isGhlDashboardAuthorized(request);
  const tokens = await getGoogleTokens(request);
  if (!tokens && !isDashboard) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!tokens) {
    return NextResponse.json({ error: "Google not connected." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const founderAction = typeof body.founderAction === "string" ? body.founderAction : "";
  if (FOUNDER_ACTIONS.has(founderAction as FounderGoogleWorkspaceAction)) {
    try {
      const result = await executeFounderGoogleAction({
        tokens,
        action: founderAction as FounderGoogleWorkspaceAction,
        assetId: typeof body.assetId === "string" ? body.assetId : undefined,
        folderName: typeof body.folderName === "string" ? body.folderName : undefined,
        parentFolderId:
          typeof body.parentFolderId === "string" ? body.parentFolderId : undefined,
      });
      return NextResponse.json({ ok: true, ...result });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Action failed." },
        { status: 400 },
      );
    }
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!AUTOMATION_ACTIONS.has(action as GoogleWorkspaceAutomationAction)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  try {
    let payload =
      body.payload && typeof body.payload === "object"
        ? (body.payload as {
            title: string;
            content: string;
            kind: "doc" | "sheet" | "form";
            sourceType: GoogleAssetSourceType;
            sourceId: string;
          })
        : null;

    if (!payload && typeof body.draftId === "string") {
      const draft = (await loadContentDrafts()).find((d) => d.id === body.draftId);
      if (!draft) {
        return NextResponse.json({ error: "Draft not found." }, { status: 404 });
      }
      payload = buildContentFromDraft(draft);
    }

    if (!payload && body.opportunity && typeof body.opportunity === "object") {
      payload = buildContentFromOpportunity(
        body.opportunity as Parameters<typeof buildContentFromOpportunity>[0],
        typeof body.assetType === "string" ? body.assetType : "blog",
      );
    }

    if (!payload && typeof body.noteTitle === "string" && typeof body.noteBody === "string") {
      payload = buildContentFromFounderNote({
        id: typeof body.noteId === "string" ? body.noteId : `note-${Date.now()}`,
        title: body.noteTitle,
        body: body.noteBody,
      });
    }

    if (!payload) {
      return NextResponse.json({ error: "payload or source required." }, { status: 400 });
    }

    if (!GOOGLE_ASSET_SOURCE_TYPES.includes(payload.sourceType)) {
      return NextResponse.json({ error: "Invalid source type." }, { status: 400 });
    }

    const asset = await executeGoogleWorkspaceAutomation({
      tokens,
      action: action as GoogleWorkspaceAutomationAction,
      payload,
      folderId: typeof body.folderId === "string" ? body.folderId : undefined,
      existingFileId:
        typeof body.existingFileId === "string" ? body.existingFileId : undefined,
    });

    const res = NextResponse.json({ ok: true, asset });
    if (tokens.access_token !== parseTokens(request.cookies.get(G_COOKIE)?.value)?.access_token) {
      res.cookies.set(G_COOKIE, JSON.stringify(tokens), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 60,
      });
    }
    return res;
  } catch (e) {
    console.error("POST /api/ecosystem/google-workspace", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Automation failed." },
      { status: 500 },
    );
  }
}
