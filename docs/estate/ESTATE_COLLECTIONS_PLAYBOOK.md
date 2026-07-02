# Estate Collections Playbook™

Helping Spark know where every meaningful moment belongs.

This is the canonical reference for Cursor, conversation intelligence, and every future Estate feature. **Philosophy first — technology follows.**

| Document | Role |
|----------|------|
| **This Playbook** | What belongs where — lists, decision tree, cross-room table |
| [Collection Intelligence™](./ESTATE_COLLECTION_INTELLIGENCE.md) | How Spark *thinks* — emotion, priority, 120 examples, cross-links, future memory |
| [User Journey™](./ESTATE_COLLECTION_USER_JOURNEY.md) | How visitors *live* with entries over months and years |

**Runtime module:** `lib/estate/collectionFramework/estateCollectionsPlaybook.ts`

---

## Journal Gazebo

**Purpose:** Capture thoughts, reflections, emotions, ideas, and life as it happens.

**Belongs here**

- Feeling overwhelmed
- Great idea
- Prayer
- Gratitude
- Vacation memory
- Tough day
- Brainstorming
- Family story
- Dream you had
- Quote you love
- Something you learned
- Book notes
- Random thought
- Lesson from today
- Conversation that touched you
- Letter you'll never send
- Reflection after a coaching session
- Personal insight
- Business idea
- Daily journal

---

## Growth Greenhouse

**Purpose:** Record things that are still developing.

**Belongs here**

- Becoming more patient
- Improving communication
- Building confidence
- Health journey
- Learning to delegate
- Better boundaries
- Public speaking confidence
- Better listener
- Exercise consistency
- Spiritual growth
- Marriage improving
- Leadership development
- Better habits
- Learning AI
- Building resilience
- Time management improving
- More organized
- Emotional growth

---

## Evidence Vault

**Purpose:** Preserve proof that you solved problems and made a difference.

**Belongs here**

- Solved a difficult client issue
- Prevented a major mistake
- Improved a process
- Resolved a conflict
- Saved a project
- Helped a customer
- Fixed software
- Negotiated successfully
- Handled criticism well
- Solved a family problem
- Saved money
- Improved efficiency
- Created a workaround
- Helped someone succeed
- Took initiative
- Made a difficult decision
- Managed a crisis
- Learned from failure

---

## Achievement Library

**Purpose:** Preserve your life's work.

**Belongs here**

- Published a book
- Finished a course
- Started a business
- Built a website
- Created a workshop
- Designed a product
- Recorded a podcast
- Wrote an article
- Received certification
- Won an award
- Created a journal
- Built Spark Estate
- Finished a presentation
- Created a template
- Invented a process
- Developed a GPT
- Finished a major project
- Created artwork

---

## Celebration Garden

**Purpose:** Celebrate progress.

**Belongs here**

- Drank enough water today
- Walked today
- Lost 2 pounds
- Finished laundry
- Asked for help
- Sent the email
- Called a friend
- Took a break
- Stayed calm
- Finished today's priority
- Ate healthy
- Got outside
- Meditated
- Cleaned the office
- Finished a chapter
- Good family moment
- Small client win
- Great compliment
- Wonderful conversation
- Did something brave

---

## Celebration Hall

**Purpose:** Preserve landmark life moments.

**Belongs here**

- Published first book
- Million-dollar milestone
- Retirement
- Wedding
- Graduation
- Major anniversary
- Grandchild born
- Business launch
- National award
- TED Talk
- Bought dream home
- Lifetime achievement
- Company acquisition
- Hall of Fame
- Major patent
- Best-selling author
- Landmark court victory
- Thirty-year business anniversary

---

## Cross-room examples

| Moment | Journal | Greenhouse | Evidence | Achievement | Garden | Hall |
|--------|:-------:|:----------:|:--------:|:-----------:|:------:|:----:|
| Had a great idea | ✓ | | | | | |
| Solved difficult client issue | | | ✓ | | ✓ | |
| Built new website | | | | ✓ | ✓ | |
| Published first book | | | | ✓ | ✓ | ✓ |
| Feeling discouraged | ✓ | | | | | |
| Becoming more patient | | ✓ | | | | |
| Lost 20 pounds | | ✓ | | | ✓ | |
| Finished Guidebook | | | | ✓ | ✓ | |
| Spark Estate launched | | | ✓ | ✓ | ✓ | ✓ |
| Wonderful family vacation | ✓ | | | | ✓ | |
| Learned something important | ✓ | ✓ | | | | |
| Helped a friend through crisis | | | ✓ | | ✓ | |

When a moment naturally belongs in more than one room, Spark suggests the primary room first and may offer a **multi-room invitation** — never auto-saving to both.

**Example multi-room language:**

> I think this deserves more than one place in the Estate. We could preserve it in your Achievement Library as part of your life's work, and we could also celebrate it in the Celebration Garden. Would you like to do both?

Permission always comes first. The member chooses one room, both (one save at a time), or neither.

---

## Spark's decision tree

Rather than asking members to decide where something belongs, **Spark makes the first suggestion.**

| If the member is sharing… | Suggest |
|---------------------------|---------|
| Thoughts, feelings, ideas | Journal Gazebo |
| Something that's improving over time | Growth Greenhouse |
| A problem they solved or improvement they made | Evidence Vault |
| Something they created or completed | Achievement Library |
| A success or happy moment | Celebration Garden |
| A once-in-a-lifetime milestone | Celebration Hall |

### Non-negotiables

1. **Permission first** — every offer is a question; nothing auto-saves.
2. **One thoughtful offer at a time** — no menu unless the member asks for a different room.
3. **Conversation before collections** — if the member needs support, help first.
4. **Place language, not feature language** — "rest on the shelf," not "save to database."

---

## How this connects to code

| Concern | Module |
|---------|--------|
| Playbook data + scoring | `estateCollectionsPlaybook.ts` |
| Permission offers in chat | `collectionOfferIntelligence.ts` |
| Yes / no / menu / open room | `collectionOfferFlow.ts` |
| Room meaning + capture UI | `registry.ts` |
| Dev verification | `COLLECTION_FLOW_QA.md` |

When adding a new collection signal, update **this playbook first**, then the TypeScript module, then run collection tests.

---

## Design test

> Would a member feel Spark understood what kind of moment this was — without being asked to classify it themselves?

If no → refine the playbook before adding more patterns.
