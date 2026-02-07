import type { StorageAdapter, StorageTransaction } from "./StorageEngine";
import type { TableName } from "./models";

const DEFAULT_DB_NAME = "mesh-explorer";
const DEFAULT_VERSION = 1;

export interface IndexedDBAdapterOptions {
  dbName?: string;
  version?: number;
}

export class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly version: number;

  constructor(options: IndexedDBAdapterOptions = {}) {
    this.dbName = options.dbName ?? DEFAULT_DB_NAME;
    this.version = options.version ?? DEFAULT_VERSION;
  }

  async open(): Promise<void> {
    if (typeof indexedDB === "undefined") {
      throw new Error("IndexedDB is not available in this environment.");
    }
    if (this.db) {
      return;
    }

    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        const stores: TableName[] = [
          "graph",
          "nodes",
          "relations",
          "files",
          "types",
          "projections",
        ];
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: "id" });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed."));
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async runTransaction<T>(
    tables: TableName[],
    fn: (tx: StorageTransaction) => Promise<T>,
  ): Promise<T> {
    if (!this.db) {
      throw new Error("IndexedDB adapter not opened.");
    }

    const transaction = this.db.transaction(tables, "readwrite");
    const tx: StorageTransaction = {
      get: (table, id) => this.request(transaction.objectStore(table).get(id)),
      put: (table, record) => this.request(transaction.objectStore(table).put(record)),
      delete: (table, id) => this.request(transaction.objectStore(table).delete(id)),
      list: (table) => this.request(transaction.objectStore(table).getAll()),
    };

    const result = await fn(tx);
    await this.completeTransaction(transaction);
    return result;
  }

  private request<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
    });
  }

  private completeTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB aborted."));
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB error."));
    });
  }
}
