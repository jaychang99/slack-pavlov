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

// ---- Sliding window store (per user) ----
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const THRESHOLD = 5;
// userId -> array (acts like deque) of timestamps (ms)
const userHits = new Map();

/**
 * Push a hit for userId, evict old entries, return current window size.
 * Uses O(k) worst-case per call where k = number of hits in the hour,
 * but with deque-like shifting it’s very fast in practice.
 */
function recordHit(userId, now) {
  let q = userHits.get(userId);
  if (!q) { q = []; userHits.set(userId, q); }

  // Evict old timestamps (older than 1 hour)
  const cutoff = now - WINDOW_MS;
  while (q.length && q[0] < cutoff) q.shift();

  // Add current timestamp
  q.push(now);
  return q.length;
}


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
  const now = Date.now();

  await client.reactions.add({ channel: message.channel, timestamp: message.ts, name: emoji });

  const count = recordHit(userId, now);

  if (count >= THRESHOLD) {
    // b) Post a threaded reply with a random awareness message
    await client.chat.postMessage({
      channel: message.channel,
      thread_ts: message.thread_ts || message.ts, // reply in thread (start one if none)
      text: `<@${userId}> ${pickLine()}`
    });
  }
});


(async () => {
  await app.start();
  console.log('⚡️ Emoji bot is running!');
})();
