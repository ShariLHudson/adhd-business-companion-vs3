# Founder / GHL Ecosystem Dashboard — Build Prompts

Cursor build prompts for the **ADHD Business Ecosystem Dashboard** embedded in Go High Level at `/ecosystem/dashboard?access=TOKEN`.

**Embed URL:** `https://adhdbz.visualsparkstudios.com/ecosystem/dashboard?access=YOUR_TOKEN`

**Global rules (all prompts):**
- Aggregated intelligence only — **never store or display conversation text**
- Access token required (`ECOSYSTEM_DASHBOARD_TOKEN` / `x-ecosystem-dashboard-token`)
- GHL connector lives in `lib/ghl/`; user-facing surface in `lib/ecosystem/` + `components/ecosystem/`
- No auto-publish for content — founder approval required

---

## Prompt 1 — Ecosystem Event Tracking Foundation

**Status:** Built → `lib/ecosystem/eventTrackingEngine.ts`

```
Build Ecosystem Event Tracking Foundation.
Goal:
Create a centralized event tracking system for the ADHD Business Companion Ecosystem.
This is the foundation for future:
* Founder Intelligence
* GHL Dashboards
* Content Intelligence
* Business Intelligence
* User Intelligence
* Product Intelligence
Do not build dashboards yet.
Focus on collecting data.
---
Create:
eventTrackingEngine.ts
---
Track Events
User Events:
* User Registered
* User Login
* User Logout
* User Active
* User Inactive
* User Cancelled
Feature Events:
* Create Opened
* Create Completed
* Project Created
* Project Updated
* Focus Audio Started
* Focus Audio Completed
* Time Block Started
* Time Block Completed
* Clear My Mind Used
* Brain Dump Used
Document Events:
* Google Doc Created
* Google Sheet Created
* Google Form Created
* PDF Exported
* Copy Used
AI Events:
* Companion Conversation Started
* Companion Conversation Completed
---
Do not store conversation content in metadata.
Store only event type, feature, timestamp, and sanitized summaries.
---
Success Tests:
1. Events are recorded with correct types.
2. Events are queryable by user, feature, and date.
3. No conversation text in stored metadata.
4. Foundation ready for dashboard derivation.
```

---

## Prompt 2 — User Intelligence Foundation

**Status:** Built → `lib/ecosystem/userIntelligenceEngine.ts`

```
Build User Intelligence Foundation.
Goal:
Allow the ecosystem to learn from user patterns.
Do not store conversations.
Store signals only.
---
Create:
userIntelligenceEngine.ts
---
Track
User Struggles
Examples:
* Overwhelm
* Prioritization
* Focus
* Follow Through
* Decision Making
* Marketing
* Content Creation
---
Track
User Questions
Examples:
* What should I work on?
* Help me prioritize
* I'm overwhelmed
* I don't know where to start
---
Track
Emotional Signals
Examples:
* Frustrated
* Stuck
* Confused
* Excited
* Hopeful
---
Store Counts
Store Trends
Store Frequency
Store Date
---
Do not store conversation text.
Store only categorized signals.
---
Success Tests:
1. Signals are categorized.
2. Trends are tracked.
3. No conversations stored.
4. Data can be queried later.
```

---

## Prompt 3 — Content Intelligence Foundation

**Status:** Built → `lib/ecosystem/contentIntelligenceEngine.ts`

```
Build Content Intelligence Foundation.
Goal:
Convert ecosystem intelligence into content opportunities.
Create:
contentIntelligenceEngine.ts
---
Input
User Struggles
User Questions
User Language
Feature Requests
Product Feedback
---
Generate
Content Opportunities
Categories:
* Social Posts
* Blogs
* Newsletters
* Workshops
* Lead Magnets
* Webinars
* Podcast Episodes
* Email Series
---
Store
topic
frequency
opportunityScore
sourceSignals
createdAt
---
Example
Topic:
Overwhelm
Mentions:
427
Opportunity Score:
95
Suggested Assets:
* Blog
* Newsletter
* Workshop
* Social Posts
---
Do not generate content yet.
Only identify opportunities.
---
Success Tests:
1. Opportunities are created.
2. Topics are ranked.
3. Scores are calculated.
4. Data available for PostCraft later.
```

