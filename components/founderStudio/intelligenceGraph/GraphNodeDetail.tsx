"use client";

import type { ReactNode } from "react";

import type { GraphNodeExecutiveDetail } from "@/lib/executiveIntelligenceGraph/types";
import { GRAPH_NODE_KIND_LABELS, GRAPH_RELATIONSHIP_KIND_LABELS } from "@/lib/intelligenceGraph";

import { ExecutivePanel } from "../executive";

type GraphNodeDetailProps = {
  detail: GraphNodeExecutiveDetail;
  onBack: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function GraphNodeDetail({ detail, onBack }: GraphNodeDetailProps) {
  const { node } = detail;

  return (
    <article className="founder-graph__detail">
      <button type="button" className="founder-graph__back" onClick={onBack}>
        ← Back
      </button>

      <header className="founder-graph__header">
        <p className="founder-graph__meta">
          {GRAPH_NODE_KIND_LABELS[node.kind] ?? node.kind} · {node.status}
        </p>
        <h2 className="founder-graph__title">{node.title}</h2>
        <p className="founder-graph__prose">{node.summary}</p>
      </header>

      <Panel title="Why this matters" defaultOpen>
        <p className="founder-graph__prose"><strong>Why it exists:</strong> {detail.whyItExists}</p>
        <p className="founder-graph__prose"><strong>Why it matters:</strong> {detail.whyItMatters}</p>
        <p className="founder-graph__prose"><strong>What should happen next:</strong> {detail.whatShouldHappenNext}</p>
      </Panel>

      <Panel title="Connections" defaultOpen>
        <p className="founder-graph__subhead">Depends on ({detail.dependsOn.length})</p>
        <ul className="founder-graph__bullets">
          {detail.dependsOn.map((n) => (
            <li key={n.id}>{n.title}</li>
          ))}
        </ul>
        <p className="founder-graph__subhead">Influences ({detail.influences.length})</p>
        <ul className="founder-graph__bullets">
          {detail.influences.map((n) => (
            <li key={n.id}>{n.title}</li>
          ))}
        </ul>
        <p className="founder-graph__subhead">Relationships</p>
        <ul className="founder-graph__rels">
          {detail.relationships.slice(0, 8).map((r) => (
            <li key={r.id}>
              {GRAPH_RELATIONSHIP_KIND_LABELS[r.kind] ?? r.kind} — {r.reason}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Knowledge pathway">
        <ol className="founder-graph__pathway">
          {detail.pathway.map((step) => (
            <li key={step.id}>
              <strong>{step.label}</strong> — {step.summary}
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Opportunities & risks">
        <p className="founder-graph__subhead">Opportunities</p>
        <ul className="founder-graph__bullets">
          {detail.opportunities.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p className="founder-graph__subhead">Risks</p>
        <ul className="founder-graph__bullets">
          {detail.risks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Executive board">
        <ul className="founder-graph__board">
          {detail.boardPerspectives.map((b) => (
            <li key={b.id} className="founder-graph__board-item">
              <strong>{b.label}</strong>
              <p className="founder-graph__prose">{b.whyItMatters}</p>
              <p className="founder-graph__muted">Opportunity: {b.opportunity}</p>
            </li>
          ))}
        </ul>
        <p className="founder-graph__prose"><strong>Summary:</strong> {detail.boardSummary}</p>
      </Panel>
    </article>
  );
}
