import { describe, expect, it } from "vitest";
import {
  inferProjectAssetFileKind,
  isAcceptedProjectAssetFile,
} from "./projectAssets";
import { inferProjectLinkKind, defaultProjectLinkLabel } from "./projectLinks";

describe("projectAssets", () => {
  it("accepts common project file types", () => {
    expect(
      isAcceptedProjectAssetFile({
        name: "brief.pdf",
        type: "application/pdf",
        size: 1024,
      } as File),
    ).toBe(true);
    expect(
      isAcceptedProjectAssetFile({
        name: "notes.txt",
        type: "text/plain",
        size: 50,
      } as File),
    ).toBe(true);
    expect(
      isAcceptedProjectAssetFile({
        name: "big.zip",
        type: "application/zip",
        size: 50,
      } as File),
    ).toBe(false);
  });

  it("infers file kinds from extension", () => {
    expect(inferProjectAssetFileKind("deck.pptx", "")).toBe("pptx");
    expect(inferProjectAssetFileKind("photo.png", "image/png")).toBe("image");
  });
});

describe("projectLinks kinds", () => {
  it("detects youtube and drive links", () => {
    expect(
      inferProjectLinkKind("https://www.youtube.com/watch?v=abc"),
    ).toBe("youtube");
    expect(
      inferProjectLinkKind("https://docs.google.com/document/d/abc/edit"),
    ).toBe("google-doc");
    expect(
      defaultProjectLinkLabel(
        "https://loom.com/share/abc",
        inferProjectLinkKind("https://loom.com/share/abc"),
      ),
    ).toBe("Loom recording");
  });
});
