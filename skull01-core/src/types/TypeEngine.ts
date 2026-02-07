import type { NodeRecord, TypeRecord } from "../storage/models";
import { ConstraintEngine, ConstraintResult } from "./ConstraintEngine";

export class TypeEngine {
  private readonly types = new Map<string, TypeRecord>();
  private readonly constraintEngine: ConstraintEngine;

  constructor(constraintEngine: ConstraintEngine = new ConstraintEngine()) {
    this.constraintEngine = constraintEngine;
  }

  registerType(record: TypeRecord): void {
    this.types.set(record.id, record);
  }

  updateType(record: TypeRecord): void {
    this.types.set(record.id, record);
  }

  getType(id: string): TypeRecord | undefined {
    return this.types.get(id);
  }

  listTypes(): TypeRecord[] {
    return Array.from(this.types.values());
  }

  validateNode(node: NodeRecord): ConstraintResult {
    const type = this.types.get(node.typeId);
    if (!type) {
      return { valid: false, errors: [`Unknown type ${node.typeId}`] };
    }
    return this.constraintEngine.validate(type.schema, node.data);
  }
}
