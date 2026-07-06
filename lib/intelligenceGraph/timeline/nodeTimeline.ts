import type { GraphNode, GraphTimelineEvent, GraphTimelineEventKind } from "../types";
import { intelligenceGraphSampleRepository } from "../repositories/sample";

export function nodeTimeline(nodeId: string): GraphTimelineEvent[] {
  const node = intelligenceGraphSampleRepository.getNode(nodeId);
  return node?.timeline ?? [];
}

export function appendTimelineEvent(
  node: GraphNode,
  kind: GraphTimelineEventKind,
  summary: string,
): GraphTimelineEvent {
  const occurredAt = new Date().toISOString();
  return {
    id: `tl-${node.id}-${node.timeline.length}`,
    nodeId: node.id,
    kind,
    summary,
    occurredAt,
  };
}

export function sortTimeline(events: GraphTimelineEvent[]): GraphTimelineEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export function ecosystemTimeline(limit = 20): GraphTimelineEvent[] {
  const all = intelligenceGraphSampleRepository
    .listNodes()
    .flatMap((n) => n.timeline);
  return sortTimeline(all).slice(0, limit);
}