---

## Prompt 4 — ADHD Business Ecosystem Dashboard (GHL Embed)

**Status:** Built → `lib/ghl/`, `app/ecosystem/dashboard/`, `lib/ecosystem/businessEcosystemDashboard.ts`

```
Build ADHD Business Ecosystem Dashboard for Go High Level embed.
Goal:
Create an embeddable founder dashboard inside GHL that surfaces business ops,
founder workspace summary, product intelligence, and content opportunities.
---
Create:
- lib/ghl/client.ts — GHL Private Integration API client
- lib/ghl/auth.ts — token + founder cookie auth
- lib/ghl/buildDashboard.ts — assemble dashboard payload
- lib/ghl/types.ts
- app/api/ecosystem/dashboard/route.ts
- app/ecosystem/dashboard/page.tsx
- components/ecosystem/BusinessEcosystemDashboard.tsx
---
Requirements:
1. Embed at /ecosystem/dashboard (legacy /ghl/dashboard redirects)
2. GHL metrics when GHL_API_TOKEN + GHL_LOCATION_ID configured
3. Founder workspace summary from Supabase when configured
4. iframe-friendly headers in next.config.ts
5. Access token required — ECOSYSTEM_DASHBOARD_TOKEN or founder login
---
Security:
- No conversation text
- No private user PII
- Aggregated counts and summaries only
---
Success Tests:
1. Dashboard loads with valid access token.
2. Unauthorized requests return 401.
3. GHL metrics appear when API configured.
4. Embed works inside GHL iframe.
```

---

## Prompt 5 — Live Server Signal Sync + Live Content Opportunities

**Status:** Built → `lib/ecosystem/serverSignalStore.ts`, `lib/ecosystem/liveContentOpportunityGenerator.ts`

```
Build Live Content Opportunity Generator.
Goal:
Use live ecosystem signal counts to automatically generate content opportunities for the founder.
Input:
- User struggles
- User questions
- Emotional signals
- Product intelligence counts
Examples:
If overwhelm signals are high:
Suggest:
- social posts about overwhelm
- blog about ADHD overwhelm
- newsletter about what to do when everything feels urgent
- workshop idea about reducing overwhelm
If prioritization signals are high:
Suggest:
- post series about choosing what to work on
- lead magnet about ADHD priority rescue
- workshop about deciding what matters first
Requirements:
1. Use existing live ecosystem signal counts.
2. Rank content opportunities by frequency and trend.
3. Generate suggested assets:
   - Social Post
   - Blog
   - Newsletter
   - Workshop
   - Lead Magnet
   - Email Series
   - YouTube Video
4. Do not generate full copy — titles and angles only.
5. Wire companion → POST /api/ecosystem/signals → server counts → dashboard.
---
Create:
- lib/ecosystem/serverSignalStore.ts
- lib/ecosystem/clientSignalSync.ts
- app/api/ecosystem/signals/route.ts
- lib/ecosystem/liveContentOpportunityGenerator.ts
- GET /api/ecosystem/postcraft — PostCraft export JSON
---
Success Tests:
1. Companion signals sync to server (categories only).
2. Dashboard shows live counts.
3. Opportunities ranked by score and mentions.
4. PostCraft export includes titles, angles, signals — no chat text.
```

---

## Prompt 6 — PostCraft Content Draft Generator

**Status:** Built → `lib/ecosystem/postcraftDraftGenerator.ts`, `components/ecosystem/ContentDraftsPanel.tsx`

