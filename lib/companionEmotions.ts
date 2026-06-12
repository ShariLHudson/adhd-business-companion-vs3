export type EmotionalState =
  | "stuck"
  | "overwhelmed"
  | "unclear"
  | "focused"
  | "building"
  | "emotional";

export type UserIntent = "do" | "think" | "create" | "organize" | "reset";

export const EMOTION_LABELS: Record<EmotionalState, string> = {
  stuck: "STUCK — can't start, frozen, or procrastinating",
  overwhelmed: "OVERWHELMED — too much, mental clutter, emotional load",
  unclear: "UNCLEAR — vague input, no clear direction yet",
  focused: "FOCUSED — wants execution, time blocking, doing now",
  building: "BUILDING — creating, writing, planning something",
  emotional:
    "EMOTIONAL DISTRESS — sad, anxious, frustrated, tired, needs grounding",
};

export const STATE_HEADERS: Record<EmotionalState, string> = {
  stuck: "You seem stuck — let's loosen things up first",
  overwhelmed: "You seem overwhelmed — let's slow this down",
  unclear: "Let's get clear on what you need",
  focused: "You're in focus mode — want to start a timer?",
  building: "You're building something — let's open the right space",
  emotional: "I hear you — let's ground first, then one small step",
};

/** v4 presence header — one warm emotion line only */
export const PRESENCE_LINES: Record<EmotionalState, string> = {
  overwhelmed: "Let's slow this down",
  stuck: "We can sort this together",
  unclear: "I'm here — tell me what's going on",
  focused: "You seem focused today",
  building: "Let's bring your idea to life",
  emotional: "You're not alone in this",
};

export const STATE_PLACEHOLDERS: Record<EmotionalState, string> = {
  stuck: "What's feeling hard to start?",
  overwhelmed: "What feels heavy right now?",
  unclear: "What's on your mind?",
  focused: "What are you working on?",
  building: "What are you creating?",
  emotional: "What's weighing on you?",
};

export const INTENT_LABELS: Record<UserIntent, string> = {
  do: "INTENT: DO — execute, start, finish a task",
  think: "INTENT: THINK — process, reflect, sort thoughts",
  create: "INTENT: CREATE — write, draft, build content",
  organize: "INTENT: ORGANIZE — structure, plan, break down",
  reset: "INTENT: RESET — fresh start, clear head, begin again",
};

const SELF_DOUBT_RE =
  /\b(who am i to|who would listen to me|who would buy from me|everyone else seems|everyone is ahead of me|more put together|more qualified|more experienced|not expert enough|not ready yet|undercharging|overcharging|what to charge|how much to charge|no idea what to charge|charge too much|charge enough|raise my rates|raise (my )?rates|raising (my )?rates|pricing page|pricing my offer|price my offer|price it too high|nobody will pay|nobody buys|why would anyone pay|charge these prices|charge that much|too expensive|not worth that much|new price|feel like a fraud|fraud|imposter|impostor|feel like a failure|like a fraud|not good enough|faking it)\b/;

const INBOX_SHAME_RE =
  /\b(shame spiral|inbox shame|unread emails?|hundreds of (unread )?emails?|hundreds of unread|\d+ unread|can'?t open (my )?inbox|can'?t open inbox|afraid to open (my )?inbox|embarrassed about (my )?inbox|email pile|buried in email|avoiding my inbox|inbox (is|feels) (overwhelming|terrifying))\b/;

