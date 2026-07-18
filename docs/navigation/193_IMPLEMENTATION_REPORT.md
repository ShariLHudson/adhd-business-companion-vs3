# 193 Implementation Report — TCAI

## Root cause

1. `extractLiteralTopic` / grounded fallback treated “What does that mean?” as a topic source.
2. Token “does” survived stop-word filtering (length ≥ 4, not in STOP).
3. Fallback line: “You are working through something around ${topic}.”
4. CRCI did not match “What does that mean?”

## Fix

Protected Topic Anchor on Thinking Map; clarification/short replies update focus or lastClarificationRequest only; topic-safe repair; continuity gate before CQRI.

## Deploy

Do **not** deploy until authenticated smoke passes (hire open → What does that mean? → What? → Cost → topic change → resume).
