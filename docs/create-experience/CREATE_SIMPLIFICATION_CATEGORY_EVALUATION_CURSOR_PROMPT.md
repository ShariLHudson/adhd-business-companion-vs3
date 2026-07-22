# Spark Estate — Create Experience Simplification & Category Evaluation
## Cursor Implementation Prompt

# Mission

Simplify the Create experience so users can begin quickly without sorting through too many overlapping choices.

The current Explore Ideas area is doing too many jobs at once:

- continuing older work
- showing recent work
- searching for ideas
- filtering by source
- browsing individual ideas
- browsing categories

This creates unnecessary decision fatigue before the user has even started creating.

The new Create experience must:

- show fewer choices
- separate new work from previous work
- reduce repeated headings
- remove unnecessary filters from the default view
- evaluate every item inside every category
- combine overlapping items
- place variations inside a guided flow instead of making each variation a separate card
- preserve existing creations and drafts

---

# Core Rule

> Help the user begin creating before asking them to browse the full catalog.

The default Create screen should answer one question:

> What would you like to create?

---

# PART 1 — Simplify the Default Create Screen

Replace the current dense Explore Ideas layout with a simpler entry experience.

## Primary Section

# What would you like to create?

Use one clear search or description field.

Placeholder:

`Describe it or search ideas — e.g. email, workshop, client onboarding...`

The field should support both:

- typing a specific creation
- typing a general need

Examples:

- write an email to a client
- create a workshop
- plan a launch
- make a checklist
- I am not sure what I need

## Suggested Choices

Show no more than four common or personalized choices initially.

Example:

- Email
- Social Post
- Client Onboarding
- Workshop

These should adapt over time based on:

- user history
- recent activity
- business profile
- current projects
- common use

Do not show a large catalog by default.

## Primary Actions

Use:

- `Start Creating`
- `Help Me Choose`

Optional secondary action:

- `Browse More`

---

# PART 2 — Separate Previous Work

Do not mix previous work into the same visual block as idea discovery.

Create one separate collapsed section:

# Find Previous Work

Inside it, show only relevant groups:

- In Progress
- Recent
- Older Work

Do not show empty subsections.

If no previous work exists, show:

> Your saved creations will appear here.

Remove repeated headings such as:

- Continue Something
- Recent Work
- Previous Work
- Active work stays under Continue Working above

Use one clear place for previous work.

---

# PART 3 — Remove Default Filters

Remove these filters from the initial Create screen:

- All
- Spark Recommended
- Company
- Personal
- Recent
- Clear

Users should not have to decide where an idea came from before choosing it.

If source filtering is still useful, place it inside:

- Browse More
- search results
- or an advanced filter panel

Do not display source explanations by default.

---

# PART 4 — Browse More

When the user selects `Browse More`, show a short category list.

Recommended top-level categories:

1. Write & Communicate
2. Market & Sell
3. Work With Clients
4. Plan Something
5. Build the Business
6. Organize Information
7. Personal

Do not show dozens of category cards at once.

A category should open into a short curated list, not the entire catalog.

---

# PART 5 — Evaluate Every Existing Option

Audit every current Create option.

For each item, answer:

1. Is it genuinely different from the others?
2. Will the user understand the name immediately?
3. Does it need a full guided experience?
4. Does it belong in Create or Projects?
5. Is it too narrow to deserve its own card?
6. Does it duplicate another item?
7. Should it be a subtype inside a broader flow?

Do not preserve duplicates simply because they already exist.

---

# PART 6 — Consolidation Rules

## Combine Narrow Variations

Example:

Instead of separate cards for:

- Email
- Follow-Up Email
- Welcome Email
- Sales Email
- Reminder Email
- Thank-You Email

Use one card:

# Email

Then ask:

> What kind of email are you creating?

Possible choices:

- Follow-up
- Introduction
- Request
- Thank-you
- Sales
- Reminder
- Difficult message
- Other

The same rule applies to other categories.

## Use Parent Creation Types

Examples:

### Social Content

Subtypes:

- post
- caption
- carousel
- short video script
- announcement
- promotion

### Event

Subtypes:

- webinar
- workshop
- networking event
- launch event
- client event
- personal event

### Presentation

Subtypes:

- keynote
- training
- sales presentation
- webinar deck
- internal presentation

### Checklist

Subtypes:

- process checklist
- event checklist
- launch checklist
- client checklist
- personal checklist

---

# PART 7 — Recommended Category Structure

## 1. Write & Communicate

Parent creation types:

- Email
- Social Content
- Article or Blog
- Newsletter
- Presentation
- Script
- Message or Announcement

## 2. Market & Sell

Parent creation types:

- Marketing Campaign
- Offer
- Sales Funnel
- Lead Magnet
- Promotion
- Launch
- Sales Page

## 3. Work With Clients

Parent creation types:

- Client Onboarding
- Proposal
- Client Plan
- Follow-Up
- Feedback or Survey
- Client Communication
- Client Resource

## 4. Plan Something

Parent creation types:

- Event
- Workshop
- Meeting
- Course
- Webinar
- Launch Plan
- Speaking Engagement

## 5. Build the Business

Parent creation types:

- Strategy
- Process
- Standard Operating Procedure
- Business Plan
- Framework
- Policy
- Service or Offer Structure

## 6. Organize Information

Parent creation types:

- Checklist
- Guide
- Template
- Report
- Resource
- Reference Document
- Summary

## 7. Personal

