# Spark Estate Create Master Inventory and Registry
## Master Product, UX, Routing, Personalization, and Implementation Specification

**Purpose:** Establish one source of truth for everything users can create in Spark Estate, including items already built, partially built, planned, and future. This registry should drive Create, Projects, Shari routing, Help Me Choose, Based on Your Business recommendations, audience/avatar selection, contextual How Do I… guidance, and implementation auditing.

---

# 1. Core Product Decisions

## 1.1 The registry is the source of truth

Every creation type must be registered once and referenced everywhere else.

The registry should drive:

- Create home
- Browse menus
- Search
- Help Me Choose
- Shari free-text routing
- Based on Your Business
- Recently Used
- Recommended for You
- Multiple-avatar handling
- Create-to-Project handoff
- Contextual How Do I…
- Chamber recommendations
- Cartography recommendations
- Board recommendations
- Testing and certification
- Future roadmap tracking

No creation type should be hardcoded independently in multiple places.

## 1.2 Include unbuilt items

Yes. Planned and future creation types belong in the registry so they are not forgotten.

However:

- Unbuilt items remain internal.
- User-facing visibility requires readiness.
- No card should open a placeholder, dead route, or generic Coming Soon page.
- Readiness must be validated before `isUserVisible` becomes true.

## 1.3 Keep the user-facing experience simple

The full registry may be large. The user should not see the full complexity by default.

Primary entry sequence:

1. Describe what you are working on.
2. Based on Your Business recommendations.
3. Help Me Choose.
4. Browse by Goal.
5. Optional filters for work type and audience.

Browse should use progressive disclosure.

Maximum catalog hierarchy:

`Category → Subcategory → Creation Type`

Further choices such as channel, platform, event format, or audience version should happen inside the builder.

---

# 2. Final Working Category Structure

These nine categories are the working master structure.

1. Write & Communicate
2. Market & Grow
3. Sell & Convert
4. Work With Clients
5. Plan an Experience
6. Build & Run the Business
7. Organize Knowledge
8. Develop Ideas
9. Personal & Community

Dynamic views are not categories:

- Based on Your Business
- Recommended for You
- Recently Used
- Popular
- New
- For This Project
- For This Audience

These are filtered views of the same registry.

---

# 3. Readiness and Visibility Status

## 3.1 Lifecycle statuses

```ts
export type CreationLifecycleStatus =
  | "inventory-only"
  | "defined"
  | "builder-needed"
  | "in-development"
  | "needs-audit"
  | "testing"
  | "ready"
  | "paused"
  | "retired";
```

## 3.2 User visibility rule

```ts
isUserVisible =
  status === "ready" &&
  routeVerified === true &&
  saveVerified === true &&
  reopenVerified === true &&
  requiredActionsVerified === true;
```

## 3.3 Audit status

Do not guess which current creation types are functional.

Use:

- `needs-audit` for anything believed to exist but not fully verified
- `builder-needed` for known missing builders
- `defined` for fully specified but unbuilt types
- `inventory-only` for ideas that still need product definition

---

# 4. Master Registry Schema

```ts
export interface CreationRegistryItem {
  id: string;
  name: string;
  singularLabel: string;
  pluralLabel?: string;

  categoryId: string;
  subcategoryId: string;
  parentCreationId?: string;
  subtypeIds?: string[];

  shortDescription: string;
  userOutcome: string;
  searchTerms: string[];

  relevantBusinessTypes: string[];
  relevantBusinessStages?: string[];
  relevantGoals?: string[];

  audienceSensitivity:
    | "none"
    | "helpful"
    | "recommended"
    | "required";

  supportsMultipleAvatars: boolean;
  multiAvatarModes?: Array<
    "shared-version" |
    "primary-plus-secondary" |
    "adapted-versions" |
    "separate-versions"
  >;

  helpfulBusinessProfileFields: string[];
  minimumContextQuestions: string[];

  relatedCreationIds: string[];
  usuallyCreatedTogetherIds: string[];

  canBecomeProject: boolean;
  defaultProjectTemplateId?: string;
  createToProjectBehavior?: string;

  recommendedChamberMemberIds: string[];
  recommendedMapTypes: string[];
  recommendedBoardRoles: string[];

  builderType:
    | "guided-conversation"
    | "structured-form"
    | "hybrid"
    | "research-assisted"
    | "multi-asset-workspace";

  route: string;
  lifecycleStatus: CreationLifecycleStatus;
  priority: "release-essential" | "next" | "later" | "future";

  isUserVisible: boolean;
  routeVerified: boolean;
  saveVerified: boolean;
  reopenVerified: boolean;
  printVerified: boolean;
  exportVerified: boolean;
  projectHandoffVerified: boolean;
  requiredActionsVerified: boolean;

  owner?: string;
  dependencies?: string[];
  implementationNotes?: string[];
  auditNotes?: string[];
}
```

---

# 5. Business Profile Personalization

## 5.1 Based on Your Business

Create should use the Business Profile to recommend what the user is most likely to need.

Signals may include:

- business type
- offers and services
- people served
- saved avatars
- business goals
- current priorities
- active Projects
- typical work
- recent creations
- preferred channels
- team structure
- business stage
- planned events or launches

The experience should say:

> Based on your business, these may be especially useful right now.

Recommendations should explain why when helpful.

Example:

> Recommended because you are preparing a workshop for ADHD business owners.

## 5.2 Multiple business contexts

When one business context exists, use it automatically.

When several exist, ask:

> Which part of your business is this for?

The choice should be stored with the creation and inherited by linked Projects.

## 5.3 Profile completion prompts

Profile prompts must be positive, optional, and benefit-led.

Preferred wording:

> I can help you begin now. The more I understand about your business and the people you help, the more I can personalize your work and save you from repeating yourself later.

Allowed actions:

- Start Creating
- Add One Helpful Detail
- Help Me Learn About My Business
- Continue Without It
- Remind Me Later

Never block Create because the profile is incomplete.

Use progressive profiling: ask only for what improves the current creation.

---

# 6. Avatar and Audience Intelligence

## 6.1 Audience-sensitive creations

Audience context is especially useful for:

- marketing
- sales
- offers
- events
- presentations
- courses
- newsletters
- social content
- client materials
- lead magnets
- communities
- speaking materials

