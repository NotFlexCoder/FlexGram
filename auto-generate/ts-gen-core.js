const OPEN = { "(": ")", "{": "}", "[": "]" };

export function findMatching(src, startIdx) {
  const openCh = src[startIdx];
  const closeCh = OPEN[openCh];
  let depth = 0;
  let i = startIdx;
  let inString = null;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "/" && prev === "*") inBlockComment = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (inTemplate) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "`") {
        inTemplate = false;
        continue;
      }
      if (ch === "$" && src[i + 1] === "{") {
        i++;
        continue;
      }
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      inLineComment = true;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      continue;
    }

    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function splitTopLevel(src, separators = [","]) {
  const parts = [];
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  let start = 0;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "/" && prev === "*") inBlockComment = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (inTemplate) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "`") inTemplate = false;
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      inLineComment = true;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      continue;
    }

    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;

    if (depth === 0 && separators.includes(ch)) {
      parts.push(src.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(src.slice(start));
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

export function stripComments(src) {
  let out = "";
  let inString = null;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        out += ch;
      }
      continue;
    }
    if (inBlockComment) {
      if (ch === "/" && prev === "*") inBlockComment = false;
      continue;
    }
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += src[i + 1];
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (inTemplate) {
      out += ch;
      if (ch === "\\") {
        out += src[i + 1];
        i++;
        continue;
      }
      if (ch === "`") inTemplate = false;
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      inLineComment = true;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      out += ch;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      out += ch;
      continue;
    }

    out += ch;
  }
  return out;
}

const VALID_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function sanitizeIdentifier(name, fallbackPrefix = "param") {
  let n = name.replace(/[^A-Za-z0-9_$]/g, "");
  if (!n || /^[0-9]/.test(n)) n = `${fallbackPrefix}${n}`;
  if (!VALID_IDENT.test(n)) n = `${fallbackPrefix}`;
  return n;
}

export function parseParamList(paramStr) {
  const trimmed = paramStr.trim();
  if (!trimmed) return [];

  const rawParams = splitTopLevel(trimmed, [","]);
  const params = [];

  rawParams.forEach((raw, idx) => {
    let p = raw.trim();
    if (!p) return;

    let isRest = false;
    if (p.startsWith("...")) {
      isRest = true;
      p = p.slice(3).trim();
    }

    let hasDefault = false;

    const eqIdx = (() => {
      let depth = 0;
      let inString = null;
      for (let i = 0; i < p.length; i++) {
        const ch = p[i];
        if (inString) {
          if (ch === "\\") {
            i++;
            continue;
          }
          if (ch === inString) inString = null;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          inString = ch;
          continue;
        }
        if ("([{".includes(ch)) depth++;
        else if (")]}".includes(ch)) depth--;
        if (
          depth === 0 &&
          ch === "=" &&
          p[i + 1] !== "=" &&
          p[i - 1] !== "!" &&
          p[i - 1] !== "=" &&
          p[i - 1] !== "<" &&
          p[i - 1] !== ">"
        ) {
          return i;
        }
      }
      return -1;
    })();

    let namePart = p;
    if (eqIdx !== -1) {
      hasDefault = true;
      namePart = p.slice(0, eqIdx).trim();
    }

    if (namePart.startsWith("{") || namePart.startsWith("[")) {
      const name = isRest ? `rest${idx}` : "options";
      params.push({
        name: sanitizeIdentifier(name, "arg"),
        optional: hasDefault,
        rest: isRest,
        type: "any",
      });
      return;
    }

    let cleanName = namePart;
    const colonIdx = namePart.indexOf(":");
    if (colonIdx !== -1) {
      cleanName = namePart.slice(0, colonIdx).trim();
    }

    cleanName = sanitizeIdentifier(cleanName || `arg${idx}`, "arg");

    params.push({
      name: cleanName,
      optional: hasDefault,
      rest: isRest,
      type: isRest ? "any[]" : "any",
    });
  });

  let seenOptional = false;
  for (const p of params) {
    if (p.rest) continue;
    if (p.optional) seenOptional = true;
    else if (seenOptional) p.optional = true;
  }

  return params;
}

export function paramsToSignature(params, returnType = "any") {
  const parts = params.map((p) => {
    if (p.rest) return `...${p.name}: ${p.type}`;
    return `${p.name}${p.optional ? "?" : ""}: ${p.type}`;
  });
  return `(${parts.join(", ")}) => ${returnType}`;
}

export function detectFunctionExpr(src) {
  const s = src.trim();

  let asyncPrefix = false;
  let rest = s;
  if (rest.startsWith("async")) {
    const after = rest.slice(5);
    if (after.length === 0 || /^\s/.test(after) || after.startsWith("(")) {
      asyncPrefix = true;
      rest = rest.slice(5).trim();
    }
  }

  if (rest.startsWith("(")) {
    const closeIdx = findMatching(rest, 0);
    if (closeIdx !== -1) {
      const afterParen = rest.slice(closeIdx + 1).trim();
      if (afterParen.startsWith("=>")) {
        const paramStr = rest.slice(1, closeIdx);
        const body = afterParen.slice(2).trim();
        return {
          isFunction: true,
          isAsync: asyncPrefix,
          params: parseParamList(paramStr),
          body,
        };
      }
    }
  }

  const singleParamMatch = rest.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s*=>/);
  if (singleParamMatch) {
    const body = rest.slice(singleParamMatch[0].length).trim();
    return {
      isFunction: true,
      isAsync: asyncPrefix,
      params: parseParamList(singleParamMatch[1]),
      body,
    };
  }

  if (/^function\b/.test(rest)) {
    const parenIdx = rest.indexOf("(");
    if (parenIdx !== -1) {
      const closeIdx = findMatching(rest, parenIdx);
      if (closeIdx !== -1) {
        const paramStr = rest.slice(parenIdx + 1, closeIdx);
        return {
          isFunction: true,
          isAsync: asyncPrefix,
          params: parseParamList(paramStr),
          body: rest.slice(closeIdx + 1).trim(),
        };
      }
    }
  }

  return { isFunction: false };
}

