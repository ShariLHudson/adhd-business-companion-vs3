import { describe, expect, it } from "vitest";
import {
  PRIMARY_CREATE_ITEMS,
  OTHER_OPTION,
  subtypeOptionsForItem,
  subtypePickerLabel,
} from "./createTypePickers";

describe("createTypePickers", () => {
  it("lists primary items alphabetically with Other last", () => {
    expect(PRIMARY_CREATE_ITEMS[0]).toBe("Blog Post");
    expect(PRIMARY_CREATE_ITEMS.at(-1)).toBe(OTHER_OPTION);
  });

  it("provides newsletter subtypes alphabetically with Other last", () => {
    const options = subtypeOptionsForItem("Newsletter");
    expect(options).toContain("Educational");
    expect(options).toContain("Weekly Tips");
    expect(options.at(-1)).toBe(OTHER_OPTION);
  });

  it("labels subtype picker from item type", () => {
    expect(subtypePickerLabel("SOP")).toBe("What kind of sop?");
  });
});