## 6.2 Multiple-avatar selection

When relevant, ask:

> Who is this for?

Allow multi-select.

Then ask how to use the selected avatars:

- One shared version
- One primary audience with secondary audiences
- Adapted versions for each audience
- Separate versions

## 6.3 Context display

Show the active context in a compact editable line:

> Using: Spark Estate · ADHD entrepreneurs and business owners · Shared version

## 6.4 Save newly learned audiences

When a user describes a new audience during Create:

> Would you like me to remember this audience for future work?

Actions:

- Save as an Avatar
- Use This Time
- Not Now

---

# 7. Master Creation Inventory

**Important:** The status shown below is the recommended starting status for inventory work, not a claim about current implementation. Cursor must audit the current repository before changing any item to Ready.

---

## CATEGORY 1: WRITE & COMMUNICATE

### 1A. Everyday Business Communication

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Email | Draft a clear business email for a specific purpose. | Helpful | No | Release essential | Needs audit |
| Email Reply | Respond to an existing message with appropriate context and tone. | Helpful | No | Release essential | Defined |
| Letter | Create a professional or personal business letter. | Helpful | No | Next | Needs audit |
| Client Message | Write a message for a current or prospective client. | Recommended | No | Release essential | Defined |
| Announcement | Share news, an update, a launch, or a change. | Recommended | No | Next | Defined |
| Internal Update | Communicate progress, changes, or decisions to a team. | Helpful | No | Next | Defined |
| Thank-You Message | Create a personalized thank-you message. | Recommended | No | Next | Defined |
| Follow-Up Message | Follow up after a meeting, sale, event, or conversation. | Recommended | No | Release essential | Defined |
| Difficult Conversation Plan | Prepare respectful language and structure for a difficult conversation. | Helpful | Yes | Next | Defined |

### 1B. Articles, Reports, and Long-Form Writing

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Article or Blog Post | Develop an informative or persuasive long-form article. | Recommended | Optional | Release essential | Needs audit |
| Newsletter | Create a recurring or one-time newsletter. | Required | Optional | Release essential | Needs audit |
| Report | Produce a structured report for a business purpose. | Helpful | Optional | Release essential | Needs audit |
| Executive Summary | Condense a longer document into a decision-ready summary. | Helpful | No | Next | Defined |
| Case Study | Show the problem, approach, outcome, and lessons from client work. | Required | Optional | Next | Defined |
| White Paper | Build an authoritative long-form educational document. | Required | Yes | Later | Defined |
| Opinion or Thought Leadership Piece | Develop a distinctive perspective on an issue. | Required | Optional | Next | Defined |
| Research-Based Article | Create an article supported by credible sources. | Recommended | Optional | Next | Defined |
| Press Release | Announce a newsworthy business development. | Recommended | Optional | Later | Defined |
| Biography | Create a short, medium, or full professional biography. | Recommended | No | Release essential | Defined |
| About Page | Explain the founder, business, mission, and value. | Required | Optional | Release essential | Defined |
| Founder Story | Shape the founder’s experience into a meaningful business story. | Required | Optional | Next | Defined |

### 1C. Speaking and Presenting

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Presentation | Build a presentation with a clear audience outcome. | Required | Yes | Release essential | Needs audit |
| Presentation Outline | Organize the flow before building slides. | Required | Optional | Release essential | Defined |
| Slide Deck Content | Create slide-by-slide content and speaking guidance. | Required | Yes | Release essential | Defined |
| Speech | Write a speech for a particular audience and occasion. | Required | Yes | Next | Defined |
| Keynote | Develop a signature keynote presentation. | Required | Yes | Next | Defined |
| Talking Points | Prepare concise points for a conversation, meeting, or appearance. | Helpful | No | Release essential | Defined |
| Speaker Notes | Build speaker support notes for a presentation. | Required | No | Next | Defined |
| Panel Preparation | Prepare answers, questions, stories, and positioning for a panel. | Required | Optional | Next | Defined |
| Interview Preparation | Prepare key messages and answers for an interview. | Recommended | Optional | Next | Defined |
| Audience Handout | Create a useful takeaway document for attendees. | Required | Optional | Next | Defined |
| One-Sheet or Speaker Sheet | Create a professional speaker overview. | Required | Optional | Next | Defined |

### 1D. Scripts

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Video Script | Write a script for long- or short-form video. | Required | Optional | Release essential | Needs audit |
| Short-Form Video Script | Create concise content for reels, shorts, or clips. | Required | No | Release essential | Defined |
| Podcast Script | Structure a solo or hosted podcast episode. | Required | Optional | Next | Defined |
| Podcast Outline | Create a flexible episode structure. | Required | Optional | Next | Defined |
| Webinar Script | Create the full spoken flow for a webinar. | Required | Yes | Next | Defined |
| Training Script | Script a learning experience or training session. | Required | Yes | Next | Defined |
| Promotional Script | Create spoken promotional content. | Required | Optional | Next | Defined |
| Demonstration Script | Guide a product, service, or platform demonstration. | Recommended | Optional | Next | Defined |
| Audio Guide Script | Create guided audio, orientation, reflection, or walkthrough content. | Helpful | Optional | Next | Defined |

### 1E. Social Content

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Social Post | Create one post, then choose the platform. | Required | No | Release essential | Needs audit |
| Social Post Series | Build a coordinated sequence of posts. | Required | Optional | Release essential | Defined |
| Content Caption | Write a caption for an existing visual or video. | Required | No | Next | Defined |
| LinkedIn Post | Create a professional LinkedIn post. | Required | No | Next | Defined |
| Facebook Post | Create a Facebook post for a page, profile, or group. | Required | No | Next | Defined |
| Instagram Caption | Create an Instagram caption and supporting elements. | Required | No | Next | Defined |
| Social Story Sequence | Create a sequence for temporary story formats. | Required | No | Later | Defined |
| Community Post | Create a post designed for engagement inside a group or community. | Required | No | Next | Defined |
| Content Repurposing Set | Adapt one source item into several channel-ready pieces. | Required | Optional | Next | Defined |

---

## CATEGORY 2: MARKET & GROW

