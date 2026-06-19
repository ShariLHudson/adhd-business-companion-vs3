import { describe, expect, it } from "vitest";
import {
  buildFormQuestionRequests,
  extractFormQuestions,
  isFormFriendlyContent,
} from "./googleFormContent";

describe("googleFormContent", () => {
  it("extracts questions from intake content", () => {
    const qs = extractFormQuestions(
      "What is your email?\nWhat problem are you solving?\nHow soon do you need help?",
    );
    expect(qs.length).toBe(3);
    expect(isFormFriendlyContent(qs.join("\n"))).toBe(true);
  });

  it("builds batch requests for each question", () => {
    const reqs = buildFormQuestionRequests(["Name?", "Goal?"]);
    expect(reqs).toHaveLength(2);
    expect(reqs[0]).toHaveProperty("createItem");
  });
});
