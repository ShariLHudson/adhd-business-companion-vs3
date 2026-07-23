/**
 * Build the complete Spark Estate Executive Intelligence Brief detail tree
 * from a FireExecutivePortfolio (+ optional yesterday comparison).
 *
 * Content is bridged/sample-aware — never claims live company-state SPARK→FIRE.
 */

import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";
import type {
  FireActionPlanItem,
  FireBriefSection,
  FireBriefSectionId,
  FireDetailedAlert,
  FireExecutiveBriefDetail,
  FireIntelligenceItem,
  FireIznaAssignment,
} from "@/lib/founder/types/fireBriefDetail";
import {
  FIRE_BRIEF_SECTION_META,
  FIRE_BRIEF_SECTION_ORDER,
} from "@/lib/founder/types/fireBriefDetail";
import { sampleBriefRepository } from "@/lib/founder/repositories";
import { formatFounderLocalDateDisplay, founderLocalDateFromKey } from "./founderLocalDate";

const REPORT_NAME = "Spark Estate Executive Intelligence Brief";

function meta(id: FireBriefSectionId) {
  return FIRE_BRIEF_SECTION_META[id];
}

function sectionBase(
  id: FireBriefSectionId,
  synopsis: string,
  extras: Partial<FireBriefSection> & {
    items?: readonly FireIntelligenceItem[];
  } = {},
): FireBriefSection {
  const m = meta(id);
  const items = extras.items ?? [];
  const alerts = extras.alerts;
  const izna = extras.iznaAssignments;
  const actions = extras.actionPlan;
  const count =
    extras.itemCount ??
    (alerts?.length || izna?.length || actions?.length || items.length);
  return {
    id,
    title: m.title,
    synopsis,
    color: m.color,
    icon: m.icon,
    urgency: extras.urgency,
    itemCount: count,
    items,
    ...(alerts ? { alerts } : {}),
    ...(izna ? { iznaAssignments: izna } : {}),
    ...(actions ? { actionPlan: actions } : {}),
  };
}

function mapAlertLevel(
  priority: FireExecutivePortfolio["alerts"][number]["priorityLevel"],
): FireDetailedAlert["level"] {
  if (priority === "attention") return "needs_attention_today";
  if (priority === "awareness") return "watch_closely";
  return "worth_knowing";
}

function buildDetailedAlerts(
  portfolio: FireExecutivePortfolio,
): FireDetailedAlert[] {
  return portfolio.alerts.map((alert) => {
    const level = mapAlertLevel(alert.priorityLevel);
    return {
      id: alert.id,
      level,
      issue: alert.title,
      impact: alert.explanation,
      recommendation: alert.recommendedAction,
      decisionNeeded: level === "needs_attention_today",
      suggestedTiming:
        level === "needs_attention_today"
          ? "Today"
          : level === "watch_closely"
            ? "This week"
            : "When convenient",
    };
  });
}

function buildActionPlan(
  portfolio: FireExecutivePortfolio,
): FireActionPlanItem[] {
  const items: FireActionPlanItem[] = [];
  portfolio.priorities.forEach((p, index) => {
    items.push({
      id: p.id,
      horizon: index === 0 ? "today" : index === 1 ? "this_week" : "watch",
      title: p.title,
      reason: p.whyItMatters,
      estimatedEffort: p.estimatedImpact,
      nextStep: p.recommendedAction,
      suggestedOwner: index === 0 ? "Shari" : index === 1 ? "Shari / Izna" : "Shari",
      relatedSectionId: "founder_action_plan",
    });
  });
  portfolio.decisions.forEach((d, index) => {
    if (items.some((a) => a.title === d.title)) return;
    items.push({
      id: d.id,
      horizon: index === 0 ? "this_week" : "watch",
      title: d.title,
      reason: d.summary,
      nextStep: "Review and decide when ready.",
      suggestedOwner: "Shari",
      relatedSectionId: "founder_action_plan",
    });
  });
  return items;
}

