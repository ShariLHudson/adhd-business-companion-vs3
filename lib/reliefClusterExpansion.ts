/**
 * Relief cluster expansion state — pure transitions for PR 4B.
 * No auto-dismiss; only one cluster active at a time.
 */

export type ReliefClusterExpansionState = {
  activeClusterId: string | null;
  thoughtsVisibleClusterId: string | null;
};

export const INITIAL_RELIEF_CLUSTER_EXPANSION: ReliefClusterExpansionState = {
  activeClusterId: null,
  thoughtsVisibleClusterId: null,
};

export function reliefClusterTap(
  state: ReliefClusterExpansionState,
  clusterId: string,
): ReliefClusterExpansionState {
  if (state.activeClusterId === clusterId) {
    return INITIAL_RELIEF_CLUSTER_EXPANSION;
  }
  return {
    activeClusterId: clusterId,
    thoughtsVisibleClusterId: null,
  };
}

export function reliefClusterShowThoughts(
  state: ReliefClusterExpansionState,
  clusterId: string,
): ReliefClusterExpansionState {
  if (state.activeClusterId !== clusterId) return state;
  return { ...state, thoughtsVisibleClusterId: clusterId };
}

export function reliefClusterHideThoughts(
  state: ReliefClusterExpansionState,
): ReliefClusterExpansionState {
  return { ...state, thoughtsVisibleClusterId: null };
}
