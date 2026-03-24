import React from 'react';
import CharacterCard from './CharacterCard.jsx';

const GITHUB_CHARACTERS_URL =
  'https://github.com/mqwebstera11y/elena/tree/master/characters';

export default function RosterScreen({ characters, onSelect }) {
  return (
    <div className="roster-screen">
      <header className="roster-header">
        <h1 className="roster-title">Character Studio</h1>
        <p className="roster-subtitle">Choose a character to begin the simulation.</p>
      </header>

      <ul className="character-list" role="list">
        {characters.map((char) => (
          <li key={char.id}>
            <CharacterCard character={char} onSelect={onSelect} />
          </li>
        ))}
      </ul>

      <div className="roster-footer">
        <a
          className="new-character-btn"
          href={GITHUB_CHARACTERS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          + New Character
        </a>
      </div>
    </div>
  );
}
