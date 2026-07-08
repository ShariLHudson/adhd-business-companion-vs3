/**
 * Conversation-first UI language — no legacy menu/sidebar directions.
 * @see docs/protocols/OLD_UI_REFERENCE_CLEANUP_PROTOCOL.md
 */

/** GPT / companion must not direct members to removed chrome. */
export const BANNED_UI_REFERENCE_HINT = `NEVER tell the member to use a menu, sidebar, dropdown beside chat, templates menu, tools menu, feature menu, dashboard menu, or to "click" / "select from" navigation chrome that no longer exists.
Conversation first: understand what they want, offer the closest working action, and guide in natural language.
If a workspace did not open: offer to try again in chat — do NOT point to a menu.`;

export function workspaceOpenFailureMessage(title: string): string {
  return (
    `I tried to open **${title}** but it didn't appear on screen. ` +
    `Tell me to try again, or say what you'd like to work on and we'll open it together.`
  );
}

export function panelOpenFailureMessage(label: string): string {
  return (
    `I tried to open ${label}, but it didn't appear on screen. ` +
    `Tell me to try again, or describe what you'd like to create and we'll start together.`
  );
}

export const SPLIT_PANEL_CONVERSATION_HINT =
  "works best on its own screen. Tell me when you're ready to open it — chat stays here when you return.";
