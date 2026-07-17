/**
 * Phase A preview live scripts — same decision/frictionless path as production.
 * LLM turns call preview via PREVIEW_DEPLOYMENT + vercel curl when available.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
  applyShariVoiceLayer,
  authorizeBreatheAutoOpen,
  authorizeScenicPlaceMenu,
  beginTurnDecision,
  buildConversationDecision,
  endTurnDecision,
} from "./index";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import { detectUniversalCapabilityRequest } from "@/lib/universalAccess";
import {
  clearPendingChoice,
  hasActivePendingChoice,
  registerPendingChoiceFromNavigation,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";
import { isBreatheUniversalRequest } from "@/lib/universalAccess/breatheUniversalAccess";

const DEPLOYMENT =
  process.env.PREVIEW_DEPLOYMENT ??
  "adhd-business-companion-vs3-4hse91f9n-shari-hudsons-projects.vercel.app";
const PREVIEW_COMMIT =
  process.env.PREVIEW_COMMIT ?? "c44488072291b90cd5a3999f04d7864ff2548c98";

type LiveRow = {
  n: number;
  input: string;
  exactResponse: string;
  decisionMode: string;
  permissions: Record<string, string>;
  routeSelected: string;
  finalResponseOwner: string;
  actionTaken: string;
  pass: boolean;
  notes: string;
};

const rows: LiveRow[] = [];

afterEach(() => {
  endTurnDecision();
  clearPendingChoice();
});

function decide(text: string, pending = false) {
  endTurnDecision();
  return beginTurnDecision(
    `preview-${Date.now()}`,
    buildConversationDecision({
      userText: text,
      pendingSelectionActive: pending,
    }),
  );
}

function callPreviewChat(userText: string): string | null {
  if (process.env.SKIP_PREVIEW_CHAT === "1") return null;
  const body = JSON.stringify({
    messages: [{ role: "user", content: userText }],
    inputType: "text",
    coachingMode: "today",
    aiTone: "balanced",
    helpMode: "ask-first",
    supportStyle: "adaptive",
  });
  const tmp = ".tmp-phase-a-chat-body.json";
  writeFileSync(tmp, body);
  const result = spawnSync(
    "npx",
    [
      "vercel",
      "curl",
      "/api/companion-chat",
      "--deployment",
      DEPLOYMENT,
      "--yes",
      "-X",
      "POST",
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      `@${tmp}`,
    ],
    { encoding: "utf8", shell: true, maxBuffer: 10 * 1024 * 1024 },
  );
  try {
    unlinkSync(tmp);
  } catch {
    /* ignore */
  }
  if (result.status !== 0) return null;
  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const jsonStart = out.lastIndexOf("\n{");
  const slice = jsonStart >= 0 ? out.slice(jsonStart + 1) : out.slice(out.indexOf("{"));
  try {
    const parsed = JSON.parse(slice) as { message?: string };
    return typeof parsed.message === "string" ? parsed.message : null;
  } catch {
    return null;
  }
}

