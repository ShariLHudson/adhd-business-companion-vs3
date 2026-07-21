"use client";

import { useMemo, useState } from "react";
import {
  buildSparkBlueprintHome,
  initializeWorkFromBlueprint,
  publishBlueprintVersion,
  setBlueprintSuggestionDisposition,
  type SparkBlueprintHomeModel,
} from "@/lib/universalWorkEngine";

type Props = {
  blueprintId: string;
  onClose?: () => void;
  onWorkCreated?: (workId: string) => void;
};

function primaryActionLabel(home: SparkBlueprintHomeModel): string {
  switch (home.primaryAction) {
    case "create_work":
      return "Create Work from Blueprint";
    case "publish_version":
      return "Publish new version";
    default:
      return "Continue editing";
  }
}

/**
 * Calm Blueprint Home — primary facts + one primary action.
 * Details stay behind progressive disclosure (100 Phase A).
 */
export function SparkBlueprintHome({
  blueprintId,
  onClose,
  onWorkCreated,
}: Props) {
  const [tick, setTick] = useState(0);
  const [openPanel, setOpenPanel] = useState<
    null | "usage" | "health" | "versions" | "impact"
  >(null);
  const [note, setNote] = useState<string | null>(null);

  const home = useMemo(() => {
    void tick;
    return buildSparkBlueprintHome(blueprintId);
  }, [blueprintId, tick]);

  const refresh = () => setTick((n) => n + 1);

  const runPrimary = () => {
    if (home.primaryAction === "publish_version") {
      publishBlueprintVersion(blueprintId);
      setNote("Published. Existing Work stays on its version.");
      refresh();
      return;
    }
    if (home.primaryAction === "create_work") {
      const workTypeId = home.workTypeIds[0];
      if (!workTypeId) {
        setNote("This blueprint is not attached to a Work Type yet.");
        return;
      }
      try {
        const work = initializeWorkFromBlueprint({
          blueprintId,
          workTypeId,
          version: home.currentVersion,
        });
        setNote(`Started Work ${work.workId} on version ${work.blueprintVersion}.`);
        onWorkCreated?.(work.workId);
        refresh();
      } catch (err) {
        setNote(
          err instanceof Error
            ? err.message
            : "I couldn't start Work from that blueprint just now.",
        );
      }
      return;
    }
    setNote("Keep shaping the structure whenever you're ready.");
  };

  const advisoryFindings = home.health.findings.filter(
    (f) => f.severity !== "ok",
  );

  return (
    <section
      className="rounded-2xl border border-[#d9d0c3] bg-[#faf7f2]/95 px-4 py-4 shadow-sm"
      data-testid="spark-blueprint-home"
      data-blueprint-id={home.blueprintId}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
            Blueprint
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#2f2a24]">
            {home.name}
          </h2>
          {home.purpose ? (
            <p className="mt-1 text-sm leading-relaxed text-[#5c5349]">
              {home.purpose}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[#8a7f72]">
            Version {home.currentVersion} · {home.status}
            {home.lastUpdated
              ? ` · Updated ${new Date(home.lastUpdated).toLocaleDateString()}`
              : ""}
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[#6b635a] underline"
          >
            Close
          </button>
        ) : null}
      </div>

      <button
        type="button"
        data-testid="blueprint-home-primary"
        onClick={runPrimary}
        className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-4 py-3 text-left text-base font-semibold text-white"
      >
        {primaryActionLabel(home)}
      </button>

      <ul className="mt-3 space-y-1 text-sm text-[#5c5349]">
        <li>{home.quietSummary.usedByActiveWorksLabel}</li>
        <li>{home.quietSummary.healthLabel}</li>
        <li>
          {home.quietSummary.linkedProjectsLabel} ·{" "}
          {home.quietSummary.linkedCalendarLabel}
        </li>
      </ul>

      {note ? (
        <p className="mt-3 text-sm text-[#1e4f4f]" data-testid="blueprint-home-note">
          {note}
        </p>
      ) : null}

      <details className="mt-4 rounded-xl border border-[#e7dfd4] bg-white/70 px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold text-[#4b463f]">
          More about this blueprint
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          {(
            [
              ["usage", "Where this is used"],
              ["health", "Blueprint health"],
              ["impact", "If I change this…"],
              ["versions", "Certification"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="rounded-lg border border-[#e0d7cb] px-3 py-2 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
              onClick={() => setOpenPanel((p) => (p === id ? null : id))}
              data-testid={`blueprint-home-open-${id}`}
            >
              {label}
            </button>
          ))}
        </div>
      </details>

      {openPanel === "usage" ? (
        <div
          className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/90 p-3 text-sm text-[#5c5349]"
          data-testid="blueprint-home-usage"
        >
          <p className="font-semibold text-[#2f2a24]">Where this is used</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{home.quietSummary.usedByActiveWorksLabel}</li>
            <li>{home.quietSummary.linkedProjectsLabel}</li>
            <li>{home.quietSummary.linkedCalendarLabel}</li>
            <li>{home.quietSummary.linkedTasksLabel}</li>
            <li>{home.quietSummary.linkedVisualMapsLabel}</li>
            {home.usage.brokenReferences > 0 ? (
              <li>
                {home.usage.brokenReferences} connection
                {home.usage.brokenReferences === 1 ? "" : "s"} need attention
              </li>
            ) : null}
          </ul>
          {home.usage.works.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-[#8a7f72]">
              {home.usage.works.map((w) => (
                <li key={w.workId}>
                  {w.workId} · v{w.blueprintVersion}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {openPanel === "health" ? (
        <div
          className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/90 p-3 text-sm text-[#5c5349]"
          data-testid="blueprint-home-health"
        >
          <p className="font-semibold text-[#2f2a24]">
            Blueprint Health — {home.health.summaryLine}
          </p>
          <ul className="mt-2 space-y-3">
            {home.health.findings
              .filter((f) => f.severity === "ok")
              .slice(0, 4)
              .map((f) => (
                <li key={f.id}>✓ {f.title}</li>
              ))}
            {advisoryFindings.map((f) => (
              <li key={f.id} className="rounded-lg bg-[#faf7f2] p-2">
                <p>
                  {f.severity === "attention" ? "⚠" : "·"} {f.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#7a7064]">
                  {f.why}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#1e4f4f] underline"
                    onClick={() => {
                      setBlueprintSuggestionDisposition({
                        blueprintId,
                        finding: f,
                        status: "accepted",
                      });
                      setNote(
                        "Saved for the next version — nothing changed automatically.",
                      );
                      refresh();
                    }}
                  >
                    Save for next version
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#6b635a] underline"
                    onClick={() => {
                      setBlueprintSuggestionDisposition({
                        blueprintId,
                        finding: f,
                        status: "saved_for_later",
                      });
                      refresh();
                    }}
                  >
                    Save for later
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#6b635a] underline"
                    onClick={() => {
                      setBlueprintSuggestionDisposition({
                        blueprintId,
                        finding: f,
                        status: "dismissed",
                      });
                      refresh();
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {openPanel === "impact" ? (
        <div
          className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/90 p-3 text-sm text-[#5c5349]"
          data-testid="blueprint-home-impact"
        >
          <p className="font-semibold text-[#2f2a24]">If I change this…</p>
          <p className="mt-2 leading-relaxed">{home.impact.memberMessage}</p>
          <p className="mt-2 text-xs text-[#8a7f72]">
            {home.impact.activeWorksUsingBlueprint} active Work ·{" "}
            {home.impact.linkedProjects} Projects ·{" "}
            {home.impact.sectionsWithExternalConnections} sections with
            connections
          </p>
        </div>
      ) : null}

      {openPanel === "versions" ? (
        <div
          className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/90 p-3 text-sm text-[#5c5349]"
          data-testid="blueprint-home-certification"
        >
          <p className="font-semibold text-[#2f2a24]">
            Certification —{" "}
            {home.certification.status === "ready_to_publish"
              ? "Ready to Publish"
              : home.certification.status === "ready_with_suggestions"
                ? "Ready with Suggestions"
                : "Not Ready"}
          </p>
          {home.certification.blockers.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[#8b4513]">
              {home.certification.blockers.map((b) => (
                <li key={b.id}>
                  {b.title}: {b.detail}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">Structure is safe to publish.</p>
          )}
          {home.certification.advisories.slice(0, 3).map((a) => (
            <p key={a.id} className="mt-1 text-xs text-[#7a7064]">
              {a.title}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
