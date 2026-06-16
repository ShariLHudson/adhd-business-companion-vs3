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
      s("List what's competing for attention — a quick brain dump is fine, even three words each.", {
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
  // Focus
  {
    id: "tiny-step",
    categoryId: "focus",
    title: "Tiny Step Challenge",
    helpsWith: "Starting when the full task feels too big to touch.",
    timeLabel: "3–5 min",
    steps: [
      s("Name the task you've been avoiding. Write it in one line — no polishing.", {
        type: "text",
        key: "task",
        label: "Task I've been avoiding",
      }),
      s("Shrink it: what is the smallest physical action that counts as beginning?", {
        type: "text",
        key: "tinyStep",
        label: "Smallest action that counts as starting",
        placeholder: "Open doc, find file, write one sentence…",
      }),
      s("Set a timer for five minutes. You're not finishing — you're proving you can start."),
      s("Do only the tiny step until the timer ends or you naturally want to continue."),
      s("Stop when the timer rings if you need to. Starting still counts."),
    ],
  },
  {
    id: "beat-the-timer",
    categoryId: "focus",
    title: "Beat The Timer",
    helpsWith: "Working in a bounded window so focus doesn't have to last forever.",
    timeLabel: "15–25 min",
    steps: [
      s("Choose one task and one outcome for this block (\"draft intro,\" not \"work on website\").", {
        type: "labeled-fields",
        key: "focus",
        fields: [
          { label: "Task", placeholder: "What you're working on" },
          { label: "Outcome for this block", placeholder: "Draft intro, not work on website" },
        ],
      }),
      s("Remove one distraction: close a tab, silence a notification, or move your phone out of reach."),
      s("Pick a length that feels doable — 15 minutes is enough. Longer is optional, not required."),
      s("Start the timer. Work only on that outcome until it ends."),
      s("When time's up, stop deliberately. Note one line of progress, then decide if another block makes sense.", {
        type: "text",
        key: "progress",
        label: "One line of progress",
      }),
    ],
    linkedSection: "focus-timer",
    linkedLabel: "Open focus timer",
    suggestLinkedFromStep: 3,
  },
  {
    id: "tab-closer",
    categoryId: "focus",
    title: "Tab Closer",
    helpsWith: "Clearing digital clutter so one task has room to breathe.",
    timeLabel: "2–4 min",
    steps: [
      s("Look at every open tab or window. Don't read — just scan titles."),
      s("Close anything that isn't for the task in front of you. Bookmark if you're afraid to lose it."),
      s("If a tab is \"maybe later,\" park it in a list or bookmark folder named Later."),
      s("Leave one tab (or one app) open — the one you'll use next."),
      s("Take ten seconds to look at the cleared space. That's your working surface now."),
    ],
  },
  {
    id: "first-physical-step",
    categoryId: "focus",
    title: "First Physical Step",
    helpsWith: "Bridging from thinking about work to actually being in motion.",
    timeLabel: "2–5 min",
    steps: [
      s("Stand up if you can. Feel your feet on the floor for a moment."),
      s("Name the task. Then ask: \"What would my hands do first?\"", {
        type: "text",
        key: "task",
        label: "Task",
      }),
      s("Do that one physical action — walk to the desk, open the notebook, fill the water glass."),
      s("Don't sit back down until the first motion is complete."),
      s("From there, either continue for five more minutes or pause with the start logged as done."),
    ],
  },
  // Calm
  {
    id: "brain-parking-lot",
    categoryId: "calm",
    title: "Brain Parking Lot",
    helpsWith: "Getting intrusive thoughts out of working memory so you can rest or focus.",
    timeLabel: "5–10 min",
    steps: [
      s("Open **Clear My Mind** beside us — we'll capture one thought per card, not one giant list."),
      s("What's the first thing that won't leave you alone? One line only.", {
        type: "text",
        key: "thought-1",
        label: "First thought",
      }),
      s("Anything else? Add one more if something else is nagging — still one at a time.", {
        type: "text",
        key: "thought-2",
        label: "Second thought (optional)",
        optional: true,
      }),
      s("Don't solve anything yet. Each line is parked on its own card."),
      s("Optional: pick one to work on tomorrow if something truly can't wait.", {
        type: "pick-from",
        key: "tomorrow",
        fromKey: "thought-1",
        label: "Anything for tomorrow? (optional)",
        optional: true,
      }),
    ],
    linkedSection: "brain-dump",
    linkedLabel: "Open Clear My Mind",
    suggestLinkedFromStep: 0,
    linkedSuggestionHint:
      "This works best with Clear My Mind beside us — one thought per card.",
  },
  {
    id: "safe-for-today",
    categoryId: "calm",
    title: "Safe For Today",
    helpsWith: "Lowering stakes when everything feels high-risk or high-stakes.",
    timeLabel: "3–5 min",
    steps: [
      s("Name what's making today feel unsafe or heavy — one sentence, no essay.", {
        type: "text",
        key: "heavy",
        label: "What feels unsafe or heavy today?",
        multiline: true,
      }),
      s("Ask: \"What would make today survivable, not perfect?\" Write three small answers.", {
        type: "labeled-fields",
        key: "survivable",
        fields: [
          { label: "Answer 1" },
          { label: "Answer 2" },
          { label: "Answer 3" },
        ],
      }),
      s("Pick the easiest one and do it in the next ten minutes if you can.", {
        type: "pick-from",
        key: "easiest",
        fromKey: "survivable",
        label: "Easiest one to do now",
      }),
      s("Say: \"Enough for today is a valid finish line.\""),
      s("If the weight returns, re-read your three answers. They're still true."),
    ],
  },
  {
    id: "future-me",
    categoryId: "calm",
    title: "Future Me Will Appreciate This",
    helpsWith: "Motivation without guilt — connecting now-you to later relief.",
    timeLabel: "2–4 min",
    steps: [
      s("Think of one small thing you've been putting off that future-you would notice.", {
        type: "text",
        key: "gift",
        label: "Small thing future-you would notice",
      }),
      s("Picture tomorrow morning: what would feel lighter if it were done?"),
      s("Do that one thing for five minutes — or less if that's all you have."),
      s("When you stop, say: \"Future me got a gift.\" No extra credit required."),
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
  // Energize
  {
    id: "stand-up-quest",
    categoryId: "energize",
    title: "Stand Up Quest",
    helpsWith: "Breaking body freeze when you've been still too long.",
    timeLabel: "2–3 min",
    steps: [
      s("Stand up. If standing isn't available, shift posture deliberately — uncross, lengthen spine."),
      s("Roll shoulders back twice. Shake out your hands."),
      s("Walk to a different spot in the room — window, doorway, kitchen — and look at something far away."),
      s("On the way back, name one thing you'll do in the next fifteen minutes.", {
        type: "text",
        key: "next",
        label: "One thing for the next 15 minutes",
      }),
      s("Sit (or settle) with intention. You're re-entering work, not drifting back."),
    ],
  },
  {
    id: "move-two-minutes",
    categoryId: "energize",
    title: "Move For Two Minutes",
    helpsWith: "Quick physical reset when mental energy is stuck.",
    timeLabel: "2 min",
    steps: [
      s("Set a two-minute timer. Any movement counts — stairs, stretch, walk, dance, shake out limbs."),
      s("Move continuously until the timer ends. No performance standard."),
      s("Notice breath and temperature when you stop. That's your system waking up."),
      s("Drink water if it's nearby. Then choose one small task to pair with the energy.", {
        type: "text",
        key: "task",
        label: "One small task to pair with this energy",
      }),
    ],
  },
  {
    id: "quick-win",
    categoryId: "energize",
    title: "Quick Win Challenge",
    helpsWith: "Building momentum with something completable in one sitting.",
    timeLabel: "5–10 min",
    steps: [
      s("List three tasks you could finish in under ten minutes each. Real finishes, not starts.", {
        type: "labeled-fields",
        key: "tasks",
        fields: [
          { label: "Quick win 1" },
          { label: "Quick win 2" },
          { label: "Quick win 3" },
        ],
      }),
      s("Pick the one that would feel best to cross off — not the most important.", {
        type: "pick-from",
        key: "pick",
        fromKey: "tasks",
        label: "Which one will you finish?",
      }),
      s("Do it start to finish. Timer optional; completion is the point."),
      s("Mark it done somewhere visible. Let the small win register before you pick what's next."),
    ],
  },
  {
    id: "reset-and-return",
    categoryId: "energize",
    title: "Reset And Return",
    helpsWith: "Coming back after a dip without shame or a full-day restart.",
    timeLabel: "3–5 min",
    steps: [
      s("Acknowledge the dip without a story: \"Energy dropped. That's data, not a verdict.\""),
      s("Do one reset action: water, snack, bathroom, two-minute walk, or three slow breaths."),
      s("Look at what you were doing. Write the very next micro-step on a sticky note or line of text.", {
        type: "text",
        key: "microStep",
        label: "Very next micro-step",
      }),
      s("Work that micro-step for five minutes. Returning counts even if output is small."),
    ],
  },
  // Decide
  {
    id: "two-option",
    categoryId: "decide",
    title: "Two Option Decision",
    helpsWith: "Choosing between two paths when both seem reasonable.",
    timeLabel: "5–10 min",
    steps: [
      s("Write the two options in plain language — no pros/cons yet.", {
        type: "labeled-fields",
        key: "options",
        fields: [{ label: "Option 1" }, { label: "Option 2" }],
      }),
      s("For each: \"If I chose this, what would I do in the first hour?\" One sentence each.", {
        type: "labeled-fields",
        key: "firstHour",
        fields: [
          { label: "First hour if option 1" },
          { label: "First hour if option 2" },
        ],
      }),
      s("Notice which first hour feels lighter, clearer, or more honest. Not better — more workable.", {
        type: "pick-from",
        key: "choice",
        fromKey: "options",
        label: "Which option are you choosing?",
      }),
      s("Choose one. If neither fits, your answer may be \"neither yet\" — that's also a decision."),
      s("Take one small action aligned with the choice in the next ten minutes.", {
        type: "text",
        key: "action",
        label: "One small action in the next 10 minutes",
      }),
    ],
  },
  {
    id: "elimination-round",
    categoryId: "decide",
    title: "Elimination Round",
    helpsWith: "Narrowing many options when everything seems equally possible.",
    timeLabel: "5–8 min",
    steps: [
      s("List every option on the table. Don't rank — just get them visible.", {
        type: "options",
        key: "options",
        startCount: 4,
        minFilled: 2,
        itemLabel: (i) => `Option ${i + 1}`,
        addLabel: "Add Another Option",
      }),
      s("Here's what you entered. You'll narrow from here.", {
        type: "review-list",
        fromKey: "options",
        title: "Your options",
      }),
      s("Remove any that fail this test: \"Would I genuinely do this in the next two weeks?\" Remove any that need information you don't have yet.", {
        type: "eliminate-from",
        key: "finalists",
        fromKey: "options",
        minRemaining: 1,
      }),
      s("Of what's left, pick one to try first. Trials beat endless comparison.", {
        type: "pick-from",
        key: "pick",
        fromKey: "finalists",
        label: "Pick one to try first",
      }),
      s("Set a review date. You can change course with new information — that's not failure.", {
        type: "text",
        key: "reviewDate",
        label: "When will you revisit this?",
        placeholder: "e.g. Next Friday",
      }),
    ],
  },
  {
    id: "reversible-permanent",
    categoryId: "decide",
    title: "Reversible Or Permanent?",
    helpsWith: "Reducing decision pressure by sorting what actually locks you in.",
    timeLabel: "3–5 min",
    steps: [
      s("Name the decision that's stuck.", {
        type: "text",
        key: "decision",
        label: "Decision that's stuck",
      }),
      s("Ask: \"Is this reversible in a week? A month? A year?\" Mark it reversible, hard-to-reverse, or permanent.", {
        type: "choice",
        key: "reversibility",
        label: "How reversible is this?",
        choices: ["Reversible in a week", "Hard to reverse", "Permanent"],
      }),
      s("Reversible decisions deserve a time box — decide by Friday, try for two weeks, etc.", {
        type: "text",
        key: "timeBox",
        label: "Time box (if reversible)",
        placeholder: "e.g. Decide by Friday, try for 2 weeks",
        optional: true,
      }),
      s("Permanent decisions get a shorter list of must-haves. Three maximum.", {
        type: "labeled-fields",
        key: "mustHaves",
        requiredCount: 1,
        fields: [
          { label: "Must-have 1" },
          { label: "Must-have 2" },
          { label: "Must-have 3 (optional)" },
        ],
      }),
      s("Act on the lightest reversible step first if you can. Motion clarifies more than analysis."),
    ],
  },
  {
    id: "what-protecting",
    categoryId: "decide",
    title: "What Are We Protecting?",
    helpsWith: "Clarifying values when options all look logical but feel wrong.",
    timeLabel: "5–8 min",
    steps: [
      s("State the decision in one line.", {
        type: "text",
        key: "decision",
        label: "Decision in one line",
      }),
      s("Ask: \"What am I protecting — time, money, reputation, energy, relationships, integrity?\" Pick up to two.", {
        type: "labeled-fields",
        key: "protecting",
        requiredCount: 1,
        fields: [
          { label: "Protecting #1", placeholder: "time, money, energy…" },
          { label: "Protecting #2 (optional)" },
        ],
      }),
      s("For each option, ask: \"Does this protect what I named, or trade it away?\"", {
        type: "options",
        key: "options",
        startCount: 3,
        minFilled: 2,
        itemLabel: (i) => `Option ${i + 1}`,
        addLabel: "Add option",
      }),
      s("The option that protects your top values with the smallest cost is often the answer.", {
        type: "pick-from",
        key: "choice",
        fromKey: "options",
        label: "Which option fits best?",
      }),
      s("If two options protect equally, choose the one with the smaller downside if you're wrong."),
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
    id: "sort-now-later-park",
    categoryId: "overwhelm",
    title: "Sort Now / Later / Park",
    helpsWith: "Triaging a flood of tasks without doing them all at once.",
    timeLabel: "5–10 min",
    steps: [
      s("Brain dump every open loop — tasks, worries, replies, ideas.", {
        type: "options",
        key: "loops",
        startCount: 5,
        minFilled: 2,
        addLabel: "Add another",
      }),
      s("Sort each into Now (today), Later (this week), or Park (someday / not mine / unclear).", {
        type: "bucket-assign",
        key: "sort",
        fromKey: "loops",
        buckets: [
          { id: "now", label: "Now" },
          { id: "later", label: "Later" },
          { id: "park", label: "Park" },
        ],
      }),
      s("Now should have no more than three items. Start the smallest Now item.", {
        type: "pick-from",
        key: "nowPick",
        fromKey: "loops",
        label: "Smallest Now item to start",
      }),
      s("Park exists so your brain stops holding those loops."),
      s("Revisit Later at a set time — not every hour. The sort is the relief."),
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
