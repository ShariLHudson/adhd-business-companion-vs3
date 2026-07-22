/**
 * Spark Card "Tell Me More" generator — fallback second layer.
 *
 * Most Spark Card catalog records only carry front content (teaser,
 * whatHappened, whyItMatters, sparkApplication). When a card has no
 * hand-authored `expanded` content, this generator supplies a genuinely
 * separate discovery layer keyed by diversity category — never built by
 * reusing or rephrasing front fields — so `Tell Me More` never repeats
 * itself even for the ~90% of the library without bespoke expanded copy.
 *
 * Authored `card.expanded` (see types.ts) always wins per-field; this is
 * only the gap-filler. See docs/spark-card/ for the full report.
 */
import type { SparkNoteDailyCard, SparkNoteExpandedContent } from "./types";
import {
  resolveSparkCardDiversityCategory,
  stableSeedIndex,
  type SparkCardDiversityCategoryId,
} from "./sparkCardDiversity";

type GeneratorCardInput = Pick<
  SparkNoteDailyCard,
  "id" | "category" | "categoryLabel" | "tags" | "title"
>;

type DiscoveryVariant = {
  lookCloser: string;
  deeperStory: string;
  whatHappenedNext?: string;
  unexpectedConnection: string;
  newFacts: [string, string, string];
  tryThis: string;
  gallery: { emblem: string; caption: string }[];
  timeline?: { label: string; detail?: string }[];
  sources: string[];
};

