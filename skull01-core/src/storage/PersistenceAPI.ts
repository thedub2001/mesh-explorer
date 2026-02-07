import type { MemoryGraphSnapshot } from "../memory/MemoryGraph";
import { StorageEngine } from "./StorageEngine";

export class PersistenceAPI {
  constructor(private readonly storage: StorageEngine) {}

  async saveSnapshot(snapshot: MemoryGraphSnapshot): Promise<void> {
    await this.storage.runTransaction(
      ["graph", "nodes", "relations", "files", "types", "projections"],
      async (tx) => {
        if (snapshot.graph) {
          await tx.put("graph", snapshot.graph);
        }
        await this.replaceTable(tx, "nodes", snapshot.nodes);
        await this.replaceTable(tx, "relations", snapshot.relations);
        await this.replaceTable(tx, "files", snapshot.files);
        await this.replaceTable(tx, "types", snapshot.types);
        await this.replaceTable(tx, "projections", snapshot.projections);
      },
    );
  }

  async loadSnapshot(): Promise<MemoryGraphSnapshot> {
    return this.storage.runTransaction(
      ["graph", "nodes", "relations", "files", "types", "projections"],
      async (tx) => ({
        graph: await tx.get("graph", "graph"),
        nodes: await tx.list("nodes"),
        relations: await tx.list("relations"),
        files: await tx.list("files"),
        types: await tx.list("types"),
        projections: await tx.list("projections"),
      }),
    );
  }

  private async replaceTable<T>(
    tx: {
      list: (table: string) => Promise<Array<T & { id: string }>>;
      delete: (table: string, id: string) => Promise<void>;
      put: (table: string, record: T & { id: string }) => Promise<void>;
    },
    table: string,
    records: Array<T & { id: string }>,
  ): Promise<void> {
    const existing = await tx.list(table);
    await Promise.all(existing.map((record) => tx.delete(table, record.id)));
    await Promise.all(records.map((record) => tx.put(table, record)));
  }
}