### 2A. Marketing Planning

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Marketing Plan | Build a practical marketing plan aligned with business goals. | Required | Yes | Release essential | Needs audit |
| Marketing Strategy | Define positioning, priorities, channels, and strategic choices. | Required | Yes | Release essential | Defined |
| Marketing Campaign | Plan a coordinated campaign with message, assets, schedule, and measures. | Required | Yes | Release essential | Needs audit |
| Promotional Plan | Plan promotion for an offer, event, product, or initiative. | Required | Yes | Release essential | Defined |
| Content Strategy | Decide what to say, to whom, where, and why. | Required | Yes | Release essential | Defined |
| Content Plan | Create a practical content plan for a defined period. | Required | Yes | Release essential | Defined |
| Content Calendar | Schedule planned content across channels. | Required | Yes | Release essential | Needs audit |
| Audience Growth Plan | Plan how to grow a relevant audience. | Required | Yes | Next | Defined |
| Brand Awareness Plan | Increase recognition and understanding of the business. | Required | Yes | Next | Defined |
| Local Marketing Plan | Build a marketing plan for a local business or service area. | Required | Yes | Next | Defined |
| Relationship Marketing Plan | Grow through trust, referrals, partnerships, and follow-up. | Required | Yes | Next | Defined |

### 2B. Campaigns

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Email Campaign | Create a coordinated sequence of campaign emails. | Required | Yes | Release essential | Defined |
| Social Media Campaign | Build a multi-post social campaign. | Required | Yes | Release essential | Defined |
| Launch Campaign | Plan communications and assets around a launch. | Required | Yes | Release essential | Defined |
| Event Promotion Campaign | Promote an upcoming event or learning experience. | Required | Yes | Release essential | Defined |
| Referral Campaign | Encourage and support referrals. | Required | Yes | Next | Defined |
| Partnership Campaign | Plan a collaborative promotional effort. | Required | Yes | Next | Defined |
| Advertising Campaign | Plan paid campaign strategy, messages, assets, and measures. | Required | Yes | Later | Defined |
| Re-Engagement Campaign | Reconnect with inactive contacts, customers, or community members. | Required | Yes | Next | Defined |
| Seasonal Campaign | Plan time-sensitive seasonal marketing. | Required | Yes | Later | Defined |
| Cause or Awareness Campaign | Build a mission-driven awareness campaign. | Required | Yes | Later | Defined |

### 2C. Audience and Community Building

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Facebook Community | Plan and structure a Facebook group or community. | Required | Yes | Release essential | Needs audit |
| Online Community | Design a non-platform-specific online community. | Required | Yes | Next | Defined |
| Membership Community | Plan a paid or free membership community. | Required | Yes | Next | Defined |
| Community Growth Plan | Grow engagement, participation, and retention. | Required | Yes | Next | Defined |
| Community Engagement Plan | Create recurring ways to encourage meaningful participation. | Required | Yes | Next | Defined |
| Newsletter Growth Plan | Increase newsletter subscribers and engagement. | Required | Yes | Later | Defined |
| Referral Program | Design a repeatable referral structure. | Required | Yes | Next | Defined |
| Partnership Plan | Identify and develop mutually valuable partnerships. | Required | Yes | Next | Defined |
| Ambassador Program | Create a structured advocate or ambassador program. | Required | Yes | Later | Defined |
| Audience Research Plan | Learn what a target audience needs, values, and responds to. | Required | Yes | Next | Defined |

### 2D. Lead Generation and Nurture

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Lead Magnet | Create a useful resource that attracts qualified interest. | Required | Yes | Release essential | Needs audit |
| Free Resource | Create a practical resource offered without charge. | Required | Optional | Release essential | Defined |
| Opt-In Campaign | Build the promotion and conversion path for a free resource. | Required | Yes | Next | Defined |
| Lead-Nurture Sequence | Build a relationship-oriented follow-up sequence. | Required | Yes | Release essential | Defined |
| Webinar Promotion | Promote a webinar and guide registrations. | Required | Yes | Next | Defined |
| Landing Page | Create a focused page for one action or conversion. | Required | Optional | Release essential | Needs audit |
| Waitlist Campaign | Build interest before availability or launch. | Required | Yes | Next | Defined |
| Quiz or Assessment Concept | Plan an audience-facing quiz or assessment. | Required | Yes | Later | Defined |
| Discovery Resource | Create material that helps prospects recognize their needs. | Required | Optional | Next | Defined |

---

## CATEGORY 3: SELL & CONVERT

### 3A. Offers and Packages

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Offer | Define and communicate a clear business offer. | Required | Yes | Release essential | Needs audit |
| Service Package | Package services around a clear outcome. | Required | Yes | Release essential | Defined |
| Product Package | Structure and describe a product package. | Required | Yes | Next | Defined |
| Pricing Package | Present pricing choices and value clearly. | Required | Optional | Release essential | Defined |
| Consultation Package | Design a consultation-based offer. | Required | Yes | Next | Defined |
| Coaching Package | Design a coaching offer and experience. | Required | Yes | Next | Defined |
| Membership Offer | Define a membership offer, promise, structure, and value. | Required | Yes | Next | Defined |
| Course Offer | Define the promise, audience, structure, and value of a course. | Required | Yes | Next | Defined |
| Workshop Offer | Package a workshop as a sellable service or product. | Required | Yes | Next | Defined |
| Sponsorship Package | Define sponsorship levels, benefits, and terms. | Required | Yes | Later | Defined |

### 3B. Sales Materials

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Sales Page | Create persuasive long-form sales content. | Required | Optional | Release essential | Needs audit |
| Landing Page | Create focused conversion-oriented page content. | Required | Optional | Release essential | Needs audit |
| Product Description | Describe a product clearly and persuasively. | Required | No | Next | Defined |
| Service Description | Explain a service and its value. | Required | No | Release essential | Defined |
| Proposal | Create a tailored business proposal. | Required | Optional | Release essential | Needs audit |
| Speaker Proposal | Pitch a speaking topic or engagement. | Required | Optional | Next | Defined |
| Sponsorship Proposal | Present a sponsorship opportunity. | Required | Optional | Later | Defined |
| Capability Statement | Summarize business capabilities for buyers or partners. | Required | No | Next | Defined |
| Sales Presentation | Create a presentation designed to support a buying decision. | Required | Yes | Next | Defined |
| Offer Comparison | Compare packages or choices in a clear, fair way. | Required | No | Next | Defined |

