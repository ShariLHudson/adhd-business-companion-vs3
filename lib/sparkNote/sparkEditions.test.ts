import { describe, expect, it } from "vitest";
import {
  SPARK_EDITION_COVERS,
  sparkEditionByNumber,
  sparkEditionByTopic,
} from "./sparkEditions";

describe("Spark edition covers", () => {
  it("stages all 12 editions, numbered 1–12 with zero-padded codes", () => {
    expect(SPARK_EDITION_COVERS).toHaveLength(12);
    expect(SPARK_EDITION_COVERS.map((e) => e.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(sparkEditionByNumber(4)?.code).toBe("004");
    expect(sparkEditionByNumber(12)?.code).toBe("012");
  });

  it("points every cover at a distinct staged /spark-card-images asset", () => {
    const srcs = SPARK_EDITION_COVERS.map((e) => e.imageSrc);
    for (const src of srcs) {
      expect(src).toMatch(/^\/spark-card-images\/[a-z]+\.png$/);
    }
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it("maps edition numbers to the approved titles and topic assets", () => {
    expect(sparkEditionByNumber(2)).toMatchObject({
      title: "People & Stories",
      imageSrc: "/spark-card-images/people.png",
    });
    expect(sparkEditionByNumber(4)).toMatchObject({
      title: "Nature & Places",
      imageSrc: "/spark-card-images/nature.png",
    });
  });

  it("looks up an edition by topic slug, case-insensitively", () => {
    expect(sparkEditionByTopic("Worlds")?.number).toBe(12);
    expect(sparkEditionByTopic("innovations")?.title).toBe("Innovation");
    expect(sparkEditionByTopic("nope")).toBeUndefined();
  });
});
