"use client";

import { useState } from "react";
import {
  duplicateBlueprint,
  initializeWorkFromBlueprint,
  listBlueprintVersions,
  publishBlueprintVersion,
  buildSparkBlueprintHome,
  getBlueprint,
} from "@/lib/universalWorkEngine";
import { listEstateAwarenessHooks } from "@/lib/universalBlueprintInterface";
import { SparkBlueprintHome } from "@/components/companion/SparkBlueprintHome";
import { BusinessPulsePanel } from "@/components/companion/progressRecognition";
import { BlueprintBuilderMode } from "./BlueprintBuilderMode";
import { BlueprintCapabilityManifestPanel } from "./BlueprintCapabilityManifestPanel";
import { BlueprintCalendarPanel } from "./BlueprintCalendarPanel";
import { BlueprintVisualThinkingPanel } from "./BlueprintVisualThinkingPanel";
import { BlueprintRelationshipExplorer } from "./BlueprintRelationshipExplorer";
import { BlueprintCommandCenter } from "./BlueprintCommandCenter";

type PanelId =
  | "home"
  | "builder"
  | "command"
  | "capabilities"
  | "calendar"
  | "visual"
  | "relationships"
  | "versions"
  | "business_pulse"
  | "estate_hooks";

type Props = {
  blueprintId: string;
  onClose?: () => void;
  onWorkCreated?: (workId: string) => void;
  onNavigate?: (hint: { kind: string; id: string }) => void;
};

/**
 * 106 — Complete Blueprint member experience shell.
 * Progressive disclosure around Home + Builder + connected surfaces.
 */
