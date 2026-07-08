# Momentum Intelligence Library — Manifest

The manifest is the authoritative registry of what Momentum Intelligence owns, what it never owns, and how each document maps to a single concept. It is the ownership contract for the library.

## Library identity

- **Library:** Momentum Intelligence
- **Owner:** Momentum Intelligence
- **Authority:** Foundational Intelligence Library within the Visual Spark Studios™ ecosystem
- **Governed by:** `FND-000_INTELLIGENCE_LIBRARY_STANDARD.md`, `INTELLIGENCE_LIBRARY_ARCHITECTURE.md`, `FND-002_DOCUMENT_RELATIONSHIPS.md`, `FND-003_AUTHORITY_HIERARCHY.md`

## Ownership contract

### Momentum Intelligence owns

| Concept | Owning document |
|---------|-----------------|
| Meaningful movement (definition) | MOM-001, MOM-120 |
| Momentum creation | MOM-106 |
| Momentum protection | MOM-110 |
| Momentum recovery | MOM-114 |
| Progress continuity | MOM-113 |
| Sustainable momentum | MOM-122 |
| Momentum patterns | MOM-136 |
| Momentum recommendations (what to recommend, not delivery wording) | MOM-137 |

### Momentum Intelligence never owns

| Concept | Authoritative owner |
|---------|--------------------|
| Executive function domains + definitions | Executive Function Intelligence — EXF-001 |
| Decision frameworks | Decision Intelligence |
| Conversation behavior + wording | Conversation Intelligence |
| Founder strategy | Founder Intelligence |
| Knowledge management + memory storage | Knowledge Management |
| Recommendation delivery wording | Recommendation Intelligence |
| UI / application implementation | Product layer |

When a Momentum document needs one of these concepts, it **references** the owning document. It does not restate, redefine, or replace it.

## One document, one concept

Every Momentum document owns exactly one concept. No two documents define the same idea. Where two documents touch the same territory (for example, MOM-113 Progress Continuity and MOM-122 Sustainable Momentum), one owns the concept and the other references it.

## Collaboration documents

Collaboration documents (MOM-130 through MOM-135) are relationship documents. They never redefine either collaborating library. Each answers only:

1. Why do these libraries collaborate?
2. What information is exchanged?
3. What does each library own?
4. What does each library never own?
5. How does the collaboration improve reasoning?

**Binding note for MOM-133:** Executive Function is defined solely by Executive Function Intelligence (EXF-001). MOM-133 references EXF-001 and related EXF documents and must not restate the eleven executive domains (Task Initiation, Planning, Working Memory, Organization, Prioritization, Attention Management, Time Awareness, Transitions, Self-Monitoring, Emotional Self-Regulation, Execution).

## Document registry

The full list of documents, bands, and status is maintained in `INDEX.md`. The dated history of additions and revisions is maintained in `CHANGELOG.md`. Build order and remaining work are in `ROADMAP.md`.

## Revision rule

If any Momentum document is found to define another library's concept, it is revised into a relationship/reference document rather than left as a duplicate. Duplication is treated as a defect.
