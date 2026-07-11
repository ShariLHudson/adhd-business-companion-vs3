import type { TeamHubSection } from "../types";
import { sampleTeamHubRepository } from "../repositories";

function toSection(
  id: string,
  title: string,
  items: { id: string; title: string; meta?: string }[],
): TeamHubSection {
  return { id, title, items };
}

export function getProjects() {
  return sampleTeamHubRepository.listProjects();
}

export function getApprovals() {
  return sampleTeamHubRepository.listApprovals();
}

export function getAssignments() {
  return sampleTeamHubRepository.listAssignments();
}

export function getWaitingItems() {
  return sampleTeamHubRepository.listWaitingItems();
}

export function getCompleted() {
  return sampleTeamHubRepository.listCompleted();
}

export function getMyTasks() {
  return sampleTeamHubRepository.listMyTasks();
}

/** Full Team Hub layout sections for the execution layer UI. */
export function getTeamHubSections(): TeamHubSection[] {
  return [
    toSection(
      "active-projects",
      "Active Projects",
      getProjects().map((p) => ({
        id: p.id,
        title: p.title,
        meta: p.meta,
      })),
    ),
    toSection(
      "my-tasks",
      "My Tasks",
      getMyTasks().map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.meta,
      })),
    ),
    toSection(
      "waiting-shari",
      "Waiting for Shari",
      sampleTeamHubRepository
        .listWaitingItems()
        .filter((t) => t.lane === "waiting-shari")
        .map((t) => ({ id: t.id, title: t.title, meta: t.meta })),
    ),
    toSection(
      "waiting-izna",
      "Waiting on Izna",
      sampleTeamHubRepository
        .listWaitingItems()
        .filter((t) => t.lane === "waiting-izna")
        .map((t) => ({ id: t.id, title: t.title, meta: t.meta })),
    ),
    toSection(
      "waiting-cursor",
      "Waiting on Cursor",
      sampleTeamHubRepository
        .listWaitingItems()
        .filter((t) => t.lane === "waiting-cursor")
        .map((t) => ({ id: t.id, title: t.title, meta: t.meta })),
    ),
    toSection(
      "approvals",
      "Approvals",
      getApprovals().map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.meta,
      })),
    ),
    toSection(
      "assets",
      "Assets",
      sampleTeamHubRepository.listAssets().map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.meta,
      })),
    ),
    toSection(
      "social-queue",
      "Social Media Queue",
      sampleTeamHubRepository.listSocialQueue().map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.meta,
      })),
    ),
    toSection(
      "completed",
      "Completed This Week",
      getCompleted().map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.meta,
      })),
    ),
  ];
}
