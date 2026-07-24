/**
 * Pattern catalog — materializes OptionPatternId into distinct strategic paths.
 * Growth is never the only default; wait / simplify / stop / continue remain valid.
 */

import type { Reversibility } from "../../domainModel";
import type {
  CapacityRequirement,
  OptionConfidence,
  StrategicOption,
  StrategicRisk,
} from "../optionContract";
import type { OptionPatternId, StrategicExperiment, StrategyTypeId } from "../types";

export type OptionPatternBlueprint = {
  pattern: OptionPatternId;
  /** Strategic axis — options on the same axis compete; different axes diversify. */
  axis:
    | "commit"
    | "expand"
    | "narrow"
    | "protect"
    | "test"
    | "wait"
    | "reduce"
    | "stop"
    | "partner"
    | "reposition";
  defaultTitle: string;
  summary: string;
  rationale: string;
  benefits: string[];
  tradeoffs: string[];
  protects: string[];
  delaysOrPrevents: string[];
  opportunityCosts: string[];
  assumptions: string[];
  evidenceNeeded: string[];
  capacityRequirements: CapacityRequirement[];
  risk: StrategicRisk;
  reversibility: Reversibility;
  secondOrderEffects: string[];
  experiment: StrategicExperiment;
  confidence: OptionConfidence;
};