const SCARCITY_FEAR_RE =
  /\b(panicking|panic about money|worried about bills|scared about bills|panicking about bills|income is unpredictable|unpredictable income|feast or famine|money is tight|can'?t cover bills|worried about money|scared about money|income dropped|slow month|no money coming in|scarcity|not enough money|revenue rollercoaster|income (is|feels) (scary|unstable|unpredictable)|income.{0,30}(scary|unpredictable))\b/;

const REJECTION_FEAR_RE =
  /\b(got a no|they said no|someone said no|said no to|rejected|rejection|turned me down|didn'?t want it|passed on it|no response|ghosted me|didn'?t reply|ignored me|don'?t want to try again|they'?ll say no)\b/;

const COMPARISON_RE =
  /\b(everyone else|everyone in my niche|everyone else is ahead|everyone else seems ahead|everyone is doing better|other people are already|they seem more successful|i am behind|i'?m behind|others are|years ahead|seems years ahead|further ahead|so far ahead|compared to|falling behind|behind everyone)\b/;

const TIME_BLINDNESS_RE =
  /\b(where did the (day|time) go|nothing moved forward|worked all day|busy all day|got nothing done|spent all day|don'?t know what i did|day disappeared|lost the whole day)\b/;

const EMOTIONAL_BLEND_RE =
  /\b(work and life|work or life|everything is blending|all blended together|all mixed together|can'?t separate|personal and business|all piling up|coming from every direction)\b/;

export function detectEmotionalState(
  text: string,
  context: { lastTask?: string | null } = {},
): EmotionalState {
  const t = text.trim().toLowerCase();
  const source = t || (context.lastTask?.toLowerCase() ?? "");

  if (!source) return "unclear";

  if (
    EMOTIONAL_BLEND_RE.test(source) ||
    SCARCITY_FEAR_RE.test(source) ||
    /\b(sad|anxious|anxiety|frustrated|frustrating|tired|exhausted|lonely|scared|worried|worrying|can'?t stop worrying|upset|cry|crying|might cry|tearful|hopeless|helpless|discouraged|drained|low energy|heavy|numb|defeated|ashamed|embarrassed|falling apart|breaking down|on the verge|feel awful|awful|i'?m done|can'?t do this|burned out|burnt out|failure|failing|fraud|imposter|impostor|faking it|not good enough|feel sick|feeling sick|makes me sick|nauseous|nauseated|throw up|sick to my stomach|stomach in knots|knot in (my )?stomach|chest tight|can'?t breathe|panic|dread|can't cope)\b/.test(
      source,
    )
  ) {
    return "emotional";
  }

  if (
    TIME_BLINDNESS_RE.test(source) ||
    /\b(overwhelm|overwhelmed|too much|so much|so many|mental clutter|brain is full|brain (is )?shutting down|brain fog|can'?t think( straight)?|drowning|stressed out|frazzled|everything at once|everything feels|everything (feels|is) urgent|scattered|all over the place|spinning|head is spinning|too many (things|ideas|tabs)|so many (things|ideas)|a million things|to-?do list|list is (too |so )?long|huge list|can'?t keep up|pulled in every direction)\b/.test(
      source,
    )
  ) {
    return "overwhelmed";
  }

  if (
    /\b(stuck|can'?t start|cannot start|can'?t begin|can'?t get started|can'?t get moving|procrastinat|frozen|freeze|shut down|where to begin|don't know where to start|paralyzed|avoiding my inbox|avoiding it|avoiding|putting off|haven't started|body won'?t (start|move)|can'?t make myself|staring at|can'?t open (my )?inbox|can'?t open inbox|can'?t open|can'?t dial|can'?t send|can'?t hit (publish|send))\b/.test(
      source,
    )
  ) {
    return "stuck";
  }

  if (
    /\b(pomodoro|focus block|time block|deep work|concentrate|get started|start working|do this now|execute|25 min|timer|distraction|need to focus|focused)\b/.test(
      source,
    )
  ) {
    return "focused";
  }

  if (
    /\b(write|draft|email|create|build|plan|playbook|proposal|newsletter|marketing|content|strategy|document|letter|blog|copy|structure)\b/.test(
      source,
    )
  ) {
    return "building";
  }

  if (
    t.length < 18 ||
    /^(hi|hey|hello|help|idk|not sure|unsure|umm+|hmm+)\b/.test(t) ||
    /\b(not sure|don't know|unclear|confused|what should i|where do i)\b/.test(t)
  ) {
    return "unclear";
  }

  return "unclear";
}

// Lightweight, rule-based secondary classifier. Sits ALONGSIDE intent/emotion
// — it names the likely emotional obstacle so Shari can meet the real blocker.
export type EmotionalObstacle =
  | "activation_barrier"
  | "self_doubt"
  | "judgment_fear"
  | "rejection_fear"
  | "perfectionism"
  | "decision_conflict"
  | "overwhelm"
  | "time_blindness"
  | "comparison"
  | "shame"
  | "burnout"
  | "people_pleasing"
  | "scarcity_fear"
  | "conflict_avoidance"
  | "success_anxiety"
  | "grief"
  | null;

export function detectObstacle(text: string): EmotionalObstacle {
  const t = text.trim().toLowerCase();
  // Newer, more specific obstacles first so they win over generic self-doubt.
  if (
    /\b(success|growth|growing|scaling|getting bigger).{0,40}(scares|scary|terrif|afraid|frightening|too much)\b/.test(
      t,
    ) ||
    /\bafraid of (success|growing|visibility|responsibility)\b/.test(t)
  )
    return "success_anxiety";
  if (
    /\b(further along|should be further|thought i'?d be|years behind|wasted (years|time)|behind by now|grieving|mourning)\b/.test(
      t,
    )
  )
    return "grief";
  if (COMPARISON_RE.test(t)) return "comparison";
  if (
    /\b(keep saying yes|said yes to too|can'?t say no|people pleas|resentful|overcommit)\b/.test(
      t,
    )
  )
    return "people_pleasing";
  if (
    /\b(difficult conversation|hard conversation|confront|set a boundary|push back)\b/.test(
      t,
    ) ||
    /keep putting (it|that|this) off/.test(t)
  )
    return "conflict_avoidance";
  if (SCARCITY_FEAR_RE.test(t)) return "scarcity_fear";
  if (
    /\b(burned out|burnt out|don'?t care anymore|running on empty|depleted|no energy (for|left))\b/.test(
      t,
    )
  )
    return "burnout";
  if (
    INBOX_SHAME_RE.test(t) ||
    /\b(forgot (something )?again|haven'?t (responded|replied)|ghost(ed|ing)|so ashamed|feel so stupid|stupid mistake|costing me money|adhd tax|another course|haven'?t finished the last|courses? i haven'?t)\b/.test(
      t,
    )
  )
    return "shame";
  if (SELF_DOUBT_RE.test(t)) return "self_doubt";
  if (TIME_BLINDNESS_RE.test(t)) return "time_blindness";
  if (
    /\b(can'?t hit publish|afraid (people|they)|scared to post|what will (people|they) think|judge me|being judged|look stupid)\b/.test(
      t,
    )
  )
    return "judgment_fear";
  if (
    REJECTION_FEAR_RE.test(t) ||
    /\b(sales call|cold call|can'?t call|can'?t dial|nervous about (calling|sales|the call)|prospect)\b/.test(
      t,
    )
  )
    return "rejection_fear";
  if (
    /\b(staring at (the )?(email|screen|it)|rewriting|rewrite it again|keep (editing|tweaking|redoing)|never good enough|has to be perfect|not perfect)\b/.test(
      t,
    )
  )
    return "perfectionism";
  if (
    /\b(too many ideas|can'?t (choose|pick|decide)|afraid (of )?picking (the )?wrong|which (one|idea)|waste a year|so many ideas)\b/.test(
      t,
    )
  )
    return "decision_conflict";
  if (
    /\b(can'?t make myself|body won'?t (start|move)|can'?t get (started|moving)|can'?t begin|frozen|freeze)\b/.test(
      t,
    )
  )
    return "activation_barrier";
  if (
    /\b(overwhelm|too much|too many things|\d+ things|so many things|my list is|drowning|everything at once)\b/.test(
      t,
    )
  )
    return "overwhelm";
  return null;
}

// Body-level avoidance — fear shows up physically before the brain gets a vote.
export function detectSomaticAvoidance(text: string): boolean {
  return /\b(feel sick|feeling sick|makes me sick|nauseous|nauseated|throw up|knot in (my )?stomach|chest (feels )?tight|tight chest|can'?t breathe|panic|dread|body won'?t (move|start)|can'?t dial|physically can'?t)\b/i.test(
    text,
  );
}

export function detectUserIntent(
  text: string,
  state: EmotionalState,
): UserIntent {
  const t = text.trim().toLowerCase();

  if (
    /\b(reset|fresh start|start over|clear (my )?head|begin again|new day)\b/.test(
      t,
    ) ||
    state === "overwhelmed"
  ) {
    return "reset";
  }
  if (
    /\b(write|draft|email|create|build|content|playbook|proposal|blog)\b/.test(
      t,
    ) ||
    state === "building"
  ) {
    return "create";
  }
  if (
    /\b(organize|sort|structure|plan|break down|list|prioritize|steps)\b/.test(t)
  ) {
    return "organize";
  }
  if (
    /\b(do|start|finish|complete|get done|execute|work on|focus on)\b/.test(t) ||
    state === "focused"
  ) {
    return "do";
  }
  if (
    /\b(think|feel|process|reflect|figure out|unsure|confused)\b/.test(t) ||
    state === "unclear" ||
    state === "emotional"
  ) {
    return "think";
  }

  return "think";
}

export const CLARIFYING_QUESTIONS = [
  "What's weighing on you most — getting started, too much at once, or creating something?",
  "Are you trying to do a task, clear your head, or build something?",
  "What's the one thing you wish felt easier right now?",
];

export function pickClarifyingQuestion(text: string): string {
  const idx = text.length % CLARIFYING_QUESTIONS.length;
  return CLARIFYING_QUESTIONS[idx];
}

export function getTimeTone(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function isReturningUser(updatedAt: string | null): boolean {
  if (!updatedAt) return false;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}
