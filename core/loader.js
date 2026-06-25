import { readdir, writeFile, mkdir, readFile } from "fs/promises";
import { watch } from "fs";
import { join, basename, extname, dirname, relative } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { getDB, deleteDB } from "./firebase.js";

const __dir = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dir, "..");
let _router = null;

function getCommandName(file, rootDir) {
  const rel = relative(rootDir, file);
  const parts = rel.replace(/\\/g, "/").split("/");
  const segments = parts.map((p, i) =>
    i === parts.length - 1 ? basename(p, extname(p)) : p,
  );
  const leaf = segments[segments.length - 1];
  return "/" + leaf;
}

async function walk(dir) {
  let results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await walk(full));
    } else if (entry.name.endsWith(".js") && !entry.name.startsWith("_")) {
      results.push(full);
    }
  }
  return results;
}

async function loadFiles(dir, commandMap, moduleMap, useLeafName = false) {
  const files = await walk(dir);
  for (const file of files) {
    const fileUrl = pathToFileURL(file).href;
    let mod;
    try {
      mod = await import(fileUrl);
    } catch (err) {
      process.stderr.write(`[loader] Failed to load ${file}: ${err.message}\n`);
      continue;
    }
    const fn = mod.default;
    if (typeof fn !== "function") continue;

    const name =
      mod.commandName ??
      (useLeafName ? basename(file, extname(file)) : getCommandName(file, dir));

    if (useLeafName) {
      moduleMap.set(name, fn);
      if (mod.commandName) commandMap.set(mod.commandName, fn);
    } else {
      commandMap.set(name, fn);
    }
  }
}

async function _build() {
  const commandMap = new Map();
  const moduleMap = new Map();

  await loadFiles(join(ROOT, "command"), commandMap, moduleMap, false);
  await loadFiles(join(ROOT, "core"), commandMap, moduleMap, true);
  return {
    async dispatch(flex) {
      if (flex.isInlineQuery) {
        const inlineHandler = commandMap.get("__inline__");
        if (inlineHandler) return inlineHandler(flex);
        return;
      }

      const handler = commandMap.get(flex.command);
      if (handler) return handler(flex);

      if (!flex.isCallback && !flex.command) {
        const userId = flex.user?.id;
        if (userId != null) {
          let wait = null;
          try {
            wait = await getDB(`wait_for_answer/${userId}`);
          } catch {
            wait = null;
          }

          if (wait && wait.command) {
            if (wait.expires_at && Date.now() > wait.expires_at) {
              await deleteDB(`wait_for_answer/${userId}`).catch(() => {});
            } else {
              const waitHandler = commandMap.get(wait.command);
              if (waitHandler) {
                const waitflex = {
                  ...flex,
                  command: wait.command,
                };
                return waitHandler(waitflex);
              }
            }
          }
        }
      }

      const onMessage = commandMap.get("__message__");
      if (onMessage) return onMessage(flex);
    },
    commandMap,
    moduleMap,
  };
}

export async function buildRouter() {
  if (!_router) {
    _router = _build();
  }
  return _router;
}

function buildTemplate(commandName) {
  return `export default async function ${commandName}(flex) {
//add your code here
  
  
  }`;
}

async function injectTemplate(filePath) {
  try {
    const existing = await readFile(filePath, "utf8");
    if (existing.trim().length > 0) return;
    const commandName = basename(filePath, extname(filePath));
    await writeFile(filePath, buildTemplate(commandName), "utf8");
  } catch {}
}

export async function watchCommandFolder() {
  const commandDir = join(ROOT, "command");
  await mkdir(commandDir, { recursive: true }).catch(() => {});

  const seen = new Set();

  watch(commandDir, { recursive: true }, async (eventType, filename) => {
    if (!filename) return;
    if (!filename.endsWith(".js")) return;
    if (basename(filename).startsWith("_")) return;

    const full = join(commandDir, filename);

    if (seen.has(full)) return;
    seen.add(full);
    setTimeout(() => seen.delete(full), 300);

    if (eventType === "rename") {
      setTimeout(() => injectTemplate(full), 50);
    }
  });
}

export async function createCommand(relativePath) {
  const fullPath = join(ROOT, "command", relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  const commandName = basename(fullPath, extname(fullPath));
  const content = await readFile(fullPath, "utf8").catch(() => "");
  if (content.trim().length === 0) {
    await writeFile(fullPath, buildTemplate(commandName), "utf8");
  }
}
