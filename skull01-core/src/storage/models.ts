export type JsonObject = Record<string, unknown>;

export interface GraphRecord {
  id: string;
  name: string;
  description?: string;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
}

export interface NodeRecord {
  id: string;
  typeId: string;
  label: string;
  data: JsonObject;
  createdAt: string;
  updatedAt: string;
}

export interface RelationRecord {
  id: string;
  typeId: string;
  fromNodeId: string;
  toNodeId: string;
  data: JsonObject;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  blobId: string;
  metadata: JsonObject;
  createdAt: string;
}

export interface TypeRecord {
  id: string;
  name: string;
  schema: JsonObject;
  behavior: JsonObject;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectionRecord {
  id: string;
  name: string;
  definition: JsonObject;
  createdAt: string;
  updatedAt: string;
}

export type TableName =
  | "graph"
  | "nodes"
  | "relations"
  | "files"
  | "types"
  | "projections";

export interface StorageTables {
  graph: GraphRecord;
  nodes: NodeRecord;
  relations: RelationRecord;
  files: FileRecord;
  types: TypeRecord;
  projections: ProjectionRecord;
}
