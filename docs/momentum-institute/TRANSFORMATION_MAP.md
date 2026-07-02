# Transformation Map™

**The intelligence bridge between what members say and who they become.**

| Field | Value |
|-------|-------|
| **Status** | Canonical map — Estate Intelligence™ + Institute routing |
| **Purpose** | Translate member language → transformation journey → curriculum experiences |
| **Members see** | A companion who understands their journey — **not** a library of topics |
| **Related** | [SPARK_TEACHING_STANDARDS.md](./SPARK_TEACHING_STANDARDS.md) · [KNOWLEDGE_CARD_FRAMEWORK.md](./KNOWLEDGE_CARD_FRAMEWORK.md) · [CURRICULUM_DEVELOPMENT.md](./CURRICULUM_DEVELOPMENT.md) · [estate/momentum-institute.md](../estate/momentum-institute.md) · [ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md](../ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) |

---

## Purpose

The Momentum Institute™ teaches **capabilities**. Members arrive seeking **transformation**.

The Transformation Map™ is the permanent bridge:

```
What the member says
        ↓
What they actually need
        ↓
Momentum Institute experiences
        ↓
Implementation (Make It Mine™ · Try It This Week™)
        ↓
Real-world growth
```

Members never need to know the curriculum. Spark translates their needs into **personalized learning journeys** — one transformation at a time, one invitation at a time.

**Estate Intelligence™** uses this map. Spark does not recommend random lessons. Spark recommends **transformations**.

---

## How Spark uses this map

### Conversation flow (internal)

1. **Listen** — capture member language (exact words when possible).
2. **Match** — map statements to one primary transformation (secondary only if clearly dual).
3. **Name gently** — offer the journey, not the drawer: *"Let's work on moving from Undercharging to Confident Pricing™ together."*
4. **Route** — one primary experience (BMM, card, lab, or conversation) — not a menu.
5. **Implement** — permission for Make It Mine™ · Evidence Vault™ when earned.
6. **Grow** — quiet Growth Profile™ competency signals.

### Smart recommendation example

**Member:** *"I'm afraid to raise my prices."*

**Spark (wrong):** *"Here are five pricing lessons you might like."*

**Spark (right):** *"I think I know the journey that would help most. Let's work on moving from **Undercharging to Confident Pricing™** together. Would you like a quick Business Mastery Minute™ to start, or talk it through first?"*

### Design rules

| Rule | Meaning |
|------|---------|
| **Transformation first** | Name the journey before naming drawers or cards |
| **One primary invitation** | Max three choices only when member is stuck (Spec 106) |
| **Overwhelm gate** | If overwhelmed → conversation or Momentum Builder™ first — not curriculum |
| **Permission always** | Labs, Make It Mine™, Evidence — never auto-open |
| **Catalog honesty** | Recommend only experiences that exist in catalog; placeholder IDs below mark future curriculum |
| **Competency over completion** | Success = capability gained, not cards opened |

**Future runtime:** `TransformationMapEntry` in `lib/momentumInstitute/transformationMap/` (typed index consumed by Estate Intelligence™ and drawer-wall bridge).

---

## Map entry schema

Every transformation in this document follows the same structure:

| Field | Purpose |
|-------|---------|
| **Transformation name** | Member-facing journey label (From → To) |
| **Common member statements** | Phrases Estate Intelligence matches |
| **Underlying competencies** | Growth Profile™ + competency framework slugs |
| **Recommended drawers** | Institute drawer slugs / titles |
| **Recommended Knowledge Cards™** | Card ids (curriculum registry) |
| **Recommended Business Mastery Minutes™** | BMM experience ids |
| **Recommended Apprenticeships™** | Multi-week arcs |
| **Recommended Business Labs™** | Hands-on application |
| **Recommended Simulations™** | Safe rehearsal |
| **Recommended Challenges™** | Real-world practice |
| **Make It Mine™ opportunities** | Personalization prompts |
| **Evidence Vault™ opportunities** | What to capture after apply |
| **Growth Profile™ connections** | Competencies strengthened |

