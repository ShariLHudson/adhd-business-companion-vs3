import { describe, expect, it } from "vitest";

import {
  SPARK_MASTER_RECOMMENDED_TAGS,
  suggestIdPrefix,
} from "./categoryTaxonomy";

describe("categoryTaxonomy", () => {
  it("suggests ID prefixes per master standard", () => {
    expect(suggestIdPrefix("001")).toBe("DISC");
    expect(suggestIdPrefix("010")).toBe("BUSI");
    expect(suggestIdPrefix("011")).toBe("INNO");
  });

  it("includes recommended personalization tags", () => {
    expect(SPARK_MASTER_RECOMMENDED_TAGS).toContain("curiosity");
    expect(SPARK_MASTER_RECOMMENDED_TAGS).toContain("entrepreneurship");
  });
});
