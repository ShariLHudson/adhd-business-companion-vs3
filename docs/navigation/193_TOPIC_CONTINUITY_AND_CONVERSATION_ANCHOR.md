# 193 — Topic Continuity & Conversation Anchor Intelligence (TCAI)

## Principle

The user’s established topic stays stable until they clearly change it. Clarification, short replies, and stop words never overwrite the Topic Anchor.

## Module

`lib/topicContinuityAnchorIntelligence/`

## Pipeline

1. Load Topic Anchor  
2. Explicit topic change  
3. Direct correction (192)  
4. Clarification → topic-safe repair  
5. CRCI / RCI  
6. CI → Grounded Ack → **Topic continuity** → CQRI → send  

## Failure codes

`TOPIC_ANCHOR_MISSING` · `TOPIC_OVERWRITTEN_BY_CLARIFICATION` · `STOP_WORD_AS_TOPIC` · `PRONOUN_AS_TOPIC` · `SHORT_REPLY_AS_TOPIC` · `TOPIC_DRIFT` · `UNRELATED_RESPONSE_SUBJECT` · `REPAIR_LOST_TOPIC` · `UNCONFIRMED_TOPIC_CHANGE`
