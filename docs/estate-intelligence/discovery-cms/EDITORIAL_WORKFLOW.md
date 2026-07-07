# Discovery Editorial Workflow™

| | |
|---|---|
| **Parent** | [Discovery CMS](./README.md) |

---

## Status flow

```text
Draft → Review → Approved → Live
  ↑        ↓         ↓
  └────────┴─────────┘

Live → Hidden → Live (re-validate)
Live → Retired (terminal)
```

---

## Transitions

| From | To | Rule |
|------|-----|------|
| Draft | Review | Content complete enough for review |
| Review | Draft | Needs rewrite |
| Review | Approved | Passes voice + accuracy review |
| Approved | Live | **Full validation must pass** |
| Approved | Review | Reopen for edits |
| Live | Hidden | Pause without deleting |
| Hidden | Live | Re-validate |
| Live | Retired | Permanent removal from rotation |
| Any | Retired | Archive |

**Blocked:** Draft → Live (must pass Review and Approved)  
**Blocked:** Approved → Live if validation fails

---

## Roles (V1 informal)

| Role | Action |
|------|--------|
| **Author (Shari)** | Write in Draft, submit to Review |
| **Reviewer (Shari)** | Approve voice and accuracy |
| **System** | Enforces validation before Live |

---

## Versioning

Increment `version` when meaning changes — not for typos only.

Update `lastUpdated` on every save.

---

## JSON edit workflow

1. Copy [CONTENT_TEMPLATE.md](./CONTENT_TEMPLATE.md) block into `discovery-library.json`
2. Set `status`: `"Draft"`
3. Write copy — run voice lint locally via tests
4. Move to `"Review"` → `"Approved"`
5. Set `"Live"` only after `validateDiscoveryForLive()` passes
6. Commit JSON — no application code change
