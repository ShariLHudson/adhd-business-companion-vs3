/**
 * 066 — Active Creation Destination session.
 * While active, companion chat is dormant (Spec 109 Living Places unchanged).
 */

export type ActiveCreationSession = {
  creationId: string;
  startedAt: string;
  /** Always true while session active — chat must not compete */
  companionDormant: true;
};

let activeSession: ActiveCreationSession | null = null;

export function beginCreationDestinationSession(creationId: string): void {
  if (!creationId.trim()) return;
  activeSession = {
    creationId: creationId.trim(),
    startedAt: new Date().toISOString(),
    companionDormant: true,
  };
}

export function endCreationDestinationSession(): void {
  activeSession = null;
}

export function getActiveCreationDestinationSession(): ActiveCreationSession | null {
  return activeSession;
}

export function isCreationDestinationSessionActive(): boolean {
  return Boolean(activeSession?.creationId);
}

/** Companion chat must not capture, ask, or advance Creation. */
export function isCompanionDormantForCreation(): boolean {
  return isCreationDestinationSessionActive();
}

/** May show frosted/SimpleChat overlay during Creation? Always false while session active. */
export function mayShowCompanionChatDuringCreation(): boolean {
  return !isCreationDestinationSessionActive();
}

/**
 * Hard gate — Creation Destinations have no companion side panel.
 * Call before any setEstateRoomChatVisible(true) / split / frosted mount.
 */
export function forbidCompanionSidePanelDuringCreation(): boolean {
  return isCreationDestinationSessionActive();
}

/** Test helper */
export function clearCreationDestinationSessionForTests(): void {
  activeSession = null;
}
