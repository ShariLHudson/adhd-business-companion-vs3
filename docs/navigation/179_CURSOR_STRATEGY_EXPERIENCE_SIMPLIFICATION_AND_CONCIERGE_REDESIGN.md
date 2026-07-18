# 179_CURSOR_STRATEGY_EXPERIENCE_SIMPLIFICATION_AND_CONCIERGE_REDESIGN.md

# Cursor Implementation Prompt — Strategy Experience Simplification & Concierge Redesign

## Purpose

Redesign the current ADHD Entrepreneur Strategy Library experience.

The current screen feels like a knowledge library instead of a calm companion.

It presents too many choices, counts, accordions, categories, and strategy collections before the user has even explained what they need.

The result is unnecessary cognitive load and decision fatigue.

This redesign must preserve the underlying Strategy Library while dramatically simplifying the user experience.

Do not implement a visual refresh only.

Redesign the information architecture and conversation flow.

---

# Core Philosophy

Hide the library.

Expose the guidance.

The user should feel like they have a strategy concierge—not a database.

The Strategy Library remains the knowledge source behind the scenes.

Shari becomes the guide that helps users find the right strategy without making them browse first.

---

# New Opening

Replace the current wall of options with:

# Strategy Guide

Supporting text:

> Let's figure out what will help most today.

Do not show counts such as:

- ADHD Strategies (29)
- Business Strategies (23)
- Recommended (42)
- Saved (0)

Those are implementation details, not decisions the user needs immediately.

---

# First Question

Show one prompt:

**What do you need today?**

Use one dropdown.

Options:

- I'm stuck and need help
- I want ideas
- I know what I'm looking for
- Continue where I left off
- I'm not sure

No additional sections should compete with this first decision.

---

# Option Behavior

## I'm stuck and need help

Immediately begin a conversation.

Prompt:

> Tell Shari what's going on.

Shari should determine:

- ADHD challenge
- business challenge
- marketing
- sales
- mindset
- operations
- focus
- decision making
- something else

The user should never have to decide which strategy category applies before describing the situation.

---

## I want ideas

Show one dropdown:

**Browse by topic**

Suggested topics:

- Focus & Productivity
- Marketing Strategy
- Social Media
- Sales
- Content
- Clients
- Pricing
- Launches
- Operations
- Leadership
- Mindset
- ADHD

After a topic is chosen, display only that category.

Do not show every strategy family at once.

---

## I know what I'm looking for

Show:

Search strategies...

Replace the current search placeholder with:

> Describe what's going on...

Examples:

- I can't get started
- I'm avoiding sales
- I keep procrastinating
- I'm overwhelmed

Search should map natural language to strategies.

The user should not need to know the strategy's official name.

---

## Continue where I left off

Show only:

Saved strategies

Continue previous work

No educational content.

---

## I'm not sure

Start a short conversation.

Help the user determine what kind of strategy they need.

---

# Strategy Builder

Do not advertise Build My Strategy immediately.

Instead:

If no suitable strategy exists:

Offer:

> I don't think an existing strategy is quite right for your situation.

> Would you like us to build one together?

Only then reveal:

Build My Strategy

---

# Popular Strategies

Reduce the visual load.

Instead of many visible cards:

Show:

Popular right now

Dropdown or compact list.

Display no more than five strategies initially.

Offer:

See More

only if requested.

---

# Library Browsing

Hide the current accordions by default.

Do not immediately display:

- ADHD Strategies
- Business Strategies
- Situation Strategies
- Saved Strategies

Reveal these only after:

- a topic is selected
- a search is performed
- browsing is explicitly requested

---

# Decision Fatigue Rules

The Strategy experience should never ask the user to make more than one primary decision at a time.

Every screen should answer:

1. What is this?
2. What can I do next?
3. Why would I use this?

Everything else belongs behind progressive disclosure.

---

# Naming Review

Evaluate whether the user-facing title should remain:

ADHD Entrepreneur Strategy Library

Consider alternatives such as:

- Strategy Guide
- Find the Right Strategy
- Strategy Concierge
- Let's Find What Will Help

The internal library may retain its existing name.

Return recommendations without changing branding unless approved.

---

# Runtime Behavior

Once a strategy is selected:

Launch immediately into the guided strategy experience.

Do not leave the user on an informational page.

Every strategy should:

- explain briefly
- tailor to the user's situation
- walk through implementation
- save progress
- pause/resume
- connect to Projects, Reminders, or other experiences only when appropriate

---

# Required Audit

Return:

- current navigation flow
- current screen inventory
- duplicated sections
- unnecessary visible decisions
- recommended simplified flow
- revised information architecture
- renamed user-facing labels (if recommended)
- files requiring modification
- screenshots of before/after preview
- authenticated preview URL
- deploy or do-not-deploy recommendation

Do not implement until the proposed redesign is reviewed and approved.
