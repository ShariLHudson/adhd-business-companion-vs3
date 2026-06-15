// The Strategy system — the front half of the 4-layer model.
//   Category (navigation only) → Strategy (a coaching lesson) → Execution (tools).
// Each strategy is no longer a tip — it's Shari sitting beside you explaining
// what's happening, why your brain does it, why the move works, and exactly
// what to try right now. Tone: warm coach, never clinical. Multi-line strings
// render with whitespace-pre-line.

// Two top-level groups. Subcategories live under one of these.
export type StrategyGroupId = "personal" | "business";

// The execution actions a strategy can recommend (matches the action buttons).
export type StrategyActionId = "start" | "timeblock" | "talk" | "save" | "save-mine";

export type StrategyGroup = {
  id: StrategyGroupId;
  label: string;
  emoji: string;
  blurb: string;
};

export const STRATEGY_GROUPS: StrategyGroup[] = [
  {
    id: "personal",
    label: "Personal & ADHD",
    emoji: "🌱",
    blurb: "How you work with your own brain.",
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
    blurb: "Growing and running the work.",
  },
];

export type StrategyCategory = {
  id: string;
  group: StrategyGroupId; // which top-level group this subcategory belongs to
  label: string;
  emoji: string;
  color: string;
  blurb: string; // one line — what this area is, navigation only
};

export type Strategy = {
  id: string;
  categoryId: string;
  title: string;
  whenToUse: string; // short subtitle for the list card
  problem: string; // 2. The Problem — what's happening
  whyBrain: string; // 3. Why ADHD Brains Do This
  whyWorks: string; // 4. Why This Works
  example: string; // 5. Real-Life Example
  steps: string[]; // 6. Try It Right Now
  coach?: string[]; // Apply Mode — strategy-specific questions Shari walks through one at a time
  recommendedAction?: StrategyActionId; // which action to highlight (else subcategory default)
  timeMin?: number; // rough minutes to use it (else subcategory default)
  tags?: string[]; // future: surfacing / "Recommended for me" matching
  deeper?: string; // optional "Want to understand this deeper?" (collapsed)
  recommended?: boolean; // surfaced first on the category page
};

export const STRATEGY_CATEGORIES: StrategyCategory[] = [
  // ---- Personal & ADHD — problem-language, ordered for how people think ----
  { id: "overwhelm", group: "personal", label: "Feeling Overwhelmed", emoji: "🌊", color: "#4a6fa5", blurb: "When everything feels like too much." },
  { id: "procrastination", group: "personal", label: "Having Trouble Starting", emoji: "🐢", color: "#a85c4a", blurb: "When starting feels impossible." },
  { id: "focus", group: "personal", label: "Focus & Attention", emoji: "🎯", color: "#1e4f4f", blurb: "Staying with one thing." },
  { id: "perfectionism", group: "personal", label: "Perfectionism", emoji: "💎", color: "#9a6fb0", blurb: "When nothing ever feels finished." },
  { id: "burnout", group: "personal", label: "Burnout & Energy", emoji: "🌙", color: "#6b8e23", blurb: "When you're running on empty." },
  { id: "emotional-regulation", group: "personal", label: "Emotions & Self-Talk", emoji: "❤️", color: "#b0506f", blurb: "Working with hard feelings." },
  { id: "decision-making", group: "personal", label: "Decision Making", emoji: "🧭", color: "#2f4f7a", blurb: "When you're stuck choosing." },
  // ---- Business ----
  { id: "marketing", group: "business", label: "Marketing", emoji: "📣", color: "#c08a3e", blurb: "Getting seen by the right people." },
  { id: "sales", group: "business", label: "Sales", emoji: "💰", color: "#1e4f4f", blurb: "Turning interest into income." },
  { id: "content", group: "business", label: "Content Creation", emoji: "📝", color: "#9a6fb0", blurb: "Making content without burning out." },
  { id: "offers", group: "business", label: "Offers", emoji: "🎁", color: "#b0506f", blurb: "Shaping what you sell." },
  { id: "pricing", group: "business", label: "Pricing", emoji: "🏷️", color: "#c08a3e", blurb: "Charging what your work is worth." },
  { id: "systems", group: "business", label: "Systems", emoji: "🔧", color: "#6b8e23", blurb: "Repeatable processes that run without you." },
  { id: "customer-relations", group: "business", label: "Client Relationships", emoji: "🤝", color: "#2f4f7a", blurb: "Keeping the clients you have happy." },
  { id: "productivity", group: "business", label: "Productivity", emoji: "⚙️", color: "#a85c4a", blurb: "Getting meaningful work done." },
  { id: "planning", group: "business", label: "Planning", emoji: "🗺️", color: "#4a6fa5", blurb: "Deciding what matters and when." },
  { id: "business-decisions", group: "business", label: "Decision Making", emoji: "🧭", color: "#2f4f7a", blurb: "Choosing a direction for the business." },
];

// Existing built-in strategies were authored under older category ids. This map
// re-homes each into the new subcategory taxonomy WITHOUT editing every object.
// New strategies set categoryId directly to a subcategory and need no entry.
const STRATEGY_TO_SUBCAT: Record<string, string> = {
  "two-minute-start": "procrastination",
  "shrink-first-step": "overwhelm",
  "body-double": "focus",
  "lower-activation-energy": "procrastination",
  "pick-then-learn": "decision-making",
  "eighty-percent-ship": "perfectionism",
  "ugly-first-draft": "perfectionism",
  "good-enough-bar": "perfectionism",
  "shrink-the-world": "overwhelm",
  "one-door-at-a-time": "focus",
  "run-your-own-race": "emotional-regulation",
  "borrow-belief": "emotional-regulation",
  "reduce-before-add": "burnout",
  "one-hard-thing": "focus",
  "future-self-check": "procrastination",
  "one-channel": "marketing",
  "content-from-convos": "content",
  "repurpose-one": "content",
  "follow-up-first": "sales",
  "one-clear-offer": "offers",
  "offer-help-not-sales": "sales",
  "ask-directly": "sales",
  "check-in-cadence": "customer-relations",
  "fix-it-fast": "customer-relations",
  "surprise-value": "customer-relations",
  "scope-before-start": "customer-relations",
};

// The subcategory a strategy lives in (map override → else its own categoryId).
export function resolveSubcat(s: Strategy): string {
  return STRATEGY_TO_SUBCAT[s.id] ?? s.categoryId;
}

