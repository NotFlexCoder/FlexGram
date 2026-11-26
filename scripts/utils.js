import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const WRANGLER = join(
  ROOT,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

export const UPDATES = [
  "message",
  "edited_message",
  "callback_query",
  "inline_query",
  "pre_checkout_query",
  "shipping_query",
  "poll",
  "poll_answer",
  "my_chat_member",
  "chat_member",
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const rand = (n = 6) => randomBytes(n).toString("hex").slice(0, n);
export const named = () =>
  process.argv.slice(2).filter((a) => !a.startsWith("-"));
export const mask = (v) =>
  v.length > 12 ? `${v.slice(0, 4)}...${v.slice(-4)}` : "****";
export const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

let rl = null;

export function closeInput() {
  rl?.close();
  rl = null;
}

export async function ask(question, fallback = "") {
  rl ??= createInterface({ input: process.stdin, output: process.stdout });
  const text = fallback ? `${question} (${fallback}): ` : `${question}: `;
  return (await rl.question(text)).trim() || fallback;
}

export async function confirm(question, yes = false) {
  const answer = (
    await ask(`${question} ${yes ? "[Y/n]" : "[y/N]"}`)
  ).toLowerCase();
  return answer ? answer[0] === "y" : yes;
}

export async function pick(title, items, start = 0) {
  items.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  for (;;) {
    const n = Number(await ask(title, String(start + 1)));
    if (Number.isInteger(n) && n >= 1 && n <= items.length) return n - 1;
  }
}

export function freePort(start = 8787) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(freePort(start + 1)));
    server.listen(start, () => server.close(() => resolve(start)));
  });
}

export function sh(cmd, args = [], options = {}) {
  if (options.stdio === "inherit") closeInput();
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", ...options });
  return {
    ok: r.status === 0,
    out: (r.stdout || "").trim(),
    err: (r.stderr || "").trim(),
    missing: r.error?.code === "ENOENT",
  };
}

export function wrangler(args, options = {}) {
  closeInput();
  return spawnSync(process.execPath, [WRANGLER, ...args], {
    cwd: ROOT,
    stdio: "inherit",
    ...options,
  });
}

export function wranglerAsync(args, options = {}) {
  closeInput();
  return spawn(process.execPath, [WRANGLER, ...args], {
    cwd: ROOT,
    stdio: "inherit",
    ...options,
  });
}

export async function telegram(token, method, data = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, description: err.message };
  }
}

export function template(name) {
  return `export default async function ${name.replace(/[^A-Za-z0-9_]/g, "_")}(flex) {

}
`;
}
