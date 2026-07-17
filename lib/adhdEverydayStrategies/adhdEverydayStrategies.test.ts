import { describe, expect, it } from "vitest";
import {
  ADHD_EVERYDAY_STRATEGIES,
  adhdStrategyHintForChat,
  classifyAdhdStrategyFriction,
  resolveAdhdStrategyCandidates,
} from "./index";

describe("ADHD Everyday Strategies library", () => {
  it("catalogs 360 strategies across all thirty-six bundles", () => {
    expect(ADHD_EVERYDAY_STRATEGIES).toHaveLength(360);
    const bundles = [
      "activation",
      "overwhelm",
      "memory_time",
      "emotion_burnout",
      "hyperfocus_transitions",
      "decision_making",
      "planning_follow_through",
      "returning_after_absence",
      "emotional_safety",
      "environment_sensory",
      "communication_relationships",
      "boring_tasks_motivation",
      "time_awareness",
      "decision_paralysis",
      "working_memory",
      "emotional_awareness",
      "procrastination",
      "perfectionism",
      "motivation_momentum",
      "organization_clutter",
      "routines_habits",
      "paperwork_admin",
      "meetings_appointments",
      "money_financial",
      "client_follow_through",
      "creativity_ideas",
      "burnout_recovery",
      "decision_fatigue",
      "rejection_sensitivity",
      "relationships_family",
      "daily_living_home",
      "sleep_energy",
      "learning_information",
      "workplace_career",
      "help_delegation",
      "change_disruption",
    ] as const;
    expect(bundles).toHaveLength(36);
    for (const bundle of bundles) {
      expect(
        ADHD_EVERYDAY_STRATEGIES.filter((s) => s.bundleId === bundle),
      ).toHaveLength(10);
    }
    expect(ADHD_EVERYDAY_STRATEGIES.some((s) => s.id === "231")).toBe(true);
    expect(ADHD_EVERYDAY_STRATEGIES.at(-1)?.id).toBe("360");
  });

  it("routes common friction language to the right bundles", () => {
    expect(classifyAdhdStrategyFriction("i really need to focus")).toBe(
      "activation",
    );
    expect(
      classifyAdhdStrategyFriction(
        "i am overwhelmed and don't know where to start",
      ),
    ).toBe("overwhelm");
    expect(classifyAdhdStrategyFriction("I keep running late")).toBe(
      "memory_time",
    );
    expect(classifyAdhdStrategyFriction("I'm ashamed and beating myself up")).toBe(
      "emotion_burnout",
    );
    expect(classifyAdhdStrategyFriction("I can't stop once I start")).toBe(
      "hyperfocus_transitions",
    );
    expect(
      classifyAdhdStrategyFriction("I can't decide between these options"),
    ).toBe("decision_making");
    expect(
      classifyAdhdStrategyFriction("Help me prioritize my most important task"),
    ).toBe("planning_follow_through");
    expect(
      classifyAdhdStrategyFriction("I'm coming back after time away"),
    ).toBe("returning_after_absence");
    expect(
      classifyAdhdStrategyFriction("My inner critic says I'm a failure"),
    ).toBe("emotional_safety");
    expect(classifyAdhdStrategyFriction("There's too much clutter around me")).toBe(
      "organization_clutter",
    );
    expect(classifyAdhdStrategyFriction("The noise and lighting are distracting")).toBe(
      "environment_sensory",
    );
    expect(
      classifyAdhdStrategyFriction("I said the wrong thing and need to repair"),
    ).toBe("communication_relationships");
    expect(classifyAdhdStrategyFriction("This boring admin work is killing me")).toBe(
      "boring_tasks_motivation",
    );
    expect(classifyAdhdStrategyFriction("I am time blind and always underestimate")).toBe(
      "time_awareness",
    );
    expect(classifyAdhdStrategyFriction("I'm overthinking and need more certainty")).toBe(
      "decision_paralysis",
    );
    expect(classifyAdhdStrategyFriction("I forgot where I put my keys again")).toBe(
      "working_memory",
    );
    expect(
      classifyAdhdStrategyFriction(
        "I need to name the emotion before I keep escalating",
      ),
    ).toBe("emotional_awareness");
    expect(
      classifyAdhdStrategyFriction("I've been avoiding this and keep putting it off"),
    ).toBe("procrastination");
    expect(
      classifyAdhdStrategyFriction(
        "My perfectionism and fear of failure won't let me finish",
      ),
    ).toBe("perfectionism");
    expect(
      classifyAdhdStrategyFriction(
        "I have no motivation and keep waiting for momentum",
      ),
    ).toBe("motivation_momentum");
    expect(
      classifyAdhdStrategyFriction(
        "My morning routine keeps falling apart on hard days",
      ),
    ).toBe("routines_habits");
    expect(
      classifyAdhdStrategyFriction("My email inbox and paperwork backlog is impossible"),
    ).toBe("paperwork_admin");
    expect(
      classifyAdhdStrategyFriction("I keep missing appointments and dread meetings"),
    ).toBe("meetings_appointments");
    expect(
      classifyAdhdStrategyFriction(
        "I am avoiding my money and bills and impulse spending",
      ),
    ).toBe("money_financial");
    expect(
      classifyAdhdStrategyFriction(
        "I overpromised a client and need better follow-through",
      ),
    ).toBe("client_follow_through");
    expect(
      classifyAdhdStrategyFriction(
        "I have a new idea interrupting me and too many creative projects",
      ),
    ).toBe("creativity_ideas");
    expect(classifyAdhdStrategyFriction("I'm burned out and need a recovery day")).toBe(
      "burnout_recovery",
    );
    expect(
      classifyAdhdStrategyFriction(
        "I have decision fatigue and analysis paralysis with too many options",
      ),
    ).toBe("decision_fatigue");
    expect(
      classifyAdhdStrategyFriction(
        "This feels like rejection and the social pain is intense",
      ),
    ).toBe("rejection_sensitivity");
    expect(
      classifyAdhdStrategyFriction(
        "My partner and I need a repair conversation about family expectations",
      ),
    ).toBe("relationships_family");
    expect(
      classifyAdhdStrategyFriction(
        "Household clutter and laundry and meal routines keep falling apart",
      ),
    ).toBe("daily_living_home");
    expect(
      classifyAdhdStrategyFriction(
        "My bedtime is a mess and morning activation is impossible after poor sleep",
      ),
    ).toBe("sleep_energy");
    expect(
      classifyAdhdStrategyFriction(
        "My reading has no retention and research rabbit holes become overload",
      ),
    ).toBe("learning_information");
    expect(
      classifyAdhdStrategyFriction(
        "My workplace workload is invisible and I need a manager check-in before my performance review",
      ),
    ).toBe("workplace_career");
    expect(
      classifyAdhdStrategyFriction(
        "I need to ask for help and maybe use body doubling with an accountability partner",
      ),
    ).toBe("help_delegation");
    expect(
      classifyAdhdStrategyFriction(
        "My plans changed and travel plus interruptions wiped out my place",
      ),
    ).toBe("change_disruption");
  });

  it("returns at most two candidates and a thin chat hint", () => {
    const candidates = resolveAdhdStrategyCandidates(
      "i am overwhelmed and don't know where to start",
    );
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.length).toBeLessThanOrEqual(2);
    const hint = adhdStrategyHintForChat(
      "i am overwhelmed and don't know where to start",
    );
    expect(hint).toMatch(/ADHD EVERYDAY STRATEGY/);
    expect(hint).not.toMatch(/## 1\. Situation/);
  });
});
