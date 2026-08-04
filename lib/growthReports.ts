/**
 * Growth Reports — assemble wins, evidence, highlights, journey, and reflections
 * into printable HTML reports.
 */

import type { GrowthAttachment } from "./growthAttachments";
import { getSavedGrowthWins, type SavedGrowthWin } from "./growthWinsStore";
import { getEvidenceEntries, type EvidenceEntry } from "./evidenceBankStore";
import {
  getConfidenceEntries,
  type ConfidenceEntry,
} from "./confidenceVaultStore";
import { getJourneyEntries, type JourneyEntry } from "./myJourneyStore";
import {
  getAllReflectionEntries,
  type GrowthReflectionEntry,
} from "./growthReflection";
import { getBusinessProfile, getPrefs, getProjects, type Project } from "./companionStore";
import {
  formatMetricProgressLabel,
  formatOutcomeProgressLabel,
  getActiveGoalMetrics,
  getGoalMetrics,
  goalHealthStatus,
  goalProgressPercent,
  listCompletedOutcomeGoals,
  listOutcomeGoals,
  metricProgressPercent,
  OUTCOME_COMPLETION_RULE_LABELS,
  OUTCOME_GOAL_HEALTH_LABELS,
  progressInDateRange,
  type OutcomeGoal,
  type OutcomeGoalHealthStatus,
} from "./goals/outcomeGoals";
import {
  evidenceSupportsGoal,
  growthItemSupportsGoal,
  projectSupportsGoal,
  winSupportsGoal,
} from "./goals/goalLinking";
import {
  decisionSupportsGoal,
  lessonSupportsGoal,
  planCompletionsForGoalInRange,
} from "./goals/goalIntelligence";
import { getPlanCompletionHistory } from "./planMyDay/planTaskCompletion";
import type { PlanTaskCompletionRecord } from "./planMyDay/planTaskCompletion";

export { growthItemSupportsGoal };

export type GrowthReportType =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "custom";

export type GrowthReportStyle =
  | "summary"
  | "detailed"
  | "storybook"
  | "visual";

export type GrowthReportIncludes = {
  goals: boolean;
  wins: boolean;
  evidence: boolean;
  highlights: boolean;
  journey: boolean;
  photos: boolean;
  files: boolean;
  testimonials: boolean;
  certifications: boolean;
  reflections: boolean;
};

export type GrowthReportGoalSummary = {
  activeGoals: number;
  onTrack: number;
  needsAttention: number;
  stalled: number;
  completedThisPeriod: number;
  progressThisPeriod: number;
};

export type GrowthReportGoalEntry = {
  goal: OutcomeGoal;
  percent: number;
  status: OutcomeGoalHealthStatus;
  progressSinceLastReport: number;
  linkedWins: SavedGrowthWin[];
  linkedEvidence: EvidenceEntry[];
  linkedDecisions: JourneyEntry[];
  linkedLessons: JourneyEntry[];
  linkedProjects: Project[];
  linkedTasks: PlanTaskCompletionRecord[];
};

export type GrowthReportDateRange = {
  from: Date;
  to: Date;
  label: string;
};

export type GrowthReportPhoto = {
  name: string;
  url: string;
  source: string;
};

export type GrowthReportFile = {
  name: string;
  kind: string;
  source: string;
};

export type GrowthReportContent = {
  recipientName: string;
  reportType: GrowthReportType;
  reportStyle: GrowthReportStyle;
  dateRange: GrowthReportDateRange;
  includes: GrowthReportIncludes;
  goalSummary: GrowthReportGoalSummary;
  goals: GrowthReportGoalEntry[];
  stalledGoals: GrowthReportGoalEntry[];
  wins: SavedGrowthWin[];
  evidence: EvidenceEntry[];
  highlights: ConfidenceEntry[];
  journey: JourneyEntry[];
  testimonials: ConfidenceEntry[];
  certifications: ConfidenceEntry[];
  reflections: GrowthReflectionEntry[];
  photos: GrowthReportPhoto[];
  files: GrowthReportFile[];
  generatedAt: string;
};

