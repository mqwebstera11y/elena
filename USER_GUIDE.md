# Character Studio — User Guide

A mobile-first web app for simulating fictional characters powered by the Claude API.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [The Roster](#the-roster)
3. [Chat Screen](#chat-screen)
4. [Director's Notes](#directors-notes)
5. [Cross-Device Persistence](#cross-device-persistence)
6. [Adding a New Character](#adding-a-new-character)
7. [Local Development](#local-development)
8. [Deployment (Vercel)](#deployment-vercel)

---

## Quick Start

1. Open the app in any browser (desktop or mobile).
2. Pick a character from the roster.
3. Tap **"Let [Name] speak first"** to open the scene, or type your own first message.
4. The conversation is saved automatically — pick up where you left off on any device.

---

## The Roster

The roster lists every character whose files are present in the `/characters/` folder.

| Element | What it does |
|---|---|
| Character card | Shows the character's name and a brief excerpt from their profile. Tap to open a chat. |
| **+ New Character** | Opens the `/characters/` folder on GitHub so you can add files directly. |

Character data is loaded at build time from markdown files — no database involved.

---

## Chat Screen

### Starting a conversation

- **"Let [Name] speak first"** — sends a hidden prompt asking the character to open the scene. Good for setting atmosphere without revealing the prompt.
- **Type anything** — jump straight in. The character responds in kind.

### Controls

| Control | What it does |
|---|---|
| **← Back** | Return to the roster. Conversation is saved; it'll be there when you return. |
| **Clear** | Erase the current conversation for this character (on all devices). Appears once there are messages. |
| **Director ✎** | Toggle the Director Panel (see below). |
| **Enter** | Send message. |
| **Shift + Enter** | New line inside the message box. |

### How characters know each other

Every character's profile and timeline is included in every simulation's context window. If Elena mentions Marcus, the AI has Marcus's full file available. Relationships are two-way out of the box.

### Ending roleplay

Type **`exit roleplay`** at any point. The character will step out of the simulation and respond as themselves.

---

## Director's Notes

The Director Panel is a collapsible overlay that lets you inject live instructions into the simulation **without resetting the conversation**.

### How to use it

1. Tap **Director ✎** in the chat header.
2. Type your instructions into the text box.
3. Close the panel. Instructions take effect on the **next message** you send.

### Examples

```
Speak only in questions.
```
```
This character just received devastating news — let it colour the scene without announcing it.
```
```
Shift to a formal register. Something has changed in the power dynamic.
```
```
It is now three years later. The character has made peace with what happened.
```

Director's Notes override the character's defaults when they conflict. They remain active until you edit or clear them.

---

## Cross-Device Persistence

Conversations are stored in **Vercel KV** (a Redis-backed key-value store). Any device that opens the same deployed URL shares the same history per character.

### One-time setup in Vercel

1. Go to your project in the **Vercel dashboard**.
2. Click the **Storage** tab → **Create Database** → choose **KV**.
3. Name it (e.g. `character-studio-kv`) and create it.
4. Click **Connect Project** → select your project.
   Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment.
5. Go to **Deployments** → redeploy the latest build (or push any commit).

### Local development with KV

1. Copy `.env.example` to `.env.local`.
2. Paste the `KV_REST_API_URL` and `KV_REST_API_TOKEN` values from the Vercel dashboard
   (Storage → your KV store → `.env.local` tab).
3. Run `npm run dev` — the app will read and write to the same KV store as production.

### Without KV configured

If the environment variables are absent, the app degrades gracefully: conversations simply reset on each page load. No error is shown.

---

## Adding a New Character

Every character is defined by two markdown files in `/characters/`:

| File | Purpose |
|---|---|
| `name.md` | Profile: personality, speech patterns, relationships, background |
| `name_timeline.md` | Chronological events that shaped the character |

### Steps

1. Open `/characters/` in GitHub (or clone the repo locally).
2. Duplicate `_template.md` and rename it (e.g. `sofia.md`).
3. Fill in the profile. Use the existing characters as reference for depth.
4. Create `sofia_timeline.md` with key life events in chronological order.
5. Commit and push — Vercel auto-deploys and the character appears in the roster immediately.

### Profile tips

- **Speech Patterns** is the most important section for a distinctive voice. Be specific: not "formal" but "uses full sentences, never slang, pauses with em-dashes".
- **Relationships** should name other characters in the roster — this activates cross-character awareness automatically.
- **Fears & Desires** gives the character an inner life that bleeds into every exchange without being stated.

---

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local — add your ANTHROPIC_API_KEY and optionally KV vars

# Start the dev server
npm run dev
```

The Vite dev server proxies `/api/*` to the local serverless functions automatically.
Open `http://localhost:5173` in your browser.

---

## Deployment (Vercel)

The repo is configured for zero-config Vercel deployment.

1. Import the repo in the **Vercel dashboard**.
2. Add `ANTHROPIC_API_KEY` in **Settings → Environment Variables**.
3. Optionally set up Vercel KV (see [Cross-Device Persistence](#cross-device-persistence)).
4. Every push to the main branch triggers an automatic redeploy.

The `vercel.json` rewrite rule ensures all routes are handled by the React app, and
`/api/chat` and `/api/history` run as serverless functions with the API key kept server-side.

---

## Key Rules

- **The API key never reaches the browser.** All Claude calls go through `/api/chat.js`.
- **Character files are the source of truth.** Edit them in GitHub; the next deploy picks up all changes.
- **Director's Notes do not reset history.** They update the system prompt only.
- **All characters are always in context.** Every simulation includes every character's profile and timeline.
