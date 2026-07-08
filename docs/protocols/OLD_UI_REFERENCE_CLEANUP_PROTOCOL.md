# Old UI Reference Cleanup Protocol

## Purpose

Remove outdated conversational references to removed interface elements. The app no longer uses the old menu/sidebar navigation model. The assistant must not tell users to use features that no longer exist.

## Current interaction model

**Conversation first.** The user talks naturally. The assistant guides the next step.

## Banned member-facing phrases

Do not instruct users to:

- look in the menu / choose from menu / click the menu
- open the sidebar / select from the sidebar
- use dropdown beside chat / templates menu / tools menu / feature menu / dashboard menu

## Examples

| Incorrect | Correct |
|-----------|---------|
| Look in the menu for Templates. | I can help you create a template. What would you like to make? |
| Choose Templates from the sidebar. | I can open the template creation process for you. |
| Pick a room from the menu. | Where would you like to go? |

## Implementation

- Shared language: `lib/conversationFirstLanguage.ts`
- System prompt: `lib/companionPrompt.ts`
- Feature how-to hints: `lib/appFeatureKnowledge.ts`
- Help articles: `lib/howDoIHelpArticles.ts`, `lib/howDoIContent.ts`

## Success criteria

A new user should never hear "You can find that in the menu" unless a real menu exists. The assistant describes the current Spark experience.
