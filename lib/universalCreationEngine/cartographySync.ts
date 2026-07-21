/**
 * 051 Phase 5 stub — Cartography sync via Relationship Registry (049).
 */

import {
  listAssetRelationshipCards,
  listRelationshipEdges,
} from "@/lib/creationEcosystem";

export function syncCreationToCartography(creationId: string): {
  nodeRefs: Array<{ kind: string; id: string; opens: string }>;
  edgeCount: number;
} {
  const cards = listAssetRelationshipCards(creationId);
  const edges = listRelationshipEdges(creationId);
  return {
    nodeRefs: [
      {
        kind: "creation",
        id: creationId,
        opens: creationId,
      },
      ...cards.map((c) => ({
        kind: "asset",
        id: c.assetInstanceKey,
        opens: c.assetInstanceKey,
      })),
    ],
    edgeCount: edges.length,
  };
}