function buildIznaAssignments(
  portfolio: FireExecutivePortfolio,
): FireIznaAssignment[] {
  const marketingPanel = portfolio.dashboardPanels.find((p) =>
    /marketing/i.test(p.title),
  );
  const topPriority = portfolio.priorities[0];
  return [
    {
      id: `izna-${portfolio.date}-1`,
      title: "Conversation-first marketing handoff",
      businessContext: textOr(
        marketingPanel?.summary,
        portfolio.opportunities.relationship,
      ),
      whyItMatters:
        "Keeps Izna executing warm, estate-true marketing without pulling the founder into draft loops.",
      steps: [
        "Read today's primary focus and the marketing panel summary.",
        "Draft one three-line estate warmth post (conversation-first, no feature tour).",
        "Prepare a Pinterest or Instagram batch outline aligned to that voice.",
        "Flag anything that needs founder approval before publishing.",
      ],
      expectedDeliverables: [
        "One draft post ready for review",
        "Batch outline with suggested schedule",
        "Short note listing approval asks",
      ],
      definitionOfDone:
        "Draft and outline are reviewable in Team Hub without the founder rewriting from scratch.",
      priority: "High",
      timing: "Today",
      returnToFounder:
        "Draft post + batch outline + any questions that block publishing.",
      questionsOrDependencies: topPriority
        ? `Align copy with today's focus: ${topPriority.title}`
        : "Confirm publishing window if unclear.",
    },
    {
      id: `izna-${portfolio.date}-2`,
      title: "Member-signal content listen",
      businessContext: textOr(
        portfolio.opportunities.learning,
        "Member signals inform tone before volume.",
      ),
      whyItMatters:
        "Protects ADHD-friendly calm — content should reduce overwhelm, not add noise.",
      steps: [
        "Skim customer-signal themes from today's brief panels.",
        "Note one phrase members would recognize as Shari's voice.",
        "Propose one content tweak that lowers cognitive load.",
      ],
      expectedDeliverables: [
        "One-paragraph listen note",
        "One proposed tweak",
      ],
      definitionOfDone:
        "Founder can approve or redirect in under two minutes.",
      priority: "Medium",
      timing: "This week",
      returnToFounder: "Listen note + proposed tweak.",
    },
  ];
}

function textOr(value: string | undefined, fallback: string): string {
  const t = value?.trim();
  return t && t.length > 0 ? t : fallback;
}

function memberFacingProvenanceFor(
  provenance: FireExecutiveBriefDetail["contentProvenance"],
): string | null {
  if (provenance === "live_company") return null;
  return "Prepared from the intelligence currently available in your Founder Workspace.";
}

function formatPreparedAtDisplay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function normalizeOverview(
  overview: FireExecutiveBriefDetail["overview"],
  portfolio: FireExecutivePortfolio,
): FireExecutiveBriefDetail["overview"] {
  return {
    topDevelopments: overview.topDevelopments ?? [],
    alertsRequiringAttention: overview.alertsRequiringAttention ?? [],
    topPriority:
      overview.topPriority ??
      portfolio.priorities[0]?.title ??
      portfolio.primaryFocus ??
      null,
    highestOpportunity:
      overview.highestOpportunity ?? portfolio.opportunities.top ?? null,
    productOrDevelopmentRecommendation:
      overview.productOrDevelopmentRecommendation ??
      portfolio.opportunities.product ??
      null,
    topActions: overview.topActions ?? [],
    iznaPriorityAssignment: overview.iznaPriorityAssignment ?? null,
    changedSinceYesterday: overview.changedSinceYesterday ?? [],
    comparisonNote: overview.comparisonNote ?? null,
  };
}

function enrichOverviewFields(
  portfolio: FireExecutivePortfolio,
  detail: FireExecutiveBriefDetail,
): FireExecutiveBriefDetail {
  return {
    ...detail,
    overview: normalizeOverview(detail.overview, portfolio),
  };
}

function item(
  id: string,
  fields: Omit<FireIntelligenceItem, "id">,
): FireIntelligenceItem {
  return { id, ...fields };
}

function changedSinceYesterday(
  today: FireExecutivePortfolio,
  yesterday: FireExecutivePortfolio | null | undefined,
): string[] {
  if (!yesterday) return [];
  const changes: string[] = [];
  if (today.primaryFocus !== yesterday.primaryFocus) {
    changes.push(`Primary focus shifted: ${today.primaryFocus}`);
  }
  const todayTitles = new Set(today.priorities.map((p) => p.title));
  const yTitles = new Set(yesterday.priorities.map((p) => p.title));
  for (const t of todayTitles) {
    if (!yTitles.has(t)) changes.push(`New priority surfaced: ${t}`);
  }
  for (const alert of today.alerts) {
    if (!yesterday.alerts.some((a) => a.title === alert.title)) {
      changes.push(`New alert: ${alert.title}`);
    }
  }
  return changes.slice(0, 5);
}

