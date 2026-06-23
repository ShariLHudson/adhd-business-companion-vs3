/**
 * Business Intelligence Confidence Layer — evaluates whether Shari has enough
 * grounded context (Business / Audience / Offer profiles) before strategic advice.
 */

import type { BusinessProfile, IdealClientAvatar } from "./companionStore";

export type ProfileCompleteness = {
  score: number;
  filled: number;
  total: number;
  missing: string[];
};

export type BusinessIntelligenceConfidenceLevel = "high" | "medium" | "low";

export type BusinessIntelligencePrimaryGap =
  | "business"
  | "audience"
  | "offer"
  | "freshness"
  | null;

export type BusinessIntelligenceConfidence = {
  businessProfile: ProfileCompleteness;
  audienceProfile: ProfileCompleteness;
  offerProfile: ProfileCompleteness;
  freshnessMonths: number | null;
  isStale: boolean;
  overallScore: number;
  level: BusinessIntelligenceConfidenceLevel;
  primaryGap: BusinessIntelligencePrimaryGap;
};

export type BusinessIntelligenceInput = {
  businessProfile: BusinessProfile | null;
  avatars: IdealClientAvatar[];
  now?: Date;
  /** Profiles older than this are considered stale (default 6 months). */
  staleAfterMonths?: number;
};

const DEFAULT_STALE_MONTHS = 6;

const BUSINESS_FIELDS: { key: keyof BusinessProfile; label: string }[] = [
  { key: "role", label: "your role" },
  { key: "sells", label: "what you sell" },
  { key: "idealClient", label: "who you serve" },
  { key: "tone", label: "preferred voice" },
];

const AVATAR_CORE_FIELDS: (keyof IdealClientAvatar)[] = [
  "who",
  "painPoints",
  "goals",
  "solution",
  "objections",
  "messagingAngle",
];

function fieldFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function scoreFields(
  record: Record<string, unknown>,
  fields: { key: string; label: string }[],
): ProfileCompleteness {
  const missing: string[] = [];
  let filled = 0;
  for (const field of fields) {
    if (fieldFilled(record[field.key])) {
      filled += 1;
    } else {
      missing.push(field.label);
    }
  }
  const total = fields.length;
  const score = total ? Math.round((filled / total) * 100) : 0;
  return { score, filled, total, missing };
}

function scoreBusinessProfile(profile: BusinessProfile | null): ProfileCompleteness {
  if (!profile) {
    return {
      score: 0,
      filled: 0,
      total: BUSINESS_FIELDS.length + 1,
      missing: [...BUSINESS_FIELDS.map((f) => f.label), "business goals"],
    };
  }
  const base = scoreFields(profile as unknown as Record<string, unknown>, BUSINESS_FIELDS);
  const hasGoals = profile.goals?.length > 0;
  const total = base.total + 1;
  const filled = base.filled + (hasGoals ? 1 : 0);
  const missing = [...base.missing];
  if (!hasGoals) missing.push("business goals");
  return {
    score: Math.round((filled / total) * 100),
    filled,
    total,
    missing,
  };
}

function pickBestAvatar(avatars: IdealClientAvatar[]): IdealClientAvatar | null {
  if (!avatars.length) return null;
  const primary = avatars.find((a) => a.isPrimary);
  if (primary) return primary;
  const ranked = [...avatars].sort((a, b) => {
    const aScore = AVATAR_CORE_FIELDS.filter((k) => fieldFilled(a[k])).length;
    const bScore = AVATAR_CORE_FIELDS.filter((k) => fieldFilled(b[k])).length;
    return bScore - aScore;
  });
  return ranked[0] ?? null;
}

function scoreAudienceProfile(avatars: IdealClientAvatar[]): ProfileCompleteness {
  const avatar = pickBestAvatar(avatars);
  if (!avatar) {
    return {
      score: 0,
      filled: 0,
      total: AVATAR_CORE_FIELDS.length,
      missing: ["audience profile"],
    };
  }
  const missing: string[] = [];
  let filled = 0;
  for (const key of AVATAR_CORE_FIELDS) {
    if (fieldFilled(avatar[key])) filled += 1;
    else missing.push(String(key));
  }
  const total = AVATAR_CORE_FIELDS.length;
  return {
    score: Math.round((filled / total) * 100),
    filled,
    total,
    missing,
  };
}

