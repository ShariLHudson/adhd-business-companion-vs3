# SOP Build Journey — Acceptance Example

**Version:** 1.0
**Status:** Canonical behavioral acceptance example for the SOP Build Type.
**Relationship to other documents:** subordinate to [`SOP_BUILD_JOURNEY_SPECIFICATION.md`](./SOP_BUILD_JOURNEY_SPECIFICATION.md) (the requirements) and [`SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md`](./SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md) (the plan). Also see [`SOP_BUILD_JOURNEY_APPROVAL_RECORD.md`](./SOP_BUILD_JOURNEY_APPROVAL_RECORD.md) for the approved architectural decisions this example is checked against.

## How to use this document

**Do not copy it literally. Do not build a separate SOP system to reproduce it.**

The exact wording, the client-onboarding scenario, HoneyBook, Izna — none of that is the point. The point is the *shape* of the experience it demonstrates. Use it to check a planned or shipped implementation against ten properties:

1. Natural member language entering the experience
2. One SOP Build Type with adaptive discovery questions
3. Conversation before structure
4. Hidden Working Memory updates
5. Guided flow without feeling like a form
6. Optional visual mapping when useful
7. Research offered only when it adds value, and requires approval
8. External actions clearly remaining outside Spark unless an actual integration exists
9. Separate working and polished outputs
10. Exact continuation after leaving

A gap analysis against this example lives in the git history at the point this document was added, and should be re-run before any phase that touches conversation, output, or continuity behavior.

---

## Scenario

The member begins in the main conversation and says:

> "I want to create an SOP for onboarding new clients."

The member does not choose an SOP tool, template, workflow, or room. Spark recognizes the likely need and quietly begins the shared SOP Build Definition inside the existing conversation.

## Stage 1 — Understand What the Member Is Trying to Accomplish

**Member:** I want to create an SOP for onboarding new clients.

**Shari:** We can build that together. Before we start listing steps, what should be true when a new client finishes onboarding?

**Member:** They should understand how we work, know what I need from them, have access to everything, and be ready for our first strategy session.

**What Spark quietly understands:** Build candidate: SOP. Topic: client onboarding. Desired outcome: client is informed, prepared, equipped, and ready. Likely related capabilities: client onboarding knowledge, communication, checklists, calendar, external documents, project or client record. Current stage: understanding the goal.

**Estate Working Memory update:** Working title: Client Onboarding SOP. Current goal: create a repeatable client onboarding process. Why it matters: reduce confusion and prepare clients before the first strategy session. Current stage: outcome discovery. Next helpful step: identify who follows the SOP.

## Stage 2 — Identify Who Will Use the SOP

**Shari:** Who will follow this SOP most often—you, a team member, a virtual assistant, or someone else?

**Member:** My assistant, Izna, will handle most of it, but I still do the welcome call.

**Shari:** That helps. We'll make Izna's responsibilities clear and separate the steps that still belong to you. How familiar is she with your current onboarding process?

**Member:** She knows parts of it, but I still have to remind her what happens next.

**Shari:** Then this SOP needs to do more than list tasks. It should make the order, ownership, and handoffs obvious so she doesn't have to keep checking with you.

**What Spark quietly understands:** Primary user: assistant. Secondary participant: founder. Current problem: process exists partly in founder's head; sequence is unclear; handoffs are unclear; repeated reminders are required. Possible need for responsibility map. Possible need for checklist generated from SOP.

**Working Memory update:** SOP user: Izna. Founder responsibilities: welcome call and possibly approvals. Friction: reminders, unclear sequencing, incomplete shared knowledge. Emerging success condition: Izna can complete onboarding without repeated prompting.

## Stage 3 — Determine Whether the Process Already Exists

**Shari:** Do you already have pieces of this somewhere—emails, intake forms, notes, checklists, calendar reminders, or anything else?

**Member:** I have a welcome email, an intake form, and a checklist in a Google Doc, but they don't really connect.

**Shari:** Good—we won't start over. We can pull those pieces into one clear process and identify what's missing between them. Do you want to paste the checklist first, or would you rather walk me through what usually happens?

**Member:** I'll walk you through it first.

