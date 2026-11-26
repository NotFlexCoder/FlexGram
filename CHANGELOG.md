# Changelog

All notable changes to **FlexGram** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 26-11-2026

First release of FlexGram for Cloudflare Workers.

### Added

**Framework**

- File-based command routing: drop a `.js` file into `/command` and it
  becomes a command automatically, with hot reloading during `npm run dev`.
- Special handler files: `__message__.js` for non-command messages and
  `__inline__.js` for inline queries. Files prefixed with `_` are ignored by
  the router.
- Zero-import globals: `sendMessage`, `user`, `chat`, `flex`, `HTTP`, `API`,
  and more available in every command file.
- Firebase Realtime Database integration (`getDB`, `setDB`, `updateDB`,
  `deleteDB`, `pushDB`) with automatic path sanitization. Firebase is
  optional.
- Three-tier state management: `TEMP` (in-memory), `USER` (per-user Firebase),
  `BOT` (global Firebase), and `FLEX` (full user object store).
- `getProp` / `setProp` on `BOT`, `USER`, `TEMP`, and `FLEX` support `.add()`
  and `.remove()`: works on numbers (add / subtract), strings (append /
  remove), and arrays (push / filter) without writing a manual
  read-modify-write.
- Conversational flow helpers: `waitForAnswer()` and `clearWait()`.
- Messaging helpers: `sendMessage`, `editMessage`, `editCaption`,
  `editCallbackMessage`, `answerCallback`, `deleteMessage`.
- Media helpers: `sendPhoto`, `sendVideo`, `sendAudio`, `sendDocument`,
  `sendAnimation`, `sendSticker`, `sendVoice`, `sendLocation`, `sendContact`,
  `sendPoll`, `sendChatAction`.
- Keyboard helpers: inline keyboards, `sendReplyKeyboard`, `removeKeyboard`,
  `editButton`.
- Inline query support via `answerInlineQuery`.
- Broadcast support with configurable delay throttling.
- HTTP client globals: `HTTP.get`, `HTTP.post`, `HTTP.custom`.
- `chat_id` can be passed anywhere inside the options object for all `BOT`
  and `API` methods, with no fixed order required. Both styles work:
  `API.sendMessage({ text: "hello", chat_id: 123 })` or
  `BOT.sendMessage("hello", { chat_id: 123 })`.
- No `await` needed on `BOT`, `USER`, `TEMP`, `FLEX`, `API`, or `HTTP` calls.
  Every method handles its own promise and logs errors automatically.
  `BOT.sendMessage("hello")` works the same as
  `await BOT.sendMessage("hello")`.

**Security**

- Webhook security via `X-Telegram-Bot-Api-Secret-Token` validation
  (`verifyTGRequest`) and update-type allowlisting (`isValidUpdate`).
- Input sanitization helper `secureInput()`.

**Cloudflare Workers and CLI**

- Runs on Cloudflare Workers (`worker.js`, `wrangler.jsonc`).
- `npm run dev` opens a Cloudflare tunnel, starts the Worker locally, and sets
  the Telegram webhook automatically. `npm run dev:poll` runs with Telegram
  polling instead, with no tunnel.
- `npm run deploy` creates or updates a bot on Cloudflare: reads the bot name
  from the Telegram API, uploads env values as Worker secrets, and sets the
  webhook. The Worker URL stays the same on every redeploy.
- Multi-bot support: each bot gets its own Cloudflare Worker, secrets, and
  optional GitHub repo, all from one codebase.
- `npm run update` redeploys a bot after code changes, and `npm run env`
  pushes changed env values without redeploying.
- GitHub integration: pick a logged-in GitHub account, create a private repo,
  and push the code before every deploy.
- Env values are detected from `process.env.*` usage and collected by the CLI.
  `WEBHOOK_SECRET` is generated automatically, and `FIREBASE_URL` and
  `FIREBASE_SECRET` are optional.
- `npm run bots`, `repo`, `logs`, `bots:remove`, `webhook`, `webhook:info`, and
  `webhook:delete` for managing bots.
- `npm run build` writes a single minified `dist/worker.js`.
- `npm run new <name>` creates a command file.

**Tooling**

- Command map generator (`npm run gen`) builds `core/commands.js` from the
  `/command` folder.
- Type and snippet generators (`npm run types`): `gen-suggest.js` writes
  `globals.d.ts` for IntelliSense, `gen-snippet.js` writes VS Code snippets,
  and `ts-gen-core.js` is the shared AST parser.

### Requirements

- Node.js 22.12 or newer (Wrangler requirement).
