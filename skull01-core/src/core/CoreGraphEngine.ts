import type {
  FileRecord,
  NodeRecord,
  RelationRecord,
} from "../storage/models";
import { StorageEngine } from "../storage/StorageEngine";
import { MemoryGraph } from "../memory/MemoryGraph";
import { ActionLog, ActionDirection } from "./ActionLog";
import type { IdGenerator } from "../utils/ids";

export interface CreateNodeInput {
  typeId: string;
  label: string;
  data?: Record<string, unknown>;
}

export interface UpdateNodeInput {
  label?: string;
  data?: Record<string, unknown>;
  typeId?: string;
}

export interface CreateRelationInput {
  typeId: string;
  fromNodeId: string;
  toNodeId: string;
  data?: Record<string, unknown>;
}

type ActionPayloads =
  | { type: "node.create"; record: NodeRecord }
  | { type: "node.update"; before: NodeRecord; after: NodeRecord }
  | { type: "node.delete"; record: NodeRecord }
  | { type: "relation.create"; record: RelationRecord }
  | { type: "relation.delete"; record: RelationRecord }
  | { type: "file.attach"; nodeId: string; fileId: string }
  | { type: "file.detach"; nodeId: string; fileId: string };

export class CoreGraphEngine {
  constructor(
    private readonly storage: StorageEngine,
    private readonly memory: MemoryGraph,
    private readonly actionLog: ActionLog,
    private readonly idGenerator: IdGenerator,
  ) {
    this.registerActionHandlers();
  }

  async loadFromStorage(): Promise<void> {
    const [graph, nodes, relations, files, types, projections] = await Promise.all([
      this.storage.getGraph(),
      this.storage.listNodes(),
      this.storage.listRelations(),
      this.storage.listFiles(),
      this.storage.listTypes(),
      this.storage.listProjections(),
    ]);
    this.memory.applySnapshot({
      graph,
      nodes,
      relations,
      files,
      types,
      projections,
    });
  }

