import type { AppSection } from "./companionUi";
import { activityStep, type ActivityStep } from "./activityFields";

const s = activityStep;

export type ActivityCategoryId =
  | "slow-down"
  | "focus"
  | "calm"
  | "energize"
  | "decide"
  | "overwhelm"
  | "creativity";

export type ActivityCategory = {
  id: ActivityCategoryId;
  label: string;
  description: string;
};

export type CompanionActivity = {
  id: string;
  categoryId: ActivityCategoryId;
  title: string;
  helpsWith: string;
  /** Display string, e.g. "3–5 min" */
  timeLabel: string;
  steps: ActivityStep[];
  /** Custom interactive UI instead of linear steps. */
  customUi?: "decision-compass";
  /** Opens a companion tool when the user is ready (optional). */
  linkedSection?: AppSection;
  linkedLabel?: string;
  /** Step index (0-based) when the beside-this suggestion appears. Defaults to last step. */
  suggestLinkedFromStep?: number;
  /** Optional lead-in before the permission question. */
  linkedSuggestionHint?: string;
};

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  {
    id: "slow-down",
    label: "Slow Down",
    description: "When everything feels fast, loud, or urgent.",
  },
  {
    id: "focus",
    label: "Focus",
    description: "When you need to start, stay, or return to one thing.",
  },
  {
    id: "calm",
    label: "Calm",
    description: "When anxiety, noise, or pressure is running the show.",
  },
  {
    id: "energize",
    label: "Energize",
    description: "When you're flat, stuck, or running on empty.",
  },
  {
    id: "decide",
    label: "Decide",
    description: "When you're circling a choice and can't land.",
  },
  {
    id: "overwhelm",
    label: "Overwhelm",
    description: "When there's too much and you don't know where to start.",
  },
  {
    id: "creativity",
    label: "Creativity",
    description: "When you need ideas, momentum, or permission to begin.",
  },
];

