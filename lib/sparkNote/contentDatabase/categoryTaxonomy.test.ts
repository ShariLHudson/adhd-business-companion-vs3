import { describe, expect, it } from "vitest";

import {
  SPARK_MASTER_RECOMMENDED_TAGS,
  suggestIdPrefix,
} from "./categoryTaxonomy";

describe("categoryTaxonomy", () => {
  it("suggests ID prefixes per master standard", () => {
    expect(suggestIdPrefix("invention")).toBe("INV");
    expect(suggestIdPrefix("business")).toBe("BIZ");
    expect(suggestIdPrefix("adhd_friendly")).toBe("ADHD");
  });

  it("includes recommended personalization tags", () => {
    expect(SPARK_MASTER_RECOMMENDED_TAGS).toContain("curiosity");
    expect(SPARK_MASTER_RECOMMENDED_TAGS).toContain("entrepreneurship");
  });
});
