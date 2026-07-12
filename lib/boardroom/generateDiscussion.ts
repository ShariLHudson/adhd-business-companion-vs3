import type { AdvisoryMember, AdvisoryMemberId } from "@/lib/advisory/types";
import { getBoardMemberDefinition } from "@/lib/advisory/members/boardMembers";
import { resolveBoardMembers } from "./recommendBoard";
import type {
  BoardDecisionBrief,
  BoardDiscussionStyle,
  BoardDiscussionTurn,
  BoardMemberTurn,
  BoardModeratorNote,
} from "./types";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clip(text: string, max = 140): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function situationLabel(situation: string): string {
  const first = situation.trim().split(/[.!?\n]/)[0]?.trim() ?? situation.trim();
  return clip(first, 72) || "Untitled discussion";
}

export function titleFromSituation(situation: string): string {
  return situationLabel(situation);
}

function buildMemberTurn(
  member: AdvisoryMember,
  situation: string,
  style: BoardDiscussionStyle,
  index: number,
): BoardMemberTurn {
  const concern = member.primaryConcerns[index % member.primaryConcerns.length] ??
    member.primaryConcerns[0] ??
    "fit with priorities";
  const strength =
    member.strengths[index % member.strengths.length] ??
    member.strengths[0] ??
    member.role;
  const expertise =
    member.expertise[index % member.expertise.length] ?? member.role;
  const question =
    member.typicalQuestions[index % member.typicalQuestions.length] ??
    "What would make this decision feel clear?";

  const challengeBoost = style === "challenge-thinking";
  const quick = style === "quick-review";

  const pros = [
    `Could strengthen ${expertise.toLowerCase()} if the situation is truly about that.`,
    `Aligns with how I watch for: ${strength.toLowerCase()}.`,
  ].slice(0, quick ? 1 : 2);

  const cons = [
    `May strain ${concern.toLowerCase()} if we move before we understand the real constraint.`,
    ...(challengeBoost
      ? [
          `I would push back if this is solving a comfortable problem instead of the hard one underneath.`,
        ]
      : []),
  ].slice(0, quick ? 1 : 2);

  const risks = [
    `Risk: underestimating ${concern.toLowerCase()}.`,
    ...(challengeBoost
      ? [`Risk: locking in too early before missing information is named.`]
      : []),
  ].slice(0, quick ? 1 : 2);

  const opportunities = [
    `Opportunity: use this to clarify what success looks like from a ${member.role.toLowerCase()} lens.`,
  ];

  const tradeOffs = [
    `Trade-off: gaining ${expertise.toLowerCase()} progress may cost attention elsewhere.`,
  ];

  const unknowns = [
    `Unknown: how durable is the need behind “${clip(situation, 48)}”?`,
    `Unknown: what would change your mind?`,
  ].slice(0, quick ? 1 : 2);

  const questions = [question];

  const possibleOptions = [
    `Pause and gather one missing fact before choosing.`,
    `Run a small reversible test instead of a full commitment.`,
    `Choose the path that protects ${concern.toLowerCase()} first.`,
  ].slice(0, quick ? 2 : 3);

  const fitNotes = [
    `May fit if ${strength.toLowerCase()} is the priority right now.`,
    `May not fit if ${concern.toLowerCase()} is already under pressure.`,
  ];

  return {
    memberId: member.id,
    memberName: member.name,
    memberRole: member.role,
    perspective: `${member.role}: ${member.decisionStyle}`,
    pros,
    cons,
    risks,
    opportunities,
    tradeOffs,
    unknowns,
    questions,
    possibleOptions,
    fitNotes,
  };
}

function moderator(
  kind: BoardModeratorNote["kind"],
  text: string,
): BoardDiscussionTurn {
  return {
    id: uid("mod"),
    role: "moderator",
    note: { kind, text },
  };
}

function memberTurn(turn: BoardMemberTurn): BoardDiscussionTurn {
  return { id: uid(`m-${turn.memberId}`), role: "member", turn };
}

