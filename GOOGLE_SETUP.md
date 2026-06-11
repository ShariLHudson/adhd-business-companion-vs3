# Connect Google (one-click Google Docs)

The app can create a real Google Doc from any finished piece — but it needs
**your** Google OAuth credentials. This is a one-time developer setup.

## 1. Create OAuth credentials
1. Go to https://console.cloud.google.com/ and create (or pick) a project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen**: choose **External**, fill in app
   name + your email, and add yourself as a **Test user**. Add the scope
   `.../auth/drive.file` (and `openid`, `email`).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URI:
     `http://localhost:3000/api/google/callback`
     (use your real domain in production)
5. Copy the **Client ID** and **Client secret**.

## 2. Add env vars
Create / edit `.env.local` in `companion-app/`:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
```

Restart `npm run dev` after changing env vars.

## 3. Connect
Open the app → **Settings → Connections → Connect Google**, approve access.
You'll bounce back with the account connected.

## 4. Use it
On any draft (Content generator, Email generator, or a saved Template) tap
**📝 Google Docs** in the export row — it creates the doc and opens it. If you
ever disconnect (Settings → Connections), it falls back to copy-and-paste.

## Notes
- Scope is `drive.file`: the app can only see/manage docs **it** creates — it
  cannot read the rest of your Drive.
- Tokens are stored in an httpOnly cookie. Fine for a single-user / local app;
  for a multi-user production deploy, move them to a server session/DB.
- Until the env vars are set, the "Connect Google" button stays hidden and
  Google Docs export uses copy-and-paste.