### 3C. Sales Process and Follow-Up

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Sales Funnel | Plan the sequence from awareness to purchase. | Required | Yes | Release essential | Defined |
| Discovery Call Plan | Prepare questions, flow, and next steps for a discovery call. | Required | Optional | Release essential | Defined |
| Sales Conversation Guide | Create a natural, non-scripted sales conversation framework. | Required | Optional | Release essential | Defined |
| Follow-Up Sequence | Build appropriate follow-up after interest or conversation. | Required | Optional | Release essential | Defined |
| Objection Response Guide | Prepare thoughtful responses to common concerns. | Required | No | Next | Defined |
| Upsell Plan | Identify appropriate next offers for existing customers. | Required | Yes | Later | Defined |
| Renewal Plan | Support subscription, contract, or service renewal. | Required | Yes | Next | Defined |
| Sales Pipeline Plan | Define stages, actions, and follow-up expectations. | Required | Yes | Next | Defined |
| Consultation Conversion Plan | Improve the path from consultation to engagement. | Required | Yes | Later | Defined |
| Lost Opportunity Review | Learn from a sale that did not move forward. | Helpful | Optional | Later | Defined |

---

## CATEGORY 4: WORK WITH CLIENTS

### 4A. Starting the Relationship

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Discovery Questionnaire | Gather information before a conversation or engagement. | Required | No | Release essential | Defined |
| Intake Form | Collect the information needed to begin work. | Required | No | Release essential | Defined |
| Proposal | Present recommended work, scope, value, and terms. | Required | Optional | Release essential | Needs audit |
| Scope of Work | Define deliverables, responsibilities, boundaries, and timing. | Required | Optional | Release essential | Defined |
| Client Welcome Guide | Help a new client understand what to expect. | Required | Optional | Release essential | Defined |
| Client Onboarding Plan | Plan the full onboarding experience and tasks. | Required | Yes | Release essential | Needs audit |
| Kickoff Meeting Plan | Prepare the first major working meeting. | Required | Optional | Next | Defined |
| Expectations Agreement | Clarify communication, responsibilities, and working norms. | Required | No | Next | Defined |
| Client Information Request | Ask for needed information or assets clearly. | Required | No | Next | Defined |

### 4B. Serving the Client

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Coaching Plan | Structure a coaching engagement around goals and progress. | Required | Yes | Next | Defined |
| Consulting Plan | Structure an advisory or consulting engagement. | Required | Yes | Next | Defined |
| Client Roadmap | Show the path, stages, and expected outcomes. | Required | Yes | Release essential | Defined |
| Service Delivery Plan | Define how the promised service will be delivered. | Required | Yes | Release essential | Defined |
| Client Communication Plan | Define communication channels, cadence, and responsibilities. | Required | Yes | Next | Defined |
| Client Meeting Agenda | Prepare a focused client meeting. | Required | No | Release essential | Defined |
| Progress Report | Summarize work completed, outcomes, issues, and next steps. | Required | No | Release essential | Defined |
| Client Check-In | Create a structured check-in or review. | Required | No | Next | Defined |
| Client Recommendation | Present a professional recommendation with reasoning. | Required | No | Next | Defined |
| Change Request | Document and evaluate requested changes to scope or direction. | Required | Optional | Later | Defined |
| Client Resource | Create a helpful guide, handout, or support resource. | Required | Optional | Next | Defined |

### 4C. Continuing or Closing

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Follow-Up Plan | Plan continued contact and next steps. | Required | Optional | Release essential | Defined |
| Renewal Plan | Prepare for a service, contract, or membership renewal. | Required | Yes | Next | Defined |
| Referral Request | Ask for referrals in a natural, appropriate way. | Required | No | Next | Defined |
| Testimonial Request | Ask for a useful and specific testimonial. | Required | No | Release essential | Defined |
| Client Offboarding | Close the relationship well and preserve goodwill. | Required | Yes | Next | Defined |
| Completion Summary | Summarize what was accomplished and what comes next. | Required | No | Next | Defined |
| Case Study Request | Invite a client to participate in a case study. | Required | No | Later | Defined |
| Re-Engagement Plan | Reconnect with former clients appropriately. | Required | Yes | Later | Defined |
| Client Experience Review | Evaluate the full client journey for improvement. | Required | Yes | Next | Defined |

---

## CATEGORY 5: PLAN AN EXPERIENCE

### 5A. Events

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Event Plan | Plan an event from purpose through follow-up. | Required | Yes | Release essential | Needs audit |
| Online Event | Plan an event delivered virtually. | Required | Yes | Release essential | Defined |
| In-Person Event | Plan a physical event and participant experience. | Required | Yes | Release essential | Defined |
| Hybrid Event | Plan an event with online and in-person participation. | Required | Yes | Later | Defined |
| Conference | Plan a multi-session conference. | Required | Yes | Later | Defined |
| Retreat | Plan a focused retreat experience. | Required | Yes | Next | Defined |
| Networking Event | Plan an event centered on connection. | Required | Yes | Next | Defined |
| Open House | Plan an introduction or showcase event. | Required | Yes | Later | Defined |
| Panel Discussion | Plan a moderated panel experience. | Required | Yes | Next | Defined |
| Community Event | Plan a community-centered gathering. | Required | Yes | Next | Defined |
| Fundraiser | Plan an event or campaign to raise funds. | Required | Yes | Later | Defined |

### 5B. Workshops and Learning

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Workshop | Design a participatory learning experience. | Required | Yes | Release essential | Needs audit |
| Webinar | Design an online educational or promotional session. | Required | Yes | Release essential | Needs audit |
| Masterclass | Design a focused expert-led learning experience. | Required | Yes | Next | Defined |
| Training | Create a structured training experience. | Required | Yes | Release essential | Defined |
| Course | Design a multi-part learning experience. | Required | Yes | Next | Defined |
| Challenge | Build a time-bound guided challenge. | Required | Yes | Next | Defined |
| Learning Series | Design several connected learning sessions. | Required | Yes | Next | Defined |
| Orientation | Create an introduction and onboarding learning experience. | Required | Yes | Next | Defined |
| Certification Program | Plan a structured certification experience. | Required | Yes | Future | Inventory only |
| Cohort Program | Design a group-based learning or development program. | Required | Yes | Later | Defined |

