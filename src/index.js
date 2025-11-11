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

const AWARENESS_LINES = [
  '바른말 고운말을 씁시다! 😊',
  '조금만 더 다정하게, 바른말 고운말! 🌿',
  '말에 온도를 담아봐요—바른말 고운말! ✨',
  '우리의 말이 분위기를 만듭니다. 바른말 고운말! 💬',
  '한 번 더 생각하고, 바른말 고운말! 🧠',
  '상대에게 배려를—바른말 고운말 부탁해요! 🤝',
  '감정은 가볍게, 표현은 예쁘게! 바른말 고운말 🙏',
  '말의 힘을 아껴 쓰기—바른말 고운말! 🌈',
  '오늘도 평화롭게, 바른말 고운말! 🕊️',
  '함께 만드는 좋은 대화, 바른말 고운말! 🤗'
];

const pickLine = () =>
  AWARENESS_LINES[Math.floor(Math.random() * AWARENESS_LINES.length)];

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
  const userId = message.user;

  await client.reactions.add({ channel: message.channel, timestamp: message.ts, name: emoji });

  // b) Post a threaded reply with a random awareness message
  await client.chat.postMessage({
    channel: message.channel,
    thread_ts: message.thread_ts || message.ts, // reply in thread (start one if none)
    text: `<@${userId}> ${pickLine()}`
  });
});


(async () => {
  await app.start();
  console.log('⚡️ Emoji bot is running!');
})();
