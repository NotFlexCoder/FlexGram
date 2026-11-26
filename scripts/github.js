import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, ask, confirm, pick, sh } from "./utils.js";
import { DIR } from "./bots.js";

const IGNORE = [
  ".bots",
  ".env",
  ".dev.vars",
  ".wrangler",
  "node_modules",
  "dist",
];
const HELPER =
  "!f() { echo username=x-access-token; echo password=$FLEX_GH_TOKEN; }; f";

const gitDir = (bot) => join(DIR, bot.name, "git");
const git = (bot, args, options) =>
  sh("git", ["--git-dir", gitDir(bot), "--work-tree", ROOT, ...args], options);
const ghToken = (user) =>
  sh("gh", ["auth", "token", "--hostname", "github.com", "--user", user]);

function accounts() {
  const r = sh("gh", ["auth", "status", "--hostname", "github.com"]);
  const found = `${r.out}\n${r.err}`.matchAll(
    /Logged in to github\.com (?:account|as) ([A-Za-z0-9-]+)/g,
  );
  return [...new Set([...found].map((m) => m[1]))];
}

async function selectAccount() {
  for (;;) {
    const list = accounts();
    if (list.length) {
      const i = await pick("GitHub account", [
        ...list,
        "+ add another GitHub account",
      ]);
      if (i < list.length) return list[i];
    }
    sh("gh", ["auth", "login", "--hostname", "github.com"], {
      stdio: "inherit",
    });
    if (!accounts().length) return "";
  }
}

function ensureIgnore() {
  const file = join(ROOT, ".gitignore");
  const lines = existsSync(file)
    ? readFileSync(file, "utf8").split(/\r?\n/)
    : [];
  const missing = IGNORE.filter((x) => !lines.includes(x));
  if (!missing.length) return;
  const gap = lines.length && lines.at(-1) !== "" ? "\n" : "";
  appendFileSync(file, `${gap}${missing.join("\n")}\n`);
}

export async function chooseRepo(bot) {
  const answer = await ask(
    "GitHub repo (enter = skip, new = create private repo, or paste repo URL)",
  );
  bot.github = "";
  if (!answer) {
    bot.repo = "";
    return;
  }
  if (answer !== "new") {
    const owner = answer.match(/github\.com[/:]([^/]+)\//)?.[1];
    bot.repo = answer;
    bot.github = owner && accounts().includes(owner) ? owner : "";
    return;
  }
  if (sh("gh", ["--version"]).missing) {
    console.log("GitHub CLI not found: https://cli.github.com");
    return chooseRepo(bot);
  }
  const user = await selectAccount();
  if (!user) {
    console.log("GitHub login failed");
    return chooseRepo(bot);
  }
  const token = ghToken(user);
  if (!token.ok) {
    console.log(
      `Could not get token for ${user}. Update GitHub CLI: https://cli.github.com\n${token.err}`,
    );
    return chooseRepo(bot);
  }
  const made = sh(
    "gh",
    ["repo", "create", `${user}/${bot.name}`, "--private"],
    {
      env: { ...process.env, GH_TOKEN: token.out },
    },
  );
  if (!made.ok && !/already exists/i.test(made.err)) {
    console.log(made.err);
    return chooseRepo(bot);
  }
  bot.github = user;
  bot.repo = `https://github.com/${user}/${bot.name}.git`;
}

export async function pushRepo(bot) {
  ensureIgnore();
  const dir = gitDir(bot);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    const init = sh("git", ["--git-dir", dir, "init", "--quiet"]);
    if (!init.ok) {
      console.log(`git init failed: ${init.err}`);
      return false;
    }
    git(bot, ["config", "core.bare", "false"]);
    git(bot, ["symbolic-ref", "HEAD", "refs/heads/main"]);
  }
  const add = git(bot, ["add", "-A"]);
  if (!add.ok) {
    console.log(`git add failed: ${add.err}`);
    return false;
  }
  if (git(bot, ["status", "--porcelain"]).out) {
    const name = sh("git", ["config", "user.name"]).out || "Flexgram";
    const email =
      sh("git", ["config", "user.email"]).out ||
      "flexgram@users.noreply.github.com";
    const c = git(bot, [
      "-c",
      `user.name=${name}`,
      "-c",
      `user.email=${email}`,
      "commit",
      "--quiet",
      "-m",
      `update ${new Date().toISOString()}`,
    ]);
    if (!c.ok) {
      console.log(`git commit failed: ${c.err}`);
      return false;
    }
  }
  if (!git(bot, ["rev-parse", "--verify", "HEAD"]).ok) {
    console.log("nothing to push: no commit was created");
    return false;
  }
  let helper = [];
  let options = {};
  if (bot.github) {
    const token = ghToken(bot.github);
    if (!token.ok) {
      console.log(`No GitHub token for ${bot.github}. Run: npm run repo`);
      return false;
    }
    helper = ["-c", "credential.helper=", "-c", `credential.helper=${HELPER}`];
    options = {
      env: {
        ...process.env,
        FLEX_GH_TOKEN: token.out,
        GIT_TERMINAL_PROMPT: "0",
      },
    };
  }
  let p = git(bot, [...helper, "push", bot.repo, "HEAD:main"], options);
  if (!p.ok && /rejected|non-fast-forward|fetch first/i.test(p.err)) {
    if (await confirm("Repo already has other commits. Force push?"))
      p = git(
        bot,
        [...helper, "push", "--force", bot.repo, "HEAD:main"],
        options,
      );
  }
  if (!p.ok) {
    console.log(`GitHub push failed: ${p.err}`);
    return false;
  }
  const files = git(bot, ["ls-files"]).out.split("\n").length;
  console.log(`pushed ${files} files to ${bot.repo}`);
  return true;
}