### 5C. Speaking and Appearances

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Speaking Engagement | Plan the full speaking opportunity and delivery. | Required | Yes | Next | Defined |
| Keynote Appearance | Plan a keynote from invitation through follow-up. | Required | Yes | Next | Defined |
| Panel Appearance | Prepare for participating on a panel. | Required | Optional | Next | Defined |
| Guest Training | Plan a training delivered for another organization. | Required | Yes | Next | Defined |
| Podcast Appearance | Prepare messages, stories, and calls to action. | Required | Optional | Next | Defined |
| Media Appearance | Prepare for television, radio, streaming, or press appearance. | Required | Optional | Later | Defined |

### 5D. Event Materials and Participant Journey

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Event Agenda | Create the participant-facing schedule. | Required | No | Release essential | Defined |
| Run of Show | Build a detailed operational event timeline. | Helpful | Yes | Release essential | Defined |
| Registration Page | Create event registration content. | Required | Optional | Release essential | Defined |
| Reminder Emails | Create a timed reminder sequence. | Required | Optional | Release essential | Defined |
| Follow-Up Emails | Create post-event communications. | Required | Optional | Release essential | Defined |
| Event Checklist | Build a comprehensive event task checklist. | Helpful | Yes | Release essential | Defined |
| Speaker Brief | Prepare guidance for speakers or presenters. | Helpful | No | Next | Defined |
| Attendee Guide | Help participants understand and prepare for the experience. | Required | No | Next | Defined |
| Event Survey | Gather useful participant feedback. | Required | No | Next | Defined |
| Replay Page | Create post-event replay and next-step content. | Required | Optional | Later | Defined |
| Event Materials Bundle | Coordinate slides, handouts, emails, pages, and logistics. | Required | Yes | Next | Defined |

---

## CATEGORY 6: BUILD & RUN THE BUSINESS

### 6A. Strategy and Direction

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Business Plan | Clarify the business model, direction, market, and execution. | Helpful | Yes | Release essential | Needs audit |
| Strategic Plan | Define priorities, choices, goals, and measures. | Helpful | Yes | Release essential | Needs audit |
| Annual Plan | Turn strategy into a one-year direction and focus. | Helpful | Yes | Release essential | Defined |
| Quarterly Plan | Define the next quarter’s priorities and execution. | Helpful | Yes | Release essential | Defined |
| Growth Plan | Plan how the business will grow sustainably. | Recommended | Yes | Release essential | Defined |
| Founder Plan | Create a practical plan for the founder’s role and priorities. | Helpful | Yes | Next | Defined |
| Business Review | Review performance, lessons, and next decisions. | Helpful | Yes | Release essential | Defined |
| Return-After-Absence Plan | Help a founder re-enter work after time away. | Helpful | Yes | Next | Defined |
| Business Continuity Plan | Prepare for disruption and critical dependencies. | Helpful | Yes | Later | Defined |
| Decision Framework | Create a repeatable way to make a class of decisions. | None | Optional | Next | Defined |
| Scenario Plan | Explore multiple plausible futures and responses. | Helpful | Yes | Later | Defined |
| Exit or Transition Plan | Plan ownership, leadership, or business transition. | Helpful | Yes | Future | Inventory only |

### 6B. Operations and Systems

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Standard Operating Procedure | Document how recurring work should be completed. | None | Optional | Release essential | Needs audit |
| Process Document | Explain a process from start to finish. | None | Optional | Release essential | Defined |
| Workflow | Define stages, handoffs, actions, and tools. | None | Yes | Release essential | Defined |
| Operations Plan | Coordinate the systems required to run the business. | None | Yes | Release essential | Defined |
| Policy | Define a clear organizational rule or standard. | Helpful | Optional | Next | Defined |
| Business Checklist | Create a repeatable operational checklist. | None | Optional | Release essential | Defined |
| Risk Plan | Identify important risks and appropriate responses. | Helpful | Yes | Next | Defined |
| Continuity Plan | Prepare for interruptions, absence, or failure points. | None | Yes | Next | Defined |
| Quality Standard | Define what good work looks like and how it is checked. | None | Optional | Next | Defined |
| Vendor Management Plan | Define selection, expectations, review, and relationships. | None | Yes | Later | Defined |
| Compliance Checklist | Track required compliance activities without providing legal advice. | None | Optional | Later | Defined |
| Business Rhythm | Design recurring meetings, reviews, and operating cadences. | None | Yes | Next | Defined |

### 6C. Team and Leadership

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Hiring Plan | Plan the need, role, process, and onboarding. | None | Yes | Release essential | Defined |
| Job Description | Define a role’s purpose, responsibilities, and requirements. | None | No | Release essential | Defined |
| Role Description | Clarify an internal role beyond a hiring advertisement. | None | No | Next | Defined |
| Delegation Plan | Decide what to delegate, to whom, and how. | None | Yes | Release essential | Defined |
| Team Plan | Clarify team structure, priorities, and ways of working. | None | Yes | Next | Defined |
| Meeting Rhythm | Create a sensible cadence of team meetings. | None | Yes | Next | Defined |
| Organizational Structure | Clarify roles, accountability, and reporting relationships. | None | Yes | Next | Defined |
| Performance Review | Structure a fair review conversation and documentation. | None | Optional | Later | Defined |
| Team Onboarding Plan | Bring a new team member into the business effectively. | None | Yes | Next | Defined |
| Team Communication Plan | Define channels, norms, and communication expectations. | None | Yes | Next | Defined |
| Leadership Development Plan | Build a practical development path for a leader. | None | Yes | Later | Defined |
| Succession Plan | Prepare for future leadership or role transition. | None | Yes | Future | Inventory only |

### 6D. Financial and Measurement

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Budget | Build a practical planning budget. | None | Optional | Release essential | Needs audit |
| Revenue Plan | Plan revenue sources, assumptions, and targets. | Recommended | Yes | Release essential | Defined |
| Pricing Strategy | Evaluate and define pricing choices. | Required | Yes | Release essential | Defined |
| KPI Plan | Identify meaningful measures and review rhythm. | None | Yes | Release essential | Defined |
| Profitability Review | Evaluate where the business creates or loses value. | None | Optional | Next | Defined |
| Financial Scenario Plan | Compare possible financial outcomes. | None | Optional | Next | Defined |
| Investment Evaluation | Evaluate an investment using assumptions, benefits, risks, and tradeoffs. | None | Optional | Later | Defined |
| Expense Review | Review expenses and identify informed choices. | None | Optional | Next | Defined |
| Cash-Flow Action Plan | Plan actions that support healthier cash flow. | None | Yes | Next | Defined |
| Pricing Package | Present pricing options clearly. | Required | Optional | Release essential | Defined |
| Metrics Dashboard Plan | Define what a future dashboard should track. | None | Yes | Later | Defined |