**Placeholder convention:** `KC-###-slug` = planned Knowledge Card™ in `docs/momentum-institute/curriculum/`. Replace with published ids as curriculum ships.

---

## Transformation index

| # | From → To | Primary drawers |
|---|-----------|-----------------|
| 1 | [Overwhelmed → Organized](#1-overwhelmed--organized) | Executive Function · Decision Making · Systems · Habits |
| 2 | [Invisible → Visible](#2-invisible--visible) | Marketing · Communication · Speaking |
| 3 | [Undercharging → Confident Pricing](#3-undercharging--confident-pricing) | Pricing · Offers · Customer Psychology |
| 4 | [Busy → Productive](#4-busy--productive) | Systems · Executive Function · Habits · Automation |
| 5 | [Hesitant → Decisive](#5-hesitant--decisive) | Decision Making · Strategic Thinking · Problem Solving |
| 6 | [Procrastinating → Consistent](#6-procrastinating--consistent) | Habits · ADHD Entrepreneurship · Executive Function |
| 7 | [Solo Operator → Business Owner](#7-solo-operator--business-owner) | Hiring · Systems · Leadership · Business Growth |
| 8 | [Tech Overwhelm → AI Confidence](#8-tech-overwhelm--ai-confidence) | AI · Automation · Systems |
| 9 | [Fear of Selling → Serving with Confidence](#9-fear-of-selling--serving-with-confidence) | Sales · Customer Psychology · Communication |
| 10 | [Scattered → Strategic](#10-scattered--strategic) | Strategic Thinking · Business Growth · Offers |
| 11 | [Self-Doubt → Entrepreneurial Confidence](#11-self-doubt--entrepreneurial-confidence) | Confidence · Leadership · Learning |

---

## Transformations

### 1. Overwhelmed → Organized

**Transformation name:** From Overwhelmed to Organized™

**Common member statements**

- "I don't know where to start."
- "I have too many ideas."
- "I feel stuck."
- "Everything feels urgent."
- "My head is full."
- "I can't prioritize."

**Underlying competencies**

- Planning
- Prioritization
- Executive function
- Decision making
- Working memory supports
- Calm under load

**Recommended drawers**

- Executive Function (`drawer-executive-function`)
- Decision Making (`drawer-decision-making`)
- Systems (`drawer-systems`)
- Habits (`drawer-habits`)
- Problem Solving (`drawer-problem-solving`)

**Recommended Knowledge Cards™**

- `KC-EF-001-one-thing-first` *(planned)*
- `KC-EF-002-external-brain-basics` *(planned)*
- `KC-DM-001-choosing-under-uncertainty` — aligns with phase1 *Choosing Under Uncertainty*
- `KC-SYS-001-repeatable-systems` — aligns with phase1 *Repeatable Systems*
- `KC-HAB-001-sustainable-habits` — aligns with phase1 *Sustainable Habits*

**Recommended Business Mastery Minutes™**

- `bmm-KC-EF-001-one-thing-first`
- `bmm-KC-DM-001-choosing-under-uncertainty`

**Recommended Apprenticeships™**

- *Clarity & Momentum Apprenticeship™* *(planned — 3-week EF + planning arc)*

**Recommended Business Labs™**

- *Plan My Week Lab™* — lightweight weekly structure artifact
- *Brain Dump to Three Lab™* — capture → three priorities

**Recommended Simulations™**

- *Priority Pressure Simulation™* — practice saying no to good ideas

**Recommended Challenges™**

- *One Thing Tomorrow™* — one priority before noon

**Make It Mine™ opportunities**

- "What is the one thing that would make this week feel calmer?"
- "Would you like help turning your idea pile into three honest priorities?"

**Evidence Vault™ opportunities**

- Photo or note of completed weekly plan
- Before/after priority list (member-owned)

**Growth Profile™ connections**

- `executive-function`
- `prioritization`
- `decision-quality`
- `calm-leadership`

---

### 2. Invisible → Visible

**Transformation name:** From Invisible to Visible™

**Common member statements**

- "No one knows I exist."
- "I'm afraid to market myself."
- "I don't like social media."
- "I don't know how to get found."
- "I'm good at what I do but no one hears about it."

**Underlying competencies**

- Positioning
- Visibility
- Authentic marketing
- Communication courage
- Audience understanding

**Recommended drawers**

- Marketing (`drawer-marketing`)
- Communication (`drawer-communication`)
- Speaking (`drawer-speaking`)
- Customer Psychology (`drawer-customer-psychology`)

**Recommended Knowledge Cards™**

- `KC-MKT-001-positioning-basics` — aligns with phase1 *Positioning Basics*
- `KC-MKT-002-why-people-notice` *(planned)*
- `KC-COM-001-clear-communication` — aligns with phase1 *Clear Communication*
- `KC-SPK-001-speaking-with-warmth` — aligns with phase1 *Speaking With Warmth*
- `KC-PSY-001-customer-psychology` — aligns with phase1 *Customer Psychology*

**Recommended Business Mastery Minutes™**

- `bmm-KC-MKT-001-positioning-basics`
- `bmm-KC-COM-001-clear-communication`

**Recommended Apprenticeships™**

- *Visible Expert Apprenticeship™* *(planned — positioning + one channel)*

**Recommended Business Labs™**

- *One-Line Positioning Lab™*
- *About Page Clarity Lab™*

**Recommended Simulations™**

- *Elevator Clarity Simulation™* — say what you do in 30 seconds

**Recommended Challenges™**

- *One Genuine Share™* — one post, email, or conversation this week (channel of their choice)

**Make It Mine™ opportunities**

- "How would you describe what you do if social media didn't exist?"
- "Would you like help writing one sentence people can remember?"

**Evidence Vault™ opportunities**

- Published bio, post, or intro email (with permission)
- Member reflection on response received

**Growth Profile™ connections**

- `positioning`
- `visibility`
- `communication-confidence`
- `marketing-courage`

---

### 3. Undercharging → Confident Pricing

**Transformation name:** From Undercharging to Confident Pricing™

**Common member statements**

- "I'm afraid to raise my prices."
- "I don't think I'm worth it."
- "Clients push back on price."
- "I always discount."
- "I compare myself to cheaper competitors."

**Underlying competencies**

- Pricing confidence
- Value communication
- Perceived value
- Risk reduction
- Self-worth in business (without therapy drift)

**Recommended drawers**

- Pricing (`drawer-pricing`)
- Offers (`drawer-offers`)
- Customer Psychology (`drawer-customer-psychology`)
- Confidence (`drawer-confidence`)

**Recommended Knowledge Cards™**

- `KC-PRC-001-pricing-foundations` — aligns with phase1 *Pricing Foundations*
- `KC-001-why-people-buy` *(planned — marketing curriculum)*
- `KC-002-trust-before-transaction` *(planned)*
- `KC-004-perceived-value` *(planned)*
- `KC-005-reducing-risk` *(planned)*
- `KC-OFF-001-offer-clarity` — aligns with phase1 *Offer Clarity*

**Recommended Business Mastery Minutes™**

- `bmm-KC-PRC-001-pricing-foundations`
- `bmm-KC-004-perceived-value`

**Recommended Apprenticeships™**

- *Pricing Confidence Apprenticeship™* *(planned — 4-week arc)*

**Recommended Business Labs™**

- *Price Your Offer Lab™*
- *Value Stack Lab™*

**Recommended Simulations™**

- *Price Conversation Simulation™* — practice stating price without apologizing

**Recommended Challenges™**

- *Say Your Price Aloud™*
- *One Rate Increase Conversation™*

**Make It Mine™ opportunities**

- "What outcome do your clients thank you for — and what would a fair price for that look like?"
- "Would you like help drafting the message you'd send if you raised your rate?"

**Evidence Vault™ opportunities**

- Signed proposal at new rate
- Client yes after price conversation
- Member journal on confidence shift

**Growth Profile™ connections**

- `pricing-confidence`
- `value-communication`
- `decision-quality`
- `revenue-leadership`

**Estate Intelligence example (canonical)**

> *"I think I know the journey that would help most. Let's work on moving from Undercharging to Confident Pricing™ together."*

---

### 4. Busy → Productive

**Transformation name:** From Busy to Productive™

**Common member statements**

- "I'm busy all day but nothing important gets done."
- "I work hard but don't move forward."
- "I'm reactive — never proactive."
- "I don't have time to work on my business."
- "I'm drowning in tasks."

**Underlying competencies**

- Focus
- Systems thinking
- Leverage
- Time design
- Delegation readiness
- Energy management

**Recommended drawers**

- Systems (`drawer-systems`)
- Executive Function (`drawer-executive-function`)
- Habits (`drawer-habits`)
- Automation (`drawer-automation`)
- Business Growth (`drawer-business-growth`)

**Recommended Knowledge Cards™**

- `KC-SYS-001-repeatable-systems`
- `KC-HAB-001-sustainable-habits`
- `KC-AUT-001-automate-the-repeatable` — aligns with phase1 *Automate the Repeatable*
- `KC-BG-001-growth-with-intention` — aligns with phase1 *Growth With Intention*
- `KC-EF-003-deep-work-blocks` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-SYS-001-repeatable-systems`
- `bmm-KC-AUT-001-automate-the-repeatable`

**Recommended Apprenticeships™**

- *Leverage Apprenticeship™* *(planned — systems + automation)*

**Recommended Business Labs™**

- *Weekly Rhythm Lab™*
- *Automate One Thing Lab™*

**Recommended Simulations™**

- *Day-in-the-Life Simulation™* — redesign one reactive day

**Recommended Challenges™**

- *Two Hours on the Business™* — protected block this week

**Make It Mine™ opportunities**

- "What would make next week feel productive instead of just busy?"
- "Would you like help identifying one task to automate or eliminate?"

**Evidence Vault™ opportunities**

- Completed leverage project
- Time audit snapshot (member-owned)

**Growth Profile™ connections**

- `productivity`
- `systems-design`
- `leverage`
- `focus`

---

### 5. Hesitant → Decisive

**Transformation name:** From Hesitant to Decisive™

**Common member statements**

- "I can't decide."
- "I keep going back and forth."
- "I'm afraid of choosing wrong."
- "I need more information before I act."
- "What if I regret this?"

**Underlying competencies**

- Decision making under uncertainty
- Risk tolerance (healthy)
- Commitment
- Strategic choice
- Regret minimization

**Recommended drawers**

- Decision Making (`drawer-decision-making`)
- Strategic Thinking (`drawer-strategic-thinking`)
- Problem Solving (`drawer-problem-solving`)
- Thinking Skills (`drawer-thinking-skills`)

**Recommended Knowledge Cards™**

- `KC-DM-001-choosing-under-uncertainty`
- `KC-ST-001-strategic-foresight` — aligns with phase1 *Strategic Foresight*
- `KC-PS-001-solve-the-real-problem` — aligns with phase1 *Solve the Real Problem*
- `KC-THK-001-sharper-thinking` — aligns with phase1 *Sharper Thinking*
- `KC-DM-002-good-enough-decisions` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-DM-001-choosing-under-uncertainty`

**Recommended Apprenticeships™**

- *Decision Confidence Apprenticeship™* *(planned)*

**Recommended Business Labs™**

- *Decision Compass Lab™* — links to Decision Compass™ workspace when appropriate
- *Two-Option Choice Lab™*

**Recommended Simulations™**

- *Fork in the Road Simulation™* — rehearse committing to one path

**Recommended Challenges™**

- *Decide by Friday™* — one pending decision resolved

**Make It Mine™ opportunities**

- "What's the real decision underneath the options?"
- "Would you like to talk through what 'good enough to move' looks like for you?"

**Evidence Vault™ opportunities**

- Decision record + outcome review (30 days later)
- Member reflection on what deciding freed up

**Growth Profile™ connections**

- `decision-quality`
- `strategic-thinking`
- `commitment`
- `confidence`

---

### 6. Procrastinating → Consistent

**Transformation name:** From Procrastinating to Consistent™

**Common member statements**

- "I know what to do but I don't do it."
- "I start strong then fall off."
- "I procrastinate on the important stuff."
- "I can't stay consistent."
- "ADHD makes this impossible." *(meet without arguing — design for EF)*

**Underlying competencies**

- Habit design
- ADHD-friendly entrepreneurship
- Accountability (self-owned)
- Start rituals
- Shame-free return

**Recommended drawers**

- Habits (`drawer-habits`)
- ADHD Entrepreneurship (`drawer-adhd-entrepreneurship`)
- Executive Function (`drawer-executive-function`)
- Learning (`drawer-learning`)

**Recommended Knowledge Cards™**

- `KC-HAB-001-sustainable-habits`
- `KC-ADHD-001-entrepreneurial-ef` — aligns with phase1 *Entrepreneurial EF*
- `KC-EF-001-one-thing-first` *(planned)*
- `KC-LRN-001-learning-how-to-learn` — aligns with phase1 *Learning How to Learn*
- `KC-HAB-002-return-without-shame` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-HAB-001-sustainable-habits`
- `bmm-KC-ADHD-001-entrepreneurial-ef`

**Recommended Apprenticeships™**

- *Consistency Apprenticeship™* *(planned — tiny habits, 21 days)*

**Recommended Business Labs™**

- *Minimum Viable Routine Lab™*
- *Start Ritual Lab™*

**Recommended Simulations™**

- *Restart Simulation™* — practice returning after a missed week

**Recommended Challenges™**

- *Five-Minute Start™* — five minutes on the avoided task daily

**Make It Mine™ opportunities**

- "What's the smallest version of this that still counts?"
- "Would you like help designing a restart plan — not a punishment plan?"

**Evidence Vault™ opportunities**

- Streak of small wins (member-defined, no Spark surveillance)
- Return story after absence

**Growth Profile™ connections**

- `consistency`
- `adhd-resilience`
- `self-leadership`
- `habit-design`

---

### 7. Solo Operator → Business Owner

**Transformation name:** From Solo Operator to Business Owner™

**Common member statements**

- "It's just me — I do everything."
- "I can't scale."
- "I'm the bottleneck."
- "I don't know how to delegate."
- "I want a business, not a job I created for myself."

**Underlying competencies**

- Delegation
- Leadership
- Systems ownership
- Hiring judgment
- Business architecture

**Recommended drawers**

- Hiring (`drawer-hiring`)
- Systems (`drawer-systems`)
- Leadership (`drawer-leadership`)
- Business Growth (`drawer-business-growth`)
- Automation (`drawer-automation`)

**Recommended Knowledge Cards™**

- `KC-HIR-001-hiring-thoughtfully` — aligns with phase1 *Hiring Thoughtfully*
- `KC-LDR-001-leading-with-clarity` — aligns with phase1 *Leading With Clarity*
- `KC-SYS-001-repeatable-systems`
- `KC-BG-001-growth-with-intention`
- `KC-SOLO-001-owner-not-operator` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-HIR-001-hiring-thoughtfully`
- `bmm-KC-LDR-001-leading-with-clarity`

**Recommended Apprenticeships™**

- *Build the Business Apprenticeship™* *(planned — 6-week owner shift)*

**Recommended Business Labs™**

- *Delegation Map Lab™*
- *First Hire Readiness Lab™*

**Recommended Simulations™**

- *Delegation Conversation Simulation™*

**Recommended Challenges™**

- *Delegate One Task™* — hand off one repeatable task this month

**Make It Mine™ opportunities**

- "What are you still doing that only you think you must do?"
- "Would you like help listing what you'd delegate first if you trusted someone?"

**Evidence Vault™ opportunities**

- Delegation SOP or handoff doc
- First hire milestone (when applicable)

**Growth Profile™ connections**

- `leadership`
- `delegation`
- `business-architecture`
- `scale-readiness`

---

### 8. Tech Overwhelm → AI Confidence

**Transformation name:** From Tech Overwhelm to AI Confidence™

**Common member statements**

- "AI is moving too fast."
- "I don't know what tools to use."
- "I'm afraid I'll do it wrong."
- "Everyone else seems ahead of me."
- "I don't want to replace real connection with robots."

**Underlying competencies**

- AI literacy (practical)
- Tool judgment
- Ethical use
- Human + AI partnership
- Automation without chaos

**Recommended drawers**

- AI (`drawer-ai`)
- Automation (`drawer-automation`)
- Systems (`drawer-systems`)
- Innovation (`drawer-innovation`)

**Recommended Knowledge Cards™**

- `KC-AI-001-ai-as-thinking-partner` — aligns with phase1 *AI as Thinking Partner*
- `KC-AUT-001-automate-the-repeatable`
- `KC-INV-001-innovation-without-chaos` — aligns with phase1 *Innovation Without Chaos*
- `KC-AI-002-trust-but-verify` *(planned)*
- `KC-AI-003-one-tool-one-job` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-AI-001-ai-as-thinking-partner`

**Recommended Apprenticeships™**

- *AI Confidence Apprenticeship™* *(planned — ethical, practical, ADHD-friendly)*

**Recommended Business Labs™**

- *One AI Workflow Lab™*
- *Prompt for Your Business Lab™*

**Recommended Simulations™**

- *AI Decision Simulation™* — when to use AI vs think yourself

**Recommended Challenges™**

- *One AI Win This Week™* — one task helped by AI, member reviews quality

**Make It Mine™ opportunities**

- "What repetitive thinking task would you gladly hand to a careful assistant?"
- "Would you like help designing one AI workflow that fits how you actually work?"

**Evidence Vault™ opportunities**

- Before/after workflow note
- Member policy for AI use in their business

**Growth Profile™ connections**

- `ai-confidence`
- `technology-judgment`
- `innovation`
- `efficiency`

---

### 9. Fear of Selling → Serving with Confidence

**Transformation name:** From Fear of Selling to Serving with Confidence™

**Common member statements**

- "I hate selling."
- "I don't want to be pushy."
- "I feel sleazy talking about money."
- "I wait for people to come to me."
- "I don't know how to follow up."

**Underlying competencies**

- Ethical selling
- Service mindset
- Conversation confidence
- Follow-up habits
- Objection as curiosity

**Recommended drawers**

- Sales (`drawer-sales`)
- Customer Psychology (`drawer-customer-psychology`)
- Communication (`drawer-communication`)
- Networking (`drawer-networking`)
- Confidence (`drawer-confidence`)

**Recommended Knowledge Cards™**

- `KC-SLS-001-ethical-selling` — aligns with phase1 *Ethical Selling*
- `KC-PSY-001-customer-psychology`
- `KC-NET-001-networking` — aligns with phase1 *Networking*
- `KC-CON-001-confidence` — aligns with phase1 *Confidence*
- `KC-SLS-002-selling-is-serving` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-SLS-001-ethical-selling`

**Recommended Apprenticeships™**

- *Serving Sales Apprenticeship™* *(planned)*

**Recommended Business Labs™**

- *Offer Conversation Lab™*
- *Follow-Up Script Lab™*

**Recommended Simulations™**

- *Discovery Call Simulation™*
- *Gentle Close Simulation™*

**Recommended Challenges™**

- *One Honest Follow-Up™*
- *Serve One Person This Week™*

**Make It Mine™ opportunities**

- "What would selling look like if you were only helping people who need you?"
- "Would you like help with the words for one follow-up you've been avoiding?"

**Evidence Vault™ opportunities**

- Thank-you message from client after honest conversation
- Member reflection on a sale that felt like service

**Growth Profile™ connections**

- `sales-confidence`
- `service-leadership`
- `relationship-building`
- `revenue-courage`

---

### 10. Scattered → Strategic

**Transformation name:** From Scattered to Strategic™

**Common member statements**

- "I'm chasing shiny objects."
- "I don't have a real strategy."
- "I say yes to everything."
- "I don't know what to focus on this quarter."
- "My business feels random."

**Underlying competencies**

- Strategic thinking
- Focus
- Offer clarity
- Saying no
- Quarterly direction

**Recommended drawers**

- Strategic Thinking (`drawer-strategic-thinking`)
- Business Growth (`drawer-business-growth`)
- Offers (`drawer-offers`)
- Innovation (`drawer-innovation`)
- Pattern Recognition (`drawer-pattern-recognition`)

**Recommended Knowledge Cards™**

- `KC-ST-001-strategic-foresight`
- `KC-BG-001-growth-with-intention`
- `KC-OFF-001-offer-clarity`
- `KC-PR-001-seeing-patterns` — aligns with phase1 *Seeing Patterns*
- `KC-ST-002-one-bet-per-quarter` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-ST-001-strategic-foresight`
- `bmm-KC-OFF-001-offer-clarity`

**Recommended Apprenticeships™**

- *Strategic Focus Apprenticeship™* *(planned — 90-day arc)*

**Recommended Business Labs™**

- *Quarterly Bet Lab™*
- *Stop Doing List Lab™*

**Recommended Simulations™**

- *Opportunity Filter Simulation™* — practice declining good-but-wrong ideas

**Recommended Challenges™**

- *Name the One Bet™* — one strategic priority for the next 90 days

**Make It Mine™ opportunities**

- "If you could only grow one way this quarter, which would matter most?"
- "Would you like help writing a 'not now' list you can actually trust?"

**Evidence Vault™ opportunities**

- Quarterly focus document
- Results review at quarter end

**Growth Profile™ connections**

- `strategic-thinking`
- `focus`
- `business-direction`
- `pattern-recognition`

---

### 11. Self-Doubt → Entrepreneurial Confidence

**Transformation name:** From Self-Doubt to Entrepreneurial Confidence™

**Common member statements**

- "I'm not sure I can do this."
- "Everyone else seems more qualified."
- "Imposter syndrome is killing me."
- "I don't feel like a real entrepreneur."
- "I second-guess everything."

**Underlying competencies**

- Entrepreneurial identity
- Self-leadership
- Evidence of capability
- Resilience
- Learning from action

**Recommended drawers**

- Confidence (`drawer-confidence`)
- Leadership (`drawer-leadership`)
- Learning (`drawer-learning`)
- Thinking Skills (`drawer-thinking-skills`)
- Creative Thinking (`drawer-creative-thinking`)

**Recommended Knowledge Cards™**

- `KC-CON-001-confidence`
- `KC-LDR-001-leading-with-clarity`
- `KC-LRN-001-learning-how-to-learn`
- `KC-CRT-001-creative-leaps` — aligns with phase1 *Creative Leaps*
- `KC-CON-002-evidence-of-growth` *(planned)*

**Recommended Business Mastery Minutes™**

- `bmm-KC-CON-001-confidence`

**Recommended Apprenticeships™**

- *Entrepreneurial Confidence Apprenticeship™* *(planned)*

**Recommended Business Labs™**

- *Wins You Forgot Lab™* — inventory capability evidence
- *Leader Identity Lab™*

**Recommended Simulations™**

- *Hard Conversation Simulation™* — practice showing up despite doubt

**Recommended Challenges™**

- *Name Three Wins™*
- *Do One Brave Thing™*

**Make It Mine™ opportunities**

- "What evidence do you already have that you can do hard things?"
- "Would you like help separating the feeling from the facts?"

**Evidence Vault™ opportunities**

- Client testimonial, outcome, or milestone member is proud of
- Journal entry on courage moment

**Growth Profile™ connections**

- `entrepreneurial-confidence`
- `resilience`
- `self-leadership`
- `identity`

---

## Statement → transformation quick match

Estate Intelligence™ uses fuzzy matching on **common member statements** — not keyword bingo.

| If member language suggests… | Primary transformation |
|------------------------------|----------------------|
| Stuck, too many ideas, don't know where to start | Overwhelmed → Organized |
| Hidden, afraid to market, no visibility | Invisible → Visible |
| Price fear, worth, discounting | Undercharging → Confident Pricing |
| Busy but not productive, reactive | Busy → Productive |
| Can't decide, analysis paralysis | Hesitant → Decisive |
| Procrastination, inconsistency, ADHD struggle | Procrastinating → Consistent |
| Solo, bottleneck, can't delegate | Solo Operator → Business Owner |
| AI fear, tool overwhelm | Tech Overwhelm → AI Confidence |
| Hate selling, pushy, sleazy | Fear of Selling → Serving with Confidence |
| Shiny objects, no strategy, scattered | Scattered → Strategic |
| Imposter, not qualified, self-doubt | Self-Doubt → Entrepreneurial Confidence |

**Tie-break:** When multiple match, prefer the transformation that addresses **emotion first** (overwhelm, fear, shame) before skill (pricing, marketing).

---

## Estate Intelligence™ integration

### What changes for members

The Institute stops feeling like a **library of topics**. It feels like a place that helps members **become the entrepreneur they want to be**.

### Internal pipeline (target)

```
Member utterance
  → transformationMapMatch(utterance)
  → TransformationMapEntry
  → estateIntelligenceHint(transformation)
  → one invitation (BMM · card · lab · conversation)
  → journeyEngine.recordJourneyLearning on completion
  → growthProfile.recordLearningCompletion
```

### Hint block shape (for LLM)

```
TRANSFORMATION MAP (mandatory when matched):
Journey: From Undercharging to Confident Pricing™
Member need: price confidence — not generic "pricing tips"
One primary invitation only. Name the journey warmly before naming drawers.
Never list curriculum as a menu. Permission before labs and Make It Mine™.
```

### Cross-room continuity

Transformations persist in [Estate Journey Engine™](../estate/ESTATE_JOURNEY_ENGINE.md) — paused work, return greetings, and topic study inform which transformation to resume.

---

## Authoring & maintenance

| When | Action |
|------|--------|
| New curriculum ships | Add card ids to relevant transformations |
| New member language emerges | Add to **common member statements** — Rule of Three before new transformation |
| New transformation needed | Propose on curriculum board — must pass [Spark Teaching Standards™](./SPARK_TEACHING_STANDARDS.md) quality checklist |
| Quarterly review | Shari reviews: Are journeys still how members describe their struggles? |

---

## Success

The Transformation Map™ is the **intelligence layer** that connects:

- **Conversations** — what members actually say
- **Curriculum** — Knowledge Cards™ and experiences (hidden behind the journey)
- **Coaching** — Shari as thinking partner
- **Implementation** — Make It Mine™ · Try It This Week™
- **Growth** — Growth Profile™ · Evidence Vault™

Members do not navigate a catalog. They grow through **named transformations** — one capable step at a time.

**The Institute is not where you learn about business. It is where you become the entrepreneur your business needs.**
