# 190 — Migration map

| Feature | Old | New | Action |
|---------|-----|-----|--------|
| Project list | companion-projects-v1 | same | **keep** |
| Items tree | companion-project-items-v1 | same + nest under sections | **keep / deepen** |
| Create wizard (3 fixed pieces) | ProjectsPanel chunks `[,,]` | Flexible pieces + Project Homes steps | **migrate** |
| Project Homes create (2 steps) | purpose → room | intention → why → pieces → room | **migrate** |
| Archive | React-only flag | `Project.archived` | **migrate** |
| Current focus | Display / nextAction | Editable → nextAction | **keep / deepen** |
| Structure UI | ProjectBreakdown (legacy) + Home lists | Home embeds ProjectBreakdown | **keep** |
| Samples | SAMPLE_PROJECT_HOMES | Explore Examples only | **keep** |
| Supabase projects | none | none (local authoritative) | **retire expectation** |
| Dual primary UI | projects section + project-homes | Prefer project-homes | **retire** legacy as primary |

**Risk:** Do not delete historical project data. Optional fields only.
