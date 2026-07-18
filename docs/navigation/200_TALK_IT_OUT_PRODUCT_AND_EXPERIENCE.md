# 200 — Talk It Out Product & Experience Standard

**Status:** Implemented · Opening + first-response certification in `lib/talkItOut/experienceStandard.ts`

## Product promise

Calm, grounded thinking conversation. No takeover, forced emotion, default coaching, or premature Estate redirects.

## Runtime

- Canonical opening: `TALK_IT_OUT_OPENING` / `isCanonicalOpening`
- First-response gate: `certifyFirstResponse`
- Resume re-entry: `buildTalkItOutReentry` + `needsReentry` on pause
