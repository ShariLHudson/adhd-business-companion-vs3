# 320 — Constitutional Authority Matrix

## Purpose

Provide a concise implementation reference for constitutional ownership.

| Concept | Constitutional Owner | Allowed Extensions | Prohibited Duplicate |
|---|---|---|---|
| Work identity | Universal Work Engine | Blueprint, Chamber, Board, Create, Project metadata | separate Work IDs |
| Work Type | Universal Work Type Registry | Blueprint metadata, taxonomy, aliases | separate Blueprint registry |
| Creation runtime | Universal Create | Blueprint templates and orchestration | Blueprint create runtime |
| Created content | Create Artifact | versions, relationships, exports | copied Project content |
| Execution | Projects | industry fields, views | Blueprint Project model |
| Tasks | Canonical Task | checklist templates, source links | event or Blueprint task system |
| Relationships | Relationship Registry | new registered relationship types | local relationship stores |
| Business | Canonical Business | industry extensions | separate business profiles |
| Business context | Business Profile and Business DNA | Blueprint context resolution | session-owned canonical copies |
| Audience | Client Avatar | Blueprint selection and local overrides | duplicate avatars |
| Person | Person | role assignments | client/employee/person copies |
| Client relationship | Client Account | engagement extensions | separate client tables |
| Offers | Offer/Product/Service/Package | industry extensions | local commercial models |
| Pricing | Pricing Model | scenario templates | free-text authoritative price |
| Commercial records | Opportunity through Subscription | workflow extensions | parallel sales records |
| Routing | Global routing | Blueprint route configuration | separate Blueprint router |
| Runtime context | Universal Work context envelope | context resolvers | second context envelope |
| Certification | Universal Work Type Certification | required modules | separate certification owner |
| Metrics | Metric Definition and Observation | dashboard projections | duplicate metric logic |
| Knowledge | Intelligence Library and Knowledge Item | approved domain knowledge | isolated member knowledge stores |
| Decisions | Decision | Board and Chamber contributions | separate Board decision store |

## Use rule

Any implementation that does not fit this matrix must be reviewed before coding.
