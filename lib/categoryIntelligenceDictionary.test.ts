import { describe, expect, it } from "vitest";
import { classifyFromDictionary } from "./categoryIntelligenceDictionary";

describe("categoryIntelligenceDictionary", () => {
  it("classifies ultrasound as Health without ambiguity", () => {
    const result = classifyFromDictionary("Schedule ultrasound appointment");
    expect(result).not.toBeNull();
    expect(result!.topic).toBe("Health");
    expect(result!.category).toBe("Health");
  });

  it("classifies newsletter as Business Marketing", () => {
    const result = classifyFromDictionary("Work on newsletter");
    expect(result).not.toBeNull();
    expect(result!.topic).toBe("Business");
    expect(result!.category).toBe("Marketing");
  });

  it("classifies plants as Personal", () => {
    const result = classifyFromDictionary("water my plants");
    expect(result).not.toBeNull();
    expect(result!.topic).toBe("Personal");
    expect(result!.category).toBe("Personal Errands");
  });

  it("classifies call doctor as Health", () => {
    const result = classifyFromDictionary("Call doctor about knee pain");
    expect(result).not.toBeNull();
    expect(result!.topic).toBe("Health");
    expect(result!.category).toBe("Health");
  });

  it("classifies contract as Business Sales", () => {
    const result = classifyFromDictionary("Reply about the contract renewal");
    expect(result).not.toBeNull();
    expect(result!.topic).toBe("Business");
    expect(result!.category).toBe("Sales");
  });

  it("does not classify person-only names (entity layer is PR 4)", () => {
    expect(classifyFromDictionary("Text Marcus")).toBeNull();
    expect(classifyFromDictionary("Call Izna")).toBeNull();
  });

  it("defers mixed narrative sentences without a clear winner", () => {
    expect(
      classifyFromDictionary(
        "I need to call the doctor, but I am nervous about it.",
      ),
    ).toBeNull();
  });

  it("classifies business-heavy multi-clause capture when business wins", () => {
    const result = classifyFromDictionary(
      "work on newsletter, call Izna about marketing stuff",
    );
    expect(result).not.toBeNull();
    expect(result!.topic).toBe("Business");
  });
});
