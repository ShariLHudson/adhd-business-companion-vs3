# Master Canonical Field Registry

**Standard:** 274 Canonical Business Context Schema
**Generated:** 2026-07-21

Maps to existing Business Estate / DNA / avatar / offer stores — not a second profile database.

| Field ID | Entity | Name | Required | Source of truth |
|---|---|---|---|---|
| `business.business_id` | business | Business ID | yes | Business Profile |
| `business.name` | business | Business name | yes | Business Profile |
| `business.type` | business | Business type | yes | Business Profile |
| `business.description` | business | Description | yes | Business Profile |
| `business.business_model` | business | Business model | no | Business Profile |
| `business.stage` | business | Stage | no | Business Profile |
| `business.location` | business | Location | no | Business Profile |
| `business.service_area` | business | Service area | no | Business Profile |
| `business.channels` | business | Channels | no | Business Profile |
| `business.mission` | business | Mission | no | Business Profile |
| `business.vision` | business | Vision | no | Business Profile |
| `business.values` | business | Values | no | Business Profile |
| `business.goals` | business | Goals | no | Business Profile |
| `business.constraints` | business | Constraints | no | Business Profile |
| `business_dna.positioning` | business_dna | Positioning | no | Business DNA |
| `business_dna.tone` | business_dna | Tone | no | Business DNA |
| `business_dna.voice` | business_dna | Voice | no | Business DNA |
| `client_avatar.avatar_id` | client_avatar | Avatar ID | yes | People I Help / Client Avatar |
| `client_avatar.name` | client_avatar | Avatar name | yes | People I Help / Client Avatar |
| `client_avatar.description` | client_avatar | Avatar description | no | People I Help / Client Avatar |
| `client_avatar.goals` | client_avatar | Avatar goals | no | People I Help / Client Avatar |
| `client_avatar.frustrations` | client_avatar | Avatar frustrations | no | People I Help / Client Avatar |
| `offer.offer_id` | offer | Offer ID | yes | Offers |
| `offer.name` | offer | Offer name | yes | Offers |
| `offer.description` | offer | Offer description | no | Offers |
| `product_or_service.item_id` | product_or_service | Product/service ID | yes | Products & Services |
| `product_or_service.name` | product_or_service | Product/service name | yes | Products & Services |
| `brand.brand_voice` | brand | Brand voice | no | Brand Context |
| `brand.tone` | brand | Brand tone | no | Brand Context |
| `blueprint_session.business_id` | blueprint_session | Session business | yes | Blueprint Context Envelope |
| `blueprint_session.selected_avatar_ids` | blueprint_session | Selected avatars | no | Blueprint Context Envelope |
| `blueprint_session.selected_offer_ids` | blueprint_session | Selected offers | no | Blueprint Context Envelope |
| `blueprint_session.current_goal` | blueprint_session | Current goal | no | Blueprint Context Envelope |

**Total fields:** 33
