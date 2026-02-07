export function assertNonEmpty(value: string, message: string): void {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}