export const STRATEGIES: Strategy[] = [
  // ============================ PROCRASTINATION ============================
  {
    id: "two-minute-start",
    categoryId: "procrastination",
    title: "The 2-Minute Entry",
    whenToUse: "Any task you've been putting off.",
    problem:
      "There's a task you know you should do, and somehow you keep not doing it.\nIt's not laziness. The task has grown a wall around it in your mind.\nEvery time you think about it, you feel the whole thing at once — and your brain backs away.",
    whyBrain:
      "ADHD brains run on activation, not willpower.\nStarting is the hardest moment because it asks for a burst of energy before there's any reward.\nSo the brain waits for a feeling of \"ready\" that often never arrives.",
    whyWorks:
      "Two minutes is too small to dread.\nYou're not committing to finish — you're only opening the door.\nAnd once you're moving, the same momentum that was impossible to start becomes hard to stop. Starting is the whole battle.",
    example:
      "You've avoided writing a proposal for three days.\nYou tell yourself: just open the document and type the client's name.\nThat's it. Ten minutes later you've written half of it — because the wall was never the work, it was the start.",
    steps: [
      "Pick the one task.",
      "Do only the first 2 minutes of it.",
      "Give yourself full permission to stop after — you usually won't want to.",
    ],
    deeper:
      "Common mistake: secretly making the 2 minutes a trick to force the whole task. Your brain notices the bait-and-switch and resists harder next time. Mean it — stopping at 2 minutes is a real, allowed outcome. The trust is what keeps the move working.",
    recommended: true,
  },
  {
    id: "shrink-first-step",
    categoryId: "procrastination",
    title: "Shrink the First Step",
    whenToUse: "When the scope is overwhelming you.",
    problem:
      "The task feels too big to begin, so you don't begin at all.\n\"Launch the website.\" \"Do the taxes.\" \"Fix the funnel.\"\nThe size of it freezes you before you've moved an inch.",
    whyBrain:
      "ADHD makes it hard to break a big thing into its parts automatically.\nThe brain sees one giant undefined blob instead of a sequence of small actions.\nA blob can't be started — only a specific action can.",
    whyWorks:
      "A first step small enough to feel silly is a first step you'll actually take.\nAction reduces anxiety far faster than planning does.\nOnce one tiny piece is real, the next one becomes visible.",
    example:
      "\"Redo my whole sales page\" feels impossible.\nShrunk: \"Open the page and change the headline.\"\nThat you can do. And usually, once the headline's done, you keep going.",
    steps: [
      "Name the very first physical action.",
      "Make it absurdly small — almost embarrassingly so.",
      "Do just that. Nothing else is required.",
    ],
    recommended: true,
  },
  {
    id: "body-double",
    categoryId: "procrastination",
    title: "Body Double",
    whenToUse: "When you can't get going alone.",
    problem:
      "Alone, the task drifts. You open ten tabs, check your phone, wander off.\nBut put one other person in the room and suddenly you can focus.\nYou're not weak — you're wired for shared attention.",
    whyBrain:
      "ADHD attention is interest- and presence-based, not schedule-based.\nAnother person's quiet presence creates gentle accountability and an external anchor.\nIt borrows their focus to steady yours.",
    whyWorks:
      "You're not asking them to help with the work — just to exist nearby.\nThat single change removes the easy invisible escape routes.\nMany people get more done in one body-doubled hour than a whole solo afternoon.",
    example:
      "You've been dodging your inbox all week.\nYou hop on a video call with a friend, both working in silence.\nForty minutes later, inbox cleared — because someone was there.",
    steps: [
      "Get a person present — same room, or on video.",
      "Tell them the one thing you'll do.",
      "Start while they're there. They don't have to do anything.",
    ],
    deeper:
      "No human available? A coworking livestream, a focus-timer app with others, or even Shari checking in can stand in. The mechanism is witnessed effort, not the specific person.",
  },

  // ============================ PERFECTIONISM ============================
  {
    id: "eighty-percent-ship",
    categoryId: "perfectionism",
    title: "80% Ship",
    whenToUse: "When you're polishing past the point it matters.",
    problem:
      "Many ADHD entrepreneurs get stuck trying to make things perfect.\nA social post becomes a two-hour project. An email gets rewritten five times. A sales page never gets published.\nThe goal quietly shifts from \"done\" to \"perfect\" — and that's where momentum gets lost.",
    whyBrain:
      "Perfectionism is often a protection strategy.\nMistakes may have felt costly in the past, so \"perfect\" feels safer than \"finished.\"\nThe problem is that perfect keeps moving — nothing ever feels ready.",
    whyWorks:
      "The final 20% of polishing often takes as much time as the first 80%.\nMost people will never notice those extra tweaks. What they notice is whether the thing exists.\nProgress creates feedback. Feedback creates improvement. Nothing in a drafts folder can.",
    example:
      "You spend 90 minutes writing an email.\nThe message is clear, the links work, the offer makes sense.\nNow you're changing commas, wording, colors. That's usually your sign. Ship it.",
    steps: [
      "Get it to 80%.",
      "Ask: does this accomplish the goal?",
      "Ask: would it help someone today?",
      "If yes, release it.",
    ],
    coach: [
      "What are you working on that you keep polishing?",
      "What are you still changing about it?",
      "What's making it feel unfinished?",
      "What would happen if you released it today?",
    ],
    deeper:
      "Advanced version: pre-decide the bar before you start (\"clear and correct, not beautiful\"). Deciding \"done\" up front stops the goalposts from sliding while you're emotionally in it.",
  },
  {
    id: "ugly-first-draft",
    categoryId: "perfectionism",
    title: "Start Ugly",
    whenToUse: "When the blank page paralyzes you.",
    problem:
      "You can't start creating because the first version in your head is already supposed to be good.\nSo you stare at the blank page, and nothing comes.\nThe gap between \"nothing\" and \"impressive\" is too wide to leap in one jump.",
    whyBrain:
      "ADHD brains often can't separate drafting from editing — both fire at once.\nYou try to write and judge in the same breath, and the judging wins.\nThat internal critic shows up before there's even anything to critique.",
    whyWorks:
      "Giving yourself permission to be bad splits the two jobs apart.\nFirst you create badly, then later you fix — and fixing something that exists is ten times easier than making something from nothing.\nUgly and done beats perfect and imaginary.",
    example:
      "You need a newsletter and you're stuck.\nYou type \"this is going to be terrible:\" and then just ramble for five minutes.\nNow you have raw material. Cleaning it up is the easy part.",
    steps: [
      "Give yourself explicit permission for it to be bad.",
      "Produce a rough version fast — speed over quality.",
      "Refine later. Not now. Now is only for getting it out.",
    ],
    recommended: true,
  },
  {
    id: "good-enough-bar",
    categoryId: "perfectionism",
    title: "Good-Enough Bar",
    whenToUse: "When you're editing something forever.",
    problem:
      "You keep editing the same thing, and somehow it's never quite finished.\nThere's always one more tweak, one more pass.\nWithout a clear finish line, the work expands to fill all the time you have.",
    whyBrain:
      "ADHD makes endings fuzzy. Without a defined \"done,\" the brain has no signal to stop.\nAnd the small dopamine hits of tweaking feel productive even when they're not moving anything forward.\nSo you keep circling.",
    whyWorks:
      "Deciding what \"done\" means before you start gives your brain a target it can actually hit.\nA time limit turns an endless task into a contained one.\nYou stop when you reach the bar — not when it feels perfect, because that feeling rarely comes.",
    example:
      "You're tweaking a logo for the fourth hour.\nYou set a rule: \"Done = readable, on-brand, and I'd hand it to a client.\"\nIt already meets that. So you stop, and you ship.",
    steps: [
      "Decide what \"done\" means — in one sentence — before you start.",
      "Set a time limit.",
      "Ship it at the limit, whether or not it feels perfect.",
    ],
    recommended: true,
  },

  // ============================ MINDSET & GROWTH ============================
  {
    id: "shrink-the-world",
    categoryId: "mindset",
    title: "Shrink the World",
    whenToUse: "When everything feels like too much at once.",
    problem:
      "Everything is loud at the same time. Every task feels urgent, every worry feels equal.\nYour mind is holding the whole business — and your whole life — all at once.\nWhen everything is a priority, nothing can be, and you freeze.",
    whyBrain:
      "ADHD working memory struggles to rank and hold many things at once, so it holds them all at full volume.\nThe brain can't tell the brain that one email matters less than payroll.\nOverwhelm isn't too much to do — it's too much in view.",
    whyWorks:
      "You can't calm a flooded mind by thinking harder. You calm it by narrowing the frame.\nShrinking the world to the next hour and one task gives your nervous system something it can actually handle.\nThe rest still exists — it's just out of the spotlight for now.",
    example:
      "Twelve things are screaming for attention and you're frozen on the couch.\nYou ask: \"What's the one thing that matters in the next hour?\"\nJust that. The other eleven wait. And suddenly you can move.",
    steps: [
      "Pause. Name out loud that everything feels like too much — that's real.",
      "Ask: what's the ONE thing that matters in the next hour?",
      "Put everything else out of view. Do only that one thing.",
    ],
    coach: [
      "What feels loudest right now?",
      "What are the 2–3 things competing for your attention?",
      "Which one matters most in the next hour?",
      "Can everything else wait until that one is done?",
    ],
    deeper:
      "Overwhelm is often a nervous-system state, not a planning problem. If shrinking the task isn't enough, shrink the body's load first — slow breath, water, a short walk — then re-pick the one thing. Regulation before strategy.",
    recommended: true,
  },
  {
    id: "one-door-at-a-time",
    categoryId: "mindset",
    title: "One Door at a Time",
    whenToUse: "When too many ideas pull you in every direction.",
    problem:
      "You have more ideas than time — a new offer, a podcast, a course, a rebrand, all at once.\nEach one is exciting, so you start several and finish none.\nThe ideas aren't the problem. Chasing all of them at once is.",
    whyBrain:
      "ADHD brains are idea machines, drawn hard toward novelty.\nA fresh idea delivers a dopamine hit that an in-progress project can't compete with.\nSo attention keeps jumping to the newest shiny door instead of walking through one.",
    whyWorks:
      "Picking one door doesn't kill the others — it just lines them up.\nFinishing one thing creates real results, and results fund and fuel the next idea.\nMomentum compounds when it's pointed in a single direction instead of scattered.",
    example:
      "You're building a course, a membership, and a new service all at once.\nYou choose the course as this month's one door, and park the rest in a list.\nBy month's end the course is live — instead of three things half-built.",
    steps: [
      "Write every idea down, so none feel lost.",
      "Pick the ONE that matters most right now.",
      "Walk through that door fully before opening the next.",
    ],
    coach: [
      "How many projects or ideas are currently open for you?",
      "Which one would create the biggest relief if it moved forward?",
      "What's one small step you could take on just that one today?",
    ],
    deeper:
      "Keep a visible \"idea parking lot.\" The reason ideas hijack you is the fear of forgetting them. Once they're safely captured, your brain relaxes its grip and lets you focus on the one in front of you.",
    recommended: true,
  },
  {
    id: "run-your-own-race",
    categoryId: "mindset",
    title: "Run Your Own Race",
    whenToUse: "When comparison is draining your motivation.",
    problem:
      "You open social media and everyone seems further ahead.\nTheir launch, their numbers, their ease — and suddenly your own progress feels like nothing.\nComparison quietly drains the motivation you need to keep going.",
    whyBrain:
      "ADHD comes with rejection-sensitive dysphoria and a tendency toward all-or-nothing thinking.\nA single highlight reel can flip you from \"I'm doing okay\" to \"I'm failing\" in seconds.\nThe brain treats someone else's best moment as your everyday baseline.",
    whyWorks:
      "You're comparing your behind-the-scenes to their highlight reel — never a fair race.\nMeasuring against your own past instead of their present gives you an honest, motivating signal.\nThe only comparison that helps is you, now, versus you, a month ago.",
    example:
      "A peer announces a six-figure launch and your stomach drops.\nYou close the app and look at your own last 90 days instead.\nYou've added 40 clients and shipped two offers. That's your race, and you're winning it.",
    steps: [
      "Notice the comparison without judging yourself for it.",
      "Ask: am I further along than I was a month ago?",
      "Redirect to your one next action. Their race isn't yours to run.",
    ],
    deeper:
      "Curate your inputs. If certain feeds reliably tank your motivation, that's data, not weakness — mute, unfollow, or time-box them. Protecting your attention is part of running your business.",
  },
  {
    id: "borrow-belief",
    categoryId: "mindset",
    title: "Borrow Belief",
    whenToUse: "When you feel like a fraud who'll be found out.",
    problem:
      "You're doing the work, getting results — and still feel like a fraud who'll be found out.\nThe wins feel like luck. The praise feels misplaced.\nImposter syndrome whispers that you don't really belong here.",
    whyBrain:
      "ADHD often comes with a lifetime of corrective feedback, so the inner critic is loud and well-practiced.\nYou may not store your wins emotionally the way you store your misses — so the evidence of competence doesn't \"land.\"\nFeeling like a fraud isn't proof you are one; it's a familiar old tape.",
    whyWorks:
      "You don't have to manufacture confidence you don't feel yet.\nYou can borrow it — from a client's words, a past win, or someone who believes in you — and act as if, until your own belief catches up.\nConfidence usually follows evidence and action, not the other way around.",
    example:
      "You're about to raise your rates and feel sick about it.\nYou reread three testimonials from clients you genuinely helped.\nYou borrow their certainty for the length of the call — and you send the higher number.",
    steps: [
      "Name the fear plainly: \"I feel like a fraud right now.\"",
      "Borrow proof — a testimonial, a past win, a person who believes in you.",
      "Act from their belief until your own catches up.",
    ],
    deeper:
      "Keep an \"evidence file\" — screenshots of kind words, results, wins. Imposter feelings are a memory problem as much as a confidence one. When the tape plays, you read the file instead of arguing with your brain.",
  },
  {
    id: "reduce-before-add",
    categoryId: "mindset",
    title: "Reduce Before You Add",
    whenToUse: "When you're running on empty.",
    problem:
      "You're exhausted, and your instinct is to push harder — add a system, a habit, a new effort.\nBut you're already past full. Adding more is pouring water into a glass that's overflowing.\nBurnout doesn't get fixed by doing more.",
    whyBrain:
      "ADHD brains often run hot — hyperfocus, masking, and constant context-switching burn fuel faster than most people realize.\nYou may not feel the depletion until you're well past it.\nAnd the cultural fix (\"just be more disciplined\") adds load instead of removing it.",
    whyWorks:
      "When you're empty, subtraction is the highest-leverage move.\nRemoving one draining commitment frees more energy than any new productivity hack could create.\nYou recover capacity by lowering demand, not by demanding more.",
    example:
      "You're fried and about to add a 5am routine to \"get it together.\"\nInstead you cancel the two commitments that drain you most this week.\nThe relief is immediate — and now there's room to actually rest.",
    steps: [
      "Stop. Resist the urge to add anything new.",
      "Find one thing you can remove, pause, or hand off this week.",
      "Let the lighter load be the whole plan for now.",
    ],
    deeper:
      "Rest is a strategy, not a reward you earn after collapse. Scheduling recovery before you're depleted keeps your capacity steady. For ADHD especially, a sustainable lower output beats a brilliant burst followed by a crash.",
  },
  {
    id: "one-hard-thing",
    categoryId: "mindset",
    title: "One Hard Thing",
    whenToUse: "When effort is scattered across too much.",
    problem:
      "Your effort is spread across a dozen things, so nothing really moves.\nYou end the day busy but unable to point to what you actually advanced.\nMotion isn't the same as progress.",
    whyBrain:
      "ADHD attention chases whatever feels stimulating in the moment, not whatever matters most.\nSo the easy, urgent, and shiny tasks crowd out the one important hard one.\nThe hard thing keeps getting postponed because it doesn't reward you instantly.",
    whyWorks:
      "Protecting one focused block for the single most important thing guarantees the needle moves.\nEverything else can happen in the leftover time — but the thing that matters gets the prime energy.\nOne hard thing done daily compounds into a transformed business.",
    example:
      "You've got emails, errands, and a sales call to prep.\nYou guard 25 minutes for the call prep first — the one thing that earns money.\nThe small stuff still gets done later, but the important thing didn't get bumped.",
    steps: [
      "Pick the single most important thing today.",
      "Protect 25 minutes for it before anything else.",
      "Let the rest wait until that block is done.",
    ],
    recommended: true,
  },
  {
    id: "future-self-check",
    categoryId: "mindset",
    title: "Future You Isn't Coming",
    whenToUse: "When you're counting on a more-motivated version of you.",
    problem:
      "You put things off for \"later,\" trusting a future version of you who'll have more time, energy, and motivation.\nBut later arrives and that person never shows up — it's just you, with the same brain, now under more pressure.\nTime blindness makes \"later\" feel like a different, more capable person.",
    whyBrain:
      "ADHD weakens the felt connection to your future self — the future feels abstract and far away, even when it's tomorrow.\nSo present-you discounts it and hands the work to a fantasy future-you who doesn't exist.\nThe deadline only becomes real when it becomes an emergency.",
    whyWorks:
      "Naming that future-you isn't coming pulls the work back into the present, where it can actually be done.\nDoing the smallest version now means future-you inherits progress instead of panic.\nYou become the person who shows up — by showing up a little, today.",
    example:
      "You tell yourself you'll prep the workshop \"this weekend when I'm fresh.\"\nYou catch it: future-you is just as busy and tired.\nSo you draft the first slide now. Weekend-you gets a head start instead of a crisis.",
    steps: [
      "Notice when you're handing a task to \"future me.\"",
      "Ask what future-you will actually need.",
      "Do the smallest version of it now, as a gift to them.",
    ],
    deeper:
      "Make the future concrete: a visible deadline, a calendar block, a written note from \"today-you.\" The more real the future feels, the less your brain can quietly outsource the work to a person who never arrives.",
  },
  {
    id: "lower-activation-energy",
    categoryId: "procrastination",
    title: "Lower the Activation Energy",
    whenToUse: "When you can't stay consistent.",
    problem:
      "You do great for a few days, then fall off — and can't seem to be consistent.\nIt's not that you don't care. Restarting each time takes a huge burst of effort.\nThe friction of beginning, over and over, wears you down.",
    whyBrain:
      "ADHD consistency fails at the activation step, not the caring step.\nEvery extra bit of friction — finding the file, setting up, deciding where to start — is a tax the brain pays before any reward.\nEnough friction and the brain quietly opts out.",
    whyWorks:
      "Lowering the cost of starting makes showing up almost automatic.\nWhen the tools are already open and the next step is obvious, there's barely a wall to climb.\nConsistency comes from removing friction, not from adding discipline.",
    example:
      "You keep meaning to post content but never \"get around to it.\"\nYou leave a doc open with three half-written hooks ready to go.\nNow posting takes 90 seconds instead of an hour — so you actually keep doing it.",
    steps: [
      "Notice where you keep stalling out.",
      "Remove the friction in advance — set it up so starting is nearly free.",
      "Make the next step so obvious that future-you can't get lost.",
    ],
    deeper:
      "Design your environment to do the remembering for you: tools left open, templates pre-made, a recurring tiny cue. For ADHD, a good system isn't about motivation — it's about needing less of it.",
    recommended: true,
  },
  {
    id: "pick-then-learn",
    categoryId: "procrastination",
    title: "Pick Then Learn",
    whenToUse: "When you're stuck choosing between options.",
    problem:
      "You're stuck between options and can't decide, so you research endlessly and choose nothing.\nWhich platform, which price, which niche — the decision loops without landing.\nMeanwhile the not-deciding is quietly costing you more than a wrong choice would.",
    whyBrain:
      "ADHD makes open loops genuinely uncomfortable, and the fear of the \"wrong\" choice keeps every option open at once.\nWeighing many unknowns overloads working memory, so the brain stalls instead of selecting.\nDecision paralysis feels safer than committing — but it isn't.",
    whyWorks:
      "Most decisions are reversible, and you learn more from one real attempt than from weeks of research.\nPicking turns abstract worry into concrete feedback you can act on.\nYou can't steer a parked car — choosing a direction is what lets you correct course.",
    example:
      "You've spent two weeks comparing email platforms.\nYou just pick the reasonable one and start using it today.\nWithin a week you actually know if it fits — something no amount of comparing could have told you.",
    steps: [
      "Set a short deadline to decide — minutes, not days.",
      "Pick the good-enough option. It doesn't have to be perfect.",
      "Treat it as an experiment. Learn from the doing, adjust later.",
    ],
    deeper:
      "Separate one-way doors from two-way doors. Truly irreversible decisions deserve care; most business choices are two-way doors you can walk back through. Spending one-way-door energy on two-way-door choices is where the paralysis lives.",
  },

  // ============================ MARKETING ============================
  {
    id: "one-channel",
    categoryId: "marketing",
    title: "One Channel Focus",
    whenToUse: "When you're posting everywhere with no results.",
    problem:
      "You're trying to be on every platform — Instagram, LinkedIn, TikTok, email, the lot.\nSo you post a little everywhere, exhaust yourself, and nothing really lands.\nBeing everywhere thinly is quieter than being somewhere fully.",
    whyBrain:
      "ADHD novelty-seeking makes new platforms exciting and consistency hard.\nEach channel demands its own learning curve and rhythm, and switching between them shreds your attention.\nThe variety feels productive but scatters the very momentum marketing needs.",
    whyWorks:
      "One channel, shown up to consistently, lets the algorithm and an audience actually get to know you.\nDepth beats spread — a real presence in one place outperforms a faint one in five.\nAnd one channel is far less to manage, so you can keep going.",
    example:
      "You're burnt out cross-posting to four platforms with crickets everywhere.\nYou drop down to LinkedIn only, once a day, for two weeks.\nThe focus pays off — conversations start happening where you actually live.",
    steps: [
      "Pick ONE channel — where your people already are.",
      "Show up there once a day for two weeks.",
      "Ignore the rest for now. You can expand later, from strength.",
    ],
    recommended: true,
  },
  {
    id: "content-from-convos",
    categoryId: "marketing",
    title: "Content from Conversations",
    whenToUse: "When you don't know what to post.",
    problem:
      "You sit down to make content and your mind goes blank.\n\"What do I even say?\" So you post nothing, or something generic that doesn't sound like you.\nThe blank-page problem keeps your best thinking invisible.",
    whyBrain:
      "ADHD makes generating ideas from a cold start hard, but responding to a real prompt easy.\nA blank page gives the brain nothing to react to; a real question gives it traction.\nYou're not out of ideas — you're out of starting points.",
    whyWorks:
      "Real client questions are pre-validated content — if one person asked, others are wondering.\nAnswering a genuine question is far easier than inventing a topic, and it sounds natural because it is.\nYour inbox and DMs are an endless, on-demand content calendar.",
    example:
      "A client asks, \"How do I know if my pricing is too low?\"\nInstead of just replying privately, you answer it publicly as a post.\nIt resonates — because it's a question real people actually have.",
    steps: [
      "Note one real question a client or prospect asked.",
      "Answer it publicly — as a post, email, or short video.",
      "Repeat tomorrow with the next question. Keep a running list.",
    ],
    recommended: true,
  },
  {
    id: "repurpose-one",
    categoryId: "marketing",
    title: "Repurpose One Idea",
    whenToUse: "When making new content burns you out.",
    problem:
      "Every piece of content feels like starting from scratch, and it's exhausting.\nYou create something good once, then abandon it and reinvent the wheel tomorrow.\nThe pressure to always be original is burning you out.",
    whyBrain:
      "ADHD brains crave novelty, so reusing an idea can feel like \"cheating\" — even though it's smart.\nMeanwhile the constant cold-start creation drains the limited focus you have.\nYou under-use your best ideas because making new ones feels more stimulating.",
    whyWorks:
      "One strong idea can become a post, a story, an email, and a video — reaching different people in different moods.\nRepurposing multiplies your reach without multiplying your effort.\nYour audience didn't all see it the first time anyway.",
    example:
      "You write one really good post about a client win.\nYou reshape it into an email, a carousel, and a short video over the week.\nFour pieces of content, one idea, a fraction of the energy.",
    steps: [
      "Take your single best idea.",
      "Reshape it three ways — post, story, email.",
      "Space them across a week so it never feels repetitive.",
    ],
  },

  // ============================ SALES & REVENUE ============================
  {
    id: "offer-help-not-sales",
    categoryId: "sales",
    title: "Offer Help, Not Sales",
    whenToUse: "When selling makes you cringe or freeze.",
    problem:
      "You know you need to sell, but it makes you cringe — pushy, salesy, gross.\nSo you hint, you under-charge, you wait to be chosen, and you avoid asking directly.\nThe discomfort with selling quietly caps your income.",
    whyBrain:
      "ADHD rejection sensitivity makes a \"no\" feel like a personal wound, so the brain avoids the ask entirely.\nAnd many of us absorbed a story that wanting money is rude.\nSo selling feels like risking rejection and breaking a rule at the same time.",
    whyWorks:
      "Reframing the sale as an offer of help changes the whole emotional charge.\nYou're not extracting — you're presenting a solution to someone who has the problem you solve.\nWhen you truly believe your offer helps, not mentioning it is the unkind move, not the other way around.",
    example:
      "Someone describes exactly the struggle your service fixes.\nInstead of staying quiet to seem polite, you say: \"This is literally what I help people with — want me to walk you through it?\"\nThat's not pushy. That's generous.",
    steps: [
      "Find someone who genuinely has the problem you solve.",
      "Frame it as help: \"Here's how I could make this easier for you.\"",
      "Make the offer plainly, then let them decide. Their no isn't about you.",
    ],
    deeper:
      "Separate your worth from the outcome of any single ask. A \"no\" is information about fit and timing, not a verdict on you. The more asks you make from that steadier place, the more the rejection-sensitivity loosens its grip.",
    recommended: true,
  },
  {
    id: "follow-up-first",
    categoryId: "sales",
    title: "Follow-Up First",
    whenToUse: "When warm leads keep going cold.",
    problem:
      "People show interest — and then you never follow up, so the lead goes cold.\nIt's not that you don't care; the follow-up just slips through the cracks.\nYou're leaving money on the table that's already half-earned.",
    whyBrain:
      "ADHD out-of-sight-out-of-mind means a lead you don't see is a lead you forget.\nFollow-up also carries a small rejection risk, which the brain quietly avoids.\nSo warm leads silently expire while you chase new ones.",
    whyWorks:
      "Warm leads are the highest-return work in your whole business — they already know you.\nMost sales happen in the follow-up, not the first contact.\nA single message to someone already interested beats hours of cold outreach.",
    example:
      "Five people said \"let me think about it\" last month, then silence.\nYou message one today: \"Hey, still happy to help whenever you're ready.\"\nTwo of them reply — they'd just forgotten, same as you almost did.",
    steps: [
      "List 5 warm leads while they're in front of you.",
      "Message one of them today.",
      "Schedule the other four so they don't vanish from your mind.",
    ],
    recommended: true,
  },
  {
    id: "one-clear-offer",
    categoryId: "sales",
    title: "One Clear Offer",
    whenToUse: "When people 'think about it' and vanish.",
    problem:
      "You offer a lot of options, hoping something fits — and buyers get confused and walk.\nThe more choices you give, the more people say \"let me think about it\" and disappear.\nA confused mind doesn't buy.",
    whyBrain:
      "ADHD idea-generation produces lots of offers, packages, and variations — it's fun to create them.\nBut every option you add is a decision you hand to the buyer, and decisions create friction.\nYour creativity, unchecked, becomes the customer's overwhelm.",
    whyWorks:
      "One clear offer, one price, one sentence removes the buyer's mental work.\nClarity feels like confidence, and confidence sells.\nWhen the path is obvious, people can actually say yes.",
    example:
      "Your services page lists six packages and three add-ons.\nYou cut it to one: \"I help X do Y for $Z.\"\nInquiries that used to stall now convert — because there's nothing to puzzle over.",
    steps: [
      "Name the one problem you solve.",
      "Put one price on it.",
      "Say it in a single, plain sentence.",
    ],
    recommended: true,
  },
  {
    id: "ask-directly",
    categoryId: "sales",
    title: "Ask Directly",
    whenToUse: "When an interested person is on the fence.",
    problem:
      "Someone's interested, the conversation's going well — and you never actually ask for the sale.\nYou talk around it, hoping they'll decide on their own.\nThe deal dies in the silence where the ask should have been.",
    whyBrain:
      "ADHD rejection sensitivity makes the direct ask feel dangerous, so you soften it into nothing.\nAnd the discomfort of the pause after asking is so uncomfortable the brain fills it or avoids it.\nYou'd rather not ask than risk hearing no.",
    whyWorks:
      "A clear ask respects the other person — it lets them actually choose.\nMost interested people are waiting to be invited, not chased.\nAsking and then staying quiet gives them the space to say yes.",
    example:
      "A prospect loves what you've described and seems ready.\nYou ask plainly: \"Do you want to move forward?\" — then you stop talking.\nThey say yes. The only thing missing was the question.",
    steps: [
      "Pick one genuinely interested person.",
      "Ask directly: \"Do you want to move forward?\"",
      "Then stay quiet and let them answer. Don't rescue the silence.",
    ],
  },

  // ============================ CUSTOMER RELATIONS ============================
  {
    id: "check-in-cadence",
    categoryId: "clients",
    title: "Check-In Cadence",
    whenToUse: "When clients go quiet between projects.",
    problem:
      "Between projects, clients drift, and you forget to stay in touch.\nThen you only reach out when you want something — which feels transactional.\nGood relationships fade simply from neglect, not from any real problem.",
    whyBrain:
      "ADHD out-of-sight-out-of-mind means past clients genuinely vanish from your awareness.\nWithout an external rhythm, \"I should check in\" never becomes \"I checked in.\"\nThe intention is there; the trigger isn't.",
    whyWorks:
      "A simple recurring rhythm turns relationship-keeping into a habit instead of a memory test.\nA genuine, no-strings check-in keeps you top of mind for referrals and repeat work.\nThe clients you already have are your warmest future revenue.",
    example:
      "A great client wrapped a project four months ago and you've gone silent.\nYou send a quick \"Thought of you — how did that launch go?\"\nThey reply warmly, and mention a new project they need help with.",
    steps: [
      "Pick a rhythm — weekly or monthly.",
      "Send one genuine, no-ask check-in.",
      "Note the date so the next one isn't left to memory.",
    ],
    recommended: true,
  },
  {
    id: "fix-it-fast",
    categoryId: "clients",
    title: "Fix It Fast",
    whenToUse: "When an unhappy client just reached out.",
    problem:
      "A complaint comes in and it stings, so you avoid it — and the avoidance makes it worse.\nThe longer it sits unaddressed, the bigger and more charged it becomes.\nA fixable issue curdles into a damaged relationship.",
    whyBrain:
      "ADHD rejection sensitivity makes criticism feel like a threat, so the instinct is to flinch and delay.\nThe emotional discomfort of the unread message keeps you from opening it.\nAvoidance feels protective but quietly raises the stakes.",
    whyWorks:
      "A fast, non-defensive response often turns an unhappy client into a loyal one.\nPeople forgive mistakes far more easily than they forgive being ignored.\nOwning it quickly shrinks the problem before it can grow.",
    example:
      "A client emails, frustrated that a deliverable missed the mark.\nWithin the hour you reply: \"You're right, I dropped this — here's how I'll fix it today.\"\nThey thank you, and the relationship comes out stronger than before.",
    steps: [
      "Acknowledge within the hour — even just \"I see this, fixing it now.\"",
      "Own it. No defensiveness, no excuses.",
      "Offer one concrete fix and follow through.",
    ],
    recommended: true,
  },
  {
    id: "surprise-value",
    categoryId: "clients",
    title: "Surprise Value",
    whenToUse: "When you want a client to feel truly valued.",
    problem:
      "Clients are happy enough, but the relationship feels purely transactional.\nNothing's wrong — but nothing makes you memorable either.\nWithout a reason to feel special, even good clients drift toward whoever's newest.",
    whyBrain:
      "ADHD makes consistent relationship-tending hard, so thoughtful gestures rarely happen on their own.\nThe spontaneous \"I should do something nice\" thought arrives and then evaporates.\nGood intentions don't survive without a nudge to act on them.",
    whyWorks:
      "An unexpected, no-strings gift of value creates genuine loyalty and word-of-mouth.\nSurprise lands harder than anything expected or owed.\nGiving without an ask attached is what people remember and talk about.",
    example:
      "You notice an article that perfectly fits a client's current challenge.\nYou send it with a quick note: \"Saw this and thought of you — no agenda.\"\nThat tiny gesture is what they mention when they refer you to a friend.",
    steps: [
      "Pick one client.",
      "Give something unexpected and genuinely useful.",
      "Attach no ask to it. Let the goodwill be the whole point.",
    ],
  },

  // ============================ MARKETING (more) ============================
  {
    id: "talk-to-five",
    categoryId: "marketing",
    title: "Talk to Five People",
    whenToUse: "When your marketing feels like guessing.",
    problem:
      "You're making content and offers based on what you think people want.\nBut you're guessing, and the guessing makes everything feel uncertain.\nWithout real input, marketing becomes a shot in the dark.",
    whyBrain:
      "ADHD brains can hyperfocus on creating in isolation, avoiding the vulnerable step of asking real people.\nReaching out risks rejection, so the brain prefers to keep tinkering alone.\nBut tinkering without feedback just multiplies the guessing.",
    whyWorks:
      "Five real conversations tell you more than fifty hours of guessing.\nPeople will hand you their exact words, pains, and objections — the raw material of marketing that lands.\nYou stop inventing messaging and start echoing what they already feel.",
    example:
      "You're stuck on how to describe your offer.\nYou message five past clients and ask what problem you solved for them.\nTheir answers become your headline — in language that actually converts.",
    steps: [
      "Pick five people who fit your ideal client.",
      "Ask one real question about their struggle.",
      "Use their exact words in your next post or offer.",
    ],
    coach: [
      "Who are five people that fit your ideal client?",
      "What's the one question you'd love an honest answer to?",
      "How could you reach out to just one of them today?",
    ],
    recommended: true,
  },

  // ============================ PLANNING ============================
  {
    id: "one-page-week",
    categoryId: "planning",
    title: "The One-Page Week",
    whenToUse: "When the week starts and you're already behind.",
    problem:
      "You begin the week reacting — to email, to whatever's loudest — and never to a plan.\nBy Friday you're busy but unsure what actually moved.\nWithout a simple plan, the urgent eats the important.",
    whyBrain:
      "ADHD makes long, detailed plans feel like cages you abandon by Tuesday.\nAnd holding the whole week in your head is impossible, so it all blurs.\nThe fix isn't more planning — it's less, made visible.",
    whyWorks:
      "One page, three priorities, keeps the week's intention in view without overwhelming you.\nA short plan you actually look at beats a detailed one you ignore.\nIt turns a reactive week into a directed one.",
    example:
      "Sunday night you write three things that matter this week on one page.\nWhen Wednesday chaos hits, you glance at it and re-anchor.\nThe week ends with the three things done, not just the inbox.",
    steps: [
      "Name the three outcomes that matter most this week.",
      "Write them on one page you'll actually see.",
      "Each morning, pick today's piece of one of them.",
    ],
    coach: [
      "What are the three outcomes that would make this week a win?",
      "Which one matters most?",
      "What's the first small piece of it you could do today?",
    ],
    recommended: true,
  },

  // ============================ PRODUCTIVITY ============================
  {
    id: "three-task-day",
    categoryId: "productivity",
    title: "The Three-Task Day",
    whenToUse: "When your to-do list is a wall of guilt.",
    problem:
      "Your list has forty things on it, so it feels impossible and you freeze.\nEverything looks equally urgent, which means nothing gets prioritized.\nThe list meant to help you has become a source of dread.",
    whyBrain:
      "ADHD working memory can't rank a long list, so a big list reads as one giant undifferentiated threat.\nThe length itself triggers avoidance.\nYou need the day shrunk to something the brain can actually hold.",
    whyWorks:
      "Three tasks is a number your brain can see, hold, and finish.\nFinishing all three creates a real sense of completion the endless list never gives.\nThe other thirty-seven still exist — they're just not today's job.",
    example:
      "Your list is overwhelming, so you pick three: invoice, one post, one call.\nYou do those three and call the day a win.\nThe momentum carries into tomorrow's three.",
    steps: [
      "Pick the three tasks that would make today count.",
      "Hide or ignore the rest of the list.",
      "Finish those three before adding anything new.",
    ],
    coach: [
      "If only three things got done today, which three would matter most?",
      "Which of those three is the one to start with?",
      "What's the smallest first move on it?",
    ],
    recommended: true,
  },

  // ============================ SYSTEMS ============================
  {
    id: "write-it-down-once",
    categoryId: "systems",
    title: "Write It Down Once",
    whenToUse: "When you keep redoing the same task from scratch.",
    problem:
      "Every time a recurring task comes up, you figure it out again from zero.\nOnboarding a client, posting a launch, sending an invoice — same effort, every time.\nYou're paying full price for work you've already done before.",
    whyBrain:
      "ADHD makes documenting feel boring compared to just doing, so the steps live only in your head.\nBut your memory is unreliable under load, so each repeat is a fresh reinvention.\nThe tedium of writing it down once feels worse than the cost of redoing it forever — until you notice the math.",
    whyWorks:
      "A simple checklist, written once, removes the thinking from every future repeat.\nIt also makes the task handoff-able, so future-you (or someone else) can run it.\nSystems are how a business stops depending on you remembering everything.",
    example:
      "You onboard clients differently every time and things slip.\nOne time, you write the seven steps in a note as you go.\nNow every onboarding is the same calm checklist — no slips, no reinventing.",
    steps: [
      "Pick one task you do over and over.",
      "The next time you do it, write each step as you go.",
      "Save it somewhere you'll find it next time.",
    ],
    coach: [
      "What's a task you keep figuring out from scratch?",
      "Could you jot the steps down the next time you do it?",
      "Where would you save it so future-you finds it?",
    ],
    recommended: true,
  },

  // ============================ CLIENT WORK ============================
  {
    id: "scope-before-start",
    categoryId: "client-work",
    title: "Scope It Before You Start",
    whenToUse: "When projects balloon past what you agreed to.",
    problem:
      "A project starts clear, then the client adds \"just one more thing\" again and again.\nYou say yes to keep them happy, and the work quietly doubles for the same pay.\nScope creep turns good clients into draining ones.",
    whyBrain:
      "ADHD rejection sensitivity makes saying \"that's extra\" feel like risking the relationship.\nSo you absorb the extra work to avoid the uncomfortable conversation.\nThe resentment builds while the boundary never gets set.",
    whyWorks:
      "A clear scope agreed up front gives you a kind, factual way to handle additions.\nIt's not you being difficult — it's the plan you both agreed to.\nBoundaries set early prevent the burnout and resentment that kill client relationships.",
    example:
      "A client keeps adding requests mid-project.\nYou point back to the scope: \"That's a great idea — it's outside what we set, so let's price it as a phase two.\"\nThey respect it, and you stop working for free.",
    steps: [
      "Before starting, write what's included — and what isn't.",
      "Share it so you both agree on the edges.",
      "When extras come, point to the scope, kindly.",
    ],
    coach: [
      "What project keeps growing past what you agreed to?",
      "What was actually included when you started?",
      "How could you name the extra as a separate phase, kindly?",
    ],
    recommended: true,
  },
];