```
Build PostCraft Content Draft Generator.
Goal:
Turn live content opportunities into first-draft content assets for founder review.
Input:
Use existing /api/ecosystem/postcraft export.
Each opportunity includes:
- topic
- score
- trend
- asset type
- title
- angle
- source signals
Output:
Generate draft content for selected assets.
Supported asset types:
- Social Post
- Blog
- Newsletter
- Workshop
- Lead Magnet
- Email Series
- YouTube Video
Rules:
1. Do not auto-publish.
2. Drafts require founder approval.
3. Do not include conversation text.
4. Use only aggregated signals and topic summaries.
5. Keep tone warm, plain, ADHD-friendly, and supportive.
6. Store generated drafts as "Content Drafts."
7. Include status:
   - Idea
   - Drafted
   - Reviewed
   - Approved
   - Scheduled
   - Published
Create:
- lib/ecosystem/postcraftDraftGenerator.ts
- lib/ecosystem/postcraftDraftStore.ts
- app/api/ecosystem/postcraft/drafts/route.ts
- components/ecosystem/ContentDraftsPanel.tsx
- components/ecosystem/ContentDraftModal.tsx
---
Success Tests:
1. Select opportunity from PostCraft export.
2. Generate draft.
3. Uses title and angle.
4. No private conversation text.
5. Stored as drafted; approve sets postCraftSyncReady.
```

---

## Prompt 7 — GHL Intelligence Embed Polish + Founder Action Buttons

**Status:** Built → `lib/ecosystem/founderDashboardLocalState.ts`, `components/ecosystem/LiveContentOpportunitiesSection.tsx`

```
Build GHL Intelligence Embed Polish + Founder Action Buttons.
Goal:
Make the /ecosystem/dashboard embed feel polished and useful inside GHL.
Context:
The Live Content Opportunity Generator is working.
The dashboard can be embedded in GHL at:
https://adhdbz.visualsparkstudios.com/ecosystem/dashboard?access=YOUR_TOKEN
Now improve the founder experience inside the dashboard.
Requirements:
1. Add clear dashboard sections:
- Business Snapshot placeholder
- User Intelligence
- Product Intelligence
- Live Content Opportunities
- PostCraft Export
- System Status
2. Add founder action buttons to each content opportunity:
- Copy PostCraft JSON
- Copy Title
- Copy Angle
- Mark as Reviewed
- Send to Content Queue placeholder
- Create Google Doc placeholder
3. Add reviewed state:
- Founder can mark an opportunity Reviewed
- Reviewed items visually soften but remain visible
- Store reviewed state locally for now
4. Add Content Queue placeholder:
- When founder clicks Send to Content Queue, store the opportunity in a local content queue
- Queue statuses:
  - Idea
  - Drafting
  - Approved
  - Scheduled
  - Published
5. Add a simple Content Queue section:
- Shows selected opportunities
- Shows status
- Allows status change
6. Improve GHL embed styling:
- Clean white cards
- Soft rounded corners
- Deep teal headings
- Warm gold highlights
- Clear spacing
- No clutter
- Mobile/embed friendly
7. Security:
- Keep access token required.
- Do not expose conversation text.
- Do not show private user data.
- Only aggregated counts and summarized opportunities.
Success tests:
1. Dashboard loads inside GHL embed.
2. Content opportunities show action buttons.
3. Reviewed state works.
4. Content Queue stores selected opportunities.
5. Status can be changed.
6. PostCraft JSON copy still works.
7. No private conversation text appears.
```

---

## Prompt 8 — Founder AI Advisor

**Status:** Built → `lib/ecosystem/founderAiAdvisor.ts`, `app/api/ecosystem/advisor/route.ts`, `components/ecosystem/FounderAiAdvisorSection.tsx`

