import type { JsonObject } from "../storage/models";

export interface ConstraintResult {
  valid: boolean;
  errors: string[];
}

export class ConstraintEngine {
  validate(schema: JsonObject, data: JsonObject): ConstraintResult {
    const errors: string[] = [];
    const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];
    for (const key of required) {
      if (!(key in data)) {
        errors.push(`Missing required field: ${key}`);
      }
    }

    const properties = schema.properties as Record<string, JsonObject> | undefined;
    if (properties) {
      for (const [key, definition] of Object.entries(properties)) {
        if (!(key in data)) {
          continue;
        }
        const expectedType = definition.type as string | undefined;
        if (!expectedType) {
          continue;
        }
        const value = data[key];
        if (!this.matchesType(expectedType, value)) {
          errors.push(`Field ${key} should be of type ${expectedType}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private matchesType(expected: string, value: unknown): boolean {
    if (expected === "array") {
      return Array.isArray(value);
    }
    if (expected === "null") {
      return value === null;
    }
    return typeof value === expected;
  }
}
