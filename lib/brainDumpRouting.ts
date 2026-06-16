import {
  logMomentum,
  saveProject,
  saveProjectItem,
  saveTimeBlock,
  updateBrainDump,
  type BrainDumpEntry,
} from "./companionStore";
import { addTomorrowFocus, tomorrowFocusTrustMessage } from "./tomorrowFocus";

export type ClearMindRoute =
  | "time-block"
  | "reminder"
  | "task"
  | "parking-lot"
  | "project"
  | "focus"
  | "tomorrow"
  | "done";

export type RouteTrustResult = {
  ok: boolean;
  headline: string;
  savedWhere: string;
  seeWhere: string;
  route: ClearMindRoute;
};

export function routesForEntry(entry: BrainDumpEntry): ClearMindRoute[] {
  const base: ClearMindRoute[] = [
    "time-block",
    "reminder",
    "task",
    "parking-lot",
    "project",
    "focus",
    "tomorrow",
    "done",
  ];
  const suggestion = entry.suggestion ?? entry.contextType;
  if (suggestion === "reminder") {
    return ["reminder", "time-block", "tomorrow", "parking-lot", "done"];
  }
  if (suggestion === "project" || entry.contextType === "task") {
    return ["project", "task", "focus", "time-block", "tomorrow", "done"];
  }
  if (entry.contextType === "emotional" || entry.contextType === "thought") {
    return ["parking-lot", "tomorrow", "done", "task"];
  }
  return base;
}

export const ROUTE_LABEL: Record<ClearMindRoute, string> = {
  "time-block": "Time Block",
  reminder: "Reminder",
  task: "Task",
  "parking-lot": "Parking Lot",
  project: "Project",
  focus: "Focus Session",
  tomorrow: "Work on tomorrow",
  done: "Done for now",
};

function trust(
  headline: string,
  savedWhere: string,
  seeWhere: string,
  route: ClearMindRoute,
): RouteTrustResult {
  return { ok: true, headline, savedWhere, seeWhere, route };
}

export function routeBrainDumpEntry(
  entry: BrainDumpEntry,
  route: ClearMindRoute,
): RouteTrustResult {
  const text = entry.text.trim();
  if (!text) {
    return {
      ok: false,
      headline: "Nothing to route.",
      savedWhere: "",
      seeWhere: "",
      route,
    };
  }

  switch (route) {
    case "tomorrow": {
      addTomorrowFocus(text, {
        sourceType: "brain-dump",
        sourceId: entry.id,
      });
      updateBrainDump(entry.id, {
        schedulingIntent: "tomorrow",
        actionType: "someday",
        routedAction: "tomorrow",
      });
      const t = tomorrowFocusTrustMessage(text);
      logMomentum("move", `Tomorrow focus: ${text.slice(0, 60)}`);
      return trust(
        `Added to Tomorrow's Focus List.`,
        t.savedWhere,
        t.seeWhere,
        route,
      );
    }
    case "time-block": {
      const blocks = saveTimeBlock({
        title: text.slice(0, 120),
        date: "",
        durationMin: entry.estimateMin ?? 30,
        projectId: entry.projectId,
      });
      const block = blocks.find((b) => b.title === text.slice(0, 120));
      updateBrainDump(entry.id, {
        routedAction: "time-block",
        schedulingIntent: "week",
      });
      logMomentum("start", `Time block: ${text.slice(0, 60)}`);
      return trust(
        `Added to Time Bank: "${text}"`,
        "Time Bank",
        "Open **Time Bank** to schedule it on your calendar.",
        route,
      );
    }
    case "reminder": {
      updateBrainDump(entry.id, {
        actionType: "reminder",
        schedulingIntent: "today",
        routedAction: "reminder",
      });
      logMomentum("capture", `Reminder: ${text.slice(0, 60)}`);
      return trust(
        `Saved as a reminder: "${text}"`,
        "Clear My Mind",
        "Find it in **Clear My Mind** under Reminders / Today.",
        route,
      );
    }
    case "task": {
      if (entry.projectId) {
        saveProjectItem({
          projectId: entry.projectId,
          kind: "task",
          title: text.slice(0, 200),
        });
        updateBrainDump(entry.id, {
          actionType: "task",
          routedAction: "task",
          done: true,
        });
        logMomentum("move", `Task: ${text.slice(0, 60)}`);
        return trust(
          `Added as a task: "${text}"`,
          "Projects → Tasks",
          "Open **Projects** and check the Tasks section on that project.",
          route,
        );
      }
      updateBrainDump(entry.id, {
        actionType: "task",
        schedulingIntent: "today",
        routedAction: "task",
      });
      logMomentum("move", `Task: ${text.slice(0, 60)}`);
      return trust(
        `Marked as a task: "${text}"`,
        "Clear My Mind",
        "It stays in **Clear My Mind** with the Task tag — link a project anytime.",
        route,
      );
    }
    case "parking-lot": {
      updateBrainDump(entry.id, {
        actionType: "someday",
        schedulingIntent: "later",
        routedAction: "parking-lot",
      });
      logMomentum("capture", `Parked: ${text.slice(0, 60)}`);
      return trust(
        `Parked for later: "${text}"`,
        "Clear My Mind → Parking Lot",
        "Find it anytime in **Clear My Mind** (Later / Someday).",
        route,
      );
    }
    case "project": {
      const list = saveProject({
        name: text.slice(0, 60),
        goal: "",
        horizon: "soon",
      });
      const project = list[0];
      if (project) {
        updateBrainDump(entry.id, {
          projectId: project.id,
          routedAction: "project",
          done: true,
        });
      }
      logMomentum("move", `New project: ${text.slice(0, 60)}`);
      return trust(
        `Created project: "${project?.name ?? text.slice(0, 60)}"`,
        "Projects",
        "Open **Projects** to add outcome, tasks, and next steps.",
        route,
      );
    }
    case "focus": {
      updateBrainDump(entry.id, {
        actionType: "task",
        schedulingIntent: "today",
        routedAction: "focus",
      });
      logMomentum("start", `Focus: ${text.slice(0, 60)}`);
      return trust(
        `Ready for a focus session: "${text}"`,
        "Focus Session",
        "Open **Focus Session** — your item is tagged for today.",
        route,
      );
    }
    case "done": {
      updateBrainDump(entry.id, { done: true, routedAction: "done" });
      logMomentum("complete", `Cleared: ${text.slice(0, 60)}`);
      return trust(
        `Marked done: "${text}"`,
        "Clear My Mind",
        "It moves out of your active list.",
        route,
      );
    }
    default:
      return {
        ok: false,
        headline: "Unknown action.",
        savedWhere: "",
        seeWhere: "",
        route,
      };
  }
}
