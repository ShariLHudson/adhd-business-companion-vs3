# 191 — Grounded Acknowledgement & Context Rule

## Purpose

Block vague acknowledgements that do not prove Shari understood the user’s subject (e.g. “That seems like an important part of this”).

## Pipeline order

1. Explicit help  
2. CRCI (repair)  
3. RCI (when reflective)  
4. Situation lead  
5. CI delivery  
6. **Grounded Acknowledgement (191)**  
7. CQRI rhythm + quality gate  
8. Send  

## Module

`lib/conversationalIntelligence/groundedAcknowledgement.ts`

### Failure codes

- `GENERIC_ACKNOWLEDGEMENT`
- `MISSING_TOPIC_REFERENCE`
- `VAGUE_PRONOUN`
- `EMPTY_EMPATHY`
- `USER_WORDING_ECHO`
- `UNRELATED_NEXT_QUESTION`

### Wired in

- `lib/talkItOut/reflectiveEngine.ts` (repair + main)
- `lib/createBuilderChat.ts` (`polishCreateReply`)
- CQRI shells: `applyRhythm.ts`, `observationVsQuestion.ts`, `safeFallback.ts`, `qualityGate.ts`

## Rule of thumb

If the acknowledgement could be pasted into an unrelated conversation unchanged, reject it and use a grounded fallback.
