# Character Studio — Project Brief for Claude Code

## What We're Building

A mobile-first web app for simulating fictional characters using the Claude API. Users maintain a roster of characters, each with a profile and timeline file. During simulation, a character has read access to all other characters' profiles. Users can also inject live "Director's Notes" to steer the simulation mid-conversation.

---

## Tech Stack

- **Frontend**: React (Vite), mobile-first responsive CSS
- **Hosting**: Vercel (free tier) — auto-deploys on every GitHub push
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **File storage**: Markdown files in the GitHub repo (`/characters/` folder)
- **No database** — character files are the source of truth

---

## Repo Structure to Create

```
/
├── CLAUDE.md                        ← this file
├── .env.example                     ← ANTHROPIC_API_KEY placeholder
├── vite.config.js
├── index.html
├── package.json
│
├── /characters                      ← all character data lives here
│   ├── elena.md                     ← character profile
│   ├── elena_timeline.md            ← character's chronological events
│   ├── marcus.md
│   ├── marcus_timeline.md
│   └── _template.md                 ← blank template for new characters
│
├── /src
│   ├── main.jsx
│   ├── App.jsx                      ← root: roster → chat routing
│   │
│   ├── /components
│   │   ├── RosterScreen.jsx         ← list of all characters, pick one to chat
│   │   ├── ChatScreen.jsx           ← the simulation chat UI
│   │   ├── DirectorPanel.jsx        ← collapsible panel for live instructions
│   │   └── CharacterCard.jsx        ← card shown in roster
│   │
│   ├── /hooks
│   │   └── useCharacters.js         ← loads all .md files from /characters/
│   │
│   └── /lib
│       ├── claudeApi.js             ← all Claude API calls
│       └── promptBuilder.js         ← builds system prompts from character files
│
└── /api
    └── chat.js                      ← Vercel serverless function (keeps API key server-side)
```

---

## Character File Format

### Profile file: `characters/elena.md`

```markdown
# Elena Vasquez

## Basic Info
- Age: 34
- Occupation: Former marine biologist, now lighthouse keeper
- Location: Oregon coast

## Personality
Deeply introverted, brilliant, haunted by a failed research expedition. Speaks precisely
and rarely. Has dark humor she rarely shows. Distrusts institutions but is fiercely loyal
to individuals.

## Physical Description
...

## Speech Patterns
- Speaks in short, declarative sentences
- Deflects personal questions with observations about the environment
- Rarely uses contractions when stressed

## Relationships
- Dr. Marcus Park: former colleague, complex guilt around his death
- ...

## Fears & Desires
...

## Background
...
```

### Timeline file: `characters/elena_timeline.md`

```markdown
# Elena Vasquez — Timeline

## Childhood
- **1990**: Born in coastal Chile, Valparaíso
- **1999** (age 9): Father drowns at sea. She witnesses it.

## Education
- **2007**: Wins scholarship to MIT — first in family to attend university
- **2011**: Graduates top of class, marine biology

## Career
- **2015**: Publishes landmark paper on bioluminescent organisms
- **2019**: The Santiago Expedition — diving accident. Dr. Park dies. Elena blames herself.
- **2020**: Resigns from academia. Moves to remote Oregon coast.

## Present
- **2024**: Living alone as lighthouse keeper. Rarely speaks to anyone.
```

### Template: `characters/_template.md`

```markdown
# [Character Name]

## Basic Info
- Age:
- Occupation:
- Location:

## Personality

## Physical Description

## Speech Patterns

## Relationships

## Fears & Desires

## Background
```

---

## How the System Prompt is Built

When a user starts a simulation with character Elena, the app builds this system prompt:

```
You are fully embodying a fictional character. Here is their complete profile:

=== YOUR PROFILE ===
[contents of elena.md]

=== YOUR TIMELINE ===
[contents of elena_timeline.md]

=== OTHER CHARACTERS YOU MAY KNOW ===
[contents of every other character's .md and _timeline.md, labelled by name]

=== DIRECTOR'S NOTES ===
[optional: live instructions from the user, injected mid-session]

ROLEPLAY RULES:
- Speak in first person. You ARE this character.
- Let your history and wounds color every response naturally — don't recite facts.
- Never break character or acknowledge being an AI unless the user types "exit roleplay".
- Match your emotional register: guarded, warm, sharp — whatever fits this character.
- Director's Notes override your defaults when they conflict.
- Keep responses human-length — conversational, not monologue.
```

Key points:
- ALL character `.md` files are loaded and included for cross-character awareness
- Timeline is a separate file, always injected alongside the profile
- Director's Notes are appended to the system prompt and update live without resetting the conversation

