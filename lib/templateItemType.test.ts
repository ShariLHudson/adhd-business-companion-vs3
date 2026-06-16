import { describe, expect, it } from "vitest";
import { itemTypeFromTemplate } from "./templateItemType";
import type { TemplateItem } from "./companionStore";

function template(partial: Partial<TemplateItem> & Pick<TemplateItem, "title" | "category" | "body">): TemplateItem {
  return {
    id: "t1",
    status: "saved",
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("itemTypeFromTemplate", () => {
  it("maps follow-up email templates to Email", () => {
    expect(
      itemTypeFromTemplate(
        template({
          title: "Gentle follow-up email",
          category: "emails",
          subcategory: "Follow-ups",
          body: "A low-pressure nudge",
        }),
      ),
    ).toBe("Email");
  });

  it("maps workshop titles to Workshop", () => {
    expect(
      itemTypeFromTemplate(
        template({
          title: "Workshop agenda",
          category: "content",
          body: "Day one outline",
        }),
      ),
    ).toBe("Workshop");
  });
});
