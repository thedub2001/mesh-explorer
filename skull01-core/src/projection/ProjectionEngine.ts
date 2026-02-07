import type { NodeRecord, RelationRecord } from "../storage/models";
import { MemoryGraph } from "../memory/MemoryGraph";

export interface ProjectionFilter {
  node?: (node: NodeRecord) => boolean;
  relation?: (relation: RelationRecord) => boolean;
}

export interface ProjectionResult {
  nodes: NodeRecord[];
  relations: RelationRecord[];
}

export class ProjectionEngine {
  constructor(private readonly memory: MemoryGraph) {}

  project(filter: ProjectionFilter = {}): ProjectionResult {
    const nodes = filter.node
      ? this.memory.listNodes().filter(filter.node)
      : this.memory.listNodes();
    const relations = filter.relation
      ? this.memory.listRelations().filter(filter.relation)
      : this.memory.listRelations();
    return { nodes, relations };
  }
}