export const COMPANION_ACTIVITIES: CompanionActivity[] = [
  // Slow Down
  {
    id: "five-senses",
    categoryId: "slow-down",
    title: "Five Senses Grounding",
    helpsWith: "Pulling attention back into the present when your mind is racing.",
    timeLabel: "3–5 min",
    steps: [
      s("Pause whatever you're holding. You don't have to solve anything right now."),
      s("Name five things you can see. Say them out loud or write them — either works."),
      s("Name four things you can touch or feel (chair, floor, air on skin, fabric)."),
      s("Name three things you can hear. Even subtle sounds count."),
      s("Name two things you can smell, or two scents you like if nothing is obvious."),
      s("Name one thing you can taste, or one small comfort you'd enjoy later."),
      s("Take one slower breath. You're here — not inside every future problem."),
    ],
  },
  {
    id: "one-thing-only",
    categoryId: "slow-down",
    title: "One Thing Only",
    helpsWith: "Cutting through multitasking when your brain wants to do everything at once.",
    timeLabel: "2–4 min",
    steps: [
      s("List what's competing for attention — name each in a few words, one per line.", {
        type: "options",
        key: "competing",
        startCount: 4,
        minFilled: 2,
        addLabel: "Add another",
      }),
      s("Circle or star just one item. Not the most important — the one you'll touch first.", {
        type: "pick-from",
        key: "chosen",
        fromKey: "competing",
        label: "Which one will you touch first?",
      }),
      s("Say out loud: \"Only this for the next few minutes.\" The rest can wait on the list."),
      s("Put the list somewhere you won't lose it, then turn your body toward the one thing."),
      s("If another task barges in, note it on the list and return. No negotiation required."),
    ],
  },
  {
    id: "pause-before-solving",
    categoryId: "slow-down",
    title: "Pause Before Solving",
    helpsWith:
      "Stopping the rush to fix everything before you've named what actually matters.",
    timeLabel: "3–5 min",
    steps: [
      s("Write the problem as you hear it in your head — one messy sentence is fine.", {
        type: "text",
        key: "problem",
        label: "What's the problem?",
        multiline: true,
      }),
      s("Ask: \"What am I actually trying to solve?\" Rewrite it in plain words.", {
        type: "text",
        key: "realProblem",
        label: "What am I actually trying to solve?",
        multiline: true,
      }),
      s("Ask: \"What would 'good enough for now' look like?\" — not perfect, just workable.", {
        type: "text",
        key: "goodEnough",
        label: "Good enough for now",
        placeholder: "Workable, not perfect…",
      }),
      s("Before you act, pause for one slow breath. You're allowed to solve a smaller problem first."),
      s("Pick the smallest next step toward good-enough — not the whole solution.", {
        type: "text",
        key: "nextStep",
        label: "Smallest next step",
      }),
    ],
  },
  {
    id: "what-can-wait",
    categoryId: "slow-down",
    title: "What Can Wait?",
    helpsWith: "Separating real urgency from the feeling of urgency.",
    timeLabel: "5–8 min",
    steps: [
      s("Write every \"must do today\" item that's buzzing in your head.", {
        type: "options",
        key: "mustDo",
        startCount: 4,
        minFilled: 1,
        addLabel: "Add another",
      }),
      s("For each one, ask: \"What actually breaks if this waits until tomorrow?\" Sort them below.", {
        type: "bucket-assign",
        key: "when",
        fromKey: "mustDo",
        buckets: [
          { id: "today", label: "Today" },
          { id: "later", label: "Later" },
          { id: "week", label: "This week" },
        ],
      }),
      s("Pick one Today item — the smallest real commitment — and release the rest for now.", {
        type: "pick-from",
        key: "todayPick",
        fromKey: "mustDo",
        label: "Your one Today item",
      }),
      s("Say: \"Waiting is a decision, not a failure.\" Then take one breath before you start."),
    ],
  },
  // Focus — each strategy solves a different focus problem
  {
    id: "focus-session",
    categoryId: "focus",
    title: "Focus Session",
    helpsWith: "Creating a real working session with a clear outcome and timer.",
    timeLabel: "15–45 min",
    steps: [
      s("What are you working on right now? One line.", {
        type: "text",
        key: "task",
        label: "What you're working on",
      }),
      s("What does \"done enough\" look like for this block — not the whole project?", {
        type: "text",
        key: "outcome",
        label: "Done enough for this block",
        placeholder: "Draft intro, not finish website",
      }),
      s("How long feels doable without lying to yourself?", {
        type: "choice",
        key: "length",
        label: "Block length",
        choices: ["15 minutes", "25 minutes", "45 minutes"],
      }),
      s("Open the focus timer beside us and start when you're ready."),
      s("Work only on that outcome. Chat stays here if you need a nudge mid-session."),
    ],
    linkedSection: "focus-timer",
    linkedLabel: "Open focus timer",
    suggestLinkedFromStep: 3,
  },
  {
    id: "time-block-builder",
    categoryId: "focus",
    title: "Time Block Builder",
    helpsWith: "Scheduling work on the calendar instead of hoping you'll find time.",
    timeLabel: "5–8 min",
    steps: [
      s("What needs protected time on your calendar?", {
        type: "text",
        key: "work",
        label: "What needs time blocked",
      }),
      s("How long does it honestly need?", {
        type: "choice",
        key: "duration",
        label: "Duration",
        choices: ["30 minutes", "60 minutes", "90 minutes", "2 hours"],
      }),
      s("When today or tomorrow works best?", {
        type: "text",
        key: "when",
        label: "When",
        placeholder: "Today 2pm, tomorrow morning…",
      }),
      s("Open Time Bank beside us and place the block — naming it is half the win."),
      s("The block exists so your brain can stop holding \"when will I do this?\"", {
        type: "text",
        key: "blockName",
        label: "Name for this block",
      }),
    ],
    linkedSection: "time-block",
    linkedLabel: "Open Time Bank",
    suggestLinkedFromStep: 3,
  },
  {
    id: "distraction-shield",
    categoryId: "focus",
    title: "Distraction Shield",
    helpsWith: "Identifying and blocking likely distractions before you start — not after you're derailed.",
    timeLabel: "3–5 min",
    steps: [
      s("What task are you protecting?", {
        type: "text",
        key: "task",
        label: "Task to protect",
      }),
      s("What usually pulls you away? Check every honest answer.", {
        type: "labeled-fields",
        key: "distractions",
        requiredCount: 1,
        fields: [
          { label: "Likely distraction #1", placeholder: "phone, tabs, people…" },
          { label: "Likely distraction #2 (optional)" },
          { label: "Likely distraction #3 (optional)" },
        ],
      }),
      s("Pick ONE distraction to shield against first — the biggest thief.", {
        type: "pick-from",
        key: "shield",
        fromKey: "distractions",
        label: "Shield against",
      }),
      s("What's one concrete shield action? (Phone in drawer, one tab, door closed…)", {
        type: "text",
        key: "action",
        label: "Concrete shield action",
      }),
      s("Apply the shield before you start. Prevention beats willpower."),
    ],
  },
  {
    id: "first-step-finder",
    categoryId: "focus",
    title: "First Step Finder",
    helpsWith: "Discovering the smallest possible next step when the task feels frozen.",
    timeLabel: "3–5 min",
    steps: [
      s("What's stuck or avoided?", {
        type: "text",
        key: "stuck",
        label: "What's stuck",
      }),
      s("If someone else had to start this in 60 seconds, what would their hands do?", {
        type: "text",
        key: "sixtySec",
        label: "First 60 seconds",
        placeholder: "Open doc, find file, write one sentence…",
      }),
      s("Is that small enough? If not, shrink it once more.", {
        type: "text",
        key: "smaller",
        label: "Even smaller if needed",
        optional: true,
      }),
      s("Do that step now — five minutes max. You're finding the door, not finishing the house."),
      s("Stop or continue — either way you found the entry point."),
    ],
  },
  {
    id: "momentum-restart",
    categoryId: "focus",
    title: "Momentum Restart",
    helpsWith: "Recovering after losing focus — without shame or a full-day restart.",
    timeLabel: "3–5 min",
    steps: [
      s("What were you working on before focus wandered?", {
        type: "text",
        key: "was",
        label: "What you were doing",
      }),
      s("Where did focus go? One line — no story, just data.", {
        type: "text",
        key: "went",
        label: "Where focus went",
      }),
      s("Say: \"Momentum paused. That's data, not a verdict.\" No shame spiral."),
      s("What's the smallest re-entry step — not catching up, just re-entering?", {
        type: "text",
        key: "reentry",
        label: "Smallest re-entry step",
      }),
      s("Five minutes on that step only. Returning counts even if output is tiny."),
    ],
  },
  // Calm — each strategy solves a different calm problem
  {
    id: "brain-parking-lot",
    categoryId: "calm",
    title: "Brain Parking Lot",
    helpsWith:
      "Saving a stray idea while you stay on task — quick capture only, no sorting or solving.",
    timeLabel: "1–3 min",
    steps: [
      s("You're working. An idea shows up. Park it here — you don't owe it attention right now."),
      s("What do you want to save for later?", {
        type: "text",
        key: "parked",
        label: "Idea to save for later",
        multiline: true,
      }),
      s("Optional tag — one word so future-you recognizes it (e.g. marketing, kid, health).", {
        type: "text",
        key: "tag",
        label: "Tag (optional)",
        optional: true,
      }),
      s("Say: \"Saved for later. Back to what I was doing.\""),
      s("Close the lot. No organizing tonight — review when you're ready."),
    ],
    linkedSection: "brain-dump",
    linkedLabel: "Open Clear My Mind to park it",
    suggestLinkedFromStep: 1,
    linkedSuggestionHint:
      "Park this in **Clear My Mind** (Later / Someday) — then return to your task.",
  },
  {
    id: "clear-my-mind-priority",
    categoryId: "calm",
    title: "Clear My Mind",
    helpsWith:
      "Reducing mental clutter — dump, group, find priorities, and shape next steps (not mid-focus parking).",
    timeLabel: "5–8 min",
    steps: [
      s("Open **Clear My Mind** beside us if several thoughts are swirling — one card at a time."),
      s("What's taking up space in your head right now?", {
        type: "text",
        key: "loudest",
        label: "What's taking up space",
        multiline: true,
      }),
      s("Name one more if it's truly separate — still one line each.", {
        type: "text",
        key: "second",
        label: "Another thought (optional)",
        optional: true,
      }),
      s("Which cluster feels loudest — not biggest, loudest?", {
        type: "text",
        key: "cluster",
        label: "Loudest cluster",
      }),
      s("One small next step from that cluster — not solving everything today.", {
        type: "text",
        key: "next",
        label: "One next step",
      }),
    ],
    linkedSection: "brain-dump",
    linkedLabel: "Open Clear My Mind",
    suggestLinkedFromStep: 0,
    linkedSuggestionHint:
      "Works best with **Clear My Mind** open — capture, sort, and find priorities there.",
  },
  {
    id: "safe-for-today",
    categoryId: "calm",
    title: "Safe For Today",
    helpsWith:
      "Releasing guilt by naming what you're intentionally not solving today — not a brain dump or worry list.",
    timeLabel: "3–4 min",
    steps: [
      s("This is not a brain dump. No sorting pile. Just permission."),
      s("What are you giving yourself permission not to solve today?", {
        type: "text",
        key: "permission",
        label: "Not solving today",
        multiline: true,
        placeholder:
          "e.g. clean the garage, figure out marketing, organize photos…",
      }),
      s("Say out loud: \"I'm allowed to leave this for another day.\""),
      s("If guilt returns, re-read your permission line. It's still true."),
      s("Relief counts — you didn't fail, you chose scope."),
    ],
  },
  {
    id: "lower-the-noise",
    categoryId: "calm",
    title: "Let's Lower The Noise",
    helpsWith: "Reducing sensory and mental input when everything feels too loud.",
    timeLabel: "3–5 min",
    steps: [
      s("Notice one source of noise: notifications, music, clutter, background TV, inner commentary."),
      s("Turn one dial down — mute a channel, dim a light, close a door, or put on simpler audio."),
      s("Sit for thirty seconds in the slightly quieter version of now."),
      s("If another layer of noise appears, turn one more dial down. Two is enough for today."),
      s("Decide one protected pocket of quiet for the next hour, even if it's just ten minutes."),
    ],
  },
  // Energize — each strategy solves a different energy problem
  {
    id: "energy-check",
    categoryId: "energize",
    title: "Energy Check",
    helpsWith: "Assessing current energy honestly before choosing what to do next.",
    timeLabel: "2–3 min",
    steps: [
      s("Rate your energy right now — no performance, just truth.", {
        type: "choice",
        key: "rating",
        label: "Energy level",
        choices: ["1 — empty", "2 — low", "3 — medium", "4 — decent", "5 — high"],
      }),
      s("What signal is your body sending?", {
        type: "choice",
        key: "signal",
        label: "Body signal",
        choices: ["Tired", "Wired", "Flat", "Restless", "Steady"],
      }),
      s("What does that number need — rest, movement, food, or connection?", {
        type: "text",
        key: "need",
        label: "What you need",
      }),
      s("One micro-action that matches that need — not a whole self-care plan.", {
        type: "text",
        key: "action",
        label: "One micro-action",
      }),
    ],
  },
  {
    id: "recharge-menu",
    categoryId: "energize",
    title: "Recharge Menu",
    helpsWith: "Choosing a recharge action that fits how empty actually feels.",
    timeLabel: "3–5 min",
    steps: [
      s("How does empty feel right now?", {
        type: "choice",
        key: "emptyType",
        label: "Type of empty",
        choices: [
          "Physically tired",
          "Mentally flat",
          "Emotionally heavy",
          "Scattered / buzzing",
        ],
      }),
      s("Pick from the menu — one only.", {
        type: "choice",
        key: "recharge",
        label: "Recharge choice",
        choices: [
          "5-min walk",
          "Water + snack",
          "Lie down 5 min",
          "Music / Focus Audio",
          "Text someone kind",
        ],
      }),
      s("Do it for five minutes before deciding on work. Recharge is not procrastination."),
      s("Quick re-check: did anything shift? One word.", {
        type: "text",
        key: "shift",
        label: "What shifted?",
        optional: true,
      }),
    ],
  },
  {
    id: "low-battery-mode",
    categoryId: "energize",
    title: "Low Battery Mode",
    helpsWith: "Shrinking expectations when full capacity isn't available.",
    timeLabel: "3–5 min",
    steps: [
      s("What's on your plate that feels too big for today's battery?", {
        type: "text",
        key: "plate",
        label: "What feels too big",
        multiline: true,
      }),
      s("What's the 10% version — still real, radically smaller?", {
        type: "text",
        key: "tenPercent",
        label: "10% version",
      }),
      s("What's officially off the table today? Name it — permission to pause.", {
        type: "text",
        key: "offTable",
        label: "Off the table today",
      }),
      s("Do only the 10% version. Low battery mode is a feature, not a failure."),
    ],
  },
  {
    id: "energy-match",
    categoryId: "energize",
    title: "Energy Match",
    helpsWith: "Matching work to your actual energy instead of forcing the wrong task.",
    timeLabel: "4–6 min",
    steps: [
      s("Rate your energy 1–5.", {
        type: "choice",
        key: "rating",
        label: "Energy 1–5",
        choices: ["1", "2", "3", "4", "5"],
      }),
      s("What task were you trying to force?", {
        type: "text",
        key: "forcing",
        label: "Task you were forcing",
      }),
      s("What task actually matches this energy level?", {
        type: "text",
        key: "match",
        label: "Better-matched task",
      }),
      s("Why does it match? One sentence.", {
        type: "text",
        key: "why",
        label: "Why it matches",
      }),
      s("Work fifteen minutes on the matched task. Alignment beats grinding."),
    ],
  },
  {
    id: "permission-slip",
    categoryId: "energize",
    title: "Permission Slip",
    helpsWith: "Reducing pressure and guilt when you're being hard on yourself.",
    timeLabel: "3–4 min",
    steps: [
      s("What are you pressuring yourself about?", {
        type: "text",
        key: "pressure",
        label: "The pressure",
        multiline: true,
      }),
      s("Write your permission slip: \"I'm allowed to…\"", {
        type: "text",
        key: "permission",
        label: "I'm allowed to…",
      }),
      s("What would a kind coach say about this pressure?", {
        type: "text",
        key: "coach",
        label: "Kind coach voice",
        multiline: true,
      }),
      s("Read the permission slip aloud. Let guilt sit on the shelf for ten minutes."),
      s("Optional: one small step if you want — not required.", {
        type: "text",
        key: "optional",
        label: "Optional small step",
        optional: true,
      }),
    ],
  },
  // Decide — each strategy uses different decision logic
  {
    id: "decision-compass",
    categoryId: "decide",
    title: "ADHD Decision Compass",
    helpsWith:
      "Adaptive paths for action, strategy, and emotional decisions — with an optional mind map.",
    timeLabel: "8–15 min",
    steps: [],
    customUi: "decision-compass",
  },
  {
    id: "two-option",
    categoryId: "decide",
    title: "Two Option Decision",
    helpsWith: "Quick action comparison — first hour, then momentum.",
    timeLabel: "5–8 min",
    steps: [
      s("Write the two options in plain language — no pros/cons yet.", {
        type: "labeled-fields",
        key: "options",
        fields: [{ label: "Option A" }, { label: "Option B" }],
      }),
      s("For each: \"If I chose this, what would I do in the first hour?\" One sentence each.", {
        type: "labeled-fields",
        key: "firstHour",
        fields: [
          { label: "First hour if A" },
          { label: "First hour if B" },
        ],
      }),
      s("Which first hour feels lighter, clearer, or more honest?", {
        type: "pick-from",
        key: "choice",
        fromKey: "options",
        label: "Which option?",
      }),
      s("Take one small action aligned with that choice in the next ten minutes.", {
        type: "text",
        key: "action",
        label: "One small action",
      }),
    ],
  },
  {
    id: "decision-matrix",
    categoryId: "decide",
    title: "Decision Matrix",
    helpsWith: "Rating options against factors when gut feel alone isn't enough.",
    timeLabel: "8–12 min",
    steps: [
      s("Name the decision in one line.", {
        type: "text",
        key: "decision",
        label: "Decision",
      }),
      s("List your options — 2 to 4.", {
        type: "options",
        key: "options",
        startCount: 3,
        minFilled: 2,
        itemLabel: (i) => `Option ${i + 1}`,
        addLabel: "Add option",
      }),
      s("What are the top 3 factors that matter?", {
        type: "labeled-fields",
        key: "factors",
        fields: [
          { label: "Factor 1" },
          { label: "Factor 2" },
          { label: "Factor 3" },
        ],
      }),
      s("Which option wins on Factor 1?", {
        type: "pick-from",
        key: "win1",
        fromKey: "options",
        label: "Best on Factor 1",
      }),
      s("Which option wins on Factor 2?", {
        type: "pick-from",
        key: "win2",
        fromKey: "options",
        label: "Best on Factor 2",
      }),
      s("Which option wins on Factor 3?", {
        type: "pick-from",
        key: "win3",
        fromKey: "options",
        label: "Best on Factor 3",
      }),
      s("Count the wins. The leader is your draft answer — trust the tally, then act small."),
    ],
  },
  {
    id: "future-me-test",
    categoryId: "decide",
    title: "Future Me Test",
    helpsWith: "Imagining living with each choice six months from now.",
    timeLabel: "6–8 min",
    steps: [
      s("Name the decision.", {
        type: "text",
        key: "decision",
        label: "Decision",
      }),
      s("Option A — imagine you've lived with it six months. What's daily life like?", {
        type: "text",
        key: "futureA",
        label: "Six months with Option A",
        multiline: true,
      }),
      s("Option B — same question. Six months in.", {
        type: "text",
        key: "futureB",
        label: "Six months with Option B",
        multiline: true,
      }),
      s("Which future feels more workable — not perfect, workable?", {
        type: "choice",
        key: "pick",
        label: "More workable future",
        choices: ["Option A", "Option B", "Need a third path"],
      }),
      s("One small step in that direction today.", {
        type: "text",
        key: "step",
        label: "One small step",
      }),
    ],
  },
  {
    id: "coin-flip-insight",
    categoryId: "decide",
    title: "Coin Flip Insight",
    helpsWith: "Noticing your emotional reaction to an outcome — the flip reveals preference.",
    timeLabel: "3–5 min",
    steps: [
      s("Write your two options.", {
        type: "labeled-fields",
        key: "options",
        fields: [{ label: "Heads = Option A" }, { label: "Tails = Option B" }],
      }),
      s("Flip a coin (or pick randomly). Heads = first option, Tails = second."),
      s("Which outcome did you HOPE for while it was in the air?", {
        type: "choice",
        key: "hope",
        label: "I was hoping for",
        choices: ["Heads (Option A)", "Tails (Option B)", "I didn't care"],
      }),
      s("Your hope is data. What did your reaction tell you about what you really want?", {
        type: "text",
        key: "insight",
        label: "What the reaction told you",
        multiline: true,
      }),
      s("You don't have to obey the coin — use the insight, not the flip."),
    ],
  },
  {
    id: "regret-minimizer",
    categoryId: "decide",
    title: "Regret Minimizer",
    helpsWith: "Choosing the path with less future regret — not zero risk, smaller regret.",
    timeLabel: "5–8 min",
    steps: [
      s("Name the decision.", {
        type: "text",
        key: "decision",
        label: "Decision",
      }),
      s("If you choose A: what might you regret in a year?", {
        type: "text",
        key: "regretA",
        label: "Regret if A",
        multiline: true,
      }),
      s("If you choose B: what might you regret in a year?", {
        type: "text",
        key: "regretB",
        label: "Regret if B",
        multiline: true,
      }),
      s("Which regret is smaller or more survivable?", {
        type: "choice",
        key: "pick",
        label: "Smaller regret",
        choices: ["Option A", "Option B", "About equal"],
      }),
      s("One small action on the lower-regret path.", {
        type: "text",
        key: "action",
        label: "One small action",
      }),
    ],
  },
  // Overwhelm
  {
    id: "one-plate",
    categoryId: "overwhelm",
    title: "One Plate At A Time",
    helpsWith: "When life areas are all demanding attention at once.",
    timeLabel: "5–10 min",
    steps: [
      s("Name the \"plates\" spinning — work, home, health, money, people. List them, don't fix them.", {
        type: "options",
        key: "plates",
        startCount: 4,
        minFilled: 2,
        addLabel: "Add another plate",
      }),
      s("Choose one plate to hold for the next hour. The others stay on the table — not in your hands.", {
        type: "pick-from",
        key: "plate",
        fromKey: "plates",
        label: "One plate for this hour",
      }),
      s("Write what \"good enough\" looks like for that one plate today. One sentence.", {
        type: "text",
        key: "goodEnough",
        label: "Good enough for that plate today",
      }),
      s("Work only that plate until the hour ends or the good-enough line is met."),
      s("When you switch plates, do it deliberately. One at a time is the whole strategy."),
    ],
  },
  {
    id: "reduce-scope",
    categoryId: "overwhelm",
    title: "Reduce The Scope",
    helpsWith: "Making an impossible task possible by shrinking it honestly.",
    timeLabel: "5–8 min",
    steps: [
      s("Write the overwhelming task as you originally defined it.", {
        type: "text",
        key: "original",
        label: "The overwhelming task",
        multiline: true,
      }),
      s("Ask: \"What's the smallest version that still moves something forward?\" Cut until it fits in 30 minutes.", {
        type: "text",
        key: "reduced",
        label: "Smaller version (30 min or less)",
        multiline: true,
      }),
      s("Remove every \"should\" that isn't required for that smaller version."),
      s("Do the reduced version. The full vision can wait — partial progress is real progress."),
      s("Note what you finished. Scope reduction is a skill, not a compromise.", {
        type: "text",
        key: "finished",
        label: "What you finished",
      }),
    ],
  },
  {
    id: "triage-by-weight",
    categoryId: "overwhelm",
    title: "Triage By Weight",
    helpsWith: "Finding which life area is loudest — without dumping every task into a list.",
    timeLabel: "4–6 min",
    steps: [
      s("Don't list every task. Scan internally — which life area is competing loudest?"),
      s("Which categories are pulling? Name up to three.", {
        type: "options",
        key: "areas",
        startCount: 3,
        minFilled: 1,
        itemLabel: (i) => `Area ${i + 1}`,
        addLabel: "Add area",
      }),
      s("Which one feels heaviest right now — not most important, heaviest?", {
        type: "pick-from",
        key: "heaviest",
        fromKey: "areas",
        label: "Heaviest area",
      }),
      s("One sentence about that weight.", {
        type: "text",
        key: "sentence",
        label: "One sentence",
      }),
      s("One two-minute action in that area only. Not the whole category — one pebble."),
    ],
  },
  {
    id: "what-feels-heaviest",
    categoryId: "overwhelm",
    title: "What Feels Heaviest?",
    helpsWith: "Finding the one weight that's making everything else harder.",
    timeLabel: "3–5 min",
    steps: [
      s("Close your eyes or soften your gaze. Scan what's on your mind."),
      s("Ask: \"What feels heaviest right now?\" — not most important, heaviest.", {
        type: "text",
        key: "heaviest",
        label: "What feels heaviest?",
        multiline: true,
      }),
      s("Name it in one sentence. Often it's an emotion, a conversation, or one undone thing."),
      s("Choose one action: do a two-minute piece of it, schedule it, or tell someone.", {
        type: "text",
        key: "action",
        label: "One action you'll take",
      }),
      s("Lightening the heaviest weight often makes the rest more movable."),
    ],
  },
  // Creativity
  {
    id: "idea-sprint",
    categoryId: "creativity",
    title: "Idea Sprint",
    helpsWith: "Generating options fast without judging them yet.",
    timeLabel: "5–10 min",
    steps: [
      s("Set a timer for seven minutes. Topic in one line: \"ideas for ___.\"", {
        type: "text",
        key: "topic",
        label: "Ideas for…",
        placeholder: "e.g. newsletter topics, launch angles",
      }),
      s("Write every idea — obvious, silly, borrowed, half-formed. Quantity only.", {
        type: "options",
        key: "ideas",
        startCount: 5,
        minFilled: 3,
        addLabel: "Add another idea",
      }),
      s("No editing until the timer stops. Ugly ideas stay on the list."),
      s("When time's up, circle three you'd actually try.", {
        type: "pick-from",
        key: "topPick",
        fromKey: "ideas",
        label: "One idea to develop first",
      }),
      s("Pick one to develop for ten more minutes if energy allows."),
    ],
  },
  {
    id: "start-middle",
    categoryId: "creativity",
    title: "Start In The Middle",
    helpsWith: "Bypassing blank-page paralysis by not starting at the beginning.",
    timeLabel: "5–8 min",
    steps: [
      s("Name what you're creating — email, outline, post, plan.", {
        type: "text",
        key: "creating",
        label: "What you're creating",
      }),
      s("Choose a section in the middle: the example, the story, the bullet you're sure about.", {
        type: "text",
        key: "middle",
        label: "Section to start in the middle",
        multiline: true,
      }),
      s("Write that piece only for ten minutes. No intro, no setup."),
      s("Stop and read it. Often the beginning becomes obvious once something exists."),
      s("Fill in openings and bridges later — they're easier with material on the page."),
    ],
  },
  {
    id: "tell-a-client",
    categoryId: "creativity",
    title: "What Would I Tell A Client?",
    helpsWith: "Unlocking clarity by advising yourself the way you'd advise someone else.",
    timeLabel: "5–8 min",
    steps: [
      s("Name the stuck creative or business problem.", {
        type: "text",
        key: "problem",
        label: "What's stuck?",
        multiline: true,
      }),
      s("Imagine a client brought you this exact situation. What would you say first?", {
        type: "text",
        key: "advice",
        label: "What you'd tell a client",
        multiline: true,
      }),
      s("Write or speak that advice — warm, direct, practical. Don't soften it for yourself."),
      s("Read it back. The advice is often your next step dressed as someone else's problem."),
      s("Take one action from your own advice in the next five minutes.", {
        type: "text",
        key: "action",
        label: "One action from your own advice",
      }),
    ],
  },
  {
    id: "bad-first-draft",
    categoryId: "creativity",
    title: "Bad First Draft",
    helpsWith: "Permission to produce something imperfect so you have something to improve.",
    timeLabel: "5–10 min",
    steps: [
      s("Say out loud: \"This draft is allowed to be bad.\" Mean it."),
      s("Set a timer for ten minutes. Produce the worst acceptable version — complete, not polished.", {
        type: "text",
        key: "draft",
        label: "Bad first draft",
        multiline: true,
        placeholder: "Forward motion only — no backspacing for style…",
      }),
      s("No backspacing for style. Forward motion only."),
      s("When the timer ends, save it and step away for one minute."),
      s("Return and underline one part worth keeping. That's the seed for draft two.", {
        type: "text",
        key: "seed",
        label: "One part worth keeping",
      }),
    ],
  },
];

export function activitiesForCategory(
  categoryId: ActivityCategoryId,
): CompanionActivity[] {
  return COMPANION_ACTIVITIES.filter((a) => a.categoryId === categoryId);
}

export function getActivityById(id: string): CompanionActivity | undefined {
  return COMPANION_ACTIVITIES.find((a) => a.id === id);
}

/** Alphabetical dropdown options for the activities picker. */
export function activityCategoryDropdownOptions(): {
  value: ActivityCategoryId;
  label: string;
}[] {
  return [...ACTIVITY_CATEGORIES]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((c) => ({ value: c.id, label: c.label }));
}