function trySampleSignals(): {
  weak: FireIntelligenceItem[];
  competitors: FireIntelligenceItem[];
  member: FireIntelligenceItem[];
  adhd: FireIntelligenceItem[];
} {
  const weak: FireIntelligenceItem[] = [];
  const competitors: FireIntelligenceItem[] = [];
  const member: FireIntelligenceItem[] = [];
  const adhd: FireIntelligenceItem[] = [];
  try {
    const brief = sampleBriefRepository.getTodayBrief();
    for (const w of brief.weakSignals ?? []) {
      weak.push(
        item(w.id, {
          title: w.label,
          whatHappened: w.note,
          whyItMatters:
            "Weak signals help Spark Estate notice drift before it becomes urgency.",
          evidenceOrConfidence: "Sample / bridged adapter",
        }),
      );
    }
    for (const c of brief.competitorInsights ?? []) {
      competitors.push(
        item(c.id, {
          title: c.competitor,
          whatHappened: c.summary,
          whyItMatters:
            "Partnership and competitive posture should protect relationship advantage.",
          recommendation:
            "Stay conversation-first; do not chase feature parity theater.",
          evidenceOrConfidence: "Sample / bridged adapter",
        }),
      );
    }
    for (const s of brief.customerSignals ?? []) {
      member.push(
        item(s.id, {
          title: s.label,
          whatHappened: s.detail,
          memberImpact: s.detail,
          whyItMatters:
            "Member impact is the measure — calmer next decisions, not more surfaces.",
          evidenceOrConfidence: s.source,
        }),
      );
    }
    for (const t of brief.trends ?? []) {
      if (/adhd|overwhelm|trust|companion/i.test(`${t.label} ${t.note}`)) {
        adhd.push(
          item(t.id, {
            title: t.label,
            whatHappened: t.note,
            whyItMatters:
              "ADHD entrepreneur community signals should shape pacing and cognitive load.",
            recommendation:
              "Prefer fewer choices, clearer next steps, and warm permission language.",
            evidenceOrConfidence: `Trend direction: ${t.direction}`,
          }),
        );
      }
    }
  } catch {
    /* sample brief unavailable */
  }
  return { weak, competitors, member, adhd };
}

export type BuildExecutiveBriefDetailInput = {
  portfolio: FireExecutivePortfolio;
  yesterdayPortfolio?: FireExecutivePortfolio | null;
};

/**
 * Resolve complete brief detail. Uses stored detail when present and complete;
 * otherwise builds from portfolio + adapters.
 */
