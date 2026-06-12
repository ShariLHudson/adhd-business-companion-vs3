// Founder Ecosystem — Phase 1 data model (object definitions).
//
// These are the durable "nouns" of the system. They are kept deliberately
// simple and serializable (plain JSON) so they can be backed by localStorage
// today and a database/API later with no shape changes. Dashboards and founder
// intelligence are DERIVED from events (see events.ts / metrics.ts) — these
// records are the canonical state those events mutate.

export type ID = string;
export type ISODateString = string; // e.g. "2026-06-18T14:00:00.000Z"

// ---- Founder ------------------------------------------------------------
export type FounderProfile = {
  id: ID;
  name: string;
  business: string;
  goals: string[];
  challenges: string[];
  strengths: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

// ---- Projects -----------------------------------------------------------
export type ProjectStage = "idea" | "planning" | "building" | "launching" | "live";
export type ProjectStatus =
  | "not-started"
  | "in-progress"
  | "active-focus"
  | "paused"
  | "completed";

export type Project = {
  id: ID;
  founderId: ID;
  title: string;
  stage: ProjectStage;
  status: ProjectStatus;
  taskIds: ID[]; // linked tasks
  documentIds: ID[]; // linked documents
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

// ---- Tasks --------------------------------------------------------------
export type TaskStatus = "open" | "in-progress" | "blocked" | "completed";

export type Task = {
  id: ID;
  founderId: ID;
  projectId?: ID;
  title: string;
  status: TaskStatus;
  dueDate?: ISODateString;
  completedAt?: ISODateString;
  createdAt: ISODateString;
};

// ---- Documents ----------------------------------------------------------
export type DocumentType =
  | "proposal"
  | "sop"
  | "email"
  | "sales-page"
  | "marketing-plan"
  | "doc"
  | "sheet"
  | "form"
  | "other";

// Where the working document actually lives. The Companion CREATES; Google
// (or local export) STORES — see README "WORKING DOCUMENTS LIVE IN GOOGLE".
export type DocumentSource =
  | "create" // drafted in the Companion's Create workspace
  | "google-doc"
  | "google-sheet"
  | "google-form"
  | "pdf"
  | "copy";

export type FounderDocument = {
  id: ID;
  founderId: ID;
  type: DocumentType;
  title: string;
  source: DocumentSource;
  savedAt: ISODateString;
  location?: string; // URL or storage key (e.g. a Google Doc link)
  projectId?: ID;
};

// ---- Decisions ----------------------------------------------------------
export type DecisionStatus = "open" | "made" | "deferred" | "dropped";

export type Decision = {
  id: ID;
  founderId: ID;
  projectId?: ID;
  text: string;
  status: DecisionStatus;
  createdAt: ISODateString;
  relatedOpportunityIds: ID[];
};

// ---- Opportunities ------------------------------------------------------
export type OpportunityStatus = "new" | "exploring" | "pursuing" | "won" | "lost";

export type Opportunity = {
  id: ID;
  founderId: ID;
  text: string;
  status: OpportunityStatus;
  createdAt: ISODateString;
};

// ---- Pain Points --------------------------------------------------------
// Aggregated, not one-off: occurrences increments as the same friction recurs.
export type PainPoint = {
  id: ID;
  founderId: ID;
  text: string;
  occurrences: number;
  firstSeen: ISODateString;
  lastSeen: ISODateString;
};

// A convenience aggregate of every record for one founder — handy for the
// dashboard layer and for hydrating state from a backend.
export type EcosystemState = {
  founder: FounderProfile;
  projects: Project[];
  tasks: Task[];
  documents: FounderDocument[];
  decisions: Decision[];
  opportunities: Opportunity[];
  painPoints: PainPoint[];
};
