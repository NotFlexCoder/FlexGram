import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WRANGLER, UPDATES, sh, sleep, telegram, wrangler } from "./utils.js";
import { vars } from "./bots.js";

export function ensureLogin() {
  const r = sh(process.execPath, [WRANGLER, "whoami"]);
  if (r.ok && !/not authenticated/i.test(`${r.out}${r.err}`)) return;
  if (wrangler(["login"]).status !== 0) process.exit(1);
}

export function deployWorker(bot) {
  const out = join(tmpdir(), `flexgram-${bot.name}.out`);
  rmSync(out, { force: true });
  const r = wrangler(["deploy", "--name", bot.name], {
    env: { ...process.env, WRANGLER_OUTPUT_FILE_PATH: out },
  });
  if (r.status !== 0) return null;
  const text = existsSync(out) ? readFileSync(out, "utf8") : "";
  rmSync(out, { force: true });
  return text.match(/https:\/\/[^"\s\\]+\.workers\.dev/)?.[0] || "";
}

export function pushSecrets(bot) {
  const file = join(tmpdir(), `flexgram-${bot.name}.json`);
  writeFileSync(file, JSON.stringify(vars(bot, bot.url)), { mode: 0o600 });
  try {
    return wrangler(["secret", "bulk", file, "--name", bot.name]).status === 0;
  } finally {
    rmSync(file, { force: true });
  }
}

export async function setWebhook(bot, url, tries = 1) {
  for (let i = 1; i <= tries; i++) {
    const r = await telegram(bot.env.BOT_TOKEN, "setWebhook", {
      url,
      secret_token: bot.env.WEBHOOK_SECRET,
      allowed_updates: UPDATES,
    });
    if (r.ok) return true;
    if (i === tries) console.log(`webhook failed: ${r.description}`);
    else await sleep(2000);
  }
  return false;
}
