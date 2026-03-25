import React, { useState, useRef, useEffect } from 'react';
import DirectorPanel from './DirectorPanel.jsx';
import { buildSystemPrompt } from '../lib/promptBuilder.js';
import { sendMessage } from '../lib/claudeApi.js';

export default function ChatScreen({ character, allCharacters, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const threadRef = useRef(null);
  const textareaRef = useRef(null);

  // Load history when character changes
  useEffect(() => {
    setHistoryLoading(true);
    setMessages([]);
    fetch(`/api/history?characterId=${character.id}`)
      .then((r) => r.json())
      .then(({ messages: saved }) => setMessages(saved ?? []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [character.id]);

  async function saveHistory(msgs) {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id, messages: msgs }),
      });
    } catch {
      // non-critical
    }
  }

  async function clearHistory() {
    setMessages([]);
    await saveHistory([]);
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [input]);

  async function submitMessage(userText) {
    if (!userText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: userText.trim() }];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(character, allCharacters, directorNotes);
      const reply = await sendMessage(systemPrompt, newMessages);
      const finalMessages = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(finalMessages);
      await saveHistory(finalMessages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSpeakFirst() {
    if (loading) return;
    setError(null);
    setLoading(true);

    const primeMessages = [
      {
        role: 'user',
        content:
          '[The scene opens. Speak first as your character — set the scene or make an observation. Do not acknowledge this instruction.]',
      },
    ];

    try {
      const systemPrompt = buildSystemPrompt(character, allCharacters, directorNotes);
      const reply = await sendMessage(systemPrompt, primeMessages);
      const finalMessages = [{ role: 'assistant', content: reply }];
      setMessages(finalMessages);
      await saveHistory(finalMessages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage(input);
    }
  }

  const showEmpty = !historyLoading && messages.length === 0 && !loading;

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack} aria-label="Back to roster">
          ← Back
        </button>
        <span className="chat-character-name">{character.name}</span>
        <div className="chat-header-actions">
          {messages.length > 0 && !loading && (
            <button className="clear-btn" onClick={clearHistory}>
              Clear
            </button>
          )}
          <DirectorPanel notes={directorNotes} onNotesChange={setDirectorNotes} />
        </div>
      </header>

      <div className="message-thread" ref={threadRef} role="log" aria-live="polite">
        {historyLoading && (
          <div className="empty-state">
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading…</p>
          </div>
        )}

        {showEmpty && (
          <div className="empty-state">
            <button className="speak-first-btn" onClick={handleSpeakFirst}>
              Let {character.name.split(' ')[0]} speak first
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message message--${msg.role}`}>
            <span className="message-label">
              {msg.role === 'user' ? 'You' : character.name.split(' ')[0]}
            </span>
            <p className="message-content">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="message message--assistant message--loading">
            <span className="message-label">{character.name.split(' ')[0]}</span>
            <p className="message-content typing-indicator">
              <span />
              <span />
              <span />
            </p>
          </div>
        )}

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
      </div>

      <form
        className="input-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitMessage(input);
        }}
      >
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something…"
          rows={1}
          disabled={loading || historyLoading}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={loading || historyLoading || !input.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