**What Spark quietly does:** Follows reuse-before-reinvention principle. Does not ask the member to upload everything immediately. Records existing assets (welcome email, intake form, Google Doc checklist) and marks them as related work to connect later.

**Working Memory update:** Existing assets found. Do not recreate unless improvement is needed. Open question: where each asset fits in the process.

## Stage 4 — Capture the Current Process Naturally

**Shari:** All right. A new client has just said yes and paid. What happens first?

**Member:** I send them the agreement.

**Shari:** Is that automatic, or do you send it personally?

**Member:** I send it through HoneyBook.

**Shari:** And what needs to happen before onboarding continues?

**Member:** They need to sign it.

**Shari:** So the first stage is really: send the agreement, confirm it's signed, and only then continue. What happens after the signature comes in?

**Member:** Izna sends the welcome email and the intake form.

**Shari:** Does she send both at the same time?

**Member:** Yes.

**Shari:** What does she need to check before she sends them?

**Member:** That the payment went through and the agreement is signed.

**Shari:** Perfect. That's an important decision point, not just another step.

## Stage 5 — Build the Process Map Quietly

At this point, Spark has enough structure for a useful map. Spark should not force the member into Visual Thinking or announce a system change.

**Shari:** I'm starting to see the flow. I've organized what you've shared into a simple process map so we can spot any missing handoffs while we keep talking.

**Member-facing map:** Client says yes and pays → Founder sends agreement through HoneyBook → Confirm payment received and agreement signed (if no: follow up; if yes: continue) → Izna sends welcome email and intake form → Client completes intake form → Izna reviews for missing information → Founder prepares for welcome call.

**Shari:** Looking at this, what normally happens if the client doesn't complete the intake form?

**Member:** Honestly, I usually notice at the last minute and send them another email.

**Shari:** That's exactly the kind of hidden step an SOP should catch. How long should Izna wait before following up?

**Member:** Two business days.

**Shari:** And if there's still no response?

**Member:** Follow up again, then tell me.

**What Spark quietly recognizes:** Missing follow-up process. Escalation rule. Timing dependency. Calendar/reminder capability may be helpful. This may produce a linked checklist or reminder later.

**Working Memory update:** Follow-up after two business days. Second follow-up, then escalate to founder. Map updated with waiting state and escalation.

## Stage 6 — Notice Hidden Decisions and Missing Information

**Shari:** Once the intake form is complete, what does Izna need to look for before she marks onboarding ready?

**Member:** She needs to make sure all the questions are answered and that we have their logo, website, and social links.

**Shari:** Anything that should make her stop and ask you before moving forward?

**Member:** If they mention a major problem with their business or something I should know before the welcome call.

**Shari:** Let's make that more concrete for her. What kinds of answers should be flagged?

**Member:** Maybe if they're thinking about closing the business, have a partner dispute, are changing their offer completely, or seem really overwhelmed.

**Shari:** Good. I'll treat those as review triggers rather than asking Izna to interpret the whole situation herself.

**Why this matters:** Spark is helping the founder expose expert judgment that would otherwise remain trapped in their head. The SOP is becoming a sequence, a decision guide, a responsibility guide, and an escalation guide — not merely a list of tasks.

## Stage 7 — Offer Research Only When It Adds Value

**Shari:** We already have the core process. One area where research might help is identifying common onboarding information businesses often forget to collect—things like communication preferences, access needs, key stakeholders, or technology requirements. Would you like me to research current client-onboarding best practices and bring back only the ideas that could strengthen your process?

**Member:** Yes, let's do that.

**Shari:** I'll focus on practical onboarding practices for service-based businesses, and I'll keep the recommendations tied to your actual process rather than giving you a generic list.

**What Spark researches — prefer:** recognized customer-success guidance, official platform documentation where tools are involved, established service-business onboarding practices, accessibility and communication considerations.

**Avoid:** generic AI-generated listicles, unrelated enterprise processes, legal advice, adding complexity without business value.

**Example research return:**

**Shari:** I found four ideas that could improve your onboarding without making it heavier:

1. Ask how the client prefers to communicate. *So what:* Izna knows whether to use email, text, or another channel instead of guessing.
2. Confirm who else is involved in decisions. *So what:* you avoid discovering halfway through that a partner or team member also needs to approve something.
3. Ask about accessibility or meeting needs. *So what:* the client can participate fully from the beginning.
4. Give the client one clear onboarding timeline. *So what:* they know what happens before the welcome call and what you're waiting on from them.

I'd recommend adding all four, but you can choose. Would you like to add them, add only some, or leave the process as it is?

**Member:** Add all four.

**Shari:** I will. I'll place the first three in the intake review and the timeline in the welcome email.

**Research approval behavior:** Spark should never silently modify the SOP based on research. The member should be able to choose: add all, choose some, save for later, do not use.

**Working Memory update:** Research source summary. Findings approved by member. Exact changes approved. Research connected to relevant SOP sections.

## Stage 8 — Continue Capturing the Process

**Shari:** What happens after Izna confirms the intake is complete?

**Member:** She creates a client folder in Google Drive.

**Shari:** Does it follow a standard folder structure?

**Member:** It's supposed to, but sometimes we create different folders.

**Shari:** Would it help to define the standard structure here so every client folder starts the same way?

**Member:** Yes.

**Shari:** What folders should every client have?

**Member:** Agreement, Intake, Strategy, Content, Reports, and Shared Resources.

**Shari:** Should any of those stay internal, or can the client see all of them?

**Member:** Agreement, Intake, and Reports should be internal. Shared Resources is for the client.

**Shari:** That distinction is important. I'll include the folder structure and access rules so nothing private is shared accidentally.

**What Spark quietly identifies:** Data/access dependency. Privacy risk. Standard folder template opportunity. Possible related checklist. Potential Google Drive connection, but only if genuinely available.

## Stage 9 — Separate Responsibilities and Handoffs

**Shari:** Let's make the handoff between Izna and you clear. What must be completed before she tells you the client is ready for the welcome call?

**Member:** Agreement signed, payment confirmed, intake completed, folder created, and the call scheduled.

**Shari:** Does she prepare anything for you before the call?

**Member:** She should summarize the main intake answers and highlight anything unusual.

**Shari:** How would you like that summary delivered?

**Member:** In the client folder and also sent to me by email.

**Shari:** Then the handoff is complete only when both are done. I'll make that explicit.

**Responsibility map:**

| Responsibility | Owner |
|---|---|
| Send agreement | Founder |
| Confirm payment and signature | Izna |
| Send welcome email and intake form | Izna |
| Follow up on missing intake | Izna |
| Escalate after second follow-up | Izna → Founder |
| Create client folder | Izna |
| Review intake for missing information | Izna |
| Flag major concerns | Izna |
| Prepare intake summary | Izna |
| Conduct welcome call | Founder |

## Stage 10 — Check Whether One SOP Is Enough

**Shari:** I'm noticing this process includes three distinct parts: agreement and payment confirmation, client intake and setup, preparation for the welcome call. We can keep them in one SOP, or make one main SOP with three clearly labeled stages. I would not separate them into three documents yet because Izna needs to see the full flow. Does one SOP with three stages feel right?

**Member:** Yes, one SOP with stages.

**Why this is important:** Spark recommends structure without forcing fragmentation, and avoids prematurely creating multiple builds or workflows.

## Stage 11 — Review the Captured Process Before Assembly

**Shari:** Here's the process we've captured so far — [Stage 1: send agreement, confirm signed, confirm payment. Stage 2: send welcome email + intake form, follow up after two business days, escalate after second unanswered follow-up, review required information, flag concerns, create the standard Drive folder structure, apply sharing permissions. Stage 3: schedule welcome call, summarize intake, highlight concerns, save summary, email summary.] Before I assemble the SOP, is anything important missing?

**Member:** We also need to add them to our CRM and send a Slack message to the team.

**Shari:** Good catch. When should those happen?

**Member:** After the payment and agreement are confirmed.

**Shari:** I'll add both to Stage 1 so the team and systems are updated before the onboarding work begins.

## Stage 12 — Completion Check

**Shari:** How should Izna know onboarding is complete and ready to hand over to you?

**Member:** Everything should be marked complete, the folder should exist, the call should be scheduled, and I should have the summary.

