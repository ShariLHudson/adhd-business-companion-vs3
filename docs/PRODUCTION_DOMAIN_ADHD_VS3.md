# Production domain — ADHD Business VS3

**Custom domain:** https://ecosystem.visualsparkstudios.com  
**Intended Vercel project:** `adhd-business-companion-vs3` (`prj_CjvG5ApXyd4fSS8APlREoZYI4mHz`)  
**Linked locally:** `.vercel/project.json` → same project  

## Verified audit (2026-07-13)

| Fact | Value |
|------|--------|
| Domain attached to | `adhd-business-companion-vs3` |
| Live Production (before cutover) | Branch **`main`** (not VS3) |
| Intended Production branch | **`deploy/companion-app-v3`** |
| Commit `5f464c0` | Ready **Preview** on adhd (+ also Preview on `spark-ecosystem-v4`) — not Production |
| `spark-ecosystem-v4` | Separate project; Production from **`v4.0-development`**; domain is **not** ecosystem.visualsparkstudios.com |

## Production env (adhd project)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (should be `https://ecosystem.visualsparkstudios.com`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI`
- `OPENAI_API_KEY`

## OAuth callbacks

- Companion Google **login**: Supabase provider → returns to `/companion/login`
- Google Workspace connect: `/api/google/callback` (not login)
- Microsoft companion login: not implemented

## Cutover checklist

1. Push entry/welcome fixes to `deploy/companion-app-v3`
2. Set Vercel Production Branch for `adhd-business-companion-vs3` to `deploy/companion-app-v3`
3. Confirm Production deployment SHA matches the welcome/entry commit
4. Verify https://ecosystem.visualsparkstudios.com → login when signed out
5. Confirm `NEXT_PUBLIC_APP_URL` and Google redirect URIs use the production domain
