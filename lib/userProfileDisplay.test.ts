/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { savePrefs } from "@/lib/companionStore";
import {
  initialsFromDisplayName,
  userProfileDisplayName,
  userProfileGreetingName,
  userProfileImageUrl,
  userProfileInitials,
  userProfileMenuGreeting,
} from "@/lib/userProfileDisplay";

afterEach(() => {
  savePrefs({
    name: "",
    email: "",
    preferredName: "",
    profileImage: "",
  });
});

describe("initialsFromDisplayName", () => {
  it("uses first + last letters and skips middle names", () => {
    expect(initialsFromDisplayName("John Smith")).toBe("JS");
    expect(initialsFromDisplayName("Mary Ann Jones")).toBe("MJ");
    expect(initialsFromDisplayName("Jean-Paul Martin")).toBe("JM");
    expect(initialsFromDisplayName("Maria Gonzalez")).toBe("MG");
  });

  it("uses a single letter for a single name", () => {
    expect(initialsFromDisplayName("Madonna")).toBe("M");
    expect(initialsFromDisplayName("Prince")).toBe("P");
    expect(initialsFromDisplayName("Shari")).toBe("S");
  });

  it("ignores titles and extra whitespace", () => {
    expect(initialsFromDisplayName("  Dr. Emily Brown  ")).toBe("EB");
    expect(initialsFromDisplayName("Mr. John Smith")).toBe("JS");
  });

  it("handles unicode letters", () => {
    expect(initialsFromDisplayName("Émile Zola")).toBe("ÉZ");
    expect(initialsFromDisplayName("Åsa")).toBe("Å");
  });
});

describe("userProfileInitials source priority", () => {
  it("prefers preferredName over legal name", () => {
    savePrefs({
      name: "Robert Anderson",
      preferredName: "Bob",
      email: "robert@example.com",
    });
    expect(userProfileInitials()).toBe("B");
    expect(userProfileGreetingName()).toBe("Bob");
    expect(userProfileDisplayName()).toBe("Bob");
  });

  it("falls back to legal name, then email local-part", () => {
    savePrefs({ name: "John Smith", preferredName: "", email: "" });
    expect(userProfileInitials()).toBe("JS");

    savePrefs({ name: "", preferredName: "", email: "hello@example.com" });
    expect(userProfileInitials()).toBe("H");
  });

  it("supports live preview overrides without hard-coded initials", () => {
    expect(
      userProfileInitials({
        preferredName: "Bob",
        name: "Robert Anderson",
        email: "robert@example.com",
      }),
    ).toBe("B");
    expect(userProfileInitials("John Smith")).toBe("JS");
    expect(userProfileInitials("", "hello@example.com")).toBe("H");
  });

  it("returns empty initials when no identity is available", () => {
    savePrefs({ name: "", preferredName: "", email: "", profileImage: "" });
    expect(userProfileInitials()).toBe("");
  });
});

describe("userProfileImageUrl", () => {
  it("returns the uploaded profile image when present", () => {
    savePrefs({ profileImage: "  https://cdn.example.com/me.jpg  " });
    expect(userProfileImageUrl()).toBe("https://cdn.example.com/me.jpg");
    savePrefs({ profileImage: "" });
    expect(userProfileImageUrl()).toBe(null);
  });
});

describe("userProfileMenuGreeting", () => {
  it("builds a brief ownership greeting from the preferred name", () => {
    savePrefs({ preferredName: "Sarah", name: "Sarah Chen" });
    expect(userProfileMenuGreeting()).toEqual({
      line1: "Welcome back, Sarah.",
      line2: "This is your Spark Estate.",
    });
  });
});
