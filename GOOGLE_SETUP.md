# Connect Google (developer setup)

End users connect in **Settings → Connections → Connect Google**. This doc is for
**you** (deploy / local dev) — never shown in the app UI.

## Production: ecosystem.visualsparkstudios.com

1. **Google Cloud Console** → your project → **APIs & Services → Library** →
   enable **Google Drive API** (required). Optionally enable **Google Docs API**
   for richer heading/bullet formatting on export (plain text export works with
   Drive API only). Enable **Google Forms API** if you export forms.

2. **OAuth consent screen** → External → add test users → scopes:
   - `.../auth/drive.file`
   - `.../auth/forms.body` (for Forms export)
   - `openid`, `email`

3. **Credentials → OAuth client ID** → Web application → **Authorized redirect
   URIs** (add both if you use local + prod):

   ```
   https://ecosystem.visualsparkstudios.com/api/google/callback
   http://localhost:3000/api/google/callback
   ```

4. **Vercel → Project → Settings → Environment Variables** (Production):

   | Variable | Example value |
   |----------|-----------------|
   | `GOOGLE_CLIENT_ID` | From Google Console |
   | `GOOGLE_CLIENT_SECRET` | From Google Console |
   | `GOOGLE_REDIRECT_URI` | `https://ecosystem.visualsparkstudios.com/api/google/callback` |

5. **Redeploy** Production (`main`) after saving env vars.

6. In the live app: **Settings → Connections → Connect Google** → Allow.

Until step 4–5 are done, the app shows **Google Saving Not Available Yet** (no
Connect button). After env vars are set, users see **Connect Google** and the
four-step “How it works” instructions.

## Local development

Create `.env.local` in the repo root:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
```

Restart `npm run dev` after changes.

## Notes

- Scope `drive.file`: the app only sees/manages files **it** creates.
- Tokens live in an httpOnly cookie (`g_tokens`). Fine for single-user / local;
  multi-tenant production may need server-side session storage later.
- Google app in **Testing** mode: up to 100 test users; “unverified app” on
  consent screen is normal — users tap Advanced → Continue.
