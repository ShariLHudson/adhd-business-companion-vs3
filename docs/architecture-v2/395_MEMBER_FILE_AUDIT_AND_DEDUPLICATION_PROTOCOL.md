# 395 — Member File Audit & Deduplication Protocol

## Step 1 — Inventory

For the selected member, list every:

- handoff
- knowledge file
- routing file
- implementation file
- schema
- test file
- certification file
- maintenance file
- older revision
- cross-member file

## Step 2 — Classify

Mark each file:

- canonical
- extend
- merge candidate
- superseded
- duplicate
- cross-member future work
- do not upload
- needs verification

## Step 3 — Map

Map canonical files to the completion matrix.

## Step 4 — Identify genuine gaps

A gap exists only when:

- no canonical file owns the responsibility
- the responsibility belongs to this member
- it is not a shared architecture concern
- implementation requires explicit specification

## Step 5 — Finish

Create or extend only the missing files.

## Step 6 — Produce upload manifest

The final manifest must state:

- upload now
- retain for reference
- superseded
- exclude
- future shared work
