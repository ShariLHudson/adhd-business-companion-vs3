# Conversation State Stability Protocol

Fix dropped characters, lost messages, response replacement, and unexpected state changes.

Separate:
- user input state
- assistant response state
- estate navigation state
- workflow state
- feature mode state

Audit input handlers, streaming responses, and state synchronization.

Success:
A generated response cannot be replaced after completion.
Typing cannot trigger navigation or message loss.
