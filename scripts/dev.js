import {
  existsSync,
  mkdirSync,
  readFileSync,
  watch,
  writeFileSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { basename, join } from "node:path";
import {
  ROOT,
  UPDATES,
  closeInput,
  freePort,
  sleep,
  telegram,
  template,
  wranglerAsync,
} from "./utils.js";
import { fillEnv, saveBot, selectBot, vars } from "./bots.js";
import { setWebhook } from "./cloud.js";
import { generate, isCommandFile } from "./gen.js";

const poll = process.argv.includes("--poll");
const bot = await selectBot({ create: true });
await fillEnv(bot);
saveBot(bot);
closeInput();

const token = bot.env.BOT_TOKEN;
const port = await freePort();

const commandDir = join(ROOT, "command");
mkdirSync(commandDir, { recursive: true });
console.log(`commands registered: ${generate().count}`);

let timer = null;
watch(commandDir, { recursive: true }, (_event, filename) => {
  if (!filename || !isCommandFile(filename)) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const full = join(commandDir, filename);
    if (existsSync(full) && readFileSync(full, "utf8").trim() === "")
      writeFileSync(full, template(basename(filename, ".js")));
    const { count, changed } = generate();
    if (changed) console.log(`commands registered: ${count}`);
  }, 200);
});

function openTunnel() {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "cloudflared",
      ["tunnel", "--url", `http://localhost:${port}`],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let found = false;
    const scan = (data) => {
      const m = String(data).match(
        /https:\/\/(?!api\.)[a-z0-9-]+\.trycloudflare\.com/,
      );
      if (m && !found) {
        found = true;
        resolve({ proc, url: m[0] });
      }
    };
    proc.stdout.on("data", scan);
    proc.stderr.on("data", scan);
    proc.on("error", reject);
    proc.on("exit", () => !found && reject(new Error("cloudflared exited")));
    setTimeout(() => !found && reject(new Error("tunnel timeout")), 30000);
  });
}

let tunnel = null;
let publicUrl = bot.url || "";

if (!poll) {
  try {
    tunnel = await openTunnel();
    publicUrl = tunnel.url;
  } catch (err) {
    console.error(
      err.code === "ENOENT"
        ? "cloudflared not found.\n  Windows: winget install Cloudflare.cloudflared\n  macOS:   brew install cloudflared\n  Linux:   https://github.com/cloudflare/cloudflared/releases\nor run: npm run dev:poll"
        : err.message,
    );
    process.exit(1);
  }
  console.log(`tunnel: ${publicUrl}`);
}

const devVars = Object.entries(vars(bot, publicUrl))
  .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
  .join("\n");
writeFileSync(join(ROOT, ".dev.vars"), `${devVars}\n`);

const server = wranglerAsync(["dev", "--port", String(port)]);
let closing = false;

async function stop() {
  if (closing) return;
  closing = true;
  tunnel?.proc.kill();
  server.kill();
  if (bot.url) {
    await setWebhook(bot, bot.url);
    console.log(`webhook restored: ${bot.url}`);
  } else {
    await telegram(token, "deleteWebhook");
    console.log("webhook removed");
  }
  process.exit(0);
}

server.on("exit", stop);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, stop);

for (let i = 0; i < 120; i++) {
  try {
    await fetch(`http://127.0.0.1:${port}`);
    break;
  } catch {
    await sleep(500);
  }
}

if (!poll) {
  if (await setWebhook(bot, publicUrl, 10))
    console.log(`webhook set: ${publicUrl}`);
} else {
  await telegram(token, "deleteWebhook", { drop_pending_updates: false });
  console.log(`polling @${bot.username}`);
  let offset = 0;
  while (!closing) {
    const res = await telegram(token, "getUpdates", {
      offset,
      timeout: 25,
      allowed_updates: UPDATES,
    });
    if (!res.ok) {
      await sleep(2000);
      continue;
    }
    for (const update of res.result) {
      offset = update.update_id + 1;
      await fetch(`http://127.0.0.1:${port}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-bot-api-secret-token": bot.env.WEBHOOK_SECRET,
        },
        body: JSON.stringify(update),
      }).catch(() => {});
    }
  }
}
