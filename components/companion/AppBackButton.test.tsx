import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppBackButton } from "@/components/companion/AppBackButton";

describe("AppBackButton", () => {
  it("renders standard back label and arrow", () => {
    const html = renderToStaticMarkup(
      <AppBackButton destination="Clear My Mind" onBack={() => {}} />,
    );
    expect(html).toContain("Back to Clear My Mind");
    expect(html).toContain("←");
    expect(html).toContain('data-testid="app-back-button"');
  });

  it("accepts legacy label prop and tolerates missing destination", () => {
    const html = renderToStaticMarkup(
      <AppBackButton label="Chat" onClick={() => {}} />,
    );
    expect(html).toContain("Back to Chat");
  });

  it("falls back to Back when destination is missing", () => {
    const html = renderToStaticMarkup(<AppBackButton onBack={() => {}} />);
    expect(html).toContain(">Back<");
  });
});
