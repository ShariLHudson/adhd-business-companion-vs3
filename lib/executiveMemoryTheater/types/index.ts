/** Executive Memory Theater™ — living history into executive wisdom. */

export type MemoryReplayKind =
  | "product"
  | "launch"
  | "mission"
  | "decision"
  | "customer-journey"
  | "research"
  | "marketing"
  | "workshop"
  | "year"
  | "quarter"
  | "founder-journey";

export type StoryStageId =
  | "beginning"
  | "context"
  | "questions"
  | "research"
  | "ideas"
  | "alternatives"
  | "decision"
  | "implementation"
  | "unexpected"
  | "results"
  | "lessons"
  | "today";

export type StoryStage = {
  id: StoryStageId;
  label: string;
  narrative: string;
};

export type DecisionRoom = {
  originalQuestion: string;
  originalContext: string;
  originalConstraints: string[];
  informationAvailableThen: string[];
  unknownInformation: string[];
  boardDiscussion: string;
  chosenDirection: string;
  reasoning: string;
  confidence: string;
  implementation: string;
  actualResults: string;
  lessonsLearned: string[];
  currentRecommendation: string;
};

export type IfWeCouldDoItAgain = {
  wouldChooseDifferently: boolean;
  summary: string;
  why: string;
  whatChanged: string[];
  assumptionsCorrect: string[];
  assumptionsFailed: string[];
  teachAnotherFounder: string;
};

export type HistoricalSimulation = {
  decisionDate: string;
  historicalRecommendation: string;
  actualDecision: string;
  actualOutcome: string;
  todaysRecommendation: string;
  whatChanged: string[];
};

export type EvolutionStep = {
  id: string;
  label: string;
  summary: string;
  date?: string;
};

export type WisdomIndex = {
  knowledgeGained: string;
  timeSaved: string;
  mistakesPrevented: string;
  revenueCreated: string;
  customerValue: string;
  founderGrowth: string;
  organizationalLearning: string;
  futureReusability: string;
};

export type BoardReflectionItem = {
  id: string;
  label: string;
  stillRecommend: boolean;
  wouldChange: string;
  concerns: string;
  missedOpportunity: string;
};

export type ShariReflection = {
  presentToPast: string;
  futureShouldRemember: string;
  strengthsHelped: string[];
  habitsSlowed: string[];
  growthSummary: string;
};

export type MemoryReplay = {
  id: string;
  kind: MemoryReplayKind;
  title: string;
  subtitle: string;
  period: string;
  executiveSummary: string;
  story: StoryStage[];
  decisionRoom?: DecisionRoom;
  ifWeCouldDoItAgain: IfWeCouldDoItAgain;
  historicalSimulation?: HistoricalSimulation;
  executiveGrowth: string[];
  neverAgain: string[];
  doThisAgain: string[];
  evolutionMap?: EvolutionStep[];
  wisdomIndex: WisdomIndex;
  boardReflection: BoardReflectionItem[];
  boardSummary: string;
  shariReflection: ShariReflection;
  relatedIds?: string[];
};

export type MemoryReplayEntryPoint = {
  id: string;
  kind: MemoryReplayKind;
  label: string;
  phrase: string;
};

export type MemoryTheaterBootstrap = {
  entryPoints: MemoryReplayEntryPoint[];
  featuredReplayId: string;
  neverAgainLibrary: string[];
  doThisAgainLibrary: string[];
};

export type MemoryTheaterSessionView = {
  product: "founder";
  query: string;
  replay: MemoryReplay;
  generatedAt: string;
};
