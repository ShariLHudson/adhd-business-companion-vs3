import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppBackButton } from "@/components/companion/AppBackButton";

describe("AppBackButton", () => {
  it("renders standard back label and arrow", () => {
    const html = renderToStaticMarkup(
      <AppBackButton destination="Clear My Mind™" onBack={() => {}} />,
    );
    expect(html).toContain("Back to Clear My Mind™");
    expect(html).toContain("←");
    expect(html).toContain('data-testid="app-back-button"');
  });
});