function scoreOfferProfile(profile: BusinessProfile | null): ProfileCompleteness {
  if (!profile?.sells?.trim()) {
    return {
      score: 0,
      filled: 0,
      total: 2,
      missing: ["what you sell", "offer clarity"],
    };
  }
  const hasGoals = (profile.goals?.length ?? 0) > 0;
  return {
    score: hasGoals ? 100 : 60,
    filled: hasGoals ? 2 : 1,
    total: 2,
    missing: hasGoals ? [] : ["how this offer fits your goals"],
  };
}

function monthsBetween(iso: string, now: Date): number {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 999;
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
}

function latestProfileTouch(
  profile: BusinessProfile | null,
  avatars: IdealClientAvatar[],
): string | null {
  const stamps = [
    profile?.updatedAt,
    ...avatars.map((a) => a.updatedAt),
  ].filter((v): v is string => Boolean(v?.trim()));
  if (!stamps.length) return null;
  return stamps.sort().at(-1) ?? null;
}

function resolvePrimaryGap(input: {
  business: ProfileCompleteness;
  audience: ProfileCompleteness;
  offer: ProfileCompleteness;
  isStale: boolean;
  hasAnyProfile: boolean;
}): BusinessIntelligencePrimaryGap {
  if (!input.hasAnyProfile || input.business.score < 45) return "business";
  if (input.offer.score < 50) return "offer";
  if (input.audience.score < 50) return "audience";
  if (input.isStale) return "freshness";
  return null;
}

export function evaluateBusinessIntelligenceConfidence(
  input: BusinessIntelligenceInput,
): BusinessIntelligenceConfidence {
  const now = input.now ?? new Date();
  const staleMonths = input.staleAfterMonths ?? DEFAULT_STALE_MONTHS;

  const businessProfile = scoreBusinessProfile(input.businessProfile);
  const audienceProfile = scoreAudienceProfile(input.avatars);
  const offerProfile = scoreOfferProfile(input.businessProfile);

  const latest = latestProfileTouch(input.businessProfile, input.avatars);
  const freshnessMonths = latest ? monthsBetween(latest, now) : null;
  const isStale =
    freshnessMonths !== null && freshnessMonths >= staleMonths;

  const overallScore = Math.round(
    businessProfile.score * 0.35 +
      audienceProfile.score * 0.3 +
      offerProfile.score * 0.2 +
      (isStale ? 0 : 100) * 0.15,
  );

  const hasAnyProfile = Boolean(
    input.businessProfile &&
      (input.businessProfile.role ||
        input.businessProfile.sells ||
        input.businessProfile.idealClient),
  );

  const primaryGap = resolvePrimaryGap({
    business: businessProfile,
    audience: audienceProfile,
    offer: offerProfile,
    isStale,
    hasAnyProfile,
  });

  let level: BusinessIntelligenceConfidenceLevel;
  if (overallScore >= 72 && !isStale && businessProfile.score >= 55) {
    level = "high";
  } else if (overallScore >= 48 && businessProfile.score >= 35) {
    level = "medium";
  } else {
    level = "low";
  }

  if (isStale && overallScore < 80) {
    level = level === "high" ? "medium" : "low";
  }

  return {
    businessProfile,
    audienceProfile,
    offerProfile,
    freshnessMonths,
    isStale,
    overallScore,
    level,
    primaryGap,
  };
}

export function businessIntelligenceConfidenceHintForChat(
  confidence: BusinessIntelligenceConfidence,
): string | null {
  if (confidence.level === "high") {
    return (
      "BUSINESS INTELLIGENCE (HIGH CONFIDENCE): Business, audience, and offer context are on file. " +
      "Ground recommendations in their saved profiles — be specific, not generic."
    );
  }
  if (confidence.level === "medium") {
    const gaps = [
      confidence.businessProfile.missing[0],
      confidence.audienceProfile.missing[0],
      confidence.offerProfile.missing[0],
    ].filter(Boolean);
    return (
      "BUSINESS INTELLIGENCE (PARTIAL CONTEXT): Some profile gaps remain" +
      (gaps.length ? ` (${gaps.slice(0, 2).join(", ")})` : "") +
      ". Give useful guidance but note assumptions briefly and invite profile updates when it would sharpen advice."
    );
  }
  return null;
}