**Shari:** Would a final checklist help her verify that before closing the onboarding task?

**Member:** Yes.

**Shari:** I'll create that from the SOP rather than making you repeat the information.

**Generated completion checklist:** Agreement signed · Payment confirmed · CRM updated · Team notified in Slack · Welcome email sent · Intake form sent · Intake completed · Missing information resolved · Concerns flagged · Client folder created · Permissions verified · Welcome call scheduled · Intake summary saved · Intake summary emailed to founder.

## Stage 13 — Troubleshooting and Exceptions

**Shari:** Let's cover the situations most likely to cause confusion. What should Izna do if: payment fails, the agreement is unsigned, the client does not complete the intake, the client asks to begin before onboarding is complete?

**Member:** Payment or agreement issues come to me. She handles the intake follow-up. If they want to start early, she should tell them we need the intake first and let me know.

**Shari:** Perfect. That gives her clear boundaries without asking her to make decisions that belong to you.

## Stage 14 — Assemble the SOP

**Shari:** We have enough to assemble a complete working SOP. I'll keep your decisions and language intact and organize them into a format Izna can follow. Would you like the working SOP exactly as we built it, a polished version, or both?

**Member:** Both.

## Stage 15 — Working SOP Output

**Client Onboarding SOP**

**Purpose:** Ensure every new client completes the required onboarding steps, receives the correct information and access, and is fully prepared for the first strategy session.

**Primary User:** Izna, Client Support Assistant

**Founder Responsibilities:** Send the client agreement · Resolve payment or agreement issues · Review escalated concerns · Conduct the welcome call

**Completion Standard:** Onboarding is complete when the agreement is signed, payment is confirmed, required information is collected, the client folder is created correctly, the welcome call is scheduled, and the founder receives the intake summary.

**Stage 1 — Confirm the Client Is Ready:** Confirm the founder has sent the agreement through HoneyBook. Confirm the agreement is signed. Confirm payment was received. If payment failed or the agreement is unsigned, notify the founder. Add the client to the CRM. Notify the team in Slack.

**Stage 2 — Collect Information and Set Up the Client Workspace:** Send the approved welcome email. Send the intake form. Include the onboarding timeline. If the intake form is incomplete after two business days, send the first follow-up. If there is still no response, send a second follow-up and notify the founder. Confirm the intake includes required business information, logo, website, social links, communication preference, key decision-makers, accessibility or meeting needs. Flag responses involving possible business closure, partner disputes, major offer changes, or serious overwhelm or instability. Create the Google Drive folder (Agreement, Intake, Strategy, Content, Reports, Shared Resources). Keep Agreement, Intake, and Reports internal. Share only approved client-facing folders.

**Stage 3 — Prepare for the Welcome Call:** Schedule the welcome call. Summarize the important intake responses. Highlight concerns, changes, or open questions. Save the summary in the client folder. Email the summary to the founder. Complete the onboarding checklist. Notify the founder that onboarding is ready.

**Troubleshooting:**
- *Payment failed or agreement unsigned* — Notify the founder. Do not continue onboarding until resolved.
- *Intake is late* — Send the first follow-up after two business days. Send a second follow-up if needed, then notify the founder.
- *Client wants to begin before completing intake* — Explain that the intake is required before the first strategy session and notify the founder.

## Stage 16 — Polished Version

The polished version may improve headings, clarity, action language, consistency, formatting, readability. It must remain a separate version.

**Shari:** I've created both versions. The working version preserves exactly what we decided. The polished version improves the wording and formatting but does not change the process. Would you like to compare them before saving the polished one as the final version?

**Member:** Yes.

**Comparison behavior:** the member should be able to view the working version, view the polished version, accept the polished version, keep both, edit either, restore the earlier version. **Spark must never silently replace the member's working version.**

## Stage 17 — Implementation and Connections

**Shari:** The SOP is usable now. There are three optional next steps that would make it easier to put into practice: create Izna's onboarding checklist from the SOP, schedule a review after she uses it with the next client, connect the welcome email, intake form, and Google Drive checklist. Which would be most helpful?

**Member:** Create the checklist and schedule a review.

**Shari:** When should we review it?

**Member:** After the next client completes onboarding.