export function BlueprintExperienceShell({
  blueprintId,
  onClose,
  onWorkCreated,
  onNavigate,
}: Props) {
  const [panel, setPanel] = useState<PanelId>("home");
  const [note, setNote] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  void tick;

  const home = buildSparkBlueprintHome(blueprintId);
  const versions = listBlueprintVersions(blueprintId);

  return (
    <div
      className="bp-experience-shell ubi-root"
      data-testid="blueprint-experience-shell"
      data-blueprint-id={blueprintId}
    >
      <nav
        className="bp-exp-nav"
        aria-label="Blueprint experience"
        data-testid="blueprint-experience-nav"
      >
        {(
          [
            ["home", "Home"],
            ["command", "Command Center"],
            ["builder", "Builder Mode"],
            ["capabilities", "Capabilities"],
            ["calendar", "Calendar"],
            ["visual", "Visual Thinking"],
            ["relationships", "Used By"],
            ["versions", "Versions"],
            ["business_pulse", "Business Pulse"],
            ["estate_hooks", "Estate Hooks"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`bp-exp-nav-btn ${panel === id ? "is-active" : ""}`}
            data-testid={`bp-exp-nav-${id}`}
            aria-current={panel === id ? "page" : undefined}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
        {onClose ? (
          <button
            type="button"
            className="bp-exp-btn"
            data-testid="bp-exp-close"
            onClick={onClose}
          >
            Close
          </button>
        ) : null}
      </nav>

      <div className="bp-exp-quick" data-testid="blueprint-quick-actions">
        <button
          type="button"
          className="bp-exp-btn"
          data-testid="bp-qa-continue"
          onClick={() => setPanel("builder")}
        >
          Continue Editing
        </button>
        <button
          type="button"
          className="bp-exp-btn bp-exp-btn-primary"
          data-testid="bp-qa-create-work"
          onClick={() => {
            const workTypeId = home.workTypeIds[0];
            if (!workTypeId) {
              setNote("Attach a Work Type before creating Work.");
              return;
            }
            try {
              const work = initializeWorkFromBlueprint({
                blueprintId,
                workTypeId,
                version: home.currentVersion,
              });
              setNote(`Started Work ${work.workId}.`);
              onWorkCreated?.(work.workId);
              setTick((n) => n + 1);
            } catch (err) {
              setNote(
                err instanceof Error
                  ? err.message
                  : "I couldn’t start Work from that Blueprint.",
              );
            }
          }}
        >
          Create Work
        </button>
        <button
          type="button"
          className="bp-exp-btn"
          data-testid="bp-qa-duplicate"
          onClick={() => {
            try {
              const bp = getBlueprint(blueprintId);
              if (!bp) throw new Error("Blueprint not found");
              const dup = duplicateBlueprint(blueprintId, {
                newBlueprintId: `${blueprintId}.copy.${Date.now().toString(36)}`,
                title: `${bp.title} (copy)`,
              });
              setNote(`Duplicated as ${dup.blueprintId}.`);
            } catch (err) {
              setNote(
                err instanceof Error
                  ? err.message
                  : "I couldn’t duplicate that Blueprint.",
              );
            }
          }}
        >
          Duplicate
        </button>
        <button
          type="button"
          className="bp-exp-btn"
          data-testid="bp-qa-publish"
          onClick={() => {
            publishBlueprintVersion(blueprintId);
            setNote("Published. Existing Work stays on its version.");
            setTick((n) => n + 1);
          }}
        >
          Publish
        </button>
        <button
          type="button"
          className="bp-exp-btn"
          data-testid="bp-qa-compare"
          onClick={() => setPanel("versions")}
        >
          Compare Versions
        </button>
      </div>

      {panel === "home" ? (
        <SparkBlueprintHome
          blueprintId={blueprintId}
          onWorkCreated={onWorkCreated}
        />
      ) : null}
      {panel === "builder" ? (
        <BlueprintBuilderMode
          blueprintId={blueprintId}
          onChanged={() => setTick((n) => n + 1)}
          onClose={() => setPanel("home")}
        />
      ) : null}
      {panel === "command" ? (
        <BlueprintCommandCenter blueprintId={blueprintId} />
      ) : null}
      {panel === "capabilities" ? (
        <BlueprintCapabilityManifestPanel blueprintId={blueprintId} />
      ) : null}
      {panel === "calendar" ? (
        <BlueprintCalendarPanel
          blueprintId={blueprintId}
          onNavigate={onNavigate}
        />
      ) : null}
      {panel === "visual" ? (
        <BlueprintVisualThinkingPanel
          blueprintId={blueprintId}
          onNavigate={onNavigate}
        />
      ) : null}
      {panel === "relationships" ? (
        <BlueprintRelationshipExplorer
          blueprintId={blueprintId}
          onNavigate={onNavigate}
        />
      ) : null}
      {panel === "versions" ? (
        <section className="bp-exp-panel" data-testid="blueprint-versions">
          <h3 className="bp-exp-title">Version history</h3>
          <p className="bp-exp-muted">
            Current: {home.currentVersion}. Compare by opening another version
            when you migrate intentionally.
          </p>
          <ul>
            {versions.map((v) => (
              <li key={v} data-testid={`bp-version-${v}`}>
                {v}
                {v === home.currentVersion ? " · current" : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {panel === "business_pulse" ? (
        <section className="bp-exp-panel" data-testid="blueprint-business-pulse">
          <h3 className="bp-exp-title">Business Pulse</h3>
          <BusinessPulsePanel
            onOpenGarden={() => onNavigate?.({ kind: "place", id: "gardens" })}
            onOpenHall={() => onNavigate?.({ kind: "place", id: "portfolio" })}
          />
        </section>
      ) : null}
      {panel === "estate_hooks" ? (
        <section className="bp-exp-panel" data-testid="blueprint-estate-hooks">
          <h3 className="bp-exp-title">Estate awareness hooks</h3>
          <p className="bp-exp-muted">
            Recognition surfaces route through progress recognition (101). Round
            Table and Chamber remain contracts only.
          </p>
          <ul>
            {listEstateAwarenessHooks().map((hook) => (
              <li
                key={hook.surfaceId}
                data-testid={`estate-hook-${hook.surfaceId}`}
                data-routing-key={hook.routingKey}
                data-implemented={hook.implementedHere ? "true" : "false"}
              >
                {hook.label}
                <span className="bp-exp-muted">
                  {" "}
                  · {hook.routingKey}
                  {hook.implementedHere ? " · live" : " · contract"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {note ? (
        <p className="bp-exp-status" role="status" data-testid="bp-exp-note">
          {note}
        </p>
      ) : null}
    </div>
  );
}
