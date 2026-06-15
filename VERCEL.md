# Vercel deploy — adhd-business-companion-vs3

This GitHub repo **is** the app. `package.json` lives at the repository root.

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

## After pushing fixes

1. Open the deployment for the **latest** commit on `main` (not an old failed one).
2. Or click **Redeploy** on the latest commit — do not redeploy `0abef62` without the TypeScript fix.

## Local verify

```bash
npm install
npm run build
```
