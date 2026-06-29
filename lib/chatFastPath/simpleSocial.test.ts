import { describe, expect, it } from "vitest";

import {
  isSimpleSocialGreeting,
  simpleSocialGreetingReply,
} from "./simpleSocial";

describe("simpleSocial greeting fast path", () => {
  it("recognizes short greetings", () => {
    expect(isSimpleSocialGreeting("hi")).toBe(true);
    expect(isSimpleSocialGreeting("Hello!")).toBe(true);
    expect(isSimpleSocialGreeting("hey there")).toBe(true);
    expect(isSimpleSocialGreeting("good morning")).toBe(true);
  });

  it("does not treat work intent as a greeting", () => {
    expect(isSimpleSocialGreeting("hi I need help planning my day")).toBe(false);
    expect(isSimpleSocialGreeting("hello can you draft an email")).toBe(false);
  });

  it("returns a warm one-line reply", () => {
    const reply = simpleSocialGreetingReply("hi");
    expect(reply.length).toBeGreaterThan(8);
    expect(reply).not.toMatch(/SHARI|logo|error|failed/i);
  });
});