export function buildExecutiveBriefDetail(
  input: BuildExecutiveBriefDetailInput,
): FireExecutiveBriefDetail {
  const { portfolio, yesterdayPortfolio } = input;
  if (
    portfolio.executiveBriefDetail &&
    portfolio.executiveBriefDetail.sections.length >=
      FIRE_BRIEF_SECTION_ORDER.length
  ) {
    const existing = portfolio.executiveBriefDetail;
    const changes = yesterdayPortfolio
      ? changedSinceYesterday(portfolio, yesterdayPortfolio)
      : (existing.overview.changedSinceYesterday ?? []);
    return enrichOverviewFields(portfolio, {
      ...existing,
      preparedAt:
        existing.preparedAt ?? portfolio.preparedAt ?? null,
      preparedAtDisplay:
        existing.preparedAtDisplay ??
        formatPreparedAtDisplay(
          existing.preparedAt ?? portfolio.preparedAt ?? null,
        ),
      memberFacingProvenance:
        existing.memberFacingProvenance ??
        memberFacingProvenanceFor(existing.contentProvenance),
      overview: {
        ...normalizeOverview(existing.overview, portfolio),
        changedSinceYesterday: changes,
        comparisonNote:
          changes.length > 0
            ? null
            : (existing.overview.comparisonNote ??
              (yesterdayPortfolio
                ? null
                : "Comparison with the previous report is not yet available.")),
      },
    });
  }

  const alerts = buildDetailedAlerts(portfolio);
  const actionPlan = buildActionPlan(portfolio);
  const izna = buildIznaAssignments(portfolio);
  const sample = trySampleSignals();
  const dateDisplay =
    portfolio.dateDisplay ||
    formatFounderLocalDateDisplay(founderLocalDateFromKey(portfolio.date));

  const summaryItems = portfolio.executiveSummary.map((b) =>
    item(b.id, {
      whatHappened: b.whatChanged,
      whyItMatters: b.whyItMatters,
      recommendation: "Hold the primary focus; choose one next step.",
      owner: "Shari",
      timing: "Today",
      evidenceOrConfidence: "Bridged Founder surfaces",
    }),
  );

  const panelByTitle = (re: RegExp) =>
    portfolio.dashboardPanels.find((p) => re.test(p.title));

  const research = panelByTitle(/research/i);
  const development = panelByTitle(/development/i);
  const marketing = panelByTitle(/marketing/i);
  const momentum = panelByTitle(/momentum|business/i);
  const customer = panelByTitle(/customer/i);

  const sections: FireBriefSection[] = [
    sectionBase("executive_summary", portfolio.primaryFocus, {
      urgency: "action",
      items: summaryItems,
    }),
    sectionBase(
      "ai_technology",
      textOr(
        research?.summary,
        "AI and technology posture for Spark Estate — bridged research panel.",
      ),
      {
        items: [
          item(`${portfolio.id}-ai-1`, {
            title: "Companion intelligence posture",
            whatHappened: textOr(
              research?.summary,
              "Founder bridges continue to surface intelligence without claiming overnight SPARK→FIRE automation.",
            ),
            whyItMatters:
              "Technology choices must reduce founder cognitive load and protect the conversation product.",
            memberImpact:
              "Members feel a calmer, smarter companion — not more AI theater.",
            recommendation:
              "Prefer invisible intelligence improvements over new member-facing tools.",
            implementationDirection:
              "Keep Observation Mode; evolve prompts only after Rule of Three evidence.",
            owner: "Shari / Cursor",
            timing: "This week",
            evidenceOrConfidence: "Bridged adapters",
          }),
        ],
      },
    ),
    sectionBase(
      "adhd_community",
      sample.adhd[0]?.whatHappened ??
        "ADHD entrepreneur community signals emphasize calm pacing and fewer decisions.",
      {
        items:
          sample.adhd.length > 0
            ? sample.adhd
            : [
                item(`${portfolio.id}-adhd-1`, {
                  title: "Cognitive load sensitivity",
                  whatHappened:
                    "Overwhelm on return remains a recurring community theme.",
                  whyItMatters:
                    "Spark Estate succeeds when re-entry feels safe, not like catching up.",
                  memberImpact:
                    "Members need gentle welcome and one clear next step — not unfinished-task guilt.",
                  recommendation:
                    "Keep Welcome and Plan My Day paths short; hide browse-heavy menus behind progressive disclosure.",
                  owner: "Shari",
                  timing: "Ongoing",
                  evidenceOrConfidence: "Sample / bridged community themes",
                }),
              ],
      },
    ),
    sectionBase(
      "business_market",
      textOr(
        momentum?.summary,
        textOr(portfolio.opportunities.revenue, "Market and startup posture."),
      ),
      {
        items: [
          item(`${portfolio.id}-mkt-1`, {
            title: "Market / startup posture",
            whatHappened: textOr(
              momentum?.summary,
              portfolio.opportunities.revenue,
            ),
            whyItMatters:
              "Growth should protect the relationship advantage, not dilute it.",
            recommendation: textOr(
              portfolio.opportunities.top,
              "Protect premium cohort quality over raw funnel volume.",
            ),
            owner: "Shari",
            timing: "This week",
            evidenceOrConfidence: "Bridged opportunities + panels",
          }),
        ],
      },
    ),
    sectionBase(
      "competitors_partnerships",
      sample.competitors[0]?.whatHappened ??
        "Competitive edge remains relationship continuity, not feature count.",
      {
        items:
          sample.competitors.length > 0
            ? sample.competitors
            : [
                item(`${portfolio.id}-comp-1`, {
                  title: "Generic AI apps",
                  whatHappened:
                    "Winning on relationship continuity, not feature count.",
                  whyItMatters:
                    "Partnership and product bets should reinforce companion trust.",
                  recommendation:
                    "Decline feature-parity races; invest in hospitality and memory trust.",
                  evidenceOrConfidence: "Sample adapter",
                }),
              ],
      },
    ),
    sectionBase(
      "weak_signals",
      sample.weak[0]?.whatHappened ??
        "Watch quiet returners and muted sessions before they become churn.",
      {
        urgency: "watch",
        items:
          sample.weak.length > 0
            ? sample.weak
            : [
                item(`${portfolio.id}-weak-1`, {
                  title: "Quiet returners",
                  whatHappened:
                    "Some members open the Estate but do not speak for multiple sessions.",
                  whyItMatters:
                    "Early silence can mean overwhelm — a gentler welcome may restore conversation.",
                  recommendation:
                    "Test a quieter re-entry line before offering workspaces.",
                  timing: "Watch / revisit",
                  evidenceOrConfidence: "Sample / bridged weak signal",
                }),
              ],
      },
    ),
    sectionBase("founder_alerts", "Alerts requiring different levels of attention.", {
      urgency: alerts.some((a) => a.level === "needs_attention_today")
        ? "action"
        : "watch",
      alerts,
      items: [],
      itemCount: alerts.length,
    }),
    sectionBase("product_platform", portfolio.opportunities.product, {
      items: [
        item(`${portfolio.id}-prod-1`, {
          title: "Product / platform recommendation",
          whatHappened: portfolio.opportunities.product,
          whyItMatters:
            "Platform work should make the next founder and member decision easier.",
          recommendation: portfolio.opportunities.product,
          implementationDirection:
            "Ship the smallest durable slice; avoid broad Studio redesign.",
          owner: "Shari / Cursor",
          timing: "This week",
        }),
      ],
    }),
    sectionBase(
      "implementation_plans",
      "Concrete directions that follow from today's recommendations.",
      {
        items: [
          item(`${portfolio.id}-impl-1`, {
            title: "Protect today's primary focus",
            whatHappened: portfolio.primaryFocus,
            recommendation: portfolio.priorities[0]?.recommendedAction,
            implementationDirection:
              "Open Mission Workspace, complete one clear step, then stop.",
            owner: "Shari",
            timing: "Today",
            whyItMatters: portfolio.priorities[0]?.whyItMatters,
          }),
          ...(portfolio.decisions[0]
            ? [
                item(portfolio.decisions[0].id, {
                  title: portfolio.decisions[0].title,
                  whatHappened: portfolio.decisions[0].summary,
                  recommendation: "Decide with calm certainty — not urgency theater.",
                  implementationDirection:
                    "Capture the decision in Founder memory when ready.",
                  owner: "Shari",
                  timing: "This week",
                }),
              ]
            : []),
        ],
      },
    ),
    sectionBase(
      "marketing",
      textOr(marketing?.summary, portfolio.opportunities.relationship),
      {
        items: [
          item(`${portfolio.id}-mktg-1`, {
            title: "Marketing recommendation",
            whatHappened: textOr(
              marketing?.summary,
              portfolio.opportunities.relationship,
            ),
            whyItMatters:
              "Marketing should sound like Spark Estate — warm, calm, never software.",
            recommendation:
              "Keep Izna on conversation-first drafts; founder reviews only approval-needed items.",
            memberImpact:
              "Prospects feel welcomed into a place, not sold a tool.",
            owner: "Izna",
            timing: "Today",
          }),
        ],
      },
    ),
    sectionBase("business_growth", portfolio.opportunities.revenue, {
      items: [
        item(`${portfolio.id}-grow-1`, {
          title: "Business growth recommendation",
          whatHappened: portfolio.opportunities.revenue,
          whyItMatters:
            "Growth that increases cognitive load for members is not growth for Spark Estate.",
          recommendation: portfolio.opportunities.top,
          owner: "Shari",
          timing: "This week",
        }),
      ],
    }),
    sectionBase(
      "member_impact",
      textOr(
        customer?.summary,
        sample.member[0]?.memberImpact ??
          "Member impact remains the north star for every recommendation.",
      ),
      {
        items:
          sample.member.length > 0
            ? sample.member
            : [
                item(`${portfolio.id}-member-1`, {
                  title: "Member impact",
                  whatHappened: textOr(
                    customer?.summary,
                    "Members need calm clarity more than more options.",
                  ),
                  memberImpact:
                    "A successful day leaves the member more capable and less alone.",
                  recommendation:
                    "Measure success by next-decision quality, not engagement streaks.",
                  evidenceOrConfidence: "Bridged customer panel / sample",
                }),
              ],
      },
    ),
    sectionBase(
      "development",
      textOr(
        development?.summary,
        "Development recommendations stay narrow and evidence-led.",
      ),
      {
        items: [
          item(`${portfolio.id}-dev-1`, {
            title: "Development recommendation",
            whatHappened: textOr(
              development?.summary,
              "Keep development focused on reliability and readable founder intelligence surfaces.",
            ),
            whyItMatters:
              "Founder trust depends on surfaces that open and stay readable.",
            recommendation:
              "Prioritize presentation and reliability over new generation engines.",
            implementationDirection:
              "Preserve fire-YYYY-MM-DD daily records; extend optional detail only.",
            owner: "Cursor",
            timing: "Today",
          }),
        ],
      },
    ),
    sectionBase("izna_work_package", izna[0]?.title ?? "Izna daily assignments", {
      urgency: "action",
      iznaAssignments: izna,
      items: [],
      itemCount: izna.length,
    }),
    sectionBase(
      "founder_action_plan",
      "Actions grouped by Today, This Week, and Watch / Revisit.",
      {
        urgency: "action",
        actionPlan,
        items: [],
        itemCount: actionPlan.length,
      },
    ),
    sectionBase(
      "executive_conclusion",
      "Close the brief with calm certainty about what matters most.",
      {
        items: [
          item(`${portfolio.id}-conclusion`, {
            title: "Executive conclusion",
            whatHappened: portfolio.primaryFocus,
            whyItMatters:
              "The founder should leave the brief knowing what needs attention and what can wait.",
            recommendation:
              portfolio.priorities[0]?.recommendedAction ??
              "Choose one next step, then return when ready.",
            implementationDirection:
              "Use Executive View for the next open; expand Full Brief when deeper reading helps.",
            owner: "Shari",
            timing: "Today",
            evidenceOrConfidence:
              portfolio.status === "draft"
                ? "Draft — prepared from currently available Founder Workspace intelligence"
                : portfolio.status,
          }),
        ],
      },
    ),
  ];

  // Ensure order matches canonical list
  const byId = new Map(sections.map((s) => [s.id, s]));
  const ordered = FIRE_BRIEF_SECTION_ORDER.map((id) => {
    const s = byId.get(id);
    if (!s) {
      return sectionBase(id, `${meta(id).title} — awaiting detail.`, {
        items: [],
        itemCount: 0,
      });
    }
    return s;
  });

  const attentionAlerts = alerts.filter(
    (a) => a.level === "needs_attention_today" || a.level === "watch_closely",
  );
  const changes = changedSinceYesterday(portfolio, yesterdayPortfolio);
  const preparedAt = portfolio.preparedAt ?? null;

  return {
    reportName: REPORT_NAME,
    fullDateDisplay: dateDisplay,
    preparedAt,
    preparedAtDisplay: formatPreparedAtDisplay(preparedAt),
    overview: {
      topDevelopments: portfolio.executiveSummary
        .slice(0, 3)
        .map((b) => b.whatChanged),
      alertsRequiringAttention: attentionAlerts.slice(0, 3),
      topPriority:
        portfolio.priorities[0]?.title ?? portfolio.primaryFocus ?? null,
      highestOpportunity: portfolio.opportunities.top || null,
      productOrDevelopmentRecommendation:
        portfolio.opportunities.product ||
        development?.summary ||
        null,
      topActions: actionPlan.filter((a) => a.horizon === "today").slice(0, 3)
        .length > 0
        ? actionPlan.filter((a) => a.horizon === "today").slice(0, 3)
        : actionPlan.slice(0, 3),
      iznaPriorityAssignment: izna[0]
        ? `${izna[0].title} — ${izna[0].timing}`
        : null,
      changedSinceYesterday: changes,
      comparisonNote:
        changes.length > 0
          ? null
          : yesterdayPortfolio
            ? null
            : "Comparison with the previous report is not yet available.",
    },
    sections: ordered,
    contentProvenance: "bridged_adapters",
    memberFacingProvenance: memberFacingProvenanceFor("bridged_adapters"),
  };
}

/** Attach detail onto a portfolio without mutating the original. */
export function withExecutiveBriefDetail(
  portfolio: FireExecutivePortfolio,
  yesterdayPortfolio?: FireExecutivePortfolio | null,
): FireExecutivePortfolio {
  const detail = buildExecutiveBriefDetail({
    portfolio,
    yesterdayPortfolio,
  });
  return { ...portfolio, executiveBriefDetail: detail };
}
