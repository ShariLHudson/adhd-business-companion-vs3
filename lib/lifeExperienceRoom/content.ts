import type { LifeExperienceLetter, LifeExperienceLetterId } from "./types";

const REFLECTION_GENTLE: readonly string[] = [
  "Has anything here reminded you of your own life?",
  "What would you tell your younger self?",
  "What's one small thing you'll carry with you today?",
];

export const LIFE_EXPERIENCE_ROOM_TAGLINE =
  "Let's sit together for a while." as const;

export const LIFE_EXPERIENCE_SHELF_PROMPT =
  "Choose something that speaks to you today." as const;

export const LIFE_EXPERIENCE_LETTERS: readonly LifeExperienceLetter[] = [
  {
    id: "lessons-sooner",
    title: "Lessons I Wish I'd Learned Sooner",
    invitation: "Things I only understood after I'd already stumbled through them.",
    paragraphs: [
      "I don't know if this will help, but I wish someone had sat with me years ago and said: you are not behind.",
      "I spent so long believing everyone else had a map. They didn't. Most of us were guessing — some just looked more confident while they guessed.",
      "One thing I learned slowly: rest is not the reward you earn after you've done enough. Rest is part of how you stay human. I treated exhaustion like a badge. It wasn't. It was a warning I kept ignoring.",
      "I also wish I'd known that asking for help isn't weakness. It's how ordinary people get through extraordinary seasons. I waited too long because I didn't want to be a burden. Turns out, people who care about you often want to show up. Let them.",
      "Looking back, the moments I'm most proud of aren't the polished ones. They're the messy ones where I kept going anyway — a little kinder to myself than the day before.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "life-unplanned",
    title: "When Life Doesn't Go the Way You Planned",
    invitation: "For the version of your story that didn't follow the outline.",
    paragraphs: [
      "If you're feeling that way too — like life took a turn you didn't choose — I want you to know you're not alone in that.",
      "I had plans. Detailed ones. And then life happened: health scares, losses, doors that closed without explanation, seasons where nothing fit the timeline I'd drawn in my head.",
      "For a long time I thought that meant I'd failed at planning. Now I think plans are more like sketches. They help you start. They don't have to survive contact with real life.",
      "What helped me wasn't forcing the old plan back into place. It was asking gentler questions: What is still true about who I am? What matters even when the path changes? What's one honest next step — not a leap, just a step?",
      "You don't have to make peace with everything overnight. You only have to stay in the room with yourself long enough to breathe.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "adhd-later",
    title: "Living With ADHD Later in Life",
    invitation: "When the label arrives after decades of wondering what was wrong with you.",
    paragraphs: [
      "I wasn't diagnosed as a child. I spent years thinking I was lazy, scattered, too sensitive, not trying hard enough. The shame ran deep because I couldn't see what I was fighting.",
      "Getting answers later in life is strange. There's relief — finally, a name for the noise. And there's grief — for all the years I blamed myself for something my brain was doing without my permission.",
      "One thing I learned: ADHD in an adult body doesn't look like the poster on the wall. It looks like a person who has built elaborate systems to survive, who is exhausted from masking, who can hyperfocus on the wrong thing at 11 p.m. and then forget why they walked into a room.",
      "If this is your story too, please hear me: you weren't broken. You were navigating without the right map.",
      "These days I work with my brain more than against it. Smaller lists. Fewer open loops. More forgiveness. It's not perfect. It's so much kinder.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "losing-someone",
    title: "Losing Someone You Love",
    invitation: "There is no right way to carry grief. Only your way.",
    paragraphs: [
      "I don't have answers for this one. Grief doesn't follow instructions, and anyone who tells you otherwise hasn't sat in it long enough.",
      "What I can tell you is that love doesn't end when someone dies. It changes shape. Some days it sits quietly on the shelf. Some days it knocks everything over without warning.",
      "I learned not to rush myself through it. Not to perform healing for other people's comfort. Some friends meant well and said things that hurt. I had to let myself be picky about who I let close in those months.",
      "Small things helped: a walk, a cup of tea, writing their name down, allowing tears in the car. Grief needs room. It doesn't need fixing.",
      "If you're in this season, I'm sorry. Truly. You don't have to be strong today. You only have to be here.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "starting-over",
    title: "Starting Over",
    invitation: "When the chapter ends and the next page is blank.",
    paragraphs: [
      "Starting over sounds inspiring on a poster. In real life it often feels like standing in an empty room with all your furniture gone.",
      "I've started over more than once — careers, relationships, versions of myself I thought were permanent. Each time I expected to feel brave. Mostly I felt tired and a little embarrassed, like I should have figured it out by now.",
      "Looking back, starting over wasn't one dramatic moment. It was a series of small honest choices: admitting something wasn't working, asking for help, trying one thing that scared me a little but not a lot.",
      "You don't need a full vision of the next five years. You need a foothold. One conversation. One application. One morning where you get up and don't talk yourself out of it.",
      "If you're at the beginning again — welcome. It's not failure. It's life being life.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "finding-purpose",
    title: "Finding Purpose Again",
    invitation: "When the old why stopped working and nothing has replaced it yet.",
    paragraphs: [
      "Purpose isn't always a lightning bolt. Sometimes it's a slow thaw.",
      "I lost my sense of purpose more than once — after burnout, after loss, after succeeding at something that turned out not to feed my soul. Each time I panicked, as if not knowing meant I was hollow.",
      "What helped wasn't a grand mission statement. It was noticing small aliveness: a conversation that mattered, work that felt useful, a moment where I forgot to perform and just was.",
      "Purpose can be quiet. It can be seasonal. It can be 'help one person today' instead of 'change the world.'",
      "If you're searching, you haven't failed. You're paying attention. That matters.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "small-wins",
    title: "The Power of Small Wins",
    invitation: "The victories that don't make Instagram — but keep you going.",
    paragraphs: [
      "I used to think wins had to be visible to count. Launches, milestones, applause. I missed years of quiet progress because it didn't look impressive from the outside.",
      "One thing I learned: small wins are not consolation prizes. They're how most real change actually happens. The email sent. The boundary held. The ten minutes of focus when focus felt impossible.",
      "On hard ADHD days, my win might be showering, or eating lunch, or not quitting before 3 p.m. I'm not joking. Those counted. They still count.",
      "If you stack enough small wins, you look up one day and realize you've moved. Not because you hustled your way there — because you didn't abandon yourself on the way.",
      "What's one small win from this week you haven't given yourself credit for? It might be worth naming out loud.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "fear-louder",
    title: "When Fear Is Louder Than Hope",
    invitation: "For the nights when worry has the microphone.",
    paragraphs: [
      "Fear is loud. It doesn't need facts. It just needs a little uncertainty and it fills the room.",
      "I've had seasons where fear sounded like the only honest voice — about money, health, visibility, being enough. Hope felt naive, like something other people got to feel.",
      "What I learned isn't that fear goes away. It's that fear can be present without being in charge. I had to stop negotiating with it at 2 a.m. as if it were the final authority.",
      "Sometimes hope is whisper-small: I'll try again tomorrow. I'll ask one question. I'll stay instead of run. That's enough to start.",
      "If fear is loud for you right now, I'm not going to tell you to think positive. I'm going to tell you: you're still here. That counts for more than fear wants you to believe.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "business-steps",
    title: "Building a Business One Step at a Time",
    invitation: "No hustle gospel — just what it actually felt like from the inside.",
    paragraphs: [
      "I didn't build a business in a montage. I built it in fits and starts, with doubt as a frequent visitor.",
      "Early on I thought everyone else had clients lined up and systems figured out. They didn't. They had a story they told well, and a lot they were still learning in private.",
      "One thing that helped: shrinking the step until my nervous system could tolerate it. Not 'launch the whole thing' — 'write the one paragraph.' Not 'network at the event' — 'send one warm email.'",
      "Your pace is allowed to be human. Slow isn't the same as stuck. Sometimes slow is sustainable.",
      "If you're building something, you don't have to impress me. You only have to take the next step that belongs to today.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "younger-self",
    title: "Things I'd Tell My Younger Self",
    invitation: "A letter I didn't know I needed to write.",
    paragraphs: [
      "Dear younger me — you were doing the best you could with what you knew. I wish I'd believed that sooner.",
      "I'd tell you to rest before you're forced to. To stop comparing your insides to everyone else's outside. To trust the quiet pull toward things that feel alive, even when they don't look practical.",
      "I'd tell you that mistakes aren't proof you're unworthy. They're proof you're trying. And trying, over time, becomes wisdom — not because you never fell, but because you kept getting up.",
      "I'd tell you to let people love you without earning it first. You were already enough. You still are.",
      "If you could say one thing to your younger self today, what would it be? You might want to write it down. Not for anyone else. Just for you.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "kinsey",
    title: "What Kinsey Has Taught Me",
    invitation: "A horse who never read a self-help book but understood presence anyway.",
    paragraphs: [
      "Kinsey doesn't care about my to-do list. She cares if I'm breathing too fast, if my shoulders are up by my ears, if I'm present or performing.",
      "She taught me that calm isn't something you announce. It's something you embody. On days I'm wound tight, she'll stand beside me until my body remembers how to soften.",
      "Horses don't fix you. They mirror you — gently, without judgment. Kinsey has shown me that leadership isn't loud. Sometimes it's standing still until the other being feels safe.",
      "I don't know if you have an animal in your life. If you do, you might know this feeling. If you don't, maybe there's a person, or a place, that holds you the same way.",
      "What Kinsey gave me, more than anything, was permission to slow down. She still does, every time I forget.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
  {
    id: "best-advice",
    title: "The Best Advice I've Ever Received",
    invitation: "Words that landed when I was ready to hear them.",
    paragraphs: [
      "The best advice rarely sounds clever. It sounds obvious the moment it finally reaches you.",
      "Someone once told me: you don't have to have it all figured out to take the next step. That unclenched something in me I'd been holding for years.",
      "Another person said: comparison is theft — not of their success, but of your own path. I still repeat that when I start scrolling and shrinking.",
      "The advice that changed me most wasn't a quote. It was a friend who stayed on the phone without trying to fix me. Presence was the advice.",
      "What's the best advice you've ever received — or wish you had? It might be worth keeping somewhere you'll see it on a hard day.",
    ],
    reflectionQuestions: REFLECTION_GENTLE,
  },
] as const;

export function getLifeExperienceLetter(
  id: LifeExperienceLetterId,
): LifeExperienceLetter | undefined {
  return LIFE_EXPERIENCE_LETTERS.find((letter) => letter.id === id);
}

export function isLifeExperienceLetterId(
  value: string,
): value is LifeExperienceLetterId {
  return LIFE_EXPERIENCE_LETTERS.some((letter) => letter.id === value);
}
