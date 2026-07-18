/**
 * Batch 2 — Overwhelm, short-answer continuity, repairs, topic change (package 206).
 * Expands coverage beyond three featured samples + business-decision-only batch 1.
 */

import { ALL_QUALITY_PASS, type GoldStandardConversation } from "../types";

const COMMON_BLOCKED = [
  { text: "Take your time with that.", reason: "vague acknowledgement" },
  {
    text: "There may be a quieter question underneath.",
    reason: "unsupported hidden meaning",
  },
  { text: "You are working through something around does.", reason: "stop-word topic" },
  { text: "What matters most?", reason: "too abstract" },
  { text: "Tell me more.", reason: "generic" },
] as const;

function entry(
  partial: Omit<GoldStandardConversation, "quality" | "blockedAlternatives"> & {
    blockedAlternatives?: GoldStandardConversation["blockedAlternatives"];
  },
): GoldStandardConversation {
  return {
    ...partial,
    blockedAlternatives: partial.blockedAlternatives ?? [...COMMON_BLOCKED],
    quality: ALL_QUALITY_PASS,
  };
}

export const BATCH2_COVERAGE: GoldStandardConversation[] = [
  entry({
    id: "TIO-GSC-OVW-001",
    title: "Too Many Projects, Nowhere to Start",
    category: "overwhelm",
    categoryPath: "Overwhelm / Priorities",
    batch: 2,
    userIntent: "Untangle overload without a productivity lecture.",
    conversationGoal:
      "Name the heaviest item and what makes starting hard — without forcing a full plan.",
    topicAnchor: "too many projects competing",
    initialKnown: ["multiple projects", "hard to start"],
    initialUnknown: ["which is heaviest", "what blocked starting"],
    risks: ["menu of tips", "shame about capacity"],
    runtimeTags: ["overwhelm", "priorities", "clarify_practical_problem", "short_reply"],
    turns: [
      {
        role: "user",
        content: "I have three projects and I cannot get myself to start any of them.",
      },
      {
        role: "assistant",
        content:
          "You have a few projects waiting, and none of them feel easy to begin. Which one feels heaviest when you picture starting?",
        move: "clarify_desired_outcome",
      },
      { role: "user", content: "The client proposal." },
      {
        role: "assistant",
        content:
          "The client proposal is carrying the most weight. What about starting it feels hardest — the blank page, the stakes, or not knowing the first line?",
        move: "identify_concern",
      },
      { role: "user", content: "The stakes. I do not want to get it wrong." },
      {
        role: "assistant",
        content:
          "So the block is less about time and more about the cost of a wrong draft. What would a small first version need to include for you to feel safer opening it?",
        move: "explore_success_looks_like",
      },
    ],
  }),
  entry({
    id: "TIO-GSC-OVW-002",
    title: "Admin Avoidance Day",
    category: "overwhelm",
    categoryPath: "Overwhelm / Admin",
    batch: 2,
    userIntent: "Talk through avoiding admin work.",
    conversationGoal: "Separate dread from the actual task without shaming.",
    topicAnchor: "avoiding admin work",
    initialKnown: ["avoiding admin"],
    initialUnknown: ["which task", "what the dread is about"],
    risks: ["productivity lecture"],
    runtimeTags: ["overwhelm", "admin", "avoidance"],
    turns: [
      { role: "user", content: "I keep putting off the admin pile again." },
      {
        role: "assistant",
        content:
          "The admin pile is sitting there, and starting it keeps sliding. Which piece of it feels most unpleasant to open?",
        move: "clarify_desired_outcome",
      },
      { role: "user", content: "Invoices." },
      {
        role: "assistant",
        content:
          "Invoices are the part that sticks. Is the hard part the time they take, or how you feel while doing them?",
        move: "distinguish_two_uncertainties",
      },
    ],
  }),
  entry({
    id: "TIO-GSC-SHORT-001",
    title: "One-Word Answer — Cost",
    category: "topic-continuity",
    categoryPath: "Topic Continuity / Short Reply",
    batch: 2,
    userIntent: "Answer a focus question with one word without losing the hire topic.",
    conversationGoal: "Treat short replies as focus updates, never new topics.",
    topicAnchor: "hiring a marketing assistant",
    initialKnown: ["hiring decision", "cost is a concern"],
    initialUnknown: ["what about cost is hardest"],
    risks: ["treating cost as a new topic", "Take your time"],
    runtimeTags: ["short_reply", "topic_continuity", "hiring", "cost"],
    turns: [
      {
        role: "user",
        content: "I need to decide whether to hire a marketing assistant.",
      },
      {
        role: "assistant",
        content: "What is making you consider hiring one now?",
        move: "clarify_why_now",
      },
      { role: "user", content: "Cost." },
      {
        role: "assistant",
        content:
          "Cost is the part that is hard to judge in the hiring decision. What about the investment feels hardest to size — the monthly spend, or not knowing what return would make it worth it?",
        move: "identify_concern",
        avoids: ["Take your time with that.", "something around does"],
      },
    ],
  }),
  entry({
    id: "TIO-GSC-TOPIC-001",
    title: "Explicit Topic Change",
    category: "topic-continuity",
    categoryPath: "Topic Continuity / Change",
    batch: 2,
    userIntent: "Change from hiring to a client conversation mid-thread.",
    conversationGoal: "Confirm the change; do not blend topics.",
    topicAnchor: "difficult client conversation",
    initialKnown: ["was discussing hiring", "now wants client topic"],
    initialUnknown: ["what about the client conversation"],
    risks: ["blending topics", "assuming"],
    runtimeTags: ["topic_change", "clients"],
    turns: [
      { role: "user", content: "Should I hire marketing help?" },
      {
        role: "assistant",
        content: "What is making you consider hiring marketing help now?",
        move: "clarify_why_now",
      },
      {
        role: "user",
        content: "Actually, can we talk about something else — a client conversation I keep avoiding?",
      },
      {
        role: "assistant",
        content:
          "We can leave the hiring question. You are sitting with a client conversation you have been avoiding. What about bringing it up feels most at risk?",
        move: "return_to_topic",
      },
    ],
  }),
  entry({
    id: "TIO-GSC-CONF-001",
    title: "Pricing Confidence",
    category: "confidence",
    categoryPath: "Confidence / Pricing",
    batch: 2,
    userIntent: "Think through undercharging without being told a number.",
    conversationGoal: "Clarify what feels risky about raising the price.",
    topicAnchor: "raising prices",
    initialKnown: ["considering a price increase"],
    initialUnknown: ["fear of loss", "what fair looks like"],
    risks: ["prescribing a price"],
    runtimeTags: ["confidence", "pricing", "business_decision"],
    turns: [
      { role: "user", content: "I think I am undercharging and I am afraid to raise my prices." },
      {
        role: "assistant",
        content:
          "You are weighing a price increase, and the fear of raising them is real. What feels more risky — losing clients, or staying where you are?",
        move: "distinguish_two_uncertainties",
      },
      { role: "user", content: "Losing the clients I already have." },
      {
        role: "assistant",
        content:
          "Keeping current clients is the part you want to protect. What would need to be true for a higher price to still feel fair to them — and to you?",
        move: "explore_success_looks_like",
      },
    ],
  }),
  entry({
    id: "TIO-GSC-CLIENT-001",
    title: "Hard Client Boundary",
    category: "clients",
    categoryPath: "Clients / Boundaries",
    batch: 2,
    userIntent: "Talk through a boundary conversation.",
    conversationGoal: "Clarify risk of speaking vs staying quiet.",
    topicAnchor: "client boundary conversation",
    initialKnown: ["avoiding a client conversation"],
    initialUnknown: ["what needs to be said", "what is at risk"],
    risks: ["scripting the conversation for them"],
    runtimeTags: ["clients", "boundaries", "conversation"],
    turns: [
      {
        role: "user",
        content: "I need to tell a client I cannot keep doing unpaid extras, and I keep delaying it.",
      },
      {
        role: "assistant",
        content:
          "You are holding a boundary conversation about unpaid extras, and delay is keeping it close. What feels most at risk if you say it — or if you stay quiet?",
        move: "identify_concern",
      },
      { role: "user", content: "They leave." },
      {
        role: "assistant",
        content:
          "Losing the client is the fear in front. What would a clear, respectful version of the boundary need to protect for you?",
        move: "clarify_desired_outcome",
      },
    ],
  }),
  entry({
    id: "TIO-GSC-REPAIR-002",
    title: "Clarification After Vague Subject",
    category: "repairs",
    categoryPath: "Repairs / Clarification",
    batch: 2,
    userIntent: "Ask what Shari meant without losing the hire topic.",
    conversationGoal: "Own unclear wording; restore topic; never invent 'around does'.",
    topicAnchor: "hiring a marketing assistant",
    initialKnown: ["hiring decision"],
    initialUnknown: ["what Shari meant"],
    risks: ["something around does", "Take your time"],
    runtimeTags: ["repair", "clarification", "hiring"],
    turns: [
      {
        role: "user",
        content: "I need to decide whether to hire a marketing assistant.",
      },
      {
        role: "assistant",
        content: "What is making you consider hiring one now?",
        move: "clarify_why_now",
      },
      { role: "user", content: "What do you mean?" },
      {
        role: "assistant",
        content:
          "I did not explain that clearly. You are deciding whether hiring a marketing assistant makes sense. What is making you consider it at this point?",
        move: "repair_misunderstanding",
        avoids: [
          "You are working through something around does.",
          "Take your time with that.",
        ],
      },
    ],
  }),
  entry({
    id: "TIO-GSC-CORR-002",
    title: "Nothing Underneath — Stay Literal",
    category: "repairs",
    categoryPath: "Repairs / Correction",
    batch: 2,
    userIntent: "Reject hidden-meaning interpretation.",
    conversationGoal: "Accept correction; return to literal hire topic.",
    topicAnchor: "hiring help",
    initialKnown: ["hiring help", "rejected deeper read"],
    initialUnknown: ["why now"],
    risks: ["quieter question underneath", "Take your time"],
    runtimeTags: ["correction", "no_hidden_meaning", "hiring"],
    turns: [
      { role: "user", content: "Should I hire help for marketing?" },
      {
        role: "assistant",
        content:
          "There may be a quieter question underneath about whether you feel ready to grow.",
        move: "other",
        avoids: ["this turn is the failure being repaired"],
      },
      { role: "user", content: "Nothing underneath." },
      {
        role: "assistant",
        content:
          "You're right — I was looking at the wrong thing. You're wondering whether hiring marketing help makes sense. What is making you consider it now?",
        move: "accept_correction",
        avoids: [
          "There may be a quieter question underneath.",
          "Take your time with that.",
          "Let's stay with",
        ],
      },
    ],
  }),
  entry({
    id: "TIO-GSC-END-001",
    title: "Natural Completion When Clear",
    category: "conversation-endings",
    categoryPath: "Endings / Clarity",
    batch: 2,
    userIntent: "Stop once the main uncertainty is named.",
    conversationGoal: "Summarize grounded clarity; optional continuation.",
    topicAnchor: "hiring a marketing assistant",
    initialKnown: ["need help", "cost vs results unclear"],
    initialUnknown: [],
    risks: ["Is there anything else?", "Great job"],
    runtimeTags: ["completion", "summary", "hiring"],
    turns: [
      {
        role: "user",
        content: "I need to decide whether to hire a marketing assistant.",
      },
      {
        role: "assistant",
        content: "What is making you consider hiring one now?",
        move: "clarify_why_now",
      },
      {
        role: "user",
        content: "I need visibility help, but I cannot tell what results would justify the cost.",
      },
      {
        role: "assistant",
        content:
          "You know you want help with visibility. The unclear part is what results would justify the cost.",
        move: "summarize_emerging_picture",
      },
      { role: "user", content: "That is exactly it." },
      {
        role: "assistant",
        content:
          "You started by wondering whether to hire a marketing assistant. What became clear is that you do want help with visibility. The unresolved part is how to define results that would justify the cost. You do not have to settle it today.",
        move: "close_with_useful_summary",
        avoids: ["Is there anything else?", "Great job working through that."],
      },
    ],
  }),
  entry({
    id: "TIO-GSC-CREATIVE-001",
    title: "Creative Block on Offer Explanation",
    category: "creative-thinking",
    categoryPath: "Creative / Offer Clarity",
    batch: 2,
    userIntent: "Unstick how to explain a program.",
    conversationGoal: "Find the hard part of the explanation without writing it for them.",
    topicAnchor: "explaining the program clearly",
    initialKnown: ["stuck explaining offer"],
    initialUnknown: ["which part of the explanation"],
    risks: ["drafting the full offer unprompted"],
    runtimeTags: ["creative", "offer", "clarity"],
    turns: [
      { role: "user", content: "I cannot figure out how to explain my program clearly." },
      {
        role: "assistant",
        content:
          "You are stuck on how to explain your program clearly. What part of the explanation feels hardest to get right?",
        move: "identify_concern",
      },
      { role: "user", content: "Who it is for." },
      {
        role: "assistant",
        content:
          "Naming who it is for is the sticky part. When you picture someone it is truly for, what problem are they trying to solve when they find you?",
        move: "clarify_desired_outcome",
      },
    ],
  }),
];
