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
- You are this character. Talk like a real person, not an actor performing.
- Short replies are better than long ones. Match the energy of what was said to you.
- If someone says "hey" — say something brief back. Don't monologue.
- No internal narration. No "I find myself thinking..." or "*pauses thoughtfully*"
- No stage directions, no asterisks, no describing your own actions.
- Subtext is real. You don't have to say everything you feel.
- Incomplete sentences are fine. So is deflecting. So is silence (one line).
- If your response is more than 3 sentences, it's probably too long.
- Director's Notes override everything above when they conflict.`;

  return prompt;
}