```
Build Founder AI Advisor.
Goal:
Add an AI advisor panel to the ADHD Business Ecosystem Dashboard (/ecosystem/dashboard)
so the founder can ask practical questions about signals, content priorities, and next actions —
without leaving the GHL embed.
---
Context:
The dashboard already shows User Intelligence, Product Intelligence, Live Content Opportunities,
Content Queue, Content Drafts, and PostCraft Sync Queue.
The founder needs a Shari-style coach that reads ONLY that aggregated dashboard context.
This is separate from the user-facing companion chat.
---
Create:
- lib/ecosystem/founderAiAdvisor.ts — build context block from dashboard payload
- lib/ecosystem/founderAiAdvisorPrompt.ts — system prompt (aggregated data only)
- app/api/ecosystem/advisor/route.ts — POST chat turn (token auth)
- components/ecosystem/FounderAiAdvisorSection.tsx — chat UI in dashboard
---
Input context (allowed):
- Aggregated signal counts (struggles, questions, emotions)
- Ranked content opportunities (topic, score, trend, titles, angles)
- Content queue items and statuses (local)
- Content draft statuses (approved / sync-ready counts)
- GHL business snapshot metrics (when connected)
- System status flags (GHL, signals, PostCraft connected)
---
Input context (forbidden):
- Raw companion conversation text
- User emails, names, or PII
- Individual user message history
---
Capabilities:
Answer founder questions such as:
- What should I publish first based on live signals?
- Which topic has the strongest opportunity right now?
- What are users struggling with most this week?
- What content is approved and waiting for PostCraft?
- What can wait until next week?
---
Rules:
1. Use only context provided in the API request — do not invent metrics.
2. Keep replies concise, warm, ADHD-friendly (short paragraphs, one clear next step).
3. Suggest dashboard actions (e.g. "Approve the overwhelm blog draft") but do not auto-execute.
4. Optional: return a structured suggestedAction for future wiring (copy title, open draft, etc.).
5. Reuse OPENAI_API_KEY with gpt-4o-mini; graceful fallback message when key missing.
6. Keep access token protection on /api/ecosystem/advisor.
---
UI:
- Place after Product Intelligence or as a collapsible "Founder AI Advisor" section
- Starter chips: "What should I publish first?", "Top user struggle?", "What's ready for PostCraft?"
- Show disclaimer: "Uses aggregated dashboard data only — no user conversations."
---
Success Tests:
1. Advisor responds using live dashboard context.
2. No conversation text in prompt or storage.
3. Unauthorized requests return 401.
4. Works inside GHL embed layout.
5. Graceful message when OPENAI_API_KEY not configured.
```

---

## Prompt 9 — Cross-System Intelligence Hub

**Status:** Built → `lib/ecosystem/crossSystemIntelligenceHub.ts`, `app/api/ecosystem/intelligence-hub/route.ts`, `components/ecosystem/CrossSystemIntelligenceHubSection.tsx`

```
Build Cross-System Intelligence Hub.
Goal:
Unify intelligence from multiple systems into one founder-facing hub on /ecosystem/dashboard.
Help the founder see how companion usage, GHL business metrics, content pipeline,
and product signals connect — without switching tools.
---
Systems to unify (read-only):
1. Companion ecosystem — aggregated user intelligence signals
2. Go High Level — contacts, pipeline, subscribers (when API connected)
3. Founder workspace — active projects, experiments, notes (when DB connected)
4. Content pipeline — local Content Queue + server Content Drafts
5. PostCraft — sync queue status (ready / sent / failed)
---
Create:
- lib/ecosystem/crossSystemIntelligenceHub.ts — merge + correlate all sources
- lib/ecosystem/crossSystemIntelligenceHub.test.ts
- app/api/ecosystem/intelligence-hub/route.ts — GET unified snapshot (token auth)
- components/ecosystem/CrossSystemIntelligenceHubSection.tsx — dashboard UI
---
Output: CrossSystemIntelligenceSnapshot
Include:
- topUserThemes (from signals)
- topContentOpportunities (from live generator)
- businessHealthSummary (from GHL when available)
- founderOpsSummary (projects / experiments when available)
- contentPipelineSummary:
  - queue items by status
  - drafts by status
  - sync queue ready / sent / failed counts
- correlations (examples):
  - "High overwhelm signals + low published content → prioritize overwhelm assets"
  - "Strong GHL trial count + high prioritization questions → lead magnet opportunity"
- recommendedFounderActions (max 3, plain language)
---
Rules:
1. Aggregated data only — never conversation text or PII.
2. Each subsystem failure degrades gracefully (show partial hub, flag what's missing).
3. Do not auto-execute actions — recommendations only.
4. Keep token auth on API route.
5. Hub section appears near top of dashboard (after Business Snapshot).
---
UI:
- Title: "Cross-System Intelligence Hub"
- Cards: User Themes · Business · Content Pipeline · Correlations
- Gold highlight on top recommended action
- Connection badges per subsystem (Live / Waiting / Not configured)
---
Success Tests:
1. Hub loads with signals only (no GHL / no workspace).
2. Hub enriches when GHL API connected.
3. Content pipeline counts match queue + drafts + sync queue.
4. Correlations generated when ≥2 signal sources have data.
5. No conversation text in API response.
6. Unauthorized requests return 401.
```

