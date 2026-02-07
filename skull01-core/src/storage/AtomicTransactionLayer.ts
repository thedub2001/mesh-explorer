import type { StorageEngine, StorageTransaction } from "./StorageEngine";
import type { TableName } from "./models";

export class AtomicTransactionLayer {
  constructor(private readonly storage: StorageEngine) {}

  async run<T>(tables: TableName[], fn: (tx: StorageTransaction) => Promise<T>): Promise<T> {
    return this.storage.runTransaction(tables, fn);
  }
}
