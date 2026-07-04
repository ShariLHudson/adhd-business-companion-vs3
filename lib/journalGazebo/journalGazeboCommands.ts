/**
 * Conversation → Journal Gazebo UI bridge (in-room actions).
 */

export type JournalGazeboCommandKind =
  | "open_journal"
  | "create_journal"
  | "resume_journal"
  | "open_writing_tools";

export type JournalGazeboCommand = {
  kind: JournalGazeboCommandKind;
};

let pendingCommand: JournalGazeboCommand | null = null;
const listeners = new Set<() => void>();

export function requestJournalGazeboCommand(command: JournalGazeboCommand): void {
  pendingCommand = command;
  for (const listener of listeners) listener();
}

export function consumeJournalGazeboCommand(): JournalGazeboCommand | null {
  const command = pendingCommand;
  pendingCommand = null;
  return command;
}

export function subscribeJournalGazeboCommands(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
