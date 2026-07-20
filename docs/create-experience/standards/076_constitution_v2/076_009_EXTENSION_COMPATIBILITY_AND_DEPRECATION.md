# 076 — Extension, Compatibility, and Deprecation Standard

## 1. Extension Rule

Extensions may add:

- domain templates;
- specialized validation;
- additional metadata;
- specialized research prompts;
- custom views;
- domain-specific outputs.

Extensions may not replace:

- Work ID;
- persistence;
- routing authority;
- editing;
- versioning;
- recovery;
- lifecycle semantics.

## 2. Compatibility Levels

- Level A: fully compatible
- Level B: compatible through adapter
- Level C: migration required
- Level D: prohibited conflict

## 3. Extension Registration

Every extension declares:

- parent capability;
- consumer;
- added fields;
- added commands;
- added views;
- permissions;
- migration;
- certification.

## 4. Deprecation

A deprecation must include:

- replacement;
- migration;
- deadline;
- telemetry;
- member impact;
- rollback;
- documentation.

## 5. No Silent Removal

A capability with persisted member work may not be removed without data migration and resume validation.

## 6. Compatibility Certification

Test:

- old work opens;
- Work IDs persist;
- titles persist;
- versions persist;
- linked Projects persist;
- research citations persist;
- outputs remain valid.
