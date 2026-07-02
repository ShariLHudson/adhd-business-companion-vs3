/**
 * Pillar IV — Build Your Legacy curriculum map
 */

import { buildCurriculumEntry, EXPERIENCE_BUNDLES } from "../buildEntry";
import type { CurriculumMasterIndexEntry } from "../types";

const P = "build_your_legacy" as const;

function t(
  deptId: string,
  deptTitle: string,
  drawerSlug: string,
  drawerTitle: string,
  slug: string,
  title: string,
  shortDescription: string,
  capabilityFocus: string,
  competencies: string[],
  opts: {
    stages?: ("idea" | "launch" | "growth" | "scale" | "mature" | "all")[];
    adhd?: "none" | "low" | "medium" | "high";
    ai?: "none" | "low" | "medium" | "high";
    difficulty?: "foundational" | "intermediate" | "advanced" | "expert";
    minutes?: number;
    bundle?: keyof typeof EXPERIENCE_BUNDLES;
    sort: number;
  },
): CurriculumMasterIndexEntry {
  return buildCurriculumEntry({
    pillarId: P,
    departmentId: deptId,
    departmentTitle: deptTitle,
    drawerSlug,
    drawerTitle,
    slug,
    title,
    shortDescription,
    capabilityFocus,
    primaryCompetencies: competencies,
    businessStages: opts.stages ?? ["all"],
    adhdRelevance: opts.adhd ?? "low",
    aiRelevance: opts.ai ?? "medium",
    difficulty: opts.difficulty ?? "foundational",
    estimatedMinutes: opts.minutes ?? 20,
    futureLearningExperiences: EXPERIENCE_BUNDLES[opts.bundle ?? "legacy"],
    sortOrder: opts.sort,
  });
}

