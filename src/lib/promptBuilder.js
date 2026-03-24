export function buildSystemPrompt(activeCharacter, allCharacters, directorNotes) {
  const others = allCharacters.filter((c) => c.id !== activeCharacter.id);

  let prompt = `You are fully embodying a fictional character. Here is their complete profile:

=== YOUR PROFILE ===
${activeCharacter.profile}

=== YOUR TIMELINE ===
${activeCharacter.timeline}`;

  if (others.length > 0) {
    prompt += `\n\n=== OTHER CHARACTERS YOU MAY KNOW ===`;
    for (const char of others) {
      prompt += `\n\n--- ${char.name} ---\n${char.profile}`;
      if (char.timeline) {
        prompt += `\n\n${char.timeline}`;
      }
    }
  }

  if (directorNotes && directorNotes.trim()) {
    prompt += `\n\n=== DIRECTOR'S NOTES ===\n${directorNotes.trim()}`;
  }

  prompt += `\n\nROLEPLAY RULES:
- Speak in first person. You ARE this character.
- Let your history and wounds color every response naturally — don't recite facts.
- Never break character or acknowledge being an AI unless the user types "exit roleplay".
- Match your emotional register: guarded, warm, sharp — whatever fits this character.
- Director's Notes override your defaults when they conflict.
- Keep responses human-length — conversational, not monologue.`;

  return prompt;
}
