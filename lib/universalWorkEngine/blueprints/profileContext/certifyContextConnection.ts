import type { BlueprintDefinition } from "../types";
import { resolveProfileContextManifest } from "./seedFromKnownContext";
import { validateProfileContextManifest } from "./validateManifest";
import {
  BLUEPRINT_CONTEXT_CONNECTION_CERTIFICATION_ID,
  type BlueprintContextConnectionCertification,
  type BlueprintContextConnectionIssue,
} from "./types";

function issue(
  gate: BlueprintContextConnectionIssue["gate"],
  blocking: boolean,
  title: string,
  detail: string,
  dependencyId?: string,
): BlueprintContextConnectionIssue {
  return { gate, blocking, title, detail, dependencyId };
}

/**
 * Context Connection certification (278).
 * Provisional / unwired paths → blocked or fail — never silent pass.
 */
export function certifyBlueprintContextConnection(
  blueprint: BlueprintDefinition,
): BlueprintContextConnectionCertification {
  const manifest = resolveProfileContextManifest(blueprint);
  const issues: BlueprintContextConnectionIssue[] = [];

  for (const s of validateProfileContextManifest(manifest)) {
    issues.push(
      issue(
        "canonical_profile_load",
        true,
        "Manifest structure",
        s.message,
        s.dependencyId,
      ),
    );
  }

  let provisionalCount = 0;
  let connectedCount = 0;
  let blockedOrMissingCount = 0;

  for (const d of manifest.dependencies) {
    if (d.provisional) provisionalCount += 1;
    if (d.status === "connected" || d.status === "connected_with_limits") {
      connectedCount += 1;
    }
    if (
      d.status === "blocked" ||
      d.status === "missing" ||
      d.status === "future"
    ) {
      blockedOrMissingCount += 1;
    }

    if (d.provisional || d.status === "blocked") {
      issues.push(
        issue(
          "canonical_profile_load",
          true,
          "Context path not certified",
          `Dependency “${d.knownContextKey}” → ${d.canonicalFieldId} is provisional/blocked.`,
          d.dependencyId,
        ),
      );
    }

    if (d.status === "conflict") {
      issues.push(
        issue(
          "conflict_detection",
          true,
          "Unresolved context conflict",
          `Dependency “${d.knownContextKey}” reports conflict.`,
          d.dependencyId,
        ),
      );
    }

    if (d.status === "stale") {
      issues.push(
        issue(
          "staleness_handling",
          true,
          "Stale context unconfirmed",
          `Dependency “${d.knownContextKey}” is stale and material confirmation is not proven.`,
          d.dependencyId,
        ),
      );
    }
  }

  // Gates 1–15 remain unproven without live Business Estate wiring.
  if (provisionalCount > 0 || blockedOrMissingCount > 0) {
    const gateTitles: Array<{
      gate: BlueprintContextConnectionIssue["gate"];
      title: string;
    }> = [
      { gate: "active_business", title: "Active business not proven" },
      { gate: "prefill", title: "Prefill not proven" },
      {
        gate: "question_suppression",
        title: "Repeat-question suppression not proven",
      },
      { gate: "override_control", title: "Override scoping not proven" },
      {
        gate: "canonical_update_permission",
        title: "Permissioned sync not proven",
      },
      { gate: "provenance", title: "Field provenance not proven" },
      { gate: "exact_resume", title: "Exact resume of context not proven" },
      {
        gate: "chamber_propagation",
        title: "Chamber context envelope not proven",
      },
      {
        gate: "create_project_continuity",
        title: "Create/Project continuity not proven",
      },
      { gate: "isolation", title: "Cross-business isolation not proven" },
    ];
    for (const g of gateTitles) {
      issues.push(
        issue(
          g.gate,
          true,
          g.title,
          "No live Business Estate profile-context wire certified for this Blueprint yet (273–278).",
        ),
      );
    }
  }

  const blocking = issues.some((i) => i.blocking);
  let result: BlueprintContextConnectionCertification["result"] = "pass";
  if (provisionalCount > 0 || blockedOrMissingCount > 0) {
    result = "blocked";
  } else if (blocking) {
    result = "fail";
  } else if (
    manifest.dependencies.some((d) => d.status === "connected_with_limits")
  ) {
    result = "pass_with_declared_limits";
  }

  return {
    certificationId: BLUEPRINT_CONTEXT_CONNECTION_CERTIFICATION_ID,
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    result,
    issues,
    dependencyCount: manifest.dependencies.length,
    connectedCount,
    blockedOrMissingCount,
    provisionalCount,
  };
}
