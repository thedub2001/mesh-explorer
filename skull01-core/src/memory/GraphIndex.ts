import type { FileRecord, NodeRecord, ProjectionRecord, RelationRecord, TypeRecord } from "../storage/models";

export class GraphIndex {
  readonly nodes = new Map<string, NodeRecord>();
  readonly relations = new Map<string, RelationRecord>();
  readonly files = new Map<string, FileRecord>();
  readonly types = new Map<string, TypeRecord>();
  readonly projections = new Map<string, ProjectionRecord>();

  reset(): void {
    this.nodes.clear();
    this.relations.clear();
    this.files.clear();
    this.types.clear();
    this.projections.clear();
  }
}
