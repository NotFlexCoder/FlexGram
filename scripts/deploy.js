import { ask, closeInput } from "./utils.js";
import { fillEnv, saveBot, selectBot } from "./bots.js";
import { deployWorker, ensureLogin, pushSecrets, setWebhook } from "./cloud.js";
import { chooseRepo, pushRepo } from "./github.js";
import { generate } from "./gen.js";

const update = process.argv.includes("--update");
const bot = await selectBot({ create: !update, single: update });

await fillEnv(bot);
if (bot.repo === undefined) await chooseRepo(bot);
saveBot(bot);

console.log(`commands registered: ${generate().count}`);
const pushed = bot.repo ? await pushRepo(bot) : true;
closeInput();

ensureLogin();

const url = deployWorker(bot);
if (url === null) process.exit(1);
bot.url =
  url ||
  bot.url ||
  (await ask("Worker URL (https://name.account.workers.dev)")).replace(
    /\/+$/,
    "",
  );
saveBot(bot);

if (!pushSecrets(bot)) process.exit(1);
const hooked = await setWebhook(bot, bot.url, 3);

closeInput();
console.log(
  `\nproject  ${bot.name}\nbot      https://t.me/${bot.username}\nurl      ${bot.url}`,
);
if (bot.repo)
  console.log(
    `repo     ${bot.repo}${pushed ? "" : "  (PUSH FAILED, run: npm run repo)"}`,
  );
if (!hooked) console.log("webhook failed, run: npm run webhook");
if (!pushed || !hooked) process.exit(1);