export function getCategory(id: string): StrategyCategory | undefined {
  return STRATEGY_CATEGORIES.find((c) => c.id === id);
}

// Subcategories belonging to a top-level group, in display order.
export function categoriesForGroup(group: StrategyGroupId): StrategyCategory[] {
  return STRATEGY_CATEGORIES.filter((c) => c.group === group);
}

export function strategiesFor(subcatId: string): Strategy[] {
  return STRATEGIES.filter((s) => resolveSubcat(s) === subcatId);
}

// 2–3 recommended strategies surface first; falls back to the first few.
export function recommendedFor(subcatId: string): Strategy[] {
  const all = strategiesFor(subcatId);
  const rec = all.filter((s) => s.recommended);
  return (rec.length ? rec : all).slice(0, 3);
}

export function getStrategy(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id);
}

// The top-level group a built-in strategy belongs to (via its subcategory).
export function groupForStrategy(s: Strategy): StrategyGroupId {
  return getCategory(resolveSubcat(s))?.group ?? "personal";
}

// One short, human warmth line per subcategory — shown near the top of every
// strategy so the page feels like a coach, not an article.
const STRATEGY_WARMTH: Record<string, string> = {
  overwhelm: "Let's make the world a little smaller for a minute.",
  focus: "Let's make it easier for your brain to stay with one thing.",
  procrastination: "Starting is usually the hardest part.",
  perfectionism: "You don't need to fix yourself — just a different approach.",
  motivation: "Motivation usually follows action, not the other way around.",
  burnout: "You don't have to push harder right now.",
  "decision-making": "There's rarely one perfect choice — just a next one.",
  "emotional-regulation": "What you're feeling makes sense. Let's work with it gently.",
  marketing: "You don't have to be everywhere — just findable.",
  sales: "Selling can just be offering help to someone who needs it.",
  content: "You already know more than enough to share.",
  "customer-relations": "The clients you already have are your warmest next step.",
  planning: "A little structure now saves a lot of scramble later.",
  productivity: "Done beats perfect, and small beats stuck.",
  systems: "Write it down once so future-you doesn't have to think.",
  offers: "Clear beats clever when it comes to what you sell.",
  pricing: "Charging well is part of serving well.",
  "client-work": "Good boundaries are part of good work.",
  "business-decisions": "There's rarely one perfect choice — just a next one.",
};
export function warmthFor(subcatId: string): string | undefined {
  return STRATEGY_WARMTH[subcatId];
}

