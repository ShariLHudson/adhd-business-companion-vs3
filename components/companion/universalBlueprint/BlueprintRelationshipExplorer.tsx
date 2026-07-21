"use client";

import { buildRelationshipExplorer } from "@/lib/universalBlueprintInterface";

type Props = {
  blueprintId: string;
  onNavigate?: (hint: { kind: string; id: string }) => void;
};

const BUCKET_LABELS: Record<string, string> = {
  projects: "Projects",
  works: "Works",
  calendar: "Calendar",
  tasks: "Tasks",
  goals: "Goals",
  visual_maps: "Visual Maps",
  research: "Research",
  files: "Files",
  people: "People",
  evidence: "Evidence",
};

export function BlueprintRelationshipExplorer({
  blueprintId,
  onNavigate,
}: Props) {
  const model = buildRelationshipExplorer(blueprintId);

  return (
    <section
      className="bp-exp-panel"
      data-testid="blueprint-relationship-explorer"
    >
      <h3 className="bp-exp-title">{model.title}</h3>
      <p className="bp-exp-muted">
        Click a connection to go there. Identities stay on the Work — no
        duplicates.
      </p>
      {(Object.keys(BUCKET_LABELS) as (keyof typeof model.buckets)[]).map(
        (bucket) => {
          const items = model.buckets[bucket];
          if (!items.length) return null;
          return (
            <div key={bucket} data-testid={`rel-bucket-${bucket}`}>
              <h4 className="bp-exp-subtitle">{BUCKET_LABELS[bucket]}</h4>
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="bp-exp-btn bp-exp-btn-ghost"
                      data-testid={`rel-item-${item.id}`}
                      onClick={() => onNavigate?.(item.navigateHint)}
                    >
                      {item.label}
                      <span className="bp-exp-muted"> · {item.relationship}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        },
      )}
      {model.items.length === 0 ? (
        <p className="bp-exp-muted" data-testid="rel-empty">
          Nothing uses this Blueprint yet. Create Work or link a Project when
          you are ready.
        </p>
      ) : null}
    </section>
  );
}
