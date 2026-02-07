export interface BlobDescriptor {
  id: string;
  sizeBytes: number;
  checksum: string;
}

export interface BlobStoreAdapter {
  put(id: string, data: Blob): Promise<BlobDescriptor>;
  get(id: string): Promise<Blob | null>;
  delete(id: string): Promise<void>;
}

export class BlobStore {
  constructor(private readonly adapter: BlobStoreAdapter) {}

  async put(id: string, data: Blob): Promise<BlobDescriptor> {
    return this.adapter.put(id, data);
  }

  async get(id: string): Promise<Blob | null> {
    return this.adapter.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(id);
  }
}
