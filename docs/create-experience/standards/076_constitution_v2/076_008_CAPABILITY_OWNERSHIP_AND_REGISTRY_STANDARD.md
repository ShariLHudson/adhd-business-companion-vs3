# 076 — Capability Ownership and Registry Standard

## 1. Purpose

Define how shared capabilities are registered, owned, versioned, consumed, and certified.

## 2. Required Registry Fields

```ts
type CapabilityRegistryEntry = {
  capabilityId: string;
  name: string;
  owner: string;
  version: string;
  status: "proposed" | "active" | "deprecated" | "retired";
  inputs: string[];
  outputs: string[];
  commands: string[];
  events: string[];
  permissions: string[];
  consumers: string[];
  certificationSuite: string;
  replacementCapabilityId?: string;
};
```

## 3. Ownership Rules

Every capability has one canonical owner.

Consumers may not copy implementation into local code.

## 4. Core Capability Families

- Identity
- Classification
- Workspace
- Editing
- Persistence
- Versioning
- Research
- Thinking Assistance
- Review
- Output
- Lifecycle
- Projects
- Chamber
- Board
- Knowledge
- Cartography
- Automation
- Analytics

## 5. Adoption

A consumer adopts a capability only when it:

- calls the shared implementation;
- uses the shared contract;
- passes the shared certification;
- removes conflicting local paths.

A similar-looking local feature does not count.

## 6. Versioning

Breaking changes require:

- new major version;
- migration adapter;
- consumer impact report;
- deprecation period;
- certification update.

## 7. Registry Governance

The registry must be machine-readable and human-readable.

CI should detect:

- unknown capabilities;
- duplicate owners;
- deprecated usage;
- missing certification;
- local forks.
