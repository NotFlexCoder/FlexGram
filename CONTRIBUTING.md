# Contributing to FlexGram

Thanks for your interest in improving **FlexGram**, a lightweight, file-based
Telegram bot framework for Cloudflare Workers with Firebase-backed state, auto
command routing, and zero-import globals. Contributions of all kinds are
welcome!

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Adding a New Command](#adding-a-new-command)
- [Adding/Modifying Globals](#addingmodifying-globals)
- [Changing the CLI](#changing-the-cli)
- [Coding Style](#coding-style)
- [Commit Messages](#commit-messages)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Reporting Security Issues](#reporting-security-issues)

## Getting Started

1. Fork the repository:
   `https://github.com/NotFlexCoder/FlexGram`
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/FlexGram
cd FlexGram
npm install
```

You need **Node.js 22.12 or newer**.

## Project Structure

Please read **Project Structure** in `README.md` before making changes,
especially the `core/` module boundaries (`bot.js`, `context.js`,
`firebase.js`, `global.js`, `loader.js`, `keyboard.js`, `security.js`,
`utils.js`, `assets-helper.js`) and the `scripts/` CLI.

## Development Setup

```bash
npm run dev        # local Worker + Cloudflare tunnel + webhook (needs cloudflared)
npm run dev:poll   # local Worker + Telegram polling (no tunnel)
```

The first run asks for a bot token from [@BotFather](https://t.me/BotFather).
Use a throwaway test bot, never a production one. There is no `.env` file:
values are stored in `.bots/`, which is git-ignored.

## Adding a New Command

- Run `npm run new <name>`, or drop a `.js` file into `/command`. The filename
  becomes the command (e.g., `command/help.js` → `/help`).
- Files prefixed with `_` are ignored by the router and can be used as shared
  helpers.
- Special files: `__message__.js` (fallback for non-command messages) and
  `__inline__.js` (inline query handler).
- Use the provided globals (`sendMessage`, `user`, `chat`, `flex`, `HTTP`,
  `TEMP`, `USER`, `BOT`, `FLEX`, etc.). No imports are required inside command
  files.

## Adding/Modifying Globals

If you add a new global function, register it in `core/global.js` via
`addGlobal(flex)`, then regenerate the TypeScript hints and snippets:

```bash
npm run types
```

## Changing the CLI

The `npm run` commands live in `scripts/`. Before opening a PR that touches
them, check that these still work against a test bot: `npm run dev`,
`npm run dev:poll`, `npm run build`, and `npm run deploy` followed by
`npm run update`.

## Coding Style

- Use ES Modules (`import`/`export`), matching the existing codebase.
- Keep command files focused on a single command/handler.
- Use `secureInput()` from `core/security.js` when echoing user-provided text
  back into HTML messages.
- Prefer the existing global helpers (`HTTP`, `TEMP`, `USER`, `BOT`, `FLEX`)
  over raw `fetch`/Firebase calls inside command files.

## Commit Messages

Use clear, descriptive commit messages, e.g.:

- fix(security): correct secret token header check docs
- docs(readme): clarify Firebase env variable setup

## Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes and test locally with `npm run dev`.
3. Make sure no secrets are committed (`.bots/`, `.dev.vars` and `.env` must
   stay out of git).
4. Push and open a PR against `main`, describing what changed and why.
5. Link any related issues.

## Reporting Bugs

Open a GitHub Issue with:

- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (with secrets redacted); `npm run logs` shows a deployed bot's
- Node.js version and Wrangler version (`npx wrangler --version`)
- Whether it happens in `npm run dev`, `npm run dev:poll`, or on a deployed Worker

## Reporting Security Issues

Please do **not** open a public issue for security vulnerabilities. See
[`SECURITY.md`](./SECURITY.md) for our responsible disclosure process.

---

❤️ Thanks for contributing to <b>FlexGram</b>!