### 6E. Technology, AI, and Data

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Technology Plan | Align technology choices with business needs. | None | Yes | Next | Defined |
| AI Implementation Plan | Plan an appropriate AI initiative. | None | Yes | Release essential | Defined |
| Software Evaluation | Compare software options against real requirements. | None | Optional | Release essential | Defined |
| Automation Plan | Identify and plan useful automations. | None | Yes | Release essential | Defined |
| Data Plan | Define needed data, ownership, quality, access, and use. | None | Yes | Next | Defined |
| Tool Selection Guide | Evaluate and select a business tool. | None | Optional | Next | Defined |
| Integration Plan | Plan how software and processes should connect. | None | Yes | Next | Defined |
| AI Use Policy | Define appropriate and responsible AI use. | None | Optional | Later | Defined |
| Prompt Workflow | Design a repeatable business workflow that uses AI prompts. | None | Optional | Next | Defined |
| Digital Security Plan | Organize practical security priorities without replacing professional advice. | None | Yes | Later | Defined |

---

## CATEGORY 7: ORGANIZE KNOWLEDGE

### 7A. Guides and References

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Guide | Explain a topic, process, or decision clearly. | Helpful | Optional | Release essential | Needs audit |
| How-To Guide | Provide step-by-step instructions for completing something. | Helpful | Optional | Release essential | Needs audit |
| Reference Document | Organize stable information for later use. | None | No | Release essential | Defined |
| Resource List | Curate useful resources with context. | Helpful | No | Release essential | Defined |
| FAQ | Answer frequently asked questions clearly. | Required | No | Release essential | Defined |
| Glossary | Define important terms consistently. | Helpful | No | Next | Defined |
| Cheat Sheet | Create a concise practical reference. | Helpful | No | Release essential | Defined |
| Comparison Guide | Compare options using meaningful criteria. | Helpful | Optional | Next | Defined |
| Decision Guide | Help someone make a recurring decision. | Helpful | Optional | Next | Defined |
| Quick-Start Guide | Help someone begin quickly and confidently. | Required | Optional | Next | Defined |

### 7B. Systems of Knowledge

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Knowledge Base | Organize a searchable body of business knowledge. | Helpful | Yes | Next | Defined |
| Playbook | Combine strategy, standards, examples, and instructions. | Helpful | Yes | Release essential | Defined |
| Training Manual | Create a structured reference for learning a role or process. | Helpful | Yes | Next | Defined |
| Documentation Set | Plan and create connected documentation. | None | Yes | Next | Defined |
| Toolkit | Assemble several useful resources around one outcome. | Required | Yes | Next | Defined |
| Prompt Collection | Organize reusable AI prompts with context and guidance. | Helpful | Optional | Next | Defined |
| Content Library Plan | Organize existing and future content. | Helpful | Yes | Next | Defined |
| Internal Wiki Plan | Structure shared internal knowledge. | None | Yes | Later | Defined |
| Method Library | Organize reusable methods, frameworks, and approaches. | None | Yes | Later | Defined |

### 7C. Reusable Materials

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Template | Create a reusable starting structure. | Helpful | Optional | Release essential | Needs audit |
| Checklist | Create a practical list of actions or checks. | None | Optional | Release essential | Needs audit |
| Workbook | Create a guided working document. | Required | Optional | Next | Defined |
| Worksheet | Create a focused exercise or information-gathering page. | Required | No | Next | Defined |
| Tracker | Define information to monitor over time. | None | Optional | Release essential | Defined |
| Calendar | Create a structured planning calendar. | Helpful | Yes | Release essential | Defined |
| Resource Pack | Combine related resources into a useful bundle. | Required | Yes | Next | Defined |
| Form | Design a form for collecting information. | Required | No | Next | Defined |
| Scorecard | Create criteria and scoring for evaluation. | Helpful | Optional | Next | Defined |
| Review Template | Create a reusable structure for periodic review. | None | No | Next | Defined |

### 7D. Research and Analysis

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Research Summary | Summarize credible findings around a defined question. | Helpful | Optional | Release essential | Defined |
| Topic Brief | Create a concise orientation to a topic. | Helpful | No | Next | Defined |
| Competitor Review | Compare competitors using relevant criteria. | Required | Yes | Release essential | Defined |
| Trend Summary | Explain important developments and implications. | Helpful | Optional | Next | Defined |
| Evidence Review | Assess what evidence supports a claim or decision. | Helpful | Optional | Next | Defined |
| Decision Brief | Summarize a decision, evidence, options, and tradeoffs. | None | Optional | Release essential | Defined |
| Market Research Brief | Summarize a market, audience, opportunity, or problem. | Required | Yes | Next | Defined |
| Customer Insight Summary | Organize what has been learned about customers or clients. | Required | Yes | Next | Defined |
| Source Collection | Collect and annotate useful sources. | Helpful | Optional | Later | Defined |
| Research Plan | Define questions, methods, sources, and deliverables. | Helpful | Yes | Next | Defined |

---

## CATEGORY 8: DEVELOP IDEAS

### 8A. Brainstorming and Early Ideas

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Brainstorm | Generate and organize ideas around a defined need. | Helpful | Optional | Release essential | Needs audit |
| Business Idea | Explore a possible business concept. | Required | Yes | Next | Defined |
| Product Idea | Develop an early product concept. | Required | Yes | Next | Defined |
| Service Idea | Develop an early service concept. | Required | Yes | Next | Defined |
| Offer Idea | Explore a possible offer before formal development. | Required | Yes | Release essential | Defined |
| Content Ideas | Generate relevant content ideas. | Required | Optional | Release essential | Defined |
| Campaign Ideas | Generate and organize campaign directions. | Required | Optional | Next | Defined |
| Event Ideas | Generate experience and event possibilities. | Required | Optional | Next | Defined |
| Naming Ideas | Generate names using defined criteria. | Required | Optional | Next | Defined |
| Book Idea | Explore audience, promise, structure, and differentiation. | Required | Yes | Next | Defined |
| Course Idea | Explore audience, outcome, structure, and demand. | Required | Yes | Next | Defined |
| Speaking Topic | Develop a useful speaking topic and audience promise. | Required | Yes | Next | Defined |

