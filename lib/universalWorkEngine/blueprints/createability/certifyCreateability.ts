import type { BlueprintDefinition } from "../types";
import { resolveCreateabilityManifest } from "./seedFromDeliverables";
import { validateCreateabilityManifest } from "./validateManifest";
import {
  BLUEPRINT_CREATEABILITY_CERTIFICATION_ID,
  type BlueprintCreateabilityCertification,
  type BlueprintCreateabilityIssue,
} from "./types";

function issue(
  gate: BlueprintCreateabilityIssue["gate"],
  blocking: boolean,
  title: string,
  detail: string,
  outputId?: string,
): BlueprintCreateabilityIssue {
  return { gate, blocking, title, detail, outputId };
}

/**
 * Createability certification (236).
 * Provisional / missing paths → blocked or fail — never silent pass.
 */
export function certifyBlueprintCreateability(
  blueprint: BlueprintDefinition,
): BlueprintCreateabilityCertification {
  const manifest = resolveCreateabilityManifest(blueprint);
  const issues: BlueprintCreateabilityIssue[] = [];

  const structural = validateCreateabilityManifest(manifest);
  for (const s of structural) {
    issues.push(
      issue(
        "promise_integrity",
        true,
        "Manifest structure",
        s.message,
        s.outputId,
      ),
    );
  }

  const deliverableNames = new Set(
    (blueprint.deliverables ?? []).map((d) => d.trim().toLowerCase()),
  );
  for (const name of deliverableNames) {
    if (!name) continue;
    const matched = manifest.outputs.some(
      (o) => o.outputName.trim().toLowerCase() === name,
    );
    if (!matched) {
      issues.push(
        issue(
          "promise_integrity",
          true,
          "Promise missing from manifest",
          `Deliverable “${name}” is not listed in the Createability Manifest.`,
        ),
      );
    }
  }

  let provisionalCount = 0;
  let availableCount = 0;
  let blockedOrFutureCount = 0;

  for (const o of manifest.outputs) {
    if (o.provisional) provisionalCount += 1;
    if (o.status === "available" || o.status === "available_with_limits") {
      availableCount += 1;
    }
    if (o.status === "blocked" || o.status === "future") {
      blockedOrFutureCount += 1;
    }

    if (o.provisional || o.status === "blocked") {
      issues.push(
        issue(
          "creation_path",
          true,
          "No certified creation path",
          `“${o.outputName}” is blocked or provisional under Standard 233.`,
          o.outputId,
        ),
      );
    }

    if (
      o.status === "available" ||
      o.status === "available_with_limits" ||
      o.status === "connected" ||
      o.status === "draft_only"
    ) {
      if (!o.userInputs.length && !o.questions.length) {
        issues.push(
          issue(
            "input_completeness",
            true,
            "Inputs incomplete",
            `“${o.outputName}” needs defined user inputs or questions.`,
            o.outputId,
          ),
        );
      }
      if (!o.capabilityOwner || o.capabilityOwner === "unassigned") {
        issues.push(
          issue(
            "capability_availability",
            true,
            "Capability owner missing",
            `“${o.outputName}” has no accountable capability.`,
            o.outputId,
          ),
        );
      }
      if (!o.editable) {
        issues.push(
          issue(
            "editability",
            true,
            "Not editable",
            `“${o.outputName}” must support revise-without-recreate when creatable.`,
            o.outputId,
          ),
        );
      }
      if (!o.resumable) {
        issues.push(
          issue(
            "exact_resume",
            true,
            "Not resumable",
            `“${o.outputName}” must resume partial work exactly.`,
            o.outputId,
          ),
        );
      }
    }

    if (
      o.creationState === "future" &&
      (o.status === "available" || o.status === "available_with_limits")
    ) {
      issues.push(
        issue(
          "status_honesty",
          true,
          "Future shown as available",
          `“${o.outputName}” is future capability but marked available.`,
          o.outputId,
        ),
      );
    }

    if (
      (o.outputType === "financial_model" ||
        o.outputType === "calculation" ||
        o.outputType === "forecast") &&
      (o.status === "available" || o.status === "available_with_limits") &&
      !o.validationRules.some((r) => /formula|reproduc/i.test(r))
    ) {
      issues.push(
        issue(
          "calculation_integrity",
          true,
          "Calculation integrity undefined",
          `“${o.outputName}” needs reproducible calculation validation rules.`,
          o.outputId,
        ),
      );
    }

    if (
      o.projectHandoff !== "none" &&
      (o.status === "available" || o.status === "available_with_limits") &&
      !o.tests.some((t) => /handoff/i.test(t))
    ) {
      issues.push(
        issue(
          "project_handoff",
          false,
          "Handoff tests missing",
          `“${o.outputName}” claims Project handoff without handoff tests listed.`,
          o.outputId,
        ),
      );
    }

    if (
      o.exportFormats.length > 0 &&
      (o.status === "available" || o.status === "available_with_limits") &&
      !o.tests.some((t) => /export/i.test(t))
    ) {
      issues.push(
        issue(
          "export_integrity",
          false,
          "Export tests missing",
          `“${o.outputName}” claims export without export tests listed.`,
          o.outputId,
        ),
      );
    }
  }

  const blockers = issues.filter((i) => i.blocking);
  let result: BlueprintCreateabilityCertification["result"];
  if (!manifest.outputs.length) {
    result = "blocked";
  } else if (provisionalCount > 0 || blockers.length > 0) {
    result =
      provisionalCount === manifest.outputs.length || availableCount === 0
        ? "blocked"
        : "fail";
  } else if (
    manifest.outputs.some((o) => o.status === "available_with_limits")
  ) {
    result = "pass_with_declared_limits";
  } else {
    result = "pass";
  }

  return {
    certificationId: BLUEPRINT_CREATEABILITY_CERTIFICATION_ID,
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    result,
    issues,
    outputCount: manifest.outputs.length,
    availableCount,
    blockedOrFutureCount,
    provisionalCount,
  };
}
