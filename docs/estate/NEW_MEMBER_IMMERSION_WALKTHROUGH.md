# New Member Walkthrough — Where Spark Estate Feels Like Software

| Field | Value |
|-------|-------|
| **Perspective** | Brand-new member, first day, never seen Spark Estate |
| **Goal** | Every moment that breaks the feeling of *home* |
| **Authorities** | Constitution · Living in Spark Estate · Spark Estate Bible |
| **Not** | Architecture diagrams — lived experience only |

---

## How to read this

Each **scene** is what you actually see and feel. **Breaks immersion** calls out the software tell — the moment you remember you are inside an application.

---

## Scene 1 — The door before the Estate

You land on a sign-in page. A logo, then words:

- **Spark Studio Companions**
- **ADHD Business Ecosystem™**

A headline says **Welcome.** Subtext: *I'm glad you're here.* That part is warm.

Then the form: email, password, **Sign in with Google**, **Forgot password?**, privacy line. If something fails, messages mention credentials and rate limits.

After auth, the whole screen becomes plain cream text:

> **Opening your space…**

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| **Spark Studio Companions** / **ADHD Business Ecosystem™** | Product branding, not a place. You are joining a *platform*, not arriving home. |
| Sign-in form | Every SaaS app starts here. The Estate has not appeared yet. |
| **Opening your space…** | Loading screen language. Homes do not "open" — you walk in. |
| Developer config banners (when misconfigured) | Raw env var names (`NEXT_PUBLIC_SUPABASE_URL`). Pure engineering. |

### What would feel like home

A threshold — porch light, door, Shari's voice — without corporate product names or loading copy.

---

## Scene 2 — First step inside (Welcome Home cinematic)

The browser tab title becomes **Spark Estate**. Good.

The screen fills with a photograph. The camera *moves* — a deliberate cinematic dolly inward. Optional narration plays. You did not ask for a tour; you are *watching an intro sequence*.

A button appears on the scene:

> **Stop**

(In development builds, a floating panel may also say **Welcome intro (dev)** with visitor kind, voice state, and cinematic progress — invisible to most production members, but proof the intro is a *system* being debugged.)

You wait through phases: intro → pause → chat reveal. Only then does conversation appear.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Cinematic dolly + timed phases | Onboarding video, not stepping onto a porch. |
| **Stop** button | You are controlling playback, not inhabiting a room. |
| Forced wait before you can speak | The app decides when you are allowed to talk. |
| Tab title change | Small, but reminds you this is a browser tab running a product. |

### What would feel like home

You are already *in* the room. Shari might look up. No "press Stop to skip the trailer."

---

## Scene 3 — Welcome Home, finally (still not quite home)

The photograph stays full-screen. Conversation sits in a **frosted panel anchored to the bottom-right** — like a chat widget on a website, not someone sitting with you in the room.

Floating in the corners:

- **Upper right:** your avatar with **⋯** — tooltip **Profile and settings**
- **Lower right:** a small book cover image — the Estate Guide, always there, like a help button

The sidebar and top bar are hidden. That helps. But the two floating controls are still **global app chrome**.

You tap the input. Placeholder:

> **What's on your mind?**

Fine — until the *first screen of choices* appears inside the chat card.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Bottom-right chat panel | Messenger / Intercom pattern. The room is wallpaper; chat is the product. |
| **⋯ Profile and settings** | Universal account menu — every app has this. |
| Fixed Guidebook button | Help FAB, not a book on a table you discover. |
| **What's on your mind?** | Generic chatbot placeholder (acceptable once; worse paired with a menu below). |

---

## Scene 4 — The concierge grid (Welcome Home invitations)

Before you type anything, the frosted card can show an **arrival header** and a list of tappable rows:

Lead line:

> **While you're here…**

Preamble:

> **You might enjoy…**

Then emoji buttons, for example:

| Button | Label |
|--------|-------|
| 🌞 | Plan My Day |
| 📋 | Continue Where I Left Off |
| 🌟 | Show Today's Suggestions |
| 🗺 | Explore the Estate |

Universal closers may include **Just Chat with Shari** and **Go Somewhere Else**.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| **While you're here… / You might enjoy…** | Concierge upsell / feature discovery — airport lounge tablet. |
| Emoji + feature name rows | App launcher grid wearing estate wallpaper. |
| **Plan My Day**, **Show Today's Suggestions** | Named product modules, not places in a home. |
| **Continue Where I Left Off** | Software resume session — accurate, but SaaS language on day one. |
| **Explore the Estate** | Tour / map unlock — gamified exploration prompt. |
| **Go Somewhere Else** | Literal navigation menu inside chat. |

### What would feel like home

Shari greets you once. One question. You answer. The house reveals itself through conversation — not a four-icon breakfast menu.

---

## Scene 5 — You try talking instead

You type: *I'm overwhelmed and don't know where to start.*

Shari responds (warmth varies by turn). Then — often — a **card or button offer** appears:

> **Step into Clear My Mind™**  
> or **Step into Momentum Builder™**