Parent creation types:

- Personal Project
- Journal
- Life Plan
- Celebration
- Personal Event
- Routine
- Reflection

These are parent types, not final subtypes.

---

# PART 8 — Create vs. Projects Rule

Create and Projects must remain distinct but connected.

## Create

Use Create when the user wants to:

- write
- design
- plan
- outline
- build content
- develop a framework
- create a document
- shape an idea

## Projects

Use Projects when the user wants to:

- execute multiple steps
- track tasks
- manage deadlines
- manage dependencies
- monitor milestones
- coordinate ongoing work

Example:

- Create a workshop outline → Create
- Manage all tasks required to deliver the workshop → Projects

Do not duplicate creation content inside Projects.

Use a linked Create-to-Project handoff.

---

# PART 9 — Guided Flow Requirements

When a user chooses a parent creation type:

1. ask what specific type they need
2. ask one question at a time
3. use examples where helpful
4. keep optional details skippable
5. save progress automatically
6. allow editing
7. show a final creation
8. allow turning the result into a Project when appropriate

Do not show a long form with every field at once.

---

# PART 10 — Search Behavior

The search field should search:

- parent creation types
- subtypes
- plain-language phrases
- user-created items
- templates
- relevant examples

Search should understand natural language.

Examples:

`I need to follow up with a client`

Should suggest:

- Email → Follow-Up

`I want to plan a webinar`

Should suggest:

- Event → Webinar
or
- Presentation → Webinar Deck
depending on intent

When multiple results are possible, ask one clarifying question.

---

# PART 11 — Empty and Loading States

## No Previous Work

Show:

> Your saved creations will appear here.

## No Search Results

Show:

> I could not find an exact match, but I can still help you create it.

Primary action:

`Create From Scratch`

Secondary action:

`Help Me Choose`

## Loading

Use the Spark Estate loading experience.

Do not show blank sections.

---

# PART 12 — Visual Design

The Create screen should feel calm.

Use:

- one primary focal area
- large readable headings
- generous spacing
- no more than four initial suggestions
- progressive disclosure
- simple labels
- minimal explanatory text

Avoid:

- stacked filter rows
- long source explanations
- large idea grids
- repeated headings
- dense cards
- too many category choices at once

---

# PART 13 — Accessibility

- search field has a visible label
- all cards are keyboard accessible
- focus states are visible
- categories are not color-only
- large tap targets
- screen readers announce card names and descriptions
- collapsed sections use correct ARIA behavior
- mobile layout remains easy to scan

---

# PART 14 — Data Preservation

Preserve:

- existing creations
- drafts
- recent work
- saved templates
- user-created categories
- company-created items
- personal items

Do not delete data while simplifying the interface.

Map old narrow types into new parent creation types where possible.

Example:

- Follow-Up Email → Email / Follow-Up
- Welcome Email → Email / Welcome
- Email Sequence → Email / Sequence

Preserve the original subtype in metadata.

---

# PART 15 — Category Audit Deliverable

Create a complete audit of all current Create options.

For each existing item, record:

```ts
type CreateOptionAudit = {
  currentName: string;
  currentCategory?: string;
  keep: boolean;
  newParentType?: string;
  newSubtype?: string;
  renameTo?: string;
  mergeWith?: string[];
  moveToProjects?: boolean;
  reason: string;
};
```

The audit must identify:

- duplicates
- overlapping options
- unclear names
- narrow variations
- options that belong in Projects
- unsupported or unfinished flows

Do not finalize the category system without completing this audit.

---

# PART 16 — Testing

Test:

## Entry

- empty account
- account with previous work
- returning user
- mobile
- desktop

## Search

- exact item name
- plain-language request
- ambiguous request
- no result
- subtype search

## Previous Work

- no saved work
- one draft
- several drafts
- recent work
- older work

## Categories

- every parent category
- every parent creation type
- every subtype
- Create-to-Project handoff

## Accessibility

- keyboard navigation
- screen reader labels
- focus states
- collapsed sections
- mobile tap targets

---

# Acceptance Criteria

## Default Screen

- [ ] The screen asks: What would you like to create?
- [ ] One search or description field is visible.
- [ ] No more than four suggested choices appear initially.
- [ ] Help Me Choose is available.
- [ ] Browse More is optional.
- [ ] Source filters are not visible by default.

## Previous Work

- [ ] Previous work is separate from idea discovery.
- [ ] Empty subsections are hidden.
- [ ] Repeated headings are removed.
- [ ] Existing drafts remain accessible.

## Categories

- [ ] Top-level categories are reduced.
- [ ] Each category shows a curated list.
- [ ] Narrow variations are moved into parent flows.
- [ ] Duplicate options are merged.
- [ ] Unclear names are renamed.
- [ ] Create and Projects remain distinct.

## Evaluation

- [ ] Every existing option has been audited.
- [ ] The audit identifies keep, merge, rename, subtype, or move decisions.
- [ ] Unsupported options are hidden until functional.
- [ ] No duplicate flows remain without a clear reason.

---

# Final Experience Standard

The user should enter Create and immediately understand how to begin.

They should not have to:

- choose a filter
- understand where an idea came from
- browse a large catalog
- distinguish between several nearly identical creation types

The experience should feel like:

1. Tell Spark Estate what you want to create.
2. Choose from a few relevant suggestions.
3. Answer one question at a time.
4. See the finished creation.
5. Turn it into a Project only when execution is needed.