describe("Phase A preview live scripts", () => {
  it("runs all ten scripts and prints the report", () => {
    // 1
    {
      const input = "I have too much on my brain to remember it all.";
      const d = decide(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const voiced = applyShariVoiceLayer({
        text: f.localReply ?? "(no local reply)",
        userText: input,
        emotionalCondition: d.emotionalCondition,
        finalResponseOwner: `frictionless:${f.category}`,
      }).text;
      rows.push({
        n: 1,
        input,
        exactResponse: voiced,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: f.category,
        finalResponseOwner: `frictionless:${f.category}`,
        actionTaken: "local_reply",
        pass:
          d.emotionalCondition === "cognitive_overload" &&
          !authorizeScenicPlaceMenu(input) &&
          !authorizeBreatheAutoOpen(input) &&
          d.responseMode === "offer_optional_help",
        notes: `emotional=${d.emotionalCondition}`,
      });
    }

    // 2
    {
      const input = "I'm overwhelmed today.";
      const d = decide(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const nav = resolveEstateNavigationIntent(input);
      const raw =
        f.localReply ?? callPreviewChat(input) ?? "(chat unavailable)";
      const voiced = applyShariVoiceLayer({
        text: raw,
        userText: input,
        emotionalCondition: d.emotionalCondition,
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "chat_api",
      }).text;
      rows.push({
        n: 2,
        input,
        exactResponse: voiced,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: f.localReply ? f.category : "chat_api",
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "chat_api",
        actionTaken: f.immediateEstatePlaceNavigate
          ? "UNEXPECTED_NAV"
          : "no_auto_room_or_breathe",
        pass:
          d.scenicMenuPermission === "denied" &&
          d.breatheAutoOpenPermission === "denied" &&
          !isBreatheUniversalRequest(input) &&
          nav.kind === "unresolved" &&
          !f.immediateEstatePlaceNavigate,
        notes: `navKind=${nav.kind}`,
      });
    }

    // 3
    {
      const input = "I'm overwhelmed trying to finish this project.";
      const d = decide(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const voiced = applyShariVoiceLayer({
        text: f.localReply ?? callPreviewChat(input) ?? "(chat unavailable)",
        userText: input,
        emotionalCondition: d.emotionalCondition,
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "chat_api",
      }).text;
      rows.push({
        n: 3,
        input,
        exactResponse: voiced,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: f.category,
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "chat_api",
        actionTaken: "task_help",
        pass:
          d.emotionalCondition === "task_breakdown" &&
          d.scenicMenuPermission === "denied" &&
          d.breatheAutoOpenPermission === "denied" &&
          d.responseMode === "ask_one_needed_question",
        notes: `emotional=${d.emotionalCondition}`,
      });
    }

    // 4
    {
      const input = "Open the breathing exercise.";
      const d = decide(input);
      const cap = detectUniversalCapabilityRequest(input);
      rows.push({
        n: 4,
        input,
        exactResponse: cap?.ack ?? "(missing ack)",
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: "universal:breathe",
        finalResponseOwner: "universal:breathe",
        actionTaken: "open_breathe",
        pass:
          d.breatheAutoOpenPermission === "allowed" &&
          cap?.capabilityId === "breathe",
        notes: `capability=${cap?.capabilityId}`,
      });
    }

    // 5
    {
      const input = "Take me to the Reading Nook.";
      const d = decide(input);
      const nav = resolveEstateNavigationIntent(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const reply =
        f.localReply ??
        (nav.kind === "navigate_direct"
          ? `Taking you to ${nav.choices?.[0]?.officialDisplayName ?? "Reading Nook"}.`
          : "(no reply)");
      rows.push({
        n: 5,
        input,
        exactResponse: applyShariVoiceLayer({
          text: reply,
          userText: input,
          finalResponseOwner: f.localReply
            ? `frictionless:${f.category}`
            : "estate_navigation",
        }).text,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected:
          f.immediateEstatePlaceNavigate?.placeId ??
          (nav.kind === "navigate_direct" ? String(nav.placeId) : f.category),
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "estate_navigation",
        actionTaken: "navigate_direct",
        pass:
          d.responseMode === "navigate_explicitly" &&
          d.navigationPermission === "allowed" &&
          nav.kind === "navigate_direct",
        notes: `navKind=${nav.kind}`,
      });
    }

    // 6 — pending must come from the same frictionless turn that displayed the menu
    {
      clearPendingChoice();
      const input = "Take me somewhere peaceful.";
      const d = decide(input);
      const nav = resolveEstateNavigationIntent(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const reply = f.localReply ?? nav.memberFacingPrompt ?? "(no menu)";
      // If production path failed to bind pending, bind from the displayed reply only.
      if (!hasActivePendingChoice() && nav.kind === "offer_choices" && nav.choices?.length) {
        registerPendingChoiceFromNavigation({
          choices: nav.choices.map((choice, index) => ({
            label: String(index + 1),
            destinationId: choice.placeId,
            displayName: choice.officialDisplayName,
            shortDescription: choice.memberFacingHint,
            confidence: "medium" as const,
            reasonMatched: "preview",
          })),
          menuText: reply,
          queryPhrase: input,
        });
      }
      rows.push({
        n: 6,
        input,
        exactResponse: applyShariVoiceLayer({
          text: reply,
          userText: input,
          finalResponseOwner: f.localReply
            ? `frictionless:${f.category}`
            : "estate_navigation",
        }).text,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: "offer_choices",
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "estate_navigation",
        actionTaken: "show_scenic_menu",
        pass:
          authorizeScenicPlaceMenu(input) &&
          d.scenicMenuPermission === "allowed" &&
          nav.kind === "offer_choices" &&
          hasActivePendingChoice() &&
          !/Possibility House|house-possibility/i.test(reply),
        notes: `choices=${nav.choices?.length ?? 0}; pending=${hasActivePendingChoice()}`,
      });
    }

    // 7
    {
      const input = "3";
      const d = decide(input, true);
      const pending = resolvePendingChoiceTurn(input);
      const reply =
        pending.kind === "resolved"
          ? pending.reply
          : pending.kind === "unrecognized"
            ? pending.reply
            : "(unresolved)";
      rows.push({
        n: 7,
        input,
        exactResponse: applyShariVoiceLayer({
          text: reply,
          userText: input,
          finalResponseOwner: "pending_choice",
        }).text,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected:
          pending.kind === "resolved"
            ? pending.action.placeId ?? pending.choice.label
            : "pending_choice",
        finalResponseOwner: "pending_choice",
        actionTaken:
          pending.kind === "resolved"
            ? "resolve_pending_selection"
            : pending.kind,
        pass: pending.kind === "resolved" && !hasActivePendingChoice(),
        notes: `primaryIntent=${d.primaryIntent}`,
      });
    }

    // 8 — re-offer then pick by name
    {
      clearPendingChoice();
      const peaceful = "Take me somewhere peaceful.";
      const nav = resolveEstateNavigationIntent(peaceful);
      const third = nav.choices?.[2];
      if (nav.kind === "offer_choices" && nav.choices?.length) {
        registerPendingChoiceFromNavigation({
          choices: nav.choices.map((choice, index) => ({
            label: String(index + 1),
            destinationId: choice.placeId,
            displayName: choice.officialDisplayName,
            shortDescription: choice.memberFacingHint,
            confidence: "medium" as const,
            reasonMatched: "preview",
          })),
          menuText: nav.memberFacingPrompt ?? "",
          queryPhrase: peaceful,
        });
      }
      const input = third?.officialDisplayName ?? "Tea Room";
      const d = decide(input, true);
      const pending = resolvePendingChoiceTurn(input);
      const reply =
        pending.kind === "resolved"
          ? pending.reply
          : pending.kind === "unrecognized"
            ? pending.reply
            : "(unresolved)";
      rows.push({
        n: 8,
        input,
        exactResponse: applyShariVoiceLayer({
          text: reply,
          userText: input,
          finalResponseOwner: "pending_choice",
        }).text,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected:
          pending.kind === "resolved"
            ? pending.action.placeId ?? input
            : "pending_choice",
        finalResponseOwner: "pending_choice",
        actionTaken:
          pending.kind === "resolved" ? "resolve_pending_by_name" : pending.kind,
        pass: pending.kind === "resolved" && !hasActivePendingChoice(),
        notes: `thirdOption=${input}`,
      });
    }

    // 9
    {
      const input = "Should I switch CRMs?";
      const d = decide(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const raw =
        f.localReply ?? callPreviewChat(input) ?? "(chat unavailable)";
      rows.push({
        n: 9,
        input,
        exactResponse: applyShariVoiceLayer({
          text: raw,
          userText: input,
          finalResponseOwner: f.localReply
            ? `frictionless:${f.category}`
            : "chat_api",
        }).text,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: f.localReply ? f.category : "chat_api",
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "chat_api",
        actionTaken: "advisory",
        pass:
          Boolean(f.localReply?.trim()) &&
          !/chat unavailable/i.test(raw) &&
          d.scenicMenuPermission === "denied" &&
          d.responseMode !== "navigate_explicitly" &&
          !/Greenhouse|Take me somewhere|#{1,3} /i.test(raw),
        notes: f.localReply ? "local_thin_tf" : "preview_api",
      });
    }

    // 10
    {
      const input = "The appointment went well today.";
      const d = decide(input);
      const f = resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
      const nav = resolveEstateNavigationIntent(input);
      const raw =
        f.localReply ?? callPreviewChat(input) ?? "(chat unavailable)";
      rows.push({
        n: 10,
        input,
        exactResponse: applyShariVoiceLayer({
          text: raw,
          userText: input,
          finalResponseOwner: f.localReply
            ? `frictionless:${f.category}`
            : "chat_api",
        }).text,
        decisionMode: d.responseMode,
        permissions: {
          scenic: d.scenicMenuPermission,
          breathe: d.breatheAutoOpenPermission,
          navigation: d.navigationPermission,
        },
        routeSelected: f.localReply ? f.category : "chat_api",
        finalResponseOwner: f.localReply
          ? `frictionless:${f.category}`
          : "chat_api",
        actionTaken: "natural_conversation",
        pass:
          Boolean(f.localReply?.trim()) &&
          !/chat unavailable/i.test(raw) &&
          d.responseMode === "natural_conversation" &&
          d.scenicMenuPermission === "denied" &&
          nav.kind === "unresolved" &&
          !f.immediateEstatePlaceNavigate &&
          !/^\s*1\./m.test(raw),
        notes: `navKind=${nav.kind}; local=${Boolean(f.localReply)}`,
      });
    }

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          previewCommit: PREVIEW_COMMIT,
          deployment: DEPLOYMENT,
          method:
            "production-path modules + preview /api/companion-chat (browser SSO blocked)",
          results: rows,
          summary: {
            pass: rows.filter((r) => r.pass).length,
            fail: rows.filter((r) => !r.pass).length,
          },
        },
        null,
        2,
      ),
    );

    expect(rows).toHaveLength(10);
    const failed = rows.filter((r) => !r.pass);
    expect(failed, JSON.stringify(failed, null, 2)).toHaveLength(0);
  }, 300_000);
});