Secondary button might say **Step into** another trademarked room.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| **Step into [Feature]™** | Theme-park ride entrance, not *"We could sit in the garden if you want."* |
| Trademark bullets in buttons | Legal product naming, not place names spoken aloud. |
| Competing destination buttons | App router presenting two modules. Spec 108 asks for Yes · Stay · Map — not dual "Step into." |

---

## Scene 6 — You accept; the Estate "announces" the room

The scene cross-fades. A **centered plaque** animates in:

**The Conservatory™**  
*"Restoration, clarity, gentle thinking"*  
(or **Momentum Institute™** — *"Developing Better Entrepreneurs."*)

It holds ~2 seconds, then fades. *The Estate is introducing itself.*

Then the bottom-right chat card returns with **another** invitation grid — hero title, purpose paragraph, Shari welcome, and more emoji choices. Example conservatory copy:

> *We can simply enjoy the space, or if you'd like, I can help you with one of these.*

Buttons might include **Clear My Mind™**, **Journal**, **Peaceful Places™**, **Talk with Shari**, plus **Visit Another Room**.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Title + motto plaque animation | Chapter title card in a video game / museum exhibit. Constitution Art VIII: *the Estate never explains itself.* |
| Room **purpose** paragraph on screen | Exhibit placard. You are reading copy, not living somewhere. |
| Second invitation grid after arrival | Onboarding twice for one walk across the house. |
| **Visit Another Room** | Navigation affordance, not conversation. |
| Feature names (**Journal**, **Peaceful Places™**) | Modules, not rooms you walk to with Shari. |

---

## Scene 7 — You open anything that isn't "pure Welcome Home"

The **left sidebar** appears — narrow on phone, wide on desktop.

Brand at top: **Spark Studio Companions** again.

A vertical list of destinations (homestead signpost). At the bottom:

> **Connected Apps**  
> Google Calendar · Gmail · Google Drive

The **top bar** adds quick-launch buttons:

- **Clear My Mind**
- **Plan My Day** (may show a **badge count**)
- **Today's Reality**

Below that, a teal strip may appear:

> **ACTIVE**  
> with running workspace chips, pause/resume, close.

The **⋯ menu** is still in the corner. Open it:

**Your Estate**  
👤 Estate Profile™ — *Your account and companion preferences*  
📈 Growth Profile™ — *Capabilities and learning progress*  
🏛 My Institute Cabinet™  
⭐ Evidence Vault™  
📖 Journal™  
🛠 Portfolio™  
🌱 Seeds Planted™  
🎯 Goals & Projects™  
📊 Progress Timeline™  

**Conversation**  
💬 Start New Conversation  
☀️ Start New Day Conversation  

**Settings & Account**  
⚙️ Settings · 🔔 Notifications · 🎙 Voice Settings · 🚪 Log Out  

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Persistent sidebar | IDE / Notion / Slack navigation rail. |
| **Connected Apps** | Integration marketplace in your "home." |
| Top-bar feature shortcuts | Toolbar — three products one click away. |
| Badge count on Plan My Day | Notification semantics; homes don't badge your kitchen. |
| **ACTIVE** workspace bar | Task manager / OS dock for open windows. |
| Emoji feature catalog menu | Settings drawer from a mobile game. |
| **Start New Conversation** / **Start New Day** | Explicit session controls — chat product, not ongoing presence. |
| **Settings**, **Notifications**, **Log Out** | Account admin panel. |
| **Growth Profile**, **Progress Timeline** | Analytics dashboard vocabulary. |

You are now unmistakably in **an application with modules**.

---

## Scene 8 — Split screen: chat becomes a pane

You open **Create** or another workspace from the sidebar.

Desktop: screen splits — **💬 Chat** on the left (~40%), **🛠 Create** (or similar) on the right (~60%). Headers label the panes. Mobile: tabs **Chat | Create**.

Toggle: **Work With Shari**. View size controls. **Back** to Chat.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Split panes with labels | IDE, Figma, support-ticket + chat split. |
| **Work With Shari** toggle | Feature flag for assistance — not "Shari is here." |
| Chat / workspace tabs | Multi-window OS metaphor. |
| **Back** labeled **Home** or **Chat** | Browser/back-stack, not *"let's walk back."* |

The Estate is no longer a single room you share with someone. It is **two apps side by side**.

---

## Scene 9 — Grow (the hallway of "coming soon")

From the sidebar you enter **Grow**.

A panel with kicker **Grow**, a title (**Spark Cards**, **Guilds**, **Daily Discoveries**, etc.), marketing lead copy, and:

> *This room is taking shape. The architecture is in place — guided experiences will arrive here soon.*

A **Back** button returns to **Grow**.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| **Grow** as hub name | Product area, not a place on the property. |
| **coming soon / architecture is in place** | Dev roadmap text shown to members. |
| Marketing leads ("entrepreneurial capability") | Website feature page, not a room you entered. |
| Empty room with Back stack | Wizard flow / placeholder route. |

You walked into a construction tarp that talks like a Kickstarter page.

---

## Scene 10 — Momentum Institute

