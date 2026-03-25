import React, { useState } from 'react';
import { useCharacters } from './hooks/useCharacters.js';
import RosterScreen from './components/RosterScreen.jsx';
import ChatScreen from './components/ChatScreen.jsx';

export default function App() {
  const characters = useCharacters();
  const [screen, setScreen] = useState('roster');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  function handleSelect(character) {
    setSelectedCharacter(character);
    setScreen('chat');
  }

  function handleBack() {
    setScreen('roster');
    setSelectedCharacter(null);
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0c0b0a;
          --surface: #141210;
          --border: #252220;
          --text: #e2dbd0;
          --muted: #6b6158;
          --accent: #e8c97a;
          --font: Georgia, Palatino, 'Palatino Linotype', serif;
        }

        html, body, #root {
          height: 100%;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        #root {
          display: flex;
          flex-direction: column;
          max-width: 600px;
          margin: 0 auto;
          min-height: 100%;
        }

        /* ── Roster ─────────────────────────────────────── */

        .roster-screen {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          padding: 2rem 1rem;
        }

        .roster-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.5rem;
        }

        .roster-title {
          font-size: 1.6rem;
          font-weight: normal;
          color: var(--accent);
          letter-spacing: 0.02em;
        }

        .roster-subtitle {
          color: var(--muted);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .character-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .character-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 1rem 1.25rem;
          cursor: pointer;
          text-align: left;
          min-height: 44px;
          transition: border-color 0.15s, background 0.15s;
          color: var(--text);
          font-family: var(--font);
        }

        .character-card:hover,
        .character-card:focus-visible {
          border-color: var(--accent);
          background: #1a1815;
          outline: none;
        }

        .character-card-name {
          font-size: 1.05rem;
          color: var(--accent);
        }

        .character-card-excerpt {
          font-size: 0.82rem;
          color: var(--muted);
          margin-top: 0.25rem;
          line-height: 1.4;
        }

        .roster-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: center;
        }

        .new-character-btn {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.85rem;
          padding: 0.6rem 1.2rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          min-height: 44px;
          display: flex;
          align-items: center;
          transition: color 0.15s, border-color 0.15s;
        }

        .new-character-btn:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        /* ── Chat ───────────────────────────────────────── */

        .chat-screen {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 100dvh;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.5rem 0.25rem;
          min-height: 44px;
          min-width: 44px;
          font-family: var(--font);
          transition: color 0.15s;
        }

        .back-btn:hover { color: var(--accent); }

        .chat-character-name {
          flex: 1;
          font-size: 1rem;
          color: var(--accent);
          letter-spacing: 0.02em;
        }

        .chat-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* ── Director Panel ─────────────────────────────── */

        .director-panel {
          position: relative;
        }

        .director-toggle {
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          font-size: 0.78rem;
          padding: 0.4rem 0.75rem;
          border-radius: 4px;
          min-height: 44px;
          font-family: var(--font);
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
        }

        .director-toggle:hover,
        .director-panel--open .director-toggle {
          color: var(--accent);
          border-color: var(--accent);
        }

        .director-body {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: min(320px, 90vw);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.75rem;
          z-index: 10;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .director-textarea {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font);
          font-size: 0.82rem;
          line-height: 1.5;
          padding: 0.6rem 0.75rem;
          border-radius: 4px;
          resize: vertical;
          min-height: 110px;
        }

        .director-textarea:focus {
          outline: 1px solid var(--accent);
          border-color: var(--accent);
        }

        .director-textarea::placeholder { color: var(--muted); }

        /* ── Clear button ───────────────────────────────── */

        .clear-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          font-size: 0.78rem;
          padding: 0.4rem 0.75rem;
          border-radius: 4px;
          min-height: 44px;
          font-family: var(--font);
          transition: color 0.15s, border-color 0.15s;
        }

        .clear-btn:hover {
          color: #d07070;
          border-color: #5a2020;
        }

        /* ── Message Thread ─────────────────────────────── */

        .message-thread {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          padding: 3rem 0;
        }

        .speak-first-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          font-family: var(--font);
          font-size: 0.9rem;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          min-height: 44px;
          transition: color 0.15s, border-color 0.15s;
        }

        .speak-first-btn:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 90%;
        }

        .message--user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message--assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-label {
          font-size: 0.72rem;
          color: var(--muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .message-content {
          font-size: 0.95rem;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message--user .message-content {
          color: var(--muted);
        }

        .message--assistant .message-content {
          color: var(--text);
        }

        /* Typing indicator */
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 0.25rem 0;
        }

        .typing-indicator span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--muted);
          border-radius: 50%;
          animation: blink 1.2s infinite;
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }

        .error-banner {
          background: #2a1010;
          border: 1px solid #5a2020;
          color: #d07070;
          border-radius: 4px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
        }

        /* ── Input ──────────────────────────────────────── */

        .input-form {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border);
          background: var(--surface);
          flex-shrink: 0;
        }

        .input-textarea {
          flex: 1;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font);
          font-size: 0.95rem;
          line-height: 1.5;
          padding: 0.6rem 0.75rem;
          border-radius: 4px;
          resize: none;
          overflow-y: hidden;
          min-height: 44px;
          max-height: 160px;
          overflow-y: auto;
        }

        .input-textarea:focus {
          outline: 1px solid var(--accent);
          border-color: var(--accent);
        }

        .input-textarea::placeholder { color: var(--muted); }

        .send-btn {
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: 4px;
          font-family: var(--font);
          font-size: 0.88rem;
          font-weight: bold;
          padding: 0 1.1rem;
          cursor: pointer;
          min-height: 44px;
          min-width: 60px;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }

        .send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):hover { opacity: 0.85; }
      `}</style>

      {screen === 'roster' && (
        <RosterScreen characters={characters} onSelect={handleSelect} />
      )}
      {screen === 'chat' && selectedCharacter && (
        <ChatScreen
          character={selectedCharacter}
          allCharacters={characters}
          onBack={handleBack}
        />
      )}
    </>
  );
}