### 8B. Concepts and Frameworks

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Concept | Develop a promising idea into a coherent concept. | Helpful | Optional | Release essential | Defined |
| Framework | Create a structured way to understand or approach something. | Helpful | Yes | Release essential | Defined |
| Methodology | Develop a repeatable method with principles and steps. | Helpful | Yes | Next | Defined |
| Signature Process | Create a distinctive branded process. | Required | Yes | Next | Defined |
| Positioning Concept | Explore how an offer or business should be understood. | Required | Yes | Next | Defined |
| Feature Concept | Define the purpose and behavior of a possible feature. | Required | Yes | Next | Defined |
| Program Concept | Develop a program before full planning. | Required | Yes | Next | Defined |
| Experience Concept | Define the intended feeling, journey, and outcome of an experience. | Required | Yes | Next | Defined |
| Intellectual Property Map | Organize frameworks, methods, content, and assets. | Helpful | Yes | Later | Defined |

### 8C. Innovation and Experimentation

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Experiment | Define a small test, learning goal, measure, and next decision. | Helpful | Yes | Next | Defined |
| Prototype Plan | Plan a low-cost way to test an idea. | Required | Yes | Next | Defined |
| Opportunity Assessment | Evaluate fit, value, feasibility, and risk. | Required | Optional | Release essential | Defined |
| Innovation Brief | Define an opportunity, insight, concept, and next tests. | Required | Yes | Next | Defined |
| Research Question | Shape a useful, answerable research question. | Helpful | Optional | Next | Defined |
| Pilot Plan | Plan a limited real-world trial. | Required | Yes | Next | Defined |
| Feature Prioritization | Compare and prioritize possible features. | Required | Yes | Next | Defined |
| Idea Validation Plan | Test whether an idea solves a real need. | Required | Yes | Next | Defined |
| Future Scenario | Explore a plausible future and its implications. | Helpful | Optional | Later | Defined |
| Opportunity Portfolio | Compare several opportunities and decide where to focus. | Required | Yes | Later | Defined |

---

## CATEGORY 9: PERSONAL & COMMUNITY

This category should remain available but visually secondary because Spark Estate primarily serves business users.

### 9A. Personal Planning

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Personal Goal | Define a meaningful goal and practical path. | None | Yes | Next | Defined |
| Learning Plan | Plan what and how to learn. | None | Yes | Next | Defined |
| Travel Plan | Organize a personal or mixed-purpose trip. | None | Yes | Later | Defined |
| Home Project | Plan a household or home-improvement project. | None | Yes | Later | Defined |
| Reading Plan | Organize books or material to read. | None | Optional | Later | Defined |
| Habit Plan | Create a supportive habit-building approach. | None | Optional | Later | Defined |
| Return-to-Routine Plan | Rebuild a workable routine after disruption. | None | Yes | Next | Defined |
| Personal Checklist | Create a simple reusable checklist. | None | Optional | Next | Defined |
| Celebration Plan | Plan a meaningful personal or business celebration. | Helpful | Yes | Later | Defined |
| Gift Plan | Organize thoughtful gifts and timing. | Helpful | Optional | Future | Inventory only |

### 9B. Community and Service

| Creation Type | Description | Audience | Project? | Priority | Starting Status |
|---|---|---:|---:|---|---|
| Volunteer Plan | Plan a volunteer effort or commitment. | Required | Yes | Later | Defined |
| Community Project | Plan an initiative that serves a community. | Required | Yes | Next | Defined |
| Fundraiser | Plan fundraising communication, activities, and follow-up. | Required | Yes | Later | Defined |
| Community Event | Plan a gathering for a community purpose. | Required | Yes | Next | Defined |
| Nonprofit Initiative | Plan a mission-driven initiative. | Required | Yes | Later | Defined |
| Board Proposal | Present a proposal to a nonprofit, association, or board. | Required | Optional | Later | Defined |
| Advocacy Campaign | Plan a values-aligned awareness or advocacy effort. | Required | Yes | Future | Inventory only |
| Community Partnership | Plan a partnership around shared community outcomes. | Required | Yes | Later | Defined |

---

# 8. Parent, Subtype, and Bundle Rules

## 8.1 Parent types

Some creation types should act as parents that launch subtype choices.

Examples:

- Social Content
- Event Plan
- Campaign
- Presentation
- Guide
- Offer
- Community
- Course
- Research

Do not show every subtype at the top level.

## 8.2 Bundle-capable creations

Some parent creations should coordinate several related assets.

Examples:

### Workshop

- Workshop plan
- Registration page
- Slide deck
- Audience handout
- Reminder emails
- Follow-up emails
- Survey
- Project

### Marketing Campaign

- Campaign brief
- audience context
- message
- content plan
- asset list
- schedule
- measures
- Project

### Client Onboarding

- welcome guide
- intake form
- kickoff agenda
- expectations agreement
- onboarding checklist
- Project

The registry should identify bundle relationships without automatically creating every asset.

---

# 9. Create-to-Project Rules

## 9.1 Source of truth

Create remains the source of truth for the creation.

Projects manages execution.

The Project should link to the creation rather than duplicate its content.

## 9.2 Inherited context

The Project inherits:

- business context
- selected avatar or avatars
- offer or service context
- relevant profile facts
- related assets
- creation title
- creation goal
- agreed deadline or timing
- selected version strategy

## 9.3 Suggested project conversion

Offer Project conversion when meaningful, especially for:

- campaigns
- events
- offers
- courses
- SOP implementation
- strategic plans
- client onboarding
- hiring
- technology implementations
- multi-asset creations

Do not push every short email or social post into Projects.

---

# 10. Contextual How Do I… Requirements

## 10.1 Create Home

Include answers and direct actions for:

