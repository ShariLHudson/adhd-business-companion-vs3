import type { BlueprintDefinition } from "../types";
import {
  countAuthorities,
  resolveSharedObjectManifest,
} from "./seedFromBlueprints";
import { validateSharedObjectManifest } from "./validateManifest";
import {
  SHARED_OBJECT_LIBRARY_CERTIFICATION_ID,
  type SharedObjectCertification,
  type SharedObjectIssue,
} from "./types";

function issue(
  gate: SharedObjectIssue["gate"],
  blocking: boolean,
  title: string,
  detail: string,
  dependencyId?: string,
): SharedObjectIssue {
  return { gate, blocking, title, detail, dependencyId };
}

/**
 * Shared Object Library certification (300).
 * Provisional / unwired → blocked — never silent pass.
 * Also enforces creation-authority honesty (create / prepare / user / elsewhere).
 */
export function certifyBlueprintSharedObjects(
  blueprint: BlueprintDefinition,
): SharedObjectCertification {
  const manifest = resolveSharedObjectManifest(blueprint);
  const issues: SharedObjectIssue[] = [];

  for (const s of validateSharedObjectManifest(manifest)) {
    issues.push(
      issue(
        "canonical_identity",
        true,
        "Manifest structure",
        s.message,
        s.dependencyId,
      ),
    );
  }

  let provisionalCount = 0;
  let connectedCount = 0;
  let blockedCount = 0;

  for (const d of manifest.dependencies) {
    if (d.provisional) provisionalCount += 1;
    if (d.status === "connected" || d.status === "connected_with_limits") {
      connectedCount += 1;
    }
    if (d.status === "blocked" || d.status === "missing" || d.status === "future") {
      blockedCount += 1;
    }
    if (d.status === "duplicate_risk") {
      issues.push(
        issue(
          "canonical_identity",
          true,
          "Duplicate object risk",
          `Dependency “${d.sourceLabel}” risks a non-canonical ${d.objectTypeId}.`,
          d.dependencyId,
        ),
      );
    }

    if (d.provisional || d.status === "blocked") {
      issues.push(
        issue(
          "blueprint_reuse",
          true,
          "Shared object path not certified",
          `${d.objectTypeId} via “${d.sourceLabel}” is provisional/blocked (authority: ${d.creationAuthority}).`,
          d.dependencyId,
        ),
      );
    }

    // Authority honesty: user_provided must not claim fully_create.
    if (
      d.source === "known_context" &&
      d.creationAuthority === "fully_create"
    ) {
      issues.push(
        issue(
          "creation_authority_honesty",
          true,
          "User-provided context claimed as fully create",
          `“${d.sourceLabel}” is known context and must be user_provided, not fully_create.`,
          d.dependencyId,
        ),
      );
    }

    if (
      d.objectTypeId === "payment" &&
      d.creationAuthority === "fully_create"
    ) {
      issues.push(
        issue(
          "creation_authority_honesty",
          true,
          "Payment cannot be fully created by Spark",
          "Payments are completed_elsewhere with sync state — never fabricated.",
          d.dependencyId,
        ),
      );
    }

    if (
      d.objectTypeId === "project" &&
      d.creationAuthority === "fully_create"
    ) {
      issues.push(
        issue(
          "create_project_integrity",
          true,
          "Project must not replace Create content",
          "Projects are execution links (completed_elsewhere / prepare tasks) — Create Artifact remains SoT.",
          d.dependencyId,
        ),
      );
    }
  }

  if (provisionalCount > 0 || blockedCount > 0) {
    const gates: Array<{ gate: SharedObjectIssue["gate"]; title: string }> = [
      { gate: "canonical_identity", title: "Canonical identity not proven" },
      { gate: "relationship_integrity", title: "Relationship integrity not proven" },
      { gate: "context_integrity", title: "Context integrity not proven" },
      { gate: "lifecycle", title: "Lifecycle behavior not proven" },
      { gate: "version_provenance", title: "Version/provenance not proven" },
      { gate: "access_isolation", title: "Access/isolation not proven" },
      {
        gate: "create_project_integrity",
        title: "Create→Project integrity not proven",
      },
      { gate: "reporting", title: "Reporting via metric definitions not proven" },
      { gate: "migration", title: "Duplicate migration not complete" },
      { gate: "integration", title: "External mapping not proven" },
      {
        gate: "performance_usability",
        title: "Performance/usability gate not proven",
      },
      {
        gate: "creation_authority_honesty",
        title: "Create/prepare/user/elsewhere honesty not proven across wires",
      },
    ];
    for (const g of gates) {
      issues.push(
        issue(
          g.gate,
          true,
          g.title,
          "No live Shared Object Library wire certified for this Blueprint yet (295–300).",
        ),
      );
    }
  }

  const blocking = issues.some((i) => i.blocking);
  let result: SharedObjectCertification["result"] = "pass";
  if (provisionalCount > 0 || blockedCount > 0) {
    result = "blocked";
  } else if (blocking) {
    result = "fail";
  } else if (
    manifest.dependencies.some((d) => d.status === "connected_with_limits")
  ) {
    result = "pass_with_declared_limits";
  }

  return {
    certificationId: SHARED_OBJECT_LIBRARY_CERTIFICATION_ID,
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    result,
    issues,
    dependencyCount: manifest.dependencies.length,
    connectedCount,
    blockedCount,
    provisionalCount,
    authorityCounts: countAuthorities(manifest.dependencies),
  };
}
