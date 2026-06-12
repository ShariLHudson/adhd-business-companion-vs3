import { NextRequest, NextResponse } from "next/server";

import { FOUNDER_ADMIN_COOKIE, verifyFounderAdminToken } from "@/lib/founderAdmin";
import { buildFounderGuidanceContext } from "@/lib/founderGuidance/buildContext";
import { parseFounderGuidanceResponse } from "@/lib/founderGuidance/parseResponse";
import { FOUNDER_GUIDANCE_SYSTEM_PROMPT } from "@/lib/founderGuidance/systemPrompt";
import type {
  FounderGuidanceHistoryMessage,
  FounderGuidanceRequest,
  FounderGuidanceWorkspaceSnapshot,
} from "@/lib/founderGuidance/types";
import { sanitizeKind, sanitizeWorkspaceItemInput } from "@/lib/founderWorkspace/sanitize";
import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";

const MAX_MESSAGE = 4_000;
const MAX_HISTORY = 12;

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, max);
}

function sanitizeHistory(raw: unknown): FounderGuidanceHistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_HISTORY)
    .map((entry) => {
      const e = entry as { role?: string; content?: string };
      const role = e.role === "assistant" ? "assistant" : "user";
      const content = cleanText(e.content, MAX_MESSAGE);
      return content ? { role, content } : null;
    })
    .filter((m): m is FounderGuidanceHistoryMessage => m !== null);
}

function sanitizeItems(raw: unknown): FounderWorkspaceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) =>
      sanitizeWorkspaceItemInput(item as Partial<FounderWorkspaceItem>),
    )
    .filter((item): item is FounderWorkspaceItem => item !== null)
    .slice(0, 100);
}

function sanitizeWorkspace(raw: unknown): FounderGuidanceWorkspaceSnapshot {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    projects: sanitizeItems(obj.projects),
    experiments: sanitizeItems(obj.experiments),
    notes: sanitizeItems(obj.notes),
  };
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(FOUNDER_ADMIN_COOKIE)?.value;
  if (!(await verifyFounderAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = body as Partial<FounderGuidanceRequest>;
  const message = cleanText(raw.message, MAX_MESSAGE);
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const workspace = sanitizeWorkspace(raw.workspace);
  const activeTab = cleanText(raw.activeTab, 40) || "project";
  const selectedItem = raw.selectedItem
    ? sanitizeWorkspaceItemInput(raw.selectedItem as Partial<FounderWorkspaceItem>)
    : null;
  const history = sanitizeHistory(raw.history);

  const intelligenceSummary = cleanText(raw.intelligenceSummary, 12_000);
  const trackingSummary = cleanText(raw.trackingSummary, 12_000);
  const briefingSummary = cleanText(raw.briefingSummary, 8_000);
  const productIntelligenceSummary = cleanText(raw.productIntelligenceSummary, 10_000);
  const businessHealthSummary = cleanText(raw.businessHealthSummary, 8_000);
  const analyticsSummary = cleanText(raw.analyticsSummary, 10_000);
  const experimentMetricsSummary = cleanText(raw.experimentMetricsSummary, 12_000);
  const dashboardSummary = cleanText(raw.dashboardSummary, 16_000);

  const contextBlock = buildFounderGuidanceContext({
    workspace,
    activeTab,
    selectedItem,
    intelligenceSummary,
    trackingSummary,
    briefingSummary,
    productIntelligenceSummary,
    businessHealthSummary,
    analyticsSummary,
    experimentMetricsSummary,
    dashboardSummary,
  });

  const openAiMessages = [
    {
      role: "system" as const,
      content: `${FOUNDER_GUIDANCE_SYSTEM_PROMPT}\n\n${contextBlock}`,
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user" as const,
      content: message,
    },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openAiMessages,
        temperature: 0.55,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("founder guidance OpenAI error:", await response.text());
      return NextResponse.json(
        { error: "Could not get guidance right now. Try again." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseFounderGuidanceResponse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("founder guidance error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