/** Build opening discussion turns for the selected board + style. */
export function generateOpeningDiscussion(input: {
  situation: string;
  memberIds: AdvisoryMemberId[];
  style: BoardDiscussionStyle;
}): BoardDiscussionTurn[] {
  const members = resolveBoardMembers(input.memberIds);
  const styleNote =
    input.style === "quick-review"
      ? "We'll keep this to a Quick Review — clear lenses, not a long debate."
      : input.style === "challenge-thinking"
        ? "I'll ask the board to Challenge Your Thinking — pressure-test assumptions kindly."
        : "We'll hold a Full Discussion — distinct perspectives, then agreements and gaps.";

  const turns: BoardDiscussionTurn[] = [
    moderator(
      "restate",
      `Here's how I'm hearing the situation: ${clip(input.situation, 280)}`,
    ),
    moderator("invite", styleNote),
  ];

  const speakerLimit =
    input.style === "quick-review"
      ? Math.min(4, members.length)
      : members.length;

  members.slice(0, speakerLimit).forEach((member, index) => {
    turns.push(
      memberTurn(buildMemberTurn(member, input.situation, input.style, index)),
    );
  });

  const agreements = synthesizeAgreements(members);
  const disagreements = synthesizeDisagreements(members);

  turns.push(moderator("agreement", agreements));
  turns.push(moderator("disagreement", disagreements));
  turns.push(
    moderator(
      "missing-info",
      "Before we go further — is there context the board is missing that would change how they see this?",
    ),
  );

  return turns;
}

function synthesizeAgreements(members: AdvisoryMember[]): string {
  const shared = members
    .flatMap((m) => m.primaryConcerns)
    .slice(0, 2)
    .join("; ");
  return `Where the board tends to agree: protect clarity before speed${
    shared ? `, and watch for ${shared.toLowerCase()}` : ""
  }. No one is choosing for you — they're naming what matters.`;
}

function synthesizeDisagreements(members: AdvisoryMember[]): string {
  if (members.length < 2) {
    return "With a small board, disagreement may be quiet — invite another lens if you want tension.";
  }
  const a = members[0]!;
  const b = members[1]!;
  return `Where lenses differ: ${a.name} leans on ${a.expertise[0]?.toLowerCase() ?? "strategy"}, while ${b.name} watches ${b.expertise[0]?.toLowerCase() ?? "fit"}. That tension is useful — it is not a verdict.`;
}

export function generateDecisionBrief(input: {
  situation: string;
  memberIds: AdvisoryMemberId[];
  turns: BoardDiscussionTurn[];
}): BoardDecisionBrief {
  const memberTurns = input.turns.filter(
    (t): t is Extract<BoardDiscussionTurn, { role: "member" }> =>
      t.role === "member",
  );

  const pros = unique(
    memberTurns.flatMap((t) => t.turn.pros),
  ).slice(0, 8);
  const cons = unique(
    memberTurns.flatMap((t) => t.turn.cons),
  ).slice(0, 8);
  const risks = unique(
    memberTurns.flatMap((t) => t.turn.risks),
  ).slice(0, 6);
  const unknowns = unique(
    memberTurns.flatMap((t) => t.turn.unknowns),
  ).slice(0, 6);
  const questions = unique(
    memberTurns.flatMap((t) => t.turn.questions),
  ).slice(0, 6);
  const options = unique(
    memberTurns.flatMap((t) => t.turn.possibleOptions),
  ).slice(0, 6);
  const opportunities = unique(
    memberTurns.flatMap((t) => t.turn.opportunities),
  ).slice(0, 6);

  const differentPerspectives = memberTurns.map(
    (t) =>
      `${t.turn.memberName} (${t.turn.memberRole}): ${t.turn.perspective}`,
  );

  const agreementTurn = input.turns.find(
    (t) => t.role === "moderator" && t.note.kind === "agreement",
  );
  const disagreementTurn = input.turns.find(
    (t) => t.role === "moderator" && t.note.kind === "disagreement",
  );

  return {
    situation: input.situation.trim(),
    optionsConsidered: options.length
      ? options
      : ["Continue exploring", "Pause until more is known", "Choose a reversible next step"],
    potentialBenefits: [...pros, ...opportunities].slice(0, 8),
    potentialDrawbacks: cons,
    risksAndUnknowns: [...risks, ...unknowns].slice(0, 8),
    areasOfAgreement: [
      agreementTurn && agreementTurn.role === "moderator"
        ? agreementTurn.note.text
        : "Clarity and ownership matter more than a fast answer.",
    ],
    differentPerspectives:
      differentPerspectives.length > 0
        ? differentPerspectives
        : [
            disagreementTurn && disagreementTurn.role === "moderator"
              ? disagreementTurn.note.text
              : "Perspectives will appear as the board speaks.",
          ],
    questionsStillToAnswer: questions.length
      ? questions
      : ["What would make this feel clear enough to decide?"],
    possibleNextSteps: [
      "Record a decision when you are ready.",
      "Revisit later with more context.",
      "Ask one board member a follow-up question.",
      "Invite another perspective if a lens is missing.",
    ],
    yourDecision: "",
  };
}

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