export function bodyReturnsPromise(body, isAsync) {
  if (isAsync) return true;
  if (/\bawait\b/.test(body)) return true;
  return false;
}

export function parseObjectLiteral(objSrc) {
  const inner = objSrc.trim();
  if (!inner.startsWith("{") || !inner.endsWith("}")) return [];
  const body = inner.slice(1, -1);
  const entries = splitTopLevel(body, [","]);
  const props = [];

  for (const entry of entries) {
    const e = entry.trim();
    if (!e) continue;

    let isAsync = false;
    let rest = e;
    if (rest.startsWith("async ")) {
      isAsync = true;
      rest = rest.slice(6).trim();
    }

    let isGetter = false;
    if (rest.startsWith("get ")) {
      isGetter = true;
      rest = rest.slice(4).trim();
    }

    const nameMatch = rest.match(
      /^(\[[^\]]*\]|"[^"]*"|'[^']*'|[A-Za-z_$][A-Za-z0-9_$]*)/,
    );
    if (!nameMatch) continue;
    let rawName = nameMatch[1];
    const afterName = rest.slice(nameMatch[0].length).trim();

    let name = rawName;
    if (
      (name.startsWith('"') && name.endsWith('"')) ||
      (name.startsWith("'") && name.endsWith("'"))
    ) {
      name = name.slice(1, -1);
    }
    if (name.startsWith("[")) continue;

    if (afterName.startsWith("(")) {
      const closeIdx = findMatching(afterName, 0);
      if (closeIdx === -1) continue;
      const paramStr = afterName.slice(1, closeIdx);
      const bodyAfter = afterName.slice(closeIdx + 1).trim();
      const params = parseParamList(paramStr);
      const isPromise = bodyReturnsPromise(bodyAfter, isAsync);
      props.push({
        name,
        kind: "method",
        isAsync,
        params,
        returnsPromise: isPromise,
      });
      continue;
    }

    if (afterName.startsWith(":")) {
      const valueSrc = afterName.slice(1).trim();
      const fn = detectFunctionExpr(valueSrc);
      if (fn.isFunction) {
        const isPromise = bodyReturnsPromise(fn.body, fn.isAsync);
        props.push({
          name,
          kind: "method",
          isAsync: fn.isAsync,
          params: fn.params,
          returnsPromise: isPromise,
        });
        continue;
      }

      if (valueSrc.startsWith("{") && valueSrc.endsWith("}")) {
        props.push({
          name,
          kind: "object",
          members: parseObjectLiteral(valueSrc),
        });
        continue;
      }

      let valueType = "any";
      if (valueSrc === "null") valueType = "any";
      else if (valueSrc === "true" || valueSrc === "false")
        valueType = "boolean";
      else if (/^-?\d+(\.\d+)?$/.test(valueSrc)) valueType = "number";
      else if (/^(["'`]).*\1$/.test(valueSrc)) valueType = "string";

      props.push({ name, kind: "value", type: valueType, isGetter });
      continue;
    }

    props.push({ name, kind: "value", type: "any" });
  }

  return props;
}

export function findExportedConst(src, varName) {
  const re = new RegExp(`export\\s+const\\s+${varName}\\s*=\\s*`);
  const match = src.match(re);
  if (!match) return null;
  const startIdx = match.index + match[0].length;
  const rest = src.slice(startIdx).trim();
  if (!rest.startsWith("{")) return null;
  const absoluteStart = src.indexOf("{", startIdx);
  const closeIdx = findMatching(src, absoluteStart);
  if (closeIdx === -1) return null;
  return src.slice(absoluteStart, closeIdx + 1);
}

export function findGlobalAssignments(src) {
  const cleaned = stripComments(src);
  const results = [];
  const re = /global\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*/g;
  let match;
  while ((match = re.exec(cleaned))) {
    const name = match[1];
    const exprStart = match.index + match[0].length;
    const end = findStatementEnd(cleaned, exprStart);
    const exprSrc = cleaned.slice(exprStart, end).trim();
    results.push({ name, exprSrc });
  }
  return results;
}

function findStatementEnd(src, startIdx) {
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  let i = startIdx;

  for (; i < src.length; i++) {
    const ch = src[i];

    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (inTemplate) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "`") inTemplate = false;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      continue;
    }

    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) {
      if (depth === 0) return i;
      depth--;
    }

    if (depth === 0 && ch === ";") return i;
    if (depth === 0 && ch === "\n") {
      const lookAheadTrim = src.slice(startIdx, i).trim();
      if (lookAheadTrim.length === 0) continue;

      const nextNonSpace = src.slice(i).match(/^\s*(\S)/);
      if (nextNonSpace) {
        const ch2 = nextNonSpace[1];
        if (".?:&|+=)]}".includes(ch2) || ch2 === ",") continue;
      }
      return i;
    }
  }
  return i;
}

export function detectFlexProperty(exprSrc) {
  const s = exprSrc.trim();
  const match = s.match(/^flex\.([A-Za-z_$][A-Za-z0-9_$]*)/);
  if (!match) return null;
  return match[1];
}
