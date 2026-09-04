# NextMove

**An AI career coach you talk to. Ten minutes. One honest next move.**

Live: https://nextmove.thedirectorloop.com

## The one-paragraph test

Priya, 33, Senior PM at a fintech in Bangalore, nine years in. Every review cycle she knows she wants a change but cannot say what: applied AI, consulting, an MBA, or just a bigger role where she is. Today she reads LinkedIn, takes a quiz, asks two friends, and drifts another year, because a real coach costs ₹20,000 an hour and free advice is generic. NextMove asks her the questions a good coach asks, tells her which door actually fits and how realistic it is, and writes the first message to someone she already knows in that world. She leaves with something to send, not something to read.

## What it does

1. **Talk for ten minutes.** A voice conversation (or typed, same result) in three short acts: what is prompting this, what has to stay true about your life, which door pulls you, and who you already know one step ahead.
2. **Get your next move.** One path graded honestly (strong fit, realistic, a stretch, long shot), in your own words. The other doors are listed so nothing is hidden. At least one is always graded a stretch or a long shot.
3. **Send the first message.** NextMove drafts the message to the person you named. Copy it, send it, press "I sent it". That is the moment a transition actually starts.

The questions come from a coach who has guided 1,000+ professionals through career transitions, and from the transition literature (Ibarra on experiments over introspection, Schein on career anchors, Bridges on endings).

## Why it is not ChatGPT voice mode

ChatGPT will chat for an hour and agree with you. NextMove runs a fixed coaching script, pushes back when your answers conflict, grades your options against a real base rate, ends with a message to a named person, and then asks whether you sent it.

## Stack

- Next.js 16 (App Router), Tailwind v4, deployed on Vercel
- Convex for sessions, transcripts, next-move records and counters
- Vapi web SDK for the voice call (Claude Sonnet 4.6 in-call, Deepgram Nova-2 speech-to-text, Deepgram Aura-2 voice)
- Claude Sonnet 5 for extraction: transcript in, structured next move plus drafted message out
- Built with Claude Code and the Cursor agent

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in the keys below
npx convex dev               # creates a Convex dev deployment, writes NEXT_PUBLIC_CONVEX_URL
npm run dev
```

Environment variables:

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Vapi web calls |
| `ANTHROPIC_API_KEY` | extraction and the typed fallback |
| `NEXT_PUBLIC_CONVEX_URL` | written by `npx convex dev` |
| `ADMIN_KEY` | optional, gates `/admin?key=` |
| `NEXT_PUBLIC_VOICE_TIER` | optional: `budget` (Haiku plus Aura-2) or `eleven` (ElevenLabs voice) |

Without `NEXT_PUBLIC_CONVEX_URL` the app runs on an in-memory store for local testing.

## Routes

| Route | What |
|---|---|
| `/` | landing and start |
| `/talk/[id]` | the conversation (voice, with typed fallback) |
| `/r/[id]` | your next move, the first message, other doors, share |
| `/admin?key=` | counters: started, act reached, written, sent, shared, last 25 sessions |
