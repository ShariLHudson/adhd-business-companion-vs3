# Vercel deploy — adhd-business-companion-vs3

This GitHub repo **is** the ADHD Ecosystem app. `package.json` lives at the repository root.

**Production URL:** `https://ecosystem.visualsparkstudios.com`

## Required Vercel project settings

| Setting | Value |
|--------|--------|
| **Git repository** | `ShariLHudson/adhd-business-companion-vs3` |
| **Production branch** | `main` |
| **Root Directory** | *(leave empty)* — **not** `companion-app` |
| **Framework** | Next.js |
| **Build command** | `npm run build` |
| **Install command** | `npm install` |

If Root Directory is set to `companion-app`, the build will fail because that folder does not exist in this repo.

## Custom domain (ecosystem.visualsparkstudios.com)

Custom domains attach only to **Production** deployments (from `main`). **Preview** deployments from feature branches show “Assigning Custom Domains: Skipped” — that is expected.

1. **Vercel → Project → Settings → Domains** → add `ecosystem.visualsparkstudios.com` (if missing).
2. **Settings → Git → Production Branch** → must be `main`.
3. **Deployments** → find the deployment with:
   - Environment: **Production** (not Preview)
   - Branch: **main**
   - Commit: latest on `main` (e.g. `9de64e4`)
4. If Production is still on an old commit: open the latest `main` deployment → **⋯ → Promote to Production** (or push to `main` to trigger a new Production build).
5. DNS: domain should CNAME to `cname.vercel-dns.com` (Vercel shows the exact record in Domains).

`NEXT_PUBLIC_APP_URL` in Vercel env (Production) should be `https://ecosystem.visualsparkstudios.com` for auth redirects.

## Required environment variables (Production)

After adding or changing any variable, **Redeploy** the latest `main` Production deployment.

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Create draft generation, companion chat, refine, brain dump classify |
| `NEXT_PUBLIC_APP_URL` | `https://ecosystem.visualsparkstudios.com` — auth redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Supabase → Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable / anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** — required for **Create account** / sales-funnel sign-up (provisions users without email confirmation). Supabase → Project Settings → API → **service_role** secret. Never use a `NEXT_PUBLIC_*` name. |

Alternative name accepted by the app: `SUPABASE_SECRET_KEY` (same value as service role).

**Verify after redeploy:** `https://ecosystem.visualsparkstudios.com/api/debug/env-check` should show `hasServiceRoleKey: true` and `authConfigured: true`.

### Troubleshooting

- **Create draft fails** — browser console `CREATE ERROR` with `No API key` or `missing_api_key`: add `OPENAI_API_KEY` and redeploy.
- **Create account fails** — *“Server auth provisioning is not configured. Add SUPABASE_SERVICE_ROLE_KEY…”*: add the service role key above and redeploy.

## After pushing fixes

1. Open the **Production** deployment for the latest commit on `main` (not a Preview from a feature branch).
2. Or click **Redeploy** on the latest `main` commit — do not redeploy an old failed Preview only.

## Local verify

```bash
npm install
npm run build
```
