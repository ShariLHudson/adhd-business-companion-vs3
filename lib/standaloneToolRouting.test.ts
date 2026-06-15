import { describe, expect, it } from "vitest";
import {
  detectAssistantToolLaunch,
  detectStandaloneToolRequest,
} from "./standaloneToolRouting";

const SAMPLE_DRAFT = `# ElevenLabs SOP

## Purpose
Standardize voice production.

## Steps
1. Draft script
2. Generate voice
3. Export and edit
4. Review and publish

## Checklist
- Script approved
- Audio exported
`;

describe("standaloneToolRouting", () => {
  it("detects breathe requests from chat", () => {
    expect(detectStandaloneToolRequest("let me try the breathing then")?.tool).toBe(
      "breathe",
    );
    expect(detectStandaloneToolRequest("open breathe and reset")?.tool).toBe(
      "breathe",
    );
  });

  it("detects energize as focus audio with motivation-boost category", () => {
    const launch = detectStandaloneToolRequest("I need something to energize me");
    expect(launch?.tool).toBe("focus-audio");
    expect(launch?.focusAudioCategory).toBe("motivation-boost");
  });

  it("detects focus audio requests from chat", () => {
    expect(detectStandaloneToolRequest("can you open focus audio")?.tool).toBe(
      "focus-audio",
    );
    expect(detectStandaloneToolRequest("I need music")?.tool).toBe("focus-audio");
  });

  it("launches when assistant says opening", () => {
    expect(
      detectAssistantToolLaunch(
        "Sure! Opening Breathe & Reset for you now. One moment!",
      )?.tool,
    ).toBe("breathe");
    expect(
      detectAssistantToolLaunch("Music might help. Opening Focus Audio.")?.tool,
    ).toBe("focus-audio");
    expect(
      detectAssistantToolLaunch(
        "Opening Focus Audio — Calm My Brain is ready.",
      )?.focusAudioCategory,
    ).toBe("calm-brain");
  });
});
