import { rmSync } from "node:fs";
import { join } from "node:path";
import { generate } from "./gen.js";
import { ask, closeInput, named, telegram, wrangler } from "./utils.js";
import { DIR, listBots, loadBot, saveBot, selectBot } from "./bots.js";
import { ensureLogin } from "./cloud.js";
import { chooseRepo, pushRepo } from "./github.js";

const cmd = named()[0];

if (cmd === "list") {
  const names = listBots();
  if (!names.length) console.log("No bots yet. Run: npm run deploy");
  for (const name of names) {
    const b = loadBot(name);
    console.log(
      `${b.name}\n  bot   @${b.username}\n  url   ${b.url || "not deployed"}\n  repo  ${b.repo || "none"}`,
    );
  }
} else if (cmd === "repo") {
  const bot = await selectBot();
  await chooseRepo(bot);
  saveBot(bot);
  generate();
  if (bot.repo) await pushRepo(bot);
  closeInput();
} else if (cmd === "logs") {
  const bot = await selectBot();
  ensureLogin();
  wrangler(["tail", "--name", bot.name]);
} else if (cmd === "remove") {
  const bot = await selectBot();
  if (
    (await ask(
      `Type "${bot.name}" to delete worker, webhook and local config`,
    )) !== bot.name
  ) {
    console.log("cancelled");
    process.exit(0);
  }
  closeInput();
  if (bot.url) {
    ensureLogin();
    wrangler(["delete", "--name", bot.name, "--force"]);
  }
  await telegram(bot.env.BOT_TOKEN, "deleteWebhook");
  rmSync(join(DIR, bot.name), { recursive: true, force: true });
  console.log(
    `removed ${bot.name}${bot.repo ? ` (GitHub repo kept: ${bot.repo})` : ""}`,
  );
} else {
  console.log("usage: manage.js list | repo | logs | remove");
}
process.exit(0);
