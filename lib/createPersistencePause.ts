/** Blocks panel/chat sync from writing storage during delete or teardown. */

let persistencePaused = false;

export function pauseCreatePersistence(): void {
  persistencePaused = true;
}

export function resumeCreatePersistence(): void {
  persistencePaused = false;
}

export function isCreatePersistencePaused(): boolean {
  return persistencePaused;
}