const catalog: Record<OptionPatternId, OptionPatternBlueprint> = {
  continue: {
    pattern: "continue",
    axis: "commit",
    defaultTitle: "Keep the current direction with clearer focus",
    summary: "Stay the course, but make the commitment explicit for a season.",
    rationale:
      "When the path is mostly right, the cost of switching can exceed the cost of refining.",
    benefits: ["Preserves momentum", "Uses what already works"],
    tradeoffs: ["Less room to chase new paths short-term"],
    protects: ["Existing traction", "Hard-won context"],
    delaysOrPrevents: ["Major pivots", "Scattered new bets"],
    opportunityCosts: ["Ideas outside this focus wait"],
    assumptions: ["The current direction still fits the season"],
    evidenceNeeded: ["What is already working that you do not want to lose"],
    capacityRequirements: [
      { kind: "attention", note: "Enough focus to protect one priority" },
    ],
    risk: {
      description: "Staying put without refining can quietly stall progress.",
      severity: "medium",
      reversibility: "moderately_reversible",
      mitigation: "Name one review date and one signal that would reopen the choice.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: [
      "Clearer weekly choices once the season commitment is named",
    ],
    experiment: {
      assumptionBeingTested: "Protecting this direction for a season improves results.",
      smallAction: "Protect one priority for 30 days and pause competing bets.",
      duration: "30 days",
      successSignal: "Less decision noise and steadier progress on the priority.",
      stopSignal: "The direction creates more strain than progress.",
      evidenceToCollect: "Weekly energy, progress, and missed-opportunity regret.",
      decisionThatFollows: "Whether to continue, narrow further, or reopen options.",
    },
    confidence: "moderate",
  },
  expand: {
    pattern: "expand",
    axis: "expand",
    defaultTitle: "Expand in one clear channel or segment",
    summary: "Grow reach where the offer and capacity already hold.",
    rationale:
      "Expansion is strategic only when delivery and fit are already stable enough.",
    benefits: ["More reach", "Faster learning about demand"],
    tradeoffs: ["Time, cost, and delivery pressure rise"],
    protects: ["Ambition for growth"],
    delaysOrPrevents: ["Deep simplification work"],
    opportunityCosts: ["Capacity that could deepen the current offer"],
    assumptions: ["Demand exists beyond the current base"],
    evidenceNeeded: ["Signs that capacity can absorb more without breaking trust"],
    capacityRequirements: [
      { kind: "energy", note: "Room to handle new demand without burnout" },
      { kind: "money", note: "Budget for a time-boxed acquisition test" },
    ],
    risk: {
      description: "Demand could outpace quality or overwhelm capacity.",
      severity: "high",
      reversibility: "moderately_reversible",
      mitigation: "Cap the experiment to one channel and a clear stop date.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: ["New customers may raise expectations across the offer"],
    experiment: {
      assumptionBeingTested: "One channel can bring fit customers without overload.",
      smallAction: "Test one acquisition channel for 30 days with a volume cap.",
      duration: "30 days",
      successSignal: "New joins or leads at an acceptable quality.",
      stopSignal: "Delivery strain or poor-fit demand rises sharply.",
      evidenceToCollect: "Lead quality, delivery load, and conversion.",
      decisionThatFollows: "Whether to scale that channel, change it, or pause growth.",
    },
    confidence: "moderate",
  },
  narrow: {
    pattern: "narrow",
    axis: "narrow",
    defaultTitle: "Narrow to the best-fit customers or focus",
    summary: "Grow clarity by serving fewer paths more deliberately.",
    rationale:
      "Narrowing can increase revenue and calm without broader acquisition noise.",
    benefits: ["Stronger fit", "Clearer messaging"],
    tradeoffs: ["Some audiences feel farther away"],
    protects: ["Positioning clarity"],
    delaysOrPrevents: ["Broad market experiments"],
    opportunityCosts: ["Adjacent segments left for later"],
    assumptions: ["A sharper segment already exists in the current base"],
    evidenceNeeded: ["Who already gets the most value"],
    capacityRequirements: [
      { kind: "attention", note: "Willingness to say no to off-fit work" },
    ],
    risk: {
      description: "Narrowing too early could miss a viable adjacent market.",
      severity: "medium",
      reversibility: "easily_reversible",
      mitigation: "Treat the narrow focus as a season, not a permanent identity.",
    },
    reversibility: "easily_reversible",
    secondOrderEffects: ["Messaging and offer design become simpler to execute"],
    experiment: {
      assumptionBeingTested: "One segment converts and feels easier to serve.",
      smallAction: "Speak only to one segment for 30 days.",
      duration: "30 days",
      successSignal: "Clearer conversations and better-fit responses.",
      stopSignal: "Demand collapses or regret about excluded paths rises.",
      evidenceToCollect: "Conversation quality, conversion, and delivery ease.",
      decisionThatFollows: "Whether to keep the narrow focus or reopen adjacent paths.",
    },
    confidence: "moderate",
  },
  simplify: {
    pattern: "simplify",
    axis: "reduce",
    defaultTitle: "Simplify before expanding",
    summary: "Remove drag so the real decision becomes easier to see.",
    rationale: "Doing less can be the strategic move when complexity is the constraint.",
    benefits: ["Clearer execution", "Lower cognitive load"],
    tradeoffs: ["Some ideas wait"],
    protects: ["Focus and capacity"],
    delaysOrPrevents: ["New initiatives and expansions"],
    opportunityCosts: ["Near-term growth experiments"],
    assumptions: ["Complexity is costing more than opportunity right now"],
    evidenceNeeded: ["Which activities create drag without proportional value"],
    capacityRequirements: [
      { kind: "attention", note: "A short window to cut or pause low-value work" },
    ],
    risk: {
      description: "Simplifying the wrong thing could remove a quiet strength.",
      severity: "medium",
      reversibility: "easily_reversible",
      mitigation: "Pause rather than permanently delete; review after 30 days.",
    },
    reversibility: "easily_reversible",
    secondOrderEffects: ["Decision quality often rises when fewer paths compete"],
    experiment: {
      assumptionBeingTested: "Removing one low-value activity frees meaningful capacity.",
      smallAction: "Stop or pause one low-value activity for 30 days.",
      duration: "30 days",
      successSignal: "More room for the priority that matters.",
      stopSignal: "Removing it creates unexpected harm or regret.",
      evidenceToCollect: "Time recovered, stress level, and progress on the core aim.",
      decisionThatFollows: "Whether to keep the simplification or restore the activity.",
    },
    confidence: "high",
  },
  delay: {
    pattern: "delay",
    axis: "wait",
    defaultTitle: "Wait until one missing signal is clearer",
    summary: "Postpone commitment when a material unknown still blocks judgment.",
    rationale:
      "Waiting is valid when the next fact would change the decision more than another brainstorm.",
    benefits: ["Avoids a premature lock-in", "Protects energy"],
    tradeoffs: ["Progress feels slower"],
    protects: ["Optionality", "Credibility"],
    delaysOrPrevents: ["Full commitment", "Public announcements"],
    opportunityCosts: ["Momentum from acting now"],
    assumptions: ["A specific signal will arrive or can be gathered soon"],
    evidenceNeeded: ["What exactly would change your mind if you knew it"],
    capacityRequirements: [
      { kind: "time", note: "A defined wait window, not an open-ended stall" },
    ],
    risk: {
      description: "Waiting without a review date can become quiet avoidance.",
      severity: "medium",
      reversibility: "easily_reversible",
      mitigation: "Name the signal, the date, and what you will decide then.",
    },
    reversibility: "easily_reversible",
    secondOrderEffects: ["Pressure drops when waiting is intentional, not vague"],
    experiment: {
      assumptionBeingTested: "One missing signal is worth a short, named wait.",
      smallAction: "Write the missing signal and a review date within two weeks.",
      duration: "14 days",
      successSignal: "The signal arrives or you know it will not.",
      stopSignal: "Waiting increases anxiety without clarifying the decision.",
      evidenceToCollect: "Whether the named signal appeared and what it changed.",
      decisionThatFollows: "Commit, test, or reopen options with clearer information.",
    },
    confidence: "moderate",
  },
  test: {
    pattern: "test",
    axis: "test",
    defaultTitle: "Run a small experiment before a full commitment",
    summary: "Learn with a reversible move instead of deciding once for all.",
    rationale:
      "When certainty is still low, a time-boxed test often beats a permanent choice.",
    benefits: ["Learning with less risk", "Preserves future flexibility"],
    tradeoffs: ["Slower final decision"],
    protects: ["Future optionality"],
    delaysOrPrevents: ["Irreversible commitments"],
    opportunityCosts: ["Speed of a full launch"],
    assumptions: ["A meaningful signal can be gathered in a short window"],
    evidenceNeeded: ["What success and stop signals would look like"],
    capacityRequirements: [
      { kind: "time", note: "Enough room to run and notice the test" },
    ],
    risk: {
      description: "A vague test can create motion without learning.",
      severity: "medium",
      reversibility: "easily_reversible",
      mitigation: "Define success, stop, and the decision that follows before starting.",
    },
    reversibility: "easily_reversible",
    secondOrderEffects: ["Confidence rises when evidence replaces guessing"],
    experiment: {
      assumptionBeingTested: "The leading direction will hold up in real conditions.",
      smallAction: "Run a small, time-boxed test of the leading direction.",
      duration: "30 days",
      successSignal: "Clearer signal that the direction fits.",
      stopSignal: "Evidence that the direction creates more strain than progress.",
      evidenceToCollect: "A few concrete signals you can notice without a dashboard.",
      decisionThatFollows: "Whether to commit, adjust, or choose another path.",
    },
    confidence: "high",
  },
  partner: {
    pattern: "partner",
    axis: "partner",
    defaultTitle: "Partner or share the load instead of owning it alone",
    summary: "Bring help, collaboration, or shared ownership into the path.",
    rationale:
      "Some decisions are really about capacity and ownership, not more personal effort.",
    benefits: ["Shared load", "Access to skills you may not want to build alone"],
    tradeoffs: ["Coordination cost and less solo control"],
    protects: ["Founder energy"],
    delaysOrPrevents: ["Fully solo execution"],
    opportunityCosts: ["Independence and speed of unilateral decisions"],
    assumptions: ["Someone else can own a clear piece without quality collapse"],
    evidenceNeeded: ["Which piece of work is clear enough to hand off"],
    capacityRequirements: [
      { kind: "support", note: "Someone available to own a defined piece" },
      { kind: "skill", note: "Enough clarity to brief and review" },
    ],
    risk: {
      description: "Partnership without role clarity can create new management load.",
      severity: "high",
      reversibility: "moderately_reversible",
      mitigation: "Start with one well-defined task and a short review window.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: ["Identity can shift from doer to steward of the work"],
    experiment: {
      assumptionBeingTested:
        "A clearly defined task can be owned by someone else without quality loss.",
      smallAction: "Hand off one well-defined task for two weeks.",
      duration: "14 days",
      successSignal: "The task completes reliably with light oversight.",
      stopSignal: "Quality drops or management time exceeds the relief gained.",
      evidenceToCollect: "Time saved, rework needed, and your stress level.",
      decisionThatFollows: "Whether to expand help, redesign the role, or pause.",
    },
    confidence: "moderate",
  },
  stop: {
    pattern: "stop",
    axis: "stop",
    defaultTitle: "Stop or sunset this path",
    summary: "End a direction that no longer earns its cost.",
    rationale:
      "Stopping can protect the future when continuing only preserves sunk cost.",
    benefits: ["Frees capacity", "Ends false hope"],
    tradeoffs: ["Loss of what the path once promised"],
    protects: ["Future seasons", "Reputation for honesty with yourself"],
    delaysOrPrevents: ["Continued investment in a weak path"],
    opportunityCosts: ["Any residual upside if the path could still recover"],
    assumptions: ["The path’s cost now exceeds its realistic upside"],
    evidenceNeeded: ["What continuing would require that you do not have"],
    capacityRequirements: [
      { kind: "energy", note: "Emotional room to close something unfinished" },
    ],
    risk: {
      description: "Stopping too fast could discard a path that needed redesign, not death.",
      severity: "high",
      reversibility: "difficult_to_reverse",
      mitigation: "Sunset with a short closing experiment before permanent exit.",
    },
    reversibility: "difficult_to_reverse",
    secondOrderEffects: ["Relief often appears after the decision, not before"],
    experiment: {
      assumptionBeingTested: "Pausing this path creates more relief than regret.",
      smallAction: "Pause new investment in this path for 30 days.",
      duration: "30 days",
      successSignal: "Noticeable relief and clearer attention elsewhere.",
      stopSignal: "Strong evidence the path still deserves one redesign attempt.",
      evidenceToCollect: "Energy, opportunity created, and lingering regret.",
      decisionThatFollows: "Fully stop, redesign once, or reopen with limits.",
    },
    confidence: "moderate",
  },
  stabilize: {
    pattern: "stabilize",
    axis: "protect",
    defaultTitle: "Stabilize and protect capacity first",
    summary: "Restore steadiness before asking the business for more.",
    rationale:
      "When capacity is already tight, expansion often worsens the real problem.",
    benefits: ["Protects delivery quality", "Reduces overload"],
    tradeoffs: ["Delays growth or change"],
    protects: ["Delivery promise", "Health and reputation"],
    delaysOrPrevents: ["Acquisition pushes", "Major new launches"],
    opportunityCosts: ["Near-term growth"],
    assumptions: ["Capacity strain is the binding constraint"],
    evidenceNeeded: ["Where delivery or energy is already fraying"],
    capacityRequirements: [
      { kind: "energy", note: "Willingness to protect recovery over expansion" },
    ],
    risk: {
      description: "Stabilizing forever can become avoidance of a needed change.",
      severity: "medium",
      reversibility: "easily_reversible",
      mitigation: "Name a review date when expansion may be reconsidered.",
    },
    reversibility: "easily_reversible",
    secondOrderEffects: ["Trust rises when promises match capacity again"],
    experiment: {
      assumptionBeingTested: "Protecting capacity for 30 days restores workable steadiness.",
      smallAction: "Pause new acquisition or change experiments for 30 days.",
      duration: "30 days",
      successSignal: "Delivery feels steadier and stress drops.",
      stopSignal: "Stabilizing creates cash or opportunity risk you cannot absorb.",
      evidenceToCollect: "Wait times, complaints, energy, and cash pressure.",
      decisionThatFollows: "Whether to keep protecting, redesign, or reopen growth.",
    },
    confidence: "high",
  },
  reposition: {
    pattern: "reposition",
    axis: "reposition",
    defaultTitle: "Reposition the offer or story before changing the structure",
    summary: "Change how the work is understood before changing what it is.",
    rationale:
      "Sometimes the strategic issue is meaning and fit, not a brand-new product.",
    benefits: ["Clearer market fit", "Less rebuild than a full pivot"],
    tradeoffs: ["Messaging work before structural change"],
    protects: ["Core strengths of the current offer"],
    delaysOrPrevents: ["Full rebuilds"],
    opportunityCosts: ["Time that could go into a new product"],
    assumptions: ["The underlying offer still has value in a clearer frame"],
    evidenceNeeded: ["Where people already misunderstand or undervalue the offer"],
    capacityRequirements: [
      { kind: "skill", note: "Ability to rewrite message and test it" },
    ],
    risk: {
      description: "Repositioning can delay a needed structural change.",
      severity: "medium",
      reversibility: "moderately_reversible",
      mitigation: "Time-box the messaging test before larger rebuilds.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: ["Audience quality often shifts with clearer positioning"],
    experiment: {
      assumptionBeingTested: "A clearer frame improves fit without rebuilding everything.",
      smallAction: "Test one repositioned message with a small audience for 30 days.",
      duration: "30 days",
      successSignal: "Better-fit conversations and fewer wrong-fit inquiries.",
      stopSignal: "No change in fit despite clearer messaging.",
      evidenceToCollect: "Inquiry quality and confusion questions asked.",
      decisionThatFollows: "Keep the new frame, refine it, or consider a deeper change.",
    },
    confidence: "moderate",
  },
  raise_value: {
    pattern: "raise_value",
    axis: "protect",
    defaultTitle: "Strengthen or clarify value before asking for more",
    summary: "Make the promise clearer before changing price or commitment.",
    rationale:
      "Useful when the worry is less about the number and more about how the change will feel.",
    benefits: ["Stronger explanation before asking more"],
    tradeoffs: ["Takes more time before revenue changes"],
    protects: ["Perceived fairness"],
    delaysOrPrevents: ["Immediate price increases"],
    opportunityCosts: ["Near-term cash improvement"],
    assumptions: ["There is a clear value improvement or proof point to show"],
    evidenceNeeded: ["What value proof is missing today"],
    capacityRequirements: [
      { kind: "time", note: "Room to improve one proof point before the change" },
    ],
    risk: {
      description: "Value work can become a delay tactic for a needed price change.",
      severity: "medium",
      reversibility: "easily_reversible",
      mitigation: "Limit value work to one proof point, then revisit price.",
    },
    reversibility: "easily_reversible",
    secondOrderEffects: ["Trust often rises when value is visible before the ask"],
    experiment: {
      assumptionBeingTested: "One clearer value proof improves willingness to pay.",
      smallAction: "Improve one value proof point, then revisit price.",
      duration: "30 days",
      successSignal: "Fewer value objections and steadier joins.",
      stopSignal: "Value clarity improves but cash pressure remains urgent.",
      evidenceToCollect: "Objections heard and join rate.",
      decisionThatFollows: "Whether to raise price, grandfather, or keep working value.",
    },
    confidence: "moderate",
  },
  raise_price: {
    pattern: "raise_price",
    axis: "expand",
    defaultTitle: "Raise the price for everyone",
    summary: "Update pricing across the board when the offer already feels underpriced.",
    rationale:
      "Improves revenue more directly when value is already clear enough to support it.",
    benefits: ["Clearer revenue impact"],
    tradeoffs: ["May create more concern among current members"],
    protects: ["Revenue sustainability"],
    delaysOrPrevents: ["Soft launches and grandfather complexity"],
    opportunityCosts: ["Goodwill that a gentler path might preserve"],
    assumptions: ["Members still see enough value after the change"],
    evidenceNeeded: ["Cost changes and current willingness-to-pay signals"],
    capacityRequirements: [
      { kind: "attention", note: "Room to communicate the change carefully" },
    ],
    risk: {
      description: "Some current members may feel surprised or less loyal.",
      severity: "high",
      reversibility: "difficult_to_reverse",
      mitigation: "Explain value clearly and watch early cancellations closely.",
    },
    reversibility: "difficult_to_reverse",
    secondOrderEffects: ["The price becomes part of how the offer is perceived"],
    experiment: {
      assumptionBeingTested:
        "Current and new members will accept a higher price when value is clear.",
      smallAction: "Announce a planned change to a small group first.",
      duration: "30 days",
      successSignal: "Acceptable retention and join rate after the change.",
      stopSignal: "Sharp cancellations or confusion about value.",
      evidenceToCollect: "Retention, questions asked, and early cancellations.",
      decisionThatFollows: "Keep the raise, soften it, or protect current members.",
    },
    confidence: "moderate",
  },
  different_market: {
    pattern: "different_market",
    axis: "reposition",
    defaultTitle: "Serve a different market or customer",
    summary: "Change who you serve when the current market is the constraint.",
    rationale:
      "A market shift can unlock fit when the offer is sound but the audience is wrong.",
    benefits: ["Better-fit demand", "Fresh learning"],
    tradeoffs: ["Rebuild of messaging and relationships"],
    protects: ["Core offer strengths"],
    delaysOrPrevents: ["Deepening the current market"],
    opportunityCosts: ["Equity already built with the current audience"],
    assumptions: ["A clearer market exists that fits the offer"],
    evidenceNeeded: ["Signals that another audience already responds better"],
    capacityRequirements: [
      { kind: "attention", note: "Room to learn a new audience without abandoning all delivery" },
    ],
    risk: {
      description: "Chasing a new market can abandon a viable base too soon.",
      severity: "high",
      reversibility: "moderately_reversible",
      mitigation: "Test the new market in parallel before a full shift.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: ["Offer language and proof points usually need to change"],
    experiment: {
      assumptionBeingTested: "A different segment responds with better fit.",
      smallAction: "Run one outreach or offer test to a new segment for 30 days.",
      duration: "30 days",
      successSignal: "Stronger conversations and clearer pull.",
      stopSignal: "No better fit than the current market.",
      evidenceToCollect: "Response quality and conversion intent.",
      decisionThatFollows: "Shift, stay, or split attention with limits.",
    },
    confidence: "low",
  },
  protect_base: {
    pattern: "protect_base",
    axis: "protect",
    defaultTitle: "Protect the current base while changing for new joins",
    summary: "Update the future without surprising the people already committed.",
    rationale:
      "Protects trust with people already committed while updating new joins.",
    benefits: ["Protects current member relationships"],
    tradeoffs: ["Slower revenue change", "Two-tier complexity"],
    protects: ["Current member trust"],
    delaysOrPrevents: ["Uniform pricing or policy simplicity"],
    opportunityCosts: ["Immediate revenue from changing everyone"],
    assumptions: ["New-member changes alone are enough for now"],
    evidenceNeeded: ["How sensitive current members are to change"],
    capacityRequirements: [
      { kind: "attention", note: "Care to communicate two paths clearly" },
    ],
    risk: {
      description: "Two-tier systems can create complexity and perceived unfairness later.",
      severity: "medium",
      reversibility: "moderately_reversible",
      mitigation: "Time-box grandfathering and write the eventual transition plan.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: ["Trust often rises when current people feel protected"],
    experiment: {
      assumptionBeingTested: "New-member pricing alone can improve economics.",
      smallAction: "Apply the new price or policy to new members for 30 days.",
      duration: "30 days",
      successSignal: "New joins continue at an acceptable rate.",
      stopSignal: "New joins drop sharply or communication becomes confusing.",
      evidenceToCollect: "Join rate, questions asked, and retention of the base.",
      decisionThatFollows: "Keep protecting the base, stage a later change, or raise more broadly.",
    },
    confidence: "high",
  },
  staged_transition: {
    pattern: "staged_transition",
    axis: "commit",
    defaultTitle: "Move in stages rather than all at once",
    summary: "Sequence the change so learning and trust can keep pace.",
    rationale:
      "A staged path reduces irreversibility while still making real progress.",
    benefits: ["Learning between stages", "Lower shock"],
    tradeoffs: ["Slower completion of the full change"],
    protects: ["Trust and optionality"],
    delaysOrPrevents: ["One-shot permanent commitments"],
    opportunityCosts: ["Speed of a clean break"],
    assumptions: ["Intermediate stages will produce useful signal"],
    evidenceNeeded: ["What stage one can teach before stage two"],
    capacityRequirements: [
      { kind: "time", note: "Patience for a multi-step path" },
    ],
    risk: {
      description: "Staging can stall if stage gates are never defined.",
      severity: "medium",
      reversibility: "moderately_reversible",
      mitigation: "Define stage one, success signal, and the next gate before starting.",
    },
    reversibility: "moderately_reversible",
    secondOrderEffects: ["People adapt better when change arrives in believable steps"],
    experiment: {
      assumptionBeingTested: "Stage one creates enough signal to justify stage two.",
      smallAction: "Complete only stage one with a named review before going further.",
      duration: "30 days",
      successSignal: "Stage-one goals met without trust or capacity damage.",
      stopSignal: "Stage one creates confusion or strain that stage two would worsen.",
      evidenceToCollect: "Stage-one outcomes, questions, and capacity load.",
      decisionThatFollows: "Continue to stage two, redesign, or stop.",
    },
    confidence: "high",
  },
};

export function getOptionPatternBlueprint(
  pattern: OptionPatternId,
): OptionPatternBlueprint {
  return catalog[pattern];
}

export function materializeStrategicOption(
  pattern: OptionPatternId,
  opts?: {
    id?: string;
    titleOverride?: string;
    typeId?: StrategyTypeId | null;
    commonTradeoffs?: string[];
    commonRisks?: string[];
    experimentHint?: string;
  },
): StrategicOption {
  const bp = catalog[pattern];
  const title = opts?.titleOverride || bp.defaultTitle;
  const tradeoffs = [
    ...bp.tradeoffs,
    ...(opts?.commonTradeoffs?.slice(0, 1) ?? []),
  ].slice(0, 3);
  const risk: StrategicRisk = opts?.commonRisks?.[0]
    ? {
        ...bp.risk,
        description: opts.commonRisks[0],
      }
    : bp.risk;
  const experiment: StrategicExperiment = opts?.experimentHint
    ? { ...bp.experiment, smallAction: opts.experimentHint }
    : bp.experiment;

  return {
    id: opts?.id || pattern,
    title,
    name: title,
    summary: bp.summary,
    rationale: bp.rationale,
    optionPattern: pattern,
    patternId: pattern,
    whyItMayFit: bp.rationale,
    benefits: bp.benefits,
    tradeoffs,
    whatWouldNeedToBeTrue: bp.assumptions,
    smallTest: experiment.smallAction,
    risksDetailed: [risk],
    assumptions: bp.assumptions,
    evidenceNeeded: bp.evidenceNeeded,
    capacityRequirements: bp.capacityRequirements,
    opportunityCosts: bp.opportunityCosts,
    reversibility: bp.reversibility,
    secondOrderEffects: bp.secondOrderEffects,
    protectsList: bp.protects,
    delaysOrPrevents: bp.delaysOrPrevents,
    experiment,
    confidence: bp.confidence,
    primaryBenefit: bp.benefits[0],
    mainTradeoff: tradeoffs[0],
    protects: bp.protects[0],
    risks: risk.description,
    smallestUsefulTest: experiment.smallAction,
  };
}

export function axisForPattern(pattern: OptionPatternId): string {
  return catalog[pattern].axis;
}
