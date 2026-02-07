import type {
  FileRecord,
  GraphRecord,
  NodeRecord,
  ProjectionRecord,
  RelationRecord,
  TypeRecord,
} from "../storage/models";
import { GraphIndex } from "./GraphIndex";

export interface MemoryGraphSnapshot {
  graph: GraphRecord | null;
  nodes: NodeRecord[];
  relations: RelationRecord[];
  files: FileRecord[];
  types: TypeRecord[];
  projections: ProjectionRecord[];
}

export class MemoryGraph {
  private graph: GraphRecord | null = null;
  private readonly index = new GraphIndex();

  getGraph(): GraphRecord | null {
    return this.graph;
  }

  getNode(id: string): NodeRecord | undefined {
    return this.index.nodes.get(id);
  }

  getRelation(id: string): RelationRecord | undefined {
    return this.index.relations.get(id);
  }

  getFile(id: string): FileRecord | undefined {
    return this.index.files.get(id);
  }

  getType(id: string): TypeRecord | undefined {
    return this.index.types.get(id);
  }

  getProjection(id: string): ProjectionRecord | undefined {
    return this.index.projections.get(id);
  }

  listNodes(): NodeRecord[] {
    return Array.from(this.index.nodes.values());
  }

  listRelations(): RelationRecord[] {
    return Array.from(this.index.relations.values());
  }

  listFiles(): FileRecord[] {
    return Array.from(this.index.files.values());
  }

  listTypes(): TypeRecord[] {
    return Array.from(this.index.types.values());
  }

  listProjections(): ProjectionRecord[] {
    return Array.from(this.index.projections.values());
  }

  snapshot(): MemoryGraphSnapshot {
    return {
      graph: this.graph,
      nodes: this.listNodes(),
      relations: this.listRelations(),
      files: this.listFiles(),
      types: this.listTypes(),
      projections: this.listProjections(),
    };
  }

  applySnapshot(snapshot: MemoryGraphSnapshot): void {
    this.graph = snapshot.graph;
    this.index.reset();
    for (const node of snapshot.nodes) {
      this.index.nodes.set(node.id, node);
    }
    for (const relation of snapshot.relations) {
      this.index.relations.set(relation.id, relation);
    }
    for (const file of snapshot.files) {
      this.index.files.set(file.id, file);
    }
    for (const type of snapshot.types) {
      this.index.types.set(type.id, type);
    }
    for (const projection of snapshot.projections) {
      this.index.projections.set(projection.id, projection);
    }
  }

  setGraph(record: GraphRecord): void {
    this.graph = record;
  }

  upsertNode(record: NodeRecord): void {
    this.index.nodes.set(record.id, record);
  }

  removeNode(id: string): void {
    this.index.nodes.delete(id);
  }

  upsertRelation(record: RelationRecord): void {
    this.index.relations.set(record.id, record);
  }

  removeRelation(id: string): void {
    this.index.relations.delete(id);
  }

  upsertFile(record: FileRecord): void {
    this.index.files.set(record.id, record);
  }

  removeFile(id: string): void {
    this.index.files.delete(id);
  }

  upsertType(record: TypeRecord): void {
    this.index.types.set(record.id, record);
  }

  removeType(id: string): void {
    this.index.types.delete(id);
  }

  upsertProjection(record: ProjectionRecord): void {
    this.index.projections.set(record.id, record);
  }

  removeProjection(id: string): void {
    this.index.projections.delete(id);
  }
}
