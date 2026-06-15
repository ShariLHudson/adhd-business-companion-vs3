import { describe, expect, it } from "vitest";
import {
  sortByDropdownLabel,
  sortDropdownLabels,
  sortWithPinnedValues,
} from "./dropdownSort";

describe("dropdownSort", () => {
  it("sorts labels alphabetically case-insensitively", () => {
    expect(sortDropdownLabels(["Zebra", "apple", "Mango"])).toEqual([
      "apple",
      "Mango",
      "Zebra",
    ]);
  });

  it("sorts objects by label", () => {
    const items = [{ label: "Offers" }, { label: "Content" }, { label: "Emails" }];
    expect(sortByDropdownLabel(items, (i) => i.label).map((i) => i.label)).toEqual([
      "Content",
      "Emails",
      "Offers",
    ]);
  });

  it("pins values before alphabetical order", () => {
    const opts = [
      { value: "draft", label: "Drafts" },
      { value: "all", label: "All" },
      { value: "saved", label: "Saved" },
    ];
    expect(
      sortWithPinnedValues(opts, (o) => o.value, ["all"], (o) => o.label).map(
        (o) => o.value,
      ),
    ).toEqual(["all", "draft", "saved"]);
  });
});
