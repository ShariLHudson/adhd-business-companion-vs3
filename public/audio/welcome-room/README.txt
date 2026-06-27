Welcome Room audio assets

1) Sunroom ambience (Songer)
   welcome-room-ambience.mp3

   Download from your Songer share link:
     node scripts/fetch-welcome-ambience.mjs
     node scripts/fetch-welcome-ambience.mjs https://songer.co/song/YOUR_SONG_ID

2) Shari welcome voice (pre-rendered MP3 — preferred)
   welcome-letter-full.mp3

   Drop your full welcome letter recording here (greeting + body in one file).
   The app plays this file directly — no ElevenLabs credits per visit.

   Legacy split cache (optional fallback if full file is missing):
     welcome-greeting.mp3
     welcome-part-01.mp3
     welcome-part-02.mp3

   Generate legacy parts via ElevenLabs (optional):
     npm run welcome-voice:cache

The app prefers welcome-letter-full.mp3, then split cache, then live /api/tts.

Rights: Sunroom music by Shari (Songer). Voice is Shari's cloned voice.
