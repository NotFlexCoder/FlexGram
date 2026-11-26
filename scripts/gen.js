import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, relative, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./utils.js";

const COMMAND_DIR = join(ROOT, "command");
const OUT = join(ROOT, "core", "commands.js");
const SPECIAL = ["__message__", "__inline__"];

export function isCommandFile(file) {
  const name = basename(file);
  return (
    name.endsWith(".js") &&
    (!name.startsWith("_") || SPECIAL.includes(basename(name, ".js")))
  );
}

function walk(dir) {
  let files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full));
    else if (isCommandFile(entry.name)) files.push(full);
  }
  return files.sort();
}

export function generate() {
  mkdirSync(COMMAND_DIR, { recursive: true });
  const imports = [];
  const entries = [];
  const seen = new Map();

  walk(COMMAND_DIR).forEach((file) => {
    const src = readFileSync(file, "utf8");
    if (!/export\s+default/.test(src)) return;
    const custom = src.match(
      /export\s+const\s+commandName\s*=\s*["'`]([^"'`]+)["'`]/,
    );
    const base = basename(file, extname(file));
    const name = custom
      ? custom[1]
      : SPECIAL.includes(base)
        ? base
        : "/" + base;
    if (seen.has(name)) {
      console.error(
        `Duplicate command ${name}:\n  ${seen.get(name)}\n  ${file}`,
      );
      process.exit(1);
    }
    seen.set(name, file);
    const i = imports.length;
    const rel = relative(join(ROOT, "core"), file).replace(/\\/g, "/");
    imports.push(`import c${i} from "${rel}";`);
    entries.push(`  [${JSON.stringify(name)}, c${i}],`);
  });

  const code = `${imports.join("\n")}\n\nexport const commands = [\n${entries.join("\n")}\n];\n`;
  const prev = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (prev !== code) writeFileSync(OUT, code);
  return { count: entries.length, changed: prev !== code };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { count } = generate();
  console.log(`commands registered: ${count}`);
}
