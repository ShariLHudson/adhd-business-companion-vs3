import { describe, expect, it } from "vitest";

import { getUiString } from "@/lib/companionI18n";
import {
  buildResponseLanguageHint,
  effectiveOutputLanguage,
  getOutputLanguageContext,
  isRtlLanguage,
  SORTED_LANGUAGE_OPTIONS,
  speechLocaleForLanguage,
  withUnifiedAppLanguage,
} from "@/lib/companionLanguage";

describe("companionLanguage", () => {
  it("activates all listed languages for output", () => {
    expect(effectiveOutputLanguage("es")).toBe("es");
    expect(effectiveOutputLanguage("ur")).toBe("ur");
    expect(effectiveOutputLanguage("tl")).toBe("tl");
    expect(effectiveOutputLanguage("fr")).toBe("fr");
    expect(effectiveOutputLanguage("ja")).toBe("ja");
    expect(effectiveOutputLanguage("xx" as "en")).toBe("en");
  });

  it("passes response language into chat hints", () => {
    const es = getOutputLanguageContext({
      responseLanguage: "es",
      contentLanguage: "es",
    });
    expect(es.responseLanguageHint).toMatch(/Spanish/);
    expect(es.contentLanguageHint).toMatch(/Spanish/);
  });

  it("unifies app language fields", () => {
    expect(withUnifiedAppLanguage("ur")).toEqual({
      interfaceLanguage: "ur",
      responseLanguage: "ur",
      contentLanguage: "ur",
      voiceLanguage: "ur",
    });
  });

  it("maps Roman Urdu speech locale and keeps it LTR", () => {
    expect(isRtlLanguage("ur")).toBe(false);
    expect(isRtlLanguage("es")).toBe(false);
    expect(speechLocaleForLanguage("ur")).toBe("ur-PK");
    expect(speechLocaleForLanguage("tl")).toBe("fil-PH");
  });

  it("lists Roman Urdu in language options", () => {
    expect(
      SORTED_LANGUAGE_OPTIONS.some((o) => o.code === "ur" && o.label === "Roman Urdu"),
    ).toBe(true);
  });

  it("falls back UI strings to English when no translation pack exists", () => {
    expect(getUiString("auth.signIn", "fr")).toBe("Sign in");
    expect(buildResponseLanguageHint("fr")).toMatch(/French/);
  });
});
