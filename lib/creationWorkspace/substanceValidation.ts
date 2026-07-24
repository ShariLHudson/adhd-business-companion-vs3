import type {
  CreationPackage,
  UniversalRequestUnderstanding,
} from "@/lib/universalRequestOutcome";
import type {
  CreationWorkspace,
  CreationWorkspaceSubstanceValidation,
} from "./types";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Validate that a workspace (or package projected into one) is substantive
 * enough to open the standard Creation Workspace UI.
 */
export function validateCreationWorkspaceSubstance(input: {
  workspace?: CreationWorkspace | null;
  creationPackage?: CreationPackage | null;
  understanding?: UniversalRequestUnderstanding | null;
}): CreationWorkspaceSubstanceValidation {
  const pkg = input.creationPackage;
  const ws = input.workspace;
  const u = input.understanding;
  const failures: string[] = [];
  const repair: string[] = [];

  const draftItems =
    ws?.items.filter((i) => i.groupId !== "research" && i.status !== "removed") ??
    [];
  const sections = pkg?.sections ?? [];
  const bodies = draftItems.length
    ? draftItems.map((i) => `${i.title}\n${i.body}`)
    : sections.map((s) => `${s.title}\n${s.content}`);

  const substantiveItemCount = bodies.filter((b) => wordCount(b) >= 12).length;
  const substantiveSectionCount = substantiveItemCount;
  const joined = bodies.join("\n").toLowerCase();
  const title = (ws?.title || pkg?.title || "").toLowerCase();
  const request = (u?.rawRequest || u?.normalizedRequest || "").toLowerCase();

  const primaryOutcomePresent = Boolean(
    (ws?.primaryOutcome || pkg?.desiredOutcome || pkg?.title || "").trim(),
  );
  if (!primaryOutcomePresent) {
    failures.push("Primary outcome missing.");
    repair.push("Regenerate Creation Package with a clear primary deliverable.");
  }

  const requestEchoDetected =
    Boolean(request) &&
    bodies.length > 0 &&
    bodies.every((b) => {
      const trimmed = b.toLowerCase().replace(/\s+/g, " ").trim();
      return (
        trimmed === request ||
        trimmed === `create ${request}` ||
        (trimmed.length < 80 && request.includes(trimmed.slice(0, 40)))
      );
    });
  if (requestEchoDetected) {
    failures.push("Content appears to only restate the request.");
    repair.push("Generate substantive sections instead of echoing the request.");
  }

  const warningOnlyDetected =
    substantiveItemCount === 0 &&
    (/unavailable|warning|could not|failed|status only/i.test(joined) ||
      /research status|current research unavailable/i.test(joined));
  if (warningOnlyDetected) {
    failures.push("Workspace would open warning-only.");
    repair.push("Continue with stable generation or retry package creation.");
  }

  const placeholderOnlyDetected =
    substantiveItemCount > 0 &&
    bodies.every((b) => {
      const withoutPlaceholders = b.replace(/\[[^\]]+\]/g, "").trim();
      return wordCount(withoutPlaceholders) < 8;
    });
  if (placeholderOnlyDetected) {
    failures.push("Content is placeholder-only.");
    repair.push("Generate a substantive draft with localized placeholders.");
  }

  if (substantiveSectionCount < 2 && !u?.createArtifactType?.match(/email|note/i)) {
    failures.push("Fewer than two substantive sections.");
    repair.push("Expand the Creation Package before opening the workspace.");
  }

  let durationPreserved = true;
  let quantityPreserved = true;
  let seriesPreserved = true;
  let deliverablePreserved = true;

  if (u?.creationFamily === "content_plan") {
    const expected =
      u.requestedDuration?.unit === "day" ? u.requestedDuration.value : 5;
    const dayCount = (
      draftItems.length
        ? draftItems.filter((i) => i.type === "timeline_item")
        : sections.filter((s) => s.kind === "day")
    ).length;
    durationPreserved = dayCount >= expected;
    if (!durationPreserved) {
      failures.push(`Expected ${expected} days; found ${dayCount}.`);
      repair.push("Preserve multi-day duration in the Creation Package.");
    }
  }

  if (u?.requestedQuantity && u.requestedQuantity >= 2) {
    const count = Math.max(draftItems.length, sections.length);
    quantityPreserved = count >= Math.min(u.requestedQuantity, 3);
    seriesPreserved = quantityPreserved;
    if (!quantityPreserved) {
      failures.push("Requested multi-item series collapsed.");
      repair.push("Keep the series multi-item in generation.");
    }
  }

  if (u?.createArtifactType && title) {
    const artifact = u.createArtifactType.toLowerCase();
    if (
      /content calendar|content strategy|handbook|program|guide|plan/.test(
        artifact,
      ) &&
      /facebook post|social post/.test(title)
    ) {
      deliverablePreserved = false;
      failures.push("Deliverable over-narrowed to a single post.");
      repair.push("Restore the coordinated deliverable from the request.");
    }
  }

  const emptyRequiredSections =
    u?.creationFamily === "content_plan"
      ? (() => {
          const days = (
            draftItems.length
              ? draftItems.filter((i) => i.type === "timeline_item")
              : sections.filter((s) => s.kind === "day")
          ).filter((d) => {
            const body =
              "body" in d ? (d as { body: string }).body : (d as { content: string }).content;
            return wordCount(body) < 12;
          });
          return days.map((d) => d.title);
        })()
      : [];

  if (emptyRequiredSections.length) {
    failures.push(
      `Empty required sections: ${emptyRequiredSections.join(", ")}`,
    );
    repair.push("Fill empty day/section bodies before opening.");
  }

  return {
    valid: failures.length === 0,
    primaryOutcomePresent,
    substantiveSectionCount,
    substantiveItemCount,
    requestEchoDetected,
    warningOnlyDetected,
    placeholderOnlyDetected,
    emptyRequiredSections,
    durationPreserved,
    quantityPreserved,
    seriesPreserved,
    deliverablePreserved,
    validationFailures: failures,
    repairInstructions: repair,
  };
}
