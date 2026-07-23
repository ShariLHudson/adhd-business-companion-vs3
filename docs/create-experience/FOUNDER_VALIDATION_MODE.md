# Founder Validation Mode

**Route:** `/founder/validation` (requires founder-admin login)  
**Runtime:** `lib/founderValidationMode/` · `components/founder/FounderValidationMode.tsx`  
**Evidence:** `docs/create-experience/evidence/`

## Mission

Allow the founder to execute every certification journey (J-001–J-008 and TRUST) inside the live platform — repeatable, trustworthy, simple.

Architecture remains frozen. No member-facing UI.

## Flow

1. Overview — current certification status for all journeys  
2. One journey — success criteria before start  
3. Run in Companion (authenticated)  
4. Record pass/fail + notes + screenshot references  
5. Evidence saved under `docs/create-experience/evidence/runs/…`  
6. Living dashboard updates from overlays  
7. **Explicit approval** required before certification status changes  
8. **CERTIFIED** only if founder types `I APPROVE CERTIFIED` (browser + emotional PASS)

## Non-negotiables

- Never mark CERTIFIED automatically  
- Never visible to normal members  
- Pass alone does not CERTIFY  
- Skip approval keeps evidence; certification status unchanged  
