"use client";

import { useMemo } from "react";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import { buildDecisionCanvasGraph } from "@/lib/decisionCanvasModel";
import type { VisualThinkingNode } from "@/lib/visualThinkingEngine";
import { VisualCanvasNode, VisualConnector } from "./VisualCanvasNode";

function nodesForSide(
  nodes: VisualThinkingNode[],
  side: "a" | "b",
): VisualThinkingNode[] {
  return nodes.filter((n) => n.side === side && n.kind === "category");
}

export function VisualMindMap({
  session,
}: {
  session: PersistedDecisionCompassSession | null;
}) {
  const graph = useMemo(
    () => buildDecisionCanvasGraph(session),
    [session?.lastTouchedAt, session?.sessionId],
  );

  const decision = graph.nodes.find((n) => n.kind === "decision");
  const optionA = graph.nodes.find((n) => n.id === "option-a");
  const optionB = graph.nodes.find((n) => n.id === "option-b");
  const recommendation = graph.nodes.find((n) => n.kind === "recommendation");
  const catsA = nodesForSide(graph.nodes, "a");
  const catsB = nodesForSide(graph.nodes, "b");

  if (!graph.hasDecision && !graph.hasOptions) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl" aria-hidden>
          🎯
        </p>
        <p className="mt-3 text-base font-medium text-[#6b635a]">
          Your decision map will grow here as you answer questions.
        </p>
      </div>
    );
  }

  return (
    <div
      className="visual-mind-map h-full min-h-0 overflow-y-auto px-3 py-4 sm:px-4"
      role="img"
      aria-label={
        decision
          ? `Decision map: ${decision.title}. Options: ${optionA?.title ?? ""} and ${optionB?.title ?? ""}.`
          : "Decision map"
      }
    >
      {/* Desktop radial */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          {decision ? (
            <VisualCanvasNode node={decision} size="lg" className="max-w-md" />
          ) : null}

          {optionA && optionB ? (
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start gap-4">
              <div className="flex flex-col items-end gap-3">
                <VisualCanvasNode node={optionA} size="md" className="w-full max-w-xs" />
                <VisualConnector tone="option-a" className="h-8 w-24 -scale-x-100" />
                <div className="flex w-full max-w-xs flex-col gap-2">
                  {catsA.map((n) => (
                    <VisualCanvasNode key={n.id} node={n} size="sm" />
                  ))}
                </div>
              </div>
              <div className="w-8" />
              <div className="flex flex-col items-start gap-3">
                <VisualCanvasNode node={optionB} size="md" className="w-full max-w-xs" />
                <VisualConnector tone="option-b" className="h-8 w-24" />
                <div className="flex w-full max-w-xs flex-col gap-2">
                  {catsB.map((n) => (
                    <VisualCanvasNode key={n.id} node={n} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {recommendation ? (
            <div className="w-full max-w-md animate-[fadeIn_0.4s_ease-out]">
              <VisualCanvasNode node={recommendation} size="md" />
              <p className="mt-1 text-center text-xs font-semibold text-amber-800">
                Recommended direction
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile vertical stack */}
      <div className="flex flex-col gap-4 lg:hidden">
        {decision ? <VisualCanvasNode node={decision} size="lg" /> : null}
        {optionA ? (
          <>
            <VisualCanvasNode node={optionA} size="md" />
            <div className="ml-4 flex flex-col gap-2 border-l-4 border-emerald-300 pl-4">
              {catsA.map((n) => (
                <VisualCanvasNode key={n.id} node={n} size="sm" />
              ))}
            </div>
          </>
        ) : null}
        {optionB ? (
          <>
            <VisualCanvasNode node={optionB} size="md" />
            <div className="ml-4 flex flex-col gap-2 border-l-4 border-blue-300 pl-4">
              {catsB.map((n) => (
                <VisualCanvasNode key={n.id} node={n} size="sm" />
              ))}
            </div>
          </>
        ) : null}
        {recommendation ? (
          <VisualCanvasNode node={recommendation} size="md" />
        ) : null}
      </div>

      <ul className="sr-only">
        {graph.nodes.map((n) => (
          <li key={n.id}>
            {n.title}: {n.items.join("; ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
