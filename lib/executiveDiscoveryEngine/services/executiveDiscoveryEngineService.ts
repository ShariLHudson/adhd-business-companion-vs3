import { discoveryEngineSampleRepository } from "../repositories/sample";
import type {
  DailyDiscoveryBrief,
  DiscoveryEngineBootstrap,
  DiscoveryFindingDetailView,
  MonthlyExecutiveDiscoveryReport,
  WeeklyDiscoveryReport,
} from "../types";

const OVERNIGHT_MESSAGE =
  "While you were away, I found a few things worth your attention.";

function requireFinding(id: string) {
  const finding = discoveryEngineSampleRepository.getFinding(id);
  if (!finding) throw new Error(`Missing discovery finding: ${id}`);
  return finding;
}

export function getDiscoveryEngineBootstrap(): DiscoveryEngineBootstrap {
  const findings = discoveryEngineSampleRepository.findings();
  return {
    overnightMessage: OVERNIGHT_MESSAGE,
    dailyBriefReady: true,
    weeklyReportReady: true,
    monthlyReportReady: true,
    findingCount: findings.length,
    founderAlertCount: discoveryEngineSampleRepository.alerts().length,
    categoriesRepresented: [...new Set(findings.map((f) => f.category))],
  };
}

export function composeDailyDiscoveryBrief(): DailyDiscoveryBrief {
  const topDiscovery = requireFinding("ede-unified-restart");
  const importantFindings = [
    requireFinding("ede-butterfly-chain"),
    requireFinding("ede-quote-library"),
    requireFinding("ede-sprint-rhythm"),
  ];
  const hiddenOpportunity = requireFinding("ede-quote-library");
  const potentialRisk = requireFinding("ede-competitive-signal");
  const recommendedAction = requireFinding("ede-unified-restart");

  return {
    product: "founder",
    overnightMessage: OVERNIGHT_MESSAGE,
    generatedAt: new Date().toISOString(),
    topDiscovery,
    importantFindings,
    hiddenOpportunity,
    potentialRisk,
    questionWorthExploring:
      "What would a shame-free return feel like in the first 60 seconds of Companion — before any feature appears?",
    recommendedAction,
    founderAlert: discoveryEngineSampleRepository.getAlertForFinding("ede-unified-restart"),
  };
}

export function composeWeeklyDiscoveryReport(): WeeklyDiscoveryReport {
  return {
    product: "founder",
    weekLabel: "Week of July 6, 2026",
    generatedAt: new Date().toISOString(),
    mostImportantDiscoveries: [
      requireFinding("ede-unified-restart"),
      requireFinding("ede-butterfly-chain"),
      requireFinding("ede-sprint-rhythm"),
    ],
    emergingPatterns: [
      "Return guilt threads across Companion, support, and workshop waitlists",
      "Research → workshop → membership chains forming before tier exists",
      "One-room-per-sprint rhythm outperforming parallel polish",
    ],
    customerChanges: [
      "More members describing absence shame — not confusion",
      "Listening Rooms interest rising with workshop proximity",
    ],
    technologyChanges: [
      "Executive stack Sprints 4–7 linked via shared graph nodes",
      "Relationship Intelligence feeding Discovery Engine overnight",
    ],
    competitiveChanges: [
      "Generic AI companion marketing increasing — relationship positioning matters more",
    ],
    businessOpportunities: [
      "Workshop as proof engine for Calm Depth tier",
      "Shared quote library across Builder and PostCraft",
      "Unified restart narrative before launch",
    ],
    recommendedPriorities: [
      "1. Unified restart messaging brief",
      "2. Workshop blueprint and quote capture",
      "3. Pricing research in parallel — not blocking workshop",
    ],
  };
}

export function composeMonthlyExecutiveDiscoveryReport(): MonthlyExecutiveDiscoveryReport {
  return {
    product: "founder",
    monthLabel: "July 2026",
    generatedAt: new Date().toISOString(),
    whatChanged: [
      "Founder Studio executive stack grew from Research to Relationship Intelligence",
      "Listening Rooms restart theme became cross-product pattern",
      "Simulation + Memory Theater validated workshop-first path",
    ],
    whatSurprisedUs: [
      "Seven unrelated conversations mapped to one guilt pattern",
      "Sprint discipline visible as competitive advantage in graph",
    ],
    opportunitiesEmerging: [
      "Calm Depth membership implied by butterfly chain",
      "Quote library automation across marketing stack",
      "Competitive differentiation via relationship not features",
    ],
    opportunitiesDisappeared: [
      "Parallel polish of all Founder rooms — pattern proved slower",
      "Tier-before-workshop sequencing — graph disagrees",
    ],
    whatSparkShouldBuildNext: [
      "Executive Discovery Engine daily brief (this sprint)",
      "Workshop proof event with quote capture",
      "Unified restart narrative in production copy",
    ],
    whatToStopDoing: [
      "Rewriting research quotes in PostCraft from scratch",
      "Pricing tier before workshop quotes exist",
      "Feature-comparison marketing language",
    ],
    whatToLearn: [
      "Membership pricing benchmarks for ADHD-friendly offers",
      "Which discovery categories Shari acts on most",
    ],
    whatToAutomate: [
      "Overnight discovery brief compilation",
      "Competitive messaging digest filtered to positioning risks",
      "Quote sync from research to PostCraft drafts",
    ],
  };
}

export function composeDiscoveryFindingDetail(findingId: string): DiscoveryFindingDetailView | null {
  const finding = discoveryEngineSampleRepository.getFinding(findingId);
  if (!finding) return null;
  return {
    product: "founder",
    finding,
    founderAlert: discoveryEngineSampleRepository.getAlertForFinding(findingId),
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveDiscoveryEngineService {
  dailyBrief() {
    return composeDailyDiscoveryBrief();
  }

  weeklyReport() {
    return composeWeeklyDiscoveryReport();
  }

  monthlyReport() {
    return composeMonthlyExecutiveDiscoveryReport();
  }

  findingDetail(findingId: string) {
    return composeDiscoveryFindingDetail(findingId);
  }

  bootstrap() {
    return getDiscoveryEngineBootstrap();
  }

  sampleRepository() {
    return discoveryEngineSampleRepository;
  }
}

export const executiveDiscoveryEngineService = new ExecutiveDiscoveryEngineService();
