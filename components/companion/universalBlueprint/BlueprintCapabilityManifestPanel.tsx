"use client";

import { resolveBlueprintCapabilityManifest } from "@/lib/universalBlueprintInterface";

type Props = { blueprintId: string };

export function BlueprintCapabilityManifestPanel({ blueprintId }: Props) {
  const manifest = resolveBlueprintCapabilityManifest(blueprintId);
  const entries = Object.entries(manifest.capabilities) as [
    keyof typeof manifest.capabilities,
    boolean,
  ][];

  return (
    <section
      className="bp-exp-panel"
      data-testid="blueprint-capability-manifest"
      data-work-type={manifest.workTypeId ?? ""}
    >
      <h3 className="bp-exp-title">Capabilities</h3>
      <p className="bp-exp-muted">
        What this Blueprint supports — read from the Work Type, not hard-coded
        rules.
      </p>
      <ul className="bp-cap-list">
        {entries.map(([id, on]) => (
          <li
            key={id}
            data-testid={`capability-${id}`}
            data-enabled={on ? "true" : "false"}
          >
            <span>{manifest.labels[id]}</span>
            <span className="bp-exp-muted">{on ? "Supported" : "Not in this plan"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
