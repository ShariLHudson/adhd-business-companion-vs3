/**
 * @vitest-environment jsdom
 *
 * Ticket 1 — Journal data integrity
 * Ticket 2 — Retrieval robustness before quoting
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  extractHumanReadableJournalText,
  isHumanReadableJournalText,
  isMalformedJournalHtml,
  sanitizeJournalHtmlForStorage,
  sanitizeJournalHtmlWithoutDom,
  scrubJournalQuoteForMember,
} from "./journalHtmlIntegrity";
import {
  getPageBody,
  resetJournalPageStorage,
  savePageBody,
} from "./journalPageStorage";

describe("Ticket 1 — save-time journal HTML integrity", () => {
  beforeEach(() => {
    resetJournalPageStorage();
    window.localStorage.clear();
  });

  it("sanitizes typing / autosave HTML before storage", () => {
    const typed =
      '<p style="font-family: Georgia;">I wrote this today and felt clearer.</p>' +
      "<script>alert(1)</script>";
    const safe = sanitizeJournalHtmlForStorage(typed);
    expect(safe).toMatch(/I wrote this today/i);
    expect(safe).not.toMatch(/<script/i);
    savePageBody("j-integrity", 1, typed);
    const stored = getPageBody("j-integrity", 1);
    expect(stored).not.toMatch(/<script/i);
    expect(stored).toMatch(/I wrote this today/i);
  });

  it("repairs vertical one-character-per-paragraph corruption", () => {
    expect(
      sanitizeJournalHtmlWithoutDom("<p>H</p><p>e</p><p>l</p><p>l</p><p>o</p>"),
    ).toBe("<p>Hello</p>");

    const vertical = "Grateful morning"
      .split("")
      .map((c) => (c === " " ? "<p>&nbsp;</p>" : `<p>${c}</p>`))
      .join("");
    const safe = sanitizeJournalHtmlForStorage(vertical);
    // Storage consolidates one-char blocks; quote path must stay human-readable.
    expect(safe.replace(/\s+/g, "")).toMatch(/Gratefulmorning|Grateful/i);
    expect(safe.match(/<p[\s>]/gi)?.length ?? 99).toBeLessThan(8);
    const quote = extractHumanReadableJournalText(
      "<p>Grateful morning light today.</p>",
      200,
    );
    expect(quote).toBe("Grateful morning light today.");
  });

  it("strips zero-width caret / editor markers on save", () => {
    const withZwsp =
      "<p>Quiet morning thoughts\u200B\u200C\uFEFF about the week ahead.</p>";
    const safe = sanitizeJournalHtmlForStorage(withZwsp);
    expect(safe).not.toMatch(/[\u200B-\u200D\uFEFF]/);
    expect(safe).toMatch(/Quiet morning thoughts/);
  });

  it("sanitizes paste-style style soup without dropping readable prose", () => {
    const pasted = `
      <div style="font-family:'Source Serif 4';font-size:18px;line-height:1.6">
        <span style="text-shadow:none;letter-spacing:0.02em">
          Pasted from another app after a long day of decisions.
        </span>
      </div>
      <style>.x{color:red}</style>
    `;
    const safe = sanitizeJournalHtmlForStorage(pasted);
    expect(safe).not.toMatch(/<style/i);
    expect(safe).toMatch(/Pasted from another app/i);
  });

  it("strips script / iframe from DOM-free sanitize path", () => {
    expect(sanitizeJournalHtmlWithoutDom("<script>x()</script>")).toBe("");
    expect(sanitizeJournalHtmlWithoutDom('<iframe src="x"></iframe>')).toBe(
      "",
    );
  });

  it("heals corrupted bodies on read (resume / edit path)", () => {
    const key = "companion-journal-gazebo-page-bodies-v1";
    localStorage.setItem(
      key,
      JSON.stringify({
        "j-heal": {
          2: '<p>Good words about progress.</p><script>evil()</script>',
        },
      }),
    );
    const healed = getPageBody("j-heal", 2);
    expect(healed).not.toMatch(/<script/i);
    expect(healed).toMatch(/Good words about progress/i);
    const again = JSON.parse(localStorage.getItem(key) ?? "{}") as {
      "j-heal": Record<string, string>;
    };
    expect(again["j-heal"]["2"]).not.toMatch(/<script/i);
  });

  it("keeps editing-friendly rich text while blocking event handlers", () => {
    const edited =
      '<p onclick="steal()">I revised this sentence during editing today.</p>';
    const safe = sanitizeJournalHtmlForStorage(edited);
    expect(safe).not.toMatch(/onclick/i);
    expect(safe).toMatch(/I revised this sentence/i);
  });
});

describe("Ticket 2 — retrieval robustness before quoting", () => {
  it("extracts human-readable text from rich journal HTML", () => {
    const html =
      '<p style="font-family:&quot;Source Serif 4&quot;">I finished the proposal and felt proud.</p>';
    expect(extractHumanReadableJournalText(html)).toBe(
      "I finished the proposal and felt proud.",
    );
  });

  it("rejects malformed fragments and editor artifacts", () => {
    expect(extractHumanReadableJournalText("<p></p>")).toBeNull();
    expect(extractHumanReadableJournalText("asdfghjkl qwrty")).toBeNull();
    expect(
      extractHumanReadableJournalText("font-family: Georgia; font-size: 18px"),
    ).toBeNull();
    expect(
      isHumanReadableJournalText('<span data-jg-styled="1">oops</span>'),
    ).toBe(false);
    expect(
      isMalformedJournalHtml(
        '<p style="font-family:x">ab</p><script>x</script>',
      ),
    ).toBe(true);
  });

  it("scrubJournalQuoteForMember never leaks markup into member-facing text", () => {
    const dirty =
      '<p style="font-family: Georgia; font-size: 18px; text-shadow: none;">' +
      "I kept writing even when it felt hard." +
      "</p>";
    const quote = scrubJournalQuoteForMember(dirty);
    expect(quote).toBe("I kept writing even when it felt hard.");
    expect(quote).not.toMatch(/<p\b|font-family|font-size|text-shadow|data-jg/i);

    expect(scrubJournalQuoteForMember("<script>alert(1)</script>")).toBe("");
    expect(
      scrubJournalQuoteForMember(
        "<p>\u200Ba</p><p>b</p><p>c</p><p>d</p><p>e</p>",
      ),
    ).toBe("");
  });
});
