const fs = require('fs');
let file = 'src/pages/admin/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['âš™ï¸ ', '⚙️'], ['ðŸ“Š', '📊'], ['ðŸ‘¥', '👥'], ['ðŸŽ“', '🎓'],
  ['ðŸ“¸', '📸'], ['ðŸ“¤', '📤'], ['ðŸ“Œ', '📌'], ['ðŸŽµ', '🎵'],
  ['ðŸ“ ', '📁'], ['ðŸ“…', '📅'], ['ðŸ¥š', '🥚'], ['ðŸ” ', '🔐'],
  ['â”€', '─'], ['Â·', '·'], ['â€“', '–'], ['â€”', '—'],
  ['âœ•', '✕'], ['ðŸ“±', '📱'], ['ðŸ”—', '🔗'], ['ðŸ“·', '📷'],
  ['ðŸ—‘', '🗑'], ['âœ…', '✅'], ['â Œ', '❌'], ['ðŸ’¡', '💡'],
  ['âš ï¸ ', '⚠️'], ['ðŸ”„', '🔄'], ['â ³', '⏳'], ['ðŸ‘‘', '👑'],
  ['ðŸ§”', '🧔'], ['ðŸ“–', '📖']
];

for (let [bad, good] of replacements) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(file, content, 'utf8');
console.log('File encoding fixed via Node.');
