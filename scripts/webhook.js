import { named, telegram } from "./utils.js";
import { selectBot } from "./bots.js";
import { setWebhook } from "./cloud.js";

const action =
  named().find((a) => ["set", "info", "delete"].includes(a)) || "set";
const bot = await selectBot();
const token = bot.env.BOT_TOKEN;

if (action === "info") {
  const r = await telegram(token, "getWebhookInfo");
  console.log(JSON.stringify(r.result || r, null, 2));
} else if (action === "delete") {
  const r = await telegram(token, "deleteWebhook");
  console.log(r.ok ? "webhook deleted" : r.description);
} else if (!bot.url) {
  console.error("Not deployed yet. Run: npm run deploy");
  process.exit(1);
} else if (await setWebhook(bot, bot.url)) {
  console.log(`webhook set: ${bot.url}`);
} else {
  process.exit(1);
}
process.exit(0);
