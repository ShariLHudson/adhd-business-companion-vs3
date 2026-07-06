# Executive Resources Center™

**Single authoritative location for all important external resources**

| | |
|---|---|
| **Status** | Implementation Sprint 2 — department-organized V1 |
| **Route** | `/companion/founder/executive-resources-center` |
| **Engine** | `lib/executiveResourcesCenter/` |
| **Related** | [Executive Integration Center](./EXECUTIVE_INTEGRATION_CENTER.md) · [Founder Knowledge Vault](./FOUNDER_DOCUMENT_INDEX.md) · [Spark Master Library](./SPARK_MASTER_LIBRARY.md) |

> Do **not** scatter important external resources throughout Founder.  
> The Executive Resources Center remains the single authoritative location for external systems, AI tools, calendars, resources, documents, dashboards, and executive links.

---

## The One Office Principle™

Founder Studio™ is the Executive Headquarters.

Every external application becomes a specialized department. Founder decides. Founder prepares. Founder recommends. Founder teaches. External systems execute specialized work.

---

## Departments (V1)

| Department | Contents |
|------------|----------|
| **Executive** | Founder Studio™ |
| **Development** | Cursor, GitHub, Vercel, Railway, Supabase |
| **AI Studio** | ChatGPT, VSS Command Center GPT, Claude, Gemini, Perplexity, NotebookLM, ElevenLabs, Suno |
| **Google Workspace** | Gmail, Calendar, Drive, Docs, Sheets, Meet |
| **Marketing** | PostCraft™, LinkedIn, Facebook, Instagram |
| **Operations** | GoHighLevel™ — CRM, funnels, membership, automations, analytics |
| **Booking Calendars** | Framework Building, Curious Connections, Client Sessions, Sales, Networking, Strategic Growth |
| **Business Toolkit™** | Canva, Domains, Brand Assets (planned) |

Runtime: `lib/executiveResourcesCenter/sample/resourcesData.ts`

---

## Permanent knowledge links

| Surface | Route |
|---------|-------|
| Executive Integration Center | `/companion/founder/executive-integration-center` |
| Founder Knowledge Vault | `/companion/founder/founder-knowledge-vault` |
| Spark Master Library | `/companion/founder/spark-master-library` |

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
