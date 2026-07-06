"use client";

import type { ExecutiveGraphSessionView } from "@/lib/executiveIntelligenceGraph/types";
import { GRAPH_NODE_KIND_LABELS } from "@/lib/intelligenceGraph";

type GraphExploreViewProps = {
  session: ExecutiveGraphSessionView;
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
};

export function GraphExploreView({ session, onSelectNode, onClose }: GraphExploreViewProps) {
  return (
    <article className="founder-graph__explore">
      <button type="button" className="founder-graph__back" onClick={onClose}>
        ← New search
      </button>

      <header className="founder-graph__header">
        <p className="founder-graph__meta">{session.result.nodes.length} connected nodes</p>
        <h2 className="founder-graph__title">{session.query}</h2>
      </header>

      {session.didntKnowThat.length > 0 ? (
        <section className="founder-graph__idk" aria-labelledby="idk-engine">
          <h3 className="founder-graph__section-title" id="idk-engine">
            I didn&apos;t know that
          </h3>
          <ul className="founder-graph__insight-list">
            {session.didntKnowThat.map((item) => (
              <li key={item.id} className="founder-graph__insight-card">
                <strong>{item.headline}</strong>
                <p className="founder-graph__prose">{item.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {session.discoveryInsights.length > 0 ? (
        <section className="founder-graph__discovery" aria-labelledby="discovery">
          <h3 className="founder-graph__section-title" id="discovery">
            Executive discovery
          </h3>
          <ul className="founder-graph__insight-list">
            {session.discoveryInsights.map((insight) => (
              <li key={insight.id} className="founder-graph__insight-card">
                <span className="founder-graph__insight-kind">{insight.kind.replace(/-/g, " ")}</span>
                <strong>{insight.title}</strong>
                <p className="founder-graph__prose">{insight.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="founder-graph__nodes" aria-labelledby="graph-nodes">
        <h3 className="founder-graph__section-title" id="graph-nodes">
          Connected nodes
        </h3>
        <ul className="founder-graph__node-grid">
          {session.result.nodes.map((node) => {
            const relCount = session.result.relationships.filter(
              (r) => r.fromId === node.id || r.toId === node.id,
            ).length;
            return (
              <li key={node.id}>
                <button
                  type="button"
                  className="founder-graph__node-card"
                  onClick={() => onSelectNode(node.id)}
                >
                  <span className="founder-graph__node-kind">
                    {GRAPH_NODE_KIND_LABELS[node.kind] ?? node.kind}
                  </span>
                  <span className="founder-graph__node-title">{node.title}</span>
                  <span className="founder-graph__node-summary">{node.summary}</span>
                  <span className="founder-graph__node-meta">
                    {relCount} connections · {node.status}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
