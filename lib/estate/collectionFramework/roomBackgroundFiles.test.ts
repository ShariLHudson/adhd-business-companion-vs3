import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getEstateCollectionRoom } from "./registry";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";

const BACKGROUNDS_DIR = path.join(
  process.cwd(),
  "public",
  "backgrounds",
);

function backgroundFileExists(urlPath: string): boolean {
  const filename = decodeURIComponent(urlPath.replace(/^\/backgrounds\//, ""));
  return fs.existsSync(path.join(BACKGROUNDS_DIR, filename));
}

describe("collection room photographs on disk", () => {
  it("every collection room background resolves to a file in public/backgrounds", () => {
    for (const roomId of ESTATE_COLLECTION_ROOM_IDS) {
      const room = getEstateCollectionRoom(roomId);
      expect(
        backgroundFileExists(room.backgroundImage),
        `missing file for ${roomId}: ${room.backgroundImage}`,
      ).toBe(true);
    }
  });
});
