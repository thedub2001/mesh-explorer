import { MemoryGraph } from "../memory/MemoryGraph";
import type { MemoryGraphSnapshot } from "../memory/MemoryGraph";

export interface ExportBundle {
  version: string;
  snapshot: MemoryGraphSnapshot;
  exportedAt: string;
}

export class ExportEngine {
  constructor(private readonly memory: MemoryGraph) {}

  exportSnapshot(): ExportBundle {
    return {
      version: "1.0",
      snapshot: this.memory.snapshot(),
      exportedAt: new Date().toISOString(),
    };
  }
}
