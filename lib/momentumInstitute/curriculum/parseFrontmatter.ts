/**
 * Lightweight YAML frontmatter parser — no external dependency.
 * Supports flat keys, quoted strings, and simple arrays.
 */

export function parseFrontmatter(raw: string): {
  metadata: Record<string, unknown>;
  body: string;
} {
  const trimmed = raw.replace(/^\uFEFF/, "");
  if (!trimmed.startsWith("---")) {
    return { metadata: {}, body: trimmed };
  }

  const end = trimmed.indexOf("---", 3);
  if (end < 0) {
    return { metadata: {}, body: trimmed };
  }

  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 3).trim();
  return { metadata: parseSimpleYaml(yamlBlock), body };
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  const flushArray = () => {
    if (currentKey && currentArray) {
      result[currentKey] = currentArray;
    }
    currentKey = null;
    currentArray = null;
  };

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const arrayItem = trimmed.match(/^- (.+)$/);
    if (arrayItem && currentKey) {
      currentArray = currentArray ?? [];
      currentArray.push(unquote(arrayItem[1]!.trim()));
      continue;
    }

    flushArray();

    const pair = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    const key = pair[1]!;
    const value = pair[2]!.trim();
    if (!value) {
      currentKey = key;
      currentArray = [];
      continue;
    }

    result[key] = coerceScalar(unquote(value));
  }

  flushArray();
  return result;
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function coerceScalar(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d+\.\d+$/.test(value)) return Number(value);
  return value;
}
