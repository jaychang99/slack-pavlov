# 🧠Slack-Pavlov

_A simple Slack bot that reacts with emojis when certain words appear in chat._

---

## 📘 Overview

Slack Pavlov is a lightweight Slack bot built with [`@slack/bolt`](https://slack.dev/bolt-js) that listens to messages in real time.  
When it detects any of the defined keywords, it automatically reacts to the message with an emoji.

This project uses a **substring-based keyword detection** approach, which means any occurrence of the keyword (even as part of another word) will trigger the emoji reaction.  
CJK (Korean, Japanese, Chinese) characters are fully supported.

---

## 🧩 Project Structure

```
.
├── src/
│ └── index.js # main bot logic
├── keywords.json # keyword → emoji mapping
├── .env # environment variables (tokens)
├── package.json
└── README.md
```

---

## ⚙️ Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/jaychang99/slack-pavlov.git
cd slack-pavlov
npm install
```

### 2. Configure Environment Variables

Create a .env file in the project root:

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
```

💡 Both tokens come from your Slack app configuration at api.slack.com/apps:

SLACK_BOT_TOKEN: Found under “OAuth & Permissions” → “Bot User OAuth Token”

SLACK_APP_TOKEN: Found under “Socket Mode” → “App-Level Token” (scope: connections:write)

### 3. Define Your Keywords

Create or edit keywords.json at the project root.
This file maps trigger words to emoji names:

```json
{
  "hello": "wave",
  "urgent": "rotating_light",
  "deploy": "rocket",
  "coffee": "coffee",
  "bug": "beetle"
}
```

Keys = words to detect (CJK and English supported)
Values = emoji names (as used in Slack reactions)

### 4. Run the Bot

```
npm run start
```

Once started, you should see:

```
⚡️ Emoji bot running
```

### 5. Invite the Bot to Channels

In Slack, invite your bot to any channel you want it to monitor:

It won’t react to messages in channels it’s not part of.

💡 How It Works
The bot listens for new messages via Socket Mode.

Each message is normalized (supports CJK) and checked for any substring match in keywords.json.

If a match is found, the bot reacts to that message with the specified emoji using reactions.add.

## 🧠 Tips

UTF-8 safe: Handles Korean, Japanese, and Chinese text correctly.

Custom emojis: If you have Slack custom emojis, use their names in keywords.json.

Real-time reload (optional): You can add fs.watchFile('./keywords.json') to auto-reload the mapping without restart.

Permissions: Ensure your app has these scopes:

```
reactions:write
channels:history
groups:history
im:history
mpim:history
```

## 🧰 Tech Stack

- Node.js
- Slack Bolt SDK
- dotenv
