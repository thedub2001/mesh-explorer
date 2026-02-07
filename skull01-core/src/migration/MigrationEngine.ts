export interface Migration {
  from: string;
  to: string;
  apply: (payload: unknown) => unknown;
}

export interface MigrationHook {
  onStart?: (from: string, to: string) => void;
  onComplete?: (from: string, to: string) => void;
}

export class MigrationEngine {
  private readonly migrations: Migration[] = [];

  register(migration: Migration): void {
    this.migrations.push(migration);
  }

  migrate(payload: unknown, from: string, to: string, hook: MigrationHook = {}): unknown {
    const migration = this.migrations.find((entry) => entry.from === from && entry.to === to);
    if (!migration) {
      throw new Error(`No migration registered from ${from} to ${to}`);
    }
    hook.onStart?.(from, to);
    const result = migration.apply(payload);
    hook.onComplete?.(from, to);
    return result;
  }
}