**Shari:** I'll record that as the review trigger. Since the actual client date may not be known yet, I won't pretend a calendar event has been scheduled. I'll keep it as a waiting item until the next onboarding begins.

**Working Memory update:** Implementation — checklist created, review required after next real use. Waiting on — next client onboarding start date. Connected assets — welcome email, intake form, Google Drive checklist. Next helpful step — test SOP with next client.

## Stage 18 — Save and Leave

**Member:** I need to stop for now.

**Shari:** You're in a good stopping place. I've saved the complete working SOP, the polished version, Izna's checklist, the process map, the research you approved, the connected files we still need to link, and the plan to review this after the next onboarding. When you return, we can continue by linking the existing welcome email and intake form, or simply wait until the next client uses the process.

**Save state records:** Build Definition (SOP), build name, goal, why it matters, primary user, responsibilities, current stage, completed sections, working version, polished version, map, research and citations, checklist, decisions, open questions, waiting items, dependencies, connected work, next helpful step.

## Stage 19 — Resume Experience

Several days later:

**Member:** Continue my client onboarding SOP.

**Shari:** We finished the working and polished SOP, created Izna's checklist, and agreed to test the process with the next client. We still need to connect your existing welcome email and intake form. Would you like to work on those now, review the SOP first, or leave it ready for the next onboarding?

**What Spark must restore:** exact build, exact decisions, current status, unfinished connections, waiting item, next meaningful choice.

**Spark should not ask:** "What SOP?" · "Who is Izna?" · "What were we working on?" · "Would you like to start a new SOP?"

## Stage 20 — Learning After Real Use

After the next onboarding:

**Member:** Izna used the SOP, but she didn't know when to create the Google Drive folder.

**Shari:** That tells us the timing is not clear enough. Right now the folder step sits inside Stage 2, but we did not define whether it happens before or after the intake is complete. When do you want her to create it?

**Member:** As soon as the agreement and payment are confirmed.

**Shari:** I'll move that step into Stage 1 and update the checklist and process map so all three remain consistent. Is there anything else she had to ask you about?

**Learning behavior:** Spark updates the working SOP, the polished SOP (with approval), the checklist, the map, Working Memory, and version history. **It does not automatically add this experience to the global Expert Knowledge System.** It may create a candidate learning item, a possible knowledge improvement, or a Research Council review item.

---

## Required Code Acceptance Journey

The implementation should be able to prove this complete path:

**Entry.** Member says "I want to create an SOP for onboarding new clients." Spark recognizes the need, does not require browsing templates, begins a natural conversation, creates a thin SOP Build record.

**Understanding.** Spark captures desired outcome, intended user, existing assets, responsibilities, dependencies, why it matters.

**Guidance.** Spark asks one helpful question at a time, avoids repeating known information, identifies hidden decisions, recommends structure without forcing it.

**Research.** Spark offers research only where useful, explains why it may help, cites sources, asks permission before applying findings, preserves the member's original work.

**Mapping.** Spark creates or updates a map only when useful, keeps the map connected to the same work, does not force the member into another system.

**Output.** Spark produces a working SOP, a separate polished version, an optional checklist, a process map, implementation suggestions.

**Save.** Spark stores conversation context, build state, Working Memory, research, decisions, map, outputs, connections, next helpful step.

**Resume.** Member says "Continue my client onboarding SOP." Spark restores the exact context and continues without making the member reconstruct the work.

## Failure Signals

The implementation is wrong if Spark:

- immediately opens an SOP form
- asks the member to choose a template
- presents every SOP section at once
- generates the SOP before understanding the process
- asks the member to select Research, Visual Thinking, Projects, or Calendar
- repeats questions already answered
- silently adds research
- silently replaces the working version with the polished version
- claims something was connected or scheduled when it was not
- loses the process map
- loses the decisions after leaving
- resumes at the beginning
- treats completion as merely generating a document

## The "So What?"

The founder does not merely receive an SOP. They transfer a process out of their head, reduce repeated explanations, clarify responsibilities, catch hidden decisions, create a usable delegation tool, preserve related knowledge, prepare the work for implementation, and make it possible to continue improving the process over time.

That is the full Spark Estate experience the SOP build should prove.
