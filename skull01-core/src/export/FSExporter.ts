import type { ExportBundle } from "./ExportEngine";

export class FSExporter {
  toJson(bundle: ExportBundle): string {
    return JSON.stringify(bundle, null, 2);
  }
}
