import type { CommandCenterContext } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import {
  composeAttention,
  composeCommandCenter,
  composeExecutiveDesk,
  composeFocus,
  composeLeverage,
  composeToday,
} from "../composer/commandCenterComposer";

export class CommandCenterService {
  compose(context: CommandCenterContext = {}) {
    return composeCommandCenter(context);
  }

  today(context: CommandCenterContext = {}) {
    return composeToday(context);
  }

  focus(missionId?: MissionId) {
    return composeFocus(missionId);
  }

  attention(missionId?: MissionId) {
    return composeAttention(missionId);
  }

  leverage(missionId?: MissionId) {
    return composeLeverage(missionId);
  }

  desk(missionId?: MissionId) {
    return composeExecutiveDesk(missionId);
  }
}

export const commandCenterService = new CommandCenterService();

export {
  composeCommandCenter,
  composeToday,
  composeFocus,
  composeAttention,
  composeLeverage,
  composeExecutiveDesk,
};
