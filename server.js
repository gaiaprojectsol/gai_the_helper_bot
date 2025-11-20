import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import fs from "fs-extra";
import { CONFIG } from "./config.js";
import solanaTools from "./solanaTools.js";

// ==========================
// COLOUR LOGGER
// ==========================
const color = {
  red: (msg) => `\x1b[31m${msg}\x1b[0m`,
  green: (msg) => `\x1b[32m${msg}\x1b[0m`,
  yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
  blue: (msg) => `\x1b[34m${msg}\x1b[0m`,
  magenta: (msg) => `\x1b[35m${msg}\x1b[0m`,
  cyan: (msg) => `\x1b[36m${msg}\x1b[0m`,
};

console.log(color.cyan("🚀 Starting Gaia Agent..."));

// ==========================
// INIT TELEGRAM + OPENAI
// ==========================
const bot = new TelegramBot(CONFIG.TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

let BOT_USERNAME = null;

// Auto-detect bot username
bot.getMe().then((info) => {
  BOT_USERNAME = info.username;
  console.log(color.green(`🤖 Bot username detected: @${BOT_USERNAME}\n`));
});

// ==========================
// AUTO-RECONNECT ON POLLING ERROR
// ==========================
bot.on("polling_error", (err) => {
  console.log(color.red("⚠️ Polling error occurred:"), err.message);

  setTimeout(() => {
    console.log(color.yellow("🔄 Restarting polling..."));
    bot.startPolling().catch((e) =>
      console.log(color.red("❌ Polling restart failed:", e.message))
    );
  }, 3000);
});

// Global Telegram error logging
bot.on("error", (err) => {
  console.log(color.red("⚠️ Telegram error:"), err.message);
});

// ==========================
// LOAD KNOWLEDGE
// ==========================
function loadKnowledge() {
  console.log(color.cyan("📘 Loading knowledge files..."));

  const files = ["book0.txt", "book1.txt", "traits.txt", "rules.txt"];
  let content = "";

  for (const file of files) {
    const path = `./knowledge/${file}`;

    if (!fs.existsSync(path)) {
      console.log(color.yellow(`⚠️ Missing knowledge file: ${file}`));
      continue;
    }

    console.log(color.green(`✔ Loaded ${file}`));
    content += `\n### ${file}\n`;
    content += fs.readFileSync(path, "utf8") + "\n";
  }

  console.log(color.green("✅ Knowledge fully loaded.\n"));
  return content;
}

const KNOWLEDGE = loadKnowledge();

// Ensure memory directory
fs.ensureDirSync("./memory");

// ==========================
// MEMORY HELPERS
// ==========================
function loadMemory(chatId) {
  const path = `./memory/${chatId}.json`;
  if (!fs.existsSync(path)) return [];
  return JSON.parse(fs.readFileSync(path));
}

function saveMemory(chatId, history) {
  const path = `./memory/${chatId}.json`;
  fs.writeFileSync(path, JSON.stringify(history, null, 2));
  console.log(color.yellow(`📝 Memory saved for ${chatId}`));
}

// ==========================
// TAG DETECTION (bulletproof)
// ==========================
function shouldRespond(msg, botUserName) {
  const text = msg.text || "";

  if (msg.chat.type === "private") return true;
  if (!botUserName) return false;

  // Entity detection
  if (msg.entities) {
    for (const e of msg.entities) {
      if (e.type === "mention") {
        const mention = text.substring(e.offset, e.offset + e.length);
        if (mention === `@${botUserName}`) return true;
      }
    }
  }

  // Raw fallback
  if (text.includes(`@${botUserName}`)) return true;

  // Reply to bot
  if (
    msg.reply_to_message &&
    msg.reply_to_message.from &&
    msg.reply_to_message.from.username === botUserName
  ) {
    return true;
  }

  return false;
}

// ==========================
// BUILD PROMPT
// ==========================
function buildPrompt(userText, memory, userName) {
  const memoryText = memory
    .slice(-CONFIG.MEMORY_LIMIT)
    .map((m) => {
      const nameTag = m.name ? `(${m.name})` : "";
      return `${m.role.toUpperCase()}${nameTag}: ${m.text}`;
    })
    .join("\n");

  return [
    {
      role: "system",
      content: `
You are GAI — the cheerful, whimsical companion AI of Gaia.

RULES:
- Address users personally by name.
- Be warm, positive, and whimsical.
- Stay inside the Gaia knowledge base.
- Do not invent lore.
- Provide clear and helpful replies.

KNOWLEDGE:
${KNOWLEDGE}

RECENT MEMORY:
${memoryText}
`,
    },
    {
      role: "user",
      content: userText,
    },
  ];
}

// ==========================
// TELEGRAM MESSAGE HANDLER
// ==========================
bot.on("message", async (msg) => {
  if (!BOT_USERNAME) {
    console.log(color.yellow("⏳ Waiting for bot username..."));
    return;
  }

  const chatId = msg.chat.id;

  const userName =
    msg.from.username ||
    msg.from.first_name ||
    msg.from.last_name ||
    "Unknown";

  const userText = msg.text || "";

  // Only respond if tagged
  if (!shouldRespond(msg, BOT_USERNAME)) {
    console.log(
      color.yellow(
        `🤫 Ignoring: ${userName} said "${userText}" in chat ${chatId} (not tagged)`
      )
    );
    return;
  }

  console.log(color.blue(`📩 Message from ${userName} (${chatId})`));
  console.log(color.magenta(`💬 User says: ${userText}\n`));

  let history = loadMemory(chatId);

  // ================================
  // SOLANA COMMANDS
  // ================================
  if (userText.startsWith("/sol")) {
    const parts = userText.split(" ");
    const cmd = parts[1];
    const arg = parts[2];

    try {
      switch (cmd) {
        case "balance":
          if (!arg) return bot.sendMessage(chatId, "Usage: /sol balance <wallet>");

          if (!(await solanaTools.validateWallet(arg)))
            return bot.sendMessage(chatId, "❌ Invalid wallet address.");

          const bal = await solanaTools.getBalance(arg);
          return bot.sendMessage(chatId, `${userName}, that wallet holds ${bal} SOL.`);

        case "tx":
          if (!arg) return bot.sendMessage(chatId, "Usage: /sol tx <wallet>");

          const txs = await solanaTools.getTransactions(arg, 5);
          return bot.sendMessage(chatId, JSON.stringify(txs, null, 2));

        case "slot":
          const slot = await solanaTools.getCurrentSlot();
          return bot.sendMessage(chatId, `${userName}, current slot: ${slot}`);

        default:
          return bot.sendMessage(chatId, "Unknown command.");
      }
    } catch (err) {
      console.log(color.red("❌ Solana RPC Error:"), err);
      return bot.sendMessage(chatId, "RPC error, try again soon.");
    }
  }

  // ================================
  // OPENAI RESPONSE
  // ================================
  let reply = "";

  try {
    const completion = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: buildPrompt(userText, history, userName),
    });

    reply = completion.choices[0].message.content;
    console.log(color.green("💬 AI Response: " + reply));
  } catch (err) {
    console.log(color.red("❌ OpenAI Error:"), err);
    reply = "Oops — Gaia’s spark flickered. Try again!";
  }

  // Save memory
  history.push({ role: "user", name: userName, text: userText });
  history.push({ role: "assistant", text: reply });
  saveMemory(chatId, history);

  // Send reply
  bot.sendMessage(chatId, reply);
});

// ==========================
// GLOBAL CRASH PROTECTION
// ==========================
process.on("uncaughtException", (err) => {
  console.error(color.red("💥 Uncaught exception:"), err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(color.red("💥 Unhandled rejection:"), reason);
});

console.log(color.green("🤖 Gaia Agent is LIVE and running with auto-reconnect.\n"));
