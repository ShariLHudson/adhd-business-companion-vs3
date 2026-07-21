# 297 — Canonical Offer, Commerce & Financial Objects

## Purpose

Define reusable structures for offers, products, services, pricing, proposals, agreements, orders, invoices, payments, and subscriptions.

## Offer

Represents a packaged promise of value.

Fields:

- offer_id
- business_id
- name
- category
- description
- audience_ids
- outcomes
- included items
- exclusions
- delivery model
- duration
- capacity requirements
- pricing references
- status
- version

## Product

Represents a sellable physical or digital item.

Fields:

- product_id
- business_id
- name
- description
- product type
- SKU
- category
- variants
- audience_ids
- pricing
- cost
- inventory behavior
- fulfillment requirements
- vendor references
- lifecycle status

## Service

Represents a defined service.

Fields:

- service_id
- business_id
- name
- description
- service category
- scope
- exclusions
- delivery method
- duration
- location requirements
- staffing requirements
- pricing
- status

## Package

Combines offers, products, services, benefits, or access.

Fields:

- package_id
- included object references
- quantity or limits
- price
- duration
- eligibility
- availability
- version

## Pricing Model

Fields:

- pricing_model_id
- business_id
- model type
- currency
- assumptions
- cost inputs
- margin target
- pricing rules
- fees
- discounts
- taxes
- effective dates
- approval state
- version

Supported pricing patterns:

- fixed fee
- hourly
- daily
- unit based
- tiered
- package
- retainer
- subscription
- usage based
- rental period
- commission
- royalty
- markup
- value informed
- custom quote

## Opportunity

Represents a potential sale, engagement, booking, placement, partnership, or transaction.

Fields:

- opportunity_id
- business_id
- client_account_id
- interested offer IDs
- stage
- estimated value
- probability
- decision date
- owner
- next action
- source
- risks
- status

## Proposal

Fields:

- proposal_id
- opportunity_id
- client_account_id
- selected offers
- scope
- deliverables
- timeline
- pricing_model_id
- payment schedule
- assumptions
- exclusions
- approval state
- version
- expiration date

## Agreement

Represents a signed or approved governing agreement.

Fields:

- agreement_id
- proposal_id
- parties
- terms summary
- scope
- dates
- pricing
- renewal
- termination
- documents
- professional review status
- approval and signature records
- status

## Order or Booking

Fields:

- order_id
- client_account_id
- product, service, package, event, reservation, or rental references
- quantities
- dates
- location
- price
- taxes and fees
- fulfillment status
- payment status
- cancellation status

## Invoice

Fields:

- invoice_id
- client_account_id
- agreement or order references
- line items
- issue date
- due date
- currency
- tax
- discounts
- balance
- status
- payment references

## Payment

Fields:

- payment_id
- invoice_id
- amount
- date
- method
- external transaction reference
- allocation
- refund status
- reconciliation state

## Subscription

Fields:

- subscription_id
- client_account_id
- package or offer
- billing cadence
- service cadence
- start date
- next renewal
- quantity
- price
- pause status
- cancellation status
- churn reason
- status

## Financial integrity rules

- calculations must be reproducible
- assumptions must be visible
- currency must be explicit
- historical pricing must remain linked to historical transactions
- price changes must use effective dates
- no Blueprint may silently recalculate an approved proposal
- payments must never be fabricated
- external payment status must be labeled by sync state
- regulated financial conclusions require qualified review
