import type {
  FileRecord,
  GraphRecord,
  NodeRecord,
  ProjectionRecord,
  RelationRecord,
  StorageTables,
  TableName,
  TypeRecord,
} from "./models";

export type RecordForTable<T extends TableName> = StorageTables[T];

export interface StorageTransaction {
  get<T extends TableName>(table: T, id: string): Promise<RecordForTable<T> | null>;
  put<T extends TableName>(table: T, record: RecordForTable<T>): Promise<void>;
  delete<T extends TableName>(table: T, id: string): Promise<void>;
  list<T extends TableName>(table: T): Promise<Array<RecordForTable<T>>>;
}

export interface StorageAdapter {
  open(): Promise<void>;
  close(): Promise<void>;
  runTransaction<T>(
    tables: TableName[],
    fn: (tx: StorageTransaction) => Promise<T>,
  ): Promise<T>;
}

export class StorageEngine {
  constructor(private readonly adapter: StorageAdapter) {}

  async open(): Promise<void> {
    await this.adapter.open();
  }

  async close(): Promise<void> {
    await this.adapter.close();
  }

  async runTransaction<T>(
    tables: TableName[],
    fn: (tx: StorageTransaction) => Promise<T>,
  ): Promise<T> {
    return this.adapter.runTransaction(tables, fn);
  }

  async getGraph(): Promise<GraphRecord | null> {
    return this.adapter.runTransaction(["graph"], (tx) => tx.get("graph", "graph"));
  }

  async putGraph(record: GraphRecord): Promise<void> {
    await this.adapter.runTransaction(["graph"], (tx) => tx.put("graph", record));
  }

  async listNodes(): Promise<NodeRecord[]> {
    return this.adapter.runTransaction(["nodes"], (tx) => tx.list("nodes"));
  }

  async getNode(id: string): Promise<NodeRecord | null> {
    return this.adapter.runTransaction(["nodes"], (tx) => tx.get("nodes", id));
  }

  async putNode(record: NodeRecord): Promise<void> {
    await this.adapter.runTransaction(["nodes"], (tx) => tx.put("nodes", record));
  }

  async deleteNode(id: string): Promise<void> {
    await this.adapter.runTransaction(["nodes"], (tx) => tx.delete("nodes", id));
  }

  async listRelations(): Promise<RelationRecord[]> {
    return this.adapter.runTransaction(["relations"], (tx) => tx.list("relations"));
  }

  async getRelation(id: string): Promise<RelationRecord | null> {
    return this.adapter.runTransaction(["relations"], (tx) => tx.get("relations", id));
  }

  async putRelation(record: RelationRecord): Promise<void> {
    await this.adapter.runTransaction(["relations"], (tx) => tx.put("relations", record));
  }

  async deleteRelation(id: string): Promise<void> {
    await this.adapter.runTransaction(["relations"], (tx) => tx.delete("relations", id));
  }

  async listFiles(): Promise<FileRecord[]> {
    return this.adapter.runTransaction(["files"], (tx) => tx.list("files"));
  }

  async getFile(id: string): Promise<FileRecord | null> {
    return this.adapter.runTransaction(["files"], (tx) => tx.get("files", id));
  }

  async putFile(record: FileRecord): Promise<void> {
    await this.adapter.runTransaction(["files"], (tx) => tx.put("files", record));
  }

  async deleteFile(id: string): Promise<void> {
    await this.adapter.runTransaction(["files"], (tx) => tx.delete("files", id));
  }

  async listTypes(): Promise<TypeRecord[]> {
    return this.adapter.runTransaction(["types"], (tx) => tx.list("types"));
  }

  async getType(id: string): Promise<TypeRecord | null> {
    return this.adapter.runTransaction(["types"], (tx) => tx.get("types", id));
  }

  async putType(record: TypeRecord): Promise<void> {
    await this.adapter.runTransaction(["types"], (tx) => tx.put("types", record));
  }

  async deleteType(id: string): Promise<void> {
    await this.adapter.runTransaction(["types"], (tx) => tx.delete("types", id));
  }

  async listProjections(): Promise<ProjectionRecord[]> {
    return this.adapter.runTransaction(["projections"], (tx) => tx.list("projections"));
  }

  async getProjection(id: string): Promise<ProjectionRecord | null> {
    return this.adapter.runTransaction(["projections"], (tx) => tx.get("projections", id));
  }

  async putProjection(record: ProjectionRecord): Promise<void> {
    await this.adapter.runTransaction(["projections"], (tx) => tx.put("projections", record));
  }

  async deleteProjection(id: string): Promise<void> {
    await this.adapter.runTransaction(["projections"], (tx) => tx.delete("projections", id));
  }
}