- How do I start something?
- What if I do not know what it is called?
- How do I use Help Me Choose?
- How do I browse by goal?
- How do I see recommendations based on my business?
- How do I choose which business this is for?
- How do I choose one or more avatars?
- How do I find something I started?
- Where are completed, archived, or deleted creations?

## 10.2 Creation Builder

Include:

- How do I edit this?
- Is my work saved automatically?
- How do I rename it?
- How do I print or export it?
- How do I duplicate it?
- How do I use another audience?
- How do I create adapted versions?
- How do I turn this into a Project?
- How do I return to the original creation?

## 10.3 Projects

Include:

- What is the difference between Create and Projects?
- Where is the source creation?
- How do I add or break down tasks?
- How do I change the next step?
- How do I connect Chamber, Cartography, or Board help?
- How do I complete, archive, or restore a Project?

## 10.4 Help behavior

Each answer should provide:

- a concise explanation
- where the item is located
- a direct action button when possible

Example:

> Workshops are under **Plan an Experience → Workshops & Learning**.

Button:

**Open Workshop**

---

# 11. Universal Item Actions

Every saved user-created item should support the appropriate lifecycle actions.

Visible actions:

- Open
- Continue
- Edit

More menu:

- Rename
- Save
- Print
- Duplicate
- Export
- Archive
- Delete
- Restore, where applicable

Autosave should be standard.

Delete should move to Trash first.

Actions may be hidden only when genuinely inapplicable, not because they are unfinished.

---

# 12. Search and Routing

## 12.1 Search terms

Each creation type should include:

- official name
- plain-language synonyms
- user outcome phrases
- profession-specific phrases
- common misspellings where useful

Example:

`standard-operating-procedure`

Search terms:

- SOP
- standard operating procedure
- document a process
- how we do this
- procedure
- repeatable instructions

## 12.2 Free-text routing

Shari should interpret:

> I need to put together something for a workshop.

as a possible Workshop, Event Plan, Presentation, or Workshop Offer depending on context.

When confidence is high, recommend one.

When several fit, explain the difference and ask one useful question.

---

# 13. Audit Instructions for Cursor

Cursor should audit the current repository against this inventory.

For every item believed to exist, verify:

1. A registry entry exists.
2. The route opens the correct experience.
3. The builder is specific to the creation type.
4. Answers save correctly.
5. The user can leave and reopen the item.
6. Autosave works.
7. Universal item actions work.
8. Browse, search, Help Me Choose, and free-text routing find it.
9. Business-profile context can be used.
10. Avatar selection works when relevant.
11. Project handoff works when applicable.
12. Unready items are hidden from users.
13. No duplicate registry records exist.
14. No dead cards or placeholder routes exist.

Use generated smoke tests from registry metadata.

## Required audit output

Produce:

- total registry items
- ready
- needs audit
- partially functional
- broken
- missing
- duplicate
- hidden planned
- release-essential gaps
- incorrect routes
- save/reopen failures
- Project handoff failures
- recommended implementation sequence

---

# 14. Release Priority

## Release essentials

Prioritize broad, high-frequency business needs:

- Email
- Social Post
- Article or Blog Post
- Newsletter
- Presentation
- Video Script
- Marketing Plan
- Marketing Campaign
- Content Calendar
- Lead Magnet
- Landing Page
- Offer
- Proposal
- Sales Page
- Client Onboarding
- Client Roadmap
- Event Plan
- Workshop
- Webinar
- Event Agenda
- Run of Show
- Business Plan
- Strategic Plan
- SOP
- Workflow
- Budget
- Pricing Strategy
- Guide
- How-To Guide
- Template
- Checklist
- Research Summary
- Brainstorm
- Framework
- Opportunity Assessment

Do not attempt to build the entire inventory before releasing improvements.

## Next

Build types that serve several work profiles and deepen existing experiences.

## Later and Future

Keep fully recorded but hidden.

---

# 15. Recommended Repository Structure

```text
/src/domain/creation-registry/
  creationRegistry.ts
  creationCategories.ts
  creationSubcategories.ts
  creationRelationships.ts
  creationSearchTerms.ts
  creationReadiness.ts
  creationRecommendations.ts
  creationProfileSignals.ts
  creationAudienceRules.ts
  creationProjectHandoffs.ts
  creationHelpContent.ts
  creationValidation.ts
  __tests__/
```

Avoid storing registry truth inside UI components.

---

# 16. Validation Rules

The build should fail when:

- two items use the same ID
- a visible item is not Ready
- a visible item lacks a valid route
- a parent references a missing subtype
- a related creation ID does not exist
- a Project handoff references a missing template
- a category or subcategory ID is invalid
- an audience-sensitive item lacks audience rules
- How Do I… references a missing route
- a Ready item lacks save and reopen verification

---

# 17. What Comes Next

After this registry is added to the repository, the sequence should be:

## Phase 1: Repository audit

Compare this inventory to the current implementation.

Do not start by building all missing types.

First determine what exists and what is broken.

## Phase 2: Registry foundation

Implement the canonical registry and migrate current Create cards, routes, search, and Help Me Choose to read from it.

## Phase 3: Fix release blockers

Fix:

- saving
- reopening
- incorrect routes
- broken cards
- duplicate Current Focus behavior
- universal item actions
- Create-to-Project handoff

## Phase 4: Simplified Create home

Build:

- Describe What You Need
- Based on Your Business
- Continue Previous Work
- Help Me Choose
- Browse by Goal

## Phase 5: Profile and avatar intelligence

Add:

- business-context selection
- multiple-avatar selection
- adapted-version behavior
- progressive profile prompts
- context inheritance into Projects

## Phase 6: Contextual How Do I…

Implement page-aware help in Create and Projects using registry data.

## Phase 7: Release-essential builder completion

Complete and certify the release-essential types.

## Phase 8: Relationship intelligence

Add:

- Usually Created Together
- related assets
- recommended Chamber help
- recommended maps
- recommended Board perspectives
- Project bundle suggestions

## Phase 9: Controlled expansion

Move planned types through:

Defined → Builder Needed → In Development → Testing → Ready

Only Ready types become visible.

---

# Final Product Standard

The user should experience:

> Spark Estate already understands my business, helps me choose what I need, knows who I am creating it for, and guides me without making me learn a giant menu.

The team should experience:

> Every creation type is documented, trackable, testable, and connected through one reliable registry.

