import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  findGlobalAssignments,
  detectFunctionExpr,
  bodyReturnsPromise,
  parseObjectLiteral,
  findExportedConst,
  paramsToSignature,
} from "./ts-gen-core.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readSource(relPath) {
  return readFileSync(join(__dirname, relPath), "utf8");
}

function propsToMembers(props, indent) {
  const lines = [];
  for (const p of props) {
    if (p.kind === "method") {
      const ret = p.returnsPromise ? "Promise<any>" : "any";
      const sig = paramsToSignature(p.params, ret).replace(
        /^\((.*)\) => (.*)$/,
        "($1): $2",
      );
      lines.push(
        ...buildFunctionJsDoc(p.name, p.params, p.returnsPromise, indent),
      );
      lines.push(`${indent}${p.name}${sig};`);
    } else if (p.kind === "object") {
      const nested = propsToMembers(p.members, indent + "  ");
      lines.push(`${indent}${p.name}: {`);
      lines.push(...nested);
      lines.push(`${indent}};`);
    } else {
      lines.push(`${indent}${p.name}: ${p.type};`);
    }
  }
  return lines;
}

function buildParamJsDocLines(params, returnsPromise) {
  const lines = [];
  for (const p of params) {
    const rest = p.rest ? "..." : "";
    const optional = p.optional && !p.rest ? `[${p.name}]` : p.name;
    lines.push(` * @param ${rest}${optional} - ${p.name}`);
  }
  lines.push(` * @returns ${returnsPromise ? "Promise<any>" : "any"}`);
  return lines;
}

function buildFunctionJsDoc(name, params, returnsPromise, indent = "") {
  const lines = [];
  lines.push(`${indent}/**`);
  lines.push(`${indent} * ${name}(${params.map((p) => p.name).join(", ")})`);
  for (const l of buildParamJsDocLines(params, returnsPromise)) {
    lines.push(`${indent}${l}`);
  }
  lines.push(`${indent} */`);
  return lines;
}

function buildNamespaceInterface(typeName, props) {
  const lines = [];
  lines.push(`interface ${typeName} {`);
  lines.push(...propsToMembers(props, "  "));
  lines.push(`}`);
  return lines.join("\n");
}

function extractModuleTypes(src, names) {
  const types = {};
  for (const name of names) {
    const objSrc = findExportedConst(src, name);
    types[name] = objSrc ? parseObjectLiteral(objSrc) : [];
  }
  return types;
}

function globalValueType(exprSrc, namespaceTypeMap) {
  const fn = detectFunctionExpr(exprSrc);
  if (fn.isFunction) {
    const ret = bodyReturnsPromise(fn.body, fn.isAsync)
      ? "Promise<any>"
      : "any";
    return paramsToSignature(fn.params, ret);
  }

  const ref = exprSrc.trim();
  if (Object.prototype.hasOwnProperty.call(namespaceTypeMap, ref)) {
    return namespaceTypeMap[ref];
  }

  return "any";
}

export function genSuggest() {
  const globalSrc = readSource("../core/global.js");
  const botSrc = readSource("../core/bot.js");
  const keyboardSrc = readSource("../core/keyboard.js");

  const botModuleNames = ["API", "HTTP", "BOT", "TEMP", "USER", "FLEX"];
  const botTypes = extractModuleTypes(botSrc, botModuleNames);
  const keyboardProps = findExportedConst(keyboardSrc, "keyboard");
  const keyboardType = keyboardProps ? parseObjectLiteral(keyboardProps) : [];

  const namespaceTypeMap = {
    API: "API",
    HTTP: "HTTP",
    BOT: "BOT",
    TEMP: "TEMP",
    USER: "USER",
    FLEX: "FLEX",
    keyboard: "Keyboard",
  };

  const interfaceBlocks = [];
  for (const name of botModuleNames) {
    interfaceBlocks.push(
      buildNamespaceInterface(namespaceTypeMap[name], botTypes[name]),
    );
  }
  interfaceBlocks.push(buildNamespaceInterface("Keyboard", keyboardType));

  const assignments = findGlobalAssignments(globalSrc);
  const varLines = [];
  const seen = new Set();

  for (const { name, exprSrc } of assignments) {
    if (seen.has(name)) continue;
    seen.add(name);
    const fn = detectFunctionExpr(exprSrc);
    if (fn.isFunction) {
      const returnsPromise = bodyReturnsPromise(fn.body, fn.isAsync);
      varLines.push(
        ...buildFunctionJsDoc(name, fn.params, returnsPromise, "  "),
      );
      varLines.push(
        `  var ${name}: ${paramsToSignature(fn.params, returnsPromise ? "Promise<any>" : "any")};`,
      );
    } else {
      const type = globalValueType(exprSrc, namespaceTypeMap);
      varLines.push(`  var ${name}: ${type};`);
    }
  }

  for (const extraName of ["BOT", "USER", "TEMP"]) {
    if (seen.has(extraName)) continue;
    seen.add(extraName);
    varLines.push(`  var ${extraName}: ${namespaceTypeMap[extraName]};`);
  }

  const dts = [
    ...interfaceBlocks,
    "",
    "declare global {",
    ...varLines,
    "}",
    "",
    "export {};",
    "",
  ].join("\n");

  writeFileSync(join(__dirname, "../globals.d.ts"), dts);
  return dts;
}
