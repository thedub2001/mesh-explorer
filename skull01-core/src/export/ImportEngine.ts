import { MemoryGraph } from "../memory/MemoryGraph";
import type { ExportBundle } from "./ExportEngine";

export class ImportEngine {
  constructor(private readonly memory: MemoryGraph) {}

  importSnapshot(bundle: ExportBundle): void {
    if (bundle.version !== "1.0") {
      throw new Error(`Unsupported export version ${bundle.version}`);
    }
    this.memory.applySnapshot(bundle.snapshot);
  }
}
