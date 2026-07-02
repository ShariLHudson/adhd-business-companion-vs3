import type { StablesExperienceId, StablesRoomState } from "./types";

export const INITIAL_STABLES_ROOM_STATE: StablesRoomState = {
  selectedExperienceId: null,
  hoveredExperienceId: null,
};

export type StablesRoomAction =
  | { type: "select_experience"; experienceId: StablesExperienceId }
  | { type: "clear_experience" }
  | { type: "hover_experience"; experienceId: StablesExperienceId | null };

export function reduceStablesRoomState(
  state: StablesRoomState,
  action: StablesRoomAction,
): StablesRoomState {
  switch (action.type) {
    case "select_experience":
      return {
        ...state,
        selectedExperienceId: action.experienceId,
        hoveredExperienceId: action.experienceId,
      };
    case "clear_experience":
      return {
        ...state,
        selectedExperienceId: null,
      };
    case "hover_experience":
      return {
        ...state,
        hoveredExperienceId: action.experienceId,
      };
    default:
      return state;
  }
}