export const BUILD_YOUR_LEGACY_CURRICULUM: CurriculumMasterIndexEntry[] = [
  // Leadership
  t("dept-leadership", "Leadership", "leadership", "Leadership", "founder-leadership", "Founder Leadership", "Lead yourself before you lead others.", "Lead with clarity and care.", ["leadership", "personal-leadership"], { bundle: "mastery", sort: 1 }),
  t("dept-leadership", "Leadership", "culture", "Culture", "team-culture", "Team Culture", "Culture you shape intentionally.", "Shape culture through daily behavior.", ["culture", "leadership"], { stages: ["growth", "scale"], sort: 1 }),
  t("dept-leadership", "Leadership", "delegation", "Delegation", "leadership-delegation", "Leadership Delegation", "Delegate at scale.", "Delegate leadership outcomes, not just tasks.", ["delegation", "leadership"], { difficulty: "intermediate", sort: 1 }),
  t("dept-leadership", "Leadership", "vision", "Vision", "team-vision", "Team Vision", "Vision others can follow.", "Communicate vision people can embody.", ["mission-vision", "leadership"], { sort: 1 }),
  // Coaching
  t("dept-coaching", "Coaching", "coaching", "Coaching", "coaching-foundations", "Coaching Foundations", "Coach without fixing people.", "Coach others toward their capability.", ["coaching", "communication"], { bundle: "mastery", sort: 1 }),
  t("dept-coaching", "Coaching", "powerful-questions", "Powerful Questions", "coaching-questions", "Coaching Questions", "Questions that unlock thinking.", "Ask questions that create insight.", ["coaching", "listening"], { sort: 1 }),
  // Mentoring
  t("dept-mentoring", "Mentoring", "mentoring", "Mentoring", "mentor-relationships", "Mentor Relationships", "Mentor with generosity and boundaries.", "Mentor others sustainably.", ["mentoring", "leadership"], { sort: 1 }),
  // Consulting
  t("dept-coaching", "Consulting", "consulting", "Consulting", "consulting-model", "Consulting Model", "Package expertise ethically.", "Design consulting offers that deliver.", ["consulting", "offers"], { stages: ["growth", "scale"], bundle: "mastery", sort: 1 }),
  t("dept-coaching", "Consulting", "consulting", "Consulting", "client-results", "Client Results", "Results clients can point to.", "Deliver measurable client outcomes.", ["consulting", "customer-experience"], { difficulty: "intermediate", sort: 2 }),
  // Speaking
  t("dept-speaking", "Speaking", "public-speaking", "Public Speaking", "stage-confidence", "Stage Confidence", "Speak without hiding behind slides.", "Speak with calm authority.", ["public-speaking", "confidence"], { bundle: "practice", sort: 1 }),
  t("dept-speaking", "Speaking", "webinars", "Webinars", "webinar-delivery", "Webinar Delivery", "Webinars that teach and convert.", "Deliver webinars that respect attention.", ["public-speaking", "teaching"], { bundle: "practice", sort: 1 }),
  t("dept-speaking", "Speaking", "story-on-stage", "Story On Stage", "stage-storytelling", "Stage Storytelling", "Stories that move rooms.", "Tell stories that land live.", ["public-speaking", "storytelling"], { sort: 1 }),
  // Writing
  t("dept-writing", "Writing", "writing", "Writing", "writing-habit", "Writing Habit", "Write consistently as a founder.", "Build a sustainable writing practice.", ["writing", "content-creation"], { adhd: "medium", sort: 1 }),
  t("dept-writing", "Writing", "newsletters", "Newsletters", "newsletter-writing", "Newsletter Writing", "Newsletters people open.", "Write newsletters worth reading.", ["writing", "content-creation"], { bundle: "practice", sort: 1 }),
  t("dept-writing", "Writing", "books", "Books", "writing-a-book", "Writing A Book", "Books that establish legacy.", "Plan and write a book patiently.", ["writing", "legacy-building"], { difficulty: "advanced", bundle: "mastery", sort: 1 }),
  // Course Creation
  t("dept-course-creation", "Course Creation", "courses", "Courses", "course-design", "Course Design", "Courses that change capability.", "Design courses for transformation.", ["course-creation", "teaching"], { bundle: "mastery", sort: 1 }),
  t("dept-course-creation", "Course Creation", "teaching", "Teaching", "adult-learning", "Adult Learning", "Teach adults how they actually learn.", "Teach in ways adults retain.", ["teaching", "learning-science"], { sort: 1 }),
  t("dept-course-creation", "Course Creation", "cohorts", "Cohorts", "cohort-based-courses", "Cohort-Based Courses", "Cohorts that create belonging.", "Run cohorts with high completion.", ["course-creation", "community-building"], { difficulty: "intermediate", sort: 1 }),
  // Community Building
  t("dept-community-building", "Community Building", "community", "Community", "community-design", "Community Design", "Communities with purpose and safety.", "Design communities that last.", ["community-building", "leadership"], { bundle: "mastery", sort: 1 }),
  t("dept-community-building", "Community Building", "engagement", "Engagement", "member-engagement", "Member Engagement", "Engagement without burnout.", "Engage members sustainably.", ["community-building", "energy-management"], { sort: 1 }),
  // Thought Leadership
  t("dept-thought-leadership", "Thought Leadership", "authority", "Authority", "building-authority", "Building Authority", "Authority through service, not posturing.", "Build authority through consistent value.", ["authority", "thought-leadership"], { bundle: "legacy", sort: 1 }),
  t("dept-thought-leadership", "Thought Leadership", "positioning-expert", "Positioning Expert", "expert-positioning", "Expert Positioning", "Be known for one thing clearly.", "Position as a trusted expert.", ["thought-leadership", "positioning"], { sort: 1 }),
  // Content Creation
  t("dept-writing", "Content Creation", "content-creation", "Content Creation", "content-systems", "Content Systems", "Create without living on hamster wheel.", "Build content systems that last.", ["content-creation", "marketing"], { bundle: "practice", sort: 1 }),
  t("dept-writing", "Content Creation", "video", "Video", "video-content", "Video Content", "Video that feels human.", "Create video content sustainably.", ["content-creation", "public-speaking"], { ai: "high", sort: 1 }),
  t("dept-writing", "Content Creation", "podcasting", "Podcasting", "podcast-basics", "Podcast Basics", "Podcasts as long-form relationship.", "Launch and sustain a podcast.", ["content-creation", "community-building"], { sort: 1 }),
  t("dept-writing", "Content Creation", "repurposing", "Repurposing", "content-repurposing", "Content Repurposing", "One idea, many formats.", "Repurpose content without diluting.", ["content-creation", "productivity"], { ai: "high", sort: 1 }),
  // Legacy Building
  t("dept-legacy-building", "Legacy Building", "purpose", "Purpose", "legacy-purpose", "Legacy Purpose", "Purpose beyond profit.", "Connect business to lasting purpose.", ["purpose", "legacy-building"], { bundle: "legacy", sort: 1 }),
  t("dept-legacy-building", "Legacy Building", "impact", "Impact", "measuring-impact", "Measuring Impact", "Impact you can name.", "Define and track meaningful impact.", ["legacy-building", "business-strategy"], { sort: 1 }),
  t("dept-legacy-building", "Legacy Building", "giving-back", "Giving Back", "giving-back", "Giving Back", "Contribution as part of success.", "Give back in ways that fit your capacity.", ["giving-back", "legacy-building"], { sort: 1 }),
  t("dept-legacy-building", "Legacy Building", "succession", "Succession", "succession-planning", "Succession Planning", "Business that outlives your daily presence.", "Plan succession with care.", ["legacy-building", "leadership"], { difficulty: "expert", stages: ["scale", "mature"], sort: 1 }),
];
