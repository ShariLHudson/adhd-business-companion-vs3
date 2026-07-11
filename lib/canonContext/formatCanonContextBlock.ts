import type { CanonRetrievalResult } from "./types";

const CANON_HEADER = `CANON_CONTEXT (authoritative — use before general knowledge):
`;

export function formatCanonContextBlock(result: CanonRetrievalResult): string {
  const { payload, topics } = result;
  const body = JSON.stringify(
    {
      estate: {
        facts: payload.estate.facts,
        rooms: payload.estate.rooms,
        liveRooms: payload.estate.liveRooms,
        history: payload.estate.history,
        philosophy: payload.estate.philosophy,
      },
      characters: {
        kinsey: payload.characters.kinsey,
        shari: payload.characters.shari,
      },
      matchedTopics: topics,
      retrievalNotes: payload.retrievalNotes,
    },
    null,
    2,
  );

  return `${CANON_HEADER}${body}`;
}
