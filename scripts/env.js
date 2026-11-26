import { ask, closeInput, mask, telegram } from "./utils.js";
import { fillEnv, saveBot, selectBot } from "./bots.js";
import { ensureLogin, pushSecrets, setWebhook } from "./cloud.js";

const bot = await selectBot();
const before = JSON.stringify(bot.env);
const oldToken = bot.env.BOT_TOKEN;

await fillEnv(bot);
for (const [key, value] of Object.entries(bot.env))
  console.log(`  ${key}=${value ? mask(value) : ""}`);

for (;;) {
  const line = await ask("KEY=VALUE (enter to finish)");
  if (!line) break;
  const i = line.indexOf("=");
  const key = line.slice(0, i).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    console.log("use KEY=VALUE");
    continue;
  }
  bot.env[key] = line.slice(i + 1).trim();
}

if (bot.env.BOT_TOKEN !== oldToken) {
  const me = await telegram(bot.env.BOT_TOKEN, "getMe");
  if (me.ok) bot.username = me.result.username;
  else console.log(`token check failed: ${me.description}`);
}

saveBot(bot);
closeInput();

if (JSON.stringify(bot.env) === before) {
  console.log("nothing changed");
} else if (!bot.url) {
  console.log("saved, used on next deploy or dev");
} else {
  ensureLogin();
  if (!pushSecrets(bot)) process.exit(1);
  await setWebhook(bot, bot.url, 3);
  console.log("env pushed to cloudflare");
}
