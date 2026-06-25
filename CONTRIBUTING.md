# Contributing to FlexGram

Thanks for your interest in improving **FlexGram** — a lightweight,
file-based Telegram bot framework with Firebase-backed state, auto command
routing, and zero-import globals. Contributions of all kinds are welcome!

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Adding a New Command](#adding-a-new-command)
- [Adding/Modifying Globals](#addingmodifying-globals)
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

3. Create a `.env` file from `.env.example` and fill in your bot token,
   webhook secret, and Firebase credentials (see `README.md` for details).

## Project Structure

Please familiarize yourself with the layout described in `README.md` under
**Project Structure** before making changes — especially the `core/` module
boundaries (`bot.js`, `context.js`, `firebase.js`, `global.js`, `loader.js`,
`keyboard.js`, `security.js`, `utils.js`, `assets-helper.js`).

## Development Setup

```bash
npm install
cp .env.example .env
node main.js
```

The server runs on `http://localhost:3000` by default (configurable via
`PORT`).

## Adding a New Command

- Drop a `.js` file into `/command`. The filename becomes the command
  (e.g., `command/help.js` → `/help`).
- Files prefixed with `_` are ignored by the router and can be used as shared
  helpers.
- Special files: `__message__.js` (fallback for non-command messages) and
  `__inline__.js` (inline query handler).
- Use the provided globals (`sendMessage`, `user`, `chat`, `flex`, `HTTP`,
  `TEMP`, `USER`, `BOT`, `FLEX`, etc.) — no imports required inside command
  files.

## Adding/Modifying Globals

If you add a new global function, register it in `core/global.js` via
`addGlobal(flex)`, and regenerate TypeScript hints:

```bash
node auto-generate/gen-suggest.js
node auto-generate/gen-snippet.js
```

Also run `gen-env.js` if your change introduces new environment variables:

```bash
node auto-generate/gen-env.js
```

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
- (readme): clarify Firebase env variable setup

## Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes and test locally (`node main.js`).
3. Ensure no `.env` or secrets are committed.
4. Push and open a PR against `main`, describing what changed and why.
5. Link any related issues.

## Reporting Bugs

Open a GitHub Issue with:

- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (with secrets redacted)
- Node.js version and deployment target (Vercel, VPS, Docker)

## Reporting Security Issues

Please do **not** open a public issue for security vulnerabilities. See
[`SECURITY.md`](./SECURITY.md) for our responsible disclosure process.

---

❤️ Thanks for contributing to <b>FlexGram</b>!