const REPORT_TYPE_LABELS: Record<GrowthReportType, string> = {
  weekly: "Weekly Growth Report",
  monthly: "Monthly Growth Report",
  quarterly: "Quarterly Growth Report",
  annual: "Annual Growth Report",
  custom: "Custom Growth Report",
};

const STYLE_LABELS: Record<GrowthReportStyle, string> = {
  summary: "Summary Report",
  detailed: "Detailed Report",
  storybook: "Storybook Report",
  visual: "Visual Report",
};

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatRangeLabel(from: Date, to: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${from.toLocaleDateString(undefined, opts)} – ${to.toLocaleDateString(undefined, opts)}`;
}

export function resolveReportDateRange(
  type: GrowthReportType,
  customFrom?: string,
  customTo?: string,
  now = new Date(),
): GrowthReportDateRange {
  const end = endOfDay(now);

  if (type === "custom") {
    const from = customFrom
      ? new Date(`${customFrom}T00:00:00`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : end;
    return {
      from,
      to: to.getTime() < from.getTime() ? endOfDay(from) : to,
      label: formatRangeLabel(from, to.getTime() < from.getTime() ? from : to),
    };
  }

  if (type === "weekly") {
    const from = startOfWeekMonday(now);
    return { from, to: end, label: formatRangeLabel(from, end) };
  }

  if (type === "monthly") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: end, label: formatRangeLabel(from, end) };
  }

  if (type === "quarterly") {
    const q = Math.floor(now.getMonth() / 3);
    const from = new Date(now.getFullYear(), q * 3, 1);
    return { from, to: end, label: formatRangeLabel(from, end) };
  }

  const from = new Date(now.getFullYear(), 0, 1);
  return { from, to: end, label: formatRangeLabel(from, end) };
}

export function defaultIncludesForType(
  type: GrowthReportType,
): GrowthReportIncludes {
  switch (type) {
    case "weekly":
      return {
        goals: true,
        wins: true,
        evidence: true,
        highlights: true,
        journey: true,
        photos: false,
        files: false,
        testimonials: false,
        certifications: false,
        reflections: false,
      };
    case "monthly":
      return {
        goals: true,
        wins: true,
        evidence: true,
        highlights: true,
        journey: true,
        photos: true,
        files: false,
        testimonials: false,
        certifications: false,
        reflections: true,
      };
    case "quarterly":
      return {
        goals: true,
        wins: true,
        evidence: true,
        highlights: true,
        journey: true,
        photos: true,
        files: true,
        testimonials: true,
        certifications: false,
        reflections: true,
      };
    case "annual":
      return {
        goals: true,
        wins: true,
        evidence: true,
        highlights: true,
        journey: true,
        photos: true,
        files: true,
        testimonials: true,
        certifications: true,
        reflections: true,
      };
    default:
      return {
        goals: true,
        wins: true,
        evidence: true,
        highlights: true,
        journey: true,
        photos: true,
        files: true,
        testimonials: true,
        certifications: true,
        reflections: true,
      };
  }
}

function isInRange(iso: string, range: GrowthReportDateRange): boolean {
  const t = new Date(iso).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

function reflectionInRange(
  entry: GrowthReflectionEntry,
  range: GrowthReportDateRange,
): boolean {
  const weekStart = new Date(`${entry.weekKey}T00:00:00`);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return (
    weekStart.getTime() <= range.to.getTime() &&
    weekEnd.getTime() >= range.from.getTime() &&
    entry.answer.trim().length > 0
  );
}

function entryDate(entry: { date?: string; createdAt: string }): string {
  return entry.date?.trim() ? entry.date : entry.createdAt;
}

function collectAttachments(
  attachments: GrowthAttachment[],
  source: string,
): { photos: GrowthReportPhoto[]; files: GrowthReportFile[] } {
  const photos: GrowthReportPhoto[] = [];
  const files: GrowthReportFile[] = [];
  for (const att of attachments) {
    if (att.kind === "image") {
      photos.push({ name: att.name, url: att.url, source });
    } else if (att.kind === "file" || att.kind === "pdf") {
      files.push({ name: att.name, kind: att.kind, source });
    }
  }
  return { photos, files };
}

export function getReportRecipientName(): string {
  const prefsName = getPrefs().name?.trim();
  if (prefsName) return prefsName;
  const profile = getBusinessProfile();
  if (profile?.role?.trim()) return profile.role.trim();
  return "Your Growth Report";
}

function buildGoalReportEntries(
  activeGoals: OutcomeGoal[],
  wins: SavedGrowthWin[],
  evidence: EvidenceEntry[],
  journey: JourneyEntry[],
  projects: Project[],
  dateRange: GrowthReportDateRange,
  planCompletions: PlanTaskCompletionRecord[] = getPlanCompletionHistory(),
): { goals: GrowthReportGoalEntry[]; stalledGoals: GrowthReportGoalEntry[] } {
  const goals: GrowthReportGoalEntry[] = activeGoals.map((goal) => ({
    goal,
    percent: goalProgressPercent(goal),
    status: goalHealthStatus(goal),
    progressSinceLastReport: progressInDateRange(
      goal,
      dateRange.from,
      dateRange.to,
    ),
    linkedWins: wins.filter((w) => winSupportsGoal(w, goal)),
    linkedEvidence: evidence.filter((e) => evidenceSupportsGoal(e, goal)),
    linkedDecisions: journey.filter((j) => decisionSupportsGoal(j, goal)),
    linkedLessons: journey.filter((j) => lessonSupportsGoal(j, goal)),
    linkedProjects: projects.filter((p) => projectSupportsGoal(p, goal)),
    linkedTasks: planCompletionsForGoalInRange(
      goal,
      dateRange.from,
      dateRange.to,
      planCompletions,
    ),
  }));
  return {
    goals,
    stalledGoals: goals.filter((g) => g.status === "stalled"),
  };
}

function buildGoalSummary(
  activeGoals: OutcomeGoal[],
  completedInPeriod: OutcomeGoal[],
  dateRange: GrowthReportDateRange,
): GrowthReportGoalSummary {
  const statuses = activeGoals.map((g) => goalHealthStatus(g));
  const progressThisPeriod = activeGoals.reduce(
    (sum, g) => sum + progressInDateRange(g, dateRange.from, dateRange.to),
    0,
  );
  return {
    activeGoals: activeGoals.length,
    onTrack: statuses.filter((s) => s === "on_track").length,
    needsAttention: statuses.filter((s) => s === "needs_attention").length,
    stalled: statuses.filter((s) => s === "stalled").length,
    completedThisPeriod: completedInPeriod.length,
    progressThisPeriod,
  };
}

export function buildGrowthReportContent(input: {
  reportType: GrowthReportType;
  reportStyle: GrowthReportStyle;
  includes: GrowthReportIncludes;
  customFrom?: string;
  customTo?: string;
  now?: Date;
}): GrowthReportContent {
  const dateRange = resolveReportDateRange(
    input.reportType,
    input.customFrom,
    input.customTo,
    input.now,
  );
  const { includes } = input;

  const wins = includes.wins
    ? getSavedGrowthWins().filter((w) => isInRange(w.ts, dateRange))
    : [];

  const evidence = includes.evidence
    ? getEvidenceEntries().filter((e) => isInRange(e.createdAt, dateRange))
    : [];

  const allHighlights = getConfidenceEntries();
  const highlights = includes.highlights
    ? allHighlights.filter((e) => isInRange(entryDate(e), dateRange))
    : [];

  const testimonials = includes.testimonials
    ? allHighlights.filter(
        (e) =>
          e.category === "Testimonials" &&
          isInRange(entryDate(e), dateRange),
      )
    : [];

  const certifications = includes.certifications
    ? allHighlights.filter(
        (e) =>
          (e.category === "Certifications" || e.category === "Credentials") &&
          isInRange(entryDate(e), dateRange),
      )
    : [];

  const journey = includes.journey
    ? getJourneyEntries().filter((e) => isInRange(entryDate(e), dateRange))
    : [];

  const reflections = includes.reflections
    ? getAllReflectionEntries().filter((e) =>
        reflectionInRange(e, dateRange),
      )
    : [];

  const activeGoals = includes.goals ? listOutcomeGoals() : [];
  const completedInPeriod = includes.goals
    ? listCompletedOutcomeGoals().filter((g) =>
        g.completedAt ? isInRange(g.completedAt, dateRange) : false,
      )
    : [];
  const goalSummary = includes.goals
    ? buildGoalSummary(activeGoals, completedInPeriod, dateRange)
    : {
        activeGoals: 0,
        onTrack: 0,
        needsAttention: 0,
        stalled: 0,
        completedThisPeriod: 0,
        progressThisPeriod: 0,
      };
  const { goals: goalEntries, stalledGoals } = includes.goals
    ? buildGoalReportEntries(
        activeGoals,
        wins,
        evidence,
        journey,
        getProjects(),
        dateRange,
      )
    : { goals: [], stalledGoals: [] };

  const photos: GrowthReportPhoto[] = [];
  const files: GrowthReportFile[] = [];

  if (includes.photos || includes.files) {
    const sources: { label: string; attachments: GrowthAttachment[] }[] = [];
    if (includes.wins) {
      for (const w of wins) {
        sources.push({ label: "Win", attachments: w.attachments });
      }
    }
    if (includes.evidence) {
      for (const e of evidence) {
        sources.push({ label: "Evidence", attachments: e.attachments });
      }
    }
    if (includes.highlights) {
      for (const h of highlights) {
        sources.push({ label: "My Highlights", attachments: h.attachments });
      }
    }
    if (includes.journey) {
      for (const j of journey) {
        sources.push({ label: "My Journey", attachments: j.attachments });
      }
    }
    for (const { label, attachments } of sources) {
      const collected = collectAttachments(attachments, label);
      if (includes.photos) photos.push(...collected.photos);
      if (includes.files) files.push(...collected.files);
    }
  }

  return {
    recipientName: getReportRecipientName(),
    reportType: input.reportType,
    reportStyle: input.reportStyle,
    dateRange,
    includes,
    goalSummary,
    goals: goalEntries,
    stalledGoals,
    wins,
    evidence,
    highlights,
    journey,
    testimonials,
    certifications,
    reflections,
    photos,
    files,
    generatedAt: new Date().toISOString(),
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatGoalMetricsBlock(
  goal: OutcomeGoal,
  detailed: boolean,
  dateRange?: GrowthReportDateRange,
): string {
  const metrics = getActiveGoalMetrics(goal);
  if (metrics.length === 0) return "";
  const items = metrics
    .map((m) => {
      const pct = metricProgressPercent(m);
      const label = formatMetricProgressLabel(m);
      const primary = m.isPrimary ? " (primary)" : "";
      const delta =
        dateRange && detailed
          ? progressInDateRange(goal, dateRange.from, dateRange.to, m.id)
          : 0;
      const deltaNote =
        delta !== 0
          ? ` · ${delta > 0 ? "+" : ""}${m.metricKind === "revenue" ? `$${delta}` : delta} since last report`
          : "";
      if (!detailed) {
        return `<li>${escapeHtml(m.label)}${primary}: ${escapeHtml(label)} — ${pct}%</li>`;
      }
      return `<p><strong>${escapeHtml(m.label)}</strong>${primary}: ${escapeHtml(label)} — ${pct}%${escapeHtml(deltaNote)}</p>`;
    })
    .join("");
  const rule = goal.completionRule ?? "primary_metric";
  const ruleLabel = OUTCOME_COMPLETION_RULE_LABELS[rule];
  const custom =
    rule === "custom" && goal.customCompletionRule
      ? ` — ${escapeHtml(goal.customCompletionRule)}`
      : "";
  const heading = `<p class="meta"><strong>Multi-Metric Goal Tracking™</strong> · Complete when: ${escapeHtml(ruleLabel)}${custom}</p>`;
  return `${heading}${detailed ? items : `<ul>${items}</ul>`}`;
}

function formatGoalEntry(
  entry: GrowthReportGoalEntry,
  detailed: boolean,
  dateRange: GrowthReportDateRange,
): string {
  const { goal, percent, status, progressSinceLastReport } = entry;
  const label = formatOutcomeProgressLabel(goal);
  const due = goal.deadline;
  const statusLabel = OUTCOME_GOAL_HEALTH_LABELS[status];
  const metricsBlock = formatGoalMetricsBlock(goal, detailed, dateRange);
  if (!detailed) {
    const progressNote =
      progressSinceLastReport !== 0
        ? ` · +${progressSinceLastReport} this period`
        : "";
    return `<li><strong>${escapeHtml(goal.statement)}</strong> — ${escapeHtml(label)} (${percent}%) · ${escapeHtml(statusLabel)} · due ${escapeHtml(due)}${progressNote}${metricsBlock}</li>`;
  }
  const linked: string[] = [];
  if (entry.linkedWins.length) {
    linked.push(
      `<p><strong>Supporting wins:</strong> ${entry.linkedWins.map((w) => escapeHtml(w.whatHappened)).join("; ")}</p>`,
    );
  }
  if (entry.linkedEvidence.length) {
    linked.push(
      `<p><strong>Supporting evidence:</strong> ${entry.linkedEvidence.map((e) => escapeHtml(e.whatHappened)).join("; ")}</p>`,
    );
  }
  if (entry.linkedDecisions.length) {
    linked.push(
      `<p><strong>Supporting decisions:</strong> ${entry.linkedDecisions.map((j) => escapeHtml(j.title)).join("; ")}</p>`,
    );
  }
  if (entry.linkedLessons.length) {
    linked.push(
      `<p><strong>Supporting lessons:</strong> ${entry.linkedLessons.map((j) => escapeHtml(j.title)).join("; ")}</p>`,
    );
  }
  if (entry.linkedProjects.length) {
    linked.push(
      `<p><strong>Supporting projects:</strong> ${entry.linkedProjects.map((p) => escapeHtml(p.name)).join("; ")}</p>`,
    );
  }
  if (entry.linkedTasks.length) {
    linked.push(
      `<p><strong>Supporting tasks (completed this period):</strong> ${entry.linkedTasks.map((t) => escapeHtml(t.taskName)).join("; ")}</p>`,
    );
  }
  return `<article class="entry"><h3>${escapeHtml(goal.statement)}</h3><p class="meta">${escapeHtml(label)} · ${percent}% · ${escapeHtml(statusLabel)} · due ${escapeHtml(due)}${progressSinceLastReport ? ` · +${progressSinceLastReport} this period` : ""}</p>${metricsBlock}${linked.join("")}</article>`;
}

function formatGoalSummaryBlock(summary: GrowthReportGoalSummary): string {
  return `<div class="goal-summary"><p><strong>Active goals:</strong> ${summary.activeGoals} · <strong>On track:</strong> ${summary.onTrack} · <strong>Needs attention:</strong> ${summary.needsAttention} · <strong>Stalled:</strong> ${summary.stalled} · <strong>Completed this period:</strong> ${summary.completedThisPeriod} · <strong>Progress logged:</strong> ${summary.progressThisPeriod}</p></div>`;
}

function sectionHeading(title: string, count: number): string {
  return `<h2>${escapeHtml(title)} <span class="count">(${count})</span></h2>`;
}

function formatWin(win: SavedGrowthWin, detailed: boolean): string {
  const date = new Date(win.ts).toLocaleDateString();
  if (!detailed) {
    return `<li><strong>${date}</strong> — ${escapeHtml(win.whatHappened)}</li>`;
  }
  return `<article class="entry"><h3>${escapeHtml(win.whatHappened)}</h3><p class="meta">${date}</p></article>`;
}

function formatEvidence(entry: EvidenceEntry, detailed: boolean): string {
  const date = new Date(entry.createdAt).toLocaleDateString();
  if (!detailed) {
    const note =
      entry.whyItMattered.trim() ||
      entry.whatImproved.trim() ||
      entry.whatProblemSolved.trim();
    const suffix = note ? ` — ${escapeHtml(note)}` : "";
    return `<li><strong>${date}</strong> [${escapeHtml(entry.category)}] — ${escapeHtml(entry.whatHappened)}${suffix}</li>`;
  }
  const parts = [
    `<article class="entry"><h3>${escapeHtml(entry.whatHappened)}</h3>`,
    `<p class="meta">${date} · ${escapeHtml(entry.category)}</p>`,
  ];
  const fields: [string, string][] = [
    ["What improved", entry.whatImproved],
    ["What moved forward", entry.whatMovedForward],
    ["Problem solved", entry.whatProblemSolved],
    ["Who benefited", entry.whoBenefited],
    ["Why it mattered", entry.whyItMattered],
    ["What this proves", entry.whatThisProves],
  ];
  for (const [label, value] of fields) {
    if (value.trim()) {
      parts.push(`<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`);
    }
  }
  parts.push("</article>");
  return parts.join("");
}

function formatHighlight(entry: ConfidenceEntry, detailed: boolean): string {
  const date = (entry.date || entry.createdAt).slice(0, 10);
  if (!detailed) {
    return `<li><strong>${date}</strong> [${escapeHtml(entry.category)}] — ${escapeHtml(entry.title)}</li>`;
  }
  const parts = [
    `<article class="entry"><h3>${escapeHtml(entry.title)}</h3>`,
    `<p class="meta">${date} · ${escapeHtml(entry.category)} · ${escapeHtml(entry.source)}</p>`,
  ];
  if (entry.description.trim()) {
    parts.push(`<p>${escapeHtml(entry.description)}</p>`);
  }
  parts.push("</article>");
  return parts.join("");
}

function formatJourney(entry: JourneyEntry, detailed: boolean): string {
  const date = (entry.date || entry.createdAt).slice(0, 10);
  if (!detailed) {
    const note = entry.whatDidILearn.trim() || entry.whatHappened.trim();
    return `<li><strong>${date}</strong> [${escapeHtml(entry.chapter || entry.category)}] — ${escapeHtml(entry.title)}${note ? ` — ${escapeHtml(note)}` : ""}</li>`;
  }
  const parts = [
    `<article class="entry"><h3>${escapeHtml(entry.title)}</h3>`,
    `<p class="meta">${date} · ${escapeHtml(entry.category)}${entry.chapter ? ` · ${escapeHtml(entry.chapter)}` : ""}</p>`,
  ];
  const fields: [string, string][] = [
    ["What happened", entry.whatHappened],
    ["What I learned", entry.whatDidILearn],
    ["How this shaped me", entry.howDidThisShapeMe],
    ["Wisdom", entry.whatWisdom],
  ];
  for (const [label, value] of fields) {
    if (value.trim()) {
      parts.push(`<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`);
    }
  }
  parts.push("</article>");
  return parts.join("");
}

function formatReflection(entry: GrowthReflectionEntry, detailed: boolean): string {
  const week = new Date(`${entry.weekKey}T00:00:00`).toLocaleDateString();
  if (!detailed) {
    return `<li><strong>Week of ${week}</strong> — ${escapeHtml(entry.question)} ${escapeHtml(entry.answer)}</li>`;
  }
  return `<article class="entry"><h3>${escapeHtml(entry.question)}</h3><p class="meta">Week of ${week}</p><p>${escapeHtml(entry.answer)}</p></article>`;
}

function formatPhotos(photos: GrowthReportPhoto[]): string {
  if (!photos.length) return "";
  const items = photos
    .map(
      (p) =>
        `<figure class="photo"><img src="${p.url}" alt="${escapeHtml(p.name)}" /><figcaption>${escapeHtml(p.name)} <span class="meta">(${escapeHtml(p.source)})</span></figcaption></figure>`,
    )
    .join("");
  return `${sectionHeading("Photos", photos.length)}<div class="photo-grid">${items}</div>`;
}

function formatFiles(files: GrowthReportFile[]): string {
  if (!files.length) return "";
  const items = files
    .map(
      (f) =>
        `<li>${escapeHtml(f.name)} <span class="meta">(${escapeHtml(f.kind)} · ${escapeHtml(f.source)})</span></li>`,
    )
    .join("");
  return `${sectionHeading("Files", files.length)}<ul>${items}</ul>`;
}

export function formatGrowthReportHtml(content: GrowthReportContent): string {
  const detailed = content.reportStyle === "detailed";
  const narrative =
    content.reportStyle === "storybook" || content.reportStyle === "visual";
  const typeLabel = REPORT_TYPE_LABELS[content.reportType];
  const styleLabel = STYLE_LABELS[content.reportStyle];

  const sections: string[] = [];

  if (narrative) {
    sections.push(
      `<p class="notice">📖 ${escapeHtml(styleLabel)} — rich visual styling is coming soon. This Phase 1 report includes your full narrative content in a readable format.</p>`,
    );
  }

  const stats = [
    content.includes.goals ? `${content.goalSummary.activeGoals} goals` : null,
    content.includes.wins ? `${content.wins.length} wins` : null,
    content.includes.evidence ? `${content.evidence.length} evidence` : null,
    content.includes.highlights ? `${content.highlights.length} highlights` : null,
    content.includes.journey ? `${content.journey.length} journey` : null,
    content.includes.reflections ? `${content.reflections.length} reflections` : null,
  ].filter(Boolean);

  if (stats.length) {
    sections.push(`<p class="stats">${stats.join(" · ")}</p>`);
  }

  const wrapList = (items: string) =>
    detailed || narrative ? items : `<ul>${items}</ul>`;

  if (content.includes.goals) {
    sections.push(formatGoalSummaryBlock(content.goalSummary));
    if (content.goals.length) {
      sections.push(
        sectionHeading("Outcome Goals", content.goals.length) +
          wrapList(
            content.goals
              .map((g) =>
                formatGoalEntry(g, detailed || narrative, content.dateRange),
              )
              .join(""),
          ),
      );
    }
    if (content.stalledGoals.length) {
      sections.push(
        sectionHeading("Stalled Goals", content.stalledGoals.length) +
          wrapList(
            content.stalledGoals
              .map((g) =>
                formatGoalEntry(g, detailed || narrative, content.dateRange),
              )
              .join(""),
          ),
      );
    }
  }

  if (content.includes.wins && content.wins.length) {
    sections.push(
      sectionHeading("Wins", content.wins.length) +
        wrapList(content.wins.map((w) => formatWin(w, detailed || narrative)).join("")),
    );
  }

  if (content.includes.evidence && content.evidence.length) {
    sections.push(
      sectionHeading("Evidence", content.evidence.length) +
        wrapList(
          content.evidence.map((e) => formatEvidence(e, detailed || narrative)).join(""),
        ),
    );
  }

  if (content.includes.highlights && content.highlights.length) {
    sections.push(
      sectionHeading("My Highlights", content.highlights.length) +
        wrapList(
          content.highlights.map((h) => formatHighlight(h, detailed || narrative)).join(""),
        ),
    );
  }

  if (content.includes.testimonials && content.testimonials.length) {
    sections.push(
      sectionHeading("Testimonials", content.testimonials.length) +
        wrapList(
          content.testimonials
            .map((t) => formatHighlight(t, detailed || narrative))
            .join(""),
        ),
    );
  }

  if (content.includes.certifications && content.certifications.length) {
    sections.push(
      sectionHeading("Certifications & Credentials", content.certifications.length) +
        wrapList(
          content.certifications
            .map((c) => formatHighlight(c, detailed || narrative))
            .join(""),
        ),
    );
  }

  if (content.includes.journey && content.journey.length) {
    sections.push(
      sectionHeading("My Journey", content.journey.length) +
        wrapList(
          content.journey.map((j) => formatJourney(j, detailed || narrative)).join(""),
        ),
    );
  }

  if (content.includes.reflections && content.reflections.length) {
    sections.push(
      sectionHeading("Reflections", content.reflections.length) +
        wrapList(
          content.reflections
            .map((r) => formatReflection(r, detailed || narrative))
            .join(""),
        ),
    );
  }

  if (content.includes.photos) {
    sections.push(formatPhotos(content.photos));
  }

  if (content.includes.files) {
    sections.push(formatFiles(content.files));
  }

  const emptyNote =
  sections.length === 0 || (sections.length === 1 && narrative)
    ? `<p class="empty">No growth items matched this date range and selection. Try widening the range or including more sections.</p>`
    : "";

  const title =
    content.recipientName === "Your Growth Report"
      ? content.recipientName
      : `${content.recipientName}'s Growth Report`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #2f261f;
      background: #faf7f2;
      margin: 0;
      padding: 32px 40px;
      line-height: 1.55;
    }
    header {
      border-bottom: 2px solid #e7d9c8;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    h1 { font-size: 1.75rem; margin: 0 0 4px; color: #2f261f; }
    .subtitle { color: #6f6259; font-size: 0.95rem; margin: 0; }
    h2 { font-size: 1.15rem; margin: 28px 0 12px; color: #2f261f; border-bottom: 1px solid #efe8de; padding-bottom: 6px; }
    h2 .count { font-weight: normal; color: #9a8f82; font-size: 0.9rem; }
    h3 { font-size: 1rem; margin: 0 0 6px; }
    .meta { color: #9a8f82; font-size: 0.85rem; margin: 0 0 8px; }
    .stats { color: #6f6259; font-style: italic; }
    .notice {
      background: #fff8eb;
      border: 1px solid #e7d9c8;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.9rem;
      color: #6f6259;
    }
    .empty { color: #9a8f82; font-style: italic; }
    ul { margin: 0; padding-left: 1.25rem; }
    li { margin-bottom: 8px; }
    .entry {
      background: white;
      border: 1px solid #efe8de;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }
    .photo img {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e7d9c8;
    }
    figcaption { font-size: 0.8rem; color: #6f6259; margin-top: 6px; }
    footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e7d9c8;
      font-size: 0.8rem;
      color: #9a8f82;
    }
    @media print {
      body { background: white; padding: 24px; }
      .notice { border-color: #ccc; }
    }
  </style>
</head>
<body>
  <header>
    <h1>🌱 ${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(typeLabel)} · ${escapeHtml(styleLabel)} · ${escapeHtml(content.dateRange.label)}</p>
  </header>
  <main>
    ${sections.join("\n")}
    ${emptyNote}
  </main>
  <footer>
  Generated ${new Date(content.generatedAt).toLocaleString()} · Spark Studio Companions Growth Center
  </footer>
</body>
</html>`;
}

export function printGrowthReport(content: GrowthReportContent): void {
  if (typeof window === "undefined") return;
  const html = formatGrowthReportHtml(content);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export function downloadGrowthReportHtml(content: GrowthReportContent): void {
  if (typeof window === "undefined") return;
  const html = formatGrowthReportHtml(content);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const slug = content.reportType;
  anchor.href = url;
  anchor.download = `growth-report-${slug}-${content.dateRange.from.toISOString().slice(0, 10)}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const GROWTH_REPORT_TYPE_OPTIONS: {
  id: GrowthReportType;
  label: string;
  hint: string;
}[] = [
  {
    id: "weekly",
    label: "Weekly Report",
    hint: "1–2 pages — wins, evidence, highlights, journey",
  },
  {
    id: "monthly",
    label: "Monthly Report",
    hint: "5–10 pages — major wins, evidence, photos, reflections",
  },
  {
    id: "quarterly",
    label: "Quarterly Report",
    hint: "Quarter overview with testimonials and files",
  },
  {
    id: "annual",
    label: "Annual Report",
    hint: "Comprehensive year — accomplishments, testimonials, certificates, journey",
  },
  {
    id: "custom",
    label: "Custom Date Range",
    hint: "Pick your own from / to dates",
  },
];

export const GROWTH_REPORT_STYLE_OPTIONS: {
  id: GrowthReportStyle;
  label: string;
}[] = [
  { id: "summary", label: "Summary Report" },
  { id: "detailed", label: "Detailed Report" },
  { id: "storybook", label: "Storybook Report" },
  { id: "visual", label: "Visual Report" },
];

export const GROWTH_REPORT_INCLUDE_OPTIONS: {
  key: keyof GrowthReportIncludes;
  label: string;
}[] = [
  { key: "goals", label: "Outcome Goals" },
  { key: "wins", label: "Wins" },
  { key: "evidence", label: "Evidence" },
  { key: "highlights", label: "My Highlights" },
  { key: "journey", label: "Journey" },
  { key: "photos", label: "Photos" },
  { key: "files", label: "Files" },
  { key: "testimonials", label: "Testimonials" },
  { key: "certifications", label: "Certifications" },
  { key: "reflections", label: "Reflections" },
];
