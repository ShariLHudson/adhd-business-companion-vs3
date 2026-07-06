# Executive Resources Center™

**Single authoritative location for all important external resources**

| | |
|---|---|
| **Status** | Binding — implementation sprint |
| **Route** | `/companion/founder/executive-resources-center` |
| **Engine** | `lib/executiveResourcesCenter/` |
| **Related** | [Executive Integration Center](./EXECUTIVE_INTEGRATION_CENTER.md) · [Founder Knowledge Vault](./FOUNDER_DOCUMENT_INDEX.md) · [AI Extensions](../lib/founderAiExtensions/) |

> Do **not** scatter important external resources throughout Founder.  
> The Executive Resources Center remains the single authoritative location for external systems, AI tools, calendars, resources, documents, dashboards, and executive links.

---

## What lives here

| Category | Surface |
|----------|---------|
| **Connected systems** | Ecosystem systems status table |
| **Mission Control (full)** | Link to Executive Integration Center |
| **AI extensions** | ChatGPT, Claude, Gemini, Cursor, image tools |
| **Documents & prompts** | Link to Founder Knowledge Vault |

Founder Studio remains the **Executive Headquarters**. Resources are extensions and departments — not separate headquarters.

---

## Admission gate (five questions)

Whenever a new external tool becomes important to Visual Spark Studios, ask:

1. Does Shari use this at least weekly?
2. Does it save time?
3. Does it contribute to the Spark ecosystem?
4. Should it be available from the Executive Resources Center?
5. Does Founder need to understand what this tool does?

**If all five are YES** → add it to the Executive Resources Center.

**If any are NO** → do not add a scattered shortcut elsewhere in Founder.

Runtime: `evaluateExecutiveResourceAdmission()` in `lib/executiveResourcesCenter/`

---

## Where to add new resources

| Resource type | Add to |
|---------------|--------|
| Connected system (CRM, email, dev tool) | `lib/executiveIntegration/sample/integrationData.ts` + Resources Center |
| AI specialist tool | `lib/founderAiExtensions/sample/aiExtensionsData.ts` + Resources Center |
| Constitution, blueprint, prompt | Founder Knowledge Vault + `FOUNDER_DOCUMENT_INDEX.md` |
| Dashboard / external link | Resources Center view — not a new Founder room |

---

## What not to do

- New room per external tool  
- Duplicate links on Command Center, Strategy, or random panels  
- Paid API connections without explicit approval  
- Replacing Founder as headquarters  

---

## Success

Shari opens **one place** and finds systems, AI tools, documents, and executive links — with a clear rule for what earns a spot.
