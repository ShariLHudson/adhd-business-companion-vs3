# Standard 071 — Workspace Continuity & Resume Architecture

**Status:** Implemented (unit evidence) · **Browser certification:** NOT CERTIFIED until Founder Validation  
**Depends on:** Standard 066 (Current Focus ownership — do not redesign)

## Rule

An active Creation Workspace is a first-class platform object. It may never become unreachable.

Every active Creation always has:

1. one Workspace ID  
2. one Runtime Creation Record  
3. one Current Focus  
4. one Resume Target (`estate-create`)  
5. one canonical registry entry  

## Canonical source

`lib/activeWorkspaceRegistry/`

All resume surfaces query the registry:

- Welcome Home / Continue Where I Left Off  
- Create → Continue / Older Drafts (`listActiveCreationWorkspaces`)  
- Projects → Continue Your Work  
- Chat resume phrases  
- ContinuityManifest (`active-creation` items)  
- Refresh hydration from Runtime Creation Records  

## Protected (066)

Do not change Current Focus sole interaction ownership while implementing continuity.

## Chat

Resume phrases must reopen the workspace with natural guidance:

> I've reopened your workshop. We were working on your outcomes section.

Never: new Create · “Opening Create beside us” · Create Landing.
