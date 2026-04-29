export const stripUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, current]) => {
      if (current !== undefined) {
        (acc as Record<string, unknown>)[key] = stripUndefined(current);
      }
      return acc;
    }, {} as T);
  }

  return value;
};