Beautiful wall photo. Drawers on the wall open to **Knowledge Cards**. Card counts. Panels slide in. **Discuss** / **Make it mine** learning modes. Cabinet saved to **My Institute Cabinet™**.

Shari may have greeted you with:

> *What would you like to do while we're here?*

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Drawer index + card count | LMS / content library UI. |
| **Knowledge Cards** as panels | Flashcard app inside the estate. |
| **Make it mine** | Product workflow label. |
| **Cabinet** as saved-items store | Bookmarks folder, not a physical cabinet you browse with Shari. |
| Menu-prompt greeting | Activity picker, not mentorship. |

Bible says lessons are **conversations** and Institute is **discovery** — this reads as **school**.

---

## Scene 11 — Evidence Vault (via menu or chat)

You open **Evidence Vault™** from the menu.

A growth-style panel: categories, **Expand** buttons, form fields — *What happened?*, *What improved?*, *What moved forward?*, attachments, **print**, **download**, archive periods.

Cards show dates and category labels in uppercase tracking.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| CRUD forms | Database entry screen. |
| **Expand** on cards | UI pattern, not opening a journal on a desk. |
| Print / download all | Export utilities. |
| Category taxonomy | CRM / ticket system. |
| Name drift (**Evidence Bank** in routes vs **Evidence Vault** in menu) | Internal code peeking through. |

Canon: proof on hard days, kept quietly — not a spreadsheet of wins.

---

## Scene 12 — A win happens (celebration)

You finish something meaningful. A white card slides into the chat:

Uppercase small title (**PROJECT MILESTONE** or similar). Message body. **×** dismiss. Footer: *No pressure to stay — just wanted you to know.*

No bell. No walk to a garden. No volume added to a book on the shelf.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| In-chat notification card | Toast / in-app alert. |
| Uppercase milestone label | Badge / achievement unlock. |
| Dismiss × | Notification center hygiene. |

Bible: **sometimes a bell**; accomplishments become **stories** in a book — not chat UI chrome.

---

## Scene 13 — Profile "estate rooms"

From the menu you open **Estate Profile™** or **Growth Profile™**.

Full-screen room photo (good). Centered chat (better than bottom-right here). But you arrived via **settings menu**, not by walking somewhere on the property.

Copy may reference account, preferences, capabilities, progress.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Profile opened from ⋯ menu | Account settings with estate wallpaper. |
| **Growth Profile** / progress framing | Dashboard disguised as a room. |
| ™ on personal labels | Product line branding on your identity. |

---

## Scene 14 — Returning the next day

Login may say **Welcome back.** (warm)

But the same menus, sidebars, **Start New Day Conversation**, badge counts, **ACTIVE** bars, and **Step into** offers return.

Long absence copy elsewhere in the ecosystem is guarded — but the **chrome** still feels like yesterday's app session resumed, not *coming home again*.

### Breaks immersion

| Moment | Why it feels like software |
|--------|---------------------------|
| Session reset buttons | Chat product hygiene. |
| Identical launcher grids | No memory of how you left the house — only the same buttons. |

---

## The immersion ledger (quick reference)

| Category | Software tells members see today |
|----------|----------------------------------|
| **Branding** | Spark Studio Companions, ADHD Business Ecosystem™, ™ everywhere |
| **Auth** | Sign-in form, Forgot password, Opening your space… |
| **Onboarding** | Cinematic dolly, Stop, timed chat reveal |
| **Chat placement** | Bottom-right widget panel |
| **Global chrome** | ⋯ menu, Guidebook FAB, sidebar, top bar, ACTIVE bar |
| **Invitations** | While you're here…, emoji feature grids |
| **Routing copy** | Step into…, Visit Another Room, Go Somewhere Else |
| **Arrivals** | Title + motto plaques |
| **Navigation** | Back Home, Chat pane, workspace tabs, Connected Apps |
| **Placeholders** | Architecture is in place… coming soon |
| **Institute** | Drawers, card counts, Make it mine |
| **Evidence** | Forms, Expand, export |
| **Celebration** | Milestone notification cards |
| **Settings** | Notifications, Voice Settings, Log Out in estate menu |

---

## The single test (from the Bible)

After each scene, ask:

> *Would I forget I'm using an application — or am I managing one?*

Today, a new member **manages one** by Scene 4 — and **definitely** by Scene 7.

---

## What already whispers "home" (preserve these)

- Full-bleed photography when assets exist  
- Welcome Home hiding sidebar/top bar (partial sanctuary)  
- Some Shari lines in template copy (*Pull up a chair*, *Things grow at their own pace*)  
- Warm login subtext (*I'm glad you're here*)  
- Recognition card footer tone (*No pressure to stay*) — right spirit, wrong container  
- Ambient sound on some room arrivals (when not overshadowed by plaques)  

These are seeds. They are buried under launcher chrome.

---

## Document control

Companion to [ARCHITECTURAL_RESET_GAP_REPORT.md](./ARCHITECTURAL_RESET_GAP_REPORT.md). Experience audit only — no code changes.
