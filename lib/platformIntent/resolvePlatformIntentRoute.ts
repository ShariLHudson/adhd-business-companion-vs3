/**
 * 045 — Resolve platform action from intent.
 * Never expose this routing to the member.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import {
  shouldAutoProjectHome,
  shouldOfferVisibleThinking,
} from "./blueprintRegistry";
import {
  classifyPlatformIntent,
  intentLaunchesCreate,
  intentStaysInConversation,
} from "./classifyPlatformIntent";
import type { PlatformIntentRoute } from "./types";

export function resolvePlatformIntentRoute(input: {
  userText: string;
  activeChamberMemberId?: ChamberMemberId | null;
  hasActiveCreation?: boolean;
}): PlatformIntentRoute {
  const classification = classifyPlatformIntent(input.userText);
  const { intent, blueprint, reason } = classification;

  const owner =
    blueprint?.ownerChamberMemberId ??
    input.activeChamberMemberId ??
    null;

  if (intent === "decide") {
    return {
      intent,
      action: "offer_board",
      blueprint: null,
      ownerChamberMemberId: owner,
      autoProjectHome: false,
      offerVisibleThinking: false,
      routingNote: `DECIDE — stay in conversation; Board optional (${reason})`,
    };
  }

  if (intentStaysInConversation(intent)) {
    return {
      intent,
      action: "stay_conversation",
      blueprint: null,
      ownerChamberMemberId: owner,
      autoProjectHome: false,
      offerVisibleThinking: false,
      routingNote: `KNOW — answer in place; no Create/Projects (${reason})`,
    };
  }

  if (intent === "continue" || intent === "improve") {
    return {
      intent,
      action: input.hasActiveCreation ? "resume_create" : "launch_create",
      blueprint,
      ownerChamberMemberId: owner,
      autoProjectHome: shouldAutoProjectHome(blueprint),
      offerVisibleThinking: shouldOfferVisibleThinking(blueprint),
      routingNote: `${intent.toUpperCase()} — resume/open creation (${reason})`,
    };
  }

  // CREATE
  if (!blueprint && reason === "help_figure_out") {
    return {
      intent: "create",
      action: "help_figure_out",
      blueprint: null,
      ownerChamberMemberId: owner,
      autoProjectHome: false,
      offerVisibleThinking: false,
      routingNote: "CREATE — help figure out, then select blueprint",
    };
  }

  if (intentLaunchesCreate(intent) && blueprint) {
    return {
      intent: "create",
      action: "launch_create",
      blueprint,
      ownerChamberMemberId: owner,
      autoProjectHome: shouldAutoProjectHome(blueprint),
      offerVisibleThinking: shouldOfferVisibleThinking(blueprint),
      routingNote: `CREATE — launch ${blueprint.label} via ${owner ?? "Create"} (${reason})`,
    };
  }

  if (intent === "create") {
    return {
      intent: "create",
      action: "help_figure_out",
      blueprint: null,
      ownerChamberMemberId: owner,
      autoProjectHome: false,
      offerVisibleThinking: false,
      routingNote: `CREATE — intent clear but blueprint unclear (${reason})`,
    };
  }

  return {
    intent: "know",
    action: "stay_conversation",
    blueprint: null,
    ownerChamberMemberId: owner,
    autoProjectHome: false,
    offerVisibleThinking: false,
    routingNote: "fallback stay",
  };
}
