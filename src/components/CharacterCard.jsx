import React from 'react';

function getExcerpt(profile) {
  const lines = profile.split('\n');
  // Find the first non-empty line after the # heading and ## section headers
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
    // Return first substantive paragraph line, trimmed to ~100 chars
    return trimmed.length > 100 ? trimmed.slice(0, 97) + '…' : trimmed;
  }
  return '';
}

export default function CharacterCard({ character, onSelect }) {
  const excerpt = getExcerpt(character.profile);

  return (
    <button className="character-card" onClick={() => onSelect(character)} aria-label={`Chat with ${character.name}`}>
      <span className="character-card-name">{character.name}</span>
      {excerpt && <span className="character-card-excerpt">{excerpt}</span>}
    </button>
  );
}
