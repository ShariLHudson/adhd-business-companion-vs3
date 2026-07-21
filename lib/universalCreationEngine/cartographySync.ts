/**
 * Cartography sync — references canonical Work IDs via Universal Work Engine.
 * Never duplicates master work content into Cartography.
 */

import {
  cartographyRefsForWork,
  listWorkRelationships,
  resolveCanonicalWorkId,
} from "@/lib/universalWorkEngine";
import {
  listAssetRelationshipCards,
  listRelationshipEdges,
} from "@/lib/creationEcosystem";

export function syncCreationToCartography(creationId: string): {
  workId: string;
  nodeRefs: Array<{ kind: string; id: string; opens: string }>;
  edgeCount: number;
  relationships: ReturnType<typeof listWorkRelationships>;
} {
  const workId =
    resolveCanonicalWorkId(creationId, { adoptIfMissing: true }) ?? creationId;
  const uwe = cartographyRefsForWork(workId);
  const cards = listAssetRelationshipCards(creationId);
  const edges = listRelationshipEdges(creationId);
  return {
    workId: uwe.workId,
    nodeRefs: [
      {
        kind: "work",
        id: uwe.workId,
        opens: uwe.workId,
      },
      ...uwe.nodeRefs
        .filter((n) => n.kind !== "work")
        .map((n) => ({
          kind: n.kind,
          id: n.id,
          opens: n.id,
        })),
      ...cards.map((c) => ({
        kind: "asset",
        id: c.assetInstanceKey,
        opens: c.assetInstanceKey,
      })),
    ],
    edgeCount: edges.length + uwe.relationships.length,
    relationships: uwe.relationships,
  };
}
