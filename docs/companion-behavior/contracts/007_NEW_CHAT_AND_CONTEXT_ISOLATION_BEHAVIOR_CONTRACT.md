# New Chat and Context Isolation Behavior Contract

## User Expectation

A new chat is truly new. Unrelated temporary context must not follow the person.

## Required Behavior

- create a new conversation identity
- clear pending answers and selections
- clear temporary workflow state
- clear unconfirmed turn-level inferences
- preserve only appropriate long-term memory and saved work
- never import an unrelated active noun such as a proposal, client, or project
- allow the person to explicitly resume saved work later

## Prohibited Behavior

- old pending menu resolves in the new chat
- unrelated prior project appears
- Shari says “continue where we left off” without relevant evidence
- yesterday's temporary emotional state becomes today's assumption
- new chat deletes saved projects or confirmed long-term memory

## Required Decision Rule

Current-turn evidence and current-conversation state outrank historical information.

Historical information may contribute only when:

- explicitly requested
- clearly relevant
- confirmed active
- presented as a suggestion rather than assumed fact when ambiguity exists

## Definition of Success

A fresh message receives a response that contains no unrelated temporary context while still allowing intentional access to saved work.
