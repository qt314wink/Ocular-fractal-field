export function canonicalStringify(value: unknown): string {
  return serialize(value, new Set<object>(), '$');
}

function serialize(value: unknown, ancestors: Set<object>, path: string): string {
  if (value === null) {
    return 'null';
  }

  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) {
        throw new TypeError(`Non-finite number at ${path}`);
      }
      return Object.is(value, -0) ? '0' : JSON.stringify(value);
    case 'string':
      return JSON.stringify(value);
    case 'undefined':
    case 'function':
    case 'symbol':
    case 'bigint':
      throw new TypeError(`Unsupported ${typeof value} at ${path}`);
    case 'object':
      return serializeObject(value, ancestors, path);
  }

  throw new TypeError(`Unsupported value at ${path}`);
}

function serializeObject(value: object, ancestors: Set<object>, path: string): string {
  if (ancestors.has(value)) {
    throw new TypeError(`Cannot canonicalize cyclic value at ${path}`);
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const items: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!(index in value)) {
          throw new TypeError(`Unsupported sparse array entry at ${path}[${index}]`);
        }
        items.push(serialize(value[index], ancestors, `${path}[${index}]`));
      }
      return `[${items.join(',')}]`;
    }

    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`Unsupported object prototype at ${path}`);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError(`Unsupported symbol key at ${path}`);
    }

    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${serialize(record[key], ancestors, `${path}.${key}`)}`,
      );
    return `{${entries.join(',')}}`;
  } finally {
    ancestors.delete(value);
  }
}
