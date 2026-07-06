# AI Knowledge / NotebookLM Strategy™

**Vault → Drive → NotebookLM**

| | |
|---|---|
| **Status** | Binding — AI research architecture |
| **Parent** | [EXECUTIVE_RESOURCES_CENTER.md](./EXECUTIVE_RESOURCES_CENTER.md) · [GOOGLE_DRIVE_STRUCTURE.md](./GOOGLE_DRIVE_STRUCTURE.md) |

---

## Role

NotebookLM is **NOT** document storage.

NotebookLM becomes the **research assistant** for large document collections — PDFs, transcripts, research papers, meeting notes, and workshop materials stored in Google Drive.

---

## Architecture

```
Founder Knowledge Vault™
        ↓
   Google Drive
        ↓
    NotebookLM
```

| Layer | Responsibility |
|-------|----------------|
| **Founder Knowledge Vault** | Curated executive view — what matters, authority level, related systems |
| **Google Drive** | Master file storage — originals and working documents |
| **NotebookLM** | Synthesis and search across large collections |

---

## When Founder should recommend NotebookLM

Founder should eventually recommend NotebookLM whenever questions require searching:

- Large collections of documents
- PDFs and long-form research
- Transcripts and meeting notes
- Research papers across multiple folders
- Cross-document synthesis

**Not** for: single-document lookup (use Vault), quick prompts (use AI Studio), or file storage (use Drive).

---

## Executive Resources Center

NotebookLM appears in **AI Studio** department with:

- Purpose: AI research assistant across document libraries
- Best for: Synthesis across Google Drive master files
- Open: https://notebooklm.google.com

---

## Indexing rule

Vault and Master Library items may include `inNotebookLmLibrary: true` when the document belongs in a NotebookLM research collection.

---

## Future

Universal Executive Search will include NotebookLM libraries as a search scope — see `lib/executiveResourcesCenter/types/executiveSearch.ts`.
