import { readdir, readFile, writeFile, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const SKIP_DIRS = new Set(["node_modules", ".git", ".vscode"]);

async function walk(dir) {
  let results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await walk(full));
    } else if (entry.name.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

function extractEnvKeys(src) {
  const keys = new Set();
  const re = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
  let match;
  while ((match = re.exec(src))) {
    keys.add(match[1]);
  }
  return keys;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function generateEnv() {
  const files = await walk(ROOT);
  const keys = new Set();

  for (const file of files) {
    const src = await readFile(file, "utf8").catch(() => "");
    for (const key of extractEnvKeys(src)) keys.add(key);
  }

  const envPath = join(ROOT, ".env");
  const sortedKeys = [...keys].sort();

  if (await fileExists(envPath)) {
    const existing = await readFile(envPath, "utf8");
    const existingKeys = new Set(
      existing
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => line.split("=")[0].trim()),
    );

    const missing = sortedKeys.filter((k) => !existingKeys.has(k));
    if (missing.length === 0) return existing;

    const addition = missing.map((k) => `${k}=`).join("\n");
    const updated = existing.endsWith("\n")
      ? `${existing}${addition}\n`
      : `${existing}\n${addition}\n`;

    await writeFile(envPath, updated, "utf8");
    return updated;
  }

  const content = sortedKeys.map((k) => `${k}=`).join("\n") + "\n";
  await writeFile(envPath, content, "utf8");
  return content;
}
