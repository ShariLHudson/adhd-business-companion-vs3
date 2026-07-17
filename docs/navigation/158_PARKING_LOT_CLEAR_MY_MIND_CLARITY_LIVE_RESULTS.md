# 158 — Parking Lot and Clear My Mind Clarity (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until live differentiation is verified.

## Root cause

Clear My Mind and Parking Lot shared “capture / save for later” language. The Park It activity (`brain-parking-lot`) incorrectly linked into Clear My Mind (`brain-dump`).

## What shipped

| Experience | Purpose | CTA |
|------------|---------|-----|
| Clear My Mind | Empty everything competing for attention | Start Emptying My Mind |
| Park It | Save one thing for later | Park This Item |
| Parking Lot | Review parked items + actions | destination |

- Park It activity routes to `parking-lot`
- Distinct blurbs in focus tools, Help Me Choose, helpful lessons, object registry
- Parking Lot How Do I explains the relationship

## Automated tests

`clearMyMindParkingLotClarity` + focusToolDefinitions + parkingLotDestination — **passed**