---

## API Architecture

### Why a Vercel serverless function

The Claude API key must never be exposed to the browser. All Claude calls go through `/api/chat.js`, a Vercel Edge/serverless function that reads `ANTHROPIC_API_KEY` from environment variables.

### `/api/chat.js` — what it receives

```json
{
  "systemPrompt": "...",
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "..." }
  ]
}
```

### `/api/chat.js` — what it calls

```javascript
POST https://api.anthropic.com/v1/messages
{
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  system: systemPrompt,
  messages: messages
}
```

Returns the assistant's reply text to the frontend.

---

## How Character Files Are Loaded

Since this is a Vite/React app, use Vite's `import.meta.glob` to load all markdown files at build time:

```javascript
// src/hooks/useCharacters.js
const profileFiles = import.meta.glob('/characters/*.md', { as: 'raw', eager: true });

// Separate profiles from timelines by filename convention:
// elena.md         → profile
// elena_timeline.md → timeline
// _template.md     → skip (prefixed with _)
```

Expose a `characters` array like:
```javascript
[
  {
    id: "elena",
    name: "Elena Vasquez",          // extracted from first # heading
    profile: "...",                  // raw markdown of elena.md
    timeline: "...",                 // raw markdown of elena_timeline.md
  },
  ...
]
```

---

## UI Requirements

### Mobile-first

- Target: works well on a 375px wide phone screen (iPhone SE baseline)
- No horizontal scrolling anywhere
- Touch-friendly tap targets (min 44px height)
- Textarea auto-grows with content on mobile

### Screens

**1. Roster Screen**
- List of character cards (name, one-line description from profile)
- "+ New Character" button → links to GitHub `/characters/` folder (open in browser)
- Tap a character → go to Chat Screen

**2. Chat Screen**
- Header: character name + back button + "Director ✎" toggle button
- Message thread (scrollable, newest at bottom)
- "Let [Name] speak first" button on empty chat
- Input textarea + Send button (Enter to send, Shift+Enter for newline)
- Conversation persists in React state for the session

**3. Director Panel** (slides in from top when toggled)
- Textarea for live simulation instructions
- Instructions: "Changes take effect on the next message. Examples: 'Speak only in questions', 'This character just received devastating news', 'Shift to formal register'"
- Does NOT reset the conversation when updated

### Aesthetic direction
- Dark theme, serif typography (Palatino or Georgia)
- Amber/gold accent color (#e8c97a)
- Minimal, literary feel — not a generic chat app
- Consistent with the prototype built in conversation (see color refs below)

```css
--bg: #0c0b0a;
--surface: #141210;
--border: #252220;
--text: #e2dbd0;
--muted: #6b6158;
--accent: #e8c97a;
```

---

## Vercel Deployment Config

Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

Environment variable to set in Vercel dashboard:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## `.env.example`

```
ANTHROPIC_API_KEY=your_key_here
```

---

## `package.json` dependencies

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^5"
  }
}
```

No extra libraries needed. All Claude calls go via native `fetch`.

---

## Sample Characters to Include

Create two sample characters so the app is immediately usable:

1. `characters/elena.md` + `characters/elena_timeline.md` — Elena Vasquez (lighthouse keeper, former marine biologist, as described above)
2. `characters/marcus.md` + `characters/marcus_timeline.md` — Dr. Marcus Park (Elena's former colleague, brilliant but reckless oceanographer, died in the Santiago Expedition from Elena's POV — but write Marcus's own files as if he survived and Elena doesn't know)

This creates an interesting cross-character dynamic out of the box.

---

## What to Build First (suggested order)

1. Scaffold Vite + React project
2. Create `/characters/` folder with sample files + template
3. Build `useCharacters.js` hook with `import.meta.glob`
4. Build `promptBuilder.js` — assembles system prompt from character + all others
5. Build `/api/chat.js` serverless function
6. Build `RosterScreen.jsx`
7. Build `ChatScreen.jsx` with Director Panel
8. Wire everything together in `App.jsx`
9. Add `vercel.json` + `.env.example`
10. Test on mobile viewport in browser devtools

---

## Key Constraints

- API key MUST stay server-side (in `/api/chat.js`), never in frontend bundle
- Character files are edited directly in GitHub — no in-app editor needed
- Adding a new character = add `name.md` + `name_timeline.md` to `/characters/` and push — app auto-picks it up on next deploy
- Director's Notes update the system prompt but do NOT clear message history
- All characters' profiles are always included in every simulation's context window
