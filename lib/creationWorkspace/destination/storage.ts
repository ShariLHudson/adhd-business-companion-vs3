/**
 * SessionStorage helpers for destination handoffs.
 * Clear only after successful destination persistence.
 */

import type {
  CreationWorkspaceCreateHandoff,
  CreationWorkspaceEstateHandoff,
  CreationWorkspaceProjectHandoff,
  CreationWorkspaceReturnContext,
  CreationWorkspaceStrategyHandoff,
  CreationWorkspaceVisualHandoff,
} from "./contracts";
import {
  CREATION_WORKSPACE_CREATE_HANDOFF_KEY,
  CREATION_WORKSPACE_ESTATE_HANDOFF_KEY,
  CREATION_WORKSPACE_PROJECT_HANDOFF_KEY,
  CREATION_WORKSPACE_RETURN_CONTEXT_KEY,
  CREATION_WORKSPACE_STRATEGY_HANDOFF_KEY,
  CREATION_WORKSPACE_VISUAL_HANDOFF_KEY,
} from "./keys";

type MemoryBag = {
  create: CreationWorkspaceCreateHandoff | null;
  visual: CreationWorkspaceVisualHandoff | null;
  project: CreationWorkspaceProjectHandoff | null;
  strategy: CreationWorkspaceStrategyHandoff | null;
  estate: CreationWorkspaceEstateHandoff | null;
  returnContext: CreationWorkspaceReturnContext | null;
};

const memory: MemoryBag = {
  create: null,
  visual: null,
  project: null,
  strategy: null,
  estate: null,
  returnContext: null,
};

function setJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function getJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function storeCreateHandoff(handoff: CreationWorkspaceCreateHandoff): void {
  memory.create = handoff;
  setJson(CREATION_WORKSPACE_CREATE_HANDOFF_KEY, handoff);
  storeReturnContext(handoff.returnContext);
}

export function peekCreateHandoff(): CreationWorkspaceCreateHandoff | null {
  return memory.create ?? getJson<CreationWorkspaceCreateHandoff>(CREATION_WORKSPACE_CREATE_HANDOFF_KEY);
}

export function clearCreateHandoff(): void {
  memory.create = null;
  removeKey(CREATION_WORKSPACE_CREATE_HANDOFF_KEY);
}

export function storeVisualHandoff(handoff: CreationWorkspaceVisualHandoff): void {
  memory.visual = handoff;
  setJson(CREATION_WORKSPACE_VISUAL_HANDOFF_KEY, handoff);
  storeReturnContext(handoff.returnContext);
}

export function peekVisualHandoff(): CreationWorkspaceVisualHandoff | null {
  return memory.visual ?? getJson<CreationWorkspaceVisualHandoff>(CREATION_WORKSPACE_VISUAL_HANDOFF_KEY);
}

export function clearVisualHandoff(): void {
  memory.visual = null;
  removeKey(CREATION_WORKSPACE_VISUAL_HANDOFF_KEY);
}

export function storeProjectHandoff(handoff: CreationWorkspaceProjectHandoff): void {
  memory.project = handoff;
  setJson(CREATION_WORKSPACE_PROJECT_HANDOFF_KEY, handoff);
  storeReturnContext(handoff.returnContext);
}

export function peekProjectHandoff(): CreationWorkspaceProjectHandoff | null {
  return memory.project ?? getJson<CreationWorkspaceProjectHandoff>(CREATION_WORKSPACE_PROJECT_HANDOFF_KEY);
}

export function clearProjectHandoff(): void {
  memory.project = null;
  removeKey(CREATION_WORKSPACE_PROJECT_HANDOFF_KEY);
}

export function storeStrategyHandoff(handoff: CreationWorkspaceStrategyHandoff): void {
  memory.strategy = handoff;
  setJson(CREATION_WORKSPACE_STRATEGY_HANDOFF_KEY, handoff);
  storeReturnContext(handoff.returnContext);
}

export function peekStrategyHandoff(): CreationWorkspaceStrategyHandoff | null {
  return (
    memory.strategy ??
    getJson<CreationWorkspaceStrategyHandoff>(CREATION_WORKSPACE_STRATEGY_HANDOFF_KEY)
  );
}

export function clearStrategyHandoff(): void {
  memory.strategy = null;
  removeKey(CREATION_WORKSPACE_STRATEGY_HANDOFF_KEY);
}

export function storeEstateHandoff(handoff: CreationWorkspaceEstateHandoff): void {
  memory.estate = handoff;
  setJson(CREATION_WORKSPACE_ESTATE_HANDOFF_KEY, handoff);
  storeReturnContext(handoff.returnContext);
}

export function peekEstateHandoff(): CreationWorkspaceEstateHandoff | null {
  return memory.estate ?? getJson<CreationWorkspaceEstateHandoff>(CREATION_WORKSPACE_ESTATE_HANDOFF_KEY);
}

export function clearEstateHandoff(): void {
  memory.estate = null;
  removeKey(CREATION_WORKSPACE_ESTATE_HANDOFF_KEY);
}

export function storeReturnContext(ctx: CreationWorkspaceReturnContext): void {
  memory.returnContext = ctx;
  setJson(CREATION_WORKSPACE_RETURN_CONTEXT_KEY, ctx);
}

export function peekReturnContext(): CreationWorkspaceReturnContext | null {
  return (
    memory.returnContext ??
    getJson<CreationWorkspaceReturnContext>(CREATION_WORKSPACE_RETURN_CONTEXT_KEY)
  );
}

export function clearReturnContext(): void {
  memory.returnContext = null;
  removeKey(CREATION_WORKSPACE_RETURN_CONTEXT_KEY);
}

export function __resetDestinationHandoffStorageForTests(): void {
  memory.create = null;
  memory.visual = null;
  memory.project = null;
  memory.strategy = null;
  memory.estate = null;
  memory.returnContext = null;
  clearCreateHandoff();
  clearVisualHandoff();
  clearProjectHandoff();
  clearStrategyHandoff();
  clearEstateHandoff();
  clearReturnContext();
}
