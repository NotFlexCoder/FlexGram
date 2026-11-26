<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=006EFF&center=true&vCenter=true&width=600&lines=FLexGram;File-Based+Command+Routing;Firebase+State+Management;Zero-Import+Globals;Deploy+to+Cloudflare+in+Minutes)](https://git.io/typing-svg)

> **A lightweight, file-based Telegram bot framework for Cloudflare Workers** with Firebase-backed state, auto command routing, zero-import globals, and a one-command CLI to run and deploy as many bots as you want.
> <br/>

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-RealtimeDB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Telegram](https://img.shields.io/badge/Telegram-Bot+API-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Commands](#-commands)
- [Multi-Bot & GitHub](#-multi-bot--github)
- [Environment Variables](#-environment-variables)
- [Core Modules](#-core-modules)
- [Global Functions Reference](#-global-functions-reference)
- [Sending Messages](#-sending-messages)
- [Media & Files](#️-media--files)
- [Keyboards & Buttons](#️-keyboards--buttons)
- [State Management](#-state-management)
- [Firebase Integration](#-firebase-integration)
- [HTTP Client](#-http-client)
- [Security](#-security)
- [Auto-Generation Tools](#-auto-generation-tools)
- [Deployment](#-deployment)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [License](#-license)
- [Changelog](#-changelog)

---

## ✨ Features

<div align="center">

| Feature                     | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| 📁 **File-Based Routing**   | Drop a `.js` file into `/command` and it becomes a command automatically    |
| 🌍 **Zero-Import Globals**  | `sendMessage`, `user`, `chat`, `flex`, `HTTP`, `API` available everywhere   |
| ☁️ **Cloudflare Workers**   | Runs on Cloudflare's edge, deployed with a single `npm run deploy`          |
| 🤖 **Multi-Bot CLI**        | Run many bots from one codebase, each with its own Worker, secrets and repo |
| 🔌 **Auto Dev Tunnel**      | `npm run dev` opens a Cloudflare tunnel and sets the webhook for you        |
| 🔥 **Firebase State**       | Per-user and per-bot persistent properties backed by Firebase Realtime DB   |
| ⚡ **Temp State**           | In-memory per-user state via `TEMP`, no DB needed for short-lived flows     |
| 🔐 **Webhook Security**     | Validates `X-Telegram-Bot-Api-Secret-Token` on every request                |
| 🎣 **Wait-For-Answer Flow** | Built-in conversational input: redirect next message to a handler           |
| 📡 **Inline Query Support** | Handle `inline_query` updates with a `__inline__.js` command file           |
| 📢 **Broadcast**            | Built-in user broadcast with delay throttling                               |

</div>

---

## 📁 Project Structure

```
FlexGram/
│
├── worker.js                  # Cloudflare Worker entry: webhook handler
├── wrangler.jsonc             # Worker configuration
├── package.json               # ESM project, wrangler is the only dependency
│
├── core/
│   ├── bot.js                 # BOT, USER, FLEX, TEMP, API, HTTP objects
│   ├── boot.js                # Copies Worker env into process.env
│   ├── commands.js            # Auto-generated command map (do not edit)
│   ├── context.js             # createContext(): parses Telegram update body
│   ├── firebase.js            # getDB, setDB, updateDB, deleteDB, pushDB
│   ├── global.js              # addGlobal(): registers all global functions
│   ├── loader.js              # buildRouter()
│   ├── keyboard.js            # keyboard.reply(), keyboard.remove()
│   ├── security.js            # isValidUpdate(), verifyTGRequest(), secureInput()
│   ├── utils.js               # Utils.sleep()
│   ├── assets-helper.js       # AssetGlobal(): asset path helper
│   └── _message.js            # Internal helper (prefixed _ = not routed)
│
├── scripts/                   # The CLI behind every npm run command
│   ├── dev.js                 # Tunnel + webhook + local Worker (or polling)
│   ├── deploy.js              # Create or update a bot on Cloudflare (+ GitHub)
│   ├── env.js                 # Edit a bot's env values and push them
│   ├── bots.js                # Per-bot config store and prompts
│   ├── cloud.js               # Wrangler login, deploy, secrets, webhook
│   ├── github.js              # GitHub account selection, repo creation, push
│   ├── manage.js              # bots list, repo, logs, remove
│   ├── webhook.js             # Webhook set / info / delete
│   ├── gen.js                 # Builds core/commands.js from /command
│   ├── new.js                 # Creates a new command file
│   ├── types.js               # Regenerates globals.d.ts and VS Code snippets
│   └── utils.js               # Shared helpers
│
├── auto-generate/
│   ├── gen-snippet.js         # Generates VS Code code snippets
│   ├── gen-suggest.js         # Generates globals.d.ts for IntelliSense
│   └── ts-gen-core.js         # AST parser for TypeScript hint generation
│
├── globals.d.ts               # Auto-generated TypeScript definitions
│
├── .bots/                     # Your bots' config and secrets (git-ignored, created on first run)
│
└── command/                   # ← YOUR BOT LIVES HERE
    ├── start.js               # Handles /start
    ├── __message__.js         # Fallback for all non-command messages (optional)
    └── __inline__.js          # Handles inline queries (optional)
```

> **💡 Tip:** Files prefixed with `_` are ignored by the router. Use them for shared helpers inside `command/`. The only exceptions are `__message__.js` and `__inline__.js`.

---

## ⚡ Quick Start

**Requirements:** Node.js **22.12+**, a free [Cloudflare account](https://dash.cloudflare.com/sign-up), and a bot token from [@BotFather](https://t.me/BotFather). Optional: [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) for the dev tunnel, and the [GitHub CLI](https://cli.github.com) for repo creation.

### 1. Clone & Install

```bash
git clone https://github.com/NotFlexCoder/FlexGram
cd FlexGram
npm install
```

### 2. Run Locally

```bash
npm run dev
```

On the first run it asks for your bot token, a project name (press Enter to auto-generate one from the bot's username), and any optional values such as Firebase. It then opens a Cloudflare tunnel, starts the Worker locally, and sets the Telegram webhook to the tunnel URL. When you stop it, the webhook goes back to your deployed Worker (or is removed if the bot isn't deployed yet).

No `cloudflared`? Use polling instead, which needs no public URL:

```bash
npm run dev:poll
```

### 3. Create Your First Command

```bash
npm run new hello
```

Edit `command/hello.js`:

```js
export default async function hello(flex) {
  await sendMessage(`👋 Hello, <b>${user.first_name}</b>!`);
}
```

Message your bot `/hello`. New command files are picked up automatically while `npm run dev` is running.

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

This logs in to Cloudflare if needed, deploys your Worker, uploads your env values as secrets, and sets the webhook. The Worker URL stays the same on every later deploy.

---

## 🧰 Commands

| Command               | What it does                                                                      |
| --------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`         | Local Worker + Cloudflare tunnel + automatic webhook                              |
| `npm run dev:poll`    | Local Worker + Telegram polling (no tunnel)                                       |
| `npm run build`       | Generates the command map and writes one minified `dist/worker.js`                |
| `npm run deploy`      | Pick a bot or create a new one, then deploy it to Cloudflare                      |
| `npm run update`      | You changed code: redeploy an existing bot (and push to its GitHub repo)          |
| `npm run env`         | You changed env values: edit them and push them to Cloudflare without redeploying |
| `npm run bots`        | List your bots with their Worker URL and GitHub repo                              |
| `npm run repo`        | Set or change a bot's GitHub repo and push the code                               |
| `npm run logs`        | Live logs from a deployed bot                                                     |
| `npm run bots:remove` | Delete a bot's Worker, webhook and local config                                   |
| `npm run webhook`     | Re-set the webhook to the deployed URL (`webhook:info`, `webhook:delete` too)     |
| `npm run new <name>`  | Create `command/<name>.js`                                                        |
| `npm run types`       | Regenerate `globals.d.ts` and VS Code snippets                                    |

With more than one bot, a menu asks which one to use. To skip it, pass the name: `npm run update -- my-bot`. To add another bot, run `npm run deploy` (or `npm run dev -- --new`) and choose **+ new bot**.

---

## 🔀 Multi-Bot & GitHub

One codebase can run any number of bots. Each bot gets:

- its own **Cloudflare Worker**, named after the project, so its URL never changes
- its own **secrets** (bot token, webhook secret, Firebase, anything else you add)
- optionally its own **GitHub repository**

Bot settings live in `.bots/<project-name>/` on your machine. That folder is git-ignored and never leaves your computer.

During the first `npm run deploy` of a bot you can link a GitHub repo: enter `new` to create a private repo (you pick which logged-in GitHub account to use, or add another one), paste an existing repo URL, or press Enter to skip. After that, `npm run deploy` and `npm run update` push your code to that repo first and then deploy to Cloudflare. Creating a repo needs the [GitHub CLI](https://cli.github.com) (`gh`, version 2.40 or newer).

> **Note:** The Worker is deployed from your machine, not built from GitHub. If you want Cloudflare to auto-deploy on every push, connect the repo once under **Workers & Pages → your Worker → Settings → Build**.

---

## 🔑 Environment Variables

You never create a `.env` file. The CLI finds every `process.env.NAME` used in your code and asks for any value it doesn't have yet. Values are stored per bot in `.bots/`, written to `.dev.vars` for local runs, and uploaded as Cloudflare secrets on deploy.

| Variable          | Required    | Description                                          | Where to get it                                               |
| ----------------- | ----------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| `BOT_TOKEN`       | ✅ Yes      | Telegram Bot API token                               | [@BotFather](https://t.me/BotFather) → `/newbot`              |
| `WEBHOOK_SECRET`  | ✅ Auto     | Validates webhook requests (generated for you)       | Created automatically                                         |
| `FIREBASE_URL`    | ⬜ Optional | Firebase Realtime DB URL, only for database features | Firebase Console → Project Settings                           |
| `FIREBASE_SECRET` | ⬜ Optional | Firebase DB legacy REST secret                       | Firebase Console → Service Accounts                           |
| `BASE_URL`        | ⬜ Auto     | Public URL of the bot, used by the `asset()` helper  | Set to the tunnel URL in dev and the Worker URL when deployed |

To change a value later, run `npm run env` and enter `KEY=VALUE`. If you add a new `process.env.MY_KEY` to your code, the next `npm run dev`, `deploy` or `env` asks for it.

> **🔥 Firebase:** It is only needed if you use database features (`getDB`, `setDB`, `USER`, `BOT`, `waitForAnswer` and so on). Database paths are not namespaced per bot, so give each bot its own Firebase database if you run several.

> **🔒 Security:** Never commit `.bots/`, `.dev.vars` or any file containing secrets. They are already in `.gitignore`.

---

### `core/context.js` — Update Context

Every incoming Telegram update is parsed into a `flex` context object:

```js
{
  user: {
    id: 123456789,           // Telegram user ID (number)
    telegramid: "123456789", // String version
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    language_code: "en",
    chatid: 123456789,       // Chat ID this user is in
    created_at: Date         // Timestamp of this update
  },
  chat: {
    id: 123456789,
    chat_type: "private"     // "private" | "group" | "supergroup" | "channel"
  },
  message: "/start hello",   // Full raw text
  message_id: 42,
  command: "/start",         // null if not a command
  params: "hello",           // Everything after the command
  isCallback: false,
  callbackData: null,
  callbackQueryId: null,
  callbackMessageHasMedia: false,
  isInlineQuery: false,
  inlineQuery: null,
  inlineQueryId: null,
  request: { ... }           // Raw Telegram update fields
}
```

### `core/loader.js` — Command Router

Files in `/command` are automatically loaded and mapped to commands:

| File Path                | Maps To     | Notes                          |
| ------------------------ | ----------- | ------------------------------ |
| `command/start.js`       | `/start`    | Handles `/start` command       |
| `command/help.js`        | `/help`     | Handles `/help` command        |
| `command/__message__.js` | Fallback    | All non-command text messages  |
| `command/__inline__.js`  | Inline      | All `inline_query` updates     |
| `command/_helper.js`     | _(ignored)_ | Prefixed `_` files are skipped |

The router uses **hot module watching** — new command files are detected instantly without restarting the server.

---

## 🌍 Global Functions Reference

All globals are injected per-request via `addGlobal(flex)` — no imports needed inside command files.

### Context Globals

```js
flex; // Full context object (see above)
user; // flex.user — { id, first_name, last_name, username, ... }
chat; // flex.chat — { id, chat_type }
message; // Raw message text string
message_id; // Incoming message ID
command; // "/start" or null
params; // Everything after command (e.g., "hello world")
isCallback; // boolean — true if this is a callback_query
callbackData; // string | null — callback button data
callbackQueryId; // string | null
isInlineQuery; // boolean
inlineQuery; // string | null — inline query text
```

---

## 📨 Sending Messages

### `sendMessage(text, options?)`

```js
// Simple text — no await needed, errors are auto-logged
sendMessage("Hello World!");

// HTML formatting
sendMessage("<b>Bold</b>, <i>italic</i>, <code>code</code>");

// Markdown formatting
sendMessage("**Bold** and _italic_", { parse_mode: "Markdown" });

// With inline keyboard buttons
sendMessage("Choose:", {
  buttons: [
    { text: "Option A", command: "/option_a" },
    { text: "Option B", command: "/option_b" },
  ],
});

// Reply to specific message
sendMessage("Got it!", { reply_to_message_id: message_id });

// Send to a different chat
sendMessage("Hello there!", { chat_id: 1234567890 });
```

You can also call `BOT.sendMessage` or `API.sendMessage` directly:

```js
// BOT — friendly wrapper, chat_id auto-resolved from context
BOT.sendMessage("Hello!", { chat_id: 1234567890, buttons: [...] });

// API — raw Telegram payload, all fields explicit
API.sendMessage({ text: "Hello!", chat_id: 1234567890 });
API.sendMessage({ chat_id: 1234567890, text: "Hello!" }); // order doesn't matter
```

> **💡 No `await` needed.** All `BOT`, `API`, `USER`, `TEMP`, `FLEX`, and `HTTP` methods handle their own promises and log errors automatically. `BOT.sendMessage("hi")` works exactly the same as `await BOT.sendMessage("hi")`.

### `editMessage(messageId, text, options?)`

```js
editMessage(message_id, "Updated text!");
```

### `editCaption(messageId, caption, options?)`

```js
editCaption(message_id, "New caption");
```

### `editCallbackMessage(text, buttons?, messageId?)`

Smart edit — automatically edits caption if message has media, text otherwise:

```js
editCallbackMessage("Updated!", [{ text: "Back", command: "/start" }]);
```

### `answerCallback(text?, showAlert?)`

```js
answerCallback("Done! ✅");
answerCallback("Error occurred", true); // show_alert popup
```

### `deleteMessage(messageId)`

```js
deleteMessage(message_id);
```

---

## 🖼️ Media & Files

### `sendPhoto(photo, options?)`

```js
sendPhoto("https://example.com/image.jpg", {
  caption: "<b>My Photo Caption</b>",
  buttons: [{ text: "View More", url: "https://example.com" }],
  chat_id: 1234567890, // optional — send to a different chat
});

// Using file_id (from a previously sent photo)
sendPhoto("AgACAgIAAxkBAAI...", { caption: "Cached photo" });
```

### `sendVideo(video, options?)`

```js
sendVideo("https://example.com/video.mp4", { caption: "Check this out!" });
```

### `sendAudio(audio, options?)`

```js
sendAudio("https://example.com/track.mp3", { caption: "🎵 Song Name" });
```

### `sendDocument(document, options?)`

```js
sendDocument("https://example.com/file.pdf", { caption: "Here's the PDF" });
```

### `sendAnimation(animation, options?)`

```js
sendAnimation("https://example.com/anim.gif", { caption: "Look at this GIF!" });
```

### `sendSticker(sticker)`

```js
sendSticker("CAACAgIAAxkBAAI...");
```

### `sendVoice(voice, options?)`

```js
sendVoice("https://example.com/voice.ogg", { caption: "Voice note" });
```

### `sendLocation(latitude, longitude, opts?)`

```js
sendLocation(19.076, 72.8777); // Mumbai
```

### `sendContact(phone_number, first_name, opts?)`

```js
sendContact("+919876543210", "John");
```

### `sendPoll(question, options, opts?)`

```js
sendPoll("What's your favourite language?", [
  "JavaScript",
  "Python",
  "Go",
  "Rust",
]);
```

### `sendChatAction(action)`

Show typing indicator or other activity:

```js
sendChatAction("typing"); // Shows "typing..."
sendChatAction("upload_photo"); // Shows "sending photo..."
sendChatAction("upload_document");
sendChatAction("record_voice");
```

---

## ⌨️ Keyboards & Buttons

### Inline Keyboard Buttons

Buttons can be passed as `buttons` in options to `sendMessage`, `sendPhoto`, etc.

```js
// Single button
const buttons = { text: "Click Me", command: "/action" };

// Button row (array of buttons = vertical list, each on its own row)
const buttons = [
  { text: "Option 1", command: "/opt1" },
  { text: "Option 2", command: "/opt2" },
];

// Grid (array of arrays = row per inner array)
const buttons = [
  [
    { text: "Row 1 Col 1", command: "/r1c1" },
    { text: "Row 1 Col 2", command: "/r1c2" },
  ],
  [{ text: "Row 2 Full Width", command: "/r2" }],
];

// URL button
const buttons = { text: "Open Website", url: "https://example.com" };
```

### Reply Keyboard (persistent keyboard)

```js
sendReplyKeyboard(
  "Pick one:",
  [["Option A", "Option B"], ["Option C"]],
  "HTML",
  { resize_keyboard: true, one_time_keyboard: true },
);
```

### Remove Reply Keyboard

```js
removeKeyboard("Keyboard removed.");
```

### Edit Buttons Only (no text change)

```js
editButton(message_id, [{ text: "Updated Button", command: "/new_action" }]);
```

---

## 💾 State Management

The framework provides four tiers of state. All store methods work without `await` — errors are caught and logged automatically.

### 1. `TEMP` — In-Memory (per user, session-only)

Fast, zero DB calls. Cleared on server restart.

```js
// Store
TEMP.setProp("step", "waiting_email");
TEMP.setProperty("count", 42);

// Read
const step = await TEMP.getProp("step").value();

// Arithmetic / string / array operations
await TEMP.getProp("count").add(1); // 43
await TEMP.getProp("count").remove(3); // 40
await TEMP.getProp("tags").add("vip"); // [..., "vip"]

// Delete
TEMP.deleteProp("step");
```

### 2. `USER` — Firebase Per-User Persistent

Stored under `user_properties/<userId>/<name>` in Firebase.

```js
// Store
USER.setProp("language", "en");
USER.setProperty("plan", "pro");

// Read
const lang = await USER.getProp("language").value();

// Arithmetic / string / array operations
await USER.getProp("points").add(10); // adds 10
await USER.getProp("points").remove(5); // subtracts 5
await USER.getProp("badges").add("gold"); // pushes to array

// Delete
USER.deleteProp("language");
```

### 3. `BOT` — Firebase Global Bot Properties

Stored under `bot_properties/<name>`. Shared across all users.

```js
BOT.setProp("maintenance", "false");
const val = await BOT.getProp("maintenance").value();

// Works with .add() and .remove() too
await BOT.getProp("total_users").add(1);
```

### 4. `FLEX` — Firebase Full User Object

Full user data store under `users/<userId>/<key>`.

```js
FLEX.setProperty("score", 100);
const score = await FLEX.getProperty("score").value();
const allData = await FLEX.getAllProperties();
FLEX.deleteProperty("score");

// Supports .add() and .remove()
await FLEX.getProperty("score").add(50); // 150
await FLEX.getProperty("score").remove(20); // 130
```

### `waitForAnswer` — Conversational Flow

Redirect the user's **next message** to a specific command handler:

```js
// In /ask_name.js
export default async function ask_name(flex) {
  await sendMessage("What is your name?");
  await waitForAnswer("/save_name", { timeout_ms: 60000 }); // 1 minute timeout
}

// In /save_name.js
export default async function save_name(flex) {
  const name = message; // whatever the user typed
  await USER.setProp("name", name);
  await sendMessage(`Got it! Your name is <b>${name}</b>.`);
  await clearWait(); // clear the wait state
}
```

---

## 🔥 Firebase Integration

The `firebase.js` module provides a simple REST wrapper around Firebase Realtime Database.

```js
import { getDB, setDB, updateDB, deleteDB, pushDB } from "./core/firebase.js";

// Read
const data = await getDB("path/to/node");

// Write (overwrites)
await setDB("path/to/node", { key: "value" });

// Update (merge)
await updateDB("path/to/node", { key: "new_value" });

// Delete
await deleteDB("path/to/node");

// Push (auto-generates key, like Firebase push())
const result = await pushDB("path/to/list", { item: "data" });
```

> All paths with `.`, `#`, `$`, `[`, `]` are automatically sanitized to `_`.

---

## 🌐 HTTP Client

The `HTTP` global provides simple HTTP helpers — no import needed:

### `HTTP.get({ url, headers? })`

```js
const data = await HTTP.get({ url: "https://api.example.com/users" });
```

### `HTTP.post({ url, body?, headers? })`

```js
const result = await HTTP.post({
  url: "https://api.example.com/orders",
  body: { item: "book", qty: 2 },
});
```

### `HTTP.custom({ url, method?, header?, body? })`

```js
const result = await HTTP.custom({
  url: "https://api.example.com/items/42",
  method: "DELETE",
  header: { Authorization: "Bearer token123" },
});
```

---

## 🔐 Security

### Webhook Validation

The Worker rejects any POST request whose `X-Telegram-Bot-Api-Secret-Token` header does not match your `WEBHOOK_SECRET` (it answers `401`). `npm run dev` and `npm run deploy` register the webhook with the right secret for you. To do it by hand:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-worker>.workers.dev" \
  -d "secret_token=<WEBHOOK_SECRET>"
```

### Update Allowlist

Only the following Telegram update types are accepted:

```
message, edited_message, callback_query, inline_query,
pre_checkout_query, shipping_query, poll, poll_answer,
my_chat_member, chat_member
```

All other updates return `400 Bad Request`.

### Input Sanitization

```js
import { secureInput } from "./core/security.js";

const safe = secureInput(user.first_name);
// Escapes: & → &amp;  < → &lt;  > → &gt;  " → &quot;
```

### Secrets

Secrets are stored locally in `.bots/` (git-ignored) and on Cloudflare as Worker secrets. Rotate your `BOT_TOKEN` in @BotFather if it is ever exposed.

For more details on responsible disclosure, see [SECURITY.md](./SECURITY.md).

---

## 🤖 Auto-Generation Tools

### Command map: `npm run gen`

Builds `core/commands.js` from the files in `/command`. It runs automatically on `dev`, `build`, `deploy` and `update`, so you rarely call it yourself.

### Types and snippets: `npm run types`

- `gen-suggest.js` generates `globals.d.ts`, which powers VS Code IntelliSense for all globals.
- `gen-snippet.js` generates `.vscode/flex-tg.code-snippets` with autocomplete for the global functions.

Run `npm run types` after you add or change a global in `core/`.

---

## 🚀 Deployment

FlexGram runs on **Cloudflare Workers**.

### One command

```bash
npm run deploy     # first deploy, or add a new bot
npm run update     # redeploy after changing code
npm run env        # push changed env values
npm run logs       # live logs
```

### Build output

```bash
npm run build
```

Writes a single minified Worker to `dist/worker.js`.

### Manual deploy with Wrangler

```bash
npm run gen
npx wrangler deploy --name my-bot
npx wrangler secret put BOT_TOKEN --name my-bot
npx wrangler secret put WEBHOOK_SECRET --name my-bot
```

Then set the webhook with the `curl` command from the Security section.

> **Other hosts:** This project targets Cloudflare Workers only. `core/boot.js` imports `cloudflare:workers`, so it does not run unmodified on Node servers, Vercel or Docker.

### IntelliSense for Globals

`jsconfig.json` and `globals.d.ts` are included, so `sendMessage`, `user`, `chat`, `HTTP`, `API` and the other globals get type hints and autocomplete inside your command files. Run `npm run types` to refresh them.

---

## 💡 Examples

### `/start` Command with Buttons

```js
// command/start.js
export default async function start(flex) {
  sendMessage(
    `👋 <b>Welcome, ${user.first_name}!</b>\n\n` +
      `I'm a bot built with Flex TG Bot Framework.\n\n` +
      `Choose an option below:`,
    {
      buttons: [
        [
          { text: "ℹ️ About", command: "/about" },
          { text: "⚙️ Settings", command: "/settings" },
        ],
        [{ text: "🌐 Visit Website", url: "https://example.com" }],
      ],
    },
  );
}
```

### Multi-Step Conversation

```js
// command/register.js
export default async function register(flex) {
  await sendMessage("Let's register you! What's your email?");
  await waitForAnswer("/save_email", { timeout_ms: 120000 });
}

// command/save_email.js
export default async function save_email(flex) {
  const email = message.trim();
  if (!email.includes("@")) {
    await sendMessage("⚠️ That doesn't look like a valid email. Try again.");
    await waitForAnswer("/save_email");
    return;
  }
  await USER.setProp("email", email);
  await clearWait();
  sendMessage(`✅ Email saved: <code>${email}</code>`);
}
```

### Fetch External API

```js
// command/weather.js
export default async function weather(flex) {
  const city = params || "Mumbai";
  sendChatAction("typing");

  const data = await HTTP.get({
    url: `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
  });

  const temp = data.current_condition[0].temp_C;
  sendMessage(`🌤 <b>${city}</b>: ${temp}°C`);
}
```

### Callback Query Handler

```js
// command/menu.js
export default async function menu(flex) {
  if (isCallback) {
    answerCallback("You clicked: " + callbackData);
    editCallbackMessage(`You selected: <b>${callbackData}</b>`, [
      { text: "« Back", command: "/menu" },
    ]);
    return;
  }

  sendMessage("Main Menu", {
    buttons: [
      { text: "🅰️ Option A", command: "option_a" },
      { text: "🅱️ Option B", command: "option_b" },
    ],
  });
}
```

### Broadcast to Multiple Users

```js
// command/admin_broadcast.js
export default async function admin_broadcast(flex) {
  const adminId = 123456789; // your Telegram ID
  if (user.id !== adminId) return;

  const userIds = (await getDB("all_user_ids")) || [];
  const results = await broadcast(
    Object.values(userIds),
    "📢 <b>Important Update!</b>\n\nCheck out the latest features!",
    [{ text: "Learn More", url: "https://example.com" }],
    100, // 100ms delay between messages
  );

  sendMessage(
    `Broadcast done!\n✅ Sent: ${results.sent}\n❌ Failed: ${results.failed}`,
  );
}
```

### Inline Query Handler

```js
// command/__inline__.js
export default async function inline_handler(flex) {
  const query = inlineQuery || "";

  answerInlineQuery([
    {
      type: "article",
      id: "1",
      title: `Search: ${query}`,
      input_message_content: {
        message_text: `You searched for: <b>${query}</b>`,
        parse_mode: "HTML",
      },
      description: "Send this to the chat",
    },
  ]);
}
```

More example bots are available in the [examples/](examples/) directory.

---

## 🤝 Contributing

Contributions are welcome! Please read
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for development setup, coding style,
and pull request guidelines. By participating, you agree to follow our
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

---

## 📜 License

FlexGram is released under the [MIT License](./LICENSE).

---

## 📝 Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history.

<div align="center">

---

❤️ Built by **Flex Coder** · Powered by [Telegram Bot API](https://core.telegram.org/bots/api) · [Firebase](https://firebase.google.com/) · [Cloudflare Workers](https://workers.cloudflare.com/)

![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>