const BANK: Record<SparkCardDiversityCategoryId, DiscoveryVariant[]> = {
  fun_celebrations: [
    {
      lookCloser:
        "Most novelty holidays like this one were never declared by a government — they started with one person, a club, or a small business that wanted a reason to celebrate.",
      deeperStory:
        "Unofficial holidays spread the same way memes do now: a local newspaper mention, a radio DJ picking it up, then decades of people repeating it until it feels official.",
      whatHappenedNext:
        "Once a novelty day catches on, businesses and schools often adopt it for a single afternoon of low-stakes fun — no budget, no planning committee required.",
      unexpectedConnection:
        "The same impulse that invented this day — wanting a small, guaranteed reason to smile — is why so many people now keep a running list of \"tiny celebrations\" on their phone.",
      newFacts: [
        "There are more unofficial \"national days\" on the calendar than actual days in the year — some days quietly celebrate a dozen different things at once.",
        "Many novelty holidays were originally created by manufacturers or trade groups hoping to sell more of something.",
        "A handful of these days have been \"celebrated\" for over a century without ever being made official by any government.",
      ],
      tryThis:
        "Invent your own two-minute version of this celebration and do it once, today, just for you.",
      gallery: [
        { emblem: "🎈", caption: "No permission required" },
        { emblem: "🎊", caption: "Started small, spread wide" },
        { emblem: "📅", caption: "Lives on a calendar, not a law book" },
      ],
      sources: ["Novelty and observance calendars, cross-referenced for pattern only — no single card claims official government status."],
    },
    {
      lookCloser:
        "Look closely at most \"national day\" names and you'll notice a pattern: they were built to be shareable in one sentence, which is exactly why they still spread today.",
      deeperStory:
        "Long before social media, greeting card companies and local radio stations kept lists of these days specifically because they gave people something light to talk about on air.",
      unexpectedConnection:
        "That same instinct now drives the daily prompts and \"day of the year\" posts people share online — the format changed, the appeal did not.",
      newFacts: [
        "Some of these celebrations were created by a single letter-writing campaign to a newspaper decades ago.",
        "A day can be \"celebrated\" in one country and completely unknown in another, even when the theme is universal.",
        "Retailers sometimes quietly popularize a day years before anyone thinks to ask where it came from.",
      ],
      tryThis: "Text one person the reason today is worth noticing — see if they'd heard of it.",
      gallery: [
        { emblem: "📻", caption: "Spread by word of mouth" },
        { emblem: "🗓️", caption: "One line, easy to share" },
        { emblem: "🎉", caption: "No committee needed" },
      ],
      sources: ["Pattern drawn from how novelty observances typically originate and spread."],
    },
    {
      lookCloser:
        "The tone of a novelty holiday — playful, low-stakes, easy to opt into — is usually the whole point; it is designed to ask nothing of you but a smile.",
      deeperStory:
        "These days tend to survive not because of any official backing, but because they're easy to forgive if you miss them and easy to enjoy if you remember.",
      unexpectedConnection:
        "That low-pressure design is exactly what makes them useful on hard weeks — a celebration with zero obligation attached.",
      newFacts: [
        "Many novelty days were first noted in almanacs or trade calendars, not government registries.",
        "A surprising number were created to give retail or hospitality industries a slow-season boost.",
        "The same day can be observed with completely different meanings in different regions.",
      ],
      tryThis: "Pick one tiny, private way to mark today — no announcement needed.",
      gallery: [
        { emblem: "🪅", caption: "Low stakes, on purpose" },
        { emblem: "✨", caption: "Easy to enjoy, easy to skip" },
        { emblem: "🎁", caption: "A reason, not a requirement" },
      ],
      sources: ["General pattern of novelty-calendar origins."],
    },
  ],
  innovation: [
    {
      lookCloser:
        "Almost every well-known invention had an earlier, uglier prototype that never got a museum photo — the version everyone remembers came after several unglamorous drafts.",
      deeperStory:
        "Inventors rarely work alone in a single \"eureka\" moment. Most breakthroughs pass through a small team, a skeptical boss, and at least one version that quietly failed before the idea got refined into something worth keeping.",
      whatHappenedNext:
        "The gap between an invention's first working version and its first commercial version is often years — sometimes over a decade of small, unglamorous fixes.",
      unexpectedConnection:
        "The same trial-and-error loop — try, fail, notice, adjust — is exactly how most modern products get built today, just with faster feedback.",
      newFacts: [
        "Many inventions were shelved for years before someone found the right use case for them.",
        "It's common for the original inventor to never profit much from an idea that later became hugely valuable.",
        "A large share of \"accidental\" inventions came from someone working on a completely unrelated problem.",
      ],
      tryThis: "Sketch the ugliest, roughest version of an idea you've been overthinking — on purpose.",
      gallery: [
        { emblem: "🧪", caption: "The rough first draft" },
        { emblem: "⚙️", caption: "Years of small fixes" },
        { emblem: "📐", caption: "Someone finally found the use" },
      ],
      timeline: [
        { label: "First attempt", detail: "Usually solves the wrong problem" },
        { label: "Unexpected result", detail: "Someone notices a side effect" },
        { label: "Reframed purpose", detail: "The idea finds its real use" },
      ],
      sources: ["Pattern common across documented invention histories."],
    },
    {
      lookCloser:
        "Patent records for well-known inventions are often filled with strange, abandoned earlier versions — hinges that never held, adhesives that never stuck right, prototypes with the wrong shape entirely.",
      deeperStory:
        "Many inventors kept full-time jobs while tinkering on their idea in the evenings, which is part of why progress on these projects often looks slow from the outside.",
      unexpectedConnection:
        "That evenings-and-weekends pace is the same rhythm most people building a side project or small business follow today.",
      newFacts: [
        "Some inventions were rejected by the inventor's own employer before finding success elsewhere.",
        "A number of iconic products were named almost as an afterthought, long after the idea itself existed.",
        "Several major inventions were developed in parallel by more than one person who never met.",
      ],
      tryThis: "Spend ten minutes tonight on the version of your idea nobody else has seen yet.",
      gallery: [
        { emblem: "🔩", caption: "Built after hours" },
        { emblem: "📝", caption: "Named almost by accident" },
        { emblem: "🔧", caption: "Reinvented more than once" },
      ],
      timeline: [
        { label: "Rejected once", detail: "Often by the inventor's own employer" },
        { label: "Kept anyway", detail: "The inventor believed in it privately" },
        { label: "Found its audience", detail: "Sometimes years later" },
      ],
      sources: ["Pattern common across documented invention histories."],
    },
    {
      lookCloser:
        "The tools available at the time often shaped the invention more than the idea itself — many early prototypes look strange today simply because of what materials existed then.",
      deeperStory:
        "It's common for an invention's first real customer to be a completely different industry than the one it eventually became famous in.",
      unexpectedConnection:
        "That's the same reason a tool built for one job today so often gets repurposed for something nobody planned for.",
      newFacts: [
        "Some of the most useful inventions were originally marketed for a completely different purpose.",
        "Early versions of well-known tools were sometimes considered failures by their own inventors.",
        "It often took a second person — not the original inventor — to see the invention's real potential.",
      ],
      tryThis: "Ask: who else, outside your usual audience, might actually need this?",
      gallery: [
        { emblem: "🧰", caption: "Built for one job" },
        { emblem: "🔁", caption: "Found a different one" },
        { emblem: "🙌", caption: "Someone else saw it first" },
      ],
      timeline: [
        { label: "Built for X", detail: "The original intended use" },
        { label: "Used for Y", detail: "An unplanned audience found it" },
        { label: "Known for Y", detail: "The original purpose faded" },
      ],
      sources: ["Pattern common across documented invention histories."],
    },
  ],
  remarkable_people: [
    {
      lookCloser:
        "Most well-known figures had a specific early failure — a rejected idea, a lost job, a public flop — that they rarely mention when the highlight reel gets told.",
      deeperStory:
        "Behind almost every well-known name is a small team, a mentor, or a family member whose contribution rarely makes the headline but shaped the outcome anyway.",
      whatHappenedNext:
        "The public version of someone's success is usually compressed into a single turning point, when in reality it followed years of unglamorous, repeated effort.",
      unexpectedConnection:
        "That compression is exactly why \"overnight success\" stories feel so different once you learn the actual timeline.",
      newFacts: [
        "Many well-known figures were rejected or dismissed early on by people who later claimed credit for discovering them.",
        "It's common for a defining decision to have felt small and uncertain at the time, not obviously historic.",
        "Several notable people credit a single conversation — not a plan — for changing their direction.",
      ],
      tryThis: "Write down one small, uncertain decision you're facing — treat it like it might matter later.",
      gallery: [
        { emblem: "🕰️", caption: "Years before the headline" },
        { emblem: "🤝", caption: "A team behind the name" },
        { emblem: "🗝️", caption: "One small decision" },
      ],
      timeline: [
        { label: "Early rejection", detail: "Often dismissed by someone in authority" },
        { label: "Quiet persistence", detail: "Unglamorous, repeated effort" },
        { label: "The moment retold", detail: "Compressed into one \"turning point\"" },
      ],
      sources: ["Pattern common across biographical accounts of well-known figures."],
    },
    {
      lookCloser:
        "The version of a person's story that becomes famous is almost always the simplified one — the messy middle years rarely survive the retelling.",
      deeperStory:
        "Many influential people changed direction entirely at least once, often after something didn't work out the way they expected.",
      unexpectedConnection:
        "That same permission to change direction is something most people wish someone had told them earlier in their own path.",
      newFacts: [
        "A number of well-known figures started in a completely different field before finding the one they became known for.",
        "Some of the most quoted people were considered difficult or unconventional by their peers at the time.",
        "It's common for someone's most famous decision to have been the least popular one in the room.",
      ],
      tryThis: "Notice one belief about your own path you inherited from someone else's highlight reel — and question it.",
      gallery: [
        { emblem: "🧵", caption: "A messier middle" },
        { emblem: "🎓", caption: "Started somewhere else" },
        { emblem: "🖋️", caption: "The unpopular choice, in hindsight right" },
      ],
      timeline: [
        { label: "Different start", detail: "Often an unrelated field" },
        { label: "Unpopular choice", detail: "Went against the room" },
        { label: "Recognized later", detail: "Often after the fact" },
      ],
      sources: ["Pattern common across biographical accounts of well-known figures."],
    },
    {
      lookCloser:
        "People who are remembered for one big achievement usually had several smaller, less visible ones first — most of which never get mentioned.",
      deeperStory:
        "It's common for someone's most quoted line to have been said casually, in passing, long before anyone thought to write it down.",
      unexpectedConnection:
        "That's a reminder that the small things you say and do today rarely feel historic in the moment either.",
      newFacts: [
        "Many famous quotes were recorded years after they were actually said, by someone other than the speaker.",
        "It's common for a person's most repeated advice to contradict something they did earlier in their own life.",
        "Several well-known figures were skeptical of their own eventual fame while they were alive.",
      ],
      tryThis: "Say the thing you keep almost saying — today, to one person.",
      gallery: [
        { emblem: "💬", caption: "Said in passing" },
        { emblem: "📜", caption: "Written down later" },
        { emblem: "🌟", caption: "Fame came after" },
      ],
      timeline: [
        { label: "Small moment", detail: "Unremarkable at the time" },
        { label: "Recorded later", detail: "Often by someone else" },
        { label: "Widely known", detail: "Sometimes after death" },
      ],
      sources: ["Pattern common across biographical accounts of well-known figures."],
    },
  ],
  amazing_places: [
    {
      lookCloser:
        "Many famous places were never built for the reason people visit them now — the original purpose is often completely different from the one that made them beloved.",
      deeperStory:
        "It's common for a landmark to have been unpopular, controversial, or even scheduled for demolition at some point before it became treasured.",
      whatHappenedNext:
        "Public opinion on a place can flip entirely within a generation — from eyesore to icon — usually once people simply got used to seeing it.",
      unexpectedConnection:
        "That same \"give it time\" pattern shows up anytime something new and unfamiliar gets introduced into daily life.",
      newFacts: [
        "Some of the world's most photographed places were originally considered temporary structures.",
        "A number of beloved landmarks were nearly torn down before public opinion changed.",
        "Local nicknames for famous places often predate their official names by decades.",
      ],
      tryThis: "Look up one nearby place you've never visited and learn why it was actually built.",
      gallery: [
        { emblem: "🏛️", caption: "Built for a different reason" },
        { emblem: "🚧", caption: "Once nearly torn down" },
        { emblem: "🧭", caption: "Loved after time passed" },
      ],
      timeline: [
        { label: "Built", detail: "Often for a practical, unglamorous reason" },
        { label: "Disliked", detail: "Called an eyesore or waste" },
        { label: "Beloved", detail: "Opinion flips within a generation" },
      ],
      sources: ["Pattern common across the history of notable landmarks."],
    },
    {
      lookCloser:
        "Look at the map around any famous place and you'll often find a much older, quieter story — a river crossing, a market, or a road that existed long before the landmark did.",
      deeperStory:
        "Many places became \"amazing\" simply by being in the right location at the right time, not because they were designed to be extraordinary.",
      unexpectedConnection:
        "That's a useful reminder that timing and location can matter as much as the thing itself.",
      newFacts: [
        "Several famous places sit on top of, or beside, a much older and less-known structure.",
        "Some destinations became popular mainly because of a single photograph or film.",
        "A place's most iconic view is sometimes not visible from where it was originally meant to be seen.",
      ],
      tryThis: "Find the older story behind a place you already know well.",
      gallery: [
        { emblem: "📍", caption: "Older than it looks" },
        { emblem: "🎞️", caption: "Made famous by one image" },
        { emblem: "🏞️", caption: "Right place, right time" },
      ],
      timeline: [
        { label: "Quiet origin", detail: "A crossing, market, or road" },
        { label: "One moment", detail: "A photo, film, or event" },
        { label: "Icon status", detail: "Fame outgrows the origin" },
      ],
      sources: ["Pattern common across the history of notable landmarks."],
    },
    {
      lookCloser:
        "The most \"instagrammed\" angle of a famous place is often not the one its original builders cared about at all.",
      deeperStory:
        "Some amazing places were shaped as much by the people who almost destroyed them — through war, neglect, or redevelopment plans — as by the people who built them.",
      unexpectedConnection:
        "Preservation, in other words, is usually as big a part of the story as creation.",
      newFacts: [
        "A number of well-loved places survived only because of a single preservation campaign.",
        "Some landmarks changed use entirely over their history — from military, to industrial, to public space.",
        "The \"best\" viewpoint of a place is sometimes a modern discovery, not the historic one.",
      ],
      tryThis: "Look up who fought to save a place you love — there's almost always someone.",
      gallery: [
        { emblem: "🛡️", caption: "Nearly lost" },
        { emblem: "🔁", caption: "Changed use over time" },
        { emblem: "📷", caption: "A newer favorite view" },
      ],
      timeline: [
        { label: "At risk", detail: "War, neglect, or redevelopment" },
        { label: "Saved", detail: "Usually by one determined group" },
        { label: "Reopened", detail: "Often changed from its original use" },
      ],
      sources: ["Pattern common across the history of notable landmarks."],
    },
  ],
  nature: [
    {
      lookCloser:
        "Look closely and most everyday plants and animals have at least one behavior that sounds invented — timed to the minute, coordinated across a whole population, or triggered by something almost imperceptible.",
      deeperStory:
        "Many of nature's most reliable patterns — migration, blooming, hibernation — are set off by tiny environmental cues most people never notice, like a few extra minutes of daylight.",
      unexpectedConnection:
        "Those same subtle daylight and temperature cues quietly shape human energy and mood too, which is part of why seasons affect how we feel.",
      newFacts: [
        "Many species coordinate major life events using cues far more precise than the human eye can detect.",
        "Some behaviors that look like \"choices\" in nature are actually fixed responses passed down for generations.",
        "A number of everyday plants and animals have close relatives that behave in almost opposite ways.",
      ],
      tryThis: "Step outside for two minutes and notice one small, precise detail you'd normally walk past.",
      gallery: [
        { emblem: "🍃", caption: "Timed to the minute" },
        { emblem: "🦋", caption: "Coordinated without communication" },
        { emblem: "🌾", caption: "A cue too subtle to notice" },
      ],
      sources: ["General natural-history pattern; specifics vary by species and region."],
    },
    {
      lookCloser:
        "Many familiar plants and creatures have a \"hidden\" second life stage most people never see — a form, color, or behavior that only appears briefly.",
      deeperStory:
        "Nature often hides its most dramatic transformations in plain sight, simply because they happen slowly or at times people aren't usually watching.",
      unexpectedConnection:
        "That's a small parallel to how personal growth works too — the biggest changes rarely happen where anyone's watching.",
      newFacts: [
        "Several common species look completely different in an earlier or later life stage than the one people usually picture.",
        "Some of the most dramatic transformations in nature happen almost entirely at night.",
        "A number of species use color changes to communicate things humans can't perceive without help.",
      ],
      tryThis: "Look up the life cycle of one plant or animal you see every day but never learned about.",
      gallery: [
        { emblem: "🐝", caption: "A hidden earlier stage" },
        { emblem: "🌙", caption: "Happens mostly at night" },
        { emblem: "🐚", caption: "Signals we can't see" },
      ],
      sources: ["General natural-history pattern; specifics vary by species and region."],
    },
    {
      lookCloser:
        "Nature rarely wastes anything — most striking features (color, shape, timing) usually serve at least two purposes at once, not just one.",
      deeperStory:
        "What looks like decoration in nature is almost always doing double duty — camouflage, temperature control, or communication, often at the same time.",
      unexpectedConnection:
        "It's a good reminder that the most \"decorative\" parts of anything usually have a hidden function too.",
      newFacts: [
        "Many natural colors and patterns serve more than one survival purpose at once.",
        "Some plants change their appearance seasonally purely to manage temperature, not just for reproduction.",
        "A number of species use the same feature for both attracting mates and warning off predators.",
      ],
      tryThis: "Find one \"just decorative\" thing near you and ask what job it might actually be doing.",
      gallery: [
        { emblem: "🌸", caption: "Never just decoration" },
        { emblem: "🐦", caption: "One feature, two jobs" },
        { emblem: "🍂", caption: "Function hiding in beauty" },
      ],
      sources: ["General natural-history pattern; specifics vary by species and region."],
    },
  ],
  history: [
    {
      lookCloser:
        "Most \"single moment\" historical turning points were actually the visible tip of years of quieter groundwork nobody was watching closely.",
      deeperStory:
        "The people involved in a historic event rarely knew, at the time, that it would be remembered — most described it afterward as an ordinary day that happened to go differently.",
      whatHappenedNext:
        "It often took years, sometimes decades, before historians agreed on how significant a moment actually was.",
      unexpectedConnection:
        "That delay is exactly why it's so hard to know, in the moment, which of today's ordinary decisions will matter later.",
      newFacts: [
        "Many historic events were barely reported at the time they happened.",
        "It's common for the people closest to a historic event to disagree, later, about exactly what happened.",
        "Several \"firsts\" in history were actually preceded by earlier, less-documented attempts.",
      ],
      tryThis: "Write one line about today, as if someone might read it fifty years from now.",
      gallery: [
        { emblem: "📯", caption: "Quiet groundwork first" },
        { emblem: "🕯️", caption: "Felt ordinary at the time" },
        { emblem: "🗺️", caption: "Significance took years to agree on" },
      ],
      timeline: [
        { label: "Before", detail: "Quiet, unglamorous groundwork" },
        { label: "The moment", detail: "Felt ordinary to those living it" },
        { label: "After", detail: "Significance recognized much later" },
      ],
      sources: ["Pattern common across how historical significance is typically assessed after the fact."],
    },
    {
      lookCloser:
        "Historic \"firsts\" are almost always more complicated up close — there is usually an earlier, less credited attempt that paved the way.",
      deeperStory:
        "The record we remember today is often shaped by who happened to be documenting the moment, not necessarily who did the most.",
      unexpectedConnection:
        "That's a reminder that credit and contribution don't always line up — a pattern that still shows up in teams and workplaces today.",
      newFacts: [
        "Several \"first ever\" achievements had lesser-known predecessors who came close but weren't recorded as clearly.",
        "It's common for a historic account to change once new documents or witnesses come to light.",
        "Some pivotal moments were preserved mostly by accident — a saved letter, a kept diary, a photo taken for another reason.",
      ],
      tryThis: "Give credit today to someone whose contribution usually goes unnoticed.",
      gallery: [
        { emblem: "🗝️", caption: "An earlier, uncredited attempt" },
        { emblem: "✉️", caption: "Preserved by accident" },
        { emblem: "🏺", caption: "The record keeps changing" },
      ],
      timeline: [
        { label: "Earlier attempt", detail: "Rarely recorded clearly" },
        { label: "The credited moment", detail: "Happened to be documented" },
        { label: "Record revised", detail: "As new evidence appears" },
      ],
      sources: ["Pattern common across revisions to historical record."],
    },
    {
      lookCloser:
        "Zoom into most historical events and the deciding factor is often something small and human — a delayed letter, a missed meeting, a change in weather.",
      deeperStory:
        "Grand historical narratives tend to smooth over the small, almost accidental factors that actually tipped the outcome one way or another.",
      unexpectedConnection:
        "That's a quiet reminder that small, unglamorous factors shape big outcomes far more often than the highlight-reel version admits.",
      newFacts: [
        "Some major historical outcomes hinged on a delay of only a few hours.",
        "Weather has changed the outcome of more historical events than most people realize.",
        "Several \"inevitable\" historical outcomes were considered highly uncertain by the people living through them.",
      ],
      tryThis: "Notice one small factor today that could tip a decision — and plan around it.",
      gallery: [
        { emblem: "⏳", caption: "A few hours mattered" },
        { emblem: "🌦️", caption: "Weather changed the outcome" },
        { emblem: "⚔️", caption: "Uncertain, not inevitable" },
      ],
      timeline: [
        { label: "Small factor", detail: "A delay, a message, the weather" },
        { label: "Tipping point", detail: "Outcome shifts unexpectedly" },
        { label: "Told as inevitable", detail: "The retelling smooths it over" },
      ],
      sources: ["Pattern common across historical analysis of contingency and outcome."],
    },
  ],
  fun_facts: [
    {
      lookCloser:
        "The most shareable fun facts usually have a second layer underneath — a reason the surprising thing is true that's even more interesting than the fact itself.",
      deeperStory:
        "Fun facts spread because they're compact enough to repeat exactly, which means the version you hear has often been simplified from something more nuanced.",
      unexpectedConnection:
        "That compression is the same reason short, punchy claims spread faster online than the fuller, more accurate explanation.",
      newFacts: [
        "Many popular fun facts are technically true but leave out an important exception or condition.",
        "Some widely repeated \"facts\" started as an approximation that got rounded into a cleaner, catchier number.",
        "The most memorable facts usually connect to something people already care about, which is part of why they stick.",
      ],
      tryThis: "Look up the fuller explanation behind one fun fact you've repeated before.",
      gallery: [
        { emblem: "🎲", caption: "Simplified for sharing" },
        { emblem: "🧩", caption: "A missing exception" },
        { emblem: "🔍", caption: "The fuller story underneath" },
      ],
      sources: ["Pattern common across how trivia and fun facts typically spread and simplify."],
    },
    {
      lookCloser:
        "Comparisons make fun facts land — most surprising numbers only feel surprising once they're placed next to something familiar.",
      deeperStory:
        "The same underlying fact can sound boring or amazing depending entirely on what it's compared to.",
      unexpectedConnection:
        "That's a useful trick for explaining your own work too — comparison does more than raw numbers ever will.",
      newFacts: [
        "A number that sounds impressive alone often sounds different once compared to something familiar.",
        "Many surprising facts rely on an unusual unit of measurement to sound more dramatic.",
        "Fun facts about scale often lose their punch once you actually try to picture the comparison.",
      ],
      tryThis: "Reframe one number from your week using a comparison instead of a raw figure.",
      gallery: [
        { emblem: "❓", caption: "Depends on the comparison" },
        { emblem: "🃏", caption: "Framing changes everything" },
        { emblem: "🔍", caption: "Scale is easy to misjudge" },
      ],
      sources: ["General pattern in how comparative facts are typically framed."],
    },
    {
      lookCloser:
        "A surprising number of fun facts are actually about language — a word's original meaning is often stranger than the modern one.",
      deeperStory:
        "Words and phrases people use casually often started out meaning something completely different, sometimes centuries ago.",
      unexpectedConnection:
        "That's a fun rabbit hole: pick almost any everyday phrase and its backstory is usually stranger than expected.",
      newFacts: [
        "Some everyday words started as insults, trade terms, or slang that later became neutral.",
        "A number of common phrases reference tools or professions that barely exist anymore.",
        "Word origins are sometimes disputed among historians, even for very common words.",
      ],
      tryThis: "Look up the original meaning of one phrase you use every week.",
      gallery: [
        { emblem: "🃏", caption: "Started as slang" },
        { emblem: "🧩", caption: "References a forgotten trade" },
        { emblem: "🔍", caption: "Origin still debated" },
      ],
      sources: ["General pattern in etymology and word-origin research."],
    },
  ],
  kindness: [
    {
      lookCloser:
        "Research on kindness consistently finds the same surprising detail: the person doing the kind thing usually underestimates how much it will mean to the other person.",
      deeperStory:
        "Small, specific gestures — noticing a detail, remembering something someone said — tend to land more than large, generic ones, even though large gestures feel more impressive to plan.",
      unexpectedConnection:
        "That gap between what feels meaningful to give and what actually lands is one of the more consistently studied findings in this area.",
      newFacts: [
        "People who give small, specific compliments are often surprised by how memorable it was for the other person.",
        "Kindness tends to spread outward — one small act often gets passed along by the person who received it.",
        "The person offering kindness usually benefits emotionally as much as the person receiving it.",
      ],
      tryThis: "Give one specific, detailed compliment today — not a generic one.",
      gallery: [
        { emblem: "💌", caption: "Small lands bigger than expected" },
        { emblem: "🕊️", caption: "It tends to spread" },
        { emblem: "🤝", caption: "Helps the giver too" },
      ],
      sources: ["General pattern from research on prosocial behavior and gratitude."],
    },
    {
      lookCloser:
        "The kindness people remember years later is almost never a grand gesture — it's usually a small moment someone almost didn't bother with.",
      deeperStory:
        "Timing matters more than scale: a small kindness offered at the right moment often outlasts a bigger one offered at the wrong time.",
      unexpectedConnection:
        "That's why a short, well-timed note can matter more than a much larger gesture planned for later.",
      newFacts: [
        "People often remember the timing of a kind act more clearly than its size.",
        "A short note or message is frequently kept far longer than the sender expects.",
        "Kindness offered without being asked tends to be remembered more vividly than kindness given on request.",
      ],
      tryThis: "Send the short message you've been meaning to send — today, not \"eventually.\"",
      gallery: [
        { emblem: "🌼", caption: "Timing over size" },
        { emblem: "🧸", caption: "Kept longer than expected" },
        { emblem: "💌", caption: "Unprompted lands hardest" },
      ],
      sources: ["General pattern from research on prosocial behavior and gratitude."],
    },
    {
      lookCloser:
        "There's a well-documented gap between how awkward people expect a kind gesture to feel and how good it actually feels once they do it.",
      deeperStory:
        "That anticipated-awkwardness gap is one of the biggest reasons people talk themselves out of small kind acts before ever trying them.",
      unexpectedConnection:
        "Knowing the gap exists is often enough to nudge someone past the hesitation — it's a documented mismatch, not just a feeling.",
      newFacts: [
        "People consistently overestimate how awkward a kind gesture will feel beforehand.",
        "The gap between expected and actual awkwardness tends to be largest right before the first attempt.",
        "Once someone tries a small kind gesture once, the hesitation for the next one usually drops.",
      ],
      tryThis: "Do the small kind thing you've been overthinking — the awkwardness is usually smaller than expected.",
      gallery: [
        { emblem: "🤝", caption: "Feels awkward beforehand" },
        { emblem: "🕊️", caption: "Rarely awkward in practice" },
        { emblem: "🌼", caption: "Gets easier the second time" },
      ],
      sources: ["General pattern from research on prosocial behavior and gratitude."],
    },
  ],
  curiosity: [
    {
      lookCloser:
        "The moment right before someone asks a genuinely curious question — the pause, the slight tilt of attention — is when most real thinking actually starts.",
      deeperStory:
        "People who describe themselves as curious usually aren't smarter about the topic — they've just kept the habit of asking one more question before deciding they understand something.",
      unexpectedConnection:
        "That habit is trainable at any age; it isn't a fixed trait some people are simply born with.",
      newFacts: [
        "Curiosity tends to increase, not decrease, the more questions someone asks in a conversation.",
        "People often stop asking questions the moment they feel embarrassed about not already knowing the answer.",
        "The best follow-up questions are usually simple, not clever.",
      ],
      tryThis: "Ask one more question than feels natural in your next conversation today.",
      gallery: [
        { emblem: "🔭", caption: "Curiosity is a habit" },
        { emblem: "💭", caption: "One more question" },
        { emblem: "🪄", caption: "Trainable, not fixed" },
      ],
      sources: ["General pattern from research on curiosity and question-asking behavior."],
    },
    {
      lookCloser:
        "Curiosity has a documented \"gap\" theory: it spikes most when someone realizes there's a small, specific piece of information missing — not when they know nothing at all.",
      deeperStory:
        "That's why a partial answer often creates more curiosity than a completely blank topic — the brain fixates on the missing piece.",
      unexpectedConnection:
        "It's the same mechanic behind a good cliffhanger, and it's why \"tell me more\" so often works better than a wall of information upfront.",
      newFacts: [
        "Curiosity tends to peak around a specific known gap, not general ignorance.",
        "Partial information often creates more interest than either no information or complete information.",
        "The feeling of curiosity has been linked to some of the same reward pathways as anticipation.",
      ],
      tryThis: "Leave one small, deliberate gap the next time you explain something — see if someone asks.",
      gallery: [
        { emblem: "🧭", caption: "Sparked by a gap" },
        { emblem: "🔦", caption: "Not by knowing nothing" },
        { emblem: "🪄", caption: "Same as a cliffhanger" },
      ],
      sources: ["General pattern from information-gap theories of curiosity."],
    },
    {
      lookCloser:
        "Genuinely curious people tend to ask about the process — how something works or came to be — far more often than they ask about the result.",
      deeperStory:
        "That process-first habit is part of why curious people often retain information longer: the how sticks better than the what.",
      unexpectedConnection:
        "It's a small, useful shift for anyone learning something new: ask how before what.",
      newFacts: [
        "Questions about process tend to lead to more follow-up questions than questions about outcomes.",
        "People who ask \"how\" questions are more likely to remember the answer weeks later.",
        "Curiosity about process is linked to longer attention spans on a topic.",
      ],
      tryThis: "Next time you're curious about something, ask how it works before asking what it is.",
      gallery: [
        { emblem: "💭", caption: "Process over result" },
        { emblem: "🔭", caption: "Sticks longer in memory" },
        { emblem: "🔦", caption: "Ask how, not just what" },
      ],
      sources: ["General pattern from research on curiosity and learning retention."],
    },
  ],
  inspiration: [
    {
      lookCloser:
        "Inspiring moments almost always arrive in the middle of ordinary activity — a walk, a shower, a commute — not while someone is sitting and trying to feel inspired.",
      deeperStory:
        "The brain does some of its best connecting during low-focus activities, which is part of why forced inspiration so rarely works on command.",
      whatHappenedNext:
        "Many people who report a moment of inspiration describe writing it down immediately, then refining it over weeks — the spark itself is rarely the finished idea.",
      unexpectedConnection:
        "That's why stepping away from a hard problem often produces more progress than staring at it longer.",
      newFacts: [
        "Inspiration is more often reported during low-focus activity than during deliberate concentration.",
        "Most people who report a flash of inspiration also report refining it significantly afterward.",
        "Writing an idea down immediately makes it far more likely to be developed later.",
      ],
      tryThis: "Step away from the thing you're stuck on for ten minutes, then write down whatever comes back with you.",
      gallery: [
        { emblem: "🌅", caption: "Arrives during ordinary moments" },
        { emblem: "🌟", caption: "Rarely the finished idea" },
        { emblem: "🪶", caption: "Needs writing down fast" },
      ],
      sources: ["General pattern from research on incubation and creative insight."],
    },
    {
      lookCloser:
        "Inspiring quotes are almost always shorter in their original form than the polished version people repeat — editing happens over the retelling, not the moment.",
      deeperStory:
        "The most repeated lines are often pulled from a much longer, more ordinary conversation or speech, and stripped of context along the way.",
      unexpectedConnection:
        "That's worth remembering the next time a single line feels like the whole story — there's usually more context worth finding.",
      newFacts: [
        "Many famous inspirational lines were originally part of a much longer, more mundane passage.",
        "The most quoted version of a line is sometimes not the speaker's exact original wording.",
        "Context is frequently lost as an inspiring line gets repeated over time.",
      ],
      tryThis: "Look up the fuller context behind a quote that's inspired you before.",
      gallery: [
        { emblem: "🕊️", caption: "Shorter than the original" },
        { emblem: "🎯", caption: "Context often gets lost" },
        { emblem: "🌟", caption: "Worth finding the fuller story" },
      ],
      sources: ["General pattern in how quotations are typically shortened and popularized over time."],
    },
    {
      lookCloser:
        "The feeling of inspiration and the feeling of motivation are actually measured differently — inspiration tends to fade fast unless it's acted on within a day or two.",
      deeperStory:
        "That short window is one reason so many good ideas from an inspiring moment quietly disappear if they aren't captured quickly.",
      unexpectedConnection:
        "It's a small, practical argument for keeping a place to immediately jot things down, rather than trusting memory alone.",
      newFacts: [
        "Inspiration tends to fade measurably faster than general motivation.",
        "Ideas captured within a day or two of an inspiring moment are far more likely to be acted on.",
        "Writing something down, even briefly, meaningfully improves the odds it gets revisited later.",
      ],
      tryThis: "Capture today's smallest spark of inspiration somewhere you'll actually see it again.",
      gallery: [
        { emblem: "🌟", caption: "Fades faster than motivation" },
        { emblem: "🕊️", caption: "A short window to act" },
        { emblem: "🪶", caption: "Capture beats memory" },
      ],
      sources: ["General pattern from research distinguishing inspiration from sustained motivation."],
    },
  ],
  books_ideas: [
    {
      lookCloser:
        "Many well-known books and ideas were rejected multiple times before finding the person or publisher who understood them.",
      deeperStory:
        "Ideas often sit dormant for years, waiting not for improvement but for the right audience or moment to actually be heard.",
      whatHappenedNext:
        "Once an idea does find its moment, it often spreads through word of mouth long before any formal recognition catches up.",
      unexpectedConnection:
        "That's the same reason a good idea you've shelved might not be wrong — it might just be early.",
      newFacts: [
        "Several influential books were rejected by multiple publishers before being accepted.",
        "Some ideas circulated informally for years before being written down in the form people know today.",
        "Word of mouth has historically driven more early book success than advertising.",
      ],
      tryThis: "Revisit one idea you shelved — ask whether it was wrong, or just early.",
      gallery: [
        { emblem: "📚", caption: "Rejected, more than once" },
        { emblem: "🔖", caption: "Waited for its moment" },
        { emblem: "🗂️", caption: "Spread by word of mouth" },
      ],
      sources: ["Pattern common across publishing history for influential works."],
    },
    {
      lookCloser:
        "The title readers know a book by is often not the author's first choice — many were renamed late, sometimes by an editor, right before release.",
      deeperStory:
        "A surprising number of enduring ideas were originally framed very differently than how we understand them today.",
      unexpectedConnection:
        "That's a reminder that the framing of an idea can matter almost as much as the idea itself.",
      newFacts: [
        "Some of the most recognizable titles were chosen at the last minute, often by someone other than the author.",
        "Ideas are frequently reframed and renamed as they pass from person to person.",
        "The original framing of an idea sometimes differs sharply from its most common modern interpretation.",
      ],
      tryThis: "Rename one of your own shelved ideas — sometimes a new frame is all it needs.",
      gallery: [
        { emblem: "🖋️", caption: "Renamed at the last minute" },
        { emblem: "💡", caption: "Reframed along the way" },
        { emblem: "📚", caption: "Framing changes everything" },
      ],
      sources: ["Pattern common across publishing history for titling and editorial changes."],
    },
    {
      lookCloser:
        "Many ideas we treat as timeless were actually built on top of an older, less credited idea — originality is often really good recombination.",
      deeperStory:
        "The most \"original\" thinkers usually describe their work as connecting existing pieces in a new way, not inventing from nothing.",
      unexpectedConnection:
        "That takes pressure off needing a totally new idea — a new combination is often enough.",
      newFacts: [
        "Many celebrated ideas are documented combinations of two or more older concepts.",
        "Original thinkers frequently credit their work to \"connecting\" rather than \"inventing.\"",
        "Some ideas considered groundbreaking were actually rediscoveries of older, forgotten work.",
      ],
      tryThis: "Combine two ideas you already have instead of hunting for a brand-new one.",
      gallery: [
        { emblem: "🗂️", caption: "Combination, not invention" },
        { emblem: "💡", caption: "Connecting existing pieces" },
        { emblem: "📖", caption: "Sometimes a rediscovery" },
      ],
      sources: ["General pattern in the history and philosophy of idea development."],
    },
  ],
  creativity: [
    {
      lookCloser:
        "Most creative breakthroughs are documented as arriving after a break, not during forced, uninterrupted effort — the pause is doing real work.",
      deeperStory:
        "Researchers call this the incubation effect: stepping away lets the brain keep working on a problem in the background, often producing the connection effort alone couldn't find.",
      unexpectedConnection:
        "That's the scientific version of \"sleep on it,\" and it holds up remarkably well across studies.",
      newFacts: [
        "Many documented creative breakthroughs happened during rest, walking, or unrelated tasks.",
        "The incubation effect has been observed across writing, science, art, and problem-solving alike.",
        "Forced, uninterrupted focus sometimes produces less creative output than focus followed by a deliberate break.",
      ],
      tryThis: "Step away from your current creative block and do something unrelated for fifteen minutes.",
      gallery: [
        { emblem: "🎨", caption: "The pause does real work" },
        { emblem: "🖌️", caption: "Background thinking continues" },
        { emblem: "🎭", caption: "Break beats forced focus" },
      ],
      sources: ["General pattern from research on creative incubation."],
    },
    {
      lookCloser:
        "Creative people are often more prolific than they are consistently \"good\" — quantity, not just quality, is a documented predictor of creative output.",
      deeperStory:
        "Many celebrated works came from creators who also produced a large amount of forgettable material alongside them — the ratio, not the streak, is what mattered.",
      unexpectedConnection:
        "That reframes \"failed\" attempts as part of the process rather than evidence something's wrong.",
      newFacts: [
        "Higher creative output volume is linked to a higher total number of standout works, not just a higher ratio of successes.",
        "Many celebrated creators also produced a large body of lesser-known, less successful work.",
        "Creative quality is difficult to predict in advance, even for experienced creators.",
      ],
      tryThis: "Make one more \"forgettable\" attempt today instead of waiting for a good one.",
      gallery: [
        { emblem: "✂️", caption: "Quantity, not just quality" },
        { emblem: "🎨", caption: "A lot of forgettable work" },
        { emblem: "🖌️", caption: "Attempts add up" },
      ],
      sources: ["General pattern from research on creative productivity."],
    },
    {
      lookCloser:
        "Constraints — a small budget, a strict deadline, a limited tool set — show up again and again as a documented driver of creative solutions, not a blocker of them.",
      deeperStory:
        "Unlimited freedom can actually slow creative work down; having fewer options often forces faster, more inventive decisions.",
      unexpectedConnection:
        "That's a useful reframe for anyone waiting for \"ideal conditions\" before starting something creative.",
      newFacts: [
        "Some of the most celebrated creative works were made under tight budget or time constraints.",
        "Too many options can measurably slow decision-making in creative work.",
        "Limited tools have historically pushed creators toward more inventive solutions.",
      ],
      tryThis: "Give yourself one small, artificial constraint on your next creative task — see what it produces.",
      gallery: [
        { emblem: "🎭", caption: "Constraint fuels invention" },
        { emblem: "✂️", caption: "Fewer options, faster decisions" },
        { emblem: "🎨", caption: "Not waiting for ideal conditions" },
      ],
      sources: ["General pattern from research on constraints and creative problem-solving."],
    },
  ],
  science_technology: [
    {
      lookCloser:
        "Many technologies we use daily were developed for a completely different purpose — often military, medical, or scientific research that later found consumer use.",
      deeperStory:
        "The path from lab discovery to everyday product usually passes through years of unglamorous refinement most people never hear about.",
      whatHappenedNext:
        "It's common for a technology's original research team to have no idea it would eventually become a household product.",
      unexpectedConnection:
        "That long, invisible middle stretch is the same reason most \"instant\" tech breakthroughs took far longer than they appear to have.",
      newFacts: [
        "Several everyday technologies began as research for entirely different fields, like defense or medicine.",
        "It's common for a technology to sit unused for years before someone finds its practical application.",
        "The original research team behind a technology often never sees its eventual widespread use.",
      ],
      tryThis: "Look up the original purpose of one piece of technology you used today.",
      gallery: [
        { emblem: "🔬", caption: "Built for a different field" },
        { emblem: "🛰️", caption: "Years of quiet refinement" },
        { emblem: "💻", caption: "Application found later" },
      ],
      timeline: [
        { label: "Research", detail: "Often military, medical, or academic" },
        { label: "Dormant period", detail: "Years without an obvious use" },
        { label: "Everyday product", detail: "A different team finds the use case" },
      ],
      sources: ["Pattern common across the history of dual-use technology."],
    },
    {
      lookCloser:
        "Look at the naming of most technologies and you'll find an early, awkward version of the name that was quietly dropped before launch.",
      deeperStory:
        "Scientific breakthroughs are frequently the result of multiple independent teams racing toward the same discovery, unaware of each other.",
      unexpectedConnection:
        "That's part of why credit disputes are so common in science — the discovery often wasn't as singular as the history books suggest.",
      newFacts: [
        "Several major scientific discoveries were made independently by more than one team around the same time.",
        "Credit disputes over scientific \"firsts\" are more common than most people realize.",
        "Early names for well-known technologies are sometimes very different from the final, familiar name.",
      ],
      tryThis: "Look up whether a technology you rely on had a lesser-known competing inventor.",
      gallery: [
        { emblem: "⚛️", caption: "Discovered independently, twice" },
        { emblem: "🧲", caption: "Credit disputes are common" },
        { emblem: "💻", caption: "An early, dropped name" },
      ],
      timeline: [
        { label: "Parallel discovery", detail: "More than one team, unaware of each other" },
        { label: "Race to publish", detail: "Credit often goes to whoever announces first" },
        { label: "History simplifies", detail: "One name usually gets remembered" },
      ],
      sources: ["Pattern common across cases of simultaneous scientific discovery."],
    },
    {
      lookCloser:
        "A surprising number of scientific tools were originally built to test a completely different hypothesis than the one they became known for confirming.",
      deeperStory:
        "Some of the most cited scientific instruments were repurposed by a second researcher who saw a use the original inventor never considered.",
      unexpectedConnection:
        "That handoff between an original builder and a later re-user shows up constantly in technology history, not just science.",
      newFacts: [
        "Several well-known scientific instruments were originally designed to test something unrelated to their eventual use.",
        "It's common for a second researcher, not the original inventor, to find a tool's most important application.",
        "Some foundational tools in science were built from repurposed, everyday materials.",
      ],
      tryThis: "Ask whether a tool you use daily could solve a completely different problem than the one it was built for.",
      gallery: [
        { emblem: "🔬", caption: "Built to test something else" },
        { emblem: "⚛️", caption: "Repurposed by a second researcher" },
        { emblem: "🛰️", caption: "Everyday materials, foundational use" },
      ],
      timeline: [
        { label: "Original test", detail: "A different hypothesis entirely" },
        { label: "Repurposed", detail: "A second researcher sees new value" },
        { label: "Known for it", detail: "The original purpose is forgotten" },
      ],
      sources: ["Pattern common across the history of repurposed scientific instruments."],
    },
  ],
};

/**
 * Generate a genuinely-separate "Tell Me More" layer for any card, keyed by
 * its diversity category with deterministic per-card variety (never random —
 * stable across renders and safe for SSR).
 */
export function generateSparkCardExpandedContent(
  card: GeneratorCardInput,
): SparkNoteExpandedContent {
  const diversity = resolveSparkCardDiversityCategory({
    category: card.category,
    categoryLabel: card.categoryLabel,
    tags: card.tags,
    title: card.title,
  });
  const variants = BANK[diversity] ?? BANK.curiosity;
  const index = stableSeedIndex(card.id, variants.length);
  const variant = variants[index]!;

  return {
    lookCloser: variant.lookCloser,
    deeperStory: variant.deeperStory,
    whatHappenedNext: variant.whatHappenedNext,
    unexpectedConnection: variant.unexpectedConnection,
    newFacts: [...variant.newFacts],
    tryThis: variant.tryThis,
    gallery: variant.gallery.map((g) => ({ ...g })),
    timeline: variant.timeline?.map((t) => ({ ...t })),
    sources: [...variant.sources],
  };
}