---

## Prompt 10 — PostCraft Sync Queue

**Status:** Built → `lib/ecosystem/postcraftSyncQueue.ts`, `components/ecosystem/PostCraftSyncQueueSection.tsx`

```
Build PostCraft Sync Queue.
Goal:
Create a queue for approved content drafts that are ready to send to PostCraft.
Use existing Content Drafts where postCraftSyncReady = true.
Create:
- lib/ecosystem/postcraftSyncQueue.ts
- app/api/ecosystem/postcraft/sync/route.ts
- components/ecosystem/PostCraftSyncQueueSection.tsx
Queue statuses:
- ready
- sent
- failed
- skipped
UI:
Add section to /ecosystem/dashboard after Content Drafts:
PostCraft Sync Queue
Show:
- title
- asset type
- status
- approved date
- last sync attempt
- error if failed
Buttons:
- Send to PostCraft
- Mark Sent
- Retry
- Skip
Rules:
- Do not auto-send.
- Founder must trigger send manually.
- If PostCraft API is not connected, show:
  "PostCraft is not connected yet."
- Never include conversation text.
- Only send approved draft content and metadata.
- Keep access token protection.
Success tests:
1. Approved draft appears in queue.
2. Unapproved draft does not appear.
3. Send button shows not connected if no PostCraft API key.
4. Mark Sent updates status.
5. Retry works after failed status.
6. Skip removes item from active queue.
```

**Implementation notes:**
- Env: `POSTCRAFT_API_URL` + `POSTCRAFT_API_KEY`
- Supabase: `supabase/ecosystem_postcraft_sync_schema.sql`
- Tests: `lib/ecosystem/postcraftSyncQueue.test.ts`

---

## Environment variables (reference)

```env
# GHL
GHL_API_TOKEN=...
GHL_LOCATION_ID=...
GHL_PAYING_TAG=paying
GHL_TRIAL_TAG=trial

# Dashboard embed auth
ECOSYSTEM_DASHBOARD_TOKEN=...

# Optional
OPENAI_API_KEY=...
POSTCRAFT_API_URL=...
POSTCRAFT_API_KEY=...
```

---

## Prompt index

| # | Name | Status |
|---|------|--------|
| 1 | Ecosystem Event Tracking Foundation | Built |
| 2 | User Intelligence Foundation | Built |
| 3 | Content Intelligence Foundation | Built |
| 4 | ADHD Business Ecosystem Dashboard (GHL Embed) | Built |
| 5 | Live Content Opportunity Generator | Built |
| 6 | PostCraft Content Draft Generator | Built |
| 7 | GHL Intelligence Embed Polish + Founder Action Buttons | Built |
| 8 | Founder AI Advisor | Built |
| 9 | Cross-System Intelligence Hub | Built |
| 10 | PostCraft Sync Queue | Built |
