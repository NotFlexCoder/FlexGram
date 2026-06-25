<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=006EFF&center=true&vCenter=true&width=600&lines=FLexGram;File-Based+Command+Routing;Firebase+State+Management;Zero-Import+Globals;Deploy+in+Minutes)](https://git.io/typing-svg)

> **A lightweight, file-based Telegram bot framework** with Firebase-backed state, auto command routing, and zero-import globals — built for fast development and easy deployment.
> <br/>

![Firebase](https://img.shields.io/badge/Firebase-RealtimeDB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-000000?style=for-the-badge&logo=vercel&logoColor=white) ![Telegram](https://img.shields.io/badge/Telegram-Bot+API-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
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

| Feature                     | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| 📁 **File-Based Routing**   | Drop a `.js` file into `/command` and it becomes a command automatically  |
| 🌍 **Zero-Import Globals**  | `sendMessage`, `user`, `chat`, `flex`, `HTTP`, `API` available everywhere |
| 🔥 **Firebase State**       | Per-user and per-bot persistent properties backed by Firebase Realtime DB |
| ⚡ **Temp State**           | In-memory per-user state via `TEMP` — no DB needed for short-lived flows  |
| 🔐 **Webhook Security**     | Validates `X-Telegram-Bot-Api-Secret-Token` on every request              |
| 🎣 **Wait-For-Answer Flow** | Built-in conversational input: redirect next message to a handler         |
| 📡 **Inline Query Support** | Handle `inline_query` updates with `__inline__` command file              |
| 🚀 **Vercel Ready**         | `vercel.json` included for one-command serverless deployment              |
| 📢 **Broadcast**            | Built-in user broadcast with delay throttling                             |

</div>

---

## 📁 Project Structure

```
flex-tg-bot-framework/
│
├── main.js                    # Entry point — Express server + webhook handler
├── package.json               # ESM project, dotenv + express deps
├── vercel.json                # Vercel serverless config
│
├── core/
│   ├── bot.js                 # BOT, USER, FLEX, TEMP, API, HTTP objects
│   ├── context.js             # createContext() — parses Telegram update body
│   ├── firebase.js            # getDB, setDB, updateDB, deleteDB, pushDB
│   ├── global.js              # addGlobal() — registers all global functions
│   ├── loader.js              # buildRouter(), watchCommandFolder()
│   ├── keyboard.js            # keyboard.reply(), keyboard.remove()
│   ├── security.js            # isValidUpdate(), verifyTGRequest(), secureInput()
│   ├── utils.js               # Utils.sleep()
│   ├── assets-helper.js       # AssetGlobal() — asset path helpers
│   └── _message.js            # Internal message helper (prefixed _ = not routed)
│
├── auto-generate/
│   ├── gen-env.js             # Auto-scans process.env.* and writes .env
│   ├── gen-snippet.js         # Generates VS Code code snippets
│   ├── gen-suggest.js         # Generates globals.d.ts for IntelliSense
│   └── ts-gen-core.js         # AST parser for TypeScript hint generation
│
├── globals.d.ts               # Auto-generated TypeScript definitions
│
├── docs/                       # Additional documentation
├── examples/                    # Example bots and snippets
│
└── command/                    # ← YOUR BOT LIVES HERE
    ├── start.js                # Handles /start
    ├── __message__.js          # Fallback for all non-command messages
    └── __inline__.js           # Handles inline queries
```

> **💡 Tip:** Files prefixed with `_` are ignored by the router. Use them for shared helpers inside the `command/` folder.

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/NotFlexCoder/FlexGram
cd FlexGram
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Fill in your values (see Environment Variables section below)
```

### 3. Register Your Webhook

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/" \
  -d "secret_token=<WEBHOOK_SECRET>"
```

Or

```bash
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HOSTING_URL>&secret_token=<YOUR_SECRET>
```

### 4. Create Your First Command

```bash
mkdir -p command
```

Create `command/start.js`:

```js
export default async function start(flex) {
  await sendMessage(`👋 Hello, <b>${user.first_name}</b>! Welcome to my bot.`);
}
```

### 5. Run Locally

```bash
node main.js
# Server running on http://localhost:3000
```

### 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

---

## 🔑 Environment Variables

All environment variables are **auto-detected** by `gen-env.js` which scans all `.js` files for `process.env.*` usage and writes missing keys to your `.env` file.

Create a `.env` file in the project root with the following variables:

```env
# Your Telegram Bot Token from @BotFather
BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi

# Secret token to validate incoming Telegram webhook requests (Must be 1–256 chars, only A-Z, a-z, 0-9, _ and - allowed)
WEBHOOK_SECRET=my_super_secret_token_here

────────────────── 🔥 FIREBASE REALTIME DATABASE ─────────────────

# Your Firebase Realtime Database URL
# Found in Firebase Console → Project Settings → General
# Format: https://<project-id>-default-rtdb.firebaseio.com
FIREBASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# Firebase Database secret (legacy auth for Realtime DB REST API)
# Found in Firebase Console → Project Settings → Service Accounts → Database secrets
FIREBASE_SECRET=your_firebase_database_secret_here


────────────────── 🌐 SERVER CONFIGURATION ─────────────────

# Port the Express server listens on (defaults to 3000 if not set)
PORT=3000
```

### Environment Variable Reference Table

| Variable          | Required    | Description                         | Where to Get It                                  |
| ----------------- | ----------- | ----------------------------------- | ------------------------------------------------ |
| `BOT_TOKEN`       | ✅ Yes      | Telegram Bot API token              | [@BotFather](https://t.me/BotFather) → `/newbot` |
| `WEBHOOK_SECRET`  | ✅ Yes      | Secret to validate webhook requests | Choose any strong random string                  |
| `FIREBASE_URL`    | ✅ Yes      | Firebase Realtime DB base URL       | Firebase Console → Project Settings              |
| `FIREBASE_SECRET` | ✅ Yes      | Firebase DB legacy REST auth secret | Firebase Console → Service Accounts              |
| `PORT`            | ⬜ Optional | HTTP server port (default: `3000`)  | Set to `3000` locally                            |

> **🔒 Security:** Never commit your `.env` file to Git. Add it to `.gitignore`.

```bash
echo ".env" >> .gitignore
```

---

## 📦 Core Modules

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

Every POST request must include the `X-Telegram-Bot-Api-Secret-Token` header matching your `WEBHOOK_SECRET` env var. This is enforced via `verifyTGRequest()`.

When registering your webhook:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/" \
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

For more details on responsible disclosure, see [SECURITY.md](./SECURITY.md).

---

## 🤖 Auto-Generation Tools

### `gen-env.js` — Auto `.env` Generator

Scans all `.js` files for `process.env.*` usage and ensures `.env` has entries for all found keys:

```bash
node auto-generate/gen-env.js
```

### `gen-suggest.js` — TypeScript Definitions

Auto-generates `globals.d.ts` from source files — powers VS Code IntelliSense for all globals:

```bash
# Runs automatically on server start via main.js → genSuggest()
```

### `gen-snippet.js` — VS Code Snippets

Generates `.vscode/flex.code-snippets` with autocomplete for all global functions.

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel login
vercel

# Set environment variables via Vercel dashboard or CLI:
vercel env add BOT_TOKEN
vercel env add WEBHOOK_SECRET
vercel env add FIREBASE_URL
vercel env add FIREBASE_SECRET
```

The included `vercel.json` routes all requests to `main.js`:

```json
{
  "version": 2,
  "builds": [{ "src": "main.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/", "dest": "main.js" }]
}
```

### Manual VPS / PM2

```bash
npm install
npm install -g pm2

pm2 start main.js --name flex-bot
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "main.js"]
```

```bash
docker build -t flex-bot .
docker run -d --env-file .env -p 3000:3000 flex-bot
```

---

### IntelliSense for Globals

The framework auto-generates `globals.d.ts` on startup. To enable it in VS Code, add a `jsconfig.json`:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["**/*.js", "globals.d.ts"],
  "exclude": ["node_modules"]
}
```

After this, `sendMessage`, `user`, `chat`, `HTTP`, `API` etc. will all have type hints and autocomplete inside your command files.

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

❤️ Built by **Flex Coder** · Powered by [Telegram Bot API](https://core.telegram.org/bots/api) · [Firebase](https://firebase.google.com/) · [Express](https://expressjs.com/) · [Vercel](https://vercel.com/)

![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>