  async createNode(input: CreateNodeInput): Promise<NodeRecord> {
    const now = new Date().toISOString();
    const record: NodeRecord = {
      id: this.idGenerator.next("node"),
      typeId: input.typeId,
      label: input.label,
      data: input.data ?? {},
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.putNode(record);
    this.memory.upsertNode(record);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "node.create",
      payload: { type: "node.create", record },
      timestamp: Date.now(),
    });
    return record;
  }

  async updateNode(id: string, input: UpdateNodeInput): Promise<NodeRecord> {
    const existing = this.memory.getNode(id);
    if (!existing) {
      throw new Error(`Node ${id} not found.`);
    }
    const updated: NodeRecord = {
      ...existing,
      label: input.label ?? existing.label,
      data: input.data ?? existing.data,
      typeId: input.typeId ?? existing.typeId,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.putNode(updated);
    this.memory.upsertNode(updated);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "node.update",
      payload: { type: "node.update", before: existing, after: updated },
      timestamp: Date.now(),
    });
    return updated;
  }

  async deleteNode(id: string): Promise<void> {
    const existing = this.memory.getNode(id);
    if (!existing) {
      return;
    }
    await this.storage.deleteNode(id);
    this.memory.removeNode(id);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "node.delete",
      payload: { type: "node.delete", record: existing },
      timestamp: Date.now(),
    });
  }

  async createRelation(input: CreateRelationInput): Promise<RelationRecord> {
    const now = new Date().toISOString();
    const record: RelationRecord = {
      id: this.idGenerator.next("relation"),
      typeId: input.typeId,
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      data: input.data ?? {},
      createdAt: now,
    };
    await this.storage.putRelation(record);
    this.memory.upsertRelation(record);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "relation.create",
      payload: { type: "relation.create", record },
      timestamp: Date.now(),
    });
    return record;
  }

  async deleteRelation(id: string): Promise<void> {
    const existing = this.memory.getRelation(id);
    if (!existing) {
      return;
    }
    await this.storage.deleteRelation(id);
    this.memory.removeRelation(id);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "relation.delete",
      payload: { type: "relation.delete", record: existing },
      timestamp: Date.now(),
    });
  }

  async attachFile(nodeId: string, file: FileRecord): Promise<void> {
    await this.applyAttachFile(nodeId, file);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "file.attach",
      payload: { type: "file.attach", nodeId, fileId: file.id },
      timestamp: Date.now(),
    });
  }

  async detachFile(nodeId: string, fileId: string): Promise<void> {
    await this.applyDetachFile(nodeId, fileId);
    this.actionLog.record({
      id: this.idGenerator.next("action"),
      type: "file.detach",
      payload: { type: "file.detach", nodeId, fileId },
      timestamp: Date.now(),
    });
  }

  private registerActionHandlers(): void {
    const applyNode = async (record: NodeRecord, direction: ActionDirection) => {
      if (direction === "forward") {
        await this.storage.putNode(record);
        this.memory.upsertNode(record);
        return;
      }
      await this.storage.deleteNode(record.id);
      this.memory.removeNode(record.id);
    };

    const applyRelation = async (record: RelationRecord, direction: ActionDirection) => {
      if (direction === "forward") {
        await this.storage.putRelation(record);
        this.memory.upsertRelation(record);
        return;
      }
      await this.storage.deleteRelation(record.id);
      this.memory.removeRelation(record.id);
    };

    this.actionLog.registerHandler({
      type: "node.create",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "node.create" }>;
        await applyNode(data.record, direction);
      },
    });

    this.actionLog.registerHandler({
      type: "node.update",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "node.update" }>;
        const record = direction === "forward" ? data.after : data.before;
        await this.storage.putNode(record);
        this.memory.upsertNode(record);
      },
    });

    this.actionLog.registerHandler({
      type: "node.delete",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "node.delete" }>;
        await applyNode(data.record, direction === "forward" ? "backward" : "forward");
      },
    });

    this.actionLog.registerHandler({
      type: "relation.create",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "relation.create" }>;
        await applyRelation(data.record, direction);
      },
    });

    this.actionLog.registerHandler({
      type: "relation.delete",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "relation.delete" }>;
        await applyRelation(data.record, direction === "forward" ? "backward" : "forward");
      },
    });

    this.actionLog.registerHandler({
      type: "file.attach",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "file.attach" }>;
        const file = this.memory.getFile(data.fileId);
        if (!file) {
          throw new Error(`File ${data.fileId} not found for attachment.`);
        }
        if (direction === "forward") {
          await this.applyAttachFile(data.nodeId, file);
          return;
        }
        await this.applyDetachFile(data.nodeId, data.fileId);
      },
    });

    this.actionLog.registerHandler({
      type: "file.detach",
      apply: async (payload: ActionPayloads, direction) => {
        const data = payload as Extract<ActionPayloads, { type: "file.detach" }>;
        const file = this.memory.getFile(data.fileId);
        if (!file) {
          throw new Error(`File ${data.fileId} not found for detachment.`);
        }
        if (direction === "forward") {
          await this.applyDetachFile(data.nodeId, data.fileId);
          return;
        }
        await this.applyAttachFile(data.nodeId, file);
      },
    });
  }

  private async applyAttachFile(nodeId: string, file: FileRecord): Promise<void> {
    const node = this.memory.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found.`);
    }
    const attachments = new Set<string>((node.data.files as string[] | undefined) ?? []);
    attachments.add(file.id);
    await this.storage.putFile(file);
    const updated = {
      ...node,
      data: { ...node.data, files: Array.from(attachments) },
      updatedAt: new Date().toISOString(),
    };
    await this.storage.putNode(updated);
    this.memory.upsertFile(file);
    this.memory.upsertNode(updated);
  }

  private async applyDetachFile(nodeId: string, fileId: string): Promise<void> {
    const node = this.memory.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found.`);
    }
    const attachments = new Set<string>((node.data.files as string[] | undefined) ?? []);
    if (!attachments.has(fileId)) {
      return;
    }
    attachments.delete(fileId);
    const updated = {
      ...node,
      data: { ...node.data, files: Array.from(attachments) },
      updatedAt: new Date().toISOString(),
    };
    await this.storage.putNode(updated);
    this.memory.upsertNode(updated);
  }
}
