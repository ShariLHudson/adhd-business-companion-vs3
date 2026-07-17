import { ADHD_EVERYDAY_STRATEGIES } from "./strategyCatalog";
import type {
  AdhdEverydayStrategy,
  AdhdEverydayStrategyId,
  AdhdStrategyBundleId,
  AdhdStrategyFrictionKind,
} from "./types";

const BURNOUT_RECOVERY_RE =
  /\b(?:burn(?:ed|t)?\s*out|burnout|recovery\s+day|chronic\s+overload|boom[\s-]?and[\s-]?bust|sustainable\s+energy|protect\s+recovery)\b/i;

const EMOTION_BURNOUT_RE =
  /\b(?:shame|self-?critic|beating\s+myself|emotional(?:ly)?\s+overwhelm|too\s+upset|can'?t\s+think\s+(?:straight|clearly)|need\s+(?:comfort|space)|low\s+capacity|collapse|overcommit)\b/i;

const CREATIVITY_IDEAS_RE =
  /\b(?:new\s+idea|creative\s+(?:project|idea)|idea\s+(?:dump|incub|archiv)|too\s+many\s+(?:ideas|creative)|incubate|creative\s+trail|archive\s+(?:the\s+)?idea)\b/i;

const DECISION_FATIGUE_RE =
  /\b(?:decision\s+fatigue|analysis\s+paralysis|decision\s+compass|board\s+of\s+directors|reversible|irreversible\s+decision|mental\s+overload|too\s+many\s+options)\b/i;

const REJECTION_SENSITIVITY_RE =
  /\b(?:rejection\s+sensitiv|social\s+pain|feel(?:s|ing)?\s+(?:like\s+)?reject(?:ed|ion)|interpreting\s+rejection|exclusion|rejection[\s-]driven|social\s+confidence)\b/i;

const EMOTIONAL_SAFETY_RE =
  /\b(?:inner\s+critic|self-?blame|self-?compassion|comparing\s+myself|imposter|i'?m\s+(?:a\s+)?failure|hate\s+myself|bad\s+day\s+(?:ruined|means)|ruminat(?:e|ing)|don'?t\s+trust\s+myself)\b/i;

const RELATIONSHIPS_FAMILY_RE =
  /\b(?:family|partner|spouse|relationship|shared\s+expectations|social\s+energy|what\s+kind\s+of\s+support|repair\s+conversation|check[\s-]?backs?|connection\s+and\s+boundaries)\b/i;

const DAILY_LIVING_HOME_RE =
  /\b(?:household|home\s+reset|laundry|meal\s+routines?|home\s+zones?|self[\s-]?care|chores?\s+at\s+home|household\s+(?:clutter|overwhelm|tasks?))\b/i;

const SLEEP_ENERGY_RE =
  /\b(?:bedtime|sleep|morning\s+activation|revenge\s+procrastination|poor\s+sleep|energy\s+transitions?|evening\s+routine|can't\s+wake)\b/i;

const LEARNING_INFORMATION_RE =
  /\b(?:reading|active\s+recall|re[\s-]?reading|knowledge\s+home|summarize\s+before|teach\s+it\s+back|information\s+(?:overload|management)|research\s+(?:overload|rabbit)|learning\s+(?:system|profile))\b/i;

const WORKPLACE_CAREER_RE =
  /\b(?:workplace|manager|performance\s+review|career|workload|role\s+fit|job\s+(?:change|transition)|employment|promotion|coworker)\b/i;

const HELP_DELEGATION_RE =
  /\b(?:ask\s+for\s+help|delegat(?:e|ion)|accountability\s+partner|body\s+doubl(?:e|ing)|support\s+network|struggling\s+alone|dropped\s+the\s+ball|overdepend)\b/i;

const CHANGE_DISRUPTION_RE =
  /\b(?:plans?\s+change|unexpected\s+change|travel|interrupt(?:ion|ed)|life\s+disruption|backup\s+plan|uncertainty|change\s+resilience|transition(?:s|ing)?\s+without)\b/i;

const RETURNING_RE =
  /\b(?:been\s+away|time\s+away|coming\s+back|return(?:ing)?\s+(?:after|to)|where\s+i\s+left\s+off|catch\s+up\s+on\s+everything|backlog|re-?enter|absent|haven'?t\s+been\s+(?:here|in)|long\s+absence)\b/i;

const PLANNING_RE =
  /\b(?:priorit(?:y|ies|ize)|most\s+important\s+task|plan\s+my\s+day|follow[\s-]?through|what\s+done\s+looks\s+like|finish\s+line|too\s+many\s+priorities|daily\s+finish|celebrate\s+completion)\b/i;

const ORGANIZATION_CLUTTER_RE =
  /\b(?:clutter|declutter|organiz(?:e|ing|ation)|visual\s+overwhelm|messy\s+(?:desk|room|space)|reset\s+(?:the\s+)?space|homes?\s+for\s+(?:items?|things))\b/i;

const ENVIRONMENT_RE =
  /\b(?:too\s+noisy|noise|lighting|distract(?:ed|ing)|sensory|fidget|focus\s+zone|wrong\s+room|change\s+(?:rooms?|location)|environment)\b/i;

const COMMUNICATION_RE =
  /\b(?:difficult\s+conversation|said\s+the\s+wrong\s+thing|follow\s+up|boundary|boundaries|misunderstand|overshar|afraid\s+to\s+(?:reply|respond|text)|repair\s+(?:the\s+)?(?:relationship|conversation))\b/i;

const MOTIVATION_MOMENTUM_RE =
  /\b(?:motivat(?:e|ed|ion|ional)|momentum|waiting\s+(?:to\s+(?:feel\s+)?)?motivat|no\s+motivation|unmotivated|energy\s+is\s+low|boom.?bust|all[\s-]or[\s-]nothing\s+motivat)\b/i;

const ROUTINES_HABITS_RE =
  /\b(?:routine|habit|consistency|low[\s-]capacity\s+version|restart\s+(?:the\s+)?routine|anchor\s+(?:the\s+)?(?:habit|routine))\b/i;

const MONEY_FINANCIAL_RE =
  /\b(?:money|bills?|budget|spending|impulse\s+purchas|subscriptions?|financial|overdraft|pay\s+(?:bills?|rent)|bank\s+(?:account|balance)|debt|late\s+fees?)\b/i;

const PAPERWORK_ADMIN_RE =
  /\b(?:email|inbox|paperwork|administrative|admin(?:istrative)?\s+backlog|holding\s+reply|triage|forms?\s+(?:to\s+)?(?:fill|file)|reply\s+to\s+(?:emails?|messages?))\b/i;

const MEETINGS_APPOINTMENTS_RE =
  /\b(?:meetings?|appointments?|missed\s+(?:the\s+)?(?:meetings?|appointments?)|scheduling\s+change|action\s+items?|show\s+up\s+(?:on\s+time|ready))\b/i;

const CLIENT_FOLLOW_THROUGH_RE =
  /\b(?:client|overpromis|scope\s+(?:creep|before)|client\s+(?:commitment|delivery|follow|status)|professional\s+commitment)\b/i;

const BORING_TASK_RE =
  /\b(?:boring|tedious|hate\s+this\s+task|admin\s+work|dread(?:ing)?\s+(?:it|this)|mindless\s+task|chore)\b/i;

const HYPERFOCUS_TRANSITION_RE =
  /\b(?:hyperfocus|can'?t\s+stop|hard\s+to\s+stop|won'?t\s+stop|stuck\s+in\s+(?:this|it)|switching\s+(?:tasks?|gears)|transition(?:ing)?|lose\s+(?:my\s+)?place|deep\s+focus|break\s+will\s+ruin)\b/i;

const DECISION_PARALYSIS_RE =
  /\b(?:decision\s+paralysis|overthink(?:ing)?|research(?:ing)?\s+(?:forever|too\s+much)|need\s+(?:more\s+)?certainty|reassurance[\s-]?seek|second.?guess(?:ing)?|enough\s+information|can'?t\s+stop\s+(?:researching|thinking))\b/i;

const DECISION_RE =
  /\b(?:can'?t\s+decide|cannot\s+decide|too\s+many\s+(?:options|choices)|which\s+(?:one|option)|help\s+me\s+decide|indecisive|keep\s+reopening)\b/i;

const TIME_AWARENESS_RE =
  /\b(?:time\s+blind|how\s+long\s+will\s+this|estimate\s+time|leave\s+now|behind\s+schedule|time\s+optimism|always\s+late|lost\s+track\s+of\s+time|deep\s+work\s+time|reverse\s+plan)\b/i;

const WORKING_MEMORY_RE =
  /\b(?:forgot|forget(?:ting)?|where\s+did\s+i\s+put|misplac(?:e|ed)|working\s+memory|capture\s+(?:this|that)|future\s+me|checklist|photograph\s+(?:it|the)|return[\s-]to[\s-]task)\b/i;

const EMOTIONAL_AWARENESS_RE =
  /\b(?:emotional(?:ly)?\s+(?:escalat|overload|wave|recover)|name\s+(?:the\s+)?emotion|facts?\s*,?\s*feelings?|ride\s+out|reactivity|triggered|escalat(?:e|ing)|after\s+(?:strong\s+)?emotion)\b/i;

const PROCRASTINATION_RE =
  /\b(?:procrastinat|avoid(?:ing|ance)|put(?:ting)?\s+it\s+off|do\s+it\s+later|i'?ll\s+do\s+it\s+later|not\s+ready\s+(?:yet|to)|been\s+avoiding|activation\s+energy|restart\s+without\s+guilt)\b/i;

const PERFECTIONISM_RE =
  /\b(?:perfectionis|not\s+good\s+enough|fear\s+of\s+failure|polish(?:ing)?|revise\s+(?:forever|again)|draft\s+before|imperfect|never\s+finished|keep\s+(?:editing|revising)|afraid\s+(?:it|to)\s+(?:fail|share))\b/i;

const ACTIVATION_RE =
  /\b(?:can'?t\s+start|cannot\s+start|don'?t\s+want\s+to\s+start|afraid\s+to\s+start|hard\s+to\s+start|need\s+to\s+focus|help\s+me\s+focus|where\s+to\s+start|getting\s+started|i\s+have\s+to\b|bossing\s+myself)\b/i;

const OVERWHELM_RE =
  /\b(?:overwhelm|too\s+much|can'?t\s+think|brain\s+(?:is\s+)?full|paralyz|everything\s+(?:is\s+)?urgent|too\s+many\s+(?:tabs|tasks|things)|clear\s+my\s+(?:head|mind)|don'?t\s+know\s+where\s+to\s+start)\b/i;

const MEMORY_TIME_RE =
  /\b(?:late|running\s+late|reminder|buffer|getting\s+ready|open\s+loops?|prepare\s+to\s+leave)\b/i;

export function classifyAdhdStrategyFriction(
  userText: string,
): AdhdStrategyFrictionKind {
  const t = userText.trim();
  if (!t) return "unknown";
  // More specific bundles first.
  if (REJECTION_SENSITIVITY_RE.test(t)) return "rejection_sensitivity";
  if (EMOTIONAL_SAFETY_RE.test(t)) return "emotional_safety";
  if (EMOTIONAL_AWARENESS_RE.test(t)) return "emotional_awareness";
  if (BURNOUT_RECOVERY_RE.test(t)) return "burnout_recovery";
  if (EMOTION_BURNOUT_RE.test(t)) return "emotion_burnout";
  if (PERFECTIONISM_RE.test(t)) return "perfectionism";
  if (MONEY_FINANCIAL_RE.test(t)) return "money_financial";
  if (PROCRASTINATION_RE.test(t)) return "procrastination";
  if (CREATIVITY_IDEAS_RE.test(t)) return "creativity_ideas";
  if (SLEEP_ENERGY_RE.test(t)) return "sleep_energy";
  if (MOTIVATION_MOMENTUM_RE.test(t)) return "motivation_momentum";
  if (DAILY_LIVING_HOME_RE.test(t)) return "daily_living_home";
  if (ROUTINES_HABITS_RE.test(t)) return "routines_habits";
  if (WORKPLACE_CAREER_RE.test(t)) return "workplace_career";
  if (HELP_DELEGATION_RE.test(t)) return "help_delegation";
  if (CHANGE_DISRUPTION_RE.test(t)) return "change_disruption";
  if (CLIENT_FOLLOW_THROUGH_RE.test(t)) return "client_follow_through";
  if (MEETINGS_APPOINTMENTS_RE.test(t)) return "meetings_appointments";
  if (PAPERWORK_ADMIN_RE.test(t)) return "paperwork_admin";
  if (RETURNING_RE.test(t)) return "returning_after_absence";
  if (RELATIONSHIPS_FAMILY_RE.test(t)) return "relationships_family";
  if (COMMUNICATION_RE.test(t)) return "communication_relationships";
  if (ORGANIZATION_CLUTTER_RE.test(t)) return "organization_clutter";
  if (BORING_TASK_RE.test(t)) return "boring_tasks_motivation";
  if (ENVIRONMENT_RE.test(t)) return "environment_sensory";
  if (HYPERFOCUS_TRANSITION_RE.test(t)) return "hyperfocus_transitions";
  if (LEARNING_INFORMATION_RE.test(t)) return "learning_information";
  if (DECISION_FATIGUE_RE.test(t)) return "decision_fatigue";
  if (DECISION_PARALYSIS_RE.test(t)) return "decision_paralysis";
  if (DECISION_RE.test(t)) return "decision_making";
  if (PLANNING_RE.test(t)) return "planning_follow_through";
  if (TIME_AWARENESS_RE.test(t)) return "time_awareness";
  if (WORKING_MEMORY_RE.test(t)) return "working_memory";
  if (OVERWHELM_RE.test(t)) return "overwhelm";
  if (MEMORY_TIME_RE.test(t)) return "memory_time";
  if (ACTIVATION_RE.test(t)) return "activation";
  return "unknown";
}

export function strategiesForFriction(
  kind: AdhdStrategyFrictionKind,
): readonly AdhdEverydayStrategy[] {
  if (kind === "unknown") return [];
  return ADHD_EVERYDAY_STRATEGIES.filter((s) => s.bundleId === kind);
}

export function getAdhdEverydayStrategy(
  id: AdhdEverydayStrategyId,
): AdhdEverydayStrategy | undefined {
  return ADHD_EVERYDAY_STRATEGIES.find((s) => s.id === id);
}

/**
 * Pick up to two candidate strategies for a turn.
 * Prefer specific friction clues when the text matches known patterns.
 */
export function resolveAdhdStrategyCandidates(
  userText: string,
  options?: { max?: number; excludeIds?: readonly AdhdEverydayStrategyId[] },
): AdhdEverydayStrategy[] {
  const max = options?.max ?? 2;
  const exclude = new Set(options?.excludeIds ?? []);
  const kind = classifyAdhdStrategyFriction(userText);
  const pool = strategiesForFriction(kind).filter((s) => !exclude.has(s.id));
  if (pool.length === 0) return [];

  const t = userText.toLowerCase();
  const scored = pool.map((s) => {
    let score = 0;
    const clue = s.frictionClue.toLowerCase();
    if (clue.includes("perfection") && /perfect/.test(t)) score += 3;
    if (clue.includes("alone") && /alone|by myself/.test(t)) score += 3;
    if (clue.includes("list") && /list|to-?do/.test(t)) score += 2;
    if (clue.includes("urgent") && /urgent|everything/.test(t)) score += 2;
    if (clue.includes("late") && /late|on time/.test(t)) score += 3;
    if (clue.includes("reminder") && /remind/.test(t)) score += 2;
    if (
      clue.includes("clear my mind") &&
      /clear my (head|mind)|brain dump/.test(t)
    )
      score += 3;
    if (clue.includes("where to start") && /where to start|can'?t start/.test(t))
      score += 2;
    if (clue.includes("endless") && /forever|never.?end|endless/.test(t))
      score += 2;
    if (clue.includes("pressure") && /have to|should|pressure/.test(t))
      score += 2;
    if (clue.includes("shame") && /shame|beating myself|stupid/.test(t))
      score += 3;
    if (clue.includes("burnout") && /burn/.test(t)) score += 3;
    if (clue.includes("stopping") && /can'?t stop|hard to stop/.test(t))
      score += 3;
    if (clue.includes("choices") && /options|choices|decide/.test(t)) score += 2;
    if (clue.includes("high stakes") && /high.?stakes|big decision/.test(t))
      score += 2;
    if (clue.includes("reopening") && /reopen|second.?guess/.test(t)) score += 3;
    if (clue.includes("backlog") && /backlog|catch up/.test(t)) score += 3;
    if (clue.includes("context has been lost") && /left off|been away/.test(t))
      score += 3;
    if (clue.includes("inner critic") && /critic|beating myself/.test(t))
      score += 3;
    if (clue.includes("rejection") && /reject/.test(t)) score += 3;
    if (clue.includes("lead task") && /most important|priority/.test(t))
      score += 2;
    if (clue.includes("clutter") && /clutter|messy/.test(t)) score += 3;
    if (clue.includes("boring") || (clue.includes("pleasant") && /boring|tedious/.test(t)))
      score += 2;
    if (clue.includes("boundary") && /boundary|overcommit/.test(t)) score += 3;
    if (clue.includes("follow up") && /follow up/.test(t)) score += 3;
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((x) => x.score > 0).slice(0, max).map((x) => x.s);
  if (top.length > 0) return top;

  const defaults: Record<AdhdStrategyBundleId, AdhdEverydayStrategyId[]> = {
    activation: ["002", "003"],
    overwhelm: ["014", "012"],
    memory_time: ["022", "021"],
    emotion_burnout: ["032", "035"],
    hyperfocus_transitions: ["041", "043"],
    decision_making: ["051", "055"],
    planning_follow_through: ["061", "065"],
    returning_after_absence: ["071", "072"],
    emotional_safety: ["083", "084"],
    environment_sensory: ["091", "095"],
    communication_relationships: ["101", "106"],
    boring_tasks_motivation: ["111", "112"],
    time_awareness: ["122", "126"],
    decision_paralysis: ["131", "133"],
    working_memory: ["141", "142"],
    emotional_awareness: ["151", "152"],
    procrastination: ["161", "163"],
    perfectionism: ["171", "172"],
    motivation_momentum: ["181", "183"],
    organization_clutter: ["191", "193"],
    routines_habits: ["201", "203"],
    paperwork_admin: ["211", "219"],
    meetings_appointments: ["221", "224"],
    money_financial: ["231", "232"],
    client_follow_through: ["241", "244"],
    creativity_ideas: ["251", "255"],
    burnout_recovery: ["261", "263"],
    decision_fatigue: ["271", "274"],
    rejection_sensitivity: ["281", "283"],
    relationships_family: ["291", "294"],
    daily_living_home: ["301", "304"],
    sleep_energy: ["311", "313"],
    learning_information: ["321", "326"],
    workplace_career: ["331", "333"],
    help_delegation: ["341", "345"],
    change_disruption: ["351", "355"],
  };
  const ids = defaults[kind as AdhdStrategyBundleId] ?? [];
  return ids
    .map((id) => pool.find((s) => s.id === id))
    .filter((s): s is AdhdEverydayStrategy => Boolean(s))
    .slice(0, max);
}

/** Compact prompt hint — never dump full strategy files. */
export function adhdStrategyHintForChat(userText: string): string | null {
  const candidates = resolveAdhdStrategyCandidates(userText, { max: 2 });
  if (candidates.length === 0) return null;

  const lines = [
    "ADHD EVERYDAY STRATEGY (experiment — not a prescription):",
    "Offer at most one primary strategy (second only if meaningfully different).",
    "Explain briefly why it may fit. Let the member choose. Do not lecture about ADHD.",
  ];
  candidates.forEach((s, i) => {
    lines.push(
      `${i + 1}. ${s.name} (${s.id}) — friction: ${s.frictionClue}. Offer: ${s.offerHint}`,
    );
  });
  return lines.join("\n");
}
