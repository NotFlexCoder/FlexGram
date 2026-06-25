# Changelog

All notable changes to **FlexGram** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 16-06-2026

### Added

- File-based command routing — drop a `.js` file into `/command` and it
  becomes a command automatically, with hot module watching.
- Zero-import globals: `sendMessage`, `user`, `chat`, `flex`, `HTTP`, `API`,
  and more available in every command file.
- Firebase Realtime Database integration (`getDB`, `setDB`, `updateDB`,
  `deleteDB`, `pushDB`) with automatic path sanitization.
- Three-tier state management: `TEMP` (in-memory), `USER` (per-user Firebase),
  `BOT` (global Firebase), and `FLEX` (full user object store).
- Conversational flow helpers: `waitForAnswer()` and `clearWait()`.
- Messaging helpers: `sendMessage`, `editMessage`, `editCaption`,
  `editCallbackMessage`, `answerCallback`, `deleteMessage`.
- Media helpers: `sendPhoto`, `sendVideo`, `sendAudio`, `sendDocument`,
  `sendAnimation`, `sendSticker`, `sendVoice`, `sendLocation`, `sendContact`,
  `sendPoll`, `sendChatAction`.
- Keyboard helpers: inline keyboards, `sendReplyKeyboard`, `removeKeyboard`,
  `editButton`.
- Inline query support via `command/__inline__.js` and `answerInlineQuery`.
- Broadcast support with configurable delay throttling.
- HTTP client globals: `HTTP.get`, `HTTP.post`, `HTTP.custom`.
- Webhook security via `X-Telegram-Bot-Api-Secret-Token` validation
  (`verifyTGRequest`) and update-type allowlisting (`isValidUpdate`).
- Input sanitization helper `secureInput()`.
- Auto-generation tooling: `gen-env.js` (`.env` scaffolding from
  `process.env.*` usage), `gen-suggest.js` (`globals.d.ts` for IntelliSense),
  `gen-snippet.js` (VS Code snippets), `ts-gen-core.js` (AST parser).
- Deployment configs for Vercel (`vercel.json`), PM2, and Docker.

## [1.0.1] - 25-06-2026

### Added

- `getProp` / `setProp` on `BOT`, `USER`, `TEMP`, and `FLEX` now support
  `.add()` and `.remove()` — works on numbers (add / subtract), strings
  (append / remove), and arrays (push / filter) without writing a manual
  read-modify-write.
- `chat_id` can now be passed anywhere inside the options object for all
  `BOT` and `API` methods — no fixed order required. Both styles work:
  `API.sendMessage({ text: "hello", chat_id: 123 })` or
  `BOT.sendMessage("hello", { chat_id: 123 })`.
- No `await` needed on `BOT`, `USER`, `TEMP`, `FLEX`, `API`, or `HTTP`
  calls — every method handles its own promise and logs errors automatically.
  `BOT.sendMessage("hello")` works the same as
  `await BOT.sendMessage("hello")`.
