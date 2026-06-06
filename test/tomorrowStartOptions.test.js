import assert from "node:assert/strict";
import test from "node:test";

import {
  MY_OWN_PLAN_EXAMPLES,
  MY_OWN_PLAN_PROMPT,
  START_STYLE_OPTIONS,
  buildNextMorningReminder,
  createTomorrowStartSelection,
  validateTomorrowStartSelection,
} from "../src/tomorrowStartOptions.js";

test("includes helper descriptions for every start style", () => {
  assert.equal(START_STYLE_OPTIONS.length, 8);

  for (const option of START_STYLE_OPTIONS) {
    assert.ok(option.emoji);
    assert.ok(option.label);
    assert.ok(option.description);
  }
});

test("adds the new flexible tomorrow-start choices", () => {
  const labels = START_STYLE_OPTIONS.map((option) => option.label);

  assert.deepEqual(
    [
      "Continue Where I Left Off",
      "My Own Plan",
      "Decide Tomorrow",
    ].every((label) => labels.includes(label)),
    true,
  );
});

test("requires a note only for My Own Plan", () => {
  assert.equal(MY_OWN_PLAN_PROMPT, "What would you like to remember for tomorrow?");
  assert.deepEqual(MY_OWN_PLAN_EXAMPLES, [
    "Finish sales page.",
    "Call prospects.",
    "Review onboarding notes.",
  ]);

  const selection = createTomorrowStartSelection({
    id: "my-own-plan",
    note: "   ",
  });

  assert.equal(
    validateTomorrowStartSelection(selection),
    "Add a note for tomorrow or choose another start style.",
  );

  assert.equal(
    validateTomorrowStartSelection(
      createTomorrowStartSelection({
        id: "decide-tomorrow",
      }),
    ),
    "",
  );
});

test("displays the user's own note the next morning", () => {
  const selection = createTomorrowStartSelection({
    id: "my-own-plan",
    note: " Finish sales page. ",
  });

  assert.equal(selection.note, "Finish sales page.");
  assert.equal(
    buildNextMorningReminder(selection),
    "Your plan for this morning: Finish sales page.",
  );
});

test("continues today's focus when asked", () => {
  const selection = createTomorrowStartSelection({
    id: "continue-where-left-off",
    todayFocus: "Review onboarding notes",
  });

  assert.equal(
    buildNextMorningReminder(selection),
    "Continue where you left off: Review onboarding notes",
  );
});

test("lets users defer the decision until tomorrow", () => {
  const selection = createTomorrowStartSelection({
    id: "decide-tomorrow",
  });

  assert.equal(
    buildNextMorningReminder(selection),
    "You chose to decide how to begin when tomorrow arrives.",
  );
});
