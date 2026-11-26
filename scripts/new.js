import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { ROOT, template } from "./utils.js";
import { generate } from "./gen.js";

const arg = process.argv[2];
if (!arg || !/^[A-Za-z0-9_\-/]+$/.test(arg)) {
  console.error("Usage: npm run new <name>   or   npm run new <folder/name>");
  process.exit(1);
}

const file = join(ROOT, "command", `${arg}.js`);
if (existsSync(file)) {
  console.error(`Already exists: command/${arg}.js`);
  process.exit(1);
}
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, template(basename(arg)));
generate();
console.log(`created command/${arg}.js  ->  /${basename(arg)}`);
