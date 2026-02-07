import type { NodeRecord, RelationRecord } from "../storage/models";
import { MemoryGraph } from "../memory/MemoryGraph";

export type RelationDirection = "out" | "in" | "both";

export class QueryEngine {
  constructor(private readonly memory: MemoryGraph) {}

  findNodeById(id: string): NodeRecord | undefined {
    return this.memory.getNode(id);
  }

  findNodesByType(typeId: string): NodeRecord[] {
    return this.memory.listNodes().filter((node) => node.typeId === typeId);
  }

  findNodesByLabel(label: string): NodeRecord[] {
    return this.memory.listNodes().filter((node) => node.label === label);
  }

  traverseRelations(nodeId: string, direction: RelationDirection = "both"): RelationRecord[] {
    return this.memory
      .listRelations()
      .filter((relation) => this.matchesDirection(relation, nodeId, direction));
  }

  private matchesDirection(
    relation: RelationRecord,
    nodeId: string,
    direction: RelationDirection,
  ): boolean {
    if (direction === "both") {
      return relation.fromNodeId === nodeId || relation.toNodeId === nodeId;
    }
    if (direction === "out") {
      return relation.fromNodeId === nodeId;
    }
    return relation.toNodeId === nodeId;
  }
}
