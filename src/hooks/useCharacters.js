// Load all markdown files from /characters/ at build time via Vite's import.meta.glob
const allFiles = import.meta.glob('/characters/*.md', { as: 'raw', eager: true });

function extractName(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Unknown';
}

function buildCharacters() {
  const profiles = {};
  const timelines = {};

  for (const [path, content] of Object.entries(allFiles)) {
    const filename = path.split('/').pop(); // e.g. "elena.md"

    // Skip files prefixed with _
    if (filename.startsWith('_')) continue;

    if (filename.endsWith('_timeline.md')) {
      const id = filename.replace('_timeline.md', '');
      timelines[id] = content;
    } else {
      const id = filename.replace('.md', '');
      profiles[id] = content;
    }
  }

  return Object.keys(profiles).map((id) => ({
    id,
    name: extractName(profiles[id]),
    profile: profiles[id],
    timeline: timelines[id] || '',
  }));
}

const characters = buildCharacters();

export function useCharacters() {
  return characters;
}
