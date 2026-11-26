import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { ROOT, ask, named, pick, rand, slug, telegram } from "./utils.js";

export const DIR = join(ROOT, ".bots");

const ACTIVE = join(DIR, ".active");
const REQUIRED = ["BOT_TOKEN", "WEBHOOK_SECRET"];
const AUTO = ["BASE_URL"];
const botFile = (name) => join(DIR, name, "bot.json");

export function listBots() {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(botFile(d.name)))
    .map((d) => d.name);
}

export const loadBot = (name) =>
  JSON.parse(readFileSync(botFile(name), "utf8"));

export function saveBot(bot) {
  mkdirSync(join(DIR, bot.name), { recursive: true });
  writeFileSync(botFile(bot.name), JSON.stringify(bot, null, 2));
  writeFileSync(ACTIVE, bot.name);
}

export function vars(bot, baseUrl) {
  const out = baseUrl ? { BASE_URL: baseUrl } : {};
  for (const [key, value] of Object.entries(bot.env))
    if (value) out[key] = value;
  return out;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(dir, e.name))
      : e.name.endsWith(".js")
        ? [join(dir, e.name)]
        : [],
  );
}

function envKeys() {
  const keys = new Set(REQUIRED);
  const files = [
    join(ROOT, "worker.js"),
    ...walk(join(ROOT, "core")),
    ...walk(join(ROOT, "command")),
  ];
  for (const file of files)
    for (const m of readFileSync(file, "utf8").matchAll(
      /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
    ))
      keys.add(m[1]);
  return [...keys];
}

export async function fillEnv(bot) {
  for (const key of envKeys()) {
    if (key in bot.env || AUTO.includes(key)) continue;
    if (key === "WEBHOOK_SECRET") {
      bot.env[key] = rand(32);
      continue;
    }
    const required = REQUIRED.includes(key);
    let value = await ask(required ? key : `${key} (optional, enter to skip)`);
    while (required && !value) value = await ask(`${key} is required`);
    bot.env[key] = key === "FIREBASE_URL" ? value.replace(/\/+$/, "") : value;
  }
  saveBot(bot);
}

async function createBot() {
  let token;
  let me;
  for (;;) {
    token = await ask("Bot token (from @BotFather)");
    me = await telegram(token, "getMe");
    if (me.ok) break;
    console.log(me.description || "invalid token");
  }
  const username = me.result.username;
  const taken = listBots();
  let name;
  for (;;) {
    name = slug(
      await ask("Project name (enter = auto)", `${slug(username)}-${rand(5)}`),
    );
    if (name && !taken.includes(name)) break;
    console.log("name is empty or already used");
  }
  console.log(`bot @${username}  project ${name}`);
  return { name, username, env: { BOT_TOKEN: token } };
}

export async function selectBot({ create = false, single = true } = {}) {
  const names = listBots();
  const wanted = named().find((a) => names.includes(a));
  if (wanted) return loadBot(wanted);
  if (process.argv.includes("--new") && create) return createBot();
  if (!names.length) {
    if (!create) {
      console.error("No bots yet. Run: npm run deploy");
      process.exit(1);
    }
    return createBot();
  }
  if (names.length === 1 && single) return loadBot(names[0]);
  const bots = names.map(loadBot);
  const active = existsSync(ACTIVE) ? readFileSync(ACTIVE, "utf8").trim() : "";
  const items = bots.map(
    (b) =>
      `${b.name}  @${b.username}  ${b.url || "not deployed"}${b.repo ? `  ${b.repo}` : ""}`,
  );
  if (create) items.push("+ new bot");
  const i = await pick("Select bot", items, Math.max(0, names.indexOf(active)));
  return i === bots.length ? createBot() : bots[i];
}
