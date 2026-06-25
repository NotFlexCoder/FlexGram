import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  findGlobalAssignments,
  detectFunctionExpr,
  detectFlexProperty,
  parseObjectLiteral,
  findExportedConst,
} from "./ts-gen-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readSource(relPath) {
  return readFileSync(join(__dirname, relPath), "utf8");
}

function escapeSnippetText(text) {
  return String(text).replace(/[$}\\]/g, (ch) => `\\${ch}`);
}

function paramsToPlaceholders(params) {
  return params
    .map((p, idx) => `\${${idx + 1}:${escapeSnippetText(p.name)}}`)
    .join(", ");
}

function buildCallSnippet(prefix, body, description) {
  return {
    prefix,
    body: [body],
    description,
  };
}

export function generateSnippets() {
  const globalSrc = readSource("../core/global.js");
  const botSrc = readSource("../core/bot.js");
  const keyboardSrc = readSource("../core/keyboard.js");

  const snippets = {};

  const assignments = findGlobalAssignments(globalSrc);
  const seen = new Set();

  for (const { name, exprSrc } of assignments) {
    if (seen.has(name)) continue;
    seen.add(name);

    const fn = detectFunctionExpr(exprSrc);
    if (fn.isFunction) {
      const placeholders = paramsToPlaceholders(fn.params);
      snippets[name] = buildCallSnippet(
        name,
        `${name}(${placeholders})\$0`,
        `${name}(${fn.params.map((p) => p.name).join(", ")})`,
      );
      continue;
    }

    const flexProp = detectFlexProperty(exprSrc);
    if (flexProp) {
      snippets[name] = buildCallSnippet(
        name,
        `flex.${flexProp}\$0`,
        `flex.${flexProp}`,
      );
      continue;
    }
  }

  const namespaceModules = {
    API: { src: botSrc, exportName: "API" },
    HTTP: { src: botSrc, exportName: "HTTP" },
    BOT: { src: botSrc, exportName: "BOT" },
    TEMP: { src: botSrc, exportName: "TEMP" },
    USER: { src: botSrc, exportName: "USER" },
    FLEX: { src: botSrc, exportName: "FLEX" },
    keyboard: { src: keyboardSrc, exportName: "keyboard" },
  };

  for (const [namespace, { src, exportName }] of Object.entries(
    namespaceModules,
  )) {
    const objSrc = findExportedConst(src, exportName);
    if (!objSrc) continue;
    const props = parseObjectLiteral(objSrc);

    for (const p of props) {
      if (p.kind !== "method") continue;
      const placeholders = paramsToPlaceholders(p.params);
      const prefix = `${namespace}.${p.name}`;
      snippets[prefix] = buildCallSnippet(
        prefix,
        `${namespace}.${p.name}(${placeholders})\$0`,
        `${namespace}.${p.name}(${p.params.map((x) => x.name).join(", ")})`,
      );
    }
  }

  const outDir = join(__dirname, ".vscode");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "flex-tg.code-snippets");
  writeFileSync(outPath, JSON.stringify(snippets, null, 2));
  return snippets;
}