export function appendMemberContext(
  turns: BoardDiscussionTurn[],
  text: string,
): BoardDiscussionTurn[] {
  return [
    ...turns,
    {
      id: uid("ctx"),
      role: "member-context",
      text: text.trim(),
    },
    moderator(
      "invite",
      "Thank you — I've shared that with the board. Who would you like to hear from next?",
    ),
  ];
}

export function askBoardMemberTurn(
  memberId: AdvisoryMemberId,
  situation: string,
  style: BoardDiscussionStyle,
  extraContext?: string,
): BoardDiscussionTurn | null {
  const member = getBoardMemberDefinition(memberId);
  if (!member) return null;
  const base = buildMemberTurn(member, situation, style, 0);
  if (extraContext?.trim()) {
    base.questions = [
      ...base.questions,
      `Given what you added (“${clip(extraContext, 80)}”), what still feels unresolved?`,
    ];
  }
  return memberTurn(base);
}

export function challengeViewTurn(
  memberId: AdvisoryMemberId,
  situation: string,
): BoardDiscussionTurn | null {
  const member = getBoardMemberDefinition(memberId);
  if (!member) return null;
  const turn = buildMemberTurn(member, situation, "challenge-thinking", 1);
  turn.perspective = `Challenge from ${member.name}: pressure-test the comfortable story.`;
  turn.cons = [
    ...turn.cons,
    `What if the opposite of your preferred option is actually safer?`,
  ];
  return memberTurn(turn);
}

export function exploreOptionTurn(
  memberIds: AdvisoryMemberId[],
  situation: string,
  optionText: string,
): BoardDiscussionTurn[] {
  const members = resolveBoardMembers(memberIds).slice(0, 3);
  const turns: BoardDiscussionTurn[] = [
    moderator(
      "invite",
      `Let's explore this option together: ${clip(optionText, 160)}`,
    ),
  ];
  members.forEach((member, i) => {
    const t = buildMemberTurn(member, situation, "full-discussion", i + 2);
    t.fitNotes = [
      `If “${clip(optionText, 60)}” is the path: ${t.fitNotes[0] ?? "watch fit carefully."}`,
      t.fitNotes[1] ??
        `May not fit if it increases ${member.primaryConcerns[0]?.toLowerCase() ?? "strain"}.`,
    ];
    turns.push(memberTurn(t));
  });
  return turns;
}

export function emptyBrief(situation: string): BoardDecisionBrief {
  return {
    situation,
    optionsConsidered: [],
    potentialBenefits: [],
    potentialDrawbacks: [],
    risksAndUnknowns: [],
    areasOfAgreement: [],
    differentPerspectives: [],
    questionsStillToAnswer: [],
    possibleNextSteps: [],
    yourDecision: "",
  };
}
