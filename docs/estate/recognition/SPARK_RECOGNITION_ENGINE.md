# SPARK_RECOGNITION_ENGINE.md
# Spark Estate™
# Unified Recognition Engine
Version: 1.0  
Status: Master Architecture  
Priority: Highest  
Use this file as the source of truth before rebuilding room-specific features.
---
# PURPOSE
The Spark Recognition Engine is the shared intelligence system that decides how meaningful moments should be preserved, celebrated, chronicled, revisited, or honored across Spark Estate™.
This system connects:
- Evidence Vault™
- Celebration Garden™
- Celebration Room™
- My Accomplishments Journal / Legacy Studio
- Hall of Accomplishments™
The member should never feel like they are choosing software tools.
Spark should help the moment find the right place.
Core question:
**How should this be remembered?**
---
# MASTER RULE
Spark suggests.  
The member decides.
Nothing permanent, public, celebratory, or Hall-related happens without member approval.
---
# ROOM RESPONSIBILITIES
## Evidence Vault™
Single job:
Preserve discoveries and meaningful evidence before they are forgotten.
Core question:
**What has my life been teaching me?**
Use for:
- discoveries
- lessons
- problems solved
- people helped
- progress
- things prevented
- ideas worth remembering
- business insights
- personal growth
- patterns noticed over time
Frequency:
Often.
This is the lowest-friction capture point.
---
## Celebration Garden™
Single job:
Give a quiet, reflective moment of recognition.
Core question:
**What deserves a quiet moment of gratitude?**
Use for:
- peaceful wins
- reflective wins
- meaningful but private progress
- bittersweet milestones
- gratitude
- small steady steps
- wins that feel tender rather than loud
Tone:
Calm, gentle, reflective, peaceful.
---
## Celebration Room™
Single job:
Give a joyful, expressive celebration.
Core question:
**What deserves joyful celebration today?**
Use for:
- exciting wins
- happy milestones
- festive moments
- breakthroughs that feel energizing
- accomplishments the member wants to enjoy out loud
Tone:
Joyful, festive, expressive, celebratory.
---
## My Accomplishments Journal / Legacy Studio
Single job:
Help the member tell the fuller story behind a meaningful win or milestone.
Core question:
**What story do I want to remember about this?**
Use for:
- fuller reflections
- photos
- videos
- documents
- voice memories
- certificates
- people involved
- lessons learned
- why it mattered
- future Hall exhibit preparation
This step is optional.
Never force journaling.
---
## Hall of Accomplishments™
Single job:
Honor defining life milestones as permanent exhibits.
Core question:
**What moments became part of my story?**
Use for:
- rare defining accomplishments
- major life milestones
- legacy moments
- accomplishments the member intentionally approves for permanent display
Nothing enters the Hall automatically.
---
# RECOGNITION LIFECYCLE
Do not show these labels to the member unless needed for management/admin.
Internal lifecycle states:
1. captured
2. preserved
3. recognized
4. celebrated_quiet
5. celebrated_festive
6. chronicled
7. hall_candidate
8. hall_exhibit
9. archived
A moment may skip stages.
A moment may stay in Evidence Vault™ forever.
A moment may become important months or years later.
---
# FAST PATH VS FULL EXPERIENCE
Every recognition flow must support two paths.
## Fast Path
Use when the member is in regular chat or wants low friction.
Example:
Spark:
This sounds worth preserving.
Buttons:
- Preserve it
- Celebrate it
- Not now
If Preserve it:
Save to Evidence Vault™ with minimal friction.
If Celebrate it:
Ask:
Would you like a quiet moment or a joyful celebration?
Options:
- Quiet moment
- Joyful celebration
- Help me decide
## Full Experience
Use when the member intentionally enters a room.
Examples:
- Evidence Vault™ door/key ritual
- Celebration Garden™ quiet path
- Celebration Room™ festive celebration
- Hall of Accomplishments™ gallery walk
The full experience should feel immersive.
The fast path should feel quick.
Never force the full ritual.
---
# SHARED MOMENT MODEL
Create or adapt a shared record model for recognized moments.
Suggested fields:
- id
- user_id
- title
- description
- date
- source_context
- source_room
- lifecycle_status
- tone
- significance_score_internal
- wing
- tags
- people
- project
- attachments
- related_evidence_ids
- related_journal_ids
- related_hall_exhibit_id
- celebration_type
- celebration_room
- hall_candidate_status
- hall_exhibit_status
- user_confirmed_hall
- created_at
- updated_at
- last_revisited_at
Do not expose all fields as required inputs.
Spark may infer quietly.
The member can edit later.
---
# TONE ROUTING
Tone determines celebration destination.
## Reflective tones route to Celebration Garden™
- reflective
- peaceful
- grateful
- bittersweet
- private
- tender
- calm
## Festive tones route to Celebration Room™
- joyful
- exciting
- triumphant
- festive
- proud
- energizing
- celebratory
Spark may suggest tone.
Member can override.
Correct language:
This feels like it could be a quiet celebration. Does that fit?
or
This sounds joyful. Would you like to celebrate it in the Celebration Room™?
Avoid technical labels.
---
# SIGNIFICANCE
Do not use “small / medium / big” language with the member.
Spark may internally estimate significance.
User-facing language:
- This feels worth remembering.
- This feels worth celebrating.
- This may become part of your story.
- This feels like a defining moment.
- Future you may want this one.
Significance can increase over time.
Do not assume a moment is Hall-worthy immediately unless the member clearly says so.
---
# RECOGNITION TRIGGERS
Spark should notice language such as:
- I did it
- I finally finished
- I helped someone
- I figured it out
- I solved it
- I learned something
- I got my first client
- I launched
- I published
- I made progress
- I don’t want to forget this
- this is huge
- I’m proud of myself
- I overcame
- I prevented
- it worked
- that changed everything
Spark response should be gentle.
Example:
This sounds like something worth remembering.
Would you like to preserve it in your Evidence Vault™?
Options:
- Preserve it
- Celebrate it
- Not now
---
# EVIDENCE VAULT™ RULES
Evidence Vault™ is the default home for discoveries.
If the member says something meaningful but not clearly celebratory, preserve first.
Do not route to Create unless the member explicitly asks to build something.
Example:
User:
I discovered how to create an amazing app for ADHD business people.
Correct:
This sounds like a meaningful discovery. Would you like to preserve it in your Evidence Vault™?
Incorrect:
I’d love to help you create this app.
---
# CELEBRATION GARDEN™ RULES
Use Celebration Garden™ for quiet or reflective recognition.
Full ritual may include:
Notice → One Step → One Choice → One Celebration → Celebrate the Journey
But the full ritual is optional.
Quick Garden acknowledgment must exist.
Small wins may be added to the sapling without full ceremony.
The sapling represents accumulated steady progress over time.
---
# CELEBRATION ROOM™ RULES
Use Celebration Room™ for joyful or expressive celebration.
The room can visually scale:
Small festive win:
- string lights
- chalkboard message
- small cheerful moment
Large festive win:
- cake
- balloons
- music
- stronger celebration
No fake hype.
No childish gamification.
No forced celebration.
---
# JOURNAL / LEGACY STUDIO RULES
After a meaningful win or celebration, Spark may ask:
Would you like to tell the story behind this while it is still fresh?
Options:
- Yes, open my Accomplishments Journal
- Not now
- Remind me later
This step is optional.
If used, it should help gather:
- story
- date
- photos
- documents
- certificates
- videos
- voice memories
- people involved
- why it mattered
- lessons learned
Journal / Legacy Studio entries may later support Hall exhibits.
---
# HALL OF ACCOMPLISHMENTS™ RULES
Hall is rare.
Hall is permanent-feeling.
Hall is member-approved.
Spark may suggest:
This feels like it may become part of your life story.
Would you like to prepare it as a possible Hall of Accomplishments™ exhibit?
Options:
- Start exhibit
- Mark as Hall Candidate
- Not now
Never induct automatically.
Hall induction requires explicit member confirmation.
Button:
Induct Into My Hall
After induction:
This moment is now part of your story.
---
# HALL DATA RULE
A Hall exhibit should be its own record that references supporting records.
Do not simply mutate the original Evidence Vault or Journal record into a Hall exhibit.
Hall exhibit references may include:
- evidence_vault_ids
- journal_entry_ids
- celebration_record_ids
- attachments
- people
- dates
- tags
This prevents editing/deleting confusion.
---
# DELETION RULES
Deleting a normal recognition record requires standard confirmation.
Deleting a Hall exhibit requires stronger confirmation.
Suggested language:
This will remove the exhibit from your Hall of Accomplishments™.
The original supporting records can remain in your Evidence Vault™ or Journal.
Do you want to remove this Hall exhibit?
Options:
- Remove from Hall
- Cancel
Do not delete supporting records unless separately requested.
---
# MANAGEMENT LAYER
Every room must include both:
1. Experience Layer
2. Management Layer
## Experience Layer
- immersive
- room-based
- emotional
- ritual-based
- beautiful
- minimal choices
## Management Layer
- practical
- clear
- fast
- plain
- search
- sort
- filter
- edit
- delete
- print
- export
Do not over-theme management utilities.
Members must be able to quickly manage records without walking through rituals.
---
# REQUIRED MANAGEMENT FEATURES
For Evidence Vault™, Celebration records, Journal entries, and Hall exhibits, support:
- search
- sort
- filter by date
- filter by room
- filter by lifecycle status
- filter by tone
- filter by tag
- filter by person
- filter by project
- edit
- delete
- print
- export PDF
- export text/markdown if available
- attach files
- mark as Hall Candidate
- remove Hall Candidate status
---
# ROUTING AND STATE RULES
Track these separately:
- visual_room
- conversation_context
- requested_destination
- active_recognition_flow
If the member asks to go to a room, visual room must update.
Never say “we’re already here” unless visual_room confirms the room is visible.
Room context wins over generic intent.
If inside Evidence Vault™, discovery language preserves.
If inside Hall, accomplishment language relates to exhibits.
If inside Celebration Garden™, win language routes through quiet recognition.
If inside Celebration Room™, win language routes through festive recognition.
---
# PATTERN DETECTION — VERSION 1
Keep simple and rule-based for the first build.
Examples:
- Same theme appears 3+ times in Evidence Vault™ within 90 days.
- Member manually marks multiple related discoveries.
- A discovery is revisited repeatedly.
- A project reaches completion.
- Member says this changed everything.
- Anniversary of a preserved discovery or accomplishment.
Spark may suggest:
I noticed several discoveries around this same theme.
Would you like to review them together?
or
This may be growing into a larger story.
Would you like to mark it as a Hall candidate?
Never nag.
Never auto-promote.
---
# COLD START RULES
If a room has no records yet, do not make it feel empty or disappointing.
## Evidence Vault™
Your Evidence Vault™ is ready.
When something feels worth remembering, Spark can help you preserve it here.
## Celebration Garden™
The garden is ready for small steps, quiet wins, and moments of gratitude.
## Celebration Room™
This room is ready whenever something deserves joyful celebration.
## Hall of Accomplishments™
Your Hall is waiting for the moments that become part of your story.
Nothing has to be added today.
---
# USER OVERRIDE RULE
If Spark suggests the wrong destination, member correction wins immediately.
Examples:
User:
No, this is more of a quiet celebration.
Spark:
You’re right. Let’s take it to the Celebration Garden™.
No argument.
No repeated confirmation.
---
# SUCCESS OUTCOME
The system succeeds when the member feels:
- Spark notices what matters.
- Spark helps me preserve what I might forget.
- Spark helps me celebrate in a way that fits the moment.
- Spark helps me tell the story when I am ready.
- Spark helps me recognize the milestones that became part of my life.
- I can manage everything later without losing the magic.
