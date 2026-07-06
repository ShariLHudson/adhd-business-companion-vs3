"use client";

import type {
  StrategyDecisionStatus,
  StrategyDecisionSummary,
} from "@/lib/founder/strategyCenter/types";

type DecisionSummaryPanelProps = {
  decision: StrategyDecisionSummary;
  onChange: (decision: StrategyDecisionSummary) => void;
  onSave: () => void;
  onArchive: () => void;
};

const STATUS_OPTIONS: { value: StrategyDecisionStatus; label: string }[] = [
  { value: "exploring", label: "Exploring" },
  { value: "weighing", label: "Weighing" },
  { value: "nearly-ready", label: "Nearly Ready" },
  { value: "decided", label: "Decided" },
  { value: "parked", label: "Parked" },
];

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="strategy-decision__list-block">
      <p className="strategy-decision__list-label">{label}</p>
      <ul className="strategy-decision__list">
        {items.map((item, index) => (
          <li key={`${label}-${index}`}>
            <input
              className="strategy-decision__list-input"
              value={item}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                onChange(next);
              }}
              aria-label={`${label} item ${index + 1}`}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="strategy-decision__list-add"
        onClick={() => onChange([...items, ""])}
      >
        Add {label.toLowerCase().replace(/s$/, "")}
      </button>
    </div>
  );
}

export function DecisionSummaryPanel({
  decision,
  onChange,
  onSave,
  onArchive,
}: DecisionSummaryPanelProps) {
  return (
    <section className="strategy-decision" aria-labelledby="strategy-decision-heading">
      <p className="strategy-zone__eyebrow" id="strategy-decision-heading">
        Decision Summary
      </p>

      <label className="strategy-decision__field">
        <span>Current Decision</span>
        <textarea
          value={decision.currentDecision}
          onChange={(event) =>
            onChange({ ...decision, currentDecision: event.target.value })
          }
          rows={3}
        />
      </label>

      <ListEditor
        label="Pros"
        items={decision.pros}
        onChange={(pros) => onChange({ ...decision, pros })}
      />
      <ListEditor
        label="Concerns"
        items={decision.concerns}
        onChange={(concerns) => onChange({ ...decision, concerns })}
      />
      <ListEditor
        label="Unknowns"
        items={decision.unknowns}
        onChange={(unknowns) => onChange({ ...decision, unknowns })}
      />

      <label className="strategy-decision__field">
        <span>Recommended Next Step</span>
        <textarea
          value={decision.recommendedNextStep}
          onChange={(event) =>
            onChange({ ...decision, recommendedNextStep: event.target.value })
          }
          rows={2}
        />
      </label>

      <label className="strategy-decision__status">
        <span>Decision Status</span>
        <select
          value={decision.status}
          onChange={(event) =>
            onChange({
              ...decision,
              status: event.target.value as StrategyDecisionStatus,
            })
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="strategy-decision__actions">
        <button type="button" className="strategy-decision__save" onClick={onSave}>
          Save Decision
        </button>
        <button type="button" className="strategy-decision__archive" onClick={onArchive}>
          Archive
        </button>
      </div>
    </section>
  );
}
