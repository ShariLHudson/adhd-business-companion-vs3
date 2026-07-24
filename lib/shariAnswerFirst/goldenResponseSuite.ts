/**
 * Golden response evaluation cases — quality/behavior, not exact text match.
 */

import type { ShariProfessionalRole } from "./professionalRoles";

export type GoldenResponseCase = {
  id: string;
  request: string;
  followUp?: string;
  expectedRole: ShariProfessionalRole;
  expectedContextUse: "none" | "when_available" | "required_if_present";
  expectedWisdomSignals: string[];
  requiredContent: RegExp[];
  forbiddenPatterns: RegExp[];
  minimumExcellenceScore: number;
  minimumDelightScore: number;
  minimumComparativeScore: number;
};

export const SHARI_GOLDEN_RESPONSE_CASES: GoldenResponseCase[] = [
  {
    id: "loom-howto",
    request: "How do I create a Loom video?",
    expectedRole: "teacher",
    expectedContextUse: "none",
    expectedWisdomSignals: ["first five seconds", "promise"],
    requiredContent: [/loom|record|screen/i, /\b(?:1\.|first|start)\b/i],
    forbiddenPatterns: [/what feels hardest/i, /did i hear that right/i],
    minimumExcellenceScore: 8,
    minimumDelightScore: 6.5,
    minimumComparativeScore: 6,
  },
  {
    id: "loom-followup-spark",
    request: "How do I create a Loom video?",
    followUp: "Mine is for showing people how to use Spark Estate.",
    expectedRole: "teacher",
    expectedContextUse: "none",
    expectedWisdomSignals: ["spark estate", "glass", "welcome"],
    requiredContent: [/spark estate|welcome|glass/i],
    forbiddenPatterns: [/what are you trying to create/i],
    minimumExcellenceScore: 7,
    minimumDelightScore: 6,
    minimumComparativeScore: 6,
  },
  {
    id: "booth-personalized",
    request: "How do I best set up my vendor booth for a craft fair?",
    expectedRole: "consultant",
    expectedContextUse: "required_if_present",
    expectedWisdomSignals: ["3", "seconds", "store"],
    requiredContent: [/booth|display|table|sign/i],
    forbiddenPatterns: [/which (?:area|of these)/i, /what type of products/i],
    minimumExcellenceScore: 8,
    minimumDelightScore: 6.5,
    minimumComparativeScore: 6,
  },
  {
    id: "booth-table-followup",
    request: "How do I best set up my vendor booth for a craft fair?",
    followUp: "What should go on the table?",
    expectedRole: "consultant",
    expectedContextUse: "when_available",
    expectedWisdomSignals: ["table", "eye"],
    requiredContent: [/table|eye level|hero/i],
    forbiddenPatterns: [/what are you trying to create/i],
    minimumExcellenceScore: 7,
    minimumDelightScore: 6,
    minimumComparativeScore: 6,
  },
  {
    id: "event-600",
    request: "Should I spend $600 on this craft fair booth?",
    expectedRole: "advisor",
    expectedContextUse: "when_available",
    expectedWisdomSignals: ["break-even", "recommend"],
    requiredContent: [/\$?600|break|worth|recommend|if /i],
    forbiddenPatterns: [/here are (?:some )?pros and cons/i],
    minimumExcellenceScore: 8,
    minimumDelightScore: 6.5,
    minimumComparativeScore: 6,
  },
  {
    id: "facebook-method",
    request: "How do I find Facebook groups for my audience?",
    expectedRole: "teacher",
    expectedContextUse: "when_available",
    expectedWisdomSignals: ["search", "identity"],
    requiredContent: [/facebook|search|group/i],
    forbiddenPatterns: [/which area would you like/i],
    minimumExcellenceScore: 7,
    minimumDelightScore: 6,
    minimumComparativeScore: 6,
  },
  {
    id: "strategic-plan-teach",
    request: "How do I create a strategic plan?",
    expectedRole: "teacher",
    expectedContextUse: "when_available",
    expectedWisdomSignals: ["choices", "priorit"],
    requiredContent: [/strateg|priorit|plan/i],
    forbiddenPatterns: [/opening create/i],
    minimumExcellenceScore: 7,
    minimumDelightScore: 6,
    minimumComparativeScore: 6,
  },
  {
    id: "overwhelm-coach",
    request: "I feel overwhelmed and do not know where to start.",
    expectedRole: "coach",
    expectedContextUse: "when_available",
    expectedWisdomSignals: ["field", "one"],
    requiredContent: [/\?|together|small|one/i],
    forbiddenPatterns: [/^\s*1\.[\s\S]*6\./m],
    minimumExcellenceScore: 7,
    minimumDelightScore: 6.5,
    minimumComparativeScore: 5,
  },
  {
    id: "qr-troubleshoot",
    request: "My QR code will not scan. What should I check?",
    expectedRole: "troubleshooter",
    expectedContextUse: "none",
    expectedWisdomSignals: ["print", "url", "contrast"],
    requiredContent: [/qr|url|print|camera/i],
    forbiddenPatterns: [/which area/i],
    minimumExcellenceScore: 7,
    minimumDelightScore: 6,
    minimumComparativeScore: 6,
  },
];
