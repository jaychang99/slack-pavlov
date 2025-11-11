require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { App } = require('@slack/bolt');

// Load keyword→emoji mapping from JSON
const keywordsPath = path.resolve(__dirname, '../keywords.json');
const keywordToEmoji = JSON.parse(fs.readFileSync(keywordsPath, 'utf8'));
const keywords = Object.keys(keywordToEmoji);
const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'i');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});



// Normalize to handle width/compatibility variants (good for CJK)
const norm = s => (s || '').normalize('NFKC');

app.message(async ({ message, client, logger }) => {
  if (message.subtype || message.bot_id) return;

  const text = norm(message.text);
  let matchedKey = null;

  for (const k of keywords) {
    if (text.includes(norm(k))) { matchedKey = k; break; }
  }
  if (!matchedKey) return;

  const emoji = keywordToEmoji[matchedKey];
  await client.reactions.add({ channel: message.channel, timestamp: message.ts, name: emoji });
});


(async () => {
  await app.start();
  console.log('⚡️ Emoji bot is running!');
})();
