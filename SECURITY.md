# Security Policy

## Supported Versions

| Version | Supported           |
| ------- | ------------------- |
| main    | ✅                  |
| < main  | ❌ (not maintained) |

## Reporting a Vulnerability

If you discover a security vulnerability in **FlexGram**, please **do not**
open a public GitHub issue. Instead:

1. Open a [GitHub Security Advisory](https://github.com/NotFlexCoder/FlexGram/security)
   on the repository, **or**
2. Contact the maintainer (**Flex Coder**) privately via GitHub.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept if possible)
- Any suggested fix or mitigation

We aim to acknowledge reports within **72 hours** and to provide a fix or
mitigation plan as soon as possible depending on severity.

## Security Considerations for Deployments

FlexGram includes several built-in protections, but deployment security is a shared responsibility:

### Webhook Validation

- Every incoming webhook request is validated via
  `X-Telegram-Bot-Api-Secret-Token` against your `WEBHOOK_SECRET`
  (`verifyTGRequest()` in `core/security.js`).
- Choose a strong, random `WEBHOOK_SECRET` (1–256 chars, `A-Z a-z 0-9 _ -`).
- Never commit your `.env` file — add it to `.gitignore`.

### Update Allowlist

Only the following Telegram update types are accepted; all others receive
`400 Bad Request`: message, edited_message,callback_query, inline_query, pre_checkout_query, shipping_query, poll, poll_answer, my_chat_member, chat_member

### Input Sanitization

- Always sanitize user-provided text before injecting it into HTML-formatted
  messages using `secureInput()` from `core/security.js`, which escapes
  `& < > "`.

### Secrets & Credentials

- `BOT_TOKEN`, `WEBHOOK_SECRET`, `FIREBASE_URL`, and `FIREBASE_SECRET` must be
  kept confidential and stored only as environment variables (locally in
  `.env`, or via your hosting provider's secret manager, e.g.
  `vercel env add`).
- Rotate your `BOT_TOKEN` via [@BotFather](https://t.me/BotFather) and your
  Firebase database secret if you suspect exposure.

### Firebase Realtime Database

- Configure Firebase Realtime Database security rules appropriately —
  the legacy `FIREBASE_SECRET` REST auth bypasses standard rules, so treat it
  as a highly sensitive credential.
- Firebase paths containing `. # $ [ ]` are automatically sanitized to `_` by
  `core/firebase.js`, but you should still validate/sanitize any
  user-controlled data before writing it to the database.

### Dependencies

- Run `npm audit` periodically and keep dependencies up to date.
- Review any new dependency additions in pull requests.

---

Thank you for helping keep <b>FlexGram</b> and its users safe.
