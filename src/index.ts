export function shellExpand(
  str: string,
  variables:
    | Partial<Record<string, string>>
    | ((key: string) => string | undefined)
): string {
  const get = (key: string): string | undefined =>
    typeof variables === "function" ? variables(key) : variables[key];

  const tokens: string[] = [];
  let lastIndex = 0;

  const varPattern = /\$\{[^}]*\}|\$[A-Za-z_][A-Za-z0-9_]*/g;
  let match: RegExpExecArray | null;

  while ((match = varPattern.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(str.slice(lastIndex, match.index)); // literal
    }
    tokens.push(match[0]); // needs expansion
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < str.length) {
    tokens.push(str.slice(lastIndex)); // trailing literal
  }

  return tokens
    .map((part) => {
      // Expandable token
      if (part.startsWith("${") && part.endsWith("}")) {
        const expr = part.slice(2, -1);

        if (expr.startsWith("#")) {
          const name = expr.slice(1);
          const val = get(name) ?? "";
          return String(val.length);
        }

        const sub = expr.match(
          /^([A-Za-z_][A-Za-z0-9_]*):(-?\d+)(?::(-?\d+))?$/
        );
        if (sub) {
          const [, name, offStr, lenStr] = sub;
          const val = get(name) ?? "";
          const off = Number(offStr);
          const len = lenStr === undefined ? undefined : Number(lenStr);
          const start = off < 0 ? val.length + off : off;
          return len === undefined
            ? val.slice(start)
            : val.slice(start, start + len);
        }

        const rem = expr.match(
          /^([A-Za-z_][A-Za-z0-9_]*)([#%]{1,2})([\s\S]+)$/
        );
        if (rem) {
          const [, name, op, pat] = rem;
          const val = get(name) ?? "";
          const regexStr = pat
            .replace(/([.+^$(){}|[\]\\])/g, "\\$1")
            .replace(/\*/g, ".*");
          if (op === "#") return val.replace(new RegExp("^" + regexStr), "");
          if (op === "##")
            return val.replace(new RegExp("^(" + regexStr + ")"), "");
          if (op === "%") return val.replace(new RegExp(regexStr + "$"), "");
          if (op === "%%")
            return val.replace(new RegExp("(" + regexStr + ")$"), "");
        }

        const m = expr.match(/^([A-Za-z_][A-Za-z0-9_]*)(:?[-+?]?)([\s\S]*)$/);
        if (!m) return "";
        const [, name, op, word] = m;
        const val = get(name);
        const isSet = val !== undefined;
        const isNonEmpty = isSet && val !== "";

        switch (op) {
          case "":
            return val ?? "";
          case "-":
            return isSet ? val! : word;
          case ":-":
            return isNonEmpty ? val! : word;
          case "+":
            return isSet ? word : "";
          case ":+":
            return isNonEmpty ? word : "";
          case "?":
            if (!isSet) throw new Error(word || `Variable ${name} required`);
            return val!;
          case ":?":
            if (!isNonEmpty)
              throw new Error(word || `Variable ${name} required`);
            return val!;
          default:
            return "";
        }
      }

      // $VAR simple expansion
      if (part.startsWith("$")) {
        const name = part.slice(1);
        return get(name) ?? "";
      }

      return part; // fallback
    })
    .join("");
}
