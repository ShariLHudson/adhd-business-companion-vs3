import {
  SPARK_SAMPLE_CONNECTIONS,
  SPARK_SAMPLE_EVIDENCE,
  SPARK_SAMPLE_FINDINGS,
  SPARK_SAMPLE_GRAPH_EDGES,
  SPARK_SAMPLE_GRAPH_NODES,
  SPARK_SAMPLE_KNOWLEDGE,
  SPARK_SAMPLE_MEMORY_REFS,
  SPARK_SAMPLE_OBSERVATIONS,
  SPARK_SAMPLE_OPPORTUNITIES,
  SPARK_SAMPLE_PATTERNS,
  SPARK_SAMPLE_PRIORITIES,
  SPARK_SAMPLE_RECOMMENDATIONS,
  SPARK_SAMPLE_RISKS,
  SPARK_SAMPLE_SIGNALS,
  SPARK_SAMPLE_SOURCES,
  SPARK_SAMPLE_THEMES,
} from "../../sample/ecosystemData";

/** In-memory sample repository — swap for durable storage without changing services. */
export const sparkSampleRepository = {
  sources: () => [...SPARK_SAMPLE_SOURCES],
  signals: () => [...SPARK_SAMPLE_SIGNALS],
  observations: () => [...SPARK_SAMPLE_OBSERVATIONS],
  findings: () => [...SPARK_SAMPLE_FINDINGS],
  patterns: () => [...SPARK_SAMPLE_PATTERNS],
  themes: () => [...SPARK_SAMPLE_THEMES],
  evidence: () => [...SPARK_SAMPLE_EVIDENCE],
  priorities: () => [...SPARK_SAMPLE_PRIORITIES],
  recommendations: () => [...SPARK_SAMPLE_RECOMMENDATIONS],
  opportunities: () => [...SPARK_SAMPLE_OPPORTUNITIES],
  risks: () => [...SPARK_SAMPLE_RISKS],
  knowledge: () => [...SPARK_SAMPLE_KNOWLEDGE],
  memoryRefs: () => [...SPARK_SAMPLE_MEMORY_REFS],
  graphNodes: () => [...SPARK_SAMPLE_GRAPH_NODES],
  graphEdges: () => [...SPARK_SAMPLE_GRAPH_EDGES],
  connections: () => [...SPARK_SAMPLE_CONNECTIONS],
};

export type SparkSampleRepository = typeof sparkSampleRepository;
