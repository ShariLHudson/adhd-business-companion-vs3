# 296 — Canonical Business & Relationship Objects

## Purpose

Define the shared objects representing businesses, people, audiences, clients, partners, vendors, and relationships.

## Business

Represents one business, organization, practice, brand, or operating entity.

Core fields:

- business_id
- owner_user_id
- name
- legal_name
- business_type
- industry
- description
- business_model
- stage
- mission
- vision
- values
- active_status
- primary_location_id
- service_area_ids
- parent_business_id
- created_at
- updated_at

Relationships:

- Business DNA
- locations
- people
- avatars
- offers
- products
- services
- clients
- vendors
- partners
- Projects
- Create artifacts
- goals
- metrics

## Person

Represents an individual once, regardless of how many roles they hold.

Core fields:

- person_id
- name
- preferred_name
- contact methods
- communication preferences
- accessibility preferences
- privacy classification
- consent records
- status

Possible roles:

- client contact
- customer
- candidate
- worker
- employee
- contractor
- vendor contact
- partner contact
- speaker
- attendee
- member
- coach
- learner
- stakeholder

Role-specific information belongs in relationship objects, not duplicate person records.

## Organization

Represents an external company, nonprofit, association, agency, institution, or group.

Relationships may include:

- client organization
- vendor organization
- partner organization
- sponsor
- venue
- employer
- distributor
- franchisee
- property owner
- carrier

## Business DNA

Represents the business’s reusable identity and decision context.

Fields include:

- positioning
- differentiators
- brand promise
- voice
- tone
- terminology
- prohibited phrasing
- values
- decision principles
- risk posture
- customer experience principles
- quality standards
- growth preferences

## Client Avatar

Represents a reusable audience model.

Fields include:

- avatar_id
- business_id
- name
- description
- goals
- needs
- frustrations
- objections
- buying triggers
- context
- communication preferences
- accessibility considerations
- evidence basis
- version
- status

## Relationship

Represents a typed connection between two objects.

Required fields:

- relationship_id
- source_object_id
- target_object_id
- relationship_type
- role
- status
- start_date
- end_date
- context
- source
- permissions
- updated_at

Examples:

- person is client contact for organization
- organization is vendor for business
- person is worker assigned to client
- member belongs to community
- client uses offer
- partner represents product
- location belongs to business

## Client Account

Represents the commercial or service relationship with a client.

Fields:

- client_account_id
- business_id
- person_id or organization_id
- relationship owner
- lifecycle stage
- selected avatar reference
- active offers
- agreements
- Projects
- service history
- communication preferences
- health status
- privacy policy
- archive state

## Vendor Account

Fields:

- vendor_account_id
- business_id
- person or organization
- categories
- approved status
- terms
- performance
- risk
- documents
- active services
- contact roles

## Partner Account

Supports:

- referral partners
- channel partners
- sponsors
- affiliates
- collaborators
- franchisees
- distributors

Fields:

- partner_account_id
- partner type
- tier
- territory
- agreement references
- benefits
- responsibilities
- opportunities
- performance
- status

## Team Member and Role Assignment

A Person becomes a team member through a role assignment.

Fields:

- role_assignment_id
- business_id
- person_id
- role
- authority
- permissions
- capacity
- schedule
- manager
- start and end dates
- employment or contract classification reference
- status

## Context isolation

Every relationship object must include:

- business_id
- authorized viewers
- privacy classification
- permitted reuse
- client confidentiality restrictions
- data retention rules

No relationship context may leak across businesses or clients.
