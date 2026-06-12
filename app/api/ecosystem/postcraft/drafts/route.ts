import { NextRequest, NextResponse } from "next/server";

import { cleanText } from "@/lib/contentFormat";
import {
  ecosystemCountsToProductSignals,
} from "@/lib/ecosystem/ecosystemDashboardSignals";
import {
  generateLiveContentOpportunities,
  toPostCraftLiveExport,
  type LiveContentAssetType,
} from "@/lib/ecosystem/liveContentOpportunityGenerator";
import {
  findAssetInPostCraftExport,
  generatePostCraftDraft,
  type PostCraftDraftInput,
  toPostCraftSyncPayload,
} from "@/lib/ecosystem/postcraftDraftGenerator";
import {
  getContentDraft,
  loadContentDrafts,
  saveContentDraft,
  updateContentDraft,
} from "@/lib/ecosystem/postcraftDraftStore";
import { loadEcosystemSignalCounts } from "@/lib/ecosystem/serverSignalStore";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

async function requireAuth(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

async function buildPostCraftExport() {
  const counts = await loadEcosystemSignalCounts();
  const productSignals = ecosystemCountsToProductSignals(counts);
  const opportunities = generateLiveContentOpportunities({
    counts,
    productSignals,
  });
  return toPostCraftLiveExport(opportunities);
}

async function callOpenAi(prompt: {
  system: string;
  user: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error("Draft generation failed.");
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return cleanText(data.choices?.[0]?.message?.content ?? "");
}

function parseDraftInput(body: Record<string, unknown>): PostCraftDraftInput | null {
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const topicKey = typeof body.topicKey === "string" ? body.topicKey.trim() : "";
  const assetType = body.assetType as LiveContentAssetType;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const angle = typeof body.angle === "string" ? body.angle.trim() : "";
  if (!topic || !topicKey || !assetType || !title || !angle) return null;

  return {
    topic,
    topicKey,
    mentions: typeof body.mentions === "number" ? body.mentions : undefined,
    opportunityScore: Number(body.opportunityScore ?? 0),
    trend:
      body.trend === "up" || body.trend === "down" ? body.trend : "stable",
    whyThisMatters:
      typeof body.whyThisMatters === "string" ? body.whyThisMatters : "",
    assetType,
    assetLabel: typeof body.assetLabel === "string" ? body.assetLabel : assetType,
    title,
    angle,
    sourceSignals: Array.isArray(body.sourceSignals)
      ? (body.sourceSignals as PostCraftDraftInput["sourceSignals"])
      : [],
  };
}

export async function GET(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  const drafts = await loadContentDrafts();
  return NextResponse.json({ drafts, generatedAt: new Date().toISOString() });
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "generate";

  if (action === "send_to_postcraft") {
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "Draft id required." }, { status: 400 });
    }
    const draft = await updateContentDraft(id, {
      status: "approved",
      postCraftSyncReady: true,
    });
    if (!draft) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }
    return NextResponse.json({
      draft,
      postCraftPayload: toPostCraftSyncPayload(draft),
    });
  }

  let input: PostCraftDraftInput | null = parseDraftInput(body);

  if (!input && body.topicKey && body.assetType) {
    const exportData = await buildPostCraftExport();
    input = findAssetInPostCraftExport(
      exportData,
      String(body.topicKey),
      body.assetType as LiveContentAssetType,
    );
  }

  if (!input) {
    return NextResponse.json(
      { error: "Invalid opportunity or asset selection." },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await generatePostCraftDraft(input, {
      callLlm: process.env.OPENAI_API_KEY ? callOpenAi : undefined,
    });
  } catch (e) {
    console.error("POST /api/ecosystem/postcraft/drafts generate", e);
    result = await generatePostCraftDraft(input);
  }

  const saved = await saveContentDraft(result.draft);
  return NextResponse.json({
    draft: saved,
    usedLlm: result.usedLlm,
    postCraftSyncReady: saved.postCraftSyncReady,
  });
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Draft id required." }, { status: 400 });
  }

  const existing = await getContentDraft(id);
  if (!existing) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  const patch: Parameters<typeof updateContentDraft>[1] = {};
  if (typeof body.body === "string") patch.body = body.body;
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.angle === "string") patch.angle = body.angle;
  if (typeof body.status === "string") {
    patch.status = body.status as typeof existing.status;
  }
  if (body.action === "approve") {
    patch.status = "approved";
    patch.postCraftSyncReady = true;
  }

  const updated = await updateContentDraft(id, patch);
  return NextResponse.json({
    draft: updated,
    postCraftPayload: updated ? toPostCraftSyncPayload(updated) : null,
  });
}
