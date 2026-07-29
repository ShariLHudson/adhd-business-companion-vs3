import type { HelpfulLesson } from "./types";

/**
 * Curated one-at-a-time discovery lessons for Welcome → Show Me Something Helpful.
 * Keep explanations short; destinations must be live/navigable when destinationId is set.
 */
export const HELPFUL_LESSON_REGISTRY: readonly HelpfulLesson[] = [
  {
    id: "park-it",
    title: "Park It",
    shortExplanation:
      "Have one thing you are not ready to deal with? Park it here so you can stop carrying it in your head.",
    destinationId: "parking-lot",
    actionLabel: "Park This",
    category: "capture",
    explanation:
      "Park It is for the one thing you're not ready to deal with yet. Instead of carrying it around, you set it down here and let Spark hold it until you're ready to come back to it.",
    whyNow:
      "Setting down one heavy thing can make the rest of the day feel lighter.",
    primaryActionLabel: "Park This",
    tellMeMore: {
      whatItDoes:
        "It saves a single thing to your Parking Lot so it stops taking up space in your head.",
      howItHelps:
        "You stop re-remembering it, and it waits calmly for when you return.",
      whatToExpect: "You can review everything you've parked whenever you're ready.",
      optional: true,
      timeEstimate: "under a minute",
    },
    lifecycleWindows: ["days-1-14"],
    eligibility: { tags: ["planning", "capture"] },
  },
  {
    id: "parking-lot",
    title: "Parking Lot",
    shortExplanation:
      "Your Parking Lot is a safe place for things you are not ready to act on yet. Review and organize what you parked when you are ready.",
    destinationId: "parking-lot",
    actionLabel: "View My Parking Lot",
    eligibility: { tags: ["planning"] },
  },
  {
    id: "clear-my-mind",
    title: "Clear My Mind",
    shortExplanation:
      "Have a lot swirling around in your head? Put everything here—tasks, ideas, worries, reminders, and unfinished thoughts.",
    destinationId: "clear-my-mind",
    actionLabel: "Empty My Mind",
    category: "capture",
    explanation:
      "Clear My Mind is a place to put everything that's swirling — tasks, ideas, worries, half-thoughts — without sorting or deciding. You empty your head here, and nothing is lost; Spark holds it so you don't have to.",
    whyNow:
      "When your mind feels full, getting it out of your head is often the first relief.",
    primaryActionLabel: "Empty My Mind",
    tellMeMore: {
      whatItDoes:
        "It captures whatever you type, in any order, with no structure required.",
      howItHelps:
        "Getting thoughts out of working memory frees you to think more clearly.",
      whatToExpect:
        "You can organize later in My Thoughts — capturing and organizing stay separate.",
      optional: true,
      timeEstimate: "as long or short as you like",
    },
    lifecycleWindows: ["days-1-14"],
    eligibility: { tags: ["overwhelm", "capture"] },
  },
  {
    id: "plan-my-day",
    title: "Plan My Day",
    shortExplanation:
      "Shape today around priorities, time, and energy — without holding the whole day in your working memory.",
    destinationId: "plan-my-day",
    actionLabel: "Show Me",
    category: "planning",
    explanation:
      "Plan My Day helps you shape today around your priorities, time, and energy — without holding the whole day in your head. You decide what matters, and Spark keeps the shape of it so you can just begin.",
    whyNow:
      "A gentle plan often makes the rest of the day feel lighter and less scattered.",
    primaryActionLabel: "Plan My Day",
    tellMeMore: {
      whatItDoes: "It turns a few priorities into a simple, flexible plan for the day.",
      howItHelps:
        "You carry less in working memory and spend less energy deciding what's next.",
      whatToExpect: "You can adapt the plan any time the day shifts.",
      optional: true,
      timeEstimate: "a few minutes",
    },
    lifecycleWindows: ["days-1-14", "days-15-30"],
    eligibility: { tags: ["planning"] },
  },
  {
    id: "adapt-my-day",
    title: "Adapt My Day",
    shortExplanation:
      "When the day shifts, gently reshape an existing plan instead of starting from scratch.",
    destinationId: "adapt-my-day",
    actionLabel: "Show Me",
    eligibility: { tags: ["planning"] },
  },
  {
    id: "reminders",
    title: "Reminders",
    shortExplanation:
      "Ask for a timely nudge when something matters — without turning your day into a wall of alerts.",
    destinationId: "reminders",
    actionLabel: "Show Me",
    eligibility: { tags: ["memory"] },
  },
  {
    id: "rhythms",
    title: "Rhythms",
    shortExplanation:
      "Build gentle repeating patterns that support your business and life — more flexible than rigid habits.",
    destinationId: "rhythms",
    actionLabel: "Show Me",
    eligibility: { tags: ["memory", "planning"] },
  },
  {
    id: "work-with-shari",
    title: "Work With Shari",
    shortExplanation:
      "Stay in conversation while you work — like quiet company that helps you begin and keep going.",
    actionLabel: "Show Me",
    eligibility: { tags: ["support"] },
  },
  {
    id: "talk-it-out",
    title: "Talk It Out",
    shortExplanation:
      "Think through one situation with Shari, one thoughtful question at a time.",
    destinationId: "talk-it-out",
    actionLabel: "Show Me",
    eligibility: { tags: ["decision", "support"] },
  },
  {
    id: "decision-compass",
    title: "Decision Compass",
    shortExplanation:
      "Walk through a decision with calm structure when options feel tangled.",
    destinationId: "decision-compass",
    actionLabel: "Show Me",
    category: "decision",
    explanation:
      "Decision Compass walks you through a decision with calm structure when the options feel tangled. It doesn't decide for you — it helps you see the choice clearly, one step at a time.",
    whyNow:
      "When a decision keeps looping in your head, a little structure can quiet the noise.",
    primaryActionLabel: "Open Decision Compass",
    tellMeMore: {
      whatItDoes: "It breaks a decision into clear, manageable steps.",
      howItHelps: "You think it through without holding every option at once.",
      whatToExpect: "A guided reflection you can stop and resume any time.",
      optional: true,
      timeEstimate: "5–10 minutes",
    },
    lifecycleWindows: ["days-31-60"],
    eligibility: { tags: ["decision"] },
  },
  {
    id: "chamber",
    title: "Chamber of Momentum",
    shortExplanation:
      "Invite specialized perspectives when you want thoughtful counsel without leaving the Estate.",
    destinationId: "chamber",
    actionLabel: "Show Me",
    category: "room",
    explanation:
      "The Chamber of Momentum is where you can invite specialized perspectives — like Marketing, Finance, or People & Culture — for thoughtful counsel without leaving the Estate. It's there when a question could use more than one angle.",
    whyNow:
      "When a question feels bigger than one viewpoint, the Chamber offers a few.",
    primaryActionLabel: "Visit the Chamber",
    tellMeMore: {
      whatItDoes: "It gathers specialist perspectives you can consult on a specific question.",
      howItHelps: "You get focused counsel without hunting for the right expert.",
      whatToExpect: "You choose who to talk with, and stay in the flow of your work.",
      optional: true,
      timeEstimate: "a few minutes",
    },
    lifecycleWindows: ["days-31-60", "days-61-90"],
    eligibility: { tags: ["decision", "council"] },
  },
  {
    id: "boardroom",
    title: "Round Table Boardroom",
    shortExplanation:
      "Bring a Board of Directors lens to a business question when you want several angles at once.",
    destinationId: "boardroom",
    actionLabel: "Show Me",
    eligibility: { tags: ["decision", "council"] },
  },
  {
    id: "evidence-vault",
    title: "Evidence Vault",
    shortExplanation:
      "Keep meaningful discoveries about yourself and your work so hard days do not erase what you have already learned.",
    destinationId: "evidence-vault",
    actionLabel: "Show Me",
    category: "recognition",
    explanation:
      "Evidence Vault is where you keep meaningful discoveries about yourself and your work — the wins, lessons, and proof that hard days try to erase. It's a quiet record you can return to when you need it.",
    whyNow:
      "Saving what you've learned now means a hard day later can't quietly undo it.",
    primaryActionLabel: "Open Evidence Vault",
    tellMeMore: {
      whatItDoes: "It stores small pieces of evidence — progress, feedback, realizations.",
      howItHelps: "On low days, you can see what's true instead of what your mood insists.",
      whatToExpect: "A growing, private collection you add to over time.",
      optional: true,
      timeEstimate: "a minute to add one",
    },
    lifecycleWindows: ["days-31-60"],
    eligibility: { tags: ["memory", "recognition"] },
  },
  {
    id: "journal",
    title: "Journal Gazebo",
    shortExplanation:
      "A quiet place to write what is true for you — without turning it into a productivity task.",
    destinationId: "journal",
    actionLabel: "Show Me",
    eligibility: { tags: ["reflection"] },
  },
  {
    id: "projects",
    title: "Projects",
    shortExplanation:
      "Give important work a home so you can return to it without reconstructing the whole story.",
    destinationId: "projects",
    actionLabel: "Show Me",
    category: "work",
    explanation:
      "Projects gives your important work a home, so you can step away and come back without rebuilding the whole story. Each project keeps its own thread of decisions, notes, and next steps.",
    whyNow:
      "When work spans more than one sitting, a project keeps your momentum from scattering.",
    primaryActionLabel: "Open Projects",
    tellMeMore: {
      whatItDoes: "It holds ongoing work as projects you can return to over days or weeks.",
      howItHelps:
        "You pick up where you left off instead of reconstructing context each time.",
      whatToExpect: "A calm home for work in progress — no pressure to finish today.",
      optional: true,
      timeEstimate: "a few minutes to start one",
    },
    lifecycleWindows: ["days-15-30", "days-31-60"],
    eligibility: { tags: ["work"] },
  },
  {
    id: "people-i-help",
    title: "People I Help",
    shortExplanation:
      "Clarify who you serve so suggestions for offers, content, and messaging stay grounded.",
    destinationId: "people-i-help",
    actionLabel: "Show Me",
    category: "client-profile",
    completionArea: "people-i-help",
    explanation:
      "This is where you describe who your business serves — the people you help, what they're working through, and what they're hoping for. When Spark understands your audience, ideas, writing, offers, and strategy can fit the right people instead of staying generic.",
    whyNow:
      "Even a rough first pass gives every later conversation something real to build on.",
    primaryActionLabel: "Open People I Help",
    tellMeMore: {
      whatItDoes:
        "People I Help holds a simple picture of your ideal clients — who they are, what they need, and what matters to them.",
      howItHelps:
        "Spark uses it quietly in the background, so suggestions and drafts speak to your actual audience instead of a generic one.",
      whatToExpect:
        "You can add as little or as much as you like, and come back to refine it any time.",
      optional: true,
      timeEstimate: "5 minutes",
    },
    lifecycleWindows: ["days-1-14", "days-15-30"],
    eligibility: { tags: ["business"] },
  },
  {
    id: "business-estate",
    title: "Business Profile",
    shortExplanation:
      "Add details about your business over time so Spark can support you more personally.",
    destinationId: "my-business-estate",
    actionLabel: "Show Me",
    category: "profile",
    completionArea: "business",
    explanation:
      "This is a calm place to tell Spark about your business — what you do, who it's for, and how you like to work. You don't have to fill it in all at once; even a little makes future help feel less generic and more like it knows your world.",
    whyNow:
      "A few details here quietly improve almost everything Spark suggests later.",
    primaryActionLabel: "Open Business Profile",
    tellMeMore: {
      whatItDoes:
        "Your Business Profile holds the essentials — identity, offers, brand voice, direction, and working style — in one place.",
      howItHelps:
        "Spark reads it in the background so ideas, writing, and strategy fit your actual business instead of a generic one.",
      whatToExpect:
        "Short sections you can complete in any order, and revisit whenever something changes.",
      optional: true,
      timeEstimate: "a few minutes per section",
    },
    lifecycleWindows: ["days-1-14", "days-15-30", "days-31-60"],
    eligibility: { tags: ["business"] },
  },
  {
    id: "working-style",
    title: "Working Style",
    shortExplanation:
      "Tell Spark how you focus, decide, and recover, so support fits the way you actually work.",
    destinationId: "my-business-estate",
    actionLabel: "Show Me",
    category: "personalization",
    explanation:
      "This is where you describe how you work best — when you focus, how you make decisions, and what helps you recover. When Spark understands your working style, it can time its suggestions and support to fit you instead of a one-size-fits-all rhythm.",
    whyNow:
      "Even a rough picture of how you work helps Spark meet you where you are.",
    primaryActionLabel: "Open Working Style",
    tellMeMore: {
      whatItDoes:
        "Working Style captures your focus patterns, decision style, and what helps you reset.",
      howItHelps:
        "Spark uses it to pace suggestions around your energy, not against it.",
      whatToExpect: "A short reflection you can add to over time.",
      optional: true,
      timeEstimate: "5 minutes",
    },
    lifecycleWindows: ["days-31-60"],
    eligibility: { tags: ["business", "preferences"] },
  },
  {
    id: "conversation-style",
    title: "Conversation Style",
    shortExplanation:
      "Adjust how I speak with you — warmer, more direct, shorter — without changing who I am.",
    destinationId: "settings",
    actionLabel: "Show Me",
    category: "personalization",
    completionArea: "settings",
    explanation:
      "Conversation Style lets you shape how Spark speaks with you — warmer or more direct, longer or shorter — without changing who Spark is. It's a small setting that makes every conversation feel a little more like yours.",
    whyNow:
      "A quick adjustment here can make Spark feel more comfortable to talk with.",
    primaryActionLabel: "Adjust Conversation Style",
    tellMeMore: {
      whatItDoes: "It sets the tone and length Spark uses when it talks with you.",
      howItHelps: "Conversations fit your preference instead of a default voice.",
      whatToExpect: "A few simple options you can change any time.",
      optional: true,
      timeEstimate: "a minute",
    },
    lifecycleWindows: ["days-1-14", "days-15-30"],
    eligibility: { tags: ["preferences"] },
  },
  {
    id: "support-style",
    title: "Support Style",
    shortExplanation:
      "Tell me how you like to be supported when you are stuck, tired, or deciding.",
    destinationId: "settings",
    actionLabel: "Show Me",
    eligibility: { tags: ["preferences"] },
  },
  {
    id: "peaceful-places",
    title: "Peaceful Places",
    shortExplanation:
      "Step into a calmer setting when your nervous system needs rest before the next decision.",
    destinationId: "peaceful-places",
    actionLabel: "Show Me",
    eligibility: { tags: ["restoration"] },
  },
  {
    id: "soundscapes",
    title: "Soundscapes",
    shortExplanation:
      "Gentle ambient sound that can help you settle or focus — always optional.",
    destinationId: "settings",
    actionLabel: "Show Me",
    eligibility: { voiceOnly: true, tags: ["restoration"] },
  },
] as const;

export function getHelpfulLessonById(id: string): HelpfulLesson | null {
  return HELPFUL_LESSON_REGISTRY.find((l) => l.id === id) ?? null;
}
