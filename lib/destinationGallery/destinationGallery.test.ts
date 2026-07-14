import { describe, expect, it } from "vitest";
import {
  DESTINATION_GALLERY_BG,
  DESTINATION_GALLERY_CRYSTALS,
  DESTINATION_GALLERY_PLACE_ID,
  DESTINATION_CRYSTAL_STATUS_META,
  isDestinationGalleryIntent,
} from "./constants";
import { CANONICAL_PLACE_BACKGROUNDS } from "@/lib/estate/estatePlaceMedia";
import { getCanonicalEstatePlaceById } from "@/lib/estate/canonicalEstateRegistry";

describe("Destination Gallery", () => {
  it("keeps crystal IDs unchanged while clarifying display labels", () => {
    expect(DESTINATION_GALLERY_CRYSTALS).toHaveLength(6);
    expect(DESTINATION_GALLERY_CRYSTALS.map((c) => c.id)).toEqual([
      "schedule",
      "write",
      "save",
      "spark-social-media",
      "print",
      "create",
    ]);
    expect(DESTINATION_GALLERY_CRYSTALS.map((c) => c.name)).toEqual([
      "Schedule",
      "Document",
      "Store",
      "Share",
      "Print",
      "Design",
    ]);
  });

  it("preserves purpose, hands, and capability mappings (label-only change)", () => {
    const write = DESTINATION_GALLERY_CRYSTALS.find((c) => c.id === "write");
    const save = DESTINATION_GALLERY_CRYSTALS.find((c) => c.id === "save");
    const create = DESTINATION_GALLERY_CRYSTALS.find((c) => c.id === "create");
    expect(write?.purpose).toBe("Save written content.");
    expect(write?.hands).toEqual(["Google Docs"]);
    expect(save?.hands).toEqual(["Google Drive"]);
    expect(create?.hands).toEqual(["Canva"]);
    expect(create?.capabilities).toEqual(
      expect.arrayContaining(["Create presentations", "Create graphics"]),
    );
    expect(DESTINATION_CRYSTAL_STATUS_META.ready.glyph).toBe("🟢");
    expect(DESTINATION_CRYSTAL_STATUS_META["needs-connection"].glyph).toBe("🟡");
    expect(DESTINATION_CRYSTAL_STATUS_META["recently-used"].glyph).toBe("🔵");
    expect(DESTINATION_CRYSTAL_STATUS_META.favorite.glyph).toBe("⭐");
  });

  it("binds destination-gallery background asset", () => {
    expect(DESTINATION_GALLERY_BG).toMatch(/destination-gallery/);
    expect(
      CANONICAL_PLACE_BACKGROUNDS[DESTINATION_GALLERY_PLACE_ID],
    ).toMatch(/destination-gallery/);
  });

  it("registers canonical place", () => {
    const place = getCanonicalEstatePlaceById("destination-gallery");
    expect(place?.officialName).toMatch(/Destination Gallery/);
    expect(place?.backgroundImage).toMatch(/destination-gallery/);
  });

  it("detects send-work intents", () => {
    expect(isDestinationGalleryIntent("save this")).toBe(true);
    expect(isDestinationGalleryIntent("put this on my calendar")).toBe(true);
    expect(isDestinationGalleryIntent("send this somewhere")).toBe(true);
    expect(isDestinationGalleryIntent("hello there")).toBe(false);
  });

  it("requires approval before social publish", () => {
    const social = DESTINATION_GALLERY_CRYSTALS.find(
      (c) => c.id === "spark-social-media",
    );
    expect(social?.requiresPublishApproval).toBe(true);
  });
});
