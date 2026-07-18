# Conversation Intelligence Engine (CIE)

Packages **195–199**. Shared orchestration for Spark Estate conversation.

```ts
import { processConversationTurn } from "@/lib/conversationIntelligenceEngine";

const result = processConversationTurn({
  conversationId,
  experienceId: "talk-it-out",
  userText,
  messages,
  priorState,
  draftText, // or generateDraft
  thinkingMap,
});
```

Experience modules own drafting. CIE owns state, plan, gold guidance, critical validation, repair, and telemetry.
