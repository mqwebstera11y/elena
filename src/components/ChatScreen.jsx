import React, { useState, useRef, useEffect } from 'react';
import DirectorPanel from './DirectorPanel.jsx';
import { buildSystemPrompt } from '../lib/promptBuilder.js';
import { sendMessage } from '../lib/claudeApi.js';

export default function ChatScreen({ character, allCharacters, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const threadRef = useRef(null);
  const textareaRef = useRef(null);

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
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
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

    // Send a single hidden prompt to get the character to speak first
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
      setMessages([{ role: 'assistant', content: reply }]);
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

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack} aria-label="Back to roster">
          ← Back
        </button>
        <span className="chat-character-name">{character.name}</span>
        <DirectorPanel notes={directorNotes} onNotesChange={setDirectorNotes} />
      </header>

      <div className="message-thread" ref={threadRef} role="log" aria-live="polite">
        {messages.length === 0 && !loading && (
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
          disabled={loading}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
