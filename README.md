# gai_the_helper_bot
🌱 Gaia Project — AI Agent (Telegram + Solana + Local Knowledge Base)

Welcome to the official repository for the Gaia Project AI Agent — a custom-built assistant designed to support the lore, mechanics, and development of the Gaia universe on Solana.

This agent:

Uses OpenAI for reasoning

Works with Telegram as an interactive bot

Reads local knowledge files (Book 0, Book I, Genean Traits, Rules)

Stores long-term memory per user

Can perform Solana RPC lookups

Runs on webhooks or polling

Designed for full transparency & community tools

⚙️ Features
🧠 Local Knowledge Base

The bot loads information from:

/knowledge/
    book0.txt
    book1.txt
    traits.txt
    rules.txt


Everything the bot says comes from these files — no invented lore.

🧬 Gaia Project Assistant

The bot can answer questions about:

Geneans

Chainlines

Traits

Lore & Scripture

Game mechanics

Daily attribute allocation

Pre-order system

🔗 Solana Tools

Using solanaTools.js, the bot can:

/sol balance <wallet>
/sol tx <wallet>
/sol slot


These commands fetch live data from Solana RPC.

🤖 Telegram Integration

The bot supports:

Private chats → always responds

Group chats → only responds when tagged

Automatic recognition of:

mentions

reply-to messages

usernames

🗂 Memory System

Each chat has its own memory file:

/memory/<chatId>.json


The agent remembers conversations and context for each user.

💥 Stability

The bot includes:

Auto-reconnect for polling mode

Full webhook support

Crash protection for Node.js

Proper JSON parsing and message safety

🚀 Setup Instructions
1️⃣ Install dependencies
npm install

2️⃣ Add your config

Create config.js:

export const CONFIG = {
  TELEGRAM_TOKEN: "YOUR_TELEGRAM_BOT_TOKEN",
  OPENAI_API_KEY: "YOUR_OPENAI_KEY",
  MODEL: "gpt-4.1",
  MEMORY_LIMIT: 10
};

3️⃣ Add knowledge files

Place your lore files in:

/knowledge/


Examples:

Book 0 — The Deiatic Genesis

Book I — The Genesis of Code

Genean Traits

Game Rules & Mechanics

4️⃣ Start the agent (polling mode)
npm start


If using webhooks, follow the instructions in the repo.

📡 Webhook Setup (Optional, Recommended)

You can configure Telegram webhooks by calling the API directly:

https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_HTTPS_URL>/bot<YOUR_TOKEN>


Ngrok example:

ngrok http 3000


Then:

https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok-free.dev/bot<YOUR_TOKEN>

📁 Project Structure
gaia-agent/
│
├── server.js            # Main bot logic (Telegram + AI + Solana)
├── config.js            # API keys and configuration
├── solanaTools.js       # Solana RPC helper functions
├── package.json         # Node.js metadata
│
├── knowledge/           # Lore + traits + rules
│   ├── book0.txt
│   ├── book1.txt
│   ├── traits.txt
│   └── rules.txt
│
├── memory/              # Auto-created memory files (per chat/user)
│   └── <chatId>.json
│
└── docs/                # PDFs and reference material
    ├── Book 0 — The Deiatic Genesis.pdf
    ├── Book I — The Genesis of Code.pdf
    ├── Genean Traits.pdf
    └── Marketing Plan Phase 1.pdf

🛠 Requirements

Node.js 18+

Telegram bot token

OpenAI API key

Solana RPC endpoint (public or private)

🧪 Testing in Telegram

In a group:

@gai_the_helper_bot_v2 How do Geneans evolve?


In private chat:

How do I breed a Genean?


Solana:

/sol balance <wallet>

🤝 Contributing

This project will grow as the Gaia universe grows.
Future upgrades include:

On-chain Genean generation

Dungeon & quest generators

Player profile tracking

Solana account indexing

Lore-based procedural content

Contributions, pull requests, and ideas are welcome.

📜 License

MIT License — free to use, modify, and build upon.

🌿 Gaia Project

Forged from lore. Guided by community. Built on Solana.

If you'd like, I can also generate:

A beautiful GitHub banner (SVG)

A repo icon

A CONTRIBUTING.md

A setup guide for people running their own agent

A docs folder with full reference pages

Just say the word.