// Sensible default highlighted action per subcategory (a strategy can override).
const DEFAULT_ACTION: Record<string, StrategyActionId> = {
  overwhelm: "talk",
  focus: "start",
  procrastination: "start",
  perfectionism: "start",
  motivation: "start",
  burnout: "talk",
  "decision-making": "talk",
  "emotional-regulation": "talk",
  marketing: "timeblock",
  sales: "start",
  content: "timeblock",
  "customer-relations": "timeblock",
  planning: "timeblock",
  productivity: "start",
  systems: "timeblock",
  offers: "timeblock",
  pricing: "talk",
  "client-work": "timeblock",
  "business-decisions": "talk",
};
export function recommendedActionFor(s: Strategy): StrategyActionId {
  return s.recommendedAction ?? DEFAULT_ACTION[resolveSubcat(s)] ?? "start";
}

// Rough "time to use" per subcategory (a strategy can override with timeMin).
const DEFAULT_TIME: Record<string, number> = {
  overwhelm: 5,
  focus: 2,
  procrastination: 2,
  perfectionism: 3,
  motivation: 3,
  burnout: 5,
  "decision-making": 5,
  "emotional-regulation": 5,
  marketing: 10,
  sales: 5,
  content: 10,
  "customer-relations": 5,
  planning: 10,
  productivity: 5,
  systems: 10,
  offers: 10,
  pricing: 5,
  "client-work": 5,
  "business-decisions": 5,
};
export function timeForStrategy(s: Strategy): number {
  return s.timeMin ?? DEFAULT_TIME[resolveSubcat(s)] ?? 3;
}
